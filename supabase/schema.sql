-- PrepPilot AI — Supabase Database Schema
-- Run this in the Supabase SQL Editor to set up your database.
-- Dashboard → SQL Editor → New query → paste this → Run

-- ─── Enable UUID extension ───────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ─── User profiles ───────────────────────────────────────────────────────────
create table if not exists profiles (
  id              uuid primary key default gen_random_uuid(),
  name            text not null default 'Practitioner',
  email           text not null default '',
  target_role     text not null default 'Software Engineer',
  experience_level text not null default 'entry'
                    check (experience_level in ('entry', 'junior', 'mid')),
  preferred_topics text[] not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ─── Interview sessions ───────────────────────────────────────────────────────
create table if not exists sessions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles(id) on delete cascade,
  role            text not null,
  topic           text not null
                    check (topic in ('java','dsa','dbms','os','networks','behavioral')),
  difficulty      text not null
                    check (difficulty in ('easy','medium','hard')),
  interview_type  text not null
                    check (interview_type in ('technical','behavioral','mixed')),
  question_count  integer not null check (question_count between 1 and 20),
  status          text not null default 'in_progress'
                    check (status in ('in_progress','completed','abandoned')),
  overall_score   integer check (overall_score between 0 and 100),
  created_at      timestamptz not null default now(),
  completed_at    timestamptz
);

create index if not exists sessions_user_id_idx on sessions(user_id);
create index if not exists sessions_status_idx  on sessions(status);

-- ─── Session questions (answered questions within a session) ──────────────────
create table if not exists session_questions (
  id              uuid primary key default gen_random_uuid(),
  session_id      uuid not null references sessions(id) on delete cascade,
  question_id     text not null,          -- references question bank (string ID)
  answer          text,
  order_index     integer not null default 0,
  created_at      timestamptz not null default now()
);

create index if not exists sq_session_id_idx on session_questions(session_id);

-- ─── Evaluations ─────────────────────────────────────────────────────────────
create table if not exists evaluations (
  id                    uuid primary key default gen_random_uuid(),
  session_id            uuid not null references sessions(id) on delete cascade,
  question_id           text not null,
  technical_score       integer not null check (technical_score between 0 and 100),
  completeness_score    integer not null check (completeness_score between 0 and 100),
  clarity_score         integer not null check (clarity_score between 0 and 100),
  overall_score         integer not null check (overall_score between 0 and 100),
  strengths             text[] not null default '{}',
  improvements          text[] not null default '{}',
  demonstrated_concepts text[] not null default '{}',
  missing_concepts      text[] not null default '{}',
  is_mock               boolean not null default false,
  evaluated_at          timestamptz not null default now()
);

create index if not exists eval_session_id_idx on evaluations(session_id);

-- ─── Auto-update updated_at on profiles ──────────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on profiles;
create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

-- ─── Row Level Security (enable when using anon key from frontend) ────────────
-- Uncomment these if you add Supabase Auth in the future.
-- alter table profiles      enable row level security;
-- alter table sessions      enable row level security;
-- alter table session_questions enable row level security;
-- alter table evaluations   enable row level security;
