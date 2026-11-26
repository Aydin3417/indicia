// SERVER-ONLY. Co-op team actions (wave 5): intents, "done for today", reading private notes out, deduction drafts and
// suggestions, finale suggestions, hand-over and a member leaving. Every one is free (no game minutes).
import type { V2Event } from '../../../shared/api.ts';
import { ActionError, type ActionErrorCode } from '../actions.ts';
import { sys, type SysKey } from '../i18n.ts';
import type { Ctx } from './actions.ts';
import { assertHost, assertShared, labStatus, owns, ownsChip } from './actions.ts';
import { asPlayer, clockOf, dropFromNotes, notesOf, teamOf } from './coop.ts';
import { deductionVisible, indexOf, locationOpen, type IntentKind, type TeamState } from './state.ts';
import { meets, type SessionState } from '../state.ts';
import type { CaseDefinition } from '../types.ts';

function fail(ctx: Ctx, key: SysKey, code: ActionErrorCode, reason: string): never {
  throw new ActionError(sys(key, ctx.locale), code, reason);
}

function team(ctx: Ctx): TeamState {
  const t = teamOf(ctx.def, ctx.st);
  if (!t || !ctx.actorId) throw new ActionError(sys('not_member', ctx.locale), 'conflict', 'solo');
  return t;
}

const investigating = (ctx: Ctx) => {
  const p = ctx.st.v2!.phase;
  if (p !== 'investigating') fail(ctx, p === 'closed' ? 'phase_closed' : p === 'finale' ? 'phase_finale' : 'phase_awaiting', 'conflict', 'phase');
};

const req = (ctx: Ctx) => (r: Parameters<typeof meets>[0]) => meets(r, ctx.st);

// ───────────────────────────────────────────── intents

/** "I'm going to X / questioning Y / waiting for lab Z" — or `kind: null` to clear it. */
export function intent(ctx: Ctx, kind: IntentKind | null, target?: string): V2Event {
  const t = team(ctx);
  investigating(ctx);
  const s = ctx.st.v2!;
  if (!kind) {
    delete t.intents[ctx.actorId!];
    return { kind: 'intent', ok: true, cost: 0, outcome: 'cleared' };
  }
  const ok = !!target && (
    kind === 'go' ? locationOpen(ctx.def, s, req(ctx), target)
      : kind === 'interview' ? ctx.def.suspects.some((x) => x.id === target)
        : ctx.def.analyses.some((a) => a.id === target) && labStatus(ctx, target) !== 'locked');
  if (!ok) fail(ctx, 'locked', 'locked', 'locked');
  s.seq += 1;
  t.intents[ctx.actorId!] = { kind, target: target!, day: s.day, seq: s.seq };
  return { kind: 'intent', ok: true, cost: 0, outcome: kind };
}

/** "Done for today": the day ends by itself once every playing member is done or out of time. */
export function done(ctx: Ctx, isDone: boolean): V2Event {
  team(ctx);
  investigating(ctx);
  const s = ctx.st.v2!;
  const c = clockOf(ctx.def, ctx.st, ctx.actorId!);
  if (isDone) c.doneDay = s.day;
  else delete c.doneDay;
  return { kind: 'done', ok: true, cost: 0, outcome: isDone ? 'done' : 'resumed' };
}

// ───────────────────────────────────────────── private notes

/**
 * Read your private notes out to the team: one item, or all of them. A document comes with the phrases you
 * collected from it. Free, and allowed until the case is closed (also during the finale).
 */
