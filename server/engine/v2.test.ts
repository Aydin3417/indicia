// v2 engine rules: clock, lab, availability, patience, press/present, deductions, finale, locale, leaks, validator.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kessler } from '../cases/kessler.ts';
import { firstWatch } from '../cases/first-watch.ts';
import type { CaseDefinition } from './types.ts';
import { newSessionState } from './state.ts';
import { ActionError } from './actions.ts';
import * as A from './v2/actions.ts';
import { projectV2 } from './v2/projection.ts';
import { runPath, validateV2 } from './v2/validate.ts';
import { validateCase } from './validate.ts';
import { localeFromHeader, tx } from './i18n.ts';
import { shapeCenter } from './v2/state.ts';
import { classifyOffline } from './matcher.ts';

function game(def: CaseDefinition = kessler) {
  const st = newSessionState(def, 'h', 0);
  let now = 1;
  const ctx = (locale: 'en' | 'tr' = 'en', actorId?: string): A.Ctx => ({ def, st, now: now++, locale, actorId });
  return { def, st, s: st.v2!, ctx };
}

const reason = (fn: () => unknown) => {
  try {
    fn();
  } catch (e) {
    if (e instanceof ActionError) return e.reason;
    throw e;
  }
  return 'no error';
};

/** Replay the first n ideal-path steps. */
function upTo(n: number) {
  const r = runPath(kessler, kessler.v2!.idealPath.slice(0, n));
  assert.deepEqual(r.failures, []);
  let now = 10_000;
  const ctx = (locale: 'en' | 'tr' = 'en'): A.Ctx => ({ def: kessler, st: r.st, now: now++, locale });
  return { st: r.st, s: r.st.v2!, ctx };
}
const stepIndex = (pred: (s: (typeof kessler.v2 & {})['idealPath'][number]) => boolean) => kessler.v2!.idealPath.findIndex(pred);

test('every action charges its PLAN_V2 cost; refusals are free', () => {
  const { s, ctx } = game();
  assert.equal(A.travel(ctx(), 'loc-workshop').cost, 30);
  assert.equal(reason(() => A.travel(ctx(), 'loc-workshop')), 'already');
  assert.equal(A.inspect(ctx(), 'z-body').cost, 20);
  assert.equal(A.inspect(ctx(), 'z-body').cost, 0, 're-opening a close-up is free');
  assert.equal(A.detail(ctx(), 'z-body', 'd-glasses').cost, 0, 'a plain detail is a free tap');
  assert.equal(A.probe(ctx(), 'loc-workshop', 'uv', 0.1, 0.9).cost, 10, 'a missed probe costs the tool');
  const [x, y] = shapeCenter(kessler.v2!.scenes[0].zones.find((z) => z.id === 'z-rungs')!.shape);
  const hit = A.probe(ctx(), 'loc-workshop', 'dust', x, y);
  assert.equal(hit.outcome, 'hit');
  assert.equal(hit.cost, 30, 'tool + close-up');
  assert.equal(A.interviewStart(ctx(), 'clara').cost, 30);
  assert.equal(A.openTopic(ctx(), 'clara', 't-evening').cost, 5, 'Kessler: raising a topic is a 5-minute question');
  assert.equal(A.press(ctx(), 'clara', 'c-clara-home').cost, 0, 'a colour-only press is free (it yields no finding)');
  assert.equal(A.present(ctx(), 'clara', 'c-clara-home', 'ev-neighbour').cost, 15);
  assert.equal(reason(() => A.present(ctx(), 'clara', 'c-clara-home', 'ev-geneva')), 'not_owned');
  assert.equal(A.hint(ctx()).cost, 45);
  assert.equal(s.spent, 30 + 20 + 10 + 30 + 30 + 5 + 15 + 45);
  assert.equal(s.minute, s.spent);
});

