// SERVER-ONLY. v2 case validation: references, localisation, reachability (exhaustive simulation),
// solvability of every deduction and finale round, and an ideal-path replay under the real rules.
import type { CaseDefinition, PathStep, Requirement, Text } from '../types.ts';
import { newSessionState, type SessionState } from '../state.ts';
import { ActionError } from '../actions.ts';
import { markedFacts, tx, variants } from '../i18n.ts';
import * as A from './actions.ts';
import { claimsOf, costsOf, deductionVisible, elapsedOf, indexOf, locationOpen, shapeCenter, totalBudget, zoneOpen } from './state.ts';
import { meets } from '../state.ts';
import { runTeamPath } from './teamsim.ts';
import { asPlayer, budgetFor } from './coop.ts';
import * as T from './team.ts';

export interface V2Report {
  errors: string[];
  warnings: string[];
  stats: Record<string, number>;
}

/** The ideal path may use at most this share of the time budget. */
export const IDEAL_MAX_SHARE = 0.65;
/**
 * A full case (not the tutorial) must not be doable in full: the exhaustive player (every useful move once, every
 * night fork chased) needs at least this share of the budget (PLAN_V2 §3.1 aims at ~140 %). Wave 4.
 */
export const EXHAUSTIVE_MIN_SHARE = 1.25;

// ───────────────────────────────────────────── localisation

/** Every player-facing content string, with a path for error messages. */
export function contentTexts(def: CaseDefinition): { path: string; value: Text }[] {
  const out: { path: string; value: Text }[] = [];
  const add = (path: string, v: Text | undefined) => { if (v !== undefined) out.push({ path, value: v }); };
  const addAll = (path: string, list: Text[] | undefined) => list?.forEach((v, i) => add(`${path}[${i}]`, v));
  const m = def.meta;
  add('meta.title', m.title); add('meta.category', m.category); add('meta.synopsis', m.synopsis); add('meta.tagline', m.tagline); add('meta.setting', m.setting);
  const b = def.briefing;
  add('briefing.issuedBy', b.issuedBy); add('briefing.date', b.date); add('briefing.location', b.location); add('briefing.victim.summary', b.victim.summary);
  addAll('briefing.incidentReport', b.incidentReport); addAll('briefing.preliminaryFindings', b.preliminaryFindings); addAll('briefing.objectives', b.objectives);
  addAll('truth.narrative', def.truth.narrative);
  for (const p of def.people) { add(`person ${p.id}.role`, p.role); add(`person ${p.id}.description`, p.description); }
  for (const s of def.suspects) {
    const w = `suspect ${s.id}`;
    add(`${w}.occupation`, s.occupation); add(`${w}.relationship`, s.relationship); add(`${w}.publicProfile`, s.publicProfile);
    add(`${w}.claimedAlibi`, s.claimedAlibi); add(`${w}.opening`, s.opening);
    addAll(`${w}.deflections`, s.deflections); addAll(`${w}.dismissals`, s.dismissals); addAll(`${w}.resists`, s.resists); addAll(`${w}.pushback`, s.pushback); addAll(`${w}.shutdownLines`, s.shutdownLines);
    for (const t of s.topics) {
      add(`${w}/${t.id}.label`, t.label);
      t.tiers.forEach((tier, i) => {
        add(`${w}/${t.id}#${i}.line`, tier.line);
        addAll(`${w}/${t.id}#${i}.variants`, tier.variants);
        for (const c of tier.claims ?? []) {
          add(`claim ${c.id}.text`, c.text);
          add(`claim ${c.id}.press.line`, c.press?.line);
          c.breaks?.forEach((br, j) => add(`claim ${c.id}.breaks[${j}].resist`, br.resist));
        }
      });
    }
  }
  for (const l of def.locations) {
    add(`location ${l.id}.name`, l.name); add(`location ${l.id}.summary`, l.summary);
    l.plan.forEach((p, i) => { if (p.t === 'rect') add(`location ${l.id}.plan[${i}]`, p.label); if (p.t === 'text') add(`location ${l.id}.plan[${i}]`, p.text); });
    for (const h of l.hotspots) { add(`hotspot ${h.id}.label`, h.label); add(`hotspot ${h.id}.description`, h.description); add(`hotspot ${h.id}.lockedText`, h.lockedText); }
  }
  for (const e of def.evidence) {
    const w = `evidence ${e.id}`;
    add(`${w}.name`, e.name); add(`${w}.description`, e.description); add(`${w}.foundAt`, e.foundAt); addAll(`${w}.body`, e.body);
    e.timeline?.forEach((t, i) => add(`${w}.timeline[${i}]`, t.text));
  }
  for (const a of def.analyses) {
    add(`analysis ${a.id}.name`, a.name); add(`analysis ${a.id}.lockedReason`, a.lockedReason); addAll(`analysis ${a.id}.result`, a.result); add(`analysis ${a.id}.conclusion`, a.conclusion);
  }
  for (const s of def.statements) add(`statement ${s.id}`, s.text);
  for (const c of def.contradictions) add(`contradiction ${c.id}`, c.summary);
  for (const o of [...def.accusation.motives, ...def.accusation.methods, ...def.accusation.windows]) add(`accusation ${o.id}`, o.text);
  for (const h of def.hints) add(`hint ${h.id}`, h.text);
  const v2 = def.v2;
  if (v2) {
    for (const [sid, ws] of Object.entries(v2.clock.availability ?? {})) ws.forEach((w, i) => add(`availability ${sid}[${i}].note`, w.note));
    for (const f of v2.facts) add(`fact ${f.id}`, f.text);
    for (const sc of v2.scenes) for (const z of sc.zones) {
      add(`zone ${z.id}.label`, z.label); add(`zone ${z.id}.closeUp`, z.closeUp.text);
      for (const d of z.details) { add(`detail ${z.id}/${d.id}.label`, d.label); add(`detail ${z.id}/${d.id}.text`, d.text); }
    }
    for (const d of v2.deductions) {
      add(`deduction ${d.id}.title`, d.title); add(`deduction ${d.id}.prompt`, d.prompt); add(`deduction ${d.id}.confirmText`, d.confirmText);
      for (const bl of d.blanks ?? []) { add(`deduction ${d.id}.${bl.id}.label`, bl.label); bl.options?.forEach((o) => add(`deduction ${d.id}.${bl.id}.${o.id}`, o.text)); }
      for (const c of d.cards ?? []) add(`deduction ${d.id}.card ${c.id}`, c.text);
    }
    const f = v2.finale;
    add('finale.intro', f.intro); add('finale.confession', f.confession.line);
    for (const r of f.rounds) { add(`round ${r.id}.defence`, r.defence); add(`round ${r.id}.prompt`, r.prompt); add(`round ${r.id}.win`, r.win); add(`round ${r.id}.lose`, r.lose); }
    for (const [sid, x] of Object.entries(f.innocents)) { add(`innocent ${sid}.defence`, x.defence); add(`innocent ${sid}.collapse`, x.collapse); }
    for (const n of v2.nightEvents ?? []) {
      add(`night ${n.id}.title`, n.title); add(`night ${n.id}.text`, n.text); add(`night ${n.id}.choice.prompt`, n.choice?.prompt);
      for (const o of n.choice?.options ?? []) { add(`night ${n.id}/${o.id}.label`, o.label); add(`night ${n.id}/${o.id}.text`, o.text); }
    }
  }
  return out;
}

