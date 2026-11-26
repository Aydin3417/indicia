// SERVER-ONLY. v2 player actions: pure and deterministic. Each mutates the session state and returns
// a V2Event. Time is charged only when an action succeeds; refusals (ActionError) cost nothing.
import type { CaseResult, V2Event } from '../../../shared/api.ts';
import type { CaseDefinition, CaseV2, DeductionDef, Emotion, Locale, NightEventDef, NightOptionDef, Requirement, SuspectDef, TopicDef, ZoneDef } from '../types.ts';
import { buildDebrief } from '../evaluate.ts';
import type { SessionState } from '../state.ts';
import { clamp, hear, meets } from '../state.ts';
import { ActionError, type ActionErrorCode } from '../actions.ts';
import { hintAvailable, nameOf } from '../projection.ts';
import { markedFacts, sys, SYS_KEYS, tx, type SysKey } from '../i18n.ts';
import { COMPOSURE_STEPS, composureOf } from '../interrogation.ts';
import type { Classification } from '../matcher.ts';
import {
  absNow, claimsOf, costsOf, deductionVisible, elapsedOf, indexOf, isUnlocked, locationOpen, patienceOf, proofNeeds,
  remainingToday, shapeContains, totalBudget, zoneOpen, type FactSource, type LineRef, type LogEntry, type V2State,
} from './state.ts';
import {
  budgetOf, dropFromNotes, ensureNotes, holdsPrivately, membersOf, notesOf, privacyOn, privateEvidence, privateLocation, refreshBudget, syncActive,
} from './coop.ts';

export interface Ctx {
  def: CaseDefinition;
  st: SessionState;
  /** wall-clock ms, used for v1 bookkeeping (evidence order, debrief) */
  now: number;
  locale: Locale;
  actorId?: string;
}

// ───────────────────────────────────────────── plumbing

function fail(ctx: Ctx, key: SysKey, code: ActionErrorCode, reason: string): never {
  throw new ActionError(sys(key, ctx.locale), code, reason);
}

function need(ctx: Ctx): { v2: CaseV2; s: V2State } {
  const v2 = ctx.def.v2;
  const s = ctx.st.v2;
  if (!v2 || !s) throw new ActionError('This case has no v2 investigation.', 'not_found', 'locked');
  return { v2, s };
}

function assertInvestigating(ctx: Ctx, s: V2State, allowAwaiting = false) {
  if (s.phase === 'investigating') {
    // a night fork left unanswered is settled with its default the moment the player does anything else
    if (s.pendingFork !== undefined) settleFork(ctx, s);
    return;
  }
  if (s.phase === 'awaiting_finale' && allowAwaiting) return;
  if (s.phase === 'awaiting_finale') fail(ctx, 'phase_awaiting', 'conflict', 'phase');
  if (s.phase === 'finale') fail(ctx, 'phase_finale', 'conflict', 'phase');
  fail(ctx, 'phase_closed', 'conflict', 'phase');
}

export function assertHost(ctx: Ctx) {
  if (ctx.st.mode === 'coop' && ctx.actorId && ctx.actorId !== ctx.st.hostId) fail(ctx, 'not_host', 'locked', 'not_host');
}

/** Co-op: the item is still only in the actor's private notes → "read it out first" (free refusal). */
export function assertShared(ctx: Ctx, itemId: string) {
  if (holdsPrivately(ctx.st, ctx.actorId, itemId)) fail(ctx, 'private_first', 'conflict', 'private');
}

/** Check first, charge later: refusals must cost nothing. Co-op: the acting player's own budget counts too. */
function affordable(ctx: Ctx, v2: CaseV2, s: V2State, cost: number) {
  if (s.sim || cost <= 0) return;
  if (s.minute + cost > v2.clock.minutesPerDay) fail(ctx, 'no_time', 'conflict', 'no_time');
  if (s.budget !== undefined && (s.used ?? 0) + cost > s.budget) fail(ctx, 'no_time', 'conflict', 'no_time');
}

/** Move the clock and charge the budget (no check). */
function charge(s: V2State, cost: number) {
  s.minute += cost;
  s.spent += cost;
  if (s.budget !== undefined) s.used = (s.used ?? 0) + cost;
}

function spend(ctx: Ctx, v2: CaseV2, s: V2State, cost: number): number {
  affordable(ctx, v2, s, cost);
  charge(s, cost);
  return cost;
}

const req = (ctx: Ctx) => (r: Requirement | undefined) => meets(r, ctx.st);

/**
 * Add facts to the notebook. `priv` (co-op, a private source): they go to the actor's own notes instead, until read
 * out (see coop `share`). A fact the team learns some other way leaves every private note.
 */
export function addFacts(ctx: Ctx, s: V2State, ids: string[] | undefined, src: FactSource, priv = false): string[] {
  const fresh: string[] = [];
  const toNotes = priv && privacyOn(ctx.def, ctx.st, ctx.actorId);
  for (const id of ids ?? []) {
    if (id in s.facts) continue;
    if (toNotes) {
      const n = ensureNotes(ctx.st, ctx.actorId!);
      if (id in n.facts) continue;
      s.seq += 1;
      n.facts[id] = { day: s.day, minute: s.minute, seq: s.seq, src };
      fresh.push(id);
      continue;
    }
    s.seq += 1;
    s.facts[id] = { day: s.day, minute: s.minute, seq: s.seq, src };
    dropFromNotes(ctx.st, id);
    fresh.push(id);
  }
  return fresh;
}

export function addEvidence(ctx: Ctx, s: V2State, ids: string[] | undefined, priv = false): string[] {
  const fresh: string[] = [];
  for (const id of ids ?? []) {
    if (id in ctx.st.evidence) continue;
    if ((priv || privateEvidence(ctx.def, id)) && privacyOn(ctx.def, ctx.st, ctx.actorId)) {
      const n = ensureNotes(ctx.st, ctx.actorId!);
      if (id in n.evidence) continue;
      s.seq += 1;
      n.evidence[id] = { day: s.day, minute: s.minute, seq: s.seq };
      fresh.push(id);
      continue;
    }
    s.seq += 1;
    ctx.st.evidence[id] = ctx.now + s.seq; // strictly increasing: keeps discovery order in v1 views
    s.evidenceFound[id] = { day: s.day, minute: s.minute, seq: s.seq };
    dropFromNotes(ctx.st, id);
    fresh.push(id);
  }
  return fresh;
}

function log(s: V2State, e: Omit<LogEntry, 'seq' | 'day' | 'minute'>) {
  s.seq += 1;
  s.log.push({ ...e, seq: s.seq, day: s.day, minute: s.minute });
  if (s.log.length > 600) s.log.splice(0, s.log.length - 600);
}

const suspectOf = (ctx: Ctx, id: string): SuspectDef => {
  const s = ctx.def.suspects.find((x) => x.id === id);
  if (!s) fail(ctx, 'unknown', 'not_found', 'locked');
  return s;
};

/** fact, evidence, or (finale only) a confirmed deduction */
export function owns(ctx: Ctx, id: string, allowDeductions = false): boolean {
  const s = ctx.st.v2!;
  return id in s.facts || id in ctx.st.evidence || (allowDeductions && !!s.deductions[id]?.confirmed);
}

export function knownTimes(def: CaseDefinition, s: V2State): string[] {
  const out = new Set<string>();
  for (const f of def.v2?.facts ?? []) if (f.time && f.id in s.facts) out.add(f.time);
  return [...out].sort();
}

export function topicAvailable(ctx: Ctx, suspect: SuspectDef, topic: TopicDef): boolean {
  const s = ctx.st.v2!;
  const cfg = topic.v2;
  if (!cfg) return true;
  if (cfg.locked && !isUnlocked(s, `topic:${suspect.id}:${topic.id}`)) return false;
  if (!meets(cfg.requires, ctx.st)) return false;
  if (!cfg.chips?.length) return true;
  const people = new Set([...ctx.def.suspects.map((x) => x.id), ...ctx.def.people.map((p) => p.id)]);
  return cfg.chips.some((c) => people.has(c) || owns(ctx, c));
}

