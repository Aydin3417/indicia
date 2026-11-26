// PLAYTEST_V2 §7 → V3: the changes that make the whole game fun stay true.
// Early win, honest presses, a deliberate wait, filing up to the prosecutor, nudges, composure, claim spans,
// the Clock star target, varied dismissals, finale refutations in the debrief.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kessler } from '../cases/kessler.ts';
import { firstWatch } from '../cases/first-watch.ts';
import type { CaseDefinition } from './types.ts';
import { newSessionState } from './state.ts';
import { ActionError } from './actions.ts';
import { buildDebrief } from './evaluate.ts';
import * as A from './v2/actions.ts';
import { projectV2 } from './v2/projection.ts';
import { exhaustive, runNewcomer, runPath } from './v2/validate.ts';
import { claimsOf } from './v2/state.ts';
import { claimSpans } from './v2/anchors.ts';
import { tx } from './i18n.ts';

function game(def: CaseDefinition = kessler) {
  const st = newSessionState(def, 'h', 0);
  let now = 1;
  const ctx = (locale: 'en' | 'tr' = 'en'): A.Ctx => ({ def, st, now: now++, locale });
  return { def, st, s: st.v2!, ctx };
}

const reason = (fn: () => unknown) => {
  try { fn(); } catch (e) { if (e instanceof ActionError) return e.reason; throw e; }
  return 'no error';
};

// ── 1. the early win

for (const def of [kessler, firstWatch]) {
  test(`${def.id}: a sensible first-timer confirms a deduction early (game and real time)`, () => {
    const nc = def.v2!.newcomerPath!;
    const r = runNewcomer(def)!;
    assert.deepEqual(r.run.failures, []);
    assert.ok(r.firstWin, 'something is confirmed');
    assert.equal(r.firstWin!.day, 1);
    assert.ok(r.firstWin!.minute <= nc.firstWinBy, `first win at minute ${r.firstWin!.minute}`);
    assert.ok(r.firstWin!.realMinutes <= 10, `first win after ~${r.firstWin!.realMinutes} real minutes`);
    assert.ok(r.day1Confirmed >= nc.minConfirmedDay1);
  });
}

test('kessler: the sensible first day ends with two or three confirmed deductions, mistakes included', () => {
  const r = runNewcomer(kessler)!;
  assert.ok(r.day1Confirmed >= 2 && r.day1Confirmed <= 3, `day 1: ${r.day1Confirmed}`);
  const kinds = new Set(kessler.v2!.newcomerPath!.steps.map((x) => x.do));
  assert.ok(kinds.has('wrongDeduce') && kinds.has('wrongPresent'), 'the newcomer path is not a perfect run');
  // the night pays off what was proven: the pawn ticket confirms the apprentice instead of asking "Leo?"
  assert.equal(r.run.st.v2!.reports[0].night?.id, 'n1-pawn-known');
});

test('kessler: "Not a fall" is answerable from the first ladder close-up, with the dust brush', () => {
  const { ctx, s } = game();
  A.travel(ctx(), 'loc-workshop');
  A.inspect(ctx(), 'z-body');
  A.inspect(ctx(), 'z-ladder');
  const v = projectV2(kessler, ctx().st, 'x');
  const ladder = v.scenes.flatMap((x) => x.zones).find((z) => z.id === 'z-ladder')!;
  assert.ok(ladder.closeUp!.details.some((d) => d.tool === 'dust' && !d.found), 'a dust detail shows on the ladder card');
  const e = A.detail(ctx(), 'z-ladder', 'd-rungs', 'dust');
  assert.deepEqual(e.newFacts, ['f-rungs-clean']);
  assert.equal(A.deduce(ctx(), 'd-not-fall', { fills: { proof: 'f-rungs-clean' } }).outcome, 'confirmed');
  assert.ok(s.minute <= 120);
});

// ── 2. every press pays or says it won't

for (const def of [kessler, firstWatch]) {
  test(`${def.id}: no press that costs time returns nothing`, () => {
    assert.deepEqual(exhaustive(def).unpaidPresses, []);
    // and over the ideal path, every press event either paid or was free
    const r = runPath(def, def.v2!.idealPath);
    for (const e of r.events) if (e.step.do === 'press' && e.cost > 0) assert.ok(e.cost === (def.v2!.clock.costs?.press ?? 15));
  });
}

