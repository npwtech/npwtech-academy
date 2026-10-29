-- Loja do ebook "Sua Empresa no Digital".
--
-- Modelo de segurança:
--   • O conteúdo completo do livro fica somente nesta base, nunca no código do site.
--   • O navegador só lê capítulos se o usuário logado tiver um pedido PAGO (RLS).
--   • Pedidos são criados e atualizados apenas pelas Edge Functions (service role).
--     O cliente não tem permissão de inserir, alterar ou apagar nada.
--   • O preço vem da tabela products, nunca do navegador.

-- Produtos ------------------------------------------------------------------
create table public.products (
  id text primary key,
  title text not null,
  price_cents integer not null check (price_cents > 0),
  currency text not null default 'BRL',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "products: leitura publica dos ativos"
  on public.products for select
  to anon, authenticated
  using (active);

insert into public.products (id, title, price_cents)
values ('ebook-sua-empresa-no-digital', 'Ebook Sua Empresa no Digital — NPWTech', 5500);

-- Pedidos -------------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  email text not null,
  product_id text not null references public.products (id),
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'BRL',
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'refunded', 'cancelled')),
  mp_preference_id text,
  mp_payment_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz
);

create index orders_user_product_idx on public.orders (user_id, product_id, status);

alter table public.orders enable row level security;

-- O dono enxerga os próprios pedidos. Sem políticas de escrita: só o service role escreve.
create policy "orders: dono le os proprios pedidos"
  on public.orders for select
  to authenticated
  using (user_id = (select auth.uid()));

create function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger orders_touch_updated_at
  before update on public.orders
  for each row execute function public.touch_updated_at();

-- Registro de notificações do Mercado Pago (auditoria). Sem políticas: invisível ao cliente.
create table public.payment_events (
  id bigint generated always as identity primary key,
  provider text not null default 'mercadopago',
  topic text,
  resource_id text,
  request_id text,
  signature_ok boolean not null,
  received_at timestamptz not null default now()
);

alter table public.payment_events enable row level security;

-- Acesso ao livro -----------------------------------------------------------
create function public.has_ebook_access()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.orders o
    where o.user_id = (select auth.uid())
      and o.product_id = 'ebook-sua-empresa-no-digital'
      and o.status = 'paid'
  );
$$;

revoke execute on function public.has_ebook_access() from public, anon;
grant execute on function public.has_ebook_access() to authenticated;

-- Capítulos: o conteúdo pago.
create table public.ebook_chapters (
  id smallint primary key,
  slug text not null unique,
  kicker text not null,
  title text not null,
  summary text not null,
  minutes smallint not null,
  blocks jsonb not null check (jsonb_typeof(blocks) = 'array')
);

alter table public.ebook_chapters enable row level security;

create policy "ebook_chapters: somente compradores"
  on public.ebook_chapters for select
  to authenticated
  using ((select public.has_ebook_access()));

-- Garantia extra: o papel anon não tem nenhum privilégio sobre o conteúdo nem sobre pedidos.
revoke all on public.ebook_chapters from anon;
revoke all on public.orders from anon;
revoke all on public.payment_events from anon, authenticated;
revoke insert, update, delete on public.ebook_chapters from authenticated;
revoke insert, update, delete on public.orders from authenticated;
revoke insert, update, delete on public.products from anon, authenticated;