export function suspectAvailableNow(v2: CaseV2, s: V2State, suspectId: string): boolean {
  if (s.sim) return true;
  const windows = v2.clock.availability?.[suspectId];
  if (!windows) return true;
  return windows.some((w) => w.day === s.day && s.minute >= (w.from ?? 0) && s.minute < (w.to ?? v2.clock.minutesPerDay));
}

/** Snapshot of things the client should be told about when they change. */
function snapshot(ctx: Ctx) {
  const { v2, s } = need(ctx);
  const now = absNow(v2, s);
  return {
    ready: new Set(s.lab.filter((j) => !j.collected && j.readyAt <= now).map((j) => j.analysisId)),
    deductions: new Set(v2.deductions.filter((d) => deductionVisible(s, req(ctx), d)).map((d) => d.id)),
  };
}

/** Run an action and add the generic "what changed" fields to its event. */
export function run(ctx: Ctx, fn: () => V2Event): V2Event {
  const before = snapshot(ctx);
  return withDiff(ctx, before, fn());
}

export async function runAsync(ctx: Ctx, fn: () => Promise<V2Event> | V2Event): Promise<V2Event> {
  const before = snapshot(ctx);
  return withDiff(ctx, before, await fn());
}

function withDiff(ctx: Ctx, before: ReturnType<typeof snapshot>, event: V2Event): V2Event {
  const after = snapshot(ctx);
  const labReady = [...after.ready].filter((a) => !before.ready.has(a));
  const newDeductions = [...after.deductions].filter((d) => !before.deductions.has(d));
  if (labReady.length) event.labReady = labReady;
  if (newDeductions.length) event.newDeductions = newDeductions;
  return event;
}

// ───────────────────────────────────────────── map & scene

export function travel(ctx: Ctx, locationId: string): V2Event {
  const { v2, s } = need(ctx);
  assertInvestigating(ctx, s);
  if (!ctx.def.locations.some((l) => l.id === locationId)) fail(ctx, 'unknown', 'not_found', 'locked');
  if (!locationOpen(ctx.def, s, req(ctx), locationId)) fail(ctx, 'locked', 'locked', 'locked');
  if (s.location === locationId) fail(ctx, 'already', 'conflict', 'already');
  const loc = ctx.def.locations.find((l) => l.id === locationId)!;
  const cost = spend(ctx, v2, s, loc.v2?.travel ?? costsOf(v2).travel);
  s.location = locationId;
  clearIntent(ctx, 'go', locationId);
  return { kind: 'travel', ok: true, cost };
}

function openZone(ctx: Ctx, z: ZoneDef) {
  const s = ctx.st.v2!;
  s.zones.push(z.id);
  const priv = privateLocation(ctx.def, indexOf(ctx.def).zones.get(z.id)?.locationId);
  let evidence: string[] = [];
  if (z.hotspotId) {
    const h = ctx.def.locations.flatMap((l) => l.hotspots).find((x) => x.id === z.hotspotId);
    if (h && !ctx.st.hotspots.includes(h.id)) ctx.st.hotspots.push(h.id);
    if (h) evidence = addEvidence(ctx, s, h.reveals, priv);
  }
  evidence = [...evidence, ...addEvidence(ctx, s, z.evidence, priv)];
  const facts = addFacts(ctx, s, z.facts, { type: 'scene', ref: z.id }, priv);
  return { newEvidence: evidence, newFacts: facts };
}

function zoneHere(ctx: Ctx, zoneId: string) {
  const s = ctx.st.v2!;
  const hit = indexOf(ctx.def).zones.get(zoneId);
  if (!hit || !zoneOpen(s, req(ctx), hit.zone)) fail(ctx, 'unknown', 'not_found', 'locked');
  if (s.location !== hit.locationId) fail(ctx, 'not_here', 'conflict', 'not_here');
  return hit.zone;
}

/** Open the close-up card of a visible zone (or re-open any inspected zone for free). */
export function inspect(ctx: Ctx, zoneId: string): V2Event {
  const { v2, s } = need(ctx);
  assertInvestigating(ctx, s);
  const z = zoneHere(ctx, zoneId);
  if (s.zones.includes(z.id)) return { kind: 'inspect', ok: true, cost: 0, outcome: 'already', zoneId: z.id };
  if ((z.reveal ?? 'visible') !== 'visible') fail(ctx, 'unknown', 'not_found', 'locked');
  const cost = spend(ctx, v2, s, costsOf(v2).closeUp);
  return { kind: 'inspect', ok: true, cost, zoneId: z.id, ...openZone(ctx, z) };
}

/** Sweep a hidden-trace tool over a point of the scene. Needs tool + close-up minutes available. */
export function probe(ctx: Ctx, locationId: string, tool: 'uv' | 'dust', x: number, y: number): V2Event {
  const { v2, s } = need(ctx);
  assertInvestigating(ctx, s);
  if (s.location !== locationId) fail(ctx, 'not_here', 'conflict', 'not_here');
  const c = costsOf(v2);
  affordable(ctx, v2, s, c.tool + c.closeUp);
  const scene = v2.scenes.find((sc) => sc.locationId === locationId);
  const z = scene?.zones.find((zz) => zz.reveal === tool && !s.zones.includes(zz.id) && zoneOpen(s, req(ctx), zz) && shapeContains(zz.shape, x, y));
  if (!z) {
    const cost = spend(ctx, v2, s, c.tool);
    return { kind: 'probe', ok: true, cost, outcome: 'miss', message: sys(tool === 'uv' ? 'probe_miss_uv' : 'probe_miss_dust', ctx.locale) };
  }
  const cost = spend(ctx, v2, s, c.tool + c.closeUp);
  return { kind: 'probe', ok: true, cost, outcome: 'hit', zoneId: z.id, ...openZone(ctx, z) };
}

export function detail(ctx: Ctx, zoneId: string, detailId: string, tool?: string): V2Event {
  const { v2, s } = need(ctx);
  assertInvestigating(ctx, s);
  const z = zoneHere(ctx, zoneId);
  if (!s.zones.includes(z.id)) fail(ctx, 'locked', 'conflict', 'locked');
  const d = z.details.find((x) => x.id === detailId);
  if (!d) fail(ctx, 'unknown', 'not_found', 'locked');
  const key = `${z.id}/${d.id}`;
  if (s.details.includes(key)) return { kind: 'detail', ok: true, cost: 0, outcome: 'already', zoneId, detailId };
  if (d.tool && tool !== d.tool) fail(ctx, 'needs_tool', 'bad_request', 'needs_tool');
  const cost = d.tool ? spend(ctx, v2, s, costsOf(v2).tool) : 0;
  s.details.push(key);
  const priv = privateLocation(ctx.def, indexOf(ctx.def).zones.get(z.id)?.locationId);
  const newEvidence = addEvidence(ctx, s, d.evidence, priv);
  const newFacts = addFacts(ctx, s, d.facts, { type: 'scene', ref: key }, priv);
  return { kind: 'detail', ok: true, cost, zoneId, detailId, newFacts, newEvidence };
}

/** Tap a marked phrase in a document. `key` = "<line>.<n>" (n-th marked phrase of that line). Free. */
export function collect(ctx: Ctx, evidenceId: string, key: string): V2Event {
  const { s } = need(ctx);
  assertInvestigating(ctx, s, true);
  // co-op: a document in your private notes can be read (its phrases stay in your notes too)
  const mine = !(evidenceId in ctx.st.evidence) && !!notesOf(ctx.st, ctx.actorId)?.evidence[evidenceId];
  if (!(evidenceId in ctx.st.evidence) && !mine) fail(ctx, 'not_owned', 'bad_request', 'not_owned');
  const e = ctx.def.evidence.find((x) => x.id === evidenceId);
  const m = /^(\d+)\.(\d+)$/.exec(key);
  const line = e?.body?.[Number(m?.[1] ?? -1)];
  const factId = m && line !== undefined ? markedFacts(tx(line, 'en'))[Number(m[2])] : undefined;
  if (!factId) fail(ctx, 'unknown', 'not_found', 'locked');
  if (factId in s.facts || (mine && factId in (notesOf(ctx.st, ctx.actorId)?.facts ?? {}))) return { kind: 'collect', ok: true, cost: 0, outcome: 'already' };
  const newFacts = addFacts(ctx, s, [factId], { type: 'document', ref: evidenceId }, mine);
  return { kind: 'collect', ok: true, cost: 0, newFacts };
}

