// Wave 4 (Agent K): the clock forces choices again, with optional content that is worth having but not all
// affordable — and verdicts fit the crime. These stay true.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kessler } from '../cases/kessler.ts';
import { firstWatch } from '../cases/first-watch.ts';
import { ALL_CASES } from '../cases/index.ts';
import type { CaseDefinition, PathStep } from './types.ts';
import { ActionError } from './actions.ts';
import { sys } from './i18n.ts';
import * as A from './v2/actions.ts';
import { projectV2 } from './v2/projection.ts';
import { EXHAUSTIVE_MIN_SHARE, exhaustive, IDEAL_MAX_SHARE, runNewcomer, runPath, validateV2 } from './v2/validate.ts';
import { proofNeeds, totalBudget } from './v2/state.ts';

const reason = (fn: () => unknown) => {
  try { fn(); } catch (e) { if (e instanceof ActionError) return e.reason; throw e; }
  return 'no error';
};

/** Replay the ideal path up to (not including) the first step matching `stop`, then hand over the state. */
function upTo(def: CaseDefinition, stop: (s: PathStep) => boolean, sim = false) {
  const steps = def.v2!.idealPath;
  const i = steps.findIndex(stop);
  const r = runPath(def, steps.slice(0, i < 0 ? steps.length : i));
  assert.deepEqual(r.failures, []);
  if (sim) r.st.v2!.sim = true;
  let now = 10_000;
  const ctx = (locale: 'en' | 'tr' = 'en'): A.Ctx => ({ def, st: r.st, now: now++, locale });
  return { st: r.st, s: r.st.v2!, ctx };
}

// ── the budget targets (PLAN_V2 §3.1: ideal ~60 %, everything ~140 %)

for (const def of ALL_CASES) {
  test(`${def.id}: the ideal path fits (≤ ${IDEAL_MAX_SHARE * 100} %) and, for a full case, doing everything does not (≥ ${EXHAUSTIVE_MIN_SHARE * 100} %)`, () => {
    const v2 = def.v2!;
    const budget = totalBudget(v2);
    const ideal = runPath(def, v2.idealPath);
    assert.deepEqual(ideal.failures, []);
    assert.ok(ideal.spent <= budget * IDEAL_MAX_SHARE, `ideal ${ideal.spent}/${budget}`);
    const ex = exhaustive(def);
    if (!def.meta.tutorial) {
      assert.ok(ex.spent >= budget * EXHAUSTIVE_MIN_SHARE, `exhaustive ${ex.spent}/${budget}`);
      assert.ok(ideal.spent >= budget * 0.55, `ideal ${ideal.spent}/${budget}: too easy`);
    }
    // the newcomer guarantees of wave 3 hold with the new content
    const nc = runNewcomer(def);
    if (nc) {
      assert.deepEqual(nc.run.failures, []);
      assert.ok(nc.firstWin && nc.firstWin.day === 1 && nc.firstWin.realMinutes <= v2.newcomerPath!.firstWinRealMinutes);
      assert.ok(nc.day1Confirmed >= v2.newcomerPath!.minConfirmedDay1);
    }
  });
}

test('the validator rejects a full case where doing everything fits comfortably', () => {
  const easy: CaseDefinition = structuredClone(kessler);
  easy.v2!.clock.days = 4; // 1920 minutes: the same content no longer forces a choice
  const r = validateV2(easy);
  assert.ok(r.errors.some((e) => e.includes('the clock forces no choices')), r.errors.join('\n'));
  // the tutorial may stay easy: only a warning
  const t = validateV2(firstWatch);
  assert.deepEqual(t.errors, []);
  assert.ok(t.warnings.some((w) => w.includes('tutorial')));
});

test('the ideal Kessler run does one side question: the Proof star needs 11 of 13', () => {
  assert.deepEqual(proofNeeds(kessler.v2!), { firstTry: 4, deductions: 11 });
  assert.equal(kessler.v2!.deductions.length, 13);
  const r = runPath(kessler, kessler.v2!.idealPath);
  const confirmed = Object.entries(r.st.v2!.deductions).filter(([, d]) => d.confirmed).map(([id]) => id);
  assert.equal(confirmed.length, 11);
  assert.ok(confirmed.includes('d-clean'), 'the side question it chose');
  assert.equal(r.st.v2!.finale?.stars?.proof, true);
  const v = projectV2(kessler, r.st, 'x');
  assert.deepEqual(v.proofStar, { deductionsNeeded: 11, deductionsConfirmed: 11, deductionsTotal: 13, firstTryNeeded: 4, roundsTotal: 5 });
  assert.deepEqual(v.result?.proofNeeds, { firstTry: 4, deductions: 11 });
});

// ── the night fork

