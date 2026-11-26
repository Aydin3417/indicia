// SERVER-ONLY. HTTP API. The same app runs on Node (dev) and Deno (Supabase Edge Function).
import { Hono, type Context } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';
import { GameService, ServiceError, isServiceError } from '../service.ts';
import { localeFromHeader } from '../engine/i18n.ts';

export interface AuthConfig {
  allowDevAuth: boolean;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

type Env = { Variables: { userId: string; locale: 'en' | 'tr' | undefined } };

const id = z.string().min(1).max(80).regex(/^[a-zA-Z0-9_-]+$/);

const schemas = {
  start: z.object({ caseId: id, restart: z.boolean().optional(), mode: z.enum(['solo', 'coop']).optional() }),
  join: z.object({ code: z.string().min(4).max(12) }),
  lock: z.object({ locked: z.boolean() }),
  remove: z.object({ userId: z.string().min(1).max(80) }),
  rename: z.object({ displayName: z.string().min(1).max(40) }),
  sync: z.object({ devGrant: z.boolean().optional() }),
  privacy: z.object({ analyticsOptOut: z.boolean() }),
  event: z.object({ name: z.string().min(1).max(40), props: z.record(z.string(), z.unknown()).optional() }),
  // ── v2
  locale: z.object({ locale: z.enum(['en', 'tr']).nullable() }),
  travel: z.object({ locationId: id }),
  inspect: z.object({ zoneId: id }),
  probe: z.object({ locationId: id, tool: z.enum(['uv', 'dust']), x: z.number().min(0).max(1), y: z.number().min(0).max(1) }),
  detail: z.object({ zoneId: id, detailId: id, tool: z.enum(['torch', 'uv', 'dust', 'camera']).optional() }),
  collect: z.object({ evidenceId: id, key: z.string().regex(/^\d{1,3}\.\d{1,3}$/) }),
  labSubmit: z.object({ analysisId: id }),
  labCollect: z.object({ analysisId: id.optional() }),
  suspect: z.object({ suspectId: id }),
  topic: z.object({ suspectId: id, topicId: id }),
  press: z.object({ suspectId: id, claimId: z.string().min(1).max(120).regex(/^[a-zA-Z0-9_.-]+$/) }),
  present: z.object({ suspectId: id, claimId: z.string().min(1).max(120).regex(/^[a-zA-Z0-9_.-]+$/), itemId: id }),
  ask: z.object({ suspectId: id, text: z.string().min(1).max(600) }),
  deduce: z.object({
    deductionId: id,
    fills: z.record(id, z.string().min(1).max(80)).optional(),
    order: z.array(id).max(30).optional(),
    outlier: id.optional(),
  }),
  finaleStart: z.object({ accusedId: id }),
  finaleAnswer: z.object({ itemId: id }),
  wait: z.object({ minutes: z.number().int().min(1).max(480).optional(), until: id.optional() }).refine((b) => (b.minutes === undefined) !== (b.until === undefined), 'minutes or until'),
  nightChoice: z.object({ optionId: id }),
  // ── wave 5: co-op team (no free text anywhere)
  intent: z.object({ kind: z.enum(['go', 'interview', 'lab']).nullable(), target: id.optional() }),
  done: z.object({ done: z.boolean() }),
  share: z.object({ itemId: id.optional() }),
  draft: z.object({
    deductionId: id,
    fills: z.record(id, z.string().max(80).regex(/^[a-zA-Z0-9_:.-]*$/)).optional(),
    order: z.array(id).max(30).optional(),
    outlier: z.string().max(80).regex(/^[a-zA-Z0-9_-]*$/).optional(),
  }),
  deduction: z.object({ deductionId: id }),
  suggest: z.object({ deductionId: id, blankId: id, value: z.string().min(1).max(80).regex(/^[a-zA-Z0-9_:.-]+$/) }),
  finaleSuggest: z.object({ itemId: id }),
  handover: z.object({ playerId: z.string().min(1).max(80) }),
};

async function authenticate(c: Context, cfg: AuthConfig): Promise<string | null> {
  const header = c.req.header('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) return null;
  if (token.startsWith('dev.')) {
    if (!cfg.allowDevAuth) return null;
    const devId = token.slice(4);
    return /^[a-zA-Z0-9-]{8,64}$/.test(devId) ? `dev-${devId}` : null;
  }
  if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) return null;
  const res = await fetch(`${cfg.supabaseUrl}/auth/v1/user`, { headers: { authorization: `Bearer ${token}`, apikey: cfg.supabaseAnonKey } });
  if (!res.ok) return null;
  const user = (await res.json()) as { id?: string };
  return user.id ?? null;
}

const STATUS: Record<ServiceError['code'], 400 | 401 | 402 | 403 | 404 | 409 | 429 | 500> = {
  bad_request: 400, unauthorized: 401, quota: 402, locked: 403, not_found: 404, conflict: 409, rate_limited: 429, server: 500,
};

export function createApp(service: GameService, auth: AuthConfig, basePath = '') {
  const app = new Hono<Env>().basePath(basePath);
  app.use('*', cors({ origin: '*', allowHeaders: ['authorization', 'content-type', 'accept-language'], allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] }));