// ───────────────────────────────────────────── lab

export const labMinutes = (a: { v2?: { minutes: number } }) => a.v2?.minutes ?? 180;

export function labStatus(ctx: Ctx, analysisId: string): 'locked' | 'available' | 'running' | 'ready' | 'done' {
  const { v2, s } = need(ctx);
  const a = ctx.def.analyses.find((x) => x.id === analysisId)!;
  if (analysisId in ctx.st.analyses) return 'done';
  const job = s.lab.find((j) => j.analysisId === analysisId);
  if (job) return job.readyAt <= absNow(v2, s) ? 'ready' : 'running';
  if (a.v2?.locked && !isUnlocked(s, `analysis:${a.id}`)) return 'locked';
  if (!meets(a.requires, ctx.st)) return 'locked';
  return 'available';
}

export function labSubmit(ctx: Ctx, analysisId: string): V2Event {
  const { v2, s } = need(ctx);
  assertInvestigating(ctx, s);
  const a = ctx.def.analyses.find((x) => x.id === analysisId);
  if (!a) fail(ctx, 'unknown', 'not_found', 'locked');
  assertShared(ctx, a.evidenceId);
  if (!(a.evidenceId in ctx.st.evidence)) fail(ctx, 'not_owned', 'bad_request', 'not_owned');
  const status = labStatus(ctx, a.id);
  if (status === 'locked') {
    throw new ActionError(a.lockedReason ? tx(a.lockedReason, ctx.locale) : sys('locked', ctx.locale), 'locked', 'locked');
  }
  if (status !== 'available') fail(ctx, 'already', 'conflict', 'already');
  const now = absNow(v2, s);
  const running = s.lab.filter((j) => j.readyAt > now).length;
  if (!s.sim && running >= (v2.clock.labSlots ?? 2)) fail(ctx, 'lab_full', 'conflict', 'lab_full');
  s.lab.push({ analysisId: a.id, submittedAt: now, readyAt: s.sim ? now : now + labMinutes(a), collected: false });
  return { kind: 'lab_submit', ok: true, cost: 0 };
}

/** Take in finished lab results (all, or one). Free. */
export function labCollect(ctx: Ctx, analysisId?: string): V2Event {
  const { v2, s } = need(ctx);
  assertInvestigating(ctx, s, true);
  const now = absNow(v2, s);
  const jobs = s.lab.filter((j) => !j.collected && j.readyAt <= now && (!analysisId || j.analysisId === analysisId));
  const newEvidence: string[] = [];
  const newFacts: string[] = [];
  for (const j of jobs) {
    const a = ctx.def.analyses.find((x) => x.id === j.analysisId)!;
    j.collected = true;
    ctx.st.analyses[a.id] = ctx.now;
    newEvidence.push(...addEvidence(ctx, s, a.reveals));
    newFacts.push(...addFacts(ctx, s, a.v2?.facts, { type: 'lab', ref: a.id }));
    clearIntent(ctx, 'lab', a.id);
  }
  return { kind: 'lab_collect', ok: true, cost: 0, outcome: String(jobs.length), newEvidence, newFacts };
}

// ───────────────────────────────────────────── interviews

/**
 * Co-op: an interview is held by the investigator who opened it; the others can follow it (the log is shared) but
 * not ask. A holder who left the room no longer blocks it.
 */
export function heldByOther(ctx: Ctx, suspectId: string): string | undefined {
  if (ctx.st.mode !== 'coop' || !ctx.actorId) return undefined;
  const iv = ctx.st.v2!.interviews[suspectId];
  if (!iv?.open || !iv.by || iv.by === ctx.actorId || !(iv.by in ctx.st.players)) return undefined;
  return iv.by;
}

function assertNotHeld(ctx: Ctx, suspectId: string) {
  const by = heldByOther(ctx, suspectId);
  if (by) throw new ActionError(sys('held', ctx.locale, ctx.st.players[by]?.name ?? '?'), 'conflict', 'held');
}

function interviewOpen(ctx: Ctx, suspectId: string) {
  const s = ctx.st.v2!;
  const iv = s.interviews[suspectId];
  if (!iv?.open) fail(ctx, 'not_open', 'conflict', 'not_open');
  assertNotHeld(ctx, suspectId);
  return iv;
}

const spoken = (_ctx: Ctx, suspect: SuspectDef, text: string, emotion?: Emotion) =>
  ({ speakerId: suspect.id, speakerName: suspect.name, text, emotion });

/** Every broken claim costs the suspect at least this much composure. */
const BREAK_STRESS = 10;

/**
 * Move a topic to `target`, applying the effects of every tier passed and of the tier reached.
 * Composure only ever slips in v2: a tier's stress counts when positive (a v1 "relief" value such as Jonas
 * owning up to the copy would otherwise move the meter back towards composed right after a breakthrough),
 * and a break costs at least BREAK_STRESS.
 */
function reachTier(ctx: Ctx, suspect: SuspectDef, topic: TopicDef, target: number, broke = false) {
  const s = ctx.st.v2!;
  const ss = ctx.st.suspects[suspect.id];
  const from = ss.tiers[topic.id] ?? -1;
  let pressure = 0;
  for (let i = Math.max(0, from + 1); i <= target; i++) {
    const t = topic.tiers[i];
    pressure += Math.max(0, t.stress ?? 0);
    if (t.trust) ss.trust = clamp(ss.trust + t.trust);
  }
  let next = ss.stress + (broke ? Math.max(pressure, BREAK_STRESS) : pressure);
  // every breakthrough shows: a break always moves the suspect at least one composure stage (until "breaking")
  if (broke) {
    const step = COMPOSURE_STEPS.find((x) => x > ss.stress);
    if (step !== undefined) next = Math.max(next, step);
  }
  ss.stress = clamp(next);
  ss.tiers[topic.id] = target;
  ss.asked[topic.id] = (ss.asked[topic.id] ?? 0) + 1;
  const tier = topic.tiers[target];
  hear(ctx.st, tier.statements, ctx.now);
  const newEvidence = addEvidence(ctx, s, tier.revealsEvidence);
  const newFacts: string[] = [];
  const newClaims: string[] = [];
  for (const c of claimsOf(suspect, topic, target)) {
    s.claims[c.id] ??= {};
    newClaims.push(c.id);
    newFacts.push(...addFacts(ctx, s, c.facts, { type: 'claim', ref: c.id }));
  }
  log(s, { suspectId: suspect.id, from: 'suspect', ref: { k: 'tier', topic: topic.id, tier: target }, topicId: topic.id });
  return { newEvidence, newFacts, newClaims, line: spoken(ctx, suspect, tx(tier.line, ctx.locale), tier.emotion) };
}

export function interviewStart(ctx: Ctx, suspectId: string): V2Event {
  const { v2, s } = need(ctx);
  assertInvestigating(ctx, s);
  const suspect = suspectOf(ctx, suspectId);
  const iv = s.interviews[suspectId];
  assertNotHeld(ctx, suspectId);
  const coop = ctx.st.mode === 'coop' && !!ctx.actorId;
  if (iv.open) {
    // co-op: taking over an interview whose holder left the room
    if (coop) iv.by = ctx.actorId;
    return { kind: 'interview_start', ok: true, cost: 0, outcome: 'already', patience: iv.patience };
  }
  if (iv.refusedDay === s.day) fail(ctx, 'refused', 'conflict', 'refused');
  if (!suspectAvailableNow(v2, s, suspectId)) fail(ctx, 'unavailable', 'conflict', 'unavailable');
  const cost = spend(ctx, v2, s, costsOf(v2).startInterview);
  if (coop) {
    // one interview at a time per investigator: starting another leaves the one you held
    for (const [id, other] of Object.entries(s.interviews)) {
      if (id === suspectId || !other.open || other.by !== ctx.actorId) continue;
      other.open = false;
      delete other.by;
      log(s, { suspectId: id, from: 'player', ref: { k: 'player' }, action: 'leave', actorId: ctx.actorId });
    }
    iv.by = ctx.actorId;
    clearIntent(ctx, 'interview', suspectId);
  }
  if (iv.patienceDay !== s.day) {
    iv.patience = patienceOf(suspect);
    iv.patienceDay = s.day;
  }
  iv.open = true;
  log(s, { suspectId, from: 'player', ref: { k: 'player' }, action: 'start', actorId: ctx.actorId });
  log(s, { suspectId, from: 'suspect', ref: { k: 'opening' } });
  return { kind: 'interview_start', ok: true, cost, patience: iv.patience, line: spoken(ctx, suspect, tx(suspect.opening, ctx.locale), 'guarded') };
}

