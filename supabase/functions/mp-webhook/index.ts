// Recebe as notificações de pagamento do Mercado Pago.
// 1) confere a assinatura x-signature; 2) consulta o pagamento direto na API do Mercado Pago
// (o corpo da notificação nunca é usado como fonte de verdade); 3) libera ou revoga o acesso.
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { requireEnv } from '../_shared/http.ts';
import { applyPayment, getPayment, verifyWebhookSignature } from '../_shared/mercadopago.ts';

const admin = createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
  auth: { persistSession: false },
});

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 });

  const url = new URL(req.url);
  let body: { type?: string; action?: string; data?: { id?: string | number } } = {};
  try {
    body = await req.json();
  } catch {
    // notificações sem corpo JSON usam somente a query string
  }

  const topic = url.searchParams.get('type') ?? url.searchParams.get('topic') ?? body.type ?? '';
  const dataId = url.searchParams.get('data.id') ?? (body.data?.id != null ? String(body.data.id) : '');
  const signatureOk = await verifyWebhookSignature(req, dataId);

  await admin.from('payment_events').insert({
    topic,
    resource_id: dataId.slice(0, 64) || null,
    request_id: req.headers.get('x-request-id')?.slice(0, 128) ?? null,
    signature_ok: signatureOk,
  });

  if (!signatureOk) return new Response('invalid signature', { status: 401 });
  if (topic !== 'payment' || !/^\d+$/.test(dataId)) return new Response('ignored', { status: 200 });

  try {
    const payment = await getPayment(dataId);
    const result = await applyPayment(admin, payment);
    return new Response(result, { status: 200 });
  } catch (err) {
    console.error('mp-webhook', err);
    // 500 faz o Mercado Pago tentar de novo mais tarde.
    return new Response('error', { status: 500 });
  }
});
