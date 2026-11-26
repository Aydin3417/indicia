// Wave 9 (Agent V): the gameplay problems PLAYTEST_V5 left open — the interview/notebook tax, a finale that was a
// formality once the book was full, the fork route that never left the lab list, the cast list that named people early.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kessler } from '../cases/kessler.ts';
import { fennick } from '../cases/fennick.ts';
import { firstWatch } from '../cases/first-watch.ts';
import type { CaseDefinition } from './types.ts';
import { newSessionState } from './state.ts';
import * as A from './v2/actions.ts';
import { FINALE_DECOYS, forkRoadClosed, projectV2 } from './v2/projection.ts';
import { runPath } from './v2/validate.ts';

function game(def: CaseDefinition = kessler) {
  const st = newSessionState(def, 'h', 0);
  let now = 1;
  const ctx = (locale: 'en' | 'tr' = 'en'): A.Ctx => ({ def, st, now: now++, locale });
  return { def, st, s: st.v2!, ctx };
}

/** The ideal path up to (not including) its finale step, and a ctx on that state. */
function beforeFinale(def: CaseDefinition) {
  const path = def.v2!.idealPath;
  const fin = path.findIndex((p) => p.do === 'finale');
  const r = runPath(def, path.slice(0, fin));
  assert.deepEqual(r.failures, [], def.id);
  let now = 50_000;
  const ctx = (): A.Ctx => ({ def, st: r.st, now: now++, locale: 'en' });
  const step = path[fin] as { do: 'finale'; accused: string; answers: string[] };
  return { st: r.st, ctx, step };
}

test('interview: stepping out to the notebook and straight back in costs nothing; any time spent in between does', () => {
  const { def, st, s, ctx } = game();
  A.travel(ctx(), 'loc-workshop');
  assert.equal(A.interviewStart(ctx(), 'clara').cost, 30);
  A.openTopic(ctx(), 'clara', 't-evening');
  const patience = s.interviews.clara.patience;
  A.interviewLeave(ctx(), 'clara');
  const view = projectV2(def, st, 'sess', 'h');
  assert.equal(view.suspects.find((x) => x.id === 'clara')!.interview.resumeFree, true, 'the view says re-opening is free');
  const minute = s.minute;
  const back = A.interviewStart(ctx(), 'clara');
  assert.equal(back.cost, 0);
  assert.equal(back.outcome, 'resumed');
  assert.equal(back.line, undefined, 'no second greeting');
  assert.equal(s.minute, minute, 'the clock did not move');
  assert.equal(s.interviews.clara.patience, patience, 'patience is not refilled by stepping out');
  // leave, spend time elsewhere → a new interview, full price
  A.interviewLeave(ctx(), 'clara');
  A.travel(ctx(), 'loc-office');
  assert.equal(projectV2(def, st, 'sess', 'h').suspects.find((x) => x.id === 'clara')!.interview.resumeFree, undefined);
  assert.equal(A.interviewStart(ctx(), 'clara').cost, 30);
  // the grace is only for the interview you stepped out of: the next morning it is gone
  A.interviewLeave(ctx(), 'clara');
  A.endDay(ctx());
  const iv = s.interviews.clara;
  assert.equal(A.resumesFree(def.v2!, s, iv, undefined), false, 'a new day is a new interview');
});