export function share(ctx: Ctx, itemId?: string): V2Event {
  team(ctx);
  const s = ctx.st.v2!;
  if (s.phase === 'closed') fail(ctx, 'phase_closed', 'conflict', 'phase');
  const n = notesOf(ctx.st, ctx.actorId);
  if (!n || (itemId && !(itemId in n.facts) && !(itemId in n.evidence))) fail(ctx, 'not_private', 'bad_request', 'not_owned');
  const evidence = itemId ? (itemId in n.evidence ? [itemId] : []) : Object.keys(n.evidence);
  const facts = itemId
    ? [...(itemId in n.facts ? [itemId] : []), ...Object.entries(n.facts).filter(([, f]) => f.src.type === 'document' && f.src.ref === itemId).map(([id]) => id)]
    : Object.keys(n.facts);
  const newEvidence: string[] = [];
  const newFacts: string[] = [];
  for (const id of evidence.sort((a, b) => n.evidence[a].seq - n.evidence[b].seq)) {
    const f = n.evidence[id];
    s.seq += 1;
    ctx.st.evidence[id] = ctx.now + s.seq;
    s.evidenceFound[id] = { day: f.day, minute: f.minute, seq: s.seq };
    dropFromNotes(ctx.st, id);
    newEvidence.push(id);
  }
  for (const id of facts.filter((x) => x in n.facts).sort((a, b) => n.facts[a].seq - n.facts[b].seq)) {
    const f = n.facts[id];
    s.seq += 1;
    s.facts[id] = { ...f, seq: s.seq };
    dropFromNotes(ctx.st, id);
    newFacts.push(id);
  }
  return { kind: 'share', ok: true, cost: 0, outcome: String(newFacts.length + newEvidence.length), newFacts, newEvidence };
}

// ───────────────────────────────────────────── deduction drafts

export interface DraftInput {
  fills?: Record<string, string>;
  order?: string[];
  outlier?: string;
}

function openDeduction(ctx: Ctx, deductionId: string) {
  const s = ctx.st.v2!;
  if (s.phase !== 'investigating' && s.phase !== 'awaiting_finale') fail(ctx, 'phase_finale', 'conflict', 'phase');
  const d = indexOf(ctx.def).deductions.get(deductionId);
  if (!d || !deductionVisible(s, req(ctx), d)) fail(ctx, 'locked', 'locked', 'locked');
  if (s.deductions[d.id]?.confirmed) fail(ctx, 'already', 'conflict', 'already');
  return d;
}

function checkValue(ctx: Ctx, d: ReturnType<typeof openDeduction>, blank: string, value: string) {
  if (d.kind === 'timeline') {
    if (blank !== 'outlier' || !(d.cards ?? []).some((c) => c.id === value)) fail(ctx, 'bad_fill', 'bad_request', 'bad_fill');
    return;
  }
  const b = d.blanks?.find((x) => x.id === blank);
  if (!b) fail(ctx, 'bad_fill', 'bad_request', 'bad_fill');
  assertShared(ctx, value);
  if (!ownsChip(ctx, b.type, value, d, b.id)) fail(ctx, 'not_owned', 'bad_request', 'not_owned');
}

/**
 * Pencil in a deduction without filing it. Fills merge into the team's draft (an empty value clears that blank);
 * a timeline draft carries an order and the card set aside. Filing stays `POST deduce`.
 */
export function draft(ctx: Ctx, deductionId: string, input: DraftInput): V2Event {
  const t = team(ctx);
  const s = ctx.st.v2!;
  const d = openDeduction(ctx, deductionId);
  const cur = t.drafts[d.id] ?? { fills: {}, by: ctx.actorId!, seq: 0, suggestions: [] };
  const fills = { ...cur.fills };
  for (const [blank, value] of Object.entries(input.fills ?? {})) {
    if (!value) { delete fills[blank]; continue; }
    checkValue(ctx, d, blank, value);
    fills[blank] = value;
  }
  let order = cur.order;
  let outlier = cur.outlier;
  if (d.kind === 'timeline') {
    const ids = new Set((d.cards ?? []).map((c) => c.id));
    if (input.order) {
      if (input.order.some((x) => !ids.has(x)) || new Set(input.order).size !== input.order.length) fail(ctx, 'bad_fill', 'bad_request', 'bad_fill');
      order = input.order;
    }
    if (input.outlier !== undefined) {
      if (input.outlier && !ids.has(input.outlier)) fail(ctx, 'bad_fill', 'bad_request', 'bad_fill');
      outlier = input.outlier || undefined;
    }
  }
  s.seq += 1;
  // a suggestion the draft now follows has done its job
  const suggestions = cur.suggestions.filter((x) => (x.blank === 'outlier' ? outlier !== x.value : fills[x.blank] !== x.value));
  t.drafts[d.id] = { fills, order, outlier, by: ctx.actorId!, seq: s.seq, suggestions };
  return { kind: 'draft', ok: true, cost: 0, outcome: 'saved' };
}

