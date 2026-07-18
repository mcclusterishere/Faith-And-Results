-- Freedom, Inc. — Supabase setup.
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Creates the two tables the app writes to, plus row-level-security policies:
-- anyone may INSERT (public application form), only signed-in admins may read/update.

create table if not exists public.applications (
  id            text primary key,
  training      text not null,
  "trainingName" text,
  name          text,
  email         text,
  phone         text,
  city          text,
  org           text,
  notes         text,
  answers       jsonb default '{}'::jsonb,
  consent       boolean default false,
  status        text default 'received',
  note          text,
  "submittedAt" timestamptz default now(),
  "reviewedAt"  timestamptz
);

create table if not exists public.profiles (
  email       text primary key,
  name        text,
  phone       text,
  city        text,
  org         text,
  about       text,
  "updatedAt" timestamptz default now()
);

alter table public.applications enable row level security;
alter table public.profiles     enable row level security;

-- The public app (anon key) may submit…
create policy "anyone can apply"
  on public.applications for insert
  to anon with check (true);

create policy "anyone can save a profile"
  on public.profiles for insert
  to anon with check (true);

create policy "anyone can update their profile"
  on public.profiles for update
  to anon using (true) with check (true);

-- …but only signed-in admins may read and review.
create policy "admins read applications"
  on public.applications for select
  to authenticated using (true);

create policy "admins update applications"
  on public.applications for update
  to authenticated using (true) with check (true);

create policy "admins read profiles"
  on public.profiles for select
  to authenticated using (true);
