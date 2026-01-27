create table if not exists public.decisions (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  context text default '',
  options jsonb not null,
  criteria jsonb not null,
  scores jsonb not null,
  total_scores jsonb not null,
  recommended_option_id text not null,
  share_slug text unique,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
