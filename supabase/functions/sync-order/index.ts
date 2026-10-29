// Chamada pelo site quando o comprador volta do Mercado Pago.
// Se o webhook ainda não chegou, consulta os pagamentos do pedido na API e aplica o resultado.
// Só funciona para pedidos do próprio usuário logado.
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { json, preflight, requireEnv } from '../_shared/http.ts';
import { applyPayment, PRODUCT_ID, searchPaymentsByOrder } from '../_shared/mercadopago.ts';

const admin = createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
  auth: { persistSession: false },
});

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;

  try {
    const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
    const { data: auth } = await admin.auth.getUser(token);
    const user = auth?.user;
    if (!user) return json(req, { error: 'unauthorized' }, 401);

    const { data: orders } = await admin
      .from('orders')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('product_id', PRODUCT_ID)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!orders?.length) return json(req, { status: 'none' });
    if (orders.some((o) => o.status === 'paid')) return json(req, { status: 'paid' });

    for (const order of orders.filter((o) => o.status === 'pending')) {
      const payments = await searchPaymentsByOrder(order.id);
      for (const payment of payments) {
        if ((await applyPayment(admin, payment)) === 'paid') return json(req, { status: 'paid' });
      }
      if (payments.some((p) => p.status === 'pending' || p.status === 'in_process')) {
        return json(req, { status: 'processing' });
      }
    }

    return json(req, { status: 'pending' });
  } catch (err) {
    console.error('sync-order', err);
    return json(req, { error: 'internal_error' }, 500);
  }
});