export function missingTranslations(def: CaseDefinition): string[] {
  return contentTexts(def)
    .filter(({ value }) => typeof value === 'string' || !value.en?.trim() || !value.tr?.trim())
    .map(({ path, value }) => `${path}: ${typeof value === 'string' || !value.tr?.trim() ? 'no tr' : 'no en'}`);
}

// ───────────────────────────────────────────── simulation helpers

function freshState(def: CaseDefinition, sim: boolean): SessionState {
  const st = newSessionState(def, 'sim', 0);
  if (sim) st.v2!.sim = true;
  return st;
}

const attempt = (fn: () => unknown): boolean => {
  try {
    fn();
    return true;
  } catch (e) {
    if (e instanceof ActionError) return false;
    throw e;
  }
};

/**
 * An exhaustive player with unlimited time: does everything once, presents every right item.
 * `team` (wave 5): a co-op team of that size instead — each scene is worked by a different investigator in turn
 * (so private sources land with different people), and whatever is held privately is read out when nothing else moves.
 */
export function exhaustive(def: CaseDefinition, team?: number): { st: SessionState; rounds: number; spent: number; unpaidPresses: string[] } {
  const unpaidPresses: string[] = [];
  const players = team ? Array.from({ length: team }, (_, i) => `p${i + 1}`) : [];
  const st = team ? newSessionState(def, 'sim', 0, { id: 'p1', name: 'P1' }, 'coop') : freshState(def, true);
  players.slice(1).forEach((id, i) => { st.players[id] = { name: id.toUpperCase(), role: 'investigator', joinedAt: i + 1 }; });
  if (team) st.v2!.sim = true;
  const s = st.v2!;
  const v2 = def.v2!;
  let now = 1;
  let actor = players[0];
  const ctx = (): A.Ctx => ({ def, st, now: now++, locale: 'en', ...(team ? { actorId: actor } : {}) });
  const asActor = (id: string | undefined, fn: () => void) => {
    if (!team || !id) return fn();
    const prev = actor;
    actor = id;
    try { asPlayer(def, st, id, fn); } finally { actor = prev; }
  };
  const req = (r: Requirement | undefined) => meets(r, st);
  const fingerprint = () => JSON.stringify([Object.keys(s.facts).length, Object.keys(st.evidence).length, s.zones.length, s.details.length,
    Object.values(s.deductions).filter((d) => d.confirmed).length, s.unlocked.length, Object.values(st.suspects).map((x) => x.tiers), s.lab.length,
    Object.values(s.claims).filter((c) => c.pressed || c.broken).length, forks.size]);
  let rounds = 0;
  const forks = new Set<string>();
  for (let changed = true; changed && rounds < 40; rounds++) {
    const before = fingerprint();
    // scenes
    v2.scenes.forEach((sc, si) => asActor(team ? players[(si + rounds) % team] : undefined, () => {
      if (!locationOpen(def, s, req, sc.locationId)) return;
      const todo = sc.zones.filter((z) => zoneOpen(s, req, z) && (!s.zones.includes(z.id) || z.details.some((d) => !s.details.includes(`${z.id}/${d.id}`))));
      if (!todo.length) return;
      if (s.location !== sc.locationId) attempt(() => A.travel(ctx(), sc.locationId));
      for (const z of todo) {
        if (!s.zones.includes(z.id)) {
          const reveal = z.reveal ?? 'visible';
          if (reveal === 'visible') attempt(() => A.inspect(ctx(), z.id));
          else { const [x, y] = shapeCenter(z.shape); attempt(() => A.probe(ctx(), sc.locationId, reveal, x, y)); }
        }
        if (s.zones.includes(z.id)) for (const d of z.details) attempt(() => A.detail(ctx(), z.id, d.id, d.tool));
      }
    }));
    // documents
    for (const e of def.evidence) {
      if (!(e.id in st.evidence)) continue;
      e.body?.forEach((line, i) => markedFacts(tx(line, 'en')).forEach((_f, n) => attempt(() => A.collect(ctx(), e.id, `${i}.${n}`))));
    }
    // lab (instant in simulation)
    for (const a of def.analyses) attempt(() => A.labSubmit(ctx(), a.id));
    attempt(() => A.labCollect(ctx()));
    // interviews
    for (const sus of def.suspects) {
      const ss = st.suspects[sus.id];
      const pending = () => sus.topics.some((t) => ((ss.tiers[t.id] ?? -1) < 0 && A.topicAvailable(ctx(), sus, t)) ||
        claimsOf(sus, t, ss.tiers[t.id] ?? -1).some((c) => ['yes', 'free'].includes(A.pressState(ctx(), sus.id, c.id)) ||(c.breaks ?? []).some((b) => !s.claims[c.id]?.broken && req(b.requires) && b.by.some((i) => A.owns(ctx(), i)))));
      if (!pending()) continue;
      attempt(() => A.interviewStart(ctx(), sus.id));
      for (let guard = 0; guard < 30; guard++) {
        let acted = false;
        for (const t of sus.topics) {
          if ((ss.tiers[t.id] ?? -1) < 0) { if (attempt(() => A.openTopic(ctx(), sus.id, t.id))) acted = true; continue; }
          for (const c of claimsOf(sus, t, ss.tiers[t.id])) {
            if (!s.claims[c.id]?.pressed && !s.claims[c.id]?.broken) {
              const ps = A.pressState(ctx(), sus.id, c.id);
              if (ps === 'yes' || ps === 'free') {
                const facts = Object.keys(s.facts).length;
                const evidence = Object.keys(st.evidence).length;
                const tier = ss.tiers[t.id];
                let ev: ReturnType<typeof A.press> | undefined;
                if (attempt(() => { ev = A.press(ctx(), sus.id, c.id); })) {
                  acted = true;
                  // every press that costs time must pay (PLAYTEST_V2 §7.2)
                  const paid = Object.keys(s.facts).length > facts || Object.keys(st.evidence).length > evidence || ss.tiers[t.id] > tier;
                  if (ev && ev.cost > 0 && !paid) unpaidPresses.push(c.id);
                  if (ev && ev.cost === 0 && paid) unpaidPresses.push(`${c.id} (paid but was free)`);
                }
              }
            }
            if (s.claims[c.id]?.broken) continue;
            const br = (c.breaks ?? []).find((b) => req(b.requires) && b.by.some((i) => A.owns(ctx(), i)));
            const item = br?.by.find((i) => A.owns(ctx(), i));
            if (item && attempt(() => A.present(ctx(), sus.id, c.id, item))) { acted = true; break; }
          }
        }
        if (!acted) break;
      }
      attempt(() => A.interviewLeave(ctx(), sus.id));
    }
    // night forks: a thorough player chases each one (the option that costs the most morning minutes)
    for (const n of v2.nightEvents ?? []) {
      if (!n.choice || forks.has(n.id) || !req(n.requires)) continue;
      forks.add(n.id);
      const opt = [...n.choice.options].sort((a, b) => (b.minutes ?? 0) - (a.minutes ?? 0))[0];
      A.applyForkOption(ctx(), n, opt);
    }
    // deductions
    for (const d of v2.deductions) {
      if (s.deductions[d.id]?.confirmed || !deductionVisible(s, req, d)) continue;
      if (d.kind === 'timeline') { attempt(() => A.deduce(ctx(), d.id, { order: d.order, outlier: d.outlier })); continue; }
      const fills: Record<string, string> = {};
      for (const b of d.blanks ?? []) {
        for (const v of b.accept) {
          const probeFill = { ...fills, [b.id]: v };
          // ownership is checked by deduce(); pick the first accepted value the player holds
          const holds = b.type === 'fact' ? v in s.facts : b.type === 'evidence' ? v in st.evidence : b.type === 'time' ? A.knownTimes(def, s).includes(v) : true;
          if (holds) { Object.assign(fills, probeFill); break; }
        }
      }
      if (Object.keys(fills).length === (d.blanks ?? []).length) attempt(() => A.deduce(ctx(), d.id, { fills }));
    }
    changed = fingerprint() !== before;
    // co-op: when nothing else moves, everyone reads out what they hold privately
    if (team && !changed) {
      for (const id of players) {
        const n = s.team?.notes[id];
        if (n && (Object.keys(n.facts).length || Object.keys(n.evidence).length)) asActor(id, () => { attempt(() => T.share(ctx())); });
      }
      changed = fingerprint() !== before;
    }
  }
  return { st, rounds, spent: s.spent, unpaidPresses };
}

