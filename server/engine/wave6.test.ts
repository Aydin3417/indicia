// Wave 6 (Agent O, full playtest): regressions for what the playtest and the open handoff requests turned up.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { GameService, ServiceError, isServiceError } from '../service.ts';
import { FileStore } from '../store/fileStore.ts';
import { MemoryAnalytics } from '../analytics.ts';
import { kessler } from '../cases/kessler.ts';
import { budgetFor } from './v2/coop.ts';

const HOST = 'dev-host-000006';
const GUEST = 'dev-guest-00006';
const THIRD = 'dev-third-00006';

function svc() {
  return new GameService(new FileStore(mkdtempSync(path.join(tmpdir(), 'indicia-w6-'))), { provider: null, priceIn: 0, priceOut: 0 }, { perMinute: 1000, analytics: new MemoryAnalytics() });
}

test('co-op: a friend who joins after the lead started gets the team share, not a full solo day (N’s gap)', async () => {
  const s = svc();
  await s.rename(HOST, 'Aksoy');
  await s.rename(GUEST, 'Demir');
  await s.rename(THIRD, 'Kaya');
  const { sessionId, roomCode } = await s.startSession(HOST, 'kessler-workshop', false, 'coop');
  await s.travel(HOST, sessionId, 'loc-workshop'); // the lead spends alone: today's budget is now fixed (solo size)
  const solo = kessler.v2!.clock.minutesPerDay;
  assert.equal((await s.viewV2(HOST, sessionId)).clock.remainingToday, solo - 30);
  await s.joinRoom(GUEST, roomCode!);
  const g = await s.viewV2(GUEST, sessionId);
  assert.equal(g.clock.budget?.perPlayer, budgetFor(kessler.v2!, 2), 'the latecomer gets the two-player share');
  assert.equal(g.clock.remainingToday, budgetFor(kessler.v2!, 2));
  const h = await s.viewV2(HOST, sessionId);
  assert.equal(h.clock.remainingToday, solo - 30, 'the lead keeps what was fixed this morning');
  assert.equal(h.team!.members.find((m) => !m.isYou)?.remaining, budgetFor(kessler.v2!, 2));
  // a third friend later still: the three-player share
  await s.joinRoom(THIRD, roomCode!);
  assert.equal((await s.viewV2(THIRD, sessionId)).clock.remainingToday, budgetFor(kessler.v2!, 3));
  // spending past the latecomer's share is refused
  await s.travel(GUEST, sessionId, 'loc-office');
  assert.equal((await s.viewV2(GUEST, sessionId)).clock.remainingToday, budgetFor(kessler.v2!, 2) - 30);
  // next morning everyone gets the same share again
  await s.endDay(HOST, sessionId);
  for (const id of [HOST, GUEST, THIRD]) {
    const v = await s.viewV2(id, sessionId);
    assert.equal(v.clock.day, 2);
    assert.equal(v.clock.remainingToday, budgetFor(kessler.v2!, 3), id);
  }
});

test('co-op: when the lead leaves a team that is all done, the day closes (it used to stay open with nobody to act)', async () => {
  const s = svc();
  const { sessionId, roomCode } = await s.startSession(HOST, 'kessler-workshop', false, 'coop');
  await s.joinRoom(GUEST, roomCode!);
  await s.joinRoom(THIRD, roomCode!);
  await s.travel(HOST, sessionId, 'loc-workshop');
  await s.doneForToday(GUEST, sessionId, true);
  await s.doneForToday(THIRD, sessionId, true);
  assert.equal((await s.viewV2(GUEST, sessionId)).clock.day, 1, 'the lead is still working');
  await s.leave(HOST, sessionId);
  const v = await s.viewV2(GUEST, sessionId);
  assert.equal(v.room?.isHost, true, 'the longest-serving member leads');
  assert.equal(v.clock.day, 2, 'everyone left was done: the day ended by itself');
  assert.equal(v.reports.length, 1);
});