export function interviewLeave(ctx: Ctx, suspectId: string): V2Event {
  const { s } = need(ctx);
  suspectOf(ctx, suspectId);
  const iv = s.interviews[suspectId];
  assertNotHeld(ctx, suspectId);
  if (iv.open) {
    iv.open = false;
    delete iv.by;
    log(s, { suspectId, from: 'player', ref: { k: 'player' }, action: 'leave', actorId: ctx.actorId });
  }
  return { kind: 'interview_leave', ok: true, cost: 0 };
}

export function openTopic(ctx: Ctx, suspectId: string, topicId: string): V2Event {
  const { v2, s } = need(ctx);
  assertInvestigating(ctx, s);
  const suspect = suspectOf(ctx, suspectId);
  interviewOpen(ctx, suspectId);
  const topic = suspect.topics.find((t) => t.id === topicId);
  if (!topic || !topicAvailable(ctx, suspect, topic)) fail(ctx, 'locked', 'locked', 'locked');
  const tier = ctx.st.suspects[suspectId].tiers[topic.id] ?? -1;
  if (tier >= 0) fail(ctx, 'already', 'conflict', 'already');
  const cost = spend(ctx, v2, s, costsOf(v2).openTopic);
  log(s, { suspectId, from: 'player', ref: { k: 'player' }, action: 'topic', topicId, actorId: ctx.actorId });
  const r = reachTier(ctx, suspect, topic, 0);
  return { kind: 'topic', ok: true, cost, outcome: 'opened', ...r };
}

function activeClaim(ctx: Ctx, suspectId: string, claimId: string) {
  const ref = indexOf(ctx.def).claims.get(claimId);
  if (!ref || ref.suspect.id !== suspectId) fail(ctx, 'unknown', 'not_found', 'locked');
  const s = ctx.st.v2!;
  const cur = ctx.st.suspects[suspectId].tiers[ref.topic.id] ?? -1;
  if (cur !== ref.tier || s.claims[claimId]?.broken) fail(ctx, 'claim_closed', 'conflict', 'claim_closed');
  return ref;
}

/**
 * What pressing a claim would do right now — shown on the claim before the player spends anything (PLAYTEST_V2 §7.2):
 * yes = it yields a fact, evidence or a new tier (costs `press`) · free = only the suspect's colour, no new facts
 * (costs nothing) · later = something is behind it but the player must know more first (refused, free) ·
 * none = nothing behind it · done = already pressed.
 */
export type PressState = 'yes' | 'free' | 'later' | 'none' | 'done';

export function pressState(ctx: Ctx, suspectId: string, claimId: string): PressState {
  const s = ctx.st.v2!;
  const ref = indexOf(ctx.def).claims.get(claimId);
  const p = ref?.claim.press;
  if (!ref || !p) return 'none';
  if (s.claims[claimId]?.pressed) return 'done';
  if (!meets(p.requires, ctx.st)) return 'later';
  const cur = ctx.st.suspects[suspectId]?.tiers[ref.topic.id] ?? -1;
  const yields = (p.facts ?? []).some((f) => !(f in s.facts)) || (p.evidence ?? []).some((e) => !(e in ctx.st.evidence))
    || (p.toTier !== undefined && p.toTier > cur);
  return yields ? 'yes' : 'free';
}

export function press(ctx: Ctx, suspectId: string, claimId: string): V2Event {
  const { v2, s } = need(ctx);
  assertInvestigating(ctx, s);
  interviewOpen(ctx, suspectId);
  const { suspect, topic, claim } = activeClaim(ctx, suspectId, claimId);
  // refusals are free: the claim says beforehand that it will not pay
  const state = pressState(ctx, suspectId, claimId);
  if (state === 'none') fail(ctx, 'nothing_to_press', 'conflict', 'nothing_to_press');
  if (state === 'later') fail(ctx, 'press_later', 'conflict', 'press_later');
  if (state === 'done') fail(ctx, 'already', 'conflict', 'already');
  const cost = state === 'yes' ? spend(ctx, v2, s, costsOf(v2).press) : 0;
  log(s, { suspectId, from: 'player', ref: { k: 'player' }, action: 'press', claimId, actorId: ctx.actorId });
  const cs = (s.claims[claimId] ??= {});
  const p = claim.press!;
  cs.pressed = true;
  if (state === 'free') {
    const tier = topic.tiers[ctx.st.suspects[suspectId].tiers[topic.id]];
    log(s, { suspectId, from: 'suspect', ref: { k: 'press', claim: claimId }, claimId, outcome: 'colour' });
    return { kind: 'press', ok: true, cost: 0, outcome: 'colour', claimId, line: spoken(ctx, suspect, tx(p.line, ctx.locale), tier.emotion) };
  }
  log(s, { suspectId, from: 'suspect', ref: { k: 'press', claim: claimId }, claimId, outcome: p.toTier !== undefined ? 'advance' : 'detail' });
  const newFacts = addFacts(ctx, s, p.facts, { type: 'press', ref: claimId });
  const newEvidence = addEvidence(ctx, s, p.evidence);
  const pressLine = tx(p.line, ctx.locale);
  if (p.toTier !== undefined && p.toTier > (ctx.st.suspects[suspectId].tiers[topic.id] ?? -1)) {
    const r = reachTier(ctx, suspect, topic, p.toTier);
    return {
      kind: 'press', ok: true, cost, outcome: 'advance', claimId,
      newFacts: [...newFacts, ...r.newFacts], newEvidence: [...newEvidence, ...r.newEvidence], newClaims: r.newClaims,
      line: { ...r.line, text: `${pressLine} ${r.line.text}`.trim() },
    };
  }
  const tier = topic.tiers[ctx.st.suspects[suspectId].tiers[topic.id]];
  return { kind: 'press', ok: true, cost, outcome: 'detail', claimId, newFacts, newEvidence, line: spoken(ctx, suspect, pressLine, tier.emotion) };
}

