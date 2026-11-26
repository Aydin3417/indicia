import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { GameService, type ServiceOptions } from '../service.ts';
import { FileStore } from '../store/fileStore.ts';
import { MemoryAnalytics } from '../analytics.ts';
import type { GatewayConfig, Provider } from '../ai/gateway.ts';

const U = 'dev-buyer-000001';
const SECRET = 'whsec_test_123';
const offline: GatewayConfig = { provider: null, priceIn: 0, priceOut: 0 };

function make(opts: Partial<ServiceOptions> = {}, ai: GatewayConfig = offline) {
  const analytics = new MemoryAnalytics();
  const s = new GameService(new FileStore(mkdtempSync(path.join(tmpdir(), 'indicia-bill-'))), ai, {
    perMinute: 1000,
    analytics,
    billing: { entitlementId: 'plus', allowDevPurchases: false, webhookAuth: SECRET },
    ...opts,
  });
  return { s, analytics };
}

const hook = (type: string, extra: Record<string, unknown> = {}) => ({
  event: { type, app_user_id: U, entitlement_ids: ['plus'], product_id: 'indicia_plus_monthly', expiration_at_ms: Date.now() + 30 * 86400_000, ...extra },
});

test('webhooks grant and end Plus; forged ones are refused', async () => {
  const { s } = make();
  assert.equal(await s.handleRevenueCatWebhook('Bearer nope', hook('INITIAL_PURCHASE')), false);
  assert.equal(await s.handleRevenueCatWebhook(undefined, hook('INITIAL_PURCHASE')), false);
  assert.equal((await s.profile(U)).plan, 'free');

  assert.equal(await s.handleRevenueCatWebhook(`Bearer ${SECRET}`, hook('INITIAL_PURCHASE')), true);
  let me = await s.profile(U);
  assert.equal(me.plan, 'plus');
  assert.equal(me.usage.dailyLimit, 400);

  // cancelling keeps access until the period ends
  await s.handleRevenueCatWebhook(SECRET, hook('CANCELLATION'));
  assert.equal((await s.profile(U)).plan, 'plus');
  // an unrelated entitlement does nothing
  await s.handleRevenueCatWebhook(SECRET, hook('EXPIRATION', { entitlement_ids: ['other'] }));
  assert.equal((await s.profile(U)).plan, 'plus');

  await s.handleRevenueCatWebhook(SECRET, hook('EXPIRATION'));
  me = await s.profile(U);
  assert.equal(me.plan, 'free');
  assert.equal(me.usage.dailyLimit, 80);
});

test('a lapsed expiry date means free, even without a webhook', async () => {
  const { s } = make();
  await s.handleRevenueCatWebhook(SECRET, hook('RENEWAL', { expiration_at_ms: Date.now() - 1000 }));
  assert.equal((await s.profile(U)).plan, 'free');
});

