// Time-budget simulator: replays each case's ideal path under the real rules and runs an exhaustive
// player (does everything once, unlimited time), then prints minutes used vs the budget.
//   npm run simulate:budget            all cases
//   npm run simulate:budget -- --steps show every step of the ideal path
import { ALL_CASES } from '../server/cases/index.ts';
import { EXHAUSTIVE_MIN_SHARE, exhaustive, IDEAL_MAX_SHARE, runNewcomer, runPath } from '../server/engine/v2/validate.ts';
import { claimsOf, clockLabel, hm, proofNeeds, totalBudget } from '../server/engine/v2/state.ts';
import { runTeamPath } from '../server/engine/v2/teamsim.ts';
import { budgetFor } from '../server/engine/v2/coop.ts';

const showSteps = process.argv.includes('--steps');
const pct = (n: number, d: number) => `${Math.round((n / d) * 100)}%`;
let failed = false;

for (const def of ALL_CASES) {
  const v2 = def.v2;
  if (!v2) {
    console.log(`\n■ ${def.id} — no v2 layer`);
    continue;
  }
  const budget = totalBudget(v2);
  const ideal = runPath(def, v2.idealPath);
  const ex = exhaustive(def);
  const fin = ideal.st.v2!.finale;
  console.log(`\n■ ${def.id} — ${v2.clock.days} days × ${v2.clock.minutesPerDay} min = ${budget} min`);
  console.log(`  ideal path      spent ${ideal.spent} min (${pct(ideal.spent, budget)} of budget, limit ${IDEAL_MAX_SHARE * 100}%), clock elapsed ${ideal.elapsed} min, ${v2.idealPath.length} steps`);
  console.log(`                  finale: ${fin ? `${fin.outcome}, stars ${JSON.stringify(fin.stars)}` : 'not reached'}`);
  const perDay = new Map<number, number>();
  for (const e of ideal.events) perDay.set(e.day, (perDay.get(e.day) ?? 0) + e.cost);
  console.log(`                  per day: ${[...perDay].map(([d, m]) => `day ${d}: ${m}`).join(' · ')}`);
  console.log(`  exhaustive      spent ${ex.spent} min (${pct(ex.spent, budget)} of budget; every useful move once, colour presses free, every night fork chased)`);
  const xs = ex.st.v2!;
  console.log(`                  reached ${Object.keys(xs.facts).length}/${v2.facts.length} facts, ${Object.values(xs.deductions).filter((d) => d.confirmed).length}/${v2.deductions.length} deductions, ${xs.zones.length} zones`);
  // wave 4 targets: ideal ≤ 65 % (aim ~60 %), a full case's exhaustive ≥ 125 % (aim ~140 %); the tutorial may stay easy
  const needs = proofNeeds(v2);
  const idealDeductions = Object.values(ideal.st.v2!.deductions).filter((d) => d.confirmed).length;
  const forks = (v2.nightEvents ?? []).filter((n) => n.choice);
  console.log(`  targets         ideal ${pct(ideal.spent, budget)} ≤ ${IDEAL_MAX_SHARE * 100}% ${ideal.spent <= budget * IDEAL_MAX_SHARE ? '✓' : '✗'} · ` +
    (def.meta.tutorial ? `exhaustive: tutorial, no minimum` : `exhaustive ${pct(ex.spent, budget)} ≥ ${EXHAUSTIVE_MIN_SHARE * 100}% ${ex.spent >= budget * EXHAUSTIVE_MIN_SHARE ? '✓' : '✗'}`) +
    ` · Proof star needs ${needs.deductions}/${v2.deductions.length} deductions (ideal confirms ${idealDeductions})` +
    (forks.length ? ` · night forks: ${forks.map((f) => `${f.id} [${f.choice!.options.map((o) => `${o.id}${o.minutes ? ` ${o.minutes} min` : ''}${o.lab ? ` lab ${o.lab}` : ''}`).join(' | ')}]`).join(', ')}` : ''));
  if (ideal.spent > budget * IDEAL_MAX_SHARE || (!def.meta.tutorial && ex.spent < budget * EXHAUSTIVE_MIN_SHARE)) failed = true;
  // presses: what each claim's press does (every press that costs time pays — PLAYTEST_V2 §7.2)
  const kinds = { pays: 0, colour: 0, none: 0, gated: 0 };
  for (const s of def.suspects) for (const t of s.topics) t.tiers.forEach((_x, i) => {
    for (const c of claimsOf(s, t, i)) {
      const p = c.press;
      if (!p) kinds.none++;
      else if (p.facts?.length || p.evidence?.length || p.toTier !== undefined) { kinds.pays++; if (p.requires) kinds.gated++; }
      else kinds.colour++;
    }
  });
  console.log(`  presses         ${kinds.pays} pay (${v2.clock.costs?.press ?? 15} min, ${kinds.gated} of them "not yet" until known) · ${kinds.colour} colour only (free) · ${kinds.none} nothing to press${ex.unpaidPresses.length ? ` · ✗ unpaid: ${ex.unpaidPresses.join(', ')}` : ''}`);
  const nr = runNewcomer(def);
  if (nr && v2.newcomerPath) {
    const w = nr.firstWin;
    console.log(`  newcomer        first confirmation ${w ? `day ${w.day} ${clockLabel(hm(v2.clock.dayStart) + w.minute)} (~${w.realMinutes} real min, limit ${v2.newcomerPath.firstWinRealMinutes})` : 'never'} · day 1 confirmed ${nr.day1Confirmed} (needs ${v2.newcomerPath.minConfirmedDay1}) · ~${nr.realMinutesDay1} real min for day 1`);
    if (nr.run.failures.length) { failed = true; for (const f of nr.run.failures) console.log(`    ✗ newcomer step ${f.step} ${f.what}: ${f.message}`); }
  }
  // wave 5 — co-op: each investigator has budgetFor(k) minutes a day. The ideal path played by a team that splits up
  // (trips and interviews go to whoever has most time left) vs one that moves together (everyone pays every trip).
  // "busiest" = the most any one investigator used that day, against their own budget; waiting is free in co-op.
  for (const k of [2, 3]) {
    const per = budgetFor(v2, k);
    const runs = (['split', 'together'] as const).map((mode) => ({ mode, run: runTeamPath(def, v2.idealPath, k, { mode }) }));
    console.log(`  co-op ${k} players  ${per} min each per day (team ${per * k}/day = ${pct(per * k, v2.clock.minutesPerDay)} of a solo day; ` +
      `doing everything ${ex.spent} min vs team capacity ${per * k * v2.clock.days} = ${pct(ex.spent, per * k * v2.clock.days)})`);
    for (const { mode, run } of runs) {
      const f = run.st.v2!.finale;
      const daysTxt = run.days.map((d) => `day ${d.day}: busiest ${d.maxUsed}/${d.budget} (${pct(d.maxUsed, d.budget)}), all ${d.totalUsed}`).join(' · ');
      console.log(`    ${mode.padEnd(9)} ${daysTxt} · team spent ${run.st.v2!.spent} · ${f?.outcome ? `${f.outcome}, stars ${JSON.stringify(f.stars)}` : "finale not finished"}` +
        `${run.failures.length ? ` · ${run.failures.length} steps failed (first: ${run.failures[0].what} — ${run.failures[0].message})` : ''}`);
    }
  }
  if (ideal.failures.length) {
    failed = true;
    console.log('  ✗ ideal path failures:');
    for (const f of ideal.failures) console.log(`    step ${f.step} ${f.what}: ${f.message}`);
  }
  if (showSteps) {
    for (const e of ideal.events) {
      console.log(`    d${e.day} ${clockLabel(hm(v2.clock.dayStart) + e.minute)}  +${String(e.cost).padStart(2)}  ${JSON.stringify(e.step)}`);
    }
  }
}
process.exit(failed ? 1 : 0);