export function present(ctx: Ctx, suspectId: string, claimId: string, itemId: string): V2Event {
  const { v2, s } = need(ctx);
  assertInvestigating(ctx, s);
  const iv = interviewOpen(ctx, suspectId);
  const { suspect, topic, tier, claim } = activeClaim(ctx, suspectId, claimId);
  assertShared(ctx, itemId);
  if (!owns(ctx, itemId)) fail(ctx, 'not_owned', 'bad_request', 'not_owned');
  const cost = spend(ctx, v2, s, costsOf(v2).present);
  const ss = ctx.st.suspects[suspectId];
  if (itemId in ctx.st.evidence && !ss.presented.includes(itemId)) ss.presented.push(itemId);
  log(s, { suspectId, from: 'player', ref: { k: 'player' }, action: 'present', claimId, itemId, actorId: ctx.actorId });
  const bi = (claim.breaks ?? []).findIndex((b) => b.by.includes(itemId));
  const brk = bi >= 0 ? claim.breaks![bi] : undefined;
  if (brk && meets(brk.requires, ctx.st)) {
    s.claims[claimId] = { ...(s.claims[claimId] ?? {}), broken: true };
    const target = brk.toTier ?? tier + 1;
    const from = composureOf(ss);
    const r = reachTier(ctx, suspect, topic, target, true);
    s.log[s.log.length - 1].outcome = 'break';
    return { kind: 'present', ok: true, cost, outcome: 'break', claimId, patience: iv.patience, composure: { from, to: composureOf(ss) }, ...r };
  }
  if (brk) {
    // the claim's own resist line (it often says what is missing); without one, the suspect's own words in turn
    const said = s.log.filter((e) => e.suspectId === suspectId && e.ref.k === 'resist' && e.ref.b < 0).length;
    const ref: LineRef = brk.resist ? { k: 'resist', claim: claimId, b: bi } : { k: 'resist', claim: claimId, b: -1 - said };
    log(s, { suspectId, from: 'suspect', ref, claimId, outcome: 'resist' });
    return { kind: 'present', ok: true, cost, outcome: 'resist', claimId, patience: iv.patience, line: spoken(ctx, suspect, resistText(ctx.def, suspect, ref, ctx.locale), topic.tiers[tier].emotion) };
  }
  iv.patience -= 1;
  ss.trust = clamp(ss.trust - 3);
  // dismissals rotate in order per suspect, so the same line never comes twice in a row
  const n = s.log.filter((e) => e.suspectId === suspectId && e.ref.k === 'dismiss').length;
  log(s, { suspectId, from: 'suspect', ref: { k: 'dismiss', n }, claimId, outcome: 'wrong' });
  const text = suspect.dismissals.length ? tx(suspect.dismissals[n % suspect.dismissals.length], ctx.locale) : sys('wrong_present', ctx.locale);
  if (iv.patience <= 0) {
    iv.patience = 0;
    iv.open = false;
    delete iv.by;
    iv.refusedDay = s.day;
    log(s, { suspectId, from: 'system', ref: { k: 'sys', key: 'patience_out' }, outcome: 'ended' });
    return { kind: 'present', ok: true, cost, outcome: 'ended', claimId, patience: 0, line: spoken(ctx, suspect, text, 'hostile'), message: sys('patience_out', ctx.locale) };
  }
  return { kind: 'present', ok: true, cost, outcome: 'wrong', claimId, patience: iv.patience, line: spoken(ctx, suspect, text, 'irritated') };
}

/** The words of a resist: the break's own line, or (b < 0) the suspect's rotating resist lines. */
export function resistText(def: CaseDefinition, suspect: SuspectDef, ref: { claim: string; b: number }, locale: Locale): string {
  if (ref.b >= 0) {
    const b = indexOf(def).claims.get(ref.claim)?.claim.breaks?.[ref.b];
    if (b?.resist) return tx(b.resist, locale);
  }
  const pool = suspect.resists?.length
    ? suspect.resists.map((t) => tx(t, locale))
    : [sys('resist_default', locale), sys('resist_2', locale), sys('resist_3', locale)];
  return pool[(ref.b >= 0 ? 0 : -1 - ref.b) % pool.length];
}

/** A free-text question, already classified (keywords or AI) into topic ids by the caller. */
export function ask(ctx: Ctx, suspectId: string, text: string, cls: Classification): V2Event {
  const { v2, s } = need(ctx);
  assertInvestigating(ctx, s);
  const suspect = suspectOf(ctx, suspectId);
  interviewOpen(ctx, suspectId);
  const cost = spend(ctx, v2, s, costsOf(v2).freeQuestion);
  log(s, { suspectId, from: 'player', ref: { k: 'player' }, action: 'ask', text, actorId: ctx.actorId });
  const ss = ctx.st.suspects[suspectId];
  for (const id of cls.topicIds) {
    const topic = suspect.topics.find((t) => t.id === id);
    if (!topic) continue;
    const tier = ss.tiers[topic.id] ?? -1;
    if (tier >= 0) {
      const n = s.log.length;
      const t = topic.tiers[tier];
      log(s, { suspectId, from: 'suspect', ref: { k: 'repeat', topic: topic.id, tier, n }, topicId: topic.id, outcome: 'repeat' });
      const line = t.variants?.length ? tx(t.variants[n % t.variants.length], ctx.locale) : tx(t.line, ctx.locale);
      return { kind: 'ask', ok: true, cost, outcome: 'repeat', line: spoken(ctx, suspect, line, t.emotion) };
    }
    if (topicAvailable(ctx, suspect, topic)) {
      const r = reachTier(ctx, suspect, topic, 0);
      return { kind: 'ask', ok: true, cost, outcome: 'opened', ...r };
    }
  }
  const n = s.log.length;
  log(s, { suspectId, from: 'suspect', ref: { k: 'deflect', n }, outcome: 'deflect' });
  return { kind: 'ask', ok: true, cost, outcome: 'deflect', line: spoken(ctx, suspect, tx(suspect.deflections[n % suspect.deflections.length], ctx.locale), 'guarded') };
}

// ───────────────────────────────────────────── deductions

export interface DeductionFiling {
  fills?: Record<string, string>;
  order?: string[];
  outlier?: string;
}

export function ownsChip(ctx: Ctx, type: string, value: string, d: DeductionDef, blankId: string): boolean {
  const s = ctx.st.v2!;
  switch (type) {
    case 'fact': return value in s.facts;
    case 'evidence': return value in ctx.st.evidence;
    case 'person': return ctx.def.suspects.some((x) => x.id === value) || ctx.def.people.some((p) => p.id === value);
    case 'time': return knownTimes(ctx.def, s).includes(value);
    case 'place': return locationOpen(ctx.def, s, req(ctx), value);
    case 'choice': return !!d.blanks?.find((b) => b.id === blankId)?.options?.some((o) => o.id === value);
    default: return false;
  }
}

export function solved(d: DeductionDef, f: DeductionFiling): boolean {
  if (d.kind === 'timeline') {
    return JSON.stringify(f.order ?? []) === JSON.stringify(d.order ?? []) && (d.outlier === undefined || f.outlier === d.outlier);
  }
  return (d.blanks ?? []).every((b) => b.accept.includes(f.fills?.[b.id] ?? '\u0000'));
}

export function applyEffects(ctx: Ctx, effects: { type: string; target?: string; facts?: string[]; evidence?: string[] }[] | undefined, src: FactSource) {
  const s = ctx.st.v2!;
  const unlocked: string[] = [];
  const newFacts: string[] = [];
  const newEvidence: string[] = [];
  for (const e of effects ?? []) {
    if (e.type === 'unlock' && e.target && !s.unlocked.includes(e.target)) {
      s.unlocked.push(e.target);
      unlocked.push(e.target);
    }
    if (e.type === 'grant') {
      newFacts.push(...addFacts(ctx, s, e.facts, src));
      newEvidence.push(...addEvidence(ctx, s, e.evidence));
    }
  }
  return { unlocked, newFacts, newEvidence };
}

/** How many wrong filings per question are allowed after the last day ended (no time is left to charge them). */
export const LATE_WRONG_LIMIT = 2;

/** Which part of a wrong filing to look at again — a direction, never the answer. */
function nudgeOf(d: DeductionDef, f: DeductionFiling): NonNullable<V2State['deductions'][string]['nudge']> | undefined {
  if (d.kind === 'timeline') {
    if (d.outlier !== undefined && f.outlier !== d.outlier) return { kind: 'outlier' };
    return { kind: 'order' };
  }
  const wrong = (d.blanks ?? []).filter((b) => !b.accept.includes(f.fills?.[b.id] ?? '\u0000'));
  if (!wrong.length) return undefined;
  return { kind: 'blank', blank: wrong[0].id, single: wrong.length === 1 };
}

export function nudgeText(d: DeductionDef, n: NonNullable<V2State['deductions'][string]['nudge']>, locale: Locale): string {
  if (n.kind === 'outlier') return sys('nudge_outlier', locale);
  if (n.kind === 'order') return sys('nudge_order', locale);
  const b = d.blanks?.find((x) => x.id === n.blank);
  const label = b?.label !== undefined ? tx(b.label, locale) : sys('blank_generic', locale);
  return sys(n.single ? 'nudge_one' : 'nudge_many', locale, label);
}

