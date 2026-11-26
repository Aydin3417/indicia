// SERVER-ONLY. Shared investigations, wave 5 ("deep co-op"): every investigator has their own clock and budget, can be
// somewhere else, marks what they are about to do, pencils in deductions for the team, suggests answers in the
// finale, and keeps what they found at a private source in their own notes until they read it out.
//
// The engine's actions are written for one clock (`s.minute`, `s.location`). In co-op the acting (or viewing) player's
// clock is swapped into those fields for the duration of the call (`asPlayer`), so every rule — costs, availability,
// lab readiness, scene presence — applies to that player's own time and place. Solo sessions never have `s.team`.
import type { CaseDefinition, CaseV2 } from '../types.ts';
import type { SessionState } from '../state.ts';
import type { PlayerClock, PrivateNotes, TeamState, V2State } from './state.ts';
import { costsOf } from './state.ts';

/** Each investigator's share of the solo day by team size (CoopDef.share overrides). */
export const DEFAULT_SHARE: Record<number, number> = { 1: 1, 2: 0.6, 3: 0.42, 4: 0.36, 5: 0.31, 6: 0.27 };

export function shareOf(v2: CaseV2, n: number): number {
  if (n <= 1) return 1;
  const k = Math.min(6, n) as 2 | 3 | 4 | 5 | 6;
  return v2.coop?.share?.[k] ?? DEFAULT_SHARE[k];
}

/** Minutes each investigator may spend per day in a team of `n` (rounded to 5). */
export const budgetFor = (v2: CaseV2, n: number) =>
  n <= 1 ? v2.clock.minutesPerDay : Math.max(60, Math.round((v2.clock.minutesPerDay * shareOf(v2, n)) / 5) * 5);

/** Members in seat order (lead first by join time). */
export const membersOf = (st: SessionState) =>
  Object.entries(st.players).sort((a, b) => a[1].joinedAt - b[1].joinedAt).map(([id]) => id);

const isCoop = (st: SessionState) => st.mode === 'coop' && !!st.v2;

/** The team state of a co-op session (created on first use); undefined in solo. */
export function teamOf(def: CaseDefinition, st: SessionState): TeamState | undefined {
  if (!isCoop(st) || !def.v2) return undefined;
  const s = st.v2!;
  if (!s.team) {
    const n = membersOf(st).length;
    s.team = { size: n, budget: budgetFor(def.v2, n), budgetDay: s.day, clocks: {}, intents: {}, drafts: {}, finale: [], notes: {} };
  }
  s.team.clocks ??= {};
  s.team.intents ??= {};
  s.team.drafts ??= {};
  s.team.finale ??= [];
  s.team.notes ??= {};
  return s.team;
}

/** A member's budget today: the team's share, unless they joined after it was fixed (see PlayerClock.budget). */
export const budgetOf = (t: TeamState, c?: PlayerClock) => c?.budget ?? t.budget;

export function clockOf(def: CaseDefinition, st: SessionState, id: string): PlayerClock {
  const t = teamOf(def, st)!;
  const s = st.v2!;
  const existing = t.clocks[id];
  if (existing) return existing;
  // a newcomer starts the current day at its beginning, at the station (or the case's start place)
  const c: PlayerClock = {
    minute: s.phase === 'investigating' ? 0 : def.v2!.clock.minutesPerDay,
    used: s.phase === 'investigating' ? 0 : t.budget,
    location: def.v2!.clock.startLocationId,
    spent: 0,
  };
  // wave 6 (N's gap): joining after the day's budget was fixed. The newcomer gets the share for the team as it is now
  // (2 → 290, 3 → 200 in Kessler), not the size fixed this morning — a friend who joins a lead who started alone no
  // longer gets a full solo day on top of the lead's.
  const n = membersOf(st).length;
  const fixed = Object.values(t.clocks).some((x) => x.used > 0);
  if (s.phase === 'investigating' && fixed && n !== t.size) c.budget = budgetFor(def.v2!, n);
  t.clocks[id] = c;
  return c;
}

/**
 * Fix the per-player budget for today from the number of members. It may still change while nobody has spent
 * anything today (friends joining before the first move); after that it holds until the next morning.
 */
export function refreshBudget(def: CaseDefinition, st: SessionState) {
  const t = teamOf(def, st);
  if (!t) return;
  const s = st.v2!;
  syncActive(st);
  const untouched = Object.values(t.clocks).every((c) => c.used === 0);
  if (t.budgetDay === s.day && !untouched) return;
  if (s.phase !== 'investigating') return;
  const n = membersOf(st).length;
  t.size = n;
  t.budget = budgetFor(def.v2!, n);
  t.budgetDay = s.day;
  if (s.actingAs) s.budget = budgetOf(t, t.clocks[s.actingAs]);
}

/** Write the acting player's live clock back into the team (before anything reads the whole team). */
export function syncActive(st: SessionState) {
  const s = st.v2;
  const t = s?.team;
  if (!s || !t || !s.actingAs) return;
  const c = t.clocks[s.actingAs];
  if (!c) return;
  c.minute = s.minute;
  c.location = s.location;
  c.used = s.used ?? c.used;
}

