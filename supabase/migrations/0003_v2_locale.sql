-- v2: content language per player (en | tr). Null = follow the device's Accept-Language.
-- All other v2 state (clock, facts, lab queue, interviews, deductions, finale) lives in session_state.state (jsonb).
alter table public.user_profiles
  add column locale text check (locale in ('en', 'tr'));

-- the language is changed through the API (PUT /me/locale), like the other server-owned profile fields
revoke update on public.user_profiles from authenticated;
grant update (display_name, onboarded) on public.user_profiles to authenticated;