export function deduce(ctx: Ctx, deductionId: string, filing: DeductionFiling): V2Event {
  const { v2, s } = need(ctx);
  // deductions can be filed right up to the prosecutor: also after the last day has ended
  assertInvestigating(ctx, s, true);
  const d = indexOf(ctx.def).deductions.get(deductionId);
  if (!d || !deductionVisible(s, req(ctx), d)) fail(ctx, 'locked', 'locked', 'locked');
  const rec = (s.deductions[d.id] ??= { confirmed: false, attempts: 0 });
  if (rec.confirmed) fail(ctx, 'already', 'conflict', 'already');
  const late = s.phase === 'awaiting_finale';
  if (late && (rec.late ?? 0) >= LATE_WRONG_LIMIT) fail(ctx, 'late_limit', 'conflict', 'late_limit');
  // wave 6: with less time left today than a wrong filing costs, a question takes only LATE_WRONG_LIMIT cheap misses
  // (refused before the filing is judged, so the refusal says nothing about the answer)
  const short = !late && !s.sim && remainingToday(v2, s) < costsOf(v2).wrongDeduction;
  if (short && (rec.short ?? 0) >= LATE_WRONG_LIMIT) fail(ctx, 'no_time', 'conflict', 'no_time');
  if (d.kind === 'timeline') {
    const ids = new Set((d.cards ?? []).map((c) => c.id));
    const order = filing.order ?? [];
    const expected = ids.size - (d.outlier !== undefined ? 1 : 0);
    const used = new Set([...order, ...(filing.outlier ? [filing.outlier] : [])]);
    if (order.length !== expected || used.size !== ids.size || [...used].some((x) => !ids.has(x))) fail(ctx, 'bad_fill', 'bad_request', 'bad_fill');
  } else {
    for (const b of d.blanks ?? []) {
      const v = filing.fills?.[b.id];
      if (!v) fail(ctx, 'bad_fill', 'bad_request', 'bad_fill');
      assertShared(ctx, v);
      if (!ownsChip(ctx, b.type, v, d, b.id)) fail(ctx, 'not_owned', 'bad_request', 'not_owned');
    }
  }
  rec.attempts += 1;
  if (!solved(d, filing)) {
    const c = costsOf(v2).wrongDeduction;
    const cost = late ? 0 : spend(ctx, v2, s, s.sim ? c : Math.min(c, remainingToday(v2, s)));
    if (late) rec.late = (rec.late ?? 0) + 1;
    else if (short) rec.short = (rec.short ?? 0) + 1;
    rec.wrong = (rec.wrong ?? 0) + 1;
    // from the second wrong filing of the same question: a free nudge (which blank, never the answer)
    if (rec.wrong >= 2) rec.nudge = nudgeOf(d, filing);
    const nudge = rec.nudge ? ` ${nudgeText(d, rec.nudge, ctx.locale)}` : '';
    return { kind: 'deduce', ok: true, cost, outcome: 'wrong', message: `${sys('deduction_wrong', ctx.locale)}${nudge}` };
  }
  rec.confirmed = true;
  delete rec.nudge;
  if (s.team) delete s.team.drafts[d.id];
  rec.day = s.day;
  rec.fills = filing.fills;
  rec.order = filing.order;
  s.seq += 1;
  const fx = applyEffects(ctx, d.effects, { type: 'deduction', ref: d.id });
  return {
    kind: 'deduce', ok: true, cost: 0, outcome: 'confirmed', message: tx(d.confirmText, ctx.locale),
    newFacts: fx.newFacts, newEvidence: fx.newEvidence, unlocked: fx.unlocked.map((k) => unlockView(ctx, k)),
  };
}

export function unlockView(ctx: Ctx, key: string): NonNullable<V2Event['unlocked']>[number] {
  const [kind, a, b] = key.split(':') as ['analysis' | 'topic' | 'location' | 'zone' | 'deduction', string, string?];
  const L = (t: Parameters<typeof tx>[0]) => tx(t, ctx.locale);
  let label = a;
  if (kind === 'analysis') label = L(ctx.def.analyses.find((x) => x.id === a)?.name);
  if (kind === 'topic') {
    const sus = ctx.def.suspects.find((x) => x.id === a);
    label = `${sus?.name ?? a}: ${L(sus?.topics.find((t) => t.id === b)?.label)}`;
  }
  if (kind === 'location') label = L(ctx.def.locations.find((x) => x.id === a)?.name);
  if (kind === 'zone') label = L(indexOf(ctx.def).zones.get(a)?.zone.label);
  if (kind === 'deduction') label = L(indexOf(ctx.def).deductions.get(a)?.title);
  return { kind, id: kind === 'topic' ? `${a}:${b}` : a, label };
}

// ───────────────────────────────────────────── hint, day end

export function hint(ctx: Ctx): V2Event {
  const { v2, s } = need(ctx);
  assertInvestigating(ctx, s);
  const h = hintAvailable(ctx.def, ctx.st);
  if (!h) return { kind: 'hint', ok: false, cost: 0, message: sys('hint_none', ctx.locale) };
  const cost = spend(ctx, v2, s, costsOf(v2).hint);
  ctx.st.hintsUsed.push(h.id);
  return { kind: 'hint', ok: true, cost, message: tx(h.text, ctx.locale) };
}

/** The shortest and longest deliberate wait (minutes). */
export const WAIT_MIN = 15;
export const WAIT_MAX = 240;

/**
 * How long "wait until …" would take now: the next lab result, or the next window of a suspect today.
 * undefined = nothing to wait for (or it would not happen today).
 */
export function waitMinutes(ctx: Ctx, until: string): number | undefined {
  const { v2, s } = need(ctx);
  const left = Math.max(0, v2.clock.minutesPerDay - s.minute);
  if (until === 'lab') {
    const now = absNow(v2, s);
    const next = s.lab.filter((j) => j.readyAt > now).sort((a, b) => a.readyAt - b.readyAt)[0];
    if (!next) return undefined;
    const m = next.readyAt - now;
    return m <= left ? m : undefined;
  }
  const windows = v2.clock.availability?.[until];
  if (!windows || suspectAvailableNow(v2, s, until)) return undefined;
  const w = windows.filter((x) => x.day === s.day && (x.from ?? 0) > s.minute).sort((a, b) => (a.from ?? 0) - (b.from ?? 0))[0];
  if (!w) return undefined;
  const m = (w.from ?? 0) - s.minute;
  return m <= left ? m : undefined;
}

/** Let time pass on purpose: the lab keeps working, a suspect's hours come round. Costs exactly the minutes waited. */
export function wait(ctx: Ctx, opts: { minutes?: number; until?: string }): V2Event {
  const { v2, s } = need(ctx);
  assertInvestigating(ctx, s);
  // co-op (wave 5): waiting moves only your own clock, so anyone may wait, and it costs no budget
  if (s.budget === undefined) assertHost(ctx);
  let m: number;
  if (opts.until) {
    if (opts.until !== 'lab' && !ctx.def.suspects.some((x) => x.id === opts.until)) fail(ctx, 'unknown', 'not_found', 'locked');
    const w = waitMinutes(ctx, opts.until);
    if (w === undefined) fail(ctx, 'wait_nothing', 'conflict', 'wait_nothing');
    m = w;
  } else {
    m = Math.round(opts.minutes ?? 0);
    if (!(m >= WAIT_MIN && m <= WAIT_MAX)) fail(ctx, 'wait_bad', 'bad_request', 'bad_fill');
  }
  if (m <= 0) fail(ctx, 'wait_nothing', 'conflict', 'wait_nothing');
  if (s.budget !== undefined) {
    // co-op: standing by is free of budget; only your calendar moves
    if (!s.sim && s.minute + m > v2.clock.minutesPerDay) fail(ctx, 'no_time', 'conflict', 'no_time');
    s.minute += m;
    return { kind: 'wait', ok: true, cost: 0, outcome: opts.until ?? 'minutes' };
  }
  const cost = spend(ctx, v2, s, m);
  return { kind: 'wait', ok: true, cost, outcome: opts.until ?? 'minutes' };
}

// ───────────────────────────────────────────── night forks (wave 4)

/**
 * Apply one option of a night fork: its morning minutes (counted as spent), grants, unlocks, and a lab job started now
 * (it takes a slot until ready). Shared by the player's choice, the default settlement and the validator.
 */
