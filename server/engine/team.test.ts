// Wave 5 — deep co-op: per-player clocks, intents, held interviews, drafts and suggestions, finale suggestions,
// private notes and reading them out, members leaving, hand-over, solo unchanged, validator reachability for teams.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { GameService, ServiceError } from '../service.ts';
import { FileStore } from '../store/fileStore.ts';
import { MemoryAnalytics } from '../analytics.ts';
import { kessler } from '../cases/kessler.ts';
import { newSessionState, type SessionState } from './state.ts';
import * as A from './v2/actions.ts';
import * as T from './v2/team.ts';
import { asPlayer, budgetFor } from './v2/coop.ts';
import { projectV2 } from './v2/projection.ts';
import { exhaustive, runPath, validateV2 } from './v2/validate.ts';
import { ActionError } from './actions.ts';
import type { CaseDefinition } from './types.ts';

const HOST = 'dev-host-000001';
const GUEST = 'dev-guest-00001';
const THIRD = 'dev-third-00001';

function svc() {
  const analytics = new MemoryAnalytics();
  const s = new GameService(new FileStore(mkdtempSync(path.join(tmpdir(), 'indicia-team-'))), { provider: null, priceIn: 0, priceOut: 0 }, { perMinute: 1000, analytics });
  return { s, analytics };
}

async function room(players = 2) {
  const { s, analytics } = svc();
  await s.rename(HOST, 'Aksoy');
  await s.rename(GUEST, 'Demir');
  await s.rename(THIRD, 'Kaya');
  const { sessionId, roomCode } = await s.startSession(HOST, 'kessler-workshop', false, 'coop');
  if (players >= 2) await s.joinRoom(GUEST, roomCode!);
  if (players >= 3) await s.joinRoom(THIRD, roomCode!);
  return { s, analytics, sessionId, code: roomCode! };
}

const reason = async (p: Promise<unknown>) => {
  try { await p; } catch (e) { if (e instanceof ServiceError) return e.reason ?? e.code; throw e; }
  return 'ok';
};

/** engine-level co-op state with two members (no service) */
function coopState(def: CaseDefinition = kessler): SessionState {
  const st = newSessionState(def, 'h', 0, { id: 'a', name: 'Aksoy' }, 'coop');
  st.players.b = { name: 'Demir', role: 'investigator', joinedAt: 1 };
  return st;
}
const as = <R>(st: SessionState, id: string, fn: (ctx: A.Ctx) => R): R =>
  asPlayer(kessler, st, id, () => fn({ def: kessler, st, now: 1, locale: 'en', actorId: id }));
const refusal = (fn: () => unknown) => {
  try { fn(); } catch (e) { if (e instanceof ActionError) return e.reason; throw e; }
  return 'ok';
};

// ───────────────────────────── per-player clocks

test('co-op: each investigator has their own clock, place and budget', async () => {
  const { s, sessionId } = await room();
  await s.travel(HOST, sessionId, 'loc-workshop');
  await s.inspectZone(HOST, sessionId, 'z-body');
  const g = await s.viewV2(GUEST, sessionId);
  assert.equal(g.clock.minute, 0, 'the guest has not moved');
  assert.equal(g.clock.timeLabel, '08:00');
  assert.equal(g.map.current, null, 'the guest is still at the station');
  assert.equal(g.clock.budget?.perPlayer, budgetFor(kessler.v2!, 2));
  assert.equal(g.clock.remainingToday, 290);
  assert.ok(g.notebook.evidence.some((e) => e.id === 'ev-body'), 'findings are shared');
  // scene actions need you there
  assert.equal(await reason(s.inspectZone(GUEST, sessionId, 'z-ladder')), 'not_here');
  const h = await s.viewV2(HOST, sessionId);
  assert.equal(h.clock.minute, 50);
  assert.equal(h.clock.remainingToday, 240);
  const me = h.team!.members.find((m) => m.isYou)!;
  assert.equal(me.locationName, 'Workshop');
  assert.equal(h.team!.members.find((m) => m.name === 'Demir')?.locationName, 'Station');
  // the guest goes elsewhere at the same time
  await s.travel(GUEST, sessionId, 'loc-office');
  const h2 = await s.viewV2(HOST, sessionId);
  assert.equal(h2.map.current, 'loc-workshop');
  assert.deepEqual(h2.map.places.find((p) => p.id === 'loc-office')?.team, [{ id: GUEST, name: 'Demir', status: 'here' }]);
});

