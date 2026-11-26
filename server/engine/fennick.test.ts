// Wave 7 (Agent S): the third case, "Ash and Glaze" (fennick-yard, an arson) plays end to end under the real rules,
// never shows its truth, words its verdicts for a fire — and the PLAYTEST_V4 §7.6 content fixes stay fixed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fennick } from '../cases/fennick.ts';
import { kessler } from '../cases/kessler.ts';
import { firstWatch } from '../cases/first-watch.ts';
import { ALL_CASES } from '../cases/index.ts';
import type { CaseDefinition, PathStep } from './types.ts';
import { newSessionState } from './state.ts';
import { validateCase } from './validate.ts';
import * as A from './v2/actions.ts';
import { projectV2 } from './v2/projection.ts';
import { exhaustive, runPath } from './v2/validate.ts';
import { proofNeeds, totalBudget } from './v2/state.ts';
import { GameService } from '../service.ts';
import { FileStore } from '../store/fileStore.ts';

/** Replay the ideal path up to (not including) the first step matching `stop`. */
function upTo(def: CaseDefinition, stop: (s: PathStep) => boolean) {
  const steps = def.v2!.idealPath;
  const i = steps.findIndex(stop);
  const r = runPath(def, steps.slice(0, i < 0 ? steps.length : i));
  assert.deepEqual(r.failures, []);
  let now = 50_000;
  const ctx = (locale: 'en' | 'tr' = 'en'): A.Ctx => ({ def, st: r.st, now: now++, locale });
  return { st: r.st, s: r.st.v2!, ctx };
}

const nthStep = (pred: (s: PathStep) => boolean, n = 0) => {
  let seen = -1;
  return (s: PathStep) => pred(s) && ++seen === n;
};

test('fennick-yard is registered, valid, an arson, and a Detective Plus case', () => {
  assert.ok(ALL_CASES.includes(fennick));
  assert.equal(fennick.meta.crime, 'arson');
  assert.equal(fennick.meta.tier, 'plus');
  const r = validateCase(fennick);
  assert.deepEqual(r.errors, []);
  assert.equal(fennick.suspects.length, 3);
  assert.ok(fennick.v2!.deductions.length >= 10);
  assert.ok(fennick.v2!.deductions.some((d) => d.kind === 'timeline'));
  assert.ok(fennick.locations.length >= 4 && fennick.locations.length <= 6);
  // ids that art is keyed by never collide with another case (portraits by suspect id, close-ups by zone id, items by evidence id)
  const others = ALL_CASES.filter((c) => c !== fennick);
  const ids = (c: CaseDefinition) => new Set([...c.suspects.map((s) => s.id), ...c.evidence.map((e) => e.id), ...(c.v2?.scenes ?? []).flatMap((sc) => sc.zones.map((z) => z.id))]);
  const mine = ids(fennick);
  for (const o of others) for (const id of ids(o)) assert.ok(!mine.has(id), `art key ${id} is also used by ${o.id}`);
});

test('the ideal run: a confession with three stars, inside the budget targets', () => {
  const r = runPath(fennick, fennick.v2!.idealPath);
  assert.deepEqual(r.failures, []);
  const f = r.st.v2!.finale!;
  assert.equal(f.accusedId, 'oskar');
  assert.equal(f.outcome, 'confession');
  assert.deepEqual(f.stars, { truth: true, proof: true, clock: true });
  assert.ok('s-oskar-confession' in r.st.statements);
  const budget = totalBudget(fennick.v2!);
  assert.ok(r.spent >= budget * 0.55 && r.spent <= budget * 0.65, `ideal ${r.spent}/${budget}`);
  const confirmed = Object.values(r.st.v2!.deductions).filter((d) => d.confirmed).length;
  assert.ok(confirmed >= proofNeeds(fennick.v2!).deductions);
  assert.ok(confirmed < fennick.v2!.deductions.length, 'the perfect run still skips a side question');
  // doing everything does not fit
  const ex = exhaustive(fennick);
  assert.ok(ex.spent >= budget * 1.25, `exhaustive ${ex.spent}/${budget}`);
  assert.equal(Object.values(ex.st.v2!.deductions).filter((d) => d.confirmed).length, fennick.v2!.deductions.length);
});