test('after a purchase the server asks RevenueCat, not the app', async () => {
  const { s, analytics } = make({ billing: { entitlementId: 'plus', allowDevPurchases: false, revenueCatSecret: 'sk_test' } });
  const realFetch = globalThis.fetch;
  let asked = '';
  let answer: unknown = { subscriber: { entitlements: { plus: { expires_date: new Date(Date.now() + 86400_000).toISOString(), product_identifier: 'indicia_plus_annual' } } } };
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    asked = `${url} ${(init?.headers as Record<string, string>).authorization}`;
    return new Response(JSON.stringify(answer), { status: 200 });
  }) as typeof fetch;
  try {
    const me = await s.syncEntitlement(U, { devGrant: true }); // devGrant is ignored when the store is configured
    assert.equal(me.plan, 'plus');
    assert.match(asked, /api\.revenuecat\.com\/v1\/subscribers\/dev-buyer-000001 Bearer sk_test/);
    assert.ok(analytics.events.some((e) => e.event === 'purchase_verified' && e.props.product === 'indicia_plus_annual'));

    answer = { subscriber: { entitlements: { plus: { expires_date: new Date(Date.now() - 1000).toISOString() } } } };
    assert.equal((await s.syncEntitlement(U)).plan, 'free');

    globalThis.fetch = (async () => new Response('down', { status: 503 })) as typeof fetch;
    await assert.rejects(() => s.syncEntitlement(U), /Could not reach the store/);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test('the app cannot grant itself Plus; dev test purchases only in development', async () => {
  const prod = make().s;
  await assert.rejects(() => prod.syncEntitlement(U, { devGrant: true }), /not available/);
  await assert.rejects(() => prod.devResetPlan(U), /Not available/);
  assert.equal((await prod.profile(U)).billing.devPurchases, false);

  const dev = make({ billing: { entitlementId: 'plus', allowDevPurchases: true } }).s;
  assert.equal((await dev.syncEntitlement(U, { devGrant: true })).plan, 'plus');
  assert.equal((await dev.devResetPlan(U)).plan, 'free');
});

test('analytics carry what happened, never what was typed, and respect opt-out', async () => {
  const { s, analytics } = make();
  const { sessionId } = await s.startSession(U, 'kessler-workshop', false);
  await s.travel(U, sessionId, 'loc-workshop');
  await s.inspectZone(U, sessionId, 'z-body');
  await s.interviewStart(U, sessionId, 'jonas');
  await s.ask(U, sessionId, 'jonas', 'SECRET-PHRASE where were you on thursday night');
  const names = analytics.events.map((e) => e.event);
  for (const n of ['case_started', 'location_travelled', 'zone_inspected', 'interview_started', 'free_question']) assert.ok(names.includes(n), n);
  assert.ok(!JSON.stringify(analytics.events).includes('SECRET-PHRASE'));
  const q = analytics.events.find((e) => e.event === 'free_question')!;
  assert.equal(q.props.suspect, 'jonas');

  await assert.rejects(() => s.clientEvent(U, 'anything_goes'), /Unknown event/);
  await s.clientEvent(U, 'paywall_viewed', { source: 'quota', 'Bad Key': 'x', note: 'y'.repeat(200) });
  const pv = analytics.events.find((e) => e.event === 'paywall_viewed')!;
  assert.equal(pv.props.source, 'quota');
  assert.ok(!('Bad Key' in pv.props));
  assert.equal(String(pv.props.note).length, 48);

  await s.setAnalyticsOptOut(U, true);
  const before = analytics.events.length;
  assert.equal(analytics.events.at(-1)?.event, 'analytics_opted_out');
  await s.inspectZone(U, sessionId, 'z-ladder');
  await s.clientEvent(U, 'paywall_viewed');
  assert.equal(analytics.events.length, before, 'nothing after opting out');
  assert.equal((await s.profile(U)).analyticsOptOut, true);
});

test('past the daily AI budget free questions are routed by keywords, never by the model', async () => {
  let calls = 0;
  const provider: Provider = {
    name: 'fake',
    model: 'fake-1',
    async json() {
      calls += 1;
      // every call "costs" one million input tokens
      return { data: { topicIds: [], tone: 'neutral' }, inputTokens: 1_000_000, outputTokens: 0 };
    },
  };
  const { s } = make({ aiDailyCap: { free: 0.15, plus: 1 } }, { provider, priceIn: 0.1, priceOut: 0 });
  const { sessionId } = await s.startSession(U, 'kessler-workshop', false);
  await s.interviewStart(U, sessionId, 'jonas');
  await s.ask(U, sessionId, 'jonas', 'Where were you?');
  await s.ask(U, sessionId, 'jonas', 'And after that?');
  assert.equal(calls, 2, 'two classifications, $0.20 spent → over the $0.15 cap');
  const r = await s.ask(U, sessionId, 'jonas', 'Tell me about the copy.');
  assert.equal(calls, 2, 'no further model calls today');
  assert.ok(r.event.line?.text.length, 'the suspect still answers (authored line)');
  assert.equal((await s.profile(U)).usage.aiPhrasingToday, false);
});

test('the daily free-question allowance refuses with reason quota (the app opens the paywall)', async () => {
  const { s } = make();
  const { sessionId } = await s.startSession(U, 'kessler-workshop', false);
  await s.interviewStart(U, sessionId, 'jonas');
  const store = (s as unknown as { store: { incrementQuestions(u: string, d: string): Promise<void> } }).store;
  const day = new Date().toISOString().slice(0, 10);
  for (let i = 0; i < 80; i++) await store.incrementQuestions(U, day);
  await assert.rejects(() => s.ask(U, sessionId, 'jonas', 'Where were you?', 'tr'), (e: { code?: string; reason?: string; message: string }) =>
    e.code === 'quota' && e.reason === 'quota' && e.message.includes('Detective Plus'));
});
