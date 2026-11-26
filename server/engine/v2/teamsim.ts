// SERVER-ONLY. Co-op replays (wave 5): a team of k investigators plays an authored path with their own clocks.
//   split    — each trip (travel + what is done there) and each interview goes to the investigator with the most
//              budget left today; someone already standing at the place takes the trip without travelling.
//   together — the whole team travels to every place (each pays the trip) and shares out the work there.
// Used by the validator (unlimited time: every fact stays reachable for any team; private notes read out when
// needed) and by the budget simulator (real rules: how much of each investigator's day the path needs).
import type { CaseDefinition, PathStep } from '../types.ts';
import { newSessionState, type SessionState } from '../state.ts';
import { ActionError } from '../actions.ts';
import { markedFacts, tx } from '../i18n.ts';
import * as A from './actions.ts';
import * as T from './team.ts';
import { asPlayer, leftFor, teamOf } from './coop.ts';
import { indexOf, shapeCenter } from './state.ts';

export interface TeamRunOptions {
  mode: 'split' | 'together';
  /** unlimited time, instant lab, everyone available (reachability) */
  sim?: boolean;
  /** rotates who is picked on ties: a different investigator ends up at each private source */
  offset?: number;
}

export interface TeamRun {
  st: SessionState;
  players: string[];
  failures: { step: number; what: string; message: string }[];
  /** private items read out to the team during the run */
  readOuts: number;
  /** per day: the busiest investigator's budget use, everyone's total, and the per-player budget */
  days: { day: number; maxUsed: number; totalUsed: number; budget: number }[];
  budget: number;
}