test('the result says arson: legacy `crime` for old clients, `offence` for new ones, wording for a fire in both languages', () => {
  const { ctx, st } = upTo(fennick, (x) => x.do === 'finale');
  A.finaleStart(ctx(), 'oskar');
  for (const a of ['d-timeline', 'f-inspection', 'd-motive', 'd-oil', 'd-staged']) A.finaleAnswer(ctx(), a);
  for (const locale of ['en', 'tr'] as const) {
    const v = projectV2(fennick, st, 'x', undefined, [], locale);
    assert.equal(v.result?.outcome, 'confession');
    assert.equal(v.result?.offence, 'arson');
    assert.equal(v.result?.crime, 'murder', 'older clients get the victim wording, not the theft wording');
    assert.equal(v.case.offence, 'arson');
    const { crime: _legacy, ...caseText } = v.case;
    const words = JSON.stringify([v.result?.detail, v.result?.title, caseText]).toLowerCase();
    assert.doesNotMatch(words, /killer|murder|katil|cinayet|thief|hırsız/);
  }
  for (const locale of ['en', 'tr'] as const) {
    assert.match(A.verdictDetail(fennick, 'weak', locale), locale === 'en' ? /set the fire/ : /Yangını çıkaran/);
    assert.match(A.verdictDetail(fennick, 'wrongful', locale), locale === 'en' ? /set the fire/ : /Yangını çıkaran/);
    assert.doesNotMatch(A.verdictDetail(fennick, 'wrongful', locale), /killer|katil|thief|hırsız/i);
  }
});

test('a wrong accusation collapses: Bram and Selma both have an alibi the defence will use', () => {
  for (const accused of ['bram', 'selma']) {
    const st = newSessionState(fennick, 'h', 0);
    let now = 1;
    const ctx = (): A.Ctx => ({ def: fennick, st, now: now++, locale: 'tr' });
    const e = A.finaleStart(ctx(), accused);
    assert.equal(e.outcome, 'wrongful');
    assert.equal(e.result!.starCount, 0);
    assert.ok(e.message && e.message.length > 40, 'the collapse is told');
    assert.match(e.result!.detail, /Yangını çıkaran/);
    assert.equal(st.result!.culpritCorrect, false);
  }
  // even late, with the whole case in hand, the wrong name loses
  const { ctx, st } = upTo(fennick, (x) => x.do === 'finale');
  assert.equal(A.finaleStart(ctx(), 'bram').outcome, 'wrongful');
  assert.equal(st.v2!.finale?.outcome, 'wrongful');
});

test('the confrontation punishes guessing: wrong chips lose rounds and the Truth star needs the motive and the means', () => {
  const { ctx } = upTo(fennick, (x) => x.do === 'finale');
  A.finaleStart(ctx(), 'oskar');
  assert.equal(A.finaleAnswer(ctx(), 'd-timeline').outcome, 'won');
  assert.equal(A.finaleAnswer(ctx(), 'f-call-0158').outcome, 'retry');
  assert.equal(A.finaleAnswer(ctx(), 'f-call-0158').outcome, 'lost'); // the lie round
  assert.equal(A.finaleAnswer(ctx(), 'd-motive').outcome, 'won');
  assert.equal(A.finaleAnswer(ctx(), 'f-call-0158').outcome, 'retry');
  assert.equal(A.finaleAnswer(ctx(), 'f-call-0158').outcome, 'lost'); // the means round
  const e = A.finaleAnswer(ctx(), 'd-staged');
  assert.equal(e.result?.outcome, 'charged');
  assert.equal(e.result?.stars.truth, false, 'the means never landed');
});

