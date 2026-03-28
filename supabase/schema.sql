create extension if not exists pgcrypto;

create table if not exists public.ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  source_url text,
  tinyfish_run_id text,
  tinyfish_status text,
  records_imported integer not null default 0,
  payload jsonb not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.cashback_cards (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  source_url text,
  tinyfish_run_id text,
  bank text not null,
  card_name text not null,
  card_type text,
  cashback_rates jsonb,
  minimum_monthly_spend numeric,
  monthly_cap_sgd numeric,
  payout_cycle text,
  annual_fee text,
  income_requirement numeric,
  special_conditions text,
  signup_bonus text,
  raw_payload jsonb not null,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists cashback_cards_source_card_bank_idx
on public.cashback_cards (source, card_name, bank);

create table if not exists public.signup_offers (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  source_url text,
  tinyfish_run_id text,
  bank text not null,
  card_name text not null,
  card_type text,
  reward_value text,
  reward_description text,
  minimum_spend_to_unlock numeric,
  spend_within_days integer,
  promo_expiry_date date,
  annual_fee text,
  is_exclusive_deal boolean default false,
  exclusive_promo_code text,
  extra_gift text,
  estimated_total_value text,
  apply_url text,
  raw_payload jsonb not null,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists signup_offers_source_card_bank_idx
on public.signup_offers (source, card_name, bank);

create table if not exists public.merchant_offers (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  source_url text,
  tinyfish_run_id text,
  category text,
  merchant text not null,
  cashback_rate text,
  cashback_rate_number numeric,
  is_upsized boolean default false,
  regular_rate text,
  eligible_cards jsonb,
  valid_until text,
  min_spend numeric,
  max_cashback numeric,
  promo_code text,
  is_card_linked boolean default false,
  raw_payload jsonb not null,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists merchant_offers_source_merchant_category_idx
on public.merchant_offers (source, merchant, coalesce(category, ''));

create table if not exists public.restaurant_deals (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  source_url text,
  tinyfish_run_id text,
  restaurant_name text not null,
  cuisine text,
  location text,
  offer_title text,
  offer_details text,
  discount_value text,
  booking_url text,
  raw_payload jsonb not null,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace view public.dashboard_overview as
select
  (select count(*) from public.cashback_cards) as cashback_card_count,
  (select count(*) from public.signup_offers) as signup_offer_count,
  (select count(*) from public.merchant_offers) as merchant_offer_count,
  (select count(*) from public.restaurant_deals) as restaurant_deal_count,
  (select count(*) from public.signup_offers where is_exclusive_deal = true) as exclusive_signup_offer_count,
  (select max(cashback_rate_number) from public.merchant_offers) as max_merchant_cashback_rate,
  (select count(distinct bank) from public.cashback_cards) as bank_count;

alter table public.ingestion_runs enable row level security;
alter table public.cashback_cards enable row level security;
alter table public.signup_offers enable row level security;
alter table public.merchant_offers enable row level security;
alter table public.restaurant_deals enable row level security;

drop policy if exists "public read cashback cards" on public.cashback_cards;
create policy "public read cashback cards"
on public.cashback_cards for select using (true);

drop policy if exists "public read signup offers" on public.signup_offers;
create policy "public read signup offers"
on public.signup_offers for select using (true);

drop policy if exists "public read merchant offers" on public.merchant_offers;
create policy "public read merchant offers"
on public.merchant_offers for select using (true);

drop policy if exists "public read restaurant deals" on public.restaurant_deals;
create policy "public read restaurant deals"
on public.restaurant_deals for select using (true);

drop policy if exists "public read ingestion runs" on public.ingestion_runs;
create policy "public read ingestion runs"
on public.ingestion_runs for select using (true);
