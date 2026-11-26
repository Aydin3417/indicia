-- Indicia — initial schema.
-- Principle: the client never reads case truth or raw session state. Everything a player sees is
-- projected by the `api` Edge Function (service role). RLS therefore grants clients almost nothing.


-- ───────────────────────────────────────── players
create table public.user_profiles (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Investigator' check (char_length(display_name) between 1 and 40),
  plan         text not null default 'free' check (plan in ('free', 'plus')),
  onboarded    boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.subscriptions (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  entitlement      text not null default 'none' check (entitlement in ('none', 'plus')),
  product_id       text,
  store            text check (store in ('app_store', 'play_store', 'promotional')),
  expires_at       timestamptz,
  revenuecat_event jsonb,
  updated_at       timestamptz not null default now()
);

-- ───────────────────────────────────────── cases (truth lives here, service role only)
create table public.cases (
  id          text primary key,
  title       text not null,
  case_number text not null,
  category    text not null,
  difficulty  text not null check (difficulty in ('beginner', 'intermediate', 'advanced', 'expert')),
  tier        text not null default 'free' check (tier in ('free', 'plus')),
  published   boolean not null default false,
  current_version int,
  created_at  timestamptz not null default now()
);

create table public.case_versions (
  case_id      text not null references public.cases(id) on delete cascade,
  version      int not null,
  content_hash text not null,
  definition   jsonb not null,            -- the complete CaseDefinition: truth, suspects, answer key
  source       text not null default 'authored' check (source in ('authored', 'generated')),
  locked_at    timestamptz,               -- set on publication; locked rows are immutable
  created_at   timestamptz not null default now(),
  primary key (case_id, version),
  unique (case_id, content_hash)
);

create table public.case_validation_results (
  id         bigint generated always as identity primary key,
  case_id    text not null,
  version    int not null,
  ok         boolean not null,
  errors     jsonb not null default '[]',
  warnings   jsonb not null default '[]',
  stats      jsonb not null default '{}',
  created_at timestamptz not null default now(),
  foreign key (case_id, version) references public.case_versions(case_id, version) on delete cascade
);

-- a locked version can never change
create or replace function public.forbid_locked_case_update() returns trigger language plpgsql as $$
begin
  if old.locked_at is not null then
    raise exception 'case % v% is locked and immutable', old.case_id, old.version;
  end if;
  return new;
end $$;
create trigger case_versions_immutable before update or delete on public.case_versions
  for each row execute function public.forbid_locked_case_update();

-- publication requires a passing validation of that exact version
create or replace function public.require_validation_before_lock() returns trigger language plpgsql as $$
begin
  if new.locked_at is not null and not exists (
    select 1 from public.case_validation_results v
    where v.case_id = new.case_id and v.version = new.version and v.ok
  ) then
    raise exception 'case % v% has no passing validation', new.case_id, new.version;
  end if;
  return new;
end $$;
create trigger case_versions_validated before insert or update of locked_at on public.case_versions
  for each row execute function public.require_validation_before_lock();

create table public.generated_case_queue (
  id          bigint generated always as identity primary key,
  template    text not null,
  seed        bigint not null,
  status      text not null default 'queued' check (status in ('queued', 'generating', 'validating', 'rejected', 'review', 'published')),
  case_id     text,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ───────────────────────────────────────── sessions
create table public.game_sessions (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references auth.users(id) on delete cascade,
  case_id      text not null references public.cases(id),
  case_version int not null,
  case_hash    text not null,
  mode         text not null default 'solo' check (mode in ('solo', 'coop')),
  room_code    text unique check (room_code ~ '^[A-Z2-9]{6}$'),
  status       text not null default 'active' check (status in ('lobby', 'active', 'closed', 'abandoned')),
  last_seen    bigint not null default 0,
  started_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  finished_at  timestamptz
);
create index game_sessions_owner_idx on public.game_sessions(owner_id, updated_at desc);

create table public.session_players (
  session_id uuid not null references public.game_sessions(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       text not null default 'investigator' check (role in ('host', 'investigator')),
  joined_at  timestamptz not null default now(),
  last_seen  timestamptz not null default now(),
  primary key (session_id, user_id)
);
create index session_players_user_idx on public.session_players(user_id);

-- full mutable investigation state (discoveries, suspect memory, transcripts, board) — server only
create table public.session_state (
  session_id uuid primary key references public.game_sessions(id) on delete cascade,
  state      jsonb not null,
  version    int not null default 0,
  updated_at timestamptz not null default now()
);

-- normalised mirrors for analytics / co-op realtime (written by the server)
create table public.interrogation_messages (
  id          bigint generated always as identity primary key,
  session_id  uuid not null references public.game_sessions(id) on delete cascade,
  suspect_id  text not null,
  author_id   uuid references auth.users(id) on delete set null,
  sender      text not null check (sender in ('player', 'suspect', 'system')),
  text        text not null check (char_length(text) <= 2000),
  evidence_id text,
  created_at  timestamptz not null default now()
);
create index interrogation_messages_session_idx on public.interrogation_messages(session_id, suspect_id, id);

create table public.investigation_notes (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.game_sessions(id) on delete cascade,
  author_id  uuid not null references auth.users(id) on delete cascade,
  shared     boolean not null default false,
  text       text not null check (char_length(text) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.final_accusations (
  session_id  uuid primary key references public.game_sessions(id) on delete cascade,
  author_id   uuid not null references auth.users(id) on delete cascade,
  report      jsonb not null,
  created_at  timestamptz not null default now()
);

create table public.case_results (
  session_id      uuid primary key references public.game_sessions(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  case_id         text not null references public.cases(id),
  score           int not null check (score between 0 and 100),
  rating          text not null,
  culprit_correct boolean not null,
  result          jsonb not null,
  created_at      timestamptz not null default now()
);
create index case_results_user_idx on public.case_results(user_id, created_at desc);

create view public.player_statistics with (security_invoker = true) as
  select user_id,
         count(*)                                   as cases_closed,
         count(*) filter (where culprit_correct)    as correct_accusations,
         round(avg(score))::int                     as average_score,
         max(score)                                 as best_score
  from public.case_results group by user_id;

create table public.achievements (
  id          text primary key,
  title       text not null,
  description text not null
);
create table public.user_achievements (
  user_id        uuid not null references auth.users(id) on delete cascade,
  achievement_id text not null references public.achievements(id),
  earned_at      timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

-- ───────────────────────────────────────── AI cost control
create table public.ai_usage_logs (
  id            bigint generated always as identity primary key,
  user_id       uuid references auth.users(id) on delete set null,
  session_id    uuid references public.game_sessions(id) on delete set null,
  provider      text not null,
  model         text not null,
  purpose       text not null,
  input_tokens  int not null default 0,
  output_tokens int not null default 0,
  cost_usd      numeric(12, 6) not null default 0,
  latency_ms    int not null default 0,
  ok            boolean not null,
  created_at    timestamptz not null default now()
);
create index ai_usage_logs_user_day_idx on public.ai_usage_logs(user_id, created_at);

create table public.usage_quotas (
  user_id   uuid not null references auth.users(id) on delete cascade,
  day       date not null,
  questions int not null default 0,
  primary key (user_id, day)
);

create or replace function public.increment_questions(p_user uuid, p_day date) returns int
language sql security definer set search_path = public as $$
  insert into public.usage_quotas(user_id, day, questions) values (p_user, p_day, 1)
  on conflict (user_id, day) do update set questions = usage_quotas.questions + 1
  returning questions;
$$;
revoke all on function public.increment_questions(uuid, date) from public, anon, authenticated;

-- ───────────────────────────────────────── row level security
alter table public.user_profiles          enable row level security;
alter table public.subscriptions          enable row level security;
alter table public.cases                  enable row level security;
alter table public.case_versions          enable row level security;
alter table public.case_validation_results enable row level security;
alter table public.generated_case_queue   enable row level security;
alter table public.game_sessions          enable row level security;
alter table public.session_players        enable row level security;
alter table public.session_state          enable row level security;
alter table public.interrogation_messages enable row level security;
alter table public.investigation_notes    enable row level security;
alter table public.final_accusations      enable row level security;
alter table public.case_results           enable row level security;
alter table public.achievements           enable row level security;
alter table public.user_achievements      enable row level security;
alter table public.ai_usage_logs          enable row level security;
alter table public.usage_quotas           enable row level security;

-- Deliberately NO client policies on: case_versions, case_validation_results, generated_case_queue,
-- session_state, final_accusations, ai_usage_logs. Only the service role (Edge Function) touches them.

create policy "own profile read"   on public.user_profiles for select using (auth.uid() = user_id);
create policy "own profile rename" on public.user_profiles for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
revoke update on public.user_profiles from authenticated;
grant update (display_name, onboarded) on public.user_profiles to authenticated;  -- plan is server-owned

create policy "own subscription read" on public.subscriptions for select using (auth.uid() = user_id);
create policy "published catalog"     on public.cases for select using (published);

-- membership check without RLS recursion
create or replace function public.is_session_member(p_session uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.game_sessions g where g.id = p_session and g.owner_id = auth.uid())
      or exists (select 1 from public.session_players p where p.session_id = p_session and p.user_id = auth.uid());
$$;

create policy "member sessions read"   on public.game_sessions for select using (public.is_session_member(id));
create policy "member roster read"     on public.session_players for select using (public.is_session_member(session_id));
create policy "member transcript read" on public.interrogation_messages for select using (public.is_session_member(session_id));
create policy "notes read" on public.investigation_notes for select using (
  author_id = auth.uid() or (shared and public.is_session_member(session_id))
);
create policy "own results read"      on public.case_results for select using (user_id = auth.uid());
create policy "achievements catalog"  on public.achievements for select using (true);
create policy "own achievements read" on public.user_achievements for select using (user_id = auth.uid());
create policy "own quota read"        on public.usage_quotas for select using (user_id = auth.uid());

-- profile row on sign-up
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_profiles(user_id) values (new.id) on conflict do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