test('claim cards carry their press state; only "yes" costs time', () => {
  const r = runPath(kessler, kessler.v2!.idealPath.slice(0, 40));
  const v = projectV2(kessler, r.st, 'x');
  const claims = v.suspects.flatMap((x) => x.topics.flatMap((t) => t.claims));
  assert.ok(claims.length > 5);
  for (const c of claims) {
    assert.ok(['yes', 'free', 'later', 'none', 'done'].includes(c.press));
    assert.equal(c.pressCost, c.press === 'yes' ? 15 : 0);
    assert.equal(c.canPress, c.press === 'yes' || c.press === 'free');
  }
});

// ── 3. waiting on purpose, filing up to the prosecutor, no dead last day

test('wait: exact minutes, until the lab, until a suspect; nothing to wait for is refused for free', () => {
  const { s, ctx } = game();
  assert.equal(reason(() => A.wait(ctx(), { until: 'lab' })), 'wait_nothing');
  assert.equal(reason(() => A.wait(ctx(), { minutes: 5 })), 'bad_fill');
  assert.equal(s.minute, 0);
  assert.equal(A.wait(ctx(), { minutes: 30 }).cost, 30);
  assert.equal(s.spent, 30);
  // Leo comes in at 12:00 (minute 240)
  const v = projectV2(kessler, ctx().st, 'x');
  assert.deepEqual(v.clock.waits?.suspects.find((x) => x.id === 'leo'), { id: 'leo', minutes: 210 });
  assert.equal(A.wait(ctx(), { until: 'leo' }).cost, 210);
  assert.equal(A.interviewStart(ctx(), 'leo').ok, true);
  // the lab
  const g = game();
  A.travel(g.ctx(), 'loc-workshop');
  A.inspect(g.ctx(), 'z-body');
  A.labSubmit(g.ctx(), 'a-phone');
  const e = A.run(g.ctx(), () => A.wait(g.ctx(), { until: 'lab' }));
  assert.equal(e.cost, 120);
  assert.deepEqual(e.labReady, ['a-phone']);
  // nothing running: nothing to wait for
  const h = game();
  assert.equal(reason(() => A.wait(h.ctx(), { until: 'miriam' })), 'wait_nothing', 'Miriam is not in today at all');
});

test('the last day ends in full: overnight results arrive, deductions can still be filed (two wrong tries), no time left shown', () => {
  const { s, st, ctx } = game();
  A.endDay(ctx());
  A.endDay(ctx());
  assert.equal(s.day, 3);
  A.travel(ctx(), 'loc-workshop');
  A.inspect(ctx(), 'z-body');
  A.detail(ctx(), 'z-body', 'd-hands');
  A.detail(ctx(), 'z-body', 'd-glasses');
  A.inspect(ctx(), 'z-sink');
  A.labSubmit(ctx(), 'a-rag');
  // end the last day early, with the rag still at the lab
  A.endDay(ctx());
  assert.equal(s.phase, 'awaiting_finale');
  const v = projectV2(kessler, st, 'x');
  assert.equal(v.clock.remainingToday, 0, 'the prosecutor screen shows no unused minutes as time left');
  assert.equal(v.clock.elapsed, 1440);
  assert.equal(v.lab.jobs.find((j) => j.analysisId === 'a-rag')?.status, 'ready', 'the overnight result is in');
  assert.deepEqual(A.labCollect(ctx()).newFacts, ['f-rag-blood']);
  // filing is still open, wrong filings cost nothing now but are capped at two per question
  const open = v.deductions.find((d) => d.id === 'd-not-fall')!;
  assert.equal(open.triesLeft, 2);
  const w1 = A.deduce(ctx(), 'd-not-fall', { fills: { proof: 'f-hands-clean' } });
  assert.equal(w1.outcome, 'wrong');
  assert.equal(w1.cost, 0);
  assert.equal(A.deduce(ctx(), 'd-not-fall', { fills: { proof: 'f-glasses' } }).outcome, 'wrong');
  assert.equal(reason(() => A.deduce(ctx(), 'd-not-fall', { fills: { proof: 'f-hands-clean' } })), 'late_limit');
  assert.equal(projectV2(kessler, st, 'x').deductions.find((d) => d.id === 'd-not-fall')!.triesLeft, 0);
  assert.equal(reason(() => A.wait(ctx(), { minutes: 30 })), 'phase', 'no waiting after the last day');
  assert.equal(A.finaleStart(ctx(), 'clara').ok, true);
});

// ── 7. the nudge