  app.onError((err, c) => {
    if (isServiceError(err)) return c.json({ error: err.message, code: err.code, ...(err.reason ? { reason: err.reason } : {}) }, STATUS[err.code] ?? 500);
    if (err instanceof z.ZodError) return c.json({ error: 'Invalid request.', code: 'bad_request' }, 400);
    console.error('[api]', err);
    return c.json({ error: 'Something went wrong on our side.', code: 'server' }, 500);
  });

  app.notFound((c) => c.json({ error: 'Not found.', code: 'not_found' }, 404));

  app.get('/health', (c) => c.json({ ok: true }));

  // analytics are batched per request and sent when it ends
  app.use('*', async (_c, next) => {
    await next();
    await service.flushAnalytics();
  });

  // RevenueCat authenticates with its own shared secret, not a player session
  app.post('/webhooks/revenuecat', async (c) => {
    const ok = await service.handleRevenueCatWebhook(c.req.header('authorization'), await c.req.json().catch(() => null));
    return ok ? c.json({ ok: true }) : c.json({ error: 'Unauthorized', code: 'unauthorized' }, 401);
  });

  app.use('*', async (c, next) => {
    if (c.req.method === 'OPTIONS' || c.req.path.endsWith('/health') || c.req.path.includes('/webhooks/')) return next();
    const userId = await authenticate(c, auth);
    if (!userId) return c.json({ error: 'Sign in to continue.', code: 'unauthorized' }, 401);
    c.set('userId', userId);
    c.set('locale', localeFromHeader(c.req.header('accept-language')));
    return next();
  });

  const body = async <T extends z.ZodTypeAny>(c: Context, schema: T): Promise<z.infer<T>> => schema.parse(await c.req.json().catch(() => ({})));
  const uid = (c: Context<Env>) => c.get('userId');

  app.get('/cases', async (c) => c.json(await service.listCases(uid(c), c.get('locale'))));
  app.put('/me/locale', async (c) => c.json(await service.setLocale(uid(c), (await body(c, schemas.locale)).locale)));
  app.get('/me', async (c) => c.json(await service.profile(uid(c), c.get('locale'))));
  app.put('/me', async (c) => c.json(await service.rename(uid(c), (await body(c, schemas.rename)).displayName)));
  app.post('/me/entitlement/sync', async (c) => c.json(await service.syncEntitlement(uid(c), await body(c, schemas.sync))));
  app.post('/me/entitlement/dev-reset', async (c) => c.json(await service.devResetPlan(uid(c))));
  app.put('/me/privacy', async (c) => c.json(await service.setAnalyticsOptOut(uid(c), (await body(c, schemas.privacy)).analyticsOptOut)));
  app.post('/events', async (c) => {
    const b = await body(c, schemas.event);
    return c.json(await service.clientEvent(uid(c), b.name, b.props ?? {}));
  });