test('co-op: the budget, not the calendar, runs out; waiting is free; three players get less each', () => {
  const st = coopState();
  as(st, 'a', (ctx) => A.travel(ctx, 'loc-workshop'));
  st.v2!.team!.clocks.a.used = 280; // 10 left of 290
  assert.equal(refusal(() => as(st, 'a', (ctx) => A.inspect(ctx, 'z-body'))), 'no_time', 'over budget though the calendar says 08:30');
  assert.equal(st.v2!.team!.clocks.a.minute, 30, 'a refusal costs nothing');
  // waiting moves only the calendar
  const e = as(st, 'a', (ctx) => A.wait(ctx, { minutes: 60 }));
  assert.equal(e.cost, 0);
  assert.equal(st.v2!.team!.clocks.a.minute, 90);
  assert.equal(st.v2!.team!.clocks.a.used, 280);
  assert.equal(st.v2!.team!.clocks.b?.minute ?? 0, 0, 'the other clock never moved');
  assert.ok(budgetFor(kessler.v2!, 3) < budgetFor(kessler.v2!, 2) && budgetFor(kessler.v2!, 2) < kessler.v2!.clock.minutesPerDay);
  assert.ok(budgetFor(kessler.v2!, 2) * 2 > kessler.v2!.clock.minutesPerDay, 'a team that splits up has more than one investigator');
});

test('co-op: the day ends when the lead ends it, or by itself once everyone is done', async () => {
  const { s, sessionId } = await room();
  assert.equal(await reason(s.endDay(GUEST, sessionId)), 'not_host');
  await s.viewV2(GUEST, sessionId); // the guest is here (online), so the team waits for them too
  await s.travel(HOST, sessionId, 'loc-workshop');
  const d1 = await s.doneForToday(HOST, sessionId, true);
  assert.equal(d1.view.clock.day, 1, 'one member done is not everyone');
  assert.equal(d1.view.team!.members.find((m) => m.isYou)?.done, true);
  const d2 = await s.doneForToday(GUEST, sessionId, true);
  assert.equal(d2.view.clock.day, 2, 'everyone done → next morning');
  assert.equal(d2.event.dayEnded?.day, 1);
  assert.ok(d2.event.dayEnded!.unusedMinutes >= 290 + 260 - 1);
  assert.equal(d2.view.clock.minute, 0);
  assert.equal(d2.view.team!.members.every((m) => !m.done), true, 'fresh morning');
  // M's request: the night event's id travels with the report
  assert.ok(d2.view.reports[0].night?.id, JSON.stringify(d2.view.reports[0].night));
});

// ───────────────────────────── intents

test('co-op: intents show on the map, the people list and the team; arriving clears them', async () => {
  const { s, sessionId } = await room();
  await s.intent(GUEST, sessionId, 'go', 'loc-workshop');
  await s.intent(HOST, sessionId, 'interview', 'jonas');
  const h = await s.viewV2(HOST, sessionId);
  assert.deepEqual(h.map.places.find((p) => p.id === 'loc-workshop')?.team, [{ id: GUEST, name: 'Demir', status: 'heading' }]);
  assert.equal(h.team!.members.find((m) => m.name === 'Demir')?.intent?.label, 'Workshop');
  const g = await s.viewV2(GUEST, sessionId);
  assert.deepEqual(g.suspects.find((x) => x.id === 'jonas')?.team, [{ id: HOST, name: 'Aksoy', status: 'heading' }]);
  assert.ok(g.room!.activity.some((a) => a.text === 'is heading to Workshop' && a.actor === 'Demir'));
  const tr = await s.viewV2(HOST, sessionId, 'tr');
  assert.ok(tr.room!.activity.some((a) => a.text === 'şuraya gidiyor: Atölye'), JSON.stringify(tr.room!.activity));
  await s.travel(GUEST, sessionId, 'loc-workshop');
  const h2 = await s.viewV2(HOST, sessionId);
  assert.equal(h2.team!.members.find((m) => m.name === 'Demir')?.intent, undefined, 'arrived');
  assert.deepEqual(h2.map.places.find((p) => p.id === 'loc-workshop')?.team, [{ id: GUEST, name: 'Demir', status: 'here' }]);
  assert.equal(await reason(s.intent(GUEST, sessionId, 'go', 'loc-nowhere')), 'locked');
  await s.intent(HOST, sessionId, null, undefined);
  assert.equal((await s.viewV2(GUEST, sessionId)).team!.members.find((m) => m.name === 'Aksoy')?.intent, undefined);
});

