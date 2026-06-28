-- LayeAwards Management database setup
-- Run once in the Supabase SQL editor.

create extension if not exists "pgcrypto";

-- Task tracker -------------------------------------------------------------
create table if not exists public.tasks (
  id         uuid primary key default gen_random_uuid(),
  name       text not null default '',
  owner      text not null default 'CEO',
  deadline   date,
  status     text not null default 'pending',
  notes      text,
  created_at timestamptz not null default now()
);

-- Sponsor pipeline ---------------------------------------------------------
create table if not exists public.sponsors (
  id            uuid primary key default gen_random_uuid(),
  name          text not null default '',
  proposal_sent boolean not null default false,
  proposal_date date,
  status        text not null default 'pending',
  amount        numeric not null default 0,
  notes         text,
  created_at    timestamptz not null default now()
);

-- Single-row event stats panel --------------------------------------------
create table if not exists public.event_stats (
  id                uuid primary key default gen_random_uuid(),
  nominees_count    integer not null default 0,
  voters_count      integer not null default 0,
  votes_revenue     numeric not null default 0,
  projected_revenue numeric not null default 0,
  projected_costs   numeric not null default 0,
  updated_at        timestamptz not null default now()
);

-- Seed the stats row once so the panel always has something to edit.
insert into public.event_stats (nominees_count, voters_count, votes_revenue, projected_revenue, projected_costs)
select 0, 0, 0, 0, 0
where not exists (select 1 from public.event_stats);

-- Open access for the trusted internal team (no login, shared private link).
alter table public.tasks       enable row level security;
alter table public.sponsors    enable row level security;
alter table public.event_stats enable row level security;

drop policy if exists "team access" on public.tasks;
drop policy if exists "team access" on public.sponsors;
drop policy if exists "team access" on public.event_stats;

create policy "team access" on public.tasks       for all using (true) with check (true);
create policy "team access" on public.sponsors    for all using (true) with check (true);
create policy "team access" on public.event_stats for all using (true) with check (true);

-- Live updates across every open screen.
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.sponsors;
alter publication supabase_realtime add table public.event_stats;