/**
 * Rough real time a reading player needs per step, in seconds (PLAYTEST_V2 §6: ~200 wpm, 20–40 s per interview
 * turn or document). Used to check the newcomer's early win in real minutes, not only game minutes.
 */
export const REAL_SECONDS: Record<PathStep['do'], number> = {
  travel: 10, inspect: 40, detail: 20, collect: 25, lab: 15, labCollect: 20, interview: 25, leave: 5, topic: 40,
  press: 30, present: 40, deduce: 60, wrongDeduce: 60, wrongPresent: 40, endDay: 60, wait: 10, finale: 240, nightChoice: 30,
};
/** The briefing, read once before the first action. */
export const BRIEFING_SECONDS = 90;

export interface PathRun {
  st: SessionState;
  failures: { step: number; what: string; message: string }[];
  spent: number;
  elapsed: number;
  events: { step: PathStep; cost: number; day: number; minute: number; confirmed: number }[];
}

export interface NewcomerRun {
  run: PathRun;
  /** first confirmation: game minute of day 1 (undefined: none on day 1) and estimated real minutes */
  firstWin?: { day: number; minute: number; realMinutes: number; step: number };
  day1Confirmed: number;
  realMinutesDay1: number;
}

/** Replay the newcomer path and measure the early win (game minutes and estimated real minutes). */
export function runNewcomer(def: CaseDefinition): NewcomerRun | undefined {
  const nc = def.v2?.newcomerPath;
  if (!nc) return undefined;
  const run = runPath(def, nc.steps);
  let real = BRIEFING_SECONDS;
  let realDay1 = 0;
  let firstWin: NewcomerRun['firstWin'];
  run.events.forEach((e, i) => {
    real += REAL_SECONDS[e.step.do] ?? 20;
    if (e.day === 1 && e.step.do !== 'endDay') realDay1 = real;
    if (!firstWin && e.confirmed > 0) firstWin = { day: e.day, minute: e.minute, realMinutes: Math.round((real / 60) * 10) / 10, step: i };
  });
  const day1Confirmed = Object.values(run.st.v2!.deductions).filter((d) => d.confirmed && d.day === 1).length;
  return { run, firstWin, day1Confirmed, realMinutesDay1: Math.round((realDay1 / 60) * 10) / 10 };
}