export function applyForkOption(ctx: Ctx, ev: NightEventDef, opt: NightOptionDef) {
  const { v2, s } = need(ctx);
  const minutes = Math.max(0, opt.minutes ?? 0);
  // the morning is spent before anything else: it always fits (the fork is answered at the start of the day)
  const cost = Math.min(minutes, s.sim ? minutes : remainingToday(v2, s));
  charge(s, cost);
  const fx = applyEffects(ctx, [{ type: 'grant', ...opt.grants }, ...(opt.unlock ?? []).map((target) => ({ type: 'unlock', target }))], { type: 'night', ref: ev.id });
  const newFacts = [...fx.newFacts];
  const newEvidence = [...fx.newEvidence];
  if (opt.lab) {
    const a = ctx.def.analyses.find((x) => x.id === opt.lab);
    if (a && !(a.id in ctx.st.analyses) && !s.lab.some((j) => j.analysisId === a.id)) {
      const now = absNow(v2, s);
      s.lab.push({ analysisId: a.id, submittedAt: now, readyAt: s.sim ? now : now + labMinutes(a), collected: false });
      if (s.sim) {
        const r = labCollect(ctx, a.id);
        newFacts.push(...(r.newFacts ?? []));
        newEvidence.push(...(r.newEvidence ?? []));
      }
    }
  }
  return { cost, newFacts, newEvidence, unlocked: fx.unlocked };
}

/** The fork waiting for an answer (definition + report record), if any. */
export function pendingForkOf(ctx: Ctx): { ev: NightEventDef; rec: NonNullable<V2State['reports'][number]['fork']> } | undefined {
  const s = ctx.st.v2!;
  if (s.pendingFork === undefined) return undefined;
  const rec = s.reports[s.pendingFork]?.fork;
  const ev = rec && ctx.def.v2?.nightEvents?.find((e) => e.id === rec.id);
  if (!rec || !ev?.choice || rec.chosen) {
    delete s.pendingFork;
    return undefined;
  }
  return { ev, rec };
}

function settleFork(ctx: Ctx, s: V2State, optionId?: string) {
  const p = pendingForkOf(ctx);
  if (!p) return undefined;
  const opt = p.ev.choice!.options.find((o) => o.id === (optionId ?? p.ev.choice!.options[0].id));
  if (!opt) fail(ctx, 'unknown', 'not_found', 'locked');
  delete s.pendingFork;
  const r = applyForkOption(ctx, p.ev, opt);
  p.rec.chosen = opt.id;
  p.rec.facts = r.newFacts;
  p.rec.evidence = r.newEvidence;
  s.seq += 1;
  return { opt, ...r };
}

/** Answer the night fork offered after the previous day. */
export function nightChoice(ctx: Ctx, optionId: string): V2Event {
  const { s } = need(ctx);
  if (s.phase !== 'investigating') assertInvestigating(ctx, s);
  assertHost(ctx);
  const p = pendingForkOf(ctx);
  if (!p) fail(ctx, 'no_fork', 'conflict', 'no_fork');
  if (!p.ev.choice!.options.some((o) => o.id === optionId)) fail(ctx, 'unknown', 'not_found', 'locked');
  const r = settleFork(ctx, s, optionId)!;
  return {
    kind: 'night_choice', ok: true, cost: r.cost, outcome: r.opt.id, message: tx(r.opt.text, ctx.locale),
    newFacts: r.newFacts, newEvidence: r.newEvidence, unlocked: r.unlocked.map((k) => unlockView(ctx, k)),
  };
}

export function visibleDeductionIds(ctx: Ctx): string[] {
  const s = ctx.st.v2!;
  return ctx.def.v2!.deductions.filter((d) => deductionVisible(s, req(ctx), d)).map((d) => d.id);
}

export function endDay(ctx: Ctx): V2Event {
  const { v2, s } = need(ctx);
  assertInvestigating(ctx, s);
  assertHost(ctx);
  const day = s.day;
  const visible = visibleDeductionIds(ctx);
  const report: V2State['reports'][number] = {
    day,
    facts: Object.entries(s.facts).filter(([, f]) => f.day === day && f.src.type !== 'start').map(([id]) => id),
    evidence: Object.entries(s.evidenceFound).filter(([, f]) => f.day === day && f.seq > 0).map(([id]) => id),
    deductionsConfirmed: Object.entries(s.deductions).filter(([, d]) => d.confirmed && d.day === day).map(([id]) => id),
    deductionsOpened: visible.filter((d) => !s.dayStart.visibleDeductions.includes(d)),
    labsReady: [],
    labsRunning: [],
    unusedMinutes: Math.max(0, v2.clock.minutesPerDay - s.minute),
  };
  const team = s.team;
  if (team) {
    // co-op: what every member left unused today
    syncActive(ctx.st);
    report.unusedMinutes = membersOf(ctx.st).reduce((n, id) => {
      const c = team.clocks[id];
      return n + (c ? Math.max(0, Math.min(budgetOf(team, c) - c.used, v2.clock.minutesPerDay - c.minute)) : team.budget);
    }, 0);
  }
  for (const iv of Object.values(s.interviews)) { iv.open = false; delete iv.by; }
  if (day >= v2.clock.days) {
    // the last day is spent in full (as every ended day is), and the lab finishes overnight: the meeting is next morning.
    // The player can still collect results and file deductions before choosing whom to accuse.
    s.phase = 'awaiting_finale';
    s.minute = v2.clock.minutesPerDay;
    if (team) {
      for (const c of Object.values(team.clocks)) { c.minute = v2.clock.minutesPerDay; c.used = budgetOf(team, c); }
      if (s.budget !== undefined) s.used = s.budget;
      team.intents = {};
    }
    const now = absNow(v2, s);
    for (const j of s.lab) if (j.readyAt > now) j.readyAt = now;
  } else {
    // story events: the first match fires
    for (const ev of v2.nightEvents ?? []) {
      if (ev.choice || ev.afterDay !== day || !meets(ev.requires, ctx.st)) continue;
      const fx = applyEffects(ctx, [{ type: 'grant', ...ev.grants }, ...(ev.unlock ?? []).map((target) => ({ type: 'unlock', target }))], { type: 'night', ref: ev.id });
      report.night = { id: ev.id, facts: fx.newFacts, evidence: fx.newEvidence };
      break;
    }
    // forks (wave 4): the first match is offered, answered next morning
    const fork = (v2.nightEvents ?? []).find((ev) => ev.choice && ev.afterDay === day && meets(ev.requires, ctx.st));
    if (fork) report.fork = { id: fork.id, facts: [], evidence: [] };
    s.day += 1;
    s.minute = 0;
    for (const r of Object.values(s.deductions)) delete r.short;
    if (team) {
      // every investigator starts the morning fresh, where they stood; the budget follows today's team size
      for (const c of Object.values(team.clocks)) { c.minute = 0; c.used = 0; delete c.doneDay; delete c.budget; }
      if (s.budget !== undefined) s.used = 0;
      team.intents = {};
      refreshBudget(ctx.def, ctx.st);
    }
    s.dayStart = { visibleDeductions: visibleDeductionIds(ctx) };
  }
  const now = absNow(v2, s);
  report.labsReady = s.lab.filter((j) => !j.collected && j.readyAt <= now).map((j) => j.analysisId);
  report.labsRunning = s.lab.filter((j) => j.readyAt > now).map((j) => j.analysisId);
  s.reports.push(report);
  if (report.fork) s.pendingFork = s.reports.length - 1;
  s.seq += 1;
  return { kind: 'end_day', ok: true, cost: 0, outcome: s.phase === 'awaiting_finale' ? 'last_day' : 'next_day' };
}

// ───────────────────────────────────────────── finale