test('a wrong deduction costs 30; filling with something you do not hold is refused for free', () => {
  const { s, ctx } = game();
  A.travel(ctx(), 'loc-workshop');
  A.inspect(ctx(), 'z-body');
  const before = s.minute;
  assert.equal(reason(() => A.deduce(ctx(), 'd-not-fall', { fills: { proof: 'f-no-fall' } })), 'not_owned');
  assert.equal(s.minute, before);
  const wrong = A.deduce(ctx(), 'd-not-fall', { fills: { proof: 'f-fobs' } });
  assert.equal(wrong.outcome, 'wrong');
  assert.equal(wrong.cost, 30);
  assert.equal(s.deductions['d-not-fall'].attempts, 1);
  assert.doesNotMatch(wrong.message!, /proof/i, 'the game never says which blank is wrong');
});

test('the day has a hard limit; ending it forfeits the rest and opens the next morning', () => {
  const { s, ctx } = game();
  s.minute = 470;
  assert.equal(reason(() => A.travel(ctx(), 'loc-office')), 'no_time');
  assert.equal(s.minute, 470);
  A.endDay(ctx());
  assert.equal(s.day, 2);
  assert.equal(s.minute, 0);
  assert.equal(s.reports[0].unusedMinutes, 10);
  assert.equal(projectV2(kessler, (game().st), 'x').clock.dayOver, false);
});

test('lab work is free but delayed, and only two jobs run at once', () => {
  const { s, ctx, st } = game();
  A.travel(ctx(), 'loc-workshop');
  A.inspect(ctx(), 'z-body');
  A.inspect(ctx(), 'z-toolwall');
  A.inspect(ctx(), 'z-sink');
  assert.equal(A.labSubmit(ctx(), 'a-phone').cost, 0);
  A.labSubmit(ctx(), 'a-mallet');
  assert.equal(reason(() => A.labSubmit(ctx(), 'a-rag')), 'lab_full');
  assert.equal(A.labStatus(ctx(), 'a-phone'), 'running');
  assert.equal(A.labCollect(ctx()).newEvidence!.length, 0, 'nothing before the delay');
  // two hours of work later the phone extraction (120 min) is ready, the mallet (240) is not
  s.minute += 120;
  const ev = A.run(ctx(), () => A.labCollect(ctx()));
  assert.deepEqual(ev.newEvidence, ['ev-calllog']);
  assert.ok('a-phone' in st.analyses);
  assert.equal(A.labStatus(ctx(), 'a-mallet'), 'running');
  // a slot is free again
  assert.equal(A.labSubmit(ctx(), 'a-rag').ok, true);
  // labs keep working overnight
  A.endDay(ctx());
  assert.deepEqual(s.reports[0].labsReady.sort(), ['a-mallet', 'a-rag']);
});

test('the run wrapper reports lab results that finished while time passed', () => {
  const { s, ctx } = game();
  A.travel(ctx(), 'loc-workshop');
  A.inspect(ctx(), 'z-body');
  A.labSubmit(ctx(), 'a-phone');
  s.minute = 300; // the phone job is due at 50 + 120
  const e = A.run(ctx(), () => A.travel(ctx(), 'loc-office'));
  assert.equal(e.labReady, undefined, 'it was already ready before this action');
  const g = game();
  A.travel(g.ctx(), 'loc-workshop');
  A.inspect(g.ctx(), 'z-body');
  A.labSubmit(g.ctx(), 'a-phone');
  g.s.minute += 100;
  const e2 = A.run(g.ctx(), () => A.travel(g.ctx(), 'loc-office'));
  assert.deepEqual(e2.labReady, ['a-phone']);
});

test('suspects keep their own hours', () => {
  const { s, ctx } = game();
  assert.equal(reason(() => A.interviewStart(ctx(), 'miriam')), 'unavailable');
  assert.equal(reason(() => A.interviewStart(ctx(), 'leo')), 'unavailable', 'Leo only after 12:00 on day 1');
  s.minute = 240;
  assert.equal(A.interviewStart(ctx(), 'leo').ok, true);
  A.endDay(ctx());
  assert.equal(A.interviewStart(ctx(), 'miriam').ok, true);
});