test('co-op: an interview is held by whoever opened it; the others follow but cannot ask', async () => {
  const { s, sessionId } = await room();
  await s.interviewStart(GUEST, sessionId, 'jonas');
  const h = await s.viewV2(HOST, sessionId);
  const jonas = h.suspects.find((x) => x.id === 'jonas')!;
  assert.deepEqual(jonas.interview.heldBy, { id: GUEST, name: 'Demir', you: false });
  assert.deepEqual(jonas.team, [{ id: GUEST, name: 'Demir', status: 'questioning' }]);
  const topic = jonas.topics.find((t) => t.state === 'available')!;
  assert.equal(await reason(s.openTopic(HOST, sessionId, 'jonas', topic.id)), 'held');
  assert.equal(await reason(s.interviewLeave(HOST, sessionId, 'jonas')), 'held');
  assert.equal((await s.viewV2(HOST, sessionId)).clock.minute, 0, 'refusals are free');
  // the host questions someone else meanwhile; the guest holds one interview at a time
  await s.interviewStart(HOST, sessionId, 'clara');
  await s.interviewStart(GUEST, sessionId, 'leo').catch(() => undefined); // Leo may be at school: either way Jonas stays or is left
  await s.interviewLeave(GUEST, sessionId, 'jonas');
  await s.interviewStart(HOST, sessionId, 'jonas');
  const v = await s.viewV2(GUEST, sessionId);
  assert.equal(v.suspects.find((x) => x.id === 'jonas')!.interview.heldBy?.name, 'Aksoy');
  assert.equal(v.suspects.find((x) => x.id === 'clara')!.interview.open, false, 'starting Jonas left Clara');
});

// ───────────────────────────── drafts and suggestions

test('co-op: a deduction draft is shared, teammates suggest, anyone files', async () => {
  const { s, sessionId } = await room();
  await s.travel(GUEST, sessionId, 'loc-workshop');
  await s.inspectZone(GUEST, sessionId, 'z-body');
  await s.inspectZone(GUEST, sessionId, 'z-ladder');
  await s.inspectDetail(GUEST, sessionId, 'z-ladder', 'd-rungs', kessler.v2!.scenes.flatMap((x) => x.zones).find((z) => z.id === 'z-ladder')!.details.find((d) => d.id === 'd-rungs')!.tool);
  assert.equal(await reason(s.draft(GUEST, sessionId, 'd-not-fall', { fills: { proof: 'f-nope' } })), 'not_owned');
  const saved = await s.draft(GUEST, sessionId, 'd-not-fall', { fills: { proof: 'f-rungs-clean' } });
  assert.equal(saved.event.cost, 0);
  const h = await s.viewV2(HOST, sessionId);
  const d = h.deductions.find((x) => x.id === 'd-not-fall')!;
  assert.equal(d.status, 'open', 'a draft is not a filing');
  assert.equal(d.draft?.by.name, 'Demir');
  assert.deepEqual(d.draft?.fills.map((f) => f.value), ['f-rungs-clean']);
  assert.ok(d.draft!.fills[0].label.length > 5);
  await s.suggest(HOST, sessionId, 'd-not-fall', 'proof', 'f-rungs-clean');
  const g = (await s.viewV2(GUEST, sessionId)).deductions.find((x) => x.id === 'd-not-fall')!;
  assert.equal(g.draft?.suggestions[0]?.by.name, 'Aksoy');
  // filing stays a deliberate act — and anyone may do it (the host, who did not draft it)
  const filed = await s.deduce(HOST, sessionId, 'd-not-fall', { fills: { proof: 'f-rungs-clean' } });
  assert.equal(filed.event.outcome, 'confirmed');
  assert.equal(filed.view.deductions.find((x) => x.id === 'd-not-fall')?.draft, undefined, 'the draft goes once filed');
  assert.equal(await reason(s.draft(GUEST, sessionId, 'd-not-fall', { fills: { proof: 'f-rungs-clean' } })), 'already');
});