test('interview: collecting a phrase from a document is free and allowed while the interview stays open', () => {
  const r = runPath(fennick, fennick.v2!.idealPath.slice(0, 14)); // studio, up to the notice on the back door
  assert.deepEqual(r.failures, []);
  let now = 9_000;
  const ctx = (): A.Ctx => ({ def: fennick, st: r.st, now: now++, locale: 'tr' });
  const s = r.st.v2!;
  const who = fennick.suspects.find((x) => A.suspectAvailableNow(fennick.v2!, s, x.id))!;
  A.interviewStart(ctx(), who.id);
  const doc = fennick.evidence.find((e) => e.id in r.st.evidence && e.body?.some((l) => /\{\{/.test(typeof l === 'string' ? l : l.en)))!;
  const view = projectV2(fennick, r.st, 'sess', 'h', [], 'tr');
  const seg = view.notebook.evidence.find((e) => e.id === doc.id)!.body!.flat().find((x) => x.key && !x.collected);
  if (seg) {
    const before = s.minute;
    const ev = A.collect(ctx(), doc.id, seg.key!);
    assert.equal(ev.cost, 0);
    assert.equal(s.minute, before);
  }
  assert.equal(s.interviews[who.id].open, true, 'reading the notebook does not close the interview');
});

for (const def of [firstWatch, kessler, fennick]) {
  test(`finale (${def.id}): the suggested shelf holds one answer among pieces that answer other rounds, in a per-session order`, () => {
    const { st, ctx, step } = beforeFinale(def);
    A.finaleStart(ctx(), step.accused);
    const rounds = def.v2!.finale.rounds;
    let shelves = 0;
    for (let i = 0; i < rounds.length; i++) {
      const r = rounds[i];
      const shelf = projectV2(def, st, 'session-a', 'h').finale!.rounds[i].suggested;
      const again = projectV2(def, st, 'session-a', 'h').finale!.rounds[i].suggested;
      assert.deepEqual(shelf, again, 'stable between requests');
      if (shelf.length) {
        shelves += 1;
        assert.equal(shelf.filter((id) => r.accept.includes(id)).length, 1, `${r.id}: exactly one piece answers this round`);
        assert.ok(shelf.length >= 2 && shelf.length <= 1 + FINALE_DECOYS, `${r.id}: a choice, not a formality (${shelf.length})`);
        const others = shelf.filter((id) => !r.accept.includes(id));
        assert.ok(others.every((id) => rounds.some((o) => o.id !== r.id && o.accept.includes(id))), `${r.id}: the others are strong pieces from other rounds`);
        // the place of the answer depends on the session, not on the truth
        const places = new Set<number>();
        for (let k = 0; k < 24; k++) {
          const sh = projectV2(def, st, `session-${k}`, 'h').finale!.rounds[i].suggested;
          places.add(sh.findIndex((id) => r.accept.includes(id)));
          assert.deepEqual(sh.filter((id) => r.accept.includes(id)), shelf.filter((id) => r.accept.includes(id)), 'the same answer in every session');
          assert.equal(sh.length, shelf.length);
        }
        assert.ok(places.size >= 2, `${r.id}: the answer is not always in the same place (${[...places]})`);
      }
      A.finaleAnswer(ctx(), step.answers[i]);
    }
    assert.ok(shelves >= 1, 'at least one round is linked to a confirmed deduction');
    assert.equal(st.v2!.finale!.outcome, 'confession', 'the ideal answers still win every round');
  });
}

test('lab: a job only a night fork could start leaves the list once the other option was taken', () => {
  const path = fennick.v2!.idealPath;
  const choice = path.findIndex((p) => p.do === 'nightChoice' && p.option === 'fk-teo-tonight');
  const before = runPath(fennick, path.slice(0, choice));
  assert.deepEqual(before.failures, []);
  assert.equal(forkRoadClosed(fennick, before.st.v2!, 'a-teo'), false, 'while the fork waits, the written statement is still a road');
  const after = runPath(fennick, path.slice(0, choice + 1));
  assert.deepEqual(after.failures, []);
  assert.equal(forkRoadClosed(fennick, after.st.v2!, 'a-teo'), true, 'after knocking on his door, the airport-police job is gone');
  const end = runPath(fennick, path.filter((p) => p.do !== 'finale'));
  const book = projectV2(fennick, end.st, 'sess', 'h').notebook.evidence.find((e) => e.id === 'ev-taxibook');
  assert.ok(book, 'the taxi book is held by the end');
  assert.ok(!book.analyses.some((a) => a.id === 'a-teo'), 'and its lab list no longer offers the road not taken');
  // Kessler: the same for the fork the ideal path does not send to the lab
  const k = runPath(kessler, kessler.v2!.idealPath);
  const kv = projectV2(kessler, k.st, 'sess', 'h');
  for (const ev of kessler.v2!.nightEvents ?? []) {
    for (const o of ev.choice?.options ?? []) {
      if (!o.lab) continue;
      const taken = k.st.v2!.reports.find((r) => r.fork?.id === ev.id)?.fork?.chosen === o.id;
      const listed = kv.notebook.evidence.some((e) => e.analyses.some((a) => a.id === o.lab && a.status === 'locked'));
      if (!taken) assert.equal(listed, false, `${o.lab} (not chosen) no longer listed as locked`);
    }
  }
});

test('cast: the dealer and the developer join the people list once the notebook names them', () => {
  const { st } = game(fennick);
  const v = projectV2(fennick, st, 'sess', 'h');
  const ids = v.people.map((p) => p.id);
  assert.ok(!ids.includes('p-kranz') && !ids.includes('p-nyberg'), ids.join());
  assert.ok(!v.chips.people.some((p) => p.id === 'p-kranz' || p.id === 'p-nyberg'));
  assert.ok(ids.includes('p-ruth') && ids.includes('p-agnes'), 'everyone else is listed from the start');
  const end = runPath(fennick, fennick.v2!.idealPath);
  const w = projectV2(fennick, end.st, 'sess', 'h');
  assert.ok(w.people.some((p) => p.id === 'p-kranz') && w.people.some((p) => p.id === 'p-nyberg'));
  // the other cases keep their whole cast (no one is kept back)
  for (const def of [kessler, firstWatch]) {
    assert.equal(projectV2(def, game(def).st, 'sess', 'h').people.length, def.people.length, def.id);
  }
});

test('day report: a question that opened and was confirmed the same day is reported once, as confirmed', () => {
  for (const def of [firstWatch, kessler, fennick]) {
    const r = runPath(def, def.v2!.idealPath.filter((p) => p.do !== 'finale'));
    const v = projectV2(def, r.st, 'sess', 'h');
    if (def.v2!.clock.days > 1) assert.ok(v.reports.length >= 2, def.id);
    for (const rep of v.reports) {
      const done = new Set(rep.deductionsConfirmed.map((d) => d.id));
      assert.ok(rep.deductionsOpened.every((d) => !done.has(d.id)), `${def.id} day ${rep.day}`);
    }
  }
});