test('patience runs out, the suspect refuses for the rest of the day and is back tomorrow', () => {
  const { s, ctx } = game();
  A.endDay(ctx());
  A.interviewStart(ctx(), 'miriam');
  A.openTopic(ctx(), 'miriam', 't-evening');
  assert.equal(A.present(ctx(), 'miriam', 'c-miriam-home', 'ev-neighbour').outcome, 'wrong');
  assert.equal(s.interviews.miriam.patience, 2);
  A.present(ctx(), 'miriam', 'c-miriam-home', 'ev-camera');
  const last = A.present(ctx(), 'miriam', 'c-miriam-home', 'f-fobs');
  assert.equal(last.outcome, 'ended');
  assert.equal(last.patience, 0);
  assert.equal(s.interviews.miriam.open, false);
  assert.equal(reason(() => A.interviewStart(ctx(), 'miriam')), 'refused');
  assert.equal(reason(() => A.press(ctx(), 'miriam', 'c-miriam-home')), 'not_open');
  A.endDay(ctx());
  const again = A.interviewStart(ctx(), 'miriam');
  assert.equal(again.patience, 3, 'patience refills the next day');
});

test('leaving and coming back the same day does not refill patience', () => {
  const { s, ctx } = game();
  s.minute = 240;
  A.interviewStart(ctx(), 'leo');
  A.openTopic(ctx(), 'leo', 't-evening');
  A.present(ctx(), 'leo', 'c-leo-home', 'ev-neighbour');
  A.interviewLeave(ctx(), 'leo');
  assert.equal(A.interviewStart(ctx(), 'leo').patience, 4);
});

test('pressing says beforehand whether it pays: yes / free colour / not yet / nothing — refusals are free', () => {
  const { st, s, ctx } = game();
  A.endDay(ctx());
  A.interviewStart(ctx(), 'miriam');
  A.openTopic(ctx(), 'miriam', 't-saw');
  const view = () => projectV2(kessler, st, 'x').suspects.find((x) => x.id === 'miriam')!.topics.flatMap((t) => t.claims);
  // the sighting needs her admitted visit first: the claim says "not yet", and pressing is refused for free
  assert.equal(view().find((c) => c.id === 'c-miriam-nobody')!.press, 'later');
  const before = s.minute;
  assert.equal(reason(() => A.press(ctx(), 'miriam', 'c-miriam-nobody')), 'press_later');
  assert.equal(s.minute, before);
  assert.equal(s.claims['c-miriam-nobody'].pressed, undefined);
  // a claim with nothing behind it is shown as such and refused for free
  A.openTopic(ctx(), 'miriam', 't-thomas');
  assert.equal(view().find((c) => c.id === 'miriam.t-thomas.0')!.press, 'none');
  assert.equal(view().find((c) => c.id === 'miriam.t-thomas.0')!.canPress, false);
  assert.equal(reason(() => A.press(ctx(), 'miriam', 'miriam.t-thomas.0')), 'nothing_to_press');
  // colour only: free, said once, then done
  A.openTopic(ctx(), 'miriam', 't-evening');
  assert.equal(view().find((c) => c.id === 'c-miriam-home')!.press, 'free');
  assert.equal(view().find((c) => c.id === 'c-miriam-home')!.pressCost, 0);
  const colour = A.press(ctx(), 'miriam', 'c-miriam-home');
  assert.equal(colour.outcome, 'colour');
  assert.equal(colour.cost, 0);
  assert.equal(view().find((c) => c.id === 'c-miriam-home')!.press, 'done');
  assert.equal(reason(() => A.press(ctx(), 'miriam', 'c-miriam-home')), 'already');
  // break her alibi with the diary, then pressing the sighting works
  A.travel(ctx(), 'loc-office');
  A.inspect(ctx(), 'z-desk');
  assert.equal(A.present(ctx(), 'miriam', 'c-miriam-home', 'ev-diary').outcome, 'break');
  assert.ok('s-miriam-visit' in st.statements);
  assert.equal(view().find((c) => c.id === 'c-miriam-nobody')!.press, 'yes');
  const adv = A.press(ctx(), 'miriam', 'c-miriam-nobody');
  assert.equal(adv.outcome, 'advance');
  assert.equal(adv.cost, 15, 'a press that pays costs its 15 minutes');
  assert.deepEqual(adv.newClaims, ['c-miriam-sawleo']);
  assert.ok('s-miriam-saw-leo' in st.statements);
  assert.equal(reason(() => A.press(ctx(), 'miriam', 'c-miriam-nobody')), 'claim_closed');
});