/** The busiest member's calendar minute (the "team time" kept in `s.minute` between actions). */
function restTeamTime(def: CaseDefinition, st: SessionState) {
  const s = st.v2!;
  const t = s.team!;
  const ids = membersOf(st).filter((id) => t.clocks[id]);
  if (!ids.length) return;
  s.minute = Math.max(...ids.map((id) => t.clocks[id].minute));
  s.location = t.clocks[st.hostId]?.location ?? s.location;
}

function enter(def: CaseDefinition, st: SessionState, id: string) {
  const s = st.v2!;
  const t = teamOf(def, st)!;
  refreshBudget(def, st);
  const c = clockOf(def, st, id);
  s.minute = c.minute;
  s.location = c.location;
  s.used = c.used;
  s.budget = budgetOf(t, c);
  s.actingAs = id;
  return s.spent;
}

function leave(def: CaseDefinition, st: SessionState, id: string, spentBefore: number) {
  const s = st.v2!;
  const t = s.team!;
  const c = t.clocks[id];
  if (c) {
    c.minute = s.minute;
    c.location = s.location;
    c.used = s.used ?? c.used;
    c.spent += s.spent - spentBefore;
  }
  delete s.actingAs;
  delete s.used;
  delete s.budget;
  restTeamTime(def, st);
}

/**
 * Run `fn` with `playerId`'s own clock in `s.minute` / `s.location` (co-op only; solo runs `fn` as is).
 * Re-entrant for the same player (a projection made inside an action).
 */
export function asPlayer<T>(def: CaseDefinition, st: SessionState, playerId: string | undefined, fn: () => T): T {
  const s = st.v2;
  if (!s || !playerId || !isCoop(st) || s.actingAs) return fn();
  const before = enter(def, st, playerId);
  try {
    return fn();
  } finally {
    leave(def, st, playerId, before);
  }
}

export async function asPlayerAsync<T>(def: CaseDefinition, st: SessionState, playerId: string | undefined, fn: () => Promise<T>): Promise<T> {
  const s = st.v2;
  if (!s || !playerId || !isCoop(st) || s.actingAs) return fn();
  const before = enter(def, st, playerId);
  try {
    return await fn();
  } finally {
    leave(def, st, playerId, before);
  }
}

/** The cheapest move that costs time: below it, a player is out of time for today. */
export function cheapestMove(v2: CaseV2): number {
  const c = costsOf(v2);
  return Math.min(c.press, c.present, c.closeUp, c.travel, c.freeQuestion, c.startInterview, c.tool);
}

/** What a member has left today (their budget and the calendar day). */
export function leftFor(v2: CaseV2, t: TeamState, c: PlayerClock): number {
  return Math.max(0, Math.min(budgetOf(t, c) - c.used, v2.clock.minutesPerDay - c.minute));
}

/** A member is finished for today: pressed "done", or nothing that costs time fits any more. */
export function isDone(v2: CaseV2, s: V2State, t: TeamState, c: PlayerClock): boolean {
  return c.doneDay === s.day || leftFor(v2, t, c) < cheapestMove(v2);
}

/**
 * The day ends by itself when every member who is playing (online, or has acted today) is finished.
 * Members who are away and have not acted today do not hold the team up.
 */
export function everyoneDone(def: CaseDefinition, st: SessionState, online: string[]): boolean {
  const t = teamOf(def, st);
  const s = st.v2!;
  if (!t || s.phase !== 'investigating') return false;
  syncActive(st);
  const playing = membersOf(st).filter((id) => online.includes(id) || (t.clocks[id]?.used ?? 0) > 0 || t.clocks[id]?.doneDay === s.day);
  if (!playing.length) return false;
  return playing.every((id) => isDone(def.v2!, s, t, clockOf(def, st, id)));
}

// ───────────────────────────────────────────── private sources

/** Private notes are dealt only in a team of two or more, and only by a case that asks for them. */
export function privacyOn(def: CaseDefinition, st: SessionState, actorId: string | undefined): actorId is string {
  return !!actorId && isCoop(st) && !!def.v2?.coop?.private && membersOf(st).length >= 2 && actorId in st.players;
}

export const privateLocation = (def: CaseDefinition, locationId: string | undefined) =>
  !!locationId && !!def.v2?.coop?.private?.locations?.includes(locationId);

export const privateEvidence = (def: CaseDefinition, evidenceId: string) => !!def.v2?.coop?.private?.evidence?.includes(evidenceId);

export function notesOf(st: SessionState, playerId: string | undefined): PrivateNotes | undefined {
  if (!playerId) return undefined;
  return st.v2?.team?.notes[playerId];
}

export function ensureNotes(st: SessionState, playerId: string): PrivateNotes {
  const t = st.v2!.team!;
  return (t.notes[playerId] ??= { facts: {}, evidence: {} });
}

/** The item is in this player's private notes (and not yet the team's). */
export function holdsPrivately(st: SessionState, playerId: string | undefined, itemId: string): boolean {
  const n = notesOf(st, playerId);
  return !!n && (itemId in n.facts || itemId in n.evidence);
}

/** Something became the team's: nobody needs to hold it privately any more. */
export function dropFromNotes(st: SessionState, itemId: string) {
  const t = st.v2?.team;
  if (!t) return;
  for (const n of Object.values(t.notes)) {
    delete n.facts[itemId];
    delete n.evidence[itemId];
  }
}