// ───────────────────────────── the finale with the team

test('co-op: teammates suggest a chip for the round; the lead sees who; only the lead answers', async () => {
  const { s, sessionId } = await room();
  assert.equal(await reason(s.finaleSuggest(GUEST, sessionId, 'f-fobs')), 'phase');
  await s.finaleStart(HOST, sessionId, 'clara');
  await s.finaleSuggest(GUEST, sessionId, 'f-fobs');
  await s.finaleSuggest(GUEST, sessionId, 'f-camera'); // replaces the guest's own suggestion for this round
  const h = await s.viewV2(HOST, sessionId);
  assert.deepEqual(h.finale?.suggestions?.map((x) => [x.by.name, x.itemId]), [['Demir', 'f-camera']]);
  assert.ok(h.finale!.suggestions![0].label.length > 5);
  assert.equal(await reason(s.finaleAnswer(GUEST, sessionId, 'f-camera')), 'not_host');
  assert.equal(await reason(s.finaleSuggest(GUEST, sessionId, 'f-not-held')), 'not_owned');
  // a new round starts with no suggestions
  await s.finaleAnswer(HOST, sessionId, 'f-camera');
  await s.finaleAnswer(HOST, sessionId, 'f-camera');
  assert.deepEqual((await s.viewV2(HOST, sessionId)).finale?.suggestions, []);
});

// ───────────────────────────── private notes

test('co-op: the bank record goes to whoever visits the bank, until they read it out', () => {
  const st = coopState();
  const s = st.v2!;
  // open the bank (the diary line) for the test
  s.facts['f-diary-bank'] = { day: 1, minute: 0, seq: 1, src: { type: 'document', ref: 'ev-diary' } };
  as(st, 'b', (ctx) => A.travel(ctx, 'loc-bank'));
  as(st, 'b', (ctx) => A.inspect(ctx, 'z-bk-file'));
  const e = as(st, 'b', (ctx) => A.detail(ctx, 'z-bk-file', 'd-bk-pages'));
  assert.deepEqual(e.newFacts, ['f-bank-papers'], 'the finder is told');
  assert.ok(!('f-bank-papers' in s.facts), 'the team does not have it');
  const mine = projectV2(kessler, st, 'x', 'b');
  const theirs = projectV2(kessler, st, 'x', 'a');
  assert.equal(mine.notebook.facts.find((f) => f.id === 'f-bank-papers')?.private, true);
  assert.ok(!mine.chips.facts.some((c) => c.id === 'f-bank-papers'), 'not a chip until read out');
  assert.ok(!theirs.notebook.facts.some((f) => f.id === 'f-bank-papers'));
  assert.equal(theirs.team!.members.find((m) => m.id === 'b')?.privateNotes, 1, 'the team sees that Demir holds something');
  assert.equal(theirs.map.places.find((p) => p.id === 'loc-bank')?.private, true);
  // using it before reading it out is refused, free
  as(st, 'b', (ctx) => A.inspect(ctx, 'z-bk-ledger'));
  as(st, 'b', (ctx) => A.detail(ctx, 'z-bk-ledger', 'd-bk-slip'));
  assert.ok(!projectV2(kessler, st, 'x', 'a').deductions.some((d) => d.id === 'd-money'), 'a question that needs it stays hidden from the team');
  st.evidence['ev-body'] = 1; // makes "Not a fall" visible for the test
  assert.equal(refusal(() => as(st, 'b', (ctx) => T.draft(ctx, 'd-not-fall', { fills: { proof: 'f-bank-papers' } }))), 'private');
  // read one out
  const r = as(st, 'b', (ctx) => T.share(ctx, 'f-bank-papers'));
  assert.deepEqual(r.newFacts, ['f-bank-papers']);
  assert.ok('f-bank-papers' in s.facts);
  const after = projectV2(kessler, st, 'x', 'a');
  assert.equal(after.notebook.facts.find((f) => f.id === 'f-bank-papers')?.isNew, true);
  assert.equal(after.notebook.facts.find((f) => f.id === 'f-bank-papers')?.private, undefined);
  assert.equal(after.team!.members.find((m) => m.id === 'b')?.privateNotes, 1, 'the slip is still private');
  // read the rest out → the question appears for everyone
  const rest = as(st, 'b', (ctx) => A.run(ctx, () => T.share(ctx)));
  assert.deepEqual(rest.newFacts, ['f-loan-repaid']);
  assert.ok(rest.newDeductions?.includes('d-money'));
  assert.equal(refusal(() => as(st, 'b', (ctx) => T.share(ctx, 'f-loan-repaid'))), 'not_owned');
});