/** Replay an authored path under the real rules (time limits, availability, lab delays and slots). */
export function runPath(def: CaseDefinition, steps: PathStep[]): PathRun {
  const st = freshState(def, false);
  const s = st.v2!;
  let now = 1;
  const ctx = (): A.Ctx => ({ def, st, now: now++, locale: 'en' });
  const failures: PathRun['failures'] = [];
  const events: PathRun['events'] = [];
  steps.forEach((step, i) => {
    const before = s.spent;
    try {
      switch (step.do) {
        case 'travel': A.travel(ctx(), step.to); break;
        case 'inspect': {
          const hit = indexOf(def).zones.get(step.zone);
          const reveal = hit?.zone.reveal ?? 'visible';
          if (hit && reveal !== 'visible') {
            const [x, y] = shapeCenter(hit.zone.shape);
            const e = A.probe(ctx(), hit.locationId, reveal, x, y);
            if (e.outcome !== 'hit') throw new ActionError('probe missed');
          } else A.inspect(ctx(), step.zone);
          break;
        }
        case 'detail': {
          const d = indexOf(def).zones.get(step.zone)?.zone.details.find((x) => x.id === step.detail);
          A.detail(ctx(), step.zone, step.detail, d?.tool);
          break;
        }
        case 'collect': {
          const e = def.evidence.find((x) => x.id === step.evidence);
          let key: string | undefined;
          e?.body?.forEach((line, li) => markedFacts(tx(line, 'en')).forEach((f, n) => { if (f === step.fact && !key) key = `${li}.${n}`; }));
          if (!key) throw new ActionError(`fact ${step.fact} is not marked in ${step.evidence}`);
          const ev = A.collect(ctx(), step.evidence, key);
          if (!ev.newFacts?.length && ev.outcome !== 'already') throw new ActionError('nothing collected');
          break;
        }
        case 'lab': A.labSubmit(ctx(), step.analysis); break;
        case 'labCollect': A.labCollect(ctx()); break;
        case 'interview': A.interviewStart(ctx(), step.suspect); break;
        case 'leave': A.interviewLeave(ctx(), step.suspect); break;
        case 'topic': A.openTopic(ctx(), step.suspect, step.topic); break;
        case 'press': A.press(ctx(), step.suspect, step.claim); break;
        case 'present': {
          const e = A.present(ctx(), step.suspect, step.claim, step.item);
          if (e.outcome !== 'break') throw new ActionError(`present did not break the claim (${e.outcome})`);
          break;
        }
        case 'deduce': {
          const e = A.deduce(ctx(), step.deduction, { fills: step.fills, order: step.order, outlier: step.outlier });
          if (e.outcome !== 'confirmed') throw new ActionError('deduction was not confirmed');
          break;
        }
        case 'endDay': A.endDay(ctx()); break;
        case 'wait': A.wait(ctx(), { minutes: step.minutes, until: step.until }); break;
        case 'nightChoice': A.nightChoice(ctx(), step.option); break;
        case 'wrongDeduce': {
          const e = A.deduce(ctx(), step.deduction, { fills: step.fills, order: step.order, outlier: step.outlier });
          if (e.outcome !== 'wrong') throw new ActionError('the deliberate mistake was confirmed');
          break;
        }
        case 'wrongPresent': {
          const e = A.present(ctx(), step.suspect, step.claim, step.item);
          if (e.outcome !== 'wrong') throw new ActionError(`the deliberate wrong present gave "${e.outcome}"`);
          break;
        }
        case 'finale': {
          A.finaleStart(ctx(), step.accused);
          for (const a of step.answers) if (s.finale?.status === 'running') A.finaleAnswer(ctx(), a);
          break;
        }
      }
    } catch (e) {
      if (!(e instanceof ActionError)) throw e;
      failures.push({ step: i, what: JSON.stringify(step), message: e.message });
    }
    events.push({ step, cost: s.spent - before, day: s.day, minute: s.minute, confirmed: Object.values(s.deductions).filter((d) => d.confirmed).length });
  });
  return { st, failures, spent: s.spent, elapsed: elapsedOf(def.v2!, s), events };
}

// ───────────────────────────────────────────── the validator

