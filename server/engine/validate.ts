// SERVER-ONLY. A case may not be published unless this returns ok.
// Structural integrity + a reachability simulation of an exhaustive player.
import type { CaseDefinition, Requirement, TierDef } from './types.ts';
import { variants } from './i18n.ts';
import { validateV2 } from './v2/validate.ts';
import { newSessionState, meets, discover, hear, type SessionState } from './state.ts';

export interface ValidationReport {
  ok: boolean;
  errors: string[];
  warnings: string[];
  stats: Record<string, number>;
}

export function validateCase(def: CaseDefinition): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  const evIds = new Set(def.evidence.map((e) => e.id));
  const stIds = new Set(def.statements.map((s) => s.id));
  const anIds = new Set(def.analyses.map((a) => a.id));
  const ctIds = new Set(def.contradictions.map((c) => c.id));
  const suspectIds = new Set(def.suspects.map((s) => s.id));
  const peopleIds = new Set(def.people.map((p) => p.id));
  const hotspotIds = new Set<string>();

  const dup = (label: string, ids: string[]) => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) errors.push(`Duplicate ${label} id: ${id}`);
      seen.add(id);
    }
  };
  dup('evidence', def.evidence.map((e) => e.id));
  dup('evidence code', def.evidence.map((e) => e.code));
  dup('statement', def.statements.map((s) => s.id));
  dup('analysis', def.analyses.map((a) => a.id));
  dup('contradiction', def.contradictions.map((c) => c.id));
  dup('suspect', def.suspects.map((s) => s.id));
  dup('hotspot', def.locations.flatMap((l) => l.hotspots.map((h) => h.id)));

  const ref = (kind: 'evidence' | 'statement' | 'analysis' | 'contradiction' | 'person', id: string, where: string) => {
    const set = kind === 'evidence' ? evIds : kind === 'statement' ? stIds : kind === 'analysis' ? anIds : kind === 'contradiction' ? ctIds : new Set([...peopleIds, ...suspectIds]);
    if (!set.has(id)) errors.push(`${where}: unknown ${kind} "${id}"`);
  };
  const refReq = (r: Requirement | undefined, where: string) => {
    r?.evidence?.forEach((e) => ref('evidence', e, where));
    r?.statements?.forEach((s) => ref('statement', s, where));
    r?.analyses?.forEach((a) => ref('analysis', a, where));
    r?.contradictions?.forEach((c) => ref('contradiction', c, where));
  };

  // briefing
  def.briefing.startingEvidence.forEach((e) => ref('evidence', e, 'briefing.startingEvidence'));
  def.briefing.startingStatements.forEach((s) => ref('statement', s, 'briefing.startingStatements'));
  ref('person', def.briefing.victim.personId, 'briefing.victim');
  def.briefing.knownWitnesses.forEach((p) => ref('person', p, 'briefing.knownWitnesses'));

  // truth
  if (!suspectIds.has(def.truth.killerId)) errors.push('truth.killerId is not a suspect');
  ref('evidence', def.truth.weaponEvidenceId, 'truth.weapon');
  if (!def.accusation.motives.some((m) => m.id === def.truth.motiveId)) errors.push('truth.motiveId not among accusation motives');
  if (!def.accusation.methods.some((m) => m.id === def.truth.methodId)) errors.push('truth.methodId not among accusation methods');
  if (!def.accusation.windows.some((w) => w.id === def.accusation.correctWindowId)) errors.push('accusation.correctWindowId unknown');
  const tod = def.truth.timeOfDeath;
  if (!(tod.from <= tod.actual && tod.actual <= tod.to)) errors.push('truth.timeOfDeath.actual outside its window');

  // locations
  for (const l of def.locations) {
    refReq(l.requires, `location ${l.id}`);
    for (const h of l.hotspots) {
      hotspotIds.add(h.id);
      h.reveals?.forEach((e) => ref('evidence', e, `hotspot ${h.id}`));
      refReq(h.requires, `hotspot ${h.id}`);
      if (h.x < 0 || h.x > 1 || h.y < 0 || h.y > 1) errors.push(`hotspot ${h.id} outside the plan`);
    }
  }
  for (const e of def.evidence) {
    if (e.locationId && !def.locations.some((l) => l.id === e.locationId)) errors.push(`evidence ${e.id}: unknown location`);
    e.relatedPeople.forEach((p) => ref('person', p, `evidence ${e.id}`));
  }
  for (const a of def.analyses) {
    ref('evidence', a.evidenceId, `analysis ${a.id}`);
    a.reveals?.forEach((e) => ref('evidence', e, `analysis ${a.id}`));
    refReq(a.requires, `analysis ${a.id}`);
    if (a.requires && !a.lockedReason) warnings.push(`analysis ${a.id} is gated but has no lockedReason`);
  }
  for (const s of def.statements) if (!suspectIds.has(s.speakerId) && !peopleIds.has(s.speakerId)) errors.push(`statement ${s.id}: unknown speaker`);

  // suspects
  for (const s of def.suspects) {
    if (!s.topics.length) errors.push(`suspect ${s.id} has no topics`);
    if (!s.deflections.length || !s.dismissals.length || !s.pushback.length || !s.shutdownLines.length) errors.push(`suspect ${s.id} is missing fallback lines`);
    for (const t of s.topics) {
      if (!t.tiers.length) errors.push(`topic ${s.id}/${t.id} has no tiers`);
      if (!t.keywords.length) warnings.push(`topic ${s.id}/${t.id} has no keywords (only evidence can raise it)`);
      t.evidence?.forEach((e) => ref('evidence', e, `topic ${s.id}/${t.id}`));
      t.tiers.forEach((tier, i) => {
        const where = `tier ${s.id}/${t.id}#${i}`;
        tier.requires?.presented?.forEach((e) => ref('evidence', e, where));
        tier.requires?.presentedAny?.forEach((e) => ref('evidence', e, where));
        refReq(tier.requires?.known, where);
        tier.statements?.forEach((x) => {
          ref('statement', x, where);
          const st = def.statements.find((y) => y.id === x);
          if (st && st.speakerId !== s.id) errors.push(`${where}: statement ${x} belongs to ${st.speakerId}`);
          if (st && st.truthful !== (tier.stance === 'truth') && tier.stance !== 'partial' && tier.stance !== 'evasive') {
            errors.push(`${where}: stance "${tier.stance}" but statement ${x} truthful=${st.truthful}`);
          }
        });
        tier.revealsEvidence?.forEach((e) => ref('evidence', e, where));
        if (!tier.facts.length) warnings.push(`${where} has no facts for the renderer`);
      });
    }
    for (const g of s.guarded) {
      const t = s.topics.find((x) => x.id === g.unlockedBy.topic);
      if (!t || !t.tiers[g.unlockedBy.tier]) errors.push(`guarded term "${g.term}" of ${s.id} points at a missing tier`);
    }
    // the authored lines must respect the suspect's own guard list
    for (const t of s.topics) t.tiers.forEach((tier, i) => {
      for (const g of s.guarded) {
        const lockedAtThisTier = g.unlockedBy.topic !== t.id ? false : i < g.unlockedBy.tier;
        if (lockedAtThisTier && variants(tier.line).some((v) => v.toLowerCase().includes(g.term))) errors.push(`tier ${s.id}/${t.id}#${i} line contains guarded term "${g.term}"`);
      }
    });
  }

  // contradictions must expose deliberate lies only
  for (const c of def.contradictions) {
    ref('statement', c.statementId, `contradiction ${c.id}`);
    ref('evidence', c.evidenceId, `contradiction ${c.id}`);
    const s = def.statements.find((x) => x.id === c.statementId);
    if (s?.truthful) errors.push(`contradiction ${c.id} targets a truthful statement — accidental contradiction`);
  }

  // accusation key
  def.accusation.decisiveEvidence.forEach((e) => ref('evidence', e, 'accusation.decisiveEvidence'));
  def.accusation.keyContradictions.forEach((c) => ref('contradiction', c, 'accusation.keyContradictions'));
  for (const [sid, list] of Object.entries(def.accusation.clearing)) {
    if (!suspectIds.has(sid)) errors.push(`accusation.clearing: unknown suspect ${sid}`);
    list.forEach((e) => ref('evidence', e, `accusation.clearing.${sid}`));
  }
  for (const s of def.suspects) {
    const list = def.accusation.clearing[s.id] ?? [];
    if (s.id === def.truth.killerId && list.length) errors.push('The killer has clearing evidence');
    if (s.id !== def.truth.killerId && !list.length) errors.push(`Innocent suspect ${s.id} cannot be cleared by any evidence`);
  }
  for (const e of def.accusation.decisiveEvidence) {
    const ev = def.evidence.find((x) => x.id === e);
    if (ev && ev.role !== 'decisive') errors.push(`decisive evidence ${e} has role ${ev.role}`);
  }
  for (const ev of def.evidence) {
    if (ev.role === 'decisive' && !def.accusation.decisiveEvidence.includes(ev.id)) warnings.push(`evidence ${ev.id} is decisive but not in the answer key`);
  }
  const killerLinked = def.accusation.decisiveEvidence.filter((e) => def.evidence.find((x) => x.id === e)?.relatedPeople.includes(def.truth.killerId));
  if (killerLinked.length < 2) errors.push('Fewer than two decisive items point at the killer');
  if (def.accusation.decisiveEvidence.length < 5) errors.push('Answer key needs at least five decisive items (scoring counts five)');
  for (const h of def.hints) {
    refReq(h.requires, `hint ${h.id}`);
    refReq(h.until, `hint ${h.id}`);
  }

  // ── reachability: an exhaustive player who examines everything, runs every lab
  //    and presents every piece of evidence to every suspect, repeatedly.
  const sim = simulate(def);
  const reach = sim.st;
  // (a v2 case reveals evidence through zones, presses and night forks as well: the v2 validator checks those)
  for (const e of def.evidence) {
    if (e.id in reach.evidence) continue;
    if (e.role === 'decisive') errors.push(`evidence ${e.id} (${e.role}) is unreachable`);
    else if (!def.v2) warnings.push(`evidence ${e.id} (${e.role}) is unreachable`);
  }
  for (const a of def.analyses) if (!(a.id in reach.analyses) && !def.v2) warnings.push(`analysis ${a.id} is unreachable`);
  for (const s of def.statements) if (!(s.id in reach.statements)) warnings.push(`statement ${s.id} is unreachable`);
  for (const c of def.contradictions) {
    if (!(c.statementId in reach.statements) || !(c.evidenceId in reach.evidence)) errors.push(`contradiction ${c.id} can never be proven`);
  }
  for (const [sid, list] of Object.entries(def.accusation.clearing)) {
    if (list.length && !list.some((e) => e in reach.evidence)) errors.push(`no clearing evidence for ${sid} is reachable`);
  }
  for (const s of def.suspects) for (const t of s.topics) {
    const reached = reach.suspects[s.id].tiers[t.id] ?? -1;
    if (reached < t.tiers.length - 1) warnings.push(`tier ${s.id}/${t.id}#${reached + 1} is unreachable`);
  }
  const reachableKey = def.accusation.keyContradictions.filter((c) => {
    const x = def.contradictions.find((y) => y.id === c);
    return x && x.statementId in reach.statements && x.evidenceId in reach.evidence;
  });
  if (reachableKey.length < 2) errors.push('Fewer than two key contradictions are provable');

  // ── v2 game layer
  let v2stats: Record<string, number> = {};
  if (def.v2 && errors.length === 0) {
    const r = validateV2(def);
    errors.push(...r.errors);
    warnings.push(...r.warnings);
    v2stats = Object.fromEntries(Object.entries(r.stats).map(([k, v]) => [`v2.${k}`, v]));
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    stats: {
      suspects: def.suspects.length,
      evidence: def.evidence.length,
      decisive: def.accusation.decisiveEvidence.length,
      analyses: def.analyses.length,
      statements: def.statements.length,
      contradictions: def.contradictions.length,
      topics: def.suspects.reduce((n, s) => n + s.topics.length, 0),
      simulationRounds: sim.rounds,
      ...v2stats,
    },
  };
}