test('presenting: a break advances the tier machine; the right item too early is resisted without patience loss', () => {
  const i = stepIndex((x) => x.do === 'deduce' && x.deduction === 'd-copy');
  const { st, s, ctx } = upTo(i + 1);
  // (the ideal day 2 is nearly spent by now; this test is about the break mechanics, not the clock)
  s.minute = Math.min(s.minute, 300);
  A.interviewStart(ctx(), 'clara');
  A.openTopic(ctx(), 'clara', 't-guadagnini');
  const br = A.present(ctx(), 'clara', 'c-clara-safe', 'f-copy-jf');
  assert.equal(br.outcome, 'break');
  assert.equal(st.suspects.clara.tiers['t-guadagnini'], 1);
  assert.ok('s-clara-copy' in st.statements, 'the new tier is recorded like v1');
  const p = s.interviews.clara.patience;
  const res = A.present(ctx(), 'clara', 'c-clara-nocopy', 'ev-workbook');
  assert.equal(res.outcome, 'resist');
  assert.match(res.line!.text, /notebook/);
  assert.equal(s.interviews.clara.patience, p);
  assert.equal(reason(() => A.present(ctx(), 'clara', 'c-clara-safe', 'f-copy-jf')), 'claim_closed');
  const composureBefore = st.suspects.clara.stress;
  assert.ok(composureBefore > kessler.suspects[0].baseline.stress, 'breaks raise stress (composure)');
});

test('a confirmed deduction unlocks what it promises', () => {
  const i = stepIndex((x) => x.do === 'deduce' && x.deduction === 'd-copy');
  const { s, ctx } = upTo(i);
  A.travel(ctx(), 'loc-office');
  A.inspect(ctx(), 'z-files');
  assert.equal(A.labStatus(ctx(), 'a-finance'), 'locked');
  assert.equal(reason(() => A.labSubmit(ctx(), 'a-finance')), 'locked');
  const e = A.deduce(ctx(), 'd-copy', { fills: { what: 'o-copy', maker: 'jonas', client: 'clara' } });
  assert.equal(e.outcome, 'confirmed');
  assert.deepEqual(e.unlocked?.map((u) => u.kind + ':' + u.id), ['analysis:a-finance']);
  assert.equal(A.labStatus(ctx(), 'a-finance'), 'available');
  assert.equal(reason(() => A.deduce(ctx(), 'd-copy', { fills: { what: 'o-copy', maker: 'jonas', client: 'clara' } })), 'already');
  assert.ok(s.deductions['d-copy'].confirmed);
});

test('timeline deductions: the lie must be set aside and the rest ordered', () => {
  const i = stepIndex((x) => x.do === 'deduce' && x.deduction === 'd-timeline');
  const { s, ctx } = upTo(i);
  // this test is about the puzzle, not the clock: the ideal reaches it with 15 minutes left, and since wave 6 misses
  // that cannot be paid in full are capped (see wave6.test.ts)
  s.minute = 0;
  assert.equal(reason(() => A.deduce(ctx(), 'd-timeline', { order: ['k1', 'k2'], outlier: 'k6' })), 'bad_fill');
  assert.equal(A.deduce(ctx(), 'd-timeline', { order: ['k1', 'k2', 'k3', 'k5', 'k4'], outlier: 'k6' }).outcome, 'wrong');
  assert.equal(A.deduce(ctx(), 'd-timeline', { order: ['k1', 'k2', 'k3', 'k4', 'k6'], outlier: 'k5' }).outcome, 'wrong');
  assert.equal(A.deduce(ctx(), 'd-timeline', { order: ['k1', 'k2', 'k3', 'k4', 'k5'], outlier: 'k6' }).outcome, 'confirmed');
});

test('the scripted ideal path ends in a confession with three stars', () => {
  const r = runPath(kessler, kessler.v2!.idealPath);
  assert.deepEqual(r.failures, []);
  const f = r.st.v2!.finale!;
  assert.equal(f.outcome, 'confession');
  assert.deepEqual(f.stars, { truth: true, proof: true, clock: true });
  assert.equal(r.st.status, 'closed');
  assert.ok('s-clara-confession' in r.st.statements);
  assert.ok(r.st.result!.culpritCorrect);
  assert.ok(r.spent <= 1440 * 0.65);
});