test('night fork: offered after day 1 once Clara is placed, answered before anything else; chasing costs the morning', () => {
  const { s, ctx } = upTo(kessler, (x) => x.do === 'nightChoice');
  assert.equal(s.day, 2);
  let v = projectV2(kessler, ctx().st, 'x');
  assert.equal(v.fork?.id, 'n1-volvo');
  assert.equal(v.fork?.pending, true);
  assert.deepEqual(v.fork?.options.map((o) => [o.id, o.minutes, o.lab?.analysisId]), [['fk-morning', 0, 'a-volvo'], ['fk-tonight', 60, undefined]]);
  assert.equal(v.fork?.defaultOption, 'fk-morning');
  assert.equal(reason(() => A.nightChoice(ctx(), 'fk-nope')), 'locked');
  const before = s.spent;
  const e = A.nightChoice(ctx('tr'), 'fk-tonight');
  assert.equal(e.kind, 'night_choice');
  assert.equal(e.cost, 60);
  assert.equal(s.minute, 60, 'the day starts an hour late');
  assert.equal(s.spent, before + 60);
  assert.ok(e.newFacts?.includes('f-volvo-naphtha'));
  assert.match(e.message!, /svap/); // Turkish; since wave 6 the option text no longer gives the finding away
  v = projectV2(kessler, ctx().st, 'x');
  assert.equal(v.fork, undefined);
  assert.equal(v.reports[0].fork?.chosen, 'fk-tonight');
  assert.equal(reason(() => A.nightChoice(ctx(), 'fk-morning')), 'no_fork');
});

test('night fork: acting without answering settles the default — the lab takes the swabs and a slot until noon', () => {
  const { s, st, ctx } = upTo(kessler, (x) => x.do === 'nightChoice');
  const before = s.spent;
  A.labCollect(ctx()); // any action first settles the fork
  assert.equal(s.spent, before, 'the default costs no minutes');
  assert.equal(s.reports[0].fork?.chosen, 'fk-morning');
  assert.ok('ev-volvo' in st.evidence);
  assert.ok(!('f-volvo-naphtha' in s.facts), 'the result is not in yet');
  const job = s.lab.find((j) => j.analysisId === 'a-volvo')!;
  assert.equal(job.readyAt - job.submittedAt, 240);
  // with a slot taken, the ideal morning cannot send both the post-mortem and the alibi check: a real trade
  A.labSubmit(ctx(), 'a-autopsy');
  assert.equal(reason(() => A.labSubmit(ctx(), 'a-anchor')), 'lab_full');
  A.wait(ctx(), { until: 'lab' });
  A.labCollect(ctx());
  assert.ok('f-volvo-naphtha' in s.facts);
});

test('night fork: the validator wants every option to give something, and two options at least', () => {
  const bad: CaseDefinition = structuredClone(kessler);
  const fork = bad.v2!.nightEvents!.find((n) => n.id === 'n1-volvo')!;
  fork.choice!.options[1] = { id: 'fk-nothing', label: { en: 'Nothing', tr: 'Hiçbir şey' }, text: { en: 'Nothing.', tr: 'Hiçbir şey.' }, minutes: 30 };
  assert.ok(validateV2(bad).errors.some((e) => e.includes('fk-nothing: the option gives nothing')));
  fork.choice!.options = fork.choice!.options.slice(0, 1);
  assert.ok(validateV2(bad).errors.some((e) => e.includes('at least two options')));
});

// ── shortcuts and side leads pay off

test('shortcut: the Geneva catalogue breaks Clara straight to the sale, and her admission proves the motive without the warrant', () => {
  const { s, st, ctx } = upTo(kessler, (x) => x.do === 'endDay', true);
  s.facts['f-halberd-listed'] = { day: 1, minute: 0, seq: 999, src: { type: 'document', ref: 'ev-brandl' } };
  A.interviewStart(ctx(), 'clara');
  A.openTopic(ctx(), 'clara', 't-guadagnini');
  const br = A.present(ctx(), 'clara', 'c-clara-safe', 'f-halberd-listed');
  assert.equal(br.outcome, 'break');
  assert.equal(st.suspects.clara.tiers['t-guadagnini'], 2, 'skips "ask Jonas"');
  assert.ok('f-clara-sold' in s.facts);
  assert.ok(!('ev-geneva' in st.evidence));
  // the loan and the notice from the office, then the motive is filed with her own words
  for (const f of ['f-clara-loan', 'f-notice']) s.facts[f] = { day: 1, minute: 0, seq: 999, src: { type: 'document' } };
  st.evidence['ev-accounts'] = 1;
  const d = A.deduce(ctx(), 'd-motive', { fills: { who: 'clara', sale: 'f-clara-sold', debt: 'f-clara-loan', deadline: 'f-notice' } });
  assert.equal(d.outcome, 'confirmed');
});