  app.post('/sessions', async (c) => {
    const b = await body(c, schemas.start);
    return c.json(await service.startSession(uid(c), b.caseId, !!b.restart, b.mode ?? 'solo'));
  });
  app.post('/rooms/join', async (c) => c.json(await service.joinRoom(uid(c), (await body(c, schemas.join)).code)));
  app.get('/sessions/:id/pulse', async (c) => c.json(await service.pulse(uid(c), id.parse(c.req.param('id')))));
  app.post('/sessions/:id/room/lock', async (c) => c.json(await service.lockRoom(uid(c), id.parse(c.req.param('id')), (await body(c, schemas.lock)).locked)));
  app.post('/sessions/:id/room/remove', async (c) => c.json(await service.removePlayer(uid(c), id.parse(c.req.param('id')), (await body(c, schemas.remove)).userId)));
  app.post('/sessions/:id/leave', async (c) => c.json(await service.leave(uid(c), id.parse(c.req.param('id')))));
  // ───────────────────────────── investigation desk (docs/CONTRACT_V2.md)
  const sid = (c: Context<Env>) => id.parse(c.req.param('id'));
  const loc = (c: Context<Env>) => c.get('locale');
  app.get('/sessions/:id/v2', async (c) => c.json(await service.viewV2(uid(c), sid(c), loc(c))));
  app.post('/sessions/:id/v2/travel', async (c) => c.json(await service.travel(uid(c), sid(c), (await body(c, schemas.travel)).locationId, loc(c))));
  app.post('/sessions/:id/v2/inspect', async (c) => c.json(await service.inspectZone(uid(c), sid(c), (await body(c, schemas.inspect)).zoneId, loc(c))));
  app.post('/sessions/:id/v2/probe', async (c) => {
    const b = await body(c, schemas.probe);
    return c.json(await service.probe(uid(c), sid(c), b.locationId, b.tool, b.x, b.y, loc(c)));
  });
  app.post('/sessions/:id/v2/detail', async (c) => {
    const b = await body(c, schemas.detail);
    return c.json(await service.inspectDetail(uid(c), sid(c), b.zoneId, b.detailId, b.tool, loc(c)));
  });
  app.post('/sessions/:id/v2/collect', async (c) => {
    const b = await body(c, schemas.collect);
    return c.json(await service.collectFact(uid(c), sid(c), b.evidenceId, b.key, loc(c)));
  });
  app.post('/sessions/:id/v2/lab', async (c) => c.json(await service.labSubmit(uid(c), sid(c), (await body(c, schemas.labSubmit)).analysisId, loc(c))));
  app.post('/sessions/:id/v2/lab/collect', async (c) => c.json(await service.labCollect(uid(c), sid(c), (await body(c, schemas.labCollect)).analysisId, loc(c))));
  app.post('/sessions/:id/v2/interview', async (c) => c.json(await service.interviewStart(uid(c), sid(c), (await body(c, schemas.suspect)).suspectId, loc(c))));
  app.post('/sessions/:id/v2/interview/leave', async (c) => c.json(await service.interviewLeave(uid(c), sid(c), (await body(c, schemas.suspect)).suspectId, loc(c))));
  app.post('/sessions/:id/v2/topic', async (c) => {
    const b = await body(c, schemas.topic);
    return c.json(await service.openTopic(uid(c), sid(c), b.suspectId, b.topicId, loc(c)));
  });
  app.post('/sessions/:id/v2/press', async (c) => {
    const b = await body(c, schemas.press);
    return c.json(await service.press(uid(c), sid(c), b.suspectId, b.claimId, loc(c)));
  });
  app.post('/sessions/:id/v2/present', async (c) => {
    const b = await body(c, schemas.present);
    return c.json(await service.present(uid(c), sid(c), b.suspectId, b.claimId, b.itemId, loc(c)));
  });
  app.post('/sessions/:id/v2/ask', async (c) => {
    const b = await body(c, schemas.ask);
    return c.json(await service.ask(uid(c), sid(c), b.suspectId, b.text, loc(c)));
  });
  app.post('/sessions/:id/v2/deduce', async (c) => {
    const b = await body(c, schemas.deduce);
    return c.json(await service.deduce(uid(c), sid(c), b.deductionId, { fills: b.fills, order: b.order, outlier: b.outlier }, loc(c)));
  });
  app.post('/sessions/:id/v2/wait', async (c) => c.json(await service.wait(uid(c), sid(c), await body(c, schemas.wait), loc(c))));
  app.post('/sessions/:id/v2/night-choice', async (c) => c.json(await service.nightChoice(uid(c), sid(c), (await body(c, schemas.nightChoice)).optionId, loc(c))));
  app.post('/sessions/:id/v2/hint',async (c) => c.json(await service.hintV2(uid(c), sid(c), loc(c))));
  app.post('/sessions/:id/v2/end-day', async (c) => c.json(await service.endDay(uid(c), sid(c), loc(c))));
  app.post('/sessions/:id/v2/finale', async (c) => c.json(await service.finaleStart(uid(c), sid(c), (await body(c, schemas.finaleStart)).accusedId, loc(c))));
  app.post('/sessions/:id/v2/finale/answer', async (c) => c.json(await service.finaleAnswer(uid(c), sid(c), (await body(c, schemas.finaleAnswer)).itemId, loc(c))));
  // ── wave 5: co-op team (CONTRACT_V2 §14)
  app.post('/sessions/:id/v2/intent', async (c) => {
    const b = await body(c, schemas.intent);
    return c.json(await service.intent(uid(c), sid(c), b.kind, b.target, loc(c)));
  });
  app.post('/sessions/:id/v2/done', async (c) => c.json(await service.doneForToday(uid(c), sid(c), (await body(c, schemas.done)).done, loc(c))));
  app.post('/sessions/:id/v2/share', async (c) => c.json(await service.share(uid(c), sid(c), (await body(c, schemas.share)).itemId, loc(c))));
  app.post('/sessions/:id/v2/draft', async (c) => {
    const b = await body(c, schemas.draft);
    return c.json(await service.draft(uid(c), sid(c), b.deductionId, { fills: b.fills, order: b.order, outlier: b.outlier }, loc(c)));
  });
  app.post('/sessions/:id/v2/draft/clear', async (c) => c.json(await service.clearDraft(uid(c), sid(c), (await body(c, schemas.deduction)).deductionId, loc(c))));
  app.post('/sessions/:id/v2/draft/suggest', async (c) => {
    const b = await body(c, schemas.suggest);
    return c.json(await service.suggest(uid(c), sid(c), b.deductionId, b.blankId, b.value, loc(c)));
  });
  app.post('/sessions/:id/v2/finale/suggest', async (c) => c.json(await service.finaleSuggest(uid(c), sid(c), (await body(c, schemas.finaleSuggest)).itemId, loc(c))));
  app.post('/sessions/:id/v2/handover', async (c) => c.json(await service.handOver(uid(c), sid(c), (await body(c, schemas.handover)).playerId, loc(c))));
  app.post('/sessions/:id/v2/claim-lead', async (c) => c.json(await service.claimLead(uid(c), sid(c), loc(c))));

  return app;
}