test('finale: retries, lost rounds, a weak case and the stars', () => {
  const i = stepIndex((x) => x.do === 'finale');
  const { s, st, ctx } = upTo(i);
  A.finaleStart(ctx(), 'clara');
  assert.equal(s.phase, 'finale');
  assert.equal(reason(() => A.travel(ctx(), 'loc-office')), 'phase', 'the investigation is closed during the finale');
  assert.equal(reason(() => A.finaleAnswer(ctx(), 'f-geneva-not-held')), 'not_owned');
  let e = A.finaleAnswer(ctx(), 'f-fobs');
  assert.equal(e.outcome, 'retry');
  e = A.finaleAnswer(ctx(), 'f-camera');
  assert.equal(e.outcome, 'lost', 'two tries per round');
  e = A.finaleAnswer(ctx(), 'f-fobs');
  e = A.finaleAnswer(ctx(), 'f-fobs'); // lie lost
  e = A.finaleAnswer(ctx(), 'd-motive'); // motive won (first try)
  assert.equal(e.outcome, 'won');
  e = A.finaleAnswer(ctx(), 'f-fobs');
  e = A.finaleAnswer(ctx(), 'ev-serology'); // means won (second try)
  e = A.finaleAnswer(ctx(), 'd-not-fall'); // staging won
  assert.ok(e.result);
  assert.equal(e.result!.outcome, 'charged', '3 of 5 rounds holds the charge');
  assert.equal(e.result!.roundsWon, 3);
  assert.equal(e.result!.firstTry, 2);
  assert.deepEqual(e.result!.stars, { truth: true, proof: false, clock: true });
  assert.equal(st.status, 'closed');
  assert.ok(!('s-clara-confession' in st.statements));
  assert.equal(reason(() => A.finaleAnswer(ctx(), 'd-not-fall')), 'phase');
});

test('accusing an innocent collapses the confrontation: wrongful, no stars', () => {
  const { st, s, ctx } = game();
  const e = A.finaleStart(ctx(), 'leo');
  assert.equal(e.outcome, 'wrongful');
  assert.equal(e.result!.starCount, 0);
  assert.match(e.message!, /does not hold/);
  assert.equal(s.phase, 'closed');
  assert.equal(st.result!.culpritCorrect, false);
  assert.equal(st.result!.rating, 'Wrongful accusation');
});

test('when the last day ends the prosecutor waits: only the finale is allowed', () => {
  const { s, ctx } = game();
  A.endDay(ctx());
  A.endDay(ctx());
  A.endDay(ctx());
  assert.equal(s.phase, 'awaiting_finale');
  assert.equal(s.day, 3);
  assert.equal(reason(() => A.travel(ctx(), 'loc-office')), 'phase');
  assert.equal(reason(() => A.endDay(ctx())), 'phase');
  assert.equal(A.finaleStart(ctx(), 'clara').ok, true);
  assert.equal(s.reports.length, 3);
  assert.equal(s.reports[0].night?.id, 'n-day1');
});

test('coop: only the lead investigator ends the day or runs the finale', () => {
  const { st, ctx } = game();
  st.mode = 'coop';
  st.hostId = 'host';
  assert.equal(reason(() => A.endDay(ctx('en', 'guest'))), 'not_host');
  assert.equal(reason(() => A.finaleStart(ctx('en', 'guest'), 'clara')), 'not_host');
  assert.equal(A.travel(ctx('en', 'guest'), 'loc-back').ok, true, 'anyone can investigate');
});

test('documents: marked phrases become facts; keys are stable across languages', () => {
  const { s, ctx, st } = game();
  const v = projectV2(kessler, st, 'x');
  const neighbour = v.notebook.evidence.find((e) => e.id === 'ev-neighbour')!;
  const seg = neighbour.body![0].find((x) => x.key)!;
  assert.equal(seg.mark, 'underline');
  assert.equal(seg.factId, undefined, 'fact id hidden until collected');
  const e = A.collect(ctx(), 'ev-neighbour', seg.key!);
  assert.deepEqual(e.newFacts, ['f-shout-2200']);
  assert.equal(A.collect(ctx(), 'ev-neighbour', seg.key!).outcome, 'already');
  assert.equal(reason(() => A.collect(ctx(), 'ev-neighbour', '9.9')), 'locked');
  assert.equal(reason(() => A.collect(ctx(), 'ev-geneva', '0.0')), 'not_owned');
  assert.ok('f-shout-2200' in s.facts);
  assert.equal(projectV2(kessler, st, 'x').notebook.evidence.find((x) => x.id === 'ev-neighbour')!.body![0].find((x) => x.key)!.factId, 'f-shout-2200');
});

