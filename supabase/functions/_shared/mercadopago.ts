// Cliente mínimo da API do Mercado Pago (Checkout Pro) e regras de liberação do ebook.
import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import { requireEnv } from './http.ts';

const API = 'https://api.mercadopago.com';

export const PRODUCT_ID = 'ebook-sua-empresa-no-digital';

export interface MpPayment {
  id: number;
  status: string; // approved | pending | in_process | rejected | refunded | cancelled | charged_back
  transaction_amount: number;
  currency_id: string;
  external_reference: string | null;
}

async function mp<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${requireEnv('MP_ACCESS_TOKEN')}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`Mercado Pago ${path} respondeu ${res.status}`);
  return (await res.json()) as T;
}

export function createPreference(body: unknown, idempotencyKey: string) {
  return mp<{ id: string; init_point: string }>('/checkout/preferences', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'X-Idempotency-Key': idempotencyKey },
  });
}

export function getPayment(id: string) {
  return mp<MpPayment>(`/v1/payments/${encodeURIComponent(id)}`);
}

export async function searchPaymentsByOrder(orderId: string) {
  const data = await mp<{ results: MpPayment[] }>(
    `/v1/payments/search?sort=date_created&criteria=desc&external_reference=${encodeURIComponent(orderId)}`,
  );
  return data.results ?? [];
}

// Valida o cabeçalho x-signature enviado pelo Mercado Pago.
// Manifesto oficial: "id:<data.id>;request-id:<x-request-id>;ts:<ts>;" assinado com HMAC-SHA256.
export async function verifyWebhookSignature(req: Request, dataId: string): Promise<boolean> {
  const secret = Deno.env.get('MP_WEBHOOK_SECRET');
  const header = req.headers.get('x-signature');
  const requestId = req.headers.get('x-request-id');
  if (!secret || !header || !requestId || !dataId) return false;

  const parts = Object.fromEntries(
    header.split(',').map((p) => {
      const [k, ...v] = p.trim().split('=');
      return [k, v.join('=')];
    }),
  );
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  // Rejeita notificações antigas (reenvio de requisições capturadas).
  const tsMs = ts.length > 10 ? Number(ts) : Number(ts) * 1000;
  if (!Number.isFinite(tsMs) || Math.abs(Date.now() - tsMs) > 15 * 60 * 1000) return false;

  const id = /^[a-z0-9]+$/i.test(dataId) ? dataId.toLowerCase() : dataId;
  const manifest = `id:${id};request-id:${requestId};ts:${ts};`;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(manifest)));
  const expected = Array.from(mac, (b) => b.toString(16).padStart(2, '0')).join('');
  return timingSafeEqual(expected, v1.toLowerCase());
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Aplica um pagamento consultado na API ao pedido correspondente.
// Só libera o acesso se valor, moeda e referência baterem com o pedido gravado no servidor.
export async function applyPayment(admin: SupabaseClient, payment: MpPayment): Promise<'paid' | 'refunded' | 'ignored'> {
  const orderId = payment.external_reference;
  if (!orderId || !/^[0-9a-f-]{36}$/i.test(orderId)) return 'ignored';

  const { data: order } = await admin
    .from('orders')
    .select('id, status, amount_cents, currency, mp_payment_id')
    .eq('id', orderId)
    .maybeSingle();
  if (!order) return 'ignored';

  const paidCents = Math.round(Number(payment.transaction_amount) * 100);
  const matches = paidCents === order.amount_cents && payment.currency_id === order.currency;

  if (payment.status === 'approved' && matches && order.status === 'pending') {
    const { error } = await admin
      .from('orders')
      .update({ status: 'paid', mp_payment_id: String(payment.id), paid_at: new Date().toISOString() })
      .eq('id', order.id)
      .eq('status', 'pending');
    if (error) throw error;
    return 'paid';
  }

  if (
    (payment.status === 'refunded' || payment.status === 'charged_back') &&
    order.status === 'paid' &&
    order.mp_payment_id === String(payment.id)
  ) {
    await admin.from('orders').update({ status: 'refunded' }).eq('id', order.id);
    return 'refunded';
  }

  return 'ignored';
}
