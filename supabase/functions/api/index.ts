// Supabase Edge Function (Deno) — the only place that holds the service role and the AI key.
// `npm run sync:functions` copies server/ + shared/ into ./_shared before `supabase functions deploy api`.
// NOTE: not yet deployed against a live project.
import { createApp } from '../_shared/server/http/app.ts';
import { GameService } from '../_shared/server/service.ts';
import { SupabaseStore } from '../_shared/server/store/supabaseStore.ts';
import { gatewayFromEnv } from '../_shared/server/ai/gateway.ts';
import { billingFromEnv } from '../_shared/server/billing.ts';
import { analyticsFromEnv } from '../_shared/server/analytics.ts';

const env = Deno.env.toObject();
const store = new SupabaseStore(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const service = new GameService(store, gatewayFromEnv(env), { billing: billingFromEnv(env, false), analytics: analyticsFromEnv(env, false) });
const app = createApp(service, { allowDevAuth: false, supabaseUrl: env.SUPABASE_URL, supabaseAnonKey: env.SUPABASE_ANON_KEY }, '/api');

Deno.serve(app.fetch);
