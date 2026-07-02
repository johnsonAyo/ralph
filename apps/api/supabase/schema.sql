create table if not exists public.requests (
  id uuid primary key,
  user_id uuid not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.requests enable row level security;

create policy "Users can read their own requests"
on public.requests
for select
to authenticated
using (auth.uid() = user_id);

create table if not exists public.listings (
  id uuid primary key,
  url text not null,
  payload jsonb not null,
  raw_html text,
  created_at timestamptz not null default now()
);

alter table public.listings enable row level security;
create policy "Users can read listings" on public.listings for select to authenticated using (true);

create table if not exists public.verdicts (
  id uuid primary key,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.verdicts enable row level security;
create policy "Users can read verdicts" on public.verdicts for select to authenticated using (true);

create table if not exists public.reports (
  id uuid primary key,
  user_id uuid not null,
  type text not null default 'auction',
  status text not null,
  request_id uuid references public.requests(id),
  listing_id uuid references public.listings(id),
  verdict_id uuid references public.verdicts(id),
  request jsonb,
  listing jsonb,
  profile jsonb,
  result jsonb,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

-- Backfill for existing installs: `create table if not exists` above does NOT add
-- new columns to a table that already exists, so add them explicitly (idempotent).
alter table public.reports add column if not exists type text not null default 'auction';
alter table public.reports add column if not exists request_id uuid references public.requests(id);
alter table public.reports add column if not exists listing_id uuid references public.listings(id);
alter table public.reports add column if not exists verdict_id uuid references public.verdicts(id);
alter table public.reports add column if not exists request jsonb;
alter table public.reports add column if not exists listing jsonb;
alter table public.reports add column if not exists profile jsonb;
alter table public.reports add column if not exists result jsonb;

create index if not exists reports_user_id_idx on public.reports (user_id);
create index if not exists reports_status_idx on public.reports (status);
create index if not exists reports_request_id_idx on public.reports (request_id);
create index if not exists reports_listing_id_idx on public.reports (listing_id);
create index if not exists reports_verdict_id_idx on public.reports (verdict_id);

alter table public.reports enable row level security;

create policy "Users can read their own reports"
on public.reports
for select
to authenticated
using (auth.uid() = user_id);

create table if not exists public.credits_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  report_id uuid,
  event_type text not null,
  amount integer not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists credits_ledger_user_id_idx on public.credits_ledger (user_id);
create index if not exists credits_ledger_report_id_idx on public.credits_ledger (report_id);

alter table public.credits_ledger enable row level security;

create policy "Users can read their own credit ledger"
on public.credits_ledger
for select
to authenticated
using (auth.uid() = user_id);
