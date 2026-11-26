// Local development entry (Node). Production runs supabase/functions/api/index.ts on Deno.
import { serve } from '@hono/node-server';
import path from 'node:path';
import { createApp } from './http/app.ts';
import { GameService } from './service.ts';
import { FileStore } from './store/fileStore.ts';
import { gatewayFromEnv } from './ai/gateway.ts';
import { billingFromEnv } from './billing.ts';
import { analyticsFromEnv } from './analytics.ts';

const port = Number(process.env.PORT ?? 8787);
const ai = gatewayFromEnv(process.env);
const store = new FileStore(path.resolve(process.env.DATA_DIR ?? '.data'));
const billing = billingFromEnv(process.env, true);
const service = new GameService(store, ai, { billing, analytics: analyticsFromEnv(process.env, true) });
const app = createApp(service, { allowDevAuth: true });

serve({ fetch: app.fetch, port, hostname: '0.0.0.0' }, () => {
  console.log(`[indicia] API on http://localhost:${port}  ai=${ai.provider ? `${ai.provider.name}/${ai.provider.model}` : 'offline (authored lines)'}  billing=${billing.revenueCatSecret ? 'revenuecat' : billing.allowDevPurchases ? 'dev test purchases' : 'off'}`);
});