test('the duel: Selma breaks on her own pots, then on the heater; Dahl resists the camera until the night is in order', () => {
  // end of day 1 in the ideal run: Selma has given up the heater, Dahl has only told the taxi story
  const { st, s, ctx } = upTo(fennick, (x) => x.do === 'endDay');
  assert.equal(st.suspects.selma.tiers['t-night'], 2);
  assert.ok('f-heater-corner' in s.facts);
  assert.ok(s.deductions['d-staged']?.confirmed);
  // jump to Dahl's walk with the camera but without the timeline: the right item is resisted, patience kept
  s.sim = true;
  s.facts['f-walker-0131'] = { day: 1, minute: 0, seq: 999, src: { type: 'document', ref: 'ev-ostkai' } };
  s.facts['f-no-taxi'] = { day: 1, minute: 0, seq: 999, src: { type: 'document', ref: 'ev-taxibook' } };
  A.interviewStart(ctx(), 'oskar');
  assert.equal(A.present(ctx(), 'oskar', 'c-oskar-taxi', 'f-no-taxi').outcome, 'break');
  const patience = s.interviews.oskar.patience;
  const r = A.present(ctx(), 'oskar', 'c-oskar-walked', 'f-walker-0131');
  assert.equal(r.outcome, 'resist');
  assert.equal(s.interviews.oskar.patience, patience);
  // his slip: pressing the kiln story yields a fact nobody told him
  A.openTopic(ctx(), 'oskar', 't-fire');
  s.facts['f-heater-banned'] = { day: 1, minute: 0, seq: 999, src: { type: 'document', ref: 'ev-agnes' } };
  assert.equal(A.present(ctx(), 'oskar', 'c-oskar-heater', 'f-heater-banned').outcome, 'break');
  const p = A.press(ctx(), 'oskar', 'c-oskar-kiln');
  assert.ok(p.newFacts?.includes('f-oskar-knew'));
});

test('night forks: chase the doorman tonight (an hour) or let the airport police take a lab line', () => {
  const at = nthStep((x) => x.do === 'nightChoice');
  const { s, ctx } = upTo(fennick, at);
  let v = projectV2(fennick, ctx().st, 'x');
  assert.equal(v.fork?.id, 'n1-teo');
  assert.deepEqual(v.fork?.options.map((o) => [o.id, o.minutes, o.lab?.analysisId]), [['fk-teo-written', 0, 'a-teo'], ['fk-teo-tonight', 60, undefined]]);
  // the option text is read before choosing: it must not give the doorman's answer away
  for (const o of v.fork!.options) assert.doesNotMatch(o.text, /foot|walk|01:10/i);
  // the story event of the same night brought the dealer in
  assert.equal(v.reports[0].night?.id, 'n1-kranz');
  // default: no minutes, a lab line until about 13:00
  A.labCollect(ctx());
  assert.equal(s.minute, 0);
  assert.ok(s.lab.some((j) => j.analysisId === 'a-teo' && j.readyAt - j.submittedAt === 240));
  assert.ok(!('f-teo-foot' in s.facts));
  v = projectV2(fennick, ctx().st, 'x');
  assert.equal(v.fork, undefined);
});

test('“not yet” on open cards: shown while the notebook cannot fill a question, gone once it can (never which blank)', () => {
  // the heater question opens as soon as the plug is seen, long before Selma says where the heater stood
  const g = upTo(fennick, (x) => x.do === 'inspect' && x.zone === 'z-fy-kiln');
  let d = projectV2(fennick, g.st, 'x').deductions.find((x) => x.id === 'd-staged')!;
  assert.equal(d.status, 'open');
  assert.match(d.notYet ?? '', /Not yet/);
  assert.equal(projectV2(fennick, g.st, 'x', undefined, [], 'tr').deductions.find((x) => x.id === 'd-staged')!.notYet?.startsWith('Henüz değil'), true);
  const done = upTo(fennick, (x) => x.do === 'deduce' && x.deduction === 'd-staged');
  d = projectV2(fennick, done.st, 'x').deductions.find((x) => x.id === 'd-staged')!;
  assert.equal(d.notYet, undefined, 'every blank can be filled now');
  // Kessler's motive card (PLAYTEST_V4 §7.6): opens with the accounts binder, says "not yet" until the sale is known
  const k = upTo(kessler, (x) => x.do === 'deduce' && x.deduction === 'd-motive');
  const km = projectV2(kessler, k.st, 'x').deductions.find((x) => x.id === 'd-motive')!;
  assert.equal(km.notYet, undefined, 'the ideal run holds everything when it files');
  k.s.facts = Object.fromEntries(Object.entries(k.s.facts).filter(([id]) => !['f-halberd-paid', 'f-halberd-bought', 'f-clara-sold'].includes(id)));
  assert.match(projectV2(kessler, k.st, 'x').deductions.find((x) => x.id === 'd-motive')!.notYet ?? '', /books show a hole/);
  // without an authored line the engine's own one is used (First Watch: the log line alone does not answer it)
  const fw = upTo(firstWatch, (x) => x.do === 'interview' && x.suspect === 'nils');
  const who = projectV2(firstWatch, fw.st, 'x').deductions.find((x) => x.id === 'd-fw-who')!;
  assert.match(who.notYet ?? '', /Not yet/);
  assert.ok(!JSON.stringify(who).includes('f-bag-heavy'), 'the hint never names the missing item');
});

