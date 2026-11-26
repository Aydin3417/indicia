// v2 through the HTTP API: a scripted end-to-end Kessler playthrough, co-op, locale, analytics, errors.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { GameService } from '../service.ts';
import { FileStore } from '../store/fileStore.ts';
import { MemoryAnalytics } from '../analytics.ts';
import { createApp } from '../http/app.ts';
import { kessler } from '../cases/kessler.ts';
import { markedFacts, tx } from './i18n.ts';
import { indexOf, shapeCenter } from './v2/state.ts';
import type { PathStep } from './types.ts';
import type { ApiError, InvestigationView, Profile, V2Response } from '../../shared/api.ts';

function setup() {
  const analytics = new MemoryAnalytics();
  const service = new GameService(new FileStore(mkdtempSync(path.join(tmpdir(), 'indicia-v2-'))), { provider: null, priceIn: 0, priceOut: 0 }, { perMinute: 1000, analytics });
  const app = createApp(service, { allowDevAuth: true });
  const call = async <T>(user: string, method: string, url: string, body?: unknown, lang?: string): Promise<{ status: number; json: T }> => {
    const res = await app.request(url, {
      method,
      headers: { authorization: `Bearer dev.${user}`, 'content-type': 'application/json', ...(lang ? { 'accept-language': lang } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: res.status, json: (await res.json()) as T };
  };
  return { service, analytics, call };
}

const HOST = 'host-00000001';
const GUEST = 'guest-0000001';

/** Turn an ideal-path step into the HTTP request a client would send. */
function request(step: PathStep): { url: string; body: unknown }[] {
  switch (step.do) {
    case 'travel': return [{ url: 'travel', body: { locationId: step.to } }];
    case 'inspect': {
      const hit = indexOf(kessler).zones.get(step.zone)!;
      if ((hit.zone.reveal ?? 'visible') === 'visible') return [{ url: 'inspect', body: { zoneId: step.zone } }];
      const [x, y] = shapeCenter(hit.zone.shape);
      return [{ url: 'probe', body: { locationId: hit.locationId, tool: hit.zone.reveal, x, y } }];
    }
    case 'detail': {
      const d = indexOf(kessler).zones.get(step.zone)!.zone.details.find((x) => x.id === step.detail)!;
      return [{ url: 'detail', body: { zoneId: step.zone, detailId: step.detail, tool: d.tool } }];
    }
    case 'collect': {
      const e = kessler.evidence.find((x) => x.id === step.evidence)!;
      let key = '';
      e.body!.forEach((line, i) => markedFacts(tx(line, 'en')).forEach((f, n) => { if (f === step.fact && !key) key = `${i}.${n}`; }));
      return [{ url: 'collect', body: { evidenceId: step.evidence, key } }];
    }
    case 'lab': return [{ url: 'lab', body: { analysisId: step.analysis } }];
    case 'labCollect': return [{ url: 'lab/collect', body: {} }];
    case 'interview': return [{ url: 'interview', body: { suspectId: step.suspect } }];
    case 'leave': return [{ url: 'interview/leave', body: { suspectId: step.suspect } }];
    case 'topic': return [{ url: 'topic', body: { suspectId: step.suspect, topicId: step.topic } }];
    case 'press': return [{ url: 'press', body: { suspectId: step.suspect, claimId: step.claim } }];
    case 'present': return [{ url: 'present', body: { suspectId: step.suspect, claimId: step.claim, itemId: step.item } }];
    case 'deduce':
    case 'wrongDeduce': return [{ url: 'deduce', body: { deductionId: step.deduction, fills: step.fills, order: step.order, outlier: step.outlier } }];
    case 'wrongPresent': return [{ url: 'present', body: { suspectId: step.suspect, claimId: step.claim, itemId: step.item } }];
    case 'nightChoice': return [{ url: 'night-choice', body: { optionId: step.option } }];
    case 'wait': return [{ url: 'wait', body: step.until ? { until: step.until } : { minutes: step.minutes } }];
    case 'endDay': return [{ url: 'end-day', body: {} }];
    case 'finale': return [{ url: 'finale', body: { accusedId: step.accused } }, ...step.answers.map((a) => ({ url: 'finale/answer', body: { itemId: a } }))];
  }
}

test('Kessler end to end through the v2 API: scene → facts → lab → interviews → deductions → finale', async () => {
  const { call, analytics } = setup();
  const start = await call<{ sessionId: string }>(HOST, 'POST', '/sessions', { caseId: 'kessler-workshop' });
  const sid = start.json.sessionId;
  let view = (await call<InvestigationView>(HOST, 'GET', `/sessions/${sid}/v2`)).json;
  assert.equal(view.phase, 'investigating');
  assert.equal(view.clock.day, 1);
  assert.equal(view.clock.timeLabel, '08:00');
  assert.equal(view.map.current, null);
  assert.equal(view.notebook.facts.length, 2);
  assert.equal(view.clock.costs.travel, 30);

  let last: V2Response | undefined;
  const seen = { break: 0, confirmed: 0, labReady: 0, report: 0 };
  for (const step of kessler.v2!.idealPath) {
    for (const r of request(step)) {
      const res = await call<V2Response | ApiError>(HOST, 'POST', `/sessions/${sid}/v2/${r.url}`, r.body);
      assert.equal(res.status, 200, `${JSON.stringify(step)} → ${JSON.stringify(res.json)}`);
      last = res.json as V2Response;
      if (last.event.outcome === 'break') seen.break++;
      if (last.event.outcome === 'confirmed') seen.confirmed++;
      if (last.event.labReady?.length) seen.labReady++;
      if (last.event.report) seen.report++;
    }
  }
  assert.ok(last);
  const result = last.view.result!;
  assert.equal(last.view.phase, 'closed');
  assert.equal(result.outcome, 'confession');
  assert.equal(result.starCount, 3);
  assert.equal(result.roundsWon, 5);
  // the perfect run confirms what the Proof star needs (11 of 13 since wave 4), not every side question
  assert.equal(result.deductionsConfirmed, kessler.v2!.idealPath.filter((s) => s.do === 'deduce').length);
  assert.ok(result.deductionsConfirmed >= result.proofNeeds!.deductions);
  assert.equal(result.crime, 'murder');
  assert.ok(result.debrief.narrative.length > 3, 'the truth is told only now');
  assert.equal(last.view.finale!.confession?.startsWith('He turned his back on me'), true);
  assert.equal(seen.break, kessler.v2!.idealPath.filter((s) => s.do === 'present').length);
  assert.equal(seen.confirmed, kessler.v2!.idealPath.filter((s) => s.do === 'deduce').length);
  assert.ok(seen.labReady >= 1, 'lab results are announced');
  assert.equal(seen.report, 2, 'two day-end reports');
  assert.equal(last.view.reports.length, 2);
  assert.ok(last.view.reports[0].night?.title);
  // wave 4: the night fork after day 1 was offered and answered over HTTP
  assert.equal(last.view.reports[0].fork?.chosen, 'fk-tonight');
  assert.equal(last.view.reports[0].fork?.pending, false);
  // stars come from the server: case list, profile history and rank
  const cases = (await call<{ id: string; bestStars?: number; session?: { stars?: number } }[]>(HOST, 'GET', '/cases')).json;
  const k = cases.find((c) => c.id === 'kessler-workshop')!;
  assert.equal(k.session?.stars, 3);
  assert.equal(k.bestStars, 3);
  const me = (await call<{ stars: number; rank: string; history: { sessionId: string; stars?: number }[] }>(HOST, 'GET', '/me')).json;
  assert.equal(me.stars, 3);
  assert.equal(me.history.find((h) => h.sessionId === sid)?.stars, 3);
  assert.equal(me.rank, 'Junior Detective');
  assert.equal((await call<Profile>(HOST, 'GET', '/me')).json.stats.correctAccusations, 1);
  // closed: no more actions
  const after = await call<ApiError>(HOST, 'POST', `/sessions/${sid}/v2/travel`, { locationId: 'loc-office' });
  assert.equal(after.status, 409);
  assert.equal(after.json.reason, 'phase');
  // analytics: new events, never the typed text
  const names = new Set(analytics.events.map((e) => e.event));
  for (const n of ['location_travelled', 'zone_inspected', 'detail_found', 'fact_collected', 'lab_submitted', 'lab_collected', 'interview_started', 'topic_opened', 'claim_presented', 'deduction_filed', 'day_ended', 'finale_started', 'finale_round', 'finale_finished']) {
    assert.ok(names.has(n), `analytics event ${n}`);
  }
  const fin = analytics.events.find((e) => e.event === 'finale_finished')!;
  assert.equal(fin.props.outcome, 'confession');
  assert.equal(fin.props.stars, 3);
});

test('errors carry a machine-readable reason and cost nothing', async () => {
  const { call } = setup();
  const sid = (await call<{ sessionId: string }>(HOST, 'POST', '/sessions', { caseId: 'kessler-workshop' })).json.sessionId;
  let r = await call<ApiError>(HOST, 'POST', `/sessions/${sid}/v2/interview`, { suspectId: 'miriam' });
  assert.equal(r.status, 409);
  assert.equal(r.json.reason, 'unavailable');
  r = await call<ApiError>(HOST, 'POST', `/sessions/${sid}/v2/inspect`, { zoneId: 'z-body' });
  assert.equal(r.json.reason, 'not_here');
  r = await call<ApiError>(HOST, 'POST', `/sessions/${sid}/v2/topic`, { suspectId: 'clara', topicId: 't-evening' });
  assert.equal(r.json.reason, 'not_open');
  r = await call<ApiError>(HOST, 'POST', `/sessions/${sid}/v2/deduce`, { deductionId: 'd-motive', fills: { who: 'clara' } });
  assert.equal(r.status, 403);
  assert.equal(r.json.reason, 'locked');
  r = await call<ApiError>(HOST, 'POST', `/sessions/${sid}/v2/probe`, { locationId: 'loc-workshop', tool: 'torch', x: 0.5, y: 0.5 });
  assert.equal(r.status, 400, 'schema rejects a torch probe');
  const v = (await call<InvestigationView>(HOST, 'GET', `/sessions/${sid}/v2`)).json;
  assert.equal(v.clock.spent, 0);
});

test('free questions route by keywords, cost time and count towards the daily allowance', async () => {
  const { call, analytics } = setup();
  const sid = (await call<{ sessionId: string }>(HOST, 'POST', '/sessions', { caseId: 'kessler-workshop' })).json.sessionId;
  await call(HOST, 'POST', `/sessions/${sid}/v2/interview`, { suspectId: 'clara' });
  let r = (await call<V2Response>(HOST, 'POST', `/sessions/${sid}/v2/ask`, { suspectId: 'clara', text: 'Where were you on Thursday evening?' })).json;
  assert.equal(r.event.outcome, 'opened');
  assert.equal(r.event.cost, 15);
  assert.match(r.event.line!.text, /home/i);
  r = (await call<V2Response>(HOST, 'POST', `/sessions/${sid}/v2/ask`, { suspectId: 'clara', text: 'Where were you that night, again?' })).json;
  assert.equal(r.event.outcome, 'repeat');
  r = (await call<V2Response>(HOST, 'POST', `/sessions/${sid}/v2/ask`, { suspectId: 'clara', text: 'What is the capital of Peru?' })).json;
  assert.equal(r.event.outcome, 'deflect');
  const log = r.view.suspects.find((s) => s.id === 'clara')!.log;
  assert.ok(log.some((l) => l.from === 'player' && l.text === 'What is the capital of Peru?'), 'the transcript keeps the question');
  assert.equal((await call<Profile>(HOST, 'GET', '/me')).json.usage.questionsToday, 3);
  for (const e of analytics.events) assert.ok(!JSON.stringify(e.props).includes('Peru'), 'typed text never reaches analytics');
});

test('locale: Accept-Language picks the language; the profile setting wins', async () => {
  const { call } = setup();
  const sid = (await call<{ sessionId: string }>(HOST, 'POST', '/sessions', { caseId: 'kessler-workshop' })).json.sessionId;
  let v = (await call<InvestigationView>(HOST, 'GET', `/sessions/${sid}/v2`, undefined, 'tr-TR,tr;q=0.9')).json;
  assert.equal(v.locale, 'tr');
  assert.equal(v.map.currentName, 'Emniyet');
  const err = await call<ApiError>(HOST, 'POST', `/sessions/${sid}/v2/interview`, { suspectId: 'miriam' }, 'tr');
  assert.equal(err.json.error, 'Bu saatte görüşmeye müsait değil.');
  v = (await call<InvestigationView>(HOST, 'GET', `/sessions/${sid}/v2`, undefined, 'en-GB')).json;
  assert.equal(v.locale, 'en');
  const me = await call<Profile>(HOST, 'PUT', '/me/locale', { locale: 'tr' });
  assert.equal(me.json.locale, 'tr');
  v = (await call<InvestigationView>(HOST, 'GET', `/sessions/${sid}/v2`, undefined, 'en-GB')).json;
  assert.equal(v.locale, 'tr', 'the profile setting overrides the device');
  await call<Profile>(HOST, 'PUT', '/me/locale', { locale: null });
  v = (await call<InvestigationView>(HOST, 'GET', `/sessions/${sid}/v2`)).json;
  assert.equal(v.locale, 'en');
});

test('co-op: own clocks, one notebook, version bumps, localised activity, lead-only day end and finale', async () => {
  const { call, service } = setup();
  await service.rename(`dev-${HOST}`, 'Aksoy');
  await service.rename(`dev-${GUEST}`, 'Demir');
  const { sessionId: sid, roomCode } = (await call<{ sessionId: string; roomCode: string }>(HOST, 'POST', '/sessions', { caseId: 'kessler-workshop', mode: 'coop' })).json;
  await call(GUEST, 'POST', '/rooms/join', { code: roomCode });
  const v0 = (await call<{ version: number }>(HOST, 'GET', `/sessions/${sid}/pulse`)).json.version;
  await call(GUEST, 'POST', `/sessions/${sid}/v2/travel`, { locationId: 'loc-workshop' });
  await call(GUEST, 'POST', `/sessions/${sid}/v2/inspect`, { zoneId: 'z-body' });
  const v1 = (await call<{ version: number }>(HOST, 'GET', `/sessions/${sid}/pulse`)).json.version;
  assert.ok(v1 >= v0 + 2);
  const hostView = (await call<InvestigationView>(HOST, 'GET', `/sessions/${sid}/v2`, undefined, 'tr')).json;
  // wave 5: each investigator has their own clock; the team's spend adds up
  assert.equal(hostView.clock.spent, 50, 'the team spent 50 minutes');
  assert.equal(hostView.clock.minute, 0, 'the host has not moved');
  assert.equal(hostView.clock.budget?.perPlayer, 290, 'two investigators: 290 minutes each');
  assert.equal(hostView.team?.members.find((m) => m.name === 'Demir')?.timeLabel, '08:50');
  assert.ok(hostView.notebook.evidence.some((e) => e.id === 'ev-body'), 'what one finds, all hold');
  assert.ok(hostView.room!.activity.some((a) => a.actor === 'Demir' && a.text.includes('inceledi')), JSON.stringify(hostView.room!.activity));
  const guestView = (await call<InvestigationView>(GUEST, 'GET', `/sessions/${sid}/v2`)).json;
  assert.ok(guestView.room!.activity.some((a) => a.actor === 'Demir' && a.text.startsWith('inspected')));
  // simultaneous actions are serialised: both land, the clock adds up
  await call(HOST, 'POST', `/sessions/${sid}/v2/travel`, { locationId: 'loc-workshop' });
  await Promise.all([
    call(HOST, 'POST', `/sessions/${sid}/v2/inspect`, { zoneId: 'z-toolwall' }),
    call(GUEST, 'POST', `/sessions/${sid}/v2/inspect`, { zoneId: 'z-bench' }),
  ]);
  assert.equal((await call<InvestigationView>(HOST, 'GET', `/sessions/${sid}/v2`)).json.clock.spent, 120);
  // only the lead ends the day or accuses
  let r = await call<ApiError>(GUEST, 'POST', `/sessions/${sid}/v2/end-day`, {});
  assert.equal(r.status, 403);
  assert.equal(r.json.reason, 'not_host');
  r = await call<ApiError>(GUEST, 'POST', `/sessions/${sid}/v2/finale`, { accusedId: 'clara' });
  assert.equal(r.json.reason, 'not_host');
  const end = (await call<V2Response>(HOST, 'POST', `/sessions/${sid}/v2/end-day`, {})).json;
  assert.equal(end.event.report!.day, 1);
  assert.equal(end.view.clock.day, 2);
  // "new" marks are per viewer
  const g2 = (await call<InvestigationView>(GUEST, 'GET', `/sessions/${sid}/v2`)).json;
  assert.ok(g2.notebook.evidence.some((e) => e.id === 'ev-mallet' && e.isNew));
  const g3 = (await call<InvestigationView>(GUEST, 'GET', `/sessions/${sid}/v2`)).json;
  assert.ok(g3.notebook.evidence.every((e) => !e.isNew));
});

test('v1 endpoints are gone; the case list flags the tutorial and localises ranks', async () => {
  const { call } = setup();
  const sid = (await call<{ sessionId: string }>(HOST, 'POST', '/sessions', { caseId: 'kessler-workshop' })).json.sessionId;
  for (const [method, url] of [['GET', `/sessions/${sid}`], ['POST', `/sessions/${sid}/examine`], ['POST', `/sessions/${sid}/interrogate`], ['POST', `/sessions/${sid}/accuse`]] as const) {
    assert.equal((await call(HOST, method, url, method === 'POST' ? {} : undefined)).status, 404, url);
  }
  const cases = (await call<{ id: string; title: string; tutorial?: boolean }[]>(HOST, 'GET', '/cases')).json;
  assert.equal(cases[0].title, 'The Kessler Workshop');
  assert.deepEqual(cases.filter((c) => c.tutorial).map((c) => c.id), ['first-watch']);
  const tr = (await call<{ rank: string; nextRank?: { name: string; needed: number } }>(HOST, 'GET', '/me', undefined, 'tr')).json;
  assert.equal(tr.rank, 'Stajyer Müfettiş');
  assert.deepEqual(tr.nextRank, { name: 'Komiser Yardımcısı', needed: 2 });
});