test('co-op: a leaving member leaves their notes on the desk; the interview they held closes', async () => {
  const st = coopState();
  st.v2!.facts['f-diary-bank'] = { day: 1, minute: 0, seq: 1, src: { type: 'document', ref: 'ev-diary' } };
  as(st, 'b', (ctx) => A.travel(ctx, 'loc-bank'));
  as(st, 'b', (ctx) => A.inspect(ctx, 'z-bk-file'));
  as(st, 'b', (ctx) => A.detail(ctx, 'z-bk-file', 'd-bk-pages'));
  as(st, 'b', (ctx) => A.interviewStart(ctx, 'jonas'));
  const shared = T.memberLeaves(kessler, st, 'b', 5);
  delete st.players.b;
  assert.equal(shared, 1);
  assert.ok('f-bank-papers' in st.v2!.facts);
  assert.equal(st.v2!.interviews.jonas.open, false);
  assert.equal(st.v2!.team!.clocks.b, undefined);
  // the minutes the leaver spent stay spent
  assert.equal(st.v2!.spent, 45 + 20 + 30);
});

test('co-op: privacy is off in solo and when the room has one investigator', () => {
  const solo = newSessionState(kessler, 'h', 0);
  solo.v2!.facts['f-diary-bank'] = { day: 1, minute: 0, seq: 1, src: { type: 'document', ref: 'ev-diary' } };
  const ctx: A.Ctx = { def: kessler, st: solo, now: 1, locale: 'en', actorId: 'solo' };
  A.travel(ctx, 'loc-bank');
  A.inspect(ctx, 'z-bk-file');
  A.detail(ctx, 'z-bk-file', 'd-bk-pages');
  assert.ok('f-bank-papers' in solo.v2!.facts);
  assert.equal(solo.v2!.team, undefined);
  const one = newSessionState(kessler, 'h', 0, { id: 'a', name: 'A' }, 'coop');
  one.v2!.facts['f-diary-bank'] = { day: 1, minute: 0, seq: 1, src: { type: 'document', ref: 'ev-diary' } };
  as(one, 'a', (c) => A.travel(c, 'loc-bank'));
  as(one, 'a', (c) => A.inspect(c, 'z-bk-file'));
  as(one, 'a', (c) => A.detail(c, 'z-bk-file', 'd-bk-pages'));
  assert.ok('f-bank-papers' in one.v2!.facts);
  assert.equal(one.v2!.team!.budget, kessler.v2!.clock.minutesPerDay, 'alone in a room: a solo day');
});

// ───────────────────────────── solo unchanged