test('shortcut: following the money opens the financial warrant without the violin examiner', () => {
  const { s, ctx } = upTo(kessler, (x) => x.do === 'endDay', true);
  assert.equal(A.labStatus(ctx(), 'a-finance'), 'locked');
  for (const f of ['f-bank-papers', 'f-loan-repaid', 'f-geneva-trip']) s.facts[f] = { day: 1, minute: 0, seq: 999, src: { type: 'scene' } };
  const e = A.deduce(ctx(), 'd-money', { fills: { who: 'clara', papers: 'f-bank-papers', repaid: 'f-loan-repaid', geneva: 'f-geneva-trip' } });
  assert.equal(e.outcome, 'confirmed');
  assert.deepEqual(e.unlocked?.map((u) => `${u.kind}:${u.id}`), ['analysis:a-finance']);
  assert.ok(!s.deductions['d-copy']?.confirmed);
  assert.equal(A.labStatus(ctx(), 'a-finance'), 'available');
});

test('the false trail: Miriam resists clause nine until the deadline and the notice meet; then Brandl can be asked', () => {
  const { s, st, ctx } = upTo(kessler, (x) => x.do === 'endDay', true);
  s.facts['f-clause-death'] = { day: 1, minute: 0, seq: 999, src: { type: 'document' } };
  s.facts['f-brandl'] = { day: 1, minute: 0, seq: 999, src: { type: 'document' } };
  st.evidence['ev-lawyerletter'] = 1;
  A.interviewStart(ctx(), 'miriam');
  A.openTopic(ctx(), 'miriam', 't-clause');
  assert.equal(A.present(ctx(), 'miriam', 'c-miriam-clause', 'f-brandl').outcome, 'resist');
  assert.equal(A.labStatus(ctx(), 'a-brandl'), 'locked');
  s.facts['f-notice'] = { day: 1, minute: 0, seq: 999, src: { type: 'document' } };
  assert.equal(A.present(ctx(), 'miriam', 'c-miriam-clause', 'f-brandl').outcome, 'break');
  assert.ok('s-miriam-clause' in st.statements);
  A.labSubmit(ctx(), 'a-brandl');
  A.labCollect(ctx());
  assert.ok('ev-brandl' in st.evidence);
  // the payoff is real: the catalogue shocks the owner (copy chain) and opens Clara (motive)
  A.collect(ctx(), 'ev-brandl', '0.0');
  assert.ok('f-halberd-listed' in s.facts);
});

test('side questions make finale rounds easier: the lamp list answers opportunity, the cleaned mallet answers means', () => {
  const v2 = kessler.v2!;
  const round = (k: string) => v2.finale.rounds.find((r) => r.kind === k)!;
  assert.ok(round('opportunity').accept.includes('d-courtyard') && round('opportunity').assist!.includes('d-courtyard'));
  assert.ok(round('means').accept.includes('d-clean') && round('means').assist!.includes('d-clean'));
  assert.ok(round('motive').accept.includes('f-clara-sold'));
  // and the exhaustive player can reach both side questions
  const ex = exhaustive(kessler);
  for (const d of ['d-courtyard', 'd-clean', 'd-money']) assert.ok(ex.st.v2!.deductions[d]?.confirmed, d);
});

// ── verdicts fit the crime

test('verdict wording follows the crime: a theft has a thief, a murder a killer — in both languages', () => {
  for (const locale of ['en', 'tr'] as const) {
    const theft = A.verdictDetail(firstWatch, 'weak', locale);
    const murder = A.verdictDetail(kessler, 'weak', locale);
    assert.doesNotMatch(theft, /killer|katil/i);
    assert.match(theft, locale === 'en' ? /thief/ : /Hırsız/);
    assert.match(murder, locale === 'en' ? /killer/ : /Katil/);
    assert.doesNotMatch(A.verdictDetail(firstWatch, 'wrongful', locale), /killer|katil/i);
    // outcomes without a crime-specific line fall back to the shared one
    assert.equal(A.verdictDetail(firstWatch, 'confession', locale), sys('verdict_detail_confession', locale));
  }
});

test('First Watch, weak case: the closed view names a thief, and says what the case is', () => {
  const { ctx, st } = upTo(firstWatch, (x) => x.do === 'finale');
  A.finaleStart(ctx(), 'ada');
  A.finaleAnswer(ctx(), 'd-fw-who'); // round 1 won
  for (let i = 0; i < 6; i++) if (st.v2!.finale?.status === 'running') A.finaleAnswer(ctx(), 'f-case-key');
  for (const locale of ['en', 'tr'] as const) {
    const v = projectV2(firstWatch, st, 'x', undefined, [], locale);
    assert.equal(v.result?.outcome, 'weak');
    assert.equal(v.result?.crime, 'theft');
    assert.equal(v.case.crime, 'theft');
    assert.doesNotMatch(v.result!.detail, /killer|katil/i);
  }
  assert.doesNotMatch(st.result!.ratingDetail, /killer/i);
});
