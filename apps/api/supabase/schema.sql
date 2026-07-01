create table if not exists public.reports (
  id uuid primary key,
  user_id uuid not null,
  type text not null default 'auction',
  status text not null,
  request jsonb not null,
  listing jsonb,
  profile jsonb,
  result jsonb,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

-- Backfill for existing installs: `create table if not exists` above does NOT add
-- new columns to a table that already exists, so add them explicitly (idempotent).
alter table public.reports add column if not exists type text not null default 'auction';
alter table public.reports add column if not exists listing jsonb;
alter table public.reports add column if not exists profile jsonb;
alter table public.reports add column if not exists result jsonb;

create index if not exists reports_user_id_idx on public.reports (user_id);
create index if not exists reports_status_idx on public.reports (status);

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