test('solo: same numbers as before wave 5 — no team, no budget, the ideal path unchanged', async () => {
  const { s } = svc();
  const { sessionId } = await s.startSession(HOST, 'kessler-workshop', false, 'solo');
  const v = (await s.travel(HOST, sessionId, 'loc-workshop')).view;
  assert.equal(v.team, undefined);
  assert.equal(v.clock.budget, undefined);
  assert.equal(v.clock.remainingToday, 450);
  assert.equal(v.clock.totalBudget, 1440);
  assert.ok(v.map.places.every((p) => p.team === undefined && p.private === undefined));
  // waiting still costs time and is the lead's (the player's) own
  const w = await s.wait(HOST, sessionId, { minutes: 30 });
  assert.equal(w.event.cost, 30);
  assert.equal(w.view.clock.spent, 60);
  const run = runPath(kessler, kessler.v2!.idealPath);
  assert.equal(run.failures.length, 0);
  assert.equal(run.st.v2!.finale?.outcome, 'confession');
  assert.equal(run.st.v2!.team, undefined);
  assert.equal(run.spent, 905, 'the solo ideal path spends what it spent before co-op existed');
});

// ───────────────────────────── lead hand-over and robustness

test('co-op: the lead hands over; a member may take an absent lead; the per-session mutex keeps every action', async () => {
  const { s, sessionId } = await room(3);
  await s.pulse(HOST, sessionId);
  assert.equal(await reason(s.claimLead(GUEST, sessionId)), 'not_host', 'the lead is here (just pulsed)');
  await s.handOver(HOST, sessionId, GUEST);
  let v = await s.viewV2(HOST, sessionId);
  assert.equal(v.room?.hostId, GUEST);
  assert.equal(await reason(s.endDay(HOST, sessionId)), 'not_host');
  assert.ok(v.room!.activity.some((a) => a.actor === 'Demir' && a.text === 'is now the lead investigator'));
  // the new lead leaves: the longest-serving remaining member takes over
  await s.leave(GUEST, sessionId);
  v = await s.viewV2(HOST, sessionId);
  assert.equal(v.room?.hostId, HOST);
  // concurrent actions by different investigators: all land, each on its own clock
  await s.travel(HOST, sessionId, 'loc-workshop');
  await s.travel(THIRD, sessionId, 'loc-workshop');
  const zones = ['z-body', 'z-ladder', 'z-toolwall', 'z-bench'];
  await Promise.all(zones.map((z, i) => s.inspectZone(i % 2 ? THIRD : HOST, sessionId, z)));
  v = await s.viewV2(HOST, sessionId);
  assert.equal(v.clock.minute, 30 + 2 * 20);
  assert.equal(v.team!.members.find((m) => m.name === 'Kaya')?.timeLabel, '09:10');
  assert.equal(v.scenes.find((x) => x.locationId === 'loc-workshop')!.zones.filter((z) => zones.includes(z.id) && z.inspected).length, 4);
});

test('co-op: team actions bump the version and their analytics carry no typed text', async () => {
  const { s, sessionId, analytics } = await room();
  const v0 = (await s.pulse(GUEST, sessionId)).version;
  await s.intent(HOST, sessionId, 'go', 'loc-office');
  await s.doneForToday(HOST, sessionId, false);
  assert.ok((await s.pulse(GUEST, sessionId)).version >= v0 + 2);
  const names = ['intent_marked', 'done_for_today'];
  const evs = analytics.events.filter((e) => names.includes(e.event));
  assert.equal(evs.length, 2);
  for (const e of evs) for (const v of Object.values(e.props)) assert.ok(typeof v !== 'string' || v.length < 40, JSON.stringify(e.props));
});

// ───────────────────────────── validator

test('validator: every fact reachable by a team; private sources must be reachable places', () => {
  const r = validateV2(kessler);
  assert.deepEqual(r.errors, []);
  assert.equal(r.stats.coopBudget2p, budgetFor(kessler.v2!, 2));
  const team2 = exhaustive(kessler, 2);
  const solo = exhaustive(kessler);
  assert.deepEqual(Object.keys(team2.st.v2!.facts).sort(), Object.keys(solo.st.v2!.facts).sort());
  const bad: CaseDefinition = { ...kessler, v2: { ...kessler.v2!, coop: { private: { locations: ['loc-nowhere'], evidence: [kessler.briefing.startingEvidence[0] ?? 'ev-x'] } } } };
  const errs = validateV2(bad).errors.join('\n');
  assert.match(errs, /coop\.private: unknown location loc-nowhere/);
  assert.match(errs, /coop\.private: .* (is held from the start|unknown evidence)/);
});