test('locale: the server returns only the requested language', () => {
  const { st } = game();
  const en = projectV2(kessler, st, 'x', 'h', [], 'en');
  const tr = projectV2(kessler, st, 'x', 'h', [], 'tr');
  assert.equal(en.locale, 'en');
  assert.equal(tr.map.currentName, 'Emniyet');
  assert.equal(en.map.currentName, 'Station');
  const g = game();
  A.travel(g.ctx(), 'loc-workshop');
  A.inspect(g.ctx(), 'z-body');
  const trv = projectV2(kessler, g.st, 'x', 'h', [], 'tr');
  const d = trv.deductions.find((x) => x.id === 'd-not-fall')!;
  assert.equal(d.title, 'Düşme değil');
  assert.ok(!JSON.stringify(trv).includes('Not a fall'), 'no English shadow copy');
  assert.equal(projectV2(kessler, g.st, 'x', 'h', [], 'en').deductions.find((x) => x.id === 'd-not-fall')!.title, 'Not a fall');
  // draft content without Turkish falls back to English
  assert.equal(trv.suspects[0].name, 'Clara Kessler');
  assert.equal(localeFromHeader('tr-TR,tr;q=0.9,en;q=0.8'), 'tr');
  assert.equal(localeFromHeader('de-DE,en;q=0.5'), 'en');
  assert.equal(localeFromHeader('en;q=0.4, tr;q=0.8'), 'tr');
  assert.equal(localeFromHeader('fr'), undefined);
  assert.equal(localeFromHeader(undefined), undefined);
});

test('the v2 view never contains the truth', () => {
  const check = (json: string, extra: string[] = []) => {
    for (const secret of [
      'killerId', 'truthful', '"accept"', '"breaks"', '"press":{', '"outlier"', '"order"', 'idealPath', 'innocents',
      'actualWhereabouts', 'secrets', 'narrative', 'z-rungs', 'f-rungs-clean', 'Halberd', 'CK Atelier', 'motiveId', 'speak to a lawyer',
      'I don’t remember picking it up', 'o-copy"', '"assist"', 'toTier', ...extra,
    ]) assert.ok(!json.includes(secret), `view leaks ${secret}`);
  };
  const { st } = game();
  check(JSON.stringify(projectV2(kessler, st, 'x')), ['"k1","k2"', 'f-clara-2304']);
  // mid-game (end of day 1): still no answers, hidden zone only after it was found
  const i = stepIndex((x) => x.do === 'endDay');
  const mid = upTo(i);
  const v = projectV2(kessler, mid.st, 'x');
  const json = JSON.stringify(v);
  for (const secret of ['"accept"', '"breaks"', '"outlier"', 'Halberd', 'idealPath', 'innocents']) assert.ok(!json.includes(secret), `mid-game view leaks ${secret}`);
  // details are positions only until found
  const z = v.scenes.flatMap((sc) => sc.zones).find((x) => x.id === 'z-bench')!;
  assert.ok(z.closeUp!.details.every((d) => d.found || d.label === undefined));
  // the timeline cards are not given in solution order
  const tl = v.deductions.find((d) => d.id === 'd-timeline');
  assert.ok(tl?.cards);
  // the finale shows only the current round's defence
  const fi = stepIndex((x) => x.do === 'finale');
  const pre = upTo(fi);
  A.finaleStart(pre.ctx(), 'clara');
  const fv = projectV2(kessler, pre.st, 'x');
  assert.equal(fv.finale!.rounds[1].defence, '');
  assert.equal(fv.finale!.rounds[0].suggested.length > 0, true, 'a confirmed linked deduction brings its chips forward');
  assert.ok(!JSON.stringify(fv).includes('He wrote that'), 'reactions appear only once a round is decided');
});