test('co-op: the Clock star is stated in work time; solo keeps the wall clock', async () => {
  const s = svc();
  const { sessionId, roomCode } = await s.startSession(HOST, 'kessler-workshop', false, 'coop');
  await s.joinRoom(GUEST, roomCode!);
  const v = await s.viewV2(HOST, sessionId);
  const per = budgetFor(kessler.v2!, 2);
  const star = v.clock.clockStar!;
  const total = kessler.v2!.clock.days * per;
  const latest = total - Math.ceil(total * star.share);
  assert.equal(star.by.day, Math.floor(latest / per) + 1);
  assert.equal(star.work, latest - (star.by.day - 1) * per, 'minutes of work into that day');
  const { sessionId: soloId } = await s.startSession(GUEST, 'kessler-workshop', false, 'solo');
  assert.equal((await s.viewV2(GUEST, soloId)).clock.clockStar!.work, undefined);
});

test('deductions: the end of a day is not a window for free guessing (misses capped when a miss cannot be paid)', async () => {
  const s = svc();
  const { sessionId } = await s.startSession(HOST, 'kessler-workshop', false, 'solo');
  await s.travel(HOST, sessionId, 'loc-workshop');
  await s.inspectZone(HOST, sessionId, 'z-body');
  const v = await s.viewV2(HOST, sessionId);
  const wrongFact = v.notebook.facts.map((f) => f.id).find((id) => !['f-no-fall', 'f-rungs-clean'].includes(id))!;
  assert.ok(wrongFact);
  // with time to pay, a miss costs its price and is not capped
  const first = await s.deduce(HOST, sessionId, 'd-not-fall', { fills: { proof: wrongFact } });
  assert.equal(first.event.cost, 30);
  assert.equal(first.view.deductions.find((d) => d.id === 'd-not-fall')?.triesLeft, undefined);
  // burn the day down to 5 minutes
  for (let left = first.view.clock.remainingToday - 5; left > 0; left -= Math.min(240, left)) await s.wait(HOST, sessionId, { minutes: Math.min(240, left) });
  const v2 = await s.viewV2(HOST, sessionId);
  assert.equal(v2.clock.remainingToday, 5);
  assert.equal(v2.deductions.find((d) => d.id === 'd-not-fall')?.triesLeft, 2);
  for (let i = 0; i < 2; i++) assert.equal((await s.deduce(HOST, sessionId, 'd-not-fall', { fills: { proof: wrongFact } })).event.outcome, 'wrong');
  // the third cheap miss is refused before it is judged — even a right answer waits for tomorrow
  await assert.rejects(s.deduce(HOST, sessionId, 'd-not-fall', { fills: { proof: wrongFact } }), (e: ServiceError) => e.reason === 'no_time');
  // next morning the cap is gone
  await s.endDay(HOST, sessionId);
  const v3 = await s.viewV2(HOST, sessionId);
  assert.equal(v3.deductions.find((d) => d.id === 'd-not-fall')?.triesLeft, undefined);
});

test('HTTP: a ServiceError from a second copy of the module is still a ServiceError (P’s 500 instead of 409)', () => {
  const foreign = Object.assign(new Error('closed'), { name: 'ServiceError', code: 'conflict', reason: 'phase' });
  assert.equal(isServiceError(foreign), true);
  assert.equal(isServiceError(new ServiceError('x', 'conflict', 'phase')), true);
  assert.equal(isServiceError(new Error('boom')), false);
  assert.equal(isServiceError({ name: 'ServiceError' }), false, 'needs a code');
});

test('side questions: the prompt never hands over “who” (P’s request; the truth is unchanged)', () => {
  const giveaways = /\b(woman|her|she|father|daughter)\b|kadın|babası|kızı/i;
  for (const id of ['d-courtyard', 'd-money', 'd-clean']) {
    const d = kessler.v2!.deductions.find((x) => x.id === id)!;
    assert.ok(d, id);
    const blanks = d.blanks ?? [];
    for (const lang of ['en', 'tr'] as const) {
      const p = (typeof d.prompt === 'string' ? d.prompt : d.prompt?.[lang]) ?? '';
      assert.ok(p, `${id} has a ${lang} prompt`);
      assert.doesNotMatch(p, giveaways, `${id} ${lang}: ${p}`);
      for (const b of blanks) assert.ok(p.includes(`{${b.id}}`), `${id} ${lang} names {${b.id}}`);
    }
    assert.deepEqual(blanks.find((b) => b.id === 'who')?.accept, ['clara'], `${id}: the answer is still Clara`);
  }
});
