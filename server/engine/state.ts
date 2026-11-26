// SERVER-ONLY. Mutable per-session investigation state (never sent raw to the client).
import type { CaseResult } from '../../shared/api.ts';
import type { CaseDefinition, Requirement } from './types.ts';
import { newV2State, type V2State } from './v2/state.ts';

export interface SuspectState {
  trust: number;
  stress: number;
  /** highest tier reached per topic (-1 / missing = not raised) */
  tiers: Record<string, number>;
  /** times each topic was answered */
  asked: Record<string, number>;
  presented: string[];
  shutdownLeft: number;
  questions: number;
}

export interface SessionState {
  caseId: string;
  caseVersion: number;
  caseHash: string;
  status: 'active' | 'closed';
  startedAt: number;
  closedAt?: number;
  evidence: Record<string, number>; // id -> discovered at
  hotspots: string[];
  analyses: Record<string, number>;
  statements: Record<string, number>;
  contradictions: string[];
  failedContradictionTests: number;
  testedPairs: string[];
  hintsUsed: string[];
  suspects: Record<string, SuspectState>;
  accusedBy?: string;
  result?: CaseResult;
  seq: number;
  // ── shared-investigation fields
  mode: 'solo' | 'coop';
  hostId: string;
  roomCode?: string;
  roomLocked: boolean;
  players: Record<string, PlayerSeat>;
  /** bumped on every shared change; clients poll it */
  version: number;
  activity: ActivityEntry[];
  /** v2 game layer (present when the case defines `v2`) */
  v2?: V2State;
}

export interface PlayerSeat {
  name: string;
  role: 'host' | 'investigator';
  joinedAt: number;
}

export interface ActivityEntry {
  at: number;
  actorId: string;
  text: string;
  /** v2: localised at projection time (text holds the English fallback) */
  key?: string;
  args?: string[];
}

export const MAX_PLAYERS = 6;

/** Bring sessions saved by older builds up to the current shape. */
export function normaliseState(st: SessionState, ownerId: string, ownerName = 'Investigator'): SessionState {
  st.mode ??= 'solo';
  st.hostId ??= ownerId;
  st.roomLocked ??= false;
  st.players ??= { [ownerId]: { name: ownerName, role: 'host', joinedAt: st.startedAt } };
  st.version ??= 1;
  st.activity ??= [];
  return st;
}

export function logActivity(st: SessionState, actorId: string, text: string, now: number, key?: string, args?: string[]) {
  st.activity.push({ at: now, actorId, text, ...(key ? { key, args } : {}) });
  if (st.activity.length > 60) st.activity.splice(0, st.activity.length - 60);
}

export function newSessionState(
  def: CaseDefinition,
  caseHash: string,
  now = Date.now(),
  owner: { id: string; name: string } = { id: 'solo', name: 'Investigator' },
  mode: 'solo' | 'coop' = 'solo',
): SessionState {
  const st: SessionState = {
    caseId: def.id,
    caseVersion: def.version,
    caseHash,
    status: 'active',
    startedAt: now,
    evidence: {},
    hotspots: [],
    analyses: {},
    statements: {},
    contradictions: [],
    failedContradictionTests: 0,
    testedPairs: [],
    hintsUsed: [],
    suspects: {},
    seq: 0,
    mode,
    hostId: owner.id,
    roomLocked: false,
    players: { [owner.id]: { name: owner.name, role: 'host', joinedAt: now } },
    version: 1,
    activity: [],
  };
  for (const e of def.briefing.startingEvidence) st.evidence[e] = now;
  for (const s of def.briefing.startingStatements) st.statements[s] = now;
  for (const s of def.suspects) {
    st.suspects[s.id] = {
      trust: s.baseline.trust,
      stress: s.baseline.stress,
      tiers: {},
      asked: {},
      presented: [],
      shutdownLeft: 0,
      questions: 0,
    };
  }
  if (def.v2) st.v2 = newV2State(def);
  return st;
}

export function meets(req: Requirement | undefined, st: SessionState): boolean {
  if (!req) return true;
  if (req.evidence && !req.evidence.every((e) => e in st.evidence)) return false;
  if (req.statements && !req.statements.every((s) => s in st.statements)) return false;
  if (req.analyses && !req.analyses.every((a) => a in st.analyses)) return false;
  if (req.contradictions && !req.contradictions.every((c) => st.contradictions.includes(c))) return false;
  if (req.facts && !req.facts.every((f) => !!st.v2 && f in st.v2.facts)) return false;
  if (req.deductions && !req.deductions.every((d) => !!st.v2?.deductions[d]?.confirmed)) return false;
  return true;
}

export const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));

/** Deterministic, ordered discovery: returns ids that were new. */
export function discover(st: SessionState, ids: string[] | undefined, now: number): string[] {
  const fresh: string[] = [];
  for (const id of ids ?? []) {
    if (!(id in st.evidence)) {
      st.evidence[id] = now;
      fresh.push(id);
    }
  }
  return fresh;
}

export function hear(st: SessionState, ids: string[] | undefined, now: number): string[] {
  const fresh: string[] = [];
  for (const id of ids ?? []) {
    if (!(id in st.statements)) {
      st.statements[id] = now;
      fresh.push(id);
    }
  }
  return fresh;
}