export function runTeamPath(def: CaseDefinition, steps: PathStep[], k: number, opts: TeamRunOptions): TeamRun {
  const players = Array.from({ length: k }, (_, i) => `p${i + 1}`);
  const st = newSessionState(def, 'sim', 0, { id: players[0], name: 'P1' }, 'coop');
  players.slice(1).forEach((id, i) => { st.players[id] = { name: `P${i + 2}`, role: 'investigator', joinedAt: i + 1 }; });
  const s = st.v2!;
  if (opts.sim) s.sim = true;
  const team = teamOf(def, st)!;
  const v2 = def.v2!;
  const offset = opts.offset ?? 0;
  let now = 1;
  let readOuts = 0;
  const failures: TeamRun['failures'] = [];
  const days: TeamRun['days'] = [];
  const clock = (id: string) => { asPlayer(def, st, id, () => undefined); return team.clocks[id]; };
  players.forEach(clock);
  const as = <R>(id: string, fn: (ctx: A.Ctx) => R): R => asPlayer(def, st, id, () => fn({ def, st, now: now++, locale: 'en', actorId: id }));
  const rank = (ids: string[]) => [...ids].sort((a, b) => leftFor(v2, team, clock(b)) - leftFor(v2, team, clock(a))
    || ((players.indexOf(a) - offset + k) % k) - ((players.indexOf(b) - offset + k) % k));
  let cur = players[offset % k];

  const shareAll = () => {
    for (const id of players) {
      const n = team.notes[id];
      if (n && (Object.keys(n.facts).length || Object.keys(n.evidence).length)) {
        const e = as(id, (ctx) => T.share(ctx));
        readOuts += (e.newFacts?.length ?? 0) + (e.newEvidence?.length ?? 0);
      }
    }
  };

  const zoneStep = (ctx: A.Ctx, step: Extract<PathStep, { do: 'inspect' }>) => {
    const hit = indexOf(def).zones.get(step.zone);
    const reveal = hit?.zone.reveal ?? 'visible';
    if (hit && reveal !== 'visible') {
      const [x, y] = shapeCenter(hit.zone.shape);
      const e = A.probe(ctx, hit.locationId, reveal, x, y);
      if (e.outcome !== 'hit') throw new ActionError('probe missed');
    } else A.inspect(ctx, step.zone);
  };

  const exec = (id: string, step: PathStep) => as(id, (ctx) => {
    switch (step.do) {
      case 'travel': if (ctx.st.v2!.location !== step.to) A.travel(ctx, step.to); break;
      case 'inspect': zoneStep(ctx, step); break;
      case 'detail': A.detail(ctx, step.zone, step.detail, indexOf(def).zones.get(step.zone)?.zone.details.find((x) => x.id === step.detail)?.tool); break;
      case 'collect': {
        let key: string | undefined;
        def.evidence.find((x) => x.id === step.evidence)?.body?.forEach((line, li) => markedFacts(tx(line, 'en')).forEach((f, n) => { if (f === step.fact && !key) key = `${li}.${n}`; }));
        if (!key) throw new ActionError(`fact ${step.fact} is not marked in ${step.evidence}`);
        A.collect(ctx, step.evidence, key);
        break;
      }
      case 'lab': A.labSubmit(ctx, step.analysis); break;
      case 'labCollect': {
        // the collector waits (free in co-op) for results that come in today
        const t = ctx.st.v2!;
        for (let g = 0; g < 4 && !t.sim; g++) {
          const w = A.waitMinutes(ctx, 'lab');
          if (w === undefined) break;
          A.wait(ctx, { until: 'lab' });
        }
        A.labCollect(ctx);
        break;
      }
      case 'interview': A.interviewStart(ctx, step.suspect); break;
      case 'leave': A.interviewLeave(ctx, step.suspect); break;
      case 'topic': A.openTopic(ctx, step.suspect, step.topic); break;
      case 'press': A.press(ctx, step.suspect, step.claim); break;
      case 'present': {
        const e = A.present(ctx, step.suspect, step.claim, step.item);
        if (e.outcome !== 'break') throw new ActionError(`present did not break the claim (${e.outcome})`);
        break;
      }
      case 'deduce': {
        const e = A.deduce(ctx, step.deduction, { fills: step.fills, order: step.order, outlier: step.outlier });
        if (e.outcome !== 'confirmed') throw new ActionError('deduction was not confirmed');
        break;
      }
      case 'wait': if (step.until || !opts.sim) A.wait(ctx, { minutes: step.minutes, until: step.until }); break;
      case 'nightChoice': A.nightChoice(ctx, step.option); break;
      case 'endDay': A.endDay(ctx); break;
      case 'finale': {
        A.finaleStart(ctx, step.accused);
        for (const a of step.answers) if (ctx.st.v2!.finale?.status === 'running') A.finaleAnswer(ctx, a);
        break;
      }
      default: break;
    }
  });

  /** who should take a step (before retries) */
  const pick = (step: PathStep): string[] => {
    const host = players[0];
    switch (step.do) {
      case 'endDay': case 'nightChoice': case 'finale': return [host];
      case 'travel': {
        if (opts.mode === 'together') return [cur];
        const there = players.filter((id) => clock(id).location === step.to);
        return there.length ? rank(there) : rank(players);
      }
      case 'interview': return rank(players);
      case 'topic': case 'press': case 'present': case 'leave': {
        const by = s.interviews[step.suspect]?.by;
        return by ? [by] : [cur];
      }
      case 'inspect': case 'detail': {
        const loc = indexOf(def).zones.get(step.zone)?.locationId;
        const there = players.filter((id) => clock(id).location === loc);
        if (opts.mode === 'together') return rank(there.length ? there : players);
        return there.includes(cur) ? [cur, ...rank(there.filter((x) => x !== cur))] : rank(there.length ? there : players);
      }
      case 'labCollect': return [...players].sort((a, b) => clock(b).minute - clock(a).minute);
      default: return [cur];
    }
  };

  steps.forEach((step, i) => {
    if (step.do === 'endDay' || (step.do === 'finale' && s.phase === 'investigating' && !days.some((d) => d.day === s.day))) {
      const used = players.map((id) => clock(id).used);
      days.push({ day: s.day, maxUsed: Math.max(...used), totalUsed: used.reduce((a, b) => a + b, 0), budget: team.budget });
    }
    if (step.do === 'travel' && opts.mode === 'together') {
      // everyone goes; the one with most time left leads the work there
      for (const id of players) { try { exec(id, step); } catch (e) { if (!(e instanceof ActionError)) throw e; } }
      cur = rank(players)[0];
      return;
    }
    const order = pick(step);
    const candidates = [...order, ...rank(players).filter((x) => !order.includes(x))];
    const single = ['endDay', 'nightChoice', 'finale', 'topic', 'press', 'present', 'leave'].includes(step.do);
    let last: unknown;
    for (const round of [0, 1]) {
      if (round === 1) {
        // recovery: everyone reads their private notes out; a suspect's hours are waited for (free in co-op)
        shareAll();
        if (step.do === 'interview' && !s.sim) {
          const id = candidates[0];
          try { as(id, (ctx) => { if (A.waitMinutes(ctx, step.suspect) !== undefined) A.wait(ctx, { until: step.suspect }); }); } catch { /* nothing to wait for */ }
        }
      }
      for (const id of single ? candidates.slice(0, 1) : candidates) {
        try {
          exec(id, step);
          if (['travel', 'interview'].includes(step.do) || ((step.do === 'inspect' || step.do === 'detail') && opts.mode === 'together')) cur = id;
          if (step.do === 'interview') cur = id;
          return;
        } catch (e) {
          if (!(e instanceof ActionError)) throw e;
          last = e;
        }
      }
    }
    failures.push({ step: i, what: JSON.stringify(step), message: (last as Error)?.message ?? 'failed' });
  });
  return { st, players, failures, readOuts, days, budget: team.budget };
}
