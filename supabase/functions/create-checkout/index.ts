// Cria (ou reaproveita) o pedido do usuário logado e devolve o link do Checkout Pro do Mercado Pago.
// O preço é lido da tabela products: o navegador não envia nem influencia o valor.
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { json, preflight, requireEnv } from '../_shared/http.ts';
import { createPreference, PRODUCT_ID } from '../_shared/mercadopago.ts';

const admin = createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
  auth: { persistSession: false },
});

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;

  try {
    const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
    const { data: auth, error: authError } = await admin.auth.getUser(token);
    const user = auth?.user;
    if (authError || !user?.email || !user.email_confirmed_at) return json(req, { error: 'unauthorized' }, 401);

    const { data: product } = await admin
      .from('products')
      .select('id, title, price_cents, currency')
      .eq('id', PRODUCT_ID)
      .eq('active', true)
      .single();
    if (!product) return json(req, { error: 'product_unavailable' }, 409);

    const { data: orders } = await admin
      .from('orders')
      .select('id, status, created_at')
      .eq('user_id', user.id)
      .eq('product_id', PRODUCT_ID)
      .order('created_at', { ascending: false })
      .limit(20);

    if (orders?.some((o) => o.status === 'paid')) return json(req, { owned: true });

    // Limite simples contra abuso: no máximo 10 pedidos por hora por conta.
    const hourAgo = Date.now() - 60 * 60 * 1000;
    if ((orders ?? []).filter((o) => Date.parse(o.created_at) > hourAgo).length >= 10) {
      return json(req, { error: 'too_many_requests' }, 429);
    }

    // Reaproveita um pedido pendente recente para não acumular pedidos abandonados.
    const recentPending = orders?.find((o) => o.status === 'pending' && Date.parse(o.created_at) > hourAgo);
    let orderId = recentPending?.id as string | undefined;
    if (!orderId) {
      const { data: created, error } = await admin
        .from('orders')
        .insert({
          user_id: user.id,
          email: user.email,
          product_id: product.id,
          amount_cents: product.price_cents,
          currency: product.currency,
        })
        .select('id')
        .single();
      if (error || !created) throw error ?? new Error('Falha ao criar pedido');
      orderId = created.id as string;
    }

    const site = requireEnv('SITE_URL').replace(/\/$/, '');
    const back = `${site}/?compra=retorno`;
    const preference = await createPreference(
      {
        items: [
          {
            id: product.id,
            title: product.title,
            quantity: 1,
            unit_price: product.price_cents / 100,
            currency_id: product.currency,
          },
        ],
        payer: { email: user.email },
        external_reference: orderId,
        back_urls: { success: back, pending: back, failure: back },
        auto_return: 'approved',
        notification_url: `${requireEnv('SUPABASE_URL')}/functions/v1/mp-webhook`,
        statement_descriptor: 'NPWTECH',
        payment_methods: { installments: 3 },
      },
      `${orderId}-${Math.floor(Date.now() / 60000)}`,
    );

    await admin.from('orders').update({ mp_preference_id: preference.id }).eq('id', orderId);

    return json(req, { orderId, checkoutUrl: preference.init_point });
  } catch (err) {
    console.error('create-checkout', err);
    return json(req, { error: 'internal_error' }, 500);
  }
});