test('validator: kessler v2 is valid in draft mode', () => {
  const r = validateCase(kessler);
  assert.deepEqual(r.errors, []);
  assert.ok(r.stats['v2.idealSpent'] <= 1440 * 0.65);
});

const broken = (mut: (d: CaseDefinition) => void) => {
  const d: CaseDefinition = structuredClone(kessler);
  d.meta.contentStatus = 'draft';
  mut(d);
  return validateV2(d).errors;
};

test('validator rejects an unsolvable deduction', () => {
  const errs = broken((d) => { d.v2!.deductions.find((x) => x.id === 'd-entry')!.blanks![1].accept = ['23:59']; });
  assert.ok(errs.some((e) => e.includes('d-entry')), errs.join('\n'));
  const errs2 = broken((d) => { d.v2!.deductions.find((x) => x.id === 'd-weapon')!.requires = { facts: ['f-orphan'] }; d.v2!.facts.push({ id: 'f-orphan', text: 'x' }); });
  assert.ok(errs2.some((e) => e.includes('d-weapon is unsolvable')), errs2.join('\n'));
});

test('validator rejects a fact without a reachable source', () => {
  const errs = broken((d) => { d.v2!.facts.push({ id: 'f-nowhere', text: 'Floating fact.' }); });
  assert.ok(errs.includes('fact f-nowhere has no reachable source'), errs.join('\n'));
});

test('validator rejects a finale the true culprit cannot lose within the budget', () => {
  const errs = broken((d) => { d.v2!.finale.rounds[3].accept = ['f-orphan2']; d.v2!.facts.push({ id: 'f-orphan2', text: 'x' }); });
  assert.ok(errs.some((e) => e.includes('round r-means: no accepted answer is reachable')), errs.join('\n'));
  // the ideal path running out of time
  const slow = broken((d) => { d.v2!.clock.minutesPerDay = 250; });
  assert.ok(slow.some((e) => e.includes('idealPath')), slow.join('\n'));
});

test('validator rejects an ideal path that uses more than 65% of the budget', () => {
  // pad the path with legal but pointless travel: still a confession, but far too slow
  const errs = broken((d) => {
    const path = d.v2!.idealPath;
    const pad = (n: number) => Array.from({ length: n }, (_, i) => ({ do: 'travel' as const, to: i % 2 ? 'loc-workshop' : 'loc-back' }));
    path.splice(path.findIndex((x) => x.do === 'finale'), 0, ...pad(15));
  });
  assert.deepEqual(errs.filter((e) => !e.startsWith('idealPath uses')), []);
  assert.ok(errs.some((e) => /idealPath uses \d+ of 1440 minutes \(\d+% > 65%\)/.test(e)), errs.join('\n'));
});

test('validator rejects missing translations unless the case is a draft', () => {
  const stripTr = (d: CaseDefinition) => { for (const f of d.v2!.facts) f.text = typeof f.text === 'string' ? f.text : f.text.en; };
  const errs = broken((d) => { stripTr(d); d.meta.contentStatus = 'final'; });
  assert.ok(errs.some((e) => e.startsWith('i18n ')), errs.join('\n'));
  assert.ok(errs.some((e) => e.includes('more strings lack en or tr')));
  const draftCase = structuredClone(kessler);
  stripTr(draftCase);
  draftCase.meta.contentStatus = 'draft';
  const draft = validateV2(draftCase);
  assert.ok(draft.warnings.some((w) => w.includes('lack Turkish')));
});

test('validator rejects locks nothing opens, bad references and mismatched document markup', () => {
  const lock = broken((d) => { d.locations[0].v2 = { locked: true }; });
  assert.ok(lock.includes('location:loc-workshop is locked and nothing unlocks it'));
  const ref = broken((d) => { d.suspects[0].topics[0].tiers[0].claims![0].breaks![0].by.push('f-typo'); });
  assert.ok(ref.some((e) => e.includes('"f-typo" is not a fact or evidence')));
  const mk = broken((d) => {
    const e = d.evidence.find((x) => x.id === 'ev-neighbour')!;
    e.body![0] = { en: tx(e.body![0], 'en'), tr: 'Saat ona doğru {{f-thump-2320|bir kadının bağırdığını}} duydum.' };
  });
  assert.ok(mk.some((e) => e.includes('en and tr mark different facts')), mk.join('\n'));
  const lab = broken((d) => { d.analyses[0].v2 = { minutes: 30 }; });
  assert.ok(lab.some((e) => e.includes('outside 120–360')));
  const fin = broken((d) => { delete d.v2!.finale.innocents.leo; });
  assert.ok(fin.includes('finale.innocents: no collapse for leo'));
});