export function validateV2(def: CaseDefinition): V2Report {
  const errors: string[] = [];
  const warnings: string[] = [];
  const v2 = def.v2!;
  const ix = indexOf(def);
  const factIds = new Set(v2.facts.map((f) => f.id));
  const evIds = new Set(def.evidence.map((e) => e.id));
  const dedIds = new Set(v2.deductions.map((d) => d.id));
  const people = new Set([...def.suspects.map((s) => s.id), ...def.people.map((p) => p.id)]);
  const locIds = new Set(def.locations.map((l) => l.id));
  const stIds = new Set(def.statements.map((s) => s.id));

  const dup = (label: string, ids: string[]) => {
    const seen = new Set<string>();
    for (const id of ids) { if (seen.has(id)) errors.push(`Duplicate ${label} id: ${id}`); seen.add(id); }
  };
  dup('fact', v2.facts.map((f) => f.id));
  dup('zone', v2.scenes.flatMap((sc) => sc.zones.map((z) => z.id)));
  dup('deduction', v2.deductions.map((d) => d.id));
  dup('claim', def.suspects.flatMap((s) => s.topics.flatMap((t) => t.tiers.flatMap((_x, i) => claimsOf(s, t, i).map((c) => c.id)))));
  dup('finale round', v2.finale.rounds.map((r) => r.id));

  const fact = (id: string, where: string) => { if (!factIds.has(id)) errors.push(`${where}: unknown fact "${id}"`); };
  const ev = (id: string, where: string) => { if (!evIds.has(id)) errors.push(`${where}: unknown evidence "${id}"`); };
  const item = (id: string, where: string, allowDeduction = false) => {
    if (!factIds.has(id) && !evIds.has(id) && !(allowDeduction && dedIds.has(id))) errors.push(`${where}: "${id}" is not a fact${allowDeduction ? ', evidence or deduction' : ' or evidence'}`);
  };
  const reqRefs = (r: Requirement | undefined, where: string) => {
    r?.facts?.forEach((f) => fact(f, where));
    r?.deductions?.forEach((d) => { if (!dedIds.has(d)) errors.push(`${where}: unknown deduction "${d}"`); });
    r?.evidence?.forEach((e) => ev(e, where));
    r?.statements?.forEach((x) => { if (!stIds.has(x)) errors.push(`${where}: unknown statement "${x}"`); });
  };

  // clock
  const c = v2.clock;
  if (c.days < 1 || c.minutesPerDay < 60) errors.push('clock: needs at least one day of at least 60 minutes');
  if (!/^\d{2}:\d{2}$/.test(c.dayStart)) errors.push('clock.dayStart must be "HH:MM"');
  if (c.startLocationId !== null && !locIds.has(c.startLocationId)) errors.push(`clock.startLocationId: unknown location ${c.startLocationId}`);
  for (const [sid, ws] of Object.entries(c.availability ?? {})) {
    if (!def.suspects.some((s) => s.id === sid)) errors.push(`clock.availability: unknown suspect ${sid}`);
    for (const w of ws) if (w.day < 1 || w.day > c.days || (w.from ?? 0) >= (w.to ?? c.minutesPerDay)) errors.push(`clock.availability.${sid}: bad window on day ${w.day}`);
  }
  for (const [k, v] of Object.entries(costsOf(v2))) if (!(v >= 0)) errors.push(`clock.costs.${k} must be ≥ 0`);
  def.briefing.startingFacts?.forEach((f) => fact(f, 'briefing.startingFacts'));

  // documents
  for (const e of def.evidence) e.body?.forEach((line, i) => {
    const vs = typeof line === 'string' ? [line] : [line.en, line.tr].filter((x): x is string => !!x);
    vs.forEach((v) => markedFacts(v).forEach((f) => fact(f, `evidence ${e.id} line ${i}`)));
    if (vs.length === 2 && JSON.stringify(markedFacts(vs[0])) !== JSON.stringify(markedFacts(vs[1]))) {
      errors.push(`evidence ${e.id} line ${i}: en and tr mark different facts (same facts, same order required)`);
    }
  });

  // labs
  for (const a of def.analyses) {
    if (!a.v2) { warnings.push(`analysis ${a.id} has no v2 duration (default 180 min)`); continue; }
    if (a.v2.minutes < 120 || a.v2.minutes > 360) errors.push(`analysis ${a.id}: lab delay ${a.v2.minutes} min is outside 120–360`);
    a.v2.facts?.forEach((f) => fact(f, `analysis ${a.id}`));
  }

  // suspects, topics, claims
  for (const s of def.suspects) {
    const p = s.v2?.patience ?? 4;
    if (p < 3 || p > 5) warnings.push(`suspect ${s.id}: patience ${p} is outside 3–5`);
    for (const t of s.topics) {
      t.v2?.chips?.forEach((ch) => { if (!people.has(ch) && !factIds.has(ch) && !evIds.has(ch)) errors.push(`topic ${s.id}/${t.id}: unknown chip "${ch}"`); });
      reqRefs(t.v2?.requires, `topic ${s.id}/${t.id}`);
      t.tiers.forEach((_tier, i) => {
        for (const cl of claimsOf(s, t, i)) {
          const w = `claim ${cl.id}`;
          cl.facts?.forEach((f) => fact(f, w));
          if (cl.press) {
            cl.press.facts?.forEach((f) => fact(f, `${w}.press`));
            cl.press.evidence?.forEach((e) => ev(e, `${w}.press`));
            reqRefs(cl.press.requires, `${w}.press`);
            if (cl.press.toTier !== undefined && (!t.tiers[cl.press.toTier] || cl.press.toTier <= i)) errors.push(`${w}.press.toTier ${cl.press.toTier} is not a later tier`);
          }
          cl.breaks?.forEach((b, j) => {
            if (!b.by.length) errors.push(`${w}.breaks[${j}] has no items`);
            b.by.forEach((x) => item(x, `${w}.breaks[${j}]`));
            reqRefs(b.requires, `${w}.breaks[${j}]`);
            const to = b.toTier ?? i + 1;
            if (!t.tiers[to] || to <= i) errors.push(`${w}.breaks[${j}] leads to missing tier ${to}`);
          });
        }
      });
    }
  }

  // scenes
  for (const sc of v2.scenes) {
    if (!locIds.has(sc.locationId)) errors.push(`scene: unknown location ${sc.locationId}`);
    for (const z of sc.zones) {
      const w = `zone ${z.id}`;
      const pts = z.shape.kind === 'poly' ? z.shape.points : z.shape.kind === 'rect' ? [[z.shape.x, z.shape.y], [z.shape.x + z.shape.w, z.shape.y + z.shape.h]] : [[z.shape.x, z.shape.y]];
      if (pts.some(([x, y]) => x < 0 || x > 1 || y < 0 || y > 1)) errors.push(`${w}: shape outside the 0..1 canvas`);
      if (z.hotspotId && !def.locations.find((l) => l.id === sc.locationId)?.hotspots.some((h) => h.id === z.hotspotId)) errors.push(`${w}: hotspot ${z.hotspotId} is not in ${sc.locationId}`);
      z.facts?.forEach((f) => fact(f, w));
      z.evidence?.forEach((e) => ev(e, w));
      reqRefs(z.requires, w);
      dup(`detail in ${z.id}`, z.details.map((d) => d.id));
      for (const d of z.details) {
        if (d.x < 0 || d.x > 1 || d.y < 0 || d.y > 1) errors.push(`${w}/${d.id}: outside the close-up card`);
        d.facts?.forEach((f) => fact(f, `${w}/${d.id}`));
        d.evidence?.forEach((e) => ev(e, `${w}/${d.id}`));
        if (!d.facts?.length && !d.evidence?.length) warnings.push(`${w}/${d.id} yields nothing`);
      }
    }
  }

  // deductions
  for (const d of v2.deductions) {
    const w = `deduction ${d.id}`;
    reqRefs(d.requires, w);
    if (d.kind === 'fill') {
      if (!d.blanks?.length) errors.push(`${w}: no blanks`);
      for (const b of d.blanks ?? []) {
        if (!variants(d.prompt).every((p) => p.includes(`{${b.id}}`))) errors.push(`${w}: prompt lacks {${b.id}} in some language`);
        if (!b.accept.length) errors.push(`${w}.${b.id}: no accepted fill`);
        for (const a of b.accept) {
          const ok = b.type === 'fact' ? factIds.has(a) : b.type === 'evidence' ? evIds.has(a) : b.type === 'person' ? people.has(a)
            : b.type === 'place' ? locIds.has(a) : b.type === 'time' ? /^\d{2}:\d{2}$/.test(a) && v2.facts.some((f) => f.time === a)
            : !!b.options?.some((o) => o.id === a);
          if (!ok) errors.push(`${w}.${b.id}: accepted fill "${a}" is not a valid ${b.type}`);
        }
      }
    } else {
      const cards = new Set((d.cards ?? []).map((x) => x.id));
      if (cards.size < 3) errors.push(`${w}: a timeline needs at least three cards`);
      const order = d.order ?? [];
      if (order.some((x) => !cards.has(x)) || new Set(order).size !== order.length) errors.push(`${w}: order references unknown or repeated cards`);
      if (d.outlier !== undefined && (!cards.has(d.outlier) || order.includes(d.outlier))) errors.push(`${w}: outlier must be a card outside the order`);
      if (order.length + (d.outlier !== undefined ? 1 : 0) !== cards.size) errors.push(`${w}: every card must be in the order or be the outlier`);
    }
    for (const e of d.effects ?? []) {
      if (e.type === 'grant') { e.facts?.forEach((f) => fact(f, w)); e.evidence?.forEach((x) => ev(x, w)); continue; }
      const [kind, a, b] = e.target.split(':');
      const ok = kind === 'analysis' ? def.analyses.some((x) => x.id === a) : kind === 'location' ? locIds.has(a) : kind === 'zone' ? ix.zones.has(a)
        : kind === 'deduction' ? dedIds.has(a) : kind === 'topic' ? !!def.suspects.find((s) => s.id === a)?.topics.some((t) => t.id === b) : false;
      if (!ok) errors.push(`${w}: unlock target "${e.target}" does not exist`);
    }
  }
  // every locked thing must be unlockable
  const unlocks = new Set([
    ...v2.deductions.flatMap((d) => (d.effects ?? []).flatMap((e) => (e.type === 'unlock' ? [e.target] : []))),
    ...(v2.nightEvents ?? []).flatMap((n) => n.unlock ?? []),
    // a fork option unlocks directly, or starts its (otherwise locked) lab job itself
    ...(v2.nightEvents ?? []).flatMap((n) => (n.choice?.options ?? []).flatMap((o) => [...(o.unlock ?? []), ...(o.lab ? [`analysis:${o.lab}`] : [])])),
  ]);
  const lockedKeys = [
    ...def.analyses.filter((a) => a.v2?.locked).map((a) => `analysis:${a.id}`),
    ...def.locations.filter((l) => l.v2?.locked).map((l) => `location:${l.id}`),
    ...v2.scenes.flatMap((sc) => sc.zones.filter((z) => z.locked).map((z) => `zone:${z.id}`)),
    ...v2.deductions.filter((d) => d.locked).map((d) => `deduction:${d.id}`),
    ...def.suspects.flatMap((s) => s.topics.filter((t) => t.v2?.locked).map((t) => `topic:${s.id}:${t.id}`)),
  ];
  for (const k of lockedKeys) if (!unlocks.has(k)) errors.push(`${k} is locked and nothing unlocks it`);

  // night events
  for (const n of v2.nightEvents ?? []) {
    if (n.afterDay < 1 || n.afterDay >= c.days) errors.push(`night ${n.id}: afterDay must be between 1 and ${c.days - 1}`);
    n.grants?.facts?.forEach((f) => fact(f, `night ${n.id}`));
    n.grants?.evidence?.forEach((e) => ev(e, `night ${n.id}`));
    reqRefs(n.requires, `night ${n.id}`);
    if (n.choice) {
      if (n.choice.options.length < 2) errors.push(`night ${n.id}: a fork needs at least two options`);
      if (n.grants || n.unlock) errors.push(`night ${n.id}: a fork gives through its options, not grants/unlock`);
      // the first option settles the fork when the player acts without answering: it must not cost minutes
      if ((n.choice.options[0]?.minutes ?? 0) > 0) errors.push(`night ${n.id}: the first (default) option must cost no minutes`);
      dup(`option in ${n.id}`, n.choice.options.map((o) => o.id));
      for (const o of n.choice.options) {
        const w = `night ${n.id}/${o.id}`;
        o.grants?.facts?.forEach((f) => fact(f, w));
        o.grants?.evidence?.forEach((e) => ev(e, w));
        if (o.lab && !def.analyses.some((a) => a.id === o.lab)) errors.push(`${w}: unknown lab analysis ${o.lab}`);
        if ((o.minutes ?? 0) < 0 || (o.minutes ?? 0) > c.minutesPerDay / 2) errors.push(`${w}: minutes must be 0..${c.minutesPerDay / 2}`);
        // every option must give something: a fork between "something" and "nothing" is not a choice
        if (!o.grants?.facts?.length && !o.grants?.evidence?.length && !o.unlock?.length && !o.lab) errors.push(`${w}: the option gives nothing`);
      }
    }
  }

  // finale
  const f = v2.finale;
  if (f.rounds.length < 4 || f.rounds.length > 5) errors.push(`finale: ${f.rounds.length} rounds (4–5 required)`);
  for (const r of f.rounds) {
    if (!r.accept.length) errors.push(`round ${r.id}: no accepted answer`);
    r.accept.forEach((a) => item(a, `round ${r.id}`, true));
    r.assist?.forEach((d) => { if (!dedIds.has(d)) errors.push(`round ${r.id}: unknown assist deduction ${d}`); });
    r.refutes?.forEach((x) => { if (!def.statements.some((st) => st.id === x && !st.truthful)) errors.push(`round ${r.id}: refutes "${x}", which is not a lie statement`); });
  }
  for (const s of def.suspects) {
    if (s.id === def.truth.killerId && f.innocents[s.id]) errors.push('finale.innocents lists the killer');
    if (s.id !== def.truth.killerId && !f.innocents[s.id]) errors.push(`finale.innocents: no collapse for ${s.id}`);
  }
  if (f.confession.statementId && !stIds.has(f.confession.statementId)) errors.push('finale.confession: unknown statement');

  // co-op (wave 5): private sources must exist, and must be places / items a player reaches by playing
  const priv = v2.coop?.private;
  for (const l of priv?.locations ?? []) {
    if (!locIds.has(l)) errors.push(`coop.private: unknown location ${l}`);
    else if (l === c.startLocationId) errors.push(`coop.private: ${l} is where everyone starts; it cannot be private`);
    else if (!v2.scenes.some((sc) => sc.locationId === l)) warnings.push(`coop.private: ${l} has no scene, so nothing is ever private there`);
  }
  for (const e of priv?.evidence ?? []) {
    ev(e, 'coop.private');
    if (def.briefing.startingEvidence.includes(e)) errors.push(`coop.private: ${e} is held from the start; it cannot be private`);
  }
  for (const [n, share] of Object.entries(v2.coop?.share ?? {})) if (!(share! > 0 && share! <= 1)) errors.push(`coop.share[${n}] must be in (0, 1]`);

  // localisation
  const missing = missingTranslations(def);
  if (def.meta.contentStatus === 'draft') {
    if (missing.length) warnings.push(`draft: ${missing.length} content strings lack Turkish (allowed in draft only)`);
  } else {
    for (const m of missing.slice(0, 40)) errors.push(`i18n ${m}`);
    if (missing.length > 40) errors.push(`i18n: …and ${missing.length - 40} more strings lack en or tr`);
  }

  if (errors.length) return { errors, warnings, stats: {} };

  // ── reachability: exhaustive player with unlimited time
  const ex = exhaustive(def);
  const xs = ex.st.v2!;
  for (const fd of v2.facts) if (!(fd.id in xs.facts)) errors.push(`fact ${fd.id} has no reachable source`);
  for (const d of v2.deductions) if (!xs.deductions[d.id]?.confirmed) errors.push(`deduction ${d.id} is unsolvable (prerequisites or accepted fills unreachable)`);
  for (const r of f.rounds) {
    if (!r.accept.some((a) => a in xs.facts || a in ex.st.evidence || xs.deductions[a]?.confirmed)) errors.push(`round ${r.id}: no accepted answer is reachable`);
  }
  for (const sc of v2.scenes) for (const z of sc.zones) if (!xs.zones.includes(z.id)) warnings.push(`zone ${z.id} is unreachable`);
  for (const e of def.evidence) if (!(e.id in ex.st.evidence)) (e.role === 'decisive' ? errors : warnings).push(`evidence ${e.id} (${e.role}) is unreachable`);
  // a fork's lab job is the other road to what the chase gives: the exhaustive player chases, so it never runs it
  const forkLabs = new Set((v2.nightEvents ?? []).flatMap((n) => (n.choice?.options ?? []).flatMap((o) => (o.lab ? [o.lab] : []))));
  for (const a of def.analyses) if (!(a.id in ex.st.analyses) && !forkLabs.has(a.id)) warnings.push(`analysis ${a.id} is never run`);
  for (const [id, ref] of ix.claims) {
    const cur = ex.st.suspects[ref.suspect.id].tiers[ref.topic.id] ?? -1;
    if (cur < ref.tier && ref.topic.id !== 't-confession') warnings.push(`claim ${id} is never heard`);
  }

  // ── the ideal path under the real rules
  const budget = totalBudget(v2);
  const ideal = runPath(def, v2.idealPath);
  for (const fl of ideal.failures.slice(0, 10)) errors.push(`idealPath step ${fl.step} ${fl.what}: ${fl.message}`);
  const fin = ideal.st.v2!.finale;
  if (!fin || fin.status !== 'done') errors.push('idealPath does not finish the finale');
  else if (!fin.culprit) errors.push('idealPath accuses the wrong person');
  else if (fin.outcome !== 'confession') errors.push(`idealPath ends in "${fin.outcome}", not a confession: the finale chain is not reachable in time`);
  if (ideal.spent > budget * IDEAL_MAX_SHARE) errors.push(`idealPath uses ${ideal.spent} of ${budget} minutes (${Math.round((ideal.spent / budget) * 100)}% > ${IDEAL_MAX_SHARE * 100}%)`);
  if (def.meta.tutorial) {
    // the tutorial may stay easy
    if (ex.spent < budget) warnings.push(`doing everything takes only ${ex.spent} of ${budget} minutes: time is not scarce (tutorial: allowed)`);
  } else if (ex.spent < budget * EXHAUSTIVE_MIN_SHARE) {
    errors.push(`doing everything takes only ${ex.spent} of ${budget} minutes (${Math.round((ex.spent / budget) * 100)}% < ${EXHAUSTIVE_MIN_SHARE * 100}%): the clock forces no choices`);
  }
  for (const c of ex.unpaidPresses) errors.push(`claim ${c}: a press that costs time must yield a fact, evidence or a new tier (or be free)`);

  // ── co-op (wave 5): any team composition can still solve the case. Teams of 2 and 3 replay the ideal path split
  // between them (unlimited time), with each rotation of who takes the first trip, so a private source lands with a
  // different investigator each time; private notes are read out when a step needs them.
  const coopStats: Record<string, number> = {};
  for (const k of [2, 3]) {
    for (let offset = 0; offset < k; offset++) {
      const run = runTeamPath(def, v2.idealPath, k, { mode: 'split', sim: true, offset });
      const tag = `co-op ${k} players (first trip: P${offset + 1})`;
      for (const fl of run.failures.slice(0, 5)) errors.push(`${tag}: idealPath step ${fl.step} ${fl.what}: ${fl.message}`);
      const tf = run.st.v2!.finale;
      if (!tf || tf.status !== 'done' || tf.outcome !== 'confession') errors.push(`${tag}: the ideal path does not end in a confession (${tf?.outcome ?? 'no finale'})`);
      for (const fd of v2.facts) {
        if (ideal.st.v2!.facts[fd.id] && !(fd.id in run.st.v2!.facts)) errors.push(`${tag}: fact ${fd.id} never reaches the team's notebook`);
      }
      coopStats[`coopReadOuts${k}p`] = Math.max(coopStats[`coopReadOuts${k}p`] ?? 0, run.readOuts);
    }
    // everything a solo player can reach, a team reaches too (private notes read out)
    const tx2 = exhaustive(def, k);
    const tag = `co-op ${k} players (exhaustive)`;
    for (const fd of v2.facts) if (fd.id in xs.facts && !(fd.id in tx2.st.v2!.facts)) errors.push(`${tag}: fact ${fd.id} is reachable alone but not as a team`);
    for (const d of v2.deductions) if (xs.deductions[d.id]?.confirmed && !tx2.st.v2!.deductions[d.id]?.confirmed) errors.push(`${tag}: deduction ${d.id} is solvable alone but not as a team`);
    for (const e of def.evidence) if (e.id in ex.st.evidence && !(e.id in tx2.st.evidence)) errors.push(`${tag}: evidence ${e.id} is reachable alone but not as a team`);
    const t2 = tx2.st.v2!.team;
    if (t2 && Object.values(t2.notes).some((n) => Object.keys(n.facts).length || Object.keys(n.evidence).length)) errors.push(`${tag}: private notes left unread`);
    coopStats[`coopBudget${k}p`] = budgetFor(v2, k);
  }

  // ── the newcomer: an early, guaranteed win (PLAYTEST_V2 §7.1)
  const nc = v2.newcomerPath;
  const nr = runNewcomer(def);
  if (nc && nr) {
    for (const fl of nr.run.failures.slice(0, 10)) errors.push(`newcomerPath step ${fl.step} ${fl.what}: ${fl.message}`);
    if (!nr.firstWin || nr.firstWin.day !== 1 || nr.firstWin.minute > nc.firstWinBy) {
      errors.push(`newcomerPath: no deduction confirmed within ${nc.firstWinBy} game minutes of day 1`);
    } else if (nr.firstWin.realMinutes > nc.firstWinRealMinutes) {
      errors.push(`newcomerPath: first confirmation only after ~${nr.firstWin.realMinutes} real minutes (> ${nc.firstWinRealMinutes})`);
    }
    if (nr.day1Confirmed < nc.minConfirmedDay1) errors.push(`newcomerPath: ${nr.day1Confirmed} deductions confirmed on day 1 (needs ${nc.minConfirmedDay1})`);
  }

  return {
    errors,
    warnings,
    stats: {
      facts: v2.facts.length,
      zones: v2.scenes.reduce((n, sc) => n + sc.zones.length, 0),
      claims: ix.claims.size,
      deductions: v2.deductions.length,
      budgetMinutes: budget,
      idealSpent: ideal.spent,
      idealElapsed: ideal.elapsed,
      exhaustiveSpent: ex.spent,
      missingTr: missing.length,
      ...coopStats,
      ...(nr?.firstWin ? { newcomerFirstWinMinute: nr.firstWin.minute, newcomerFirstWinReal: nr.firstWin.realMinutes, newcomerDay1Confirmed: nr.day1Confirmed } : {}),
    },
  };
}
