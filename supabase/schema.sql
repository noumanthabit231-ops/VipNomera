create table if not exists public.profiles (
  telegram_id text primary key,
  first_name text not null,
  username text,
  photo_url text,
  phone text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_telegram_id text not null references public.profiles(telegram_id) on delete cascade,
  phone text not null unique,
  contact_phone text not null,
  title text not null check (char_length(title) between 2 and 80),
  operator text not null check (operator in ('Beeline', 'Tele2', 'ALTEL', 'activ', 'Kcell')),
  price bigint not null check (price >= 1000),
  category text not null default 'Обычные' check (category in ('Обычные', 'Красивые', 'Бизнес')),
  promoted boolean not null default false,
  status text not null default 'published' check (status in ('draft', 'published', 'sold', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists listings_status_created_idx on public.listings(status, created_at desc);
create index if not exists listings_operator_idx on public.listings(operator);
create index if not exists listings_price_idx on public.listings(price);

create table if not exists public.telegram_login_requests (
  nonce uuid primary key,
  phone text not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed')),
  telegram_id text,
  first_name text,
  username text,
  photo_url text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '10 minutes')
);

create index if not exists telegram_login_requests_expires_idx on public.telegram_login_requests(expires_at);

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.telegram_login_requests enable row level security;

drop policy if exists "Public listings are readable" on public.listings;
create policy "Public listings are readable"
on public.listings for select
to anon, authenticated
using (status = 'published');

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.telegram_login_requests from anon, authenticated;
grant select on table public.listings to anon, authenticated;
grant all on table public.profiles, public.listings, public.telegram_login_requests to service_role;