function tierOpen(tier: TierDef, presented: string[], st: SessionState, stress: number): boolean {
  const r = tier.requires;
  if (!r) return true;
  if (r.presented && !r.presented.every((e) => presented.includes(e))) return false;
  if (r.presentedAny && !r.presentedAny.some((e) => presented.includes(e))) return false;
  if (r.known && !meets(r.known, st)) return false;
  if (r.minStress !== undefined && stress < r.minStress) return false;
  return true;
}

export function simulate(def: CaseDefinition): { st: SessionState; rounds: number } {
  const st = newSessionState(def, 'sim', 0);
  let rounds = 0;
  for (let changed = true; changed && rounds < 50; rounds++) {
    changed = false;
    const before = JSON.stringify([st.evidence, st.analyses, st.statements, Object.values(st.suspects).map((s) => s.tiers)]);
    for (const l of def.locations) {
      if (!meets(l.requires, st)) continue;
      for (const h of l.hotspots) if (meets(h.requires, st)) { if (!st.hotspots.includes(h.id)) st.hotspots.push(h.id); discover(st, h.reveals, 1); }
    }
    for (const a of def.analyses) {
      if (a.evidenceId in st.evidence && meets(a.requires, st) && !(a.id in st.analyses)) { st.analyses[a.id] = 1; discover(st, a.reveals, 1); }
    }
    for (const s of def.suspects) {
      const ss = st.suspects[s.id];
      ss.presented = Object.keys(st.evidence);
      // stress is assumed raisable to any level reachable by repeated confrontation (each +3)
      const stress = 100;
      for (const t of s.topics) {
        let cur = ss.tiers[t.id] ?? -1;
        while (t.tiers[cur + 1] && tierOpen(t.tiers[cur + 1], ss.presented, st, stress)) {
          cur += 1;
          hear(st, t.tiers[cur].statements, 1);
          discover(st, t.tiers[cur].revealsEvidence, 1);
        }
        ss.tiers[t.id] = cur;
      }
    }
    const after = JSON.stringify([st.evidence, st.analyses, st.statements, Object.values(st.suspects).map((s) => s.tiers)]);
    changed = before !== after;
  }
  return { st, rounds };
}