test('after two wrong filings the game says which blank to look at — never the answer', () => {
  const { ctx } = game();
  A.travel(ctx(), 'loc-workshop');
  A.inspect(ctx(), 'z-body');
  A.detail(ctx(), 'z-body', 'd-hands');
  A.detail(ctx(), 'z-body', 'd-glasses');
  const w1 = A.deduce(ctx(), 'd-not-fall', { fills: { proof: 'f-hands-clean' } });
  assert.equal(w1.message, 'It doesn\'t hold.', 'the first miss says nothing more');
  const w2 = A.deduce(ctx(), 'd-not-fall', { fills: { proof: 'f-glasses' } });
  assert.match(w2.message!, /Look again at “proof”; the rest holds\./);
  const v = projectV2(kessler, ctx().st, 'x');
  const d = v.deductions.find((x) => x.id === 'd-not-fall')!;
  assert.match(d.nudge!, /proof/);
  for (const secret of ['f-rungs-clean', 'f-no-fall', 'rungs', 'autopsy']) assert.ok(!d.nudge!.includes(secret));
  // Turkish
  const vt = projectV2(kessler, ctx().st, 'x', undefined, [], 'tr');
  assert.match(vt.deductions.find((x) => x.id === 'd-not-fall')!.nudge!, /“kanıt” boşluğuna bir daha bak/);
});

test('timeline nudge: the set-aside card, or the order', () => {
  const d = kessler.v2!.deductions.find((x) => x.id === 'd-timeline')!;
  assert.match(A.nudgeText(d, { kind: 'outlier' }, 'en'), /card you set aside/);
  assert.match(A.nudgeText(d, { kind: 'order' }, 'tr'), /sıra tutmuyor/);
});

// ── 6. dismissals vary, every break shows

test('dismissals rotate per suspect: never the same line twice in a row', () => {
  for (const sus of kessler.suspects) assert.ok(sus.dismissals.length >= 5, `${sus.id} has ${sus.dismissals.length} dismissals`);
  for (const sus of kessler.suspects) assert.ok((sus.resists?.length ?? 0) >= 3, `${sus.id} has resist lines`);
  for (const sus of firstWatch.suspects) assert.ok(sus.dismissals.length >= 4);
  const { ctx, s } = game();
  s.minute = 240;
  A.interviewStart(ctx(), 'leo');
  A.openTopic(ctx(), 'leo', 't-evening');
  const lines = [A.present(ctx(), 'leo', 'c-leo-home', 'f-fobs').line!.text, A.present(ctx(), 'leo', 'c-leo-home', 'ev-neighbour').line!.text, A.present(ctx(), 'leo', 'c-leo-home', 'ev-camera').line!.text];
  assert.equal(new Set(lines).size, 3);
});

test('every breakthrough moves composure a visible stage (until breaking)', () => {
  const r = runPath(kessler, kessler.v2!.idealPath.filter((x) => x.do !== 'finale'));
  assert.deepEqual(r.failures, []);
  // replay the ideal path step by step and look at every break
  const st = newSessionState(kessler, 'h', 0);
  let now = 1;
  const ctx = (): A.Ctx => ({ def: kessler, st, now: now++, locale: 'en' });
  let breaks = 0;
  for (const step of kessler.v2!.idealPath) {
    if (step.do === 'finale') break;
    if (step.do === 'present') {
      const e = A.present(ctx(), step.suspect, step.claim, step.item);
      assert.equal(e.outcome, 'break');
      breaks++;
      assert.ok(e.composure, 'a break reports composure before and after');
      if (e.composure!.from !== 'breaking') assert.notEqual(e.composure!.from, e.composure!.to, `${step.claim}: composure moved`);
      continue;
    }
    runStep(ctx, step);
  }
  assert.ok(breaks >= 8);
  const v = projectV2(kessler, st, 'x');
  for (const sus of v.suspects) assert.ok(sus.pressure >= 0 && sus.pressure <= 100);
});

