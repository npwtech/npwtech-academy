-- Endurecimento de segurança da loja do ebook.

-- Funções: ninguém além do banco/serviço executa as funções internas.
revoke execute on function public.touch_updated_at() from public, anon, authenticated;

-- Valores coerentes: só BRL, e-mail com formato válido, ids de pagamento só com dígitos.
alter table public.products
  add constraint products_currency_brl check (currency = 'BRL'),
  add constraint products_price_range check (price_cents between 100 and 100000);

alter table public.orders
  add constraint orders_currency_brl check (currency = 'BRL'),
  add constraint orders_email_format check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and length(email) <= 254),
  add constraint orders_mp_payment_digits check (mp_payment_id is null or mp_payment_id ~ '^\d{1,32}$'),
  add constraint orders_paid_has_payment check (status not in ('paid', 'refunded') or (mp_payment_id is not null and paid_at is not null));

-- Um único pedido pago por pessoa e produto (evita cobranças em dobro liberando o mesmo acesso).
create unique index orders_one_paid_per_user_product
  on public.orders (user_id, product_id)
  where status = 'paid';

-- Auditoria: limita o tamanho do que é gravado a partir de requisições externas.
alter table public.payment_events
  add constraint payment_events_sizes check (
    coalesce(length(topic), 0) <= 64
    and coalesce(length(resource_id), 0) <= 64
    and coalesce(length(request_id), 0) <= 128
  );

-- Os papéis públicos não precisam de sequências nem de tabelas internas.
revoke all on all sequences in schema public from anon, authenticated;
revoke all on public.payment_events from public;

-- Conteúdo pago: além do RLS, o papel anon não tem nenhum privilégio de leitura.
revoke select on public.ebook_chapters from anon;
grant select on public.ebook_chapters to authenticated;