test('PLAYTEST_V4 §7.6: the brass polish is not filed under Ada before she is a suspect', () => {
  const polish = firstWatch.v2!.facts.find((f) => f.id === 'f-polish')!;
  assert.equal(polish.about, undefined);
});

test('the fennick view never contains the truth — not at the start, not mid-case', () => {
  const secrets = [
    'killerId', 'truthful', '"accept"', '"breaks"', '"press":{', '"outlier"', '"order"', 'idealPath', 'innocents', 'actualWhereabouts', 'secrets',
    'narrative', 'motiveId', '"assist"', 'toTier', 'I would like my solicitor', 'Bundan sonrasını avukatım', 'f-oskar-knew', 'z-fy-slip',
    'f-shoeprint', 'burned his shoes', '4417', 'won’t be a problem by Monday',
  ];
  const check = (json: string, extra: string[] = []) => { for (const x of [...secrets, ...extra]) assert.ok(!json.includes(x), `view leaks ${x}`); };
  const st = newSessionState(fennick, 'h', 0);
  check(JSON.stringify(projectV2(fennick, st, 'x')), ['Norrhavn', 'f-gate-0136', '"k1","k2"', 'z-fy-trail']);
  check(JSON.stringify(projectV2(fennick, st, 'x', undefined, [], 'tr')), ['Norrhavn']);
  // end of day 1: still no answers; hidden zones only once found
  const mid = upTo(fennick, (x) => x.do === 'endDay');
  const v = projectV2(fennick, mid.st, 'x');
  const json = JSON.stringify(v);
  check(json, ['Norrhavn']);
  assert.ok(v.scenes.flatMap((sc) => sc.zones).some((z) => z.id === 'z-fy-trail'), 'the UV trail was found on day 1');
  // the finale shows only the current round's defence
  const pre = upTo(fennick, (x) => x.do === 'finale');
  A.finaleStart(pre.ctx(), 'oskar');
  const fv = projectV2(fennick, pre.st, 'x');
  assert.equal(fv.finale!.rounds[1].defence, '');
  assert.ok(!JSON.stringify(fv).includes('I would like my solicitor'));
});

test('the case list shows it locked for a free player, and a Plus player can open it', async () => {
  const SECRET = 'whsec_fennick';
  const s = new GameService(new FileStore(mkdtempSync(path.join(tmpdir(), 'indicia-fennick-'))), { provider: null, priceIn: 0, priceOut: 0 }, {
    perMinute: 1000, billing: { entitlementId: 'plus', allowDevPurchases: false, webhookAuth: SECRET },
  });
  const U = 'dev-fennick-0001';
  let list = await s.listCases(U, 'tr');
  const c = list.find((x) => x.id === 'fennick-yard')!;
  assert.equal(c.title, 'Kül ve Sır');
  assert.equal(c.locked, true);
  assert.equal(c.offence, 'arson');
  assert.equal(c.crime, 'murder');
  await assert.rejects(() => s.startSession(U, 'fennick-yard', false), /Plus/);
  await s.handleRevenueCatWebhook(`Bearer ${SECRET}`, {
    event: { type: 'INITIAL_PURCHASE', app_user_id: U, entitlement_ids: ['plus'], product_id: 'indicia_plus_monthly', expiration_at_ms: Date.now() + 86400_000 },
  });
  list = await s.listCases(U, 'en');
  assert.equal(list.find((x) => x.id === 'fennick-yard')!.locked, false);
  const { sessionId } = await s.startSession(U, 'fennick-yard', false);
  assert.ok(sessionId);
});
