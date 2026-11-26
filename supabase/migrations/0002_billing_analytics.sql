-- Phase 7: server-owned entitlements, analytics opt-out, AI cost accounting.

alter table public.user_profiles
  add column plus_until        timestamptz,
  add column analytics_opt_out boolean not null default false;

-- players may rename themselves; plan, plus_until and analytics_opt_out go through the API only
revoke update on public.user_profiles from authenticated;
grant update (display_name, onboarded) on public.user_profiles to authenticated;

-- AI spend for one player on one UTC day (used for the per-player daily budget)
create or replace function public.user_ai_cost(p_user uuid, p_day date) returns numeric
language sql stable security definer set search_path = public as $$
  select coalesce(sum(cost_usd), 0) from public.ai_usage_logs
  where user_id = p_user and created_at >= p_day and created_at < p_day + 1;
$$;
revoke all on function public.user_ai_cost(uuid, date) from public, anon, authenticated;

-- operator reporting: cost per day, provider, model and purpose (RLS on ai_usage_logs keeps clients out)
create view public.ai_cost_daily with (security_invoker = true) as
  select date_trunc('day', created_at)::date as day,
         provider, model, purpose,
         count(*)                                   as calls,
         count(*) filter (where not ok)             as failures,
         sum(input_tokens)                          as input_tokens,
         sum(output_tokens)                         as output_tokens,
         round(sum(cost_usd), 4)                    as cost_usd,
         round(avg(latency_ms))::int                as avg_latency_ms,
         count(distinct user_id)                    as players
  from public.ai_usage_logs
  group by 1, 2, 3, 4;

create index if not exists ai_usage_logs_day_idx on public.ai_usage_logs(created_at);