export function finaleStart(ctx: Ctx, accusedId: string): V2Event {
  const { v2, s } = need(ctx);
  assertInvestigating(ctx, s, true);
  assertHost(ctx);
  const accused = suspectOf(ctx, accusedId);
  for (const iv of Object.values(s.interviews)) iv.open = false;
  const culprit = accused.id === ctx.def.truth.killerId;
  s.phase = 'finale';
  if (s.team) s.team.finale = [];
  s.finale = {
    accusedId, culprit, index: 0, tries: 2, status: 'running',
    rounds: culprit ? v2.finale.rounds.map((r) => ({ id: r.id, result: null, attempts: 0, firstTry: false })) : [],
  };
  s.seq += 1;
  if (!culprit) {
    const r = finish(ctx);
    const inn = v2.finale.innocents[accusedId];
    return {
      kind: 'finale_start', ok: true, cost: 0, outcome: 'wrongful', result: r,
      line: spoken(ctx, accused, inn ? tx(inn.defence, ctx.locale) : '', 'hostile'),
      message: inn ? tx(inn.collapse, ctx.locale) : undefined,
    };
  }
  const first = v2.finale.rounds[0];
  return { kind: 'finale_start', ok: true, cost: 0, message: tx(v2.finale.intro, ctx.locale), line: spoken(ctx, accused, tx(first.defence, ctx.locale), 'guarded') };
}

export function finaleAnswer(ctx: Ctx, itemId: string): V2Event {
  const { v2, s } = need(ctx);
  if (s.phase !== 'finale' || !s.finale || s.finale.status !== 'running') fail(ctx, 'phase_closed', 'conflict', 'phase');
  assertHost(ctx);
  assertShared(ctx, itemId);
  if (!owns(ctx, itemId, true)) fail(ctx, 'not_owned', 'bad_request', 'not_owned');
  const f = s.finale;
  const accused = suspectOf(ctx, f.accusedId);
  const def = v2.finale.rounds[f.index];
  const rs = f.rounds[f.index];
  rs.attempts += 1;
  s.seq += 1;
  let outcome: string;
  let text: string;
  if (def.accept.includes(itemId)) {
    rs.result = 'won';
    rs.firstTry = rs.attempts === 1;
    outcome = 'won';
    text = tx(def.win, ctx.locale);
  } else if (f.tries > 1) {
    f.tries -= 1;
    return { kind: 'finale_answer', ok: true, cost: 0, outcome: 'retry', message: sys('finale_wrong', ctx.locale), line: spoken(ctx, accused, tx(def.defence, ctx.locale), 'guarded') };
  } else {
    rs.result = 'lost';
    outcome = 'lost';
    text = tx(def.lose, ctx.locale);
  }
  f.index += 1;
  f.tries = 2;
  const next = v2.finale.rounds[f.index];
  if (!next) {
    const r = finish(ctx);
    const conf = r.outcome === 'confession' ? ` ${tx(v2.finale.confession.line, ctx.locale)}` : '';
    return { kind: 'finale_answer', ok: true, cost: 0, outcome, result: r, line: spoken(ctx, accused, `${text}${conf}`.trim(), r.outcome === 'confession' ? 'resigned' : 'hostile') };
  }
  return { kind: 'finale_answer', ok: true, cost: 0, outcome, line: spoken(ctx, accused, `${text} ${tx(next.defence, ctx.locale)}`.trim(), 'anxious'), message: tx(next.prompt, ctx.locale) };
}

/** Close the case: outcome, stars, and a v1-compatible CaseResult for profiles and history. */
function finish(ctx: Ctx): NonNullable<V2Event['result']> {
  const { v2, s } = need(ctx);
  const f = s.finale!;
  const n = v2.finale.rounds.length;
  const won = f.rounds.filter((r) => r.result === 'won').length;
  const first = f.rounds.filter((r) => r.firstTry).length;
  const confirmed = Object.values(s.deductions).filter((d) => d.confirmed).length;
  const left = totalBudget(v2, s) - elapsedOf(v2, s);
  const cfg = v2.finale.stars ?? {};
  const needs = proofNeeds(v2);
  const wonKind = (k: string) => v2.finale.rounds.every((r, i) => r.kind !== k || f.rounds[i].result === 'won');
  f.outcome = !f.culprit ? 'wrongful' : won === n ? 'confession' : won >= Math.ceil(n * 0.6) ? 'charged' : 'weak';
  f.stars = {
    truth: f.culprit && wonKind('motive') && wonKind('means'),
    proof: f.culprit && first >= needs.firstTry && confirmed >= needs.deductions,
    clock: f.culprit && left >= totalBudget(v2, s) * (cfg.clockRemaining ?? 0.25),
  };
  if (f.outcome === 'confession' && v2.finale.confession.statementId) hear(ctx.st, [v2.finale.confession.statementId], ctx.now);
  f.status = 'done';
  f.closedAt = ctx.now;
  s.phase = 'closed';
  ctx.st.status = 'closed';
  ctx.st.closedAt = ctx.now;
  ctx.st.accusedBy = ctx.actorId;
  ctx.st.result = legacyResult(ctx);
  return resultView(ctx, ctx.locale);
}

/** The kind of crime a case is about (verdict wording). */
export const crimeOf = (def: CaseDefinition): 'murder' | 'theft' => def.meta.crime ?? 'murder';

/** The verdict's one-line explanation, worded for the crime (a thief is not a killer). */
export function verdictDetail(def: CaseDefinition, outcome: 'confession' | 'charged' | 'weak' | 'wrongful', locale: Locale): string {
  const crime = crimeOf(def);
  const key = `verdict_detail_${outcome}_${crime}` as SysKey;
  return sys(key in SYS_KEYS ? key : (`verdict_detail_${outcome}` as SysKey), locale);
}

export function resultView(ctx: Ctx, locale: Locale): NonNullable<V2Event['result']> {
  const { v2, s } = need(ctx);
  const f = s.finale!;
  const n = v2.finale.rounds.length;
  const o = f.outcome!;
  const stars = f.stars!;
  const crime = crimeOf(ctx.def);
  return {
    outcome: o,
    title: sys(`verdict_${o}` as SysKey, locale),
    detail: verdictDetail(ctx.def, o, locale),
    crime,
    proofNeeds: proofNeeds(v2),
    accusedId: f.accusedId,
    culpritCorrect: f.culprit,
    stars,
    starCount: Number(stars.truth) + Number(stars.proof) + Number(stars.clock),
    roundsWon: f.rounds.filter((r) => r.result === 'won').length,
    roundsTotal: n,
    firstTry: f.rounds.filter((r) => r.firstTry).length,
    deductionsConfirmed: Object.values(s.deductions).filter((d) => d.confirmed).length,
    deductionsTotal: v2.deductions.length,
    minutesLeft: totalBudget(v2, s) - elapsedOf(v2, s),
    debrief: buildDebrief(ctx.def, ctx.st, f.closedAt ?? ctx.now, locale),
  };
}

function legacyResult(ctx: Ctx): CaseResult {
  const { v2, s } = need(ctx);
  const f = s.finale!;
  const n = v2.finale.rounds.length;
  const won = f.rounds.filter((r) => r.result === 'won').length;
  const confirmed = Object.values(s.deductions).filter((d) => d.confirmed).length;
  const total = Math.max(1, v2.deductions.length);
  const score = f.culprit ? Math.round(40 + (40 * won) / Math.max(1, n) + (20 * confirmed) / total) : 0;
  return {
    score,
    rating: sys(`verdict_${f.outcome!}` as SysKey, 'en'),
    ratingDetail: verdictDetail(ctx.def, f.outcome!, 'en'),
    culpritCorrect: f.culprit,
    lines: v2.finale.rounds.map((r, i) => ({
      key: r.id, label: r.kind, max: Math.round(40 / Math.max(1, n)),
      points: f.rounds[i]?.result === 'won' ? Math.round(40 / Math.max(1, n)) : 0,
      verdict: f.rounds[i]?.result === 'won' ? 'correct' : 'wrong',
      feedback: tx(f.rounds[i]?.result === 'won' ? r.win : r.lose, 'en'),
    })),
    penalties: ctx.st.hintsUsed.length ? [{ label: `Hints used (${ctx.st.hintsUsed.length})`, points: 0 }] : [],
    debrief: buildDebrief(ctx.def, ctx.st, ctx.now, 'en'),
  };
}

export { nameOf };

/** Co-op: drop the actor's intent once it is done (arrived, questioning, result collected). */
function clearIntent(ctx: Ctx, kind: 'go' | 'interview' | 'lab', target: string) {
  const t = ctx.st.v2?.team;
  if (!t || !ctx.actorId) return;
  const it = t.intents[ctx.actorId];
  if (it && it.kind === kind && it.target === target) delete t.intents[ctx.actorId];
}