function runStep(ctx: () => A.Ctx, step: (typeof kessler.v2 & {})['idealPath'][number]) {
  const def = kessler;
  switch (step.do) {
    case 'travel': A.travel(ctx(), step.to); break;
    case 'inspect': A.inspect(ctx(), step.zone); break;
    case 'detail': A.detail(ctx(), step.zone, step.detail, def.v2!.scenes.flatMap((x) => x.zones).find((z) => z.id === step.zone)!.details.find((d) => d.id === step.detail)!.tool); break;
    case 'collect': {
      const e = def.evidence.find((x) => x.id === step.evidence)!;
      let key = '';
      e.body!.forEach((line, i) => [...tx(line, 'en').matchAll(/\{\{\??([a-zA-Z0-9_-]+)\|/g)].forEach((m, n) => { if (m[1] === step.fact && !key) key = `${i}.${n}`; }));
      A.collect(ctx(), step.evidence, key);
      break;
    }
    case 'lab': A.labSubmit(ctx(), step.analysis); break;
    case 'labCollect': A.labCollect(ctx()); break;
    case 'interview': A.interviewStart(ctx(), step.suspect); break;
    case 'leave': A.interviewLeave(ctx(), step.suspect); break;
    case 'topic': A.openTopic(ctx(), step.suspect, step.topic); break;
    case 'press': A.press(ctx(), step.suspect, step.claim); break;
    case 'deduce': A.deduce(ctx(), step.deduction, { fills: step.fills, order: step.order, outlier: step.outlier }); break;
    case 'endDay': A.endDay(ctx()); break;
    case 'nightChoice': A.nightChoice(ctx(), step.option); break;
    default: break;
  }
}

// ── 9. one answer, claims inside it

for (const def of [kessler, firstWatch]) {
  test(`${def.id}: every claim is a span of its answer or a short quote under it, in both languages`, () => {
    const r = runPath(def, def.v2!.idealPath.filter((x) => x.do !== 'finale'));
    for (const locale of ['en', 'tr'] as const) {
      const v = projectV2(def, r.st, 'x', undefined, [], locale);
      let spans = 0;
      let loose = 0;
      for (const sus of v.suspects) {
        for (const line of sus.log.filter((l) => l.claims || l.looseClaims)) {
          const covered = new Set([...(line.claims ?? []).map((c) => c.claimId), ...(line.looseClaims ?? [])]);
          let last = -1;
          for (const c of line.claims ?? []) {
            assert.ok(c.start >= 0 && c.end <= line.text.length && c.start < c.end, `${c.claimId} span inside the text`);
            assert.ok(c.start >= last, `${c.claimId}: spans do not overlap`);
            assert.ok(!line.text.slice(c.start, c.end).includes('('), `${c.claimId}: a stage direction is not part of a claim`);
            last = c.end;
            spans++;
          }
          loose += line.looseClaims?.length ?? 0;
          assert.ok(covered.size > 0);
        }
      }
      assert.ok(spans > loose * 3, `${locale}: most claims sit inside the answer (${spans} spans, ${loose} loose)`);
    }
  });
}

test('the claims of every tier answer are all accounted for (span or loose), in both languages', () => {
  for (const def of [kessler, firstWatch]) for (const sus of def.suspects) for (const t of sus.topics) t.tiers.forEach((tier, i) => {
    const ids = claimsOf(sus, t, i).map((c) => c.id).sort();
    for (const locale of ['en', 'tr'] as const) {
      const p = claimSpans(def, sus, t.id, i, tx(tier.line, locale), locale);
      assert.deepEqual([...p.spans.map((x) => x.claimId), ...p.loose].sort(), ids, `${sus.id}/${t.id}#${i} ${locale}`);
    }
  });
});

// ── 10. the Clock star target is on the strip

test('clock star: the target is a time to reach the prosecutor by', () => {
  const { ctx, s } = game();
  const v = projectV2(kessler, ctx().st, 'x');
  assert.equal(v.clock.clockStar.minutesLeftNeeded, 360);
  assert.equal(v.clock.clockStar.by.day, 3);
  assert.equal(v.clock.clockStar.by.label, '10:00');
  assert.equal(v.clock.clockStar.state, 'open');
  A.endDay(ctx());
  A.endDay(ctx());
  s.minute = 121;
  assert.equal(projectV2(kessler, ctx().st, 'x').clock.clockStar.state, 'lost');
  const f = game(firstWatch);
  const fv = projectV2(firstWatch, f.ctx().st, 'x');
  assert.equal(fv.clock.clockStar.by.label, '06:15', 'tutorial: 15 % of the night left');
  assert.equal(fv.case.tutorial, true);
  assert.equal(v.case.tutorial, false);
});

// ── known issue: lies refuted in the finale are not listed as missed

test('debrief: a lie exposed only in the confrontation counts as uncovered', () => {
  const r = runPath(kessler, kessler.v2!.idealPath);
  const d = buildDebrief(kessler, r.st, 0, 'en');
  assert.ok(!d.liesMissed.some((l) => /22:51 call was about a family dinner/.test(l.text)), 'the dinner lie was broken in the interview or the lie round');
  assert.ok(!d.liesMissed.some((l) => /must have fallen from the ladder/.test(l.text)), 'the fall lie is refuted by the staging round');
});