test('free-question keywords may be Turkish', () => {
  const clara = structuredClone(kessler.suspects.find((x) => x.id === 'clara')!);
  clara.topics.find((t) => t.id === 't-evening')!.keywords[0].push('neredeydiniz', 'akşam');
  assert.equal(classifyOffline(clara, 'Perşembe AKŞAM neredeydiniz?').topicIds[0], 't-evening');
  assert.equal(classifyOffline(clara, 'İyi misiniz?').tone, 'neutral');
});

test('composure only slips: no break ever moves a suspect back towards composed', () => {
  const order = ['composed', 'uneasy', 'strained', 'breaking'];
  const path = kessler.v2!.idealPath;
  let prev: Record<string, number> = {};
  for (let n = 1; n <= path.length; n++) {
    if (path[n - 1].do !== 'present') continue;
    const v = projectV2(kessler, upTo(n).st, 'x');
    for (const sus of v.suspects) {
      const level = order.indexOf(sus.composure);
      assert.ok(level >= (prev[sus.id] ?? 0), `${sus.id} went ${order[prev[sus.id]]} → ${sus.composure} after step ${n}`);
      prev = { ...prev, [sus.id]: level };
    }
  }
  // Jonas owning up to the copy (a v1 "relief" tier) still costs him composure
  const jonas = projectV2(kessler, upTo(path.length).st, 'x').suspects.find((x) => x.id === 'jonas')!;
  assert.notEqual(jonas.composure, 'composed');
});

test('timeline cards: a stable shuffle while open, the proven order once confirmed', () => {
  const { st } = game();
  const i = stepIndex((x) => x.do === 'deduce' && x.deduction === 'd-timeline');
  const before = upTo(i);
  const open = projectV2(kessler, before.st, 'x').deductions.find((d) => d.id === 'd-timeline')!;
  const again = projectV2(kessler, before.st, 'y').deductions.find((d) => d.id === 'd-timeline')!;
  const ids = open.cards!.map((c) => c.id);
  assert.deepEqual(ids, again.cards!.map((c) => c.id), 'stable between requests and viewers');
  assert.notDeepEqual(ids, [...ids].sort(), 'not in id order');
  const step = kessler.v2!.idealPath[i] as { order: string[]; outlier?: string };
  const seq = ids.filter((id) => step.order.includes(id));
  assert.notDeepEqual(seq, step.order, 'not the solution order');
  assert.notDeepEqual(seq, [...step.order].reverse(), 'not the solution reversed');
  for (const c of [kessler, firstWatch]) {
    for (const d of c.v2!.deductions.filter((x) => x.kind === 'timeline')) {
      const v = projectV2(c, newSessionState(c, 'h', 0), 'x').deductions.find((x) => x.id === d.id);
      if (!v) continue;
      const got = v.cards!.map((k) => k.id).filter((id) => d.order!.includes(id));
      assert.notDeepEqual(got, d.order);
      assert.notDeepEqual(got, [...d.order!].reverse());
    }
  }
  assert.equal(open.setAside, undefined);
  const after = projectV2(kessler, upTo(i + 1).st, 'x').deductions.find((d) => d.id === 'd-timeline')!;
  assert.equal(after.status, 'confirmed');
  assert.deepEqual(after.cards!.slice(0, step.order.length).map((c) => c.id), step.order);
  assert.equal(after.setAside, step.outlier);
  void st;
});

test('press and present events name the claim', () => {
  const i = stepIndex((x) => x.do === 'present');
  const r = upTo(i);
  const step = kessler.v2!.idealPath[i] as { suspect: string; claim: string; item: string };
  const e = A.present(r.ctx(), step.suspect, step.claim, step.item);
  assert.equal(e.outcome, 'break');
  assert.equal(e.claimId, step.claim);
});