/** Suggest a chip for one blank of a teammate's draft (or the card to set aside, `blank: 'outlier'`). */
export function suggest(ctx: Ctx, deductionId: string, blank: string, value: string): V2Event {
  const t = team(ctx);
  const s = ctx.st.v2!;
  const d = openDeduction(ctx, deductionId);
  checkValue(ctx, d, blank, value);
  const cur = (t.drafts[d.id] ??= { fills: {}, by: ctx.actorId!, seq: 0, suggestions: [] });
  s.seq += 1;
  cur.suggestions = [...cur.suggestions.filter((x) => !(x.by === ctx.actorId && x.blank === blank)), { by: ctx.actorId!, blank, value, seq: s.seq }].slice(-30);
  return { kind: 'suggest', ok: true, cost: 0, outcome: 'suggested' };
}

export function clearDraft(ctx: Ctx, deductionId: string): V2Event {
  const t = team(ctx);
  openDeduction(ctx, deductionId);
  delete t.drafts[deductionId];
  ctx.st.v2!.seq += 1;
  return { kind: 'draft', ok: true, cost: 0, outcome: 'cleared' };
}

// ───────────────────────────────────────────── finale suggestions

/** A teammate puts an item forward for the current round; the lead sees it with their name. One per player per round. */
export function finaleSuggest(ctx: Ctx, itemId: string): V2Event {
  const t = team(ctx);
  const s = ctx.st.v2!;
  const f = s.finale;
  if (s.phase !== 'finale' || !f || f.status !== 'running' || !f.culprit) fail(ctx, 'no_suggest', 'conflict', 'phase');
  assertShared(ctx, itemId);
  if (!owns(ctx, itemId, true)) fail(ctx, 'not_owned', 'bad_request', 'not_owned');
  s.seq += 1;
  t.finale = [...t.finale.filter((x) => !(x.by === ctx.actorId && x.round === f.index)), { by: ctx.actorId!, round: f.index, item: itemId, seq: s.seq }];
  return { kind: 'finale_suggest', ok: true, cost: 0, outcome: 'suggested' };
}

// ───────────────────────────────────────────── lead and members

/** Make `to` the lead investigator (the lead hands over, or a member takes over from an absent lead). */
export function handOver(st: SessionState, to: string) {
  const from = st.hostId;
  if (st.players[from]) st.players[from].role = 'investigator';
  st.players[to].role = 'host';
  st.hostId = to;
}

/** Lead only: hand the lead to another member. */
export function handOverTo(ctx: Ctx, to: string): V2Event {
  team(ctx);
  assertHost(ctx);
  if (!(to in ctx.st.players) || to === ctx.actorId) fail(ctx, 'not_member', 'bad_request', 'not_owned');
  handOver(ctx.st, to);
  ctx.st.v2!.seq += 1;
  return { kind: 'handover', ok: true, cost: 0, outcome: to };
}

/**
 * A member leaves (or is removed): what they held privately is read out to the team (their notes stay on the desk),
 * the interview they held closes, their intent and finale suggestions go. Their minutes stay spent.
 * Returns how many private items were read out.
 */
export function memberLeaves(def: CaseDefinition, st: SessionState, id: string, now: number): number {
  const t = st.v2?.team;
  if (!t) return 0;
  const s = st.v2!;
  let shared = 0;
  const n = t.notes[id];
  if (n && (Object.keys(n.facts).length || Object.keys(n.evidence).length)) {
    const e = asPlayer(def, st, id, () => share({ def, st, now, locale: 'en', actorId: id }));
    shared = (e.newFacts?.length ?? 0) + (e.newEvidence?.length ?? 0);
  }
  delete t.notes[id];
  for (const iv of Object.values(s.interviews)) if (iv.by === id) { iv.open = false; delete iv.by; }
  delete t.intents[id];
  delete t.clocks[id];
  t.finale = t.finale.filter((x) => x.by !== id);
  s.seq += 1;
  return shared;
}
