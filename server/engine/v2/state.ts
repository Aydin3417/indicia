// SERVER-ONLY. v2 per-session state (clock, notebook, lab queue, interviews, deductions, finale)
// and the pure helpers the actions, projection and validator share.
import type {
  CaseDefinition, CaseV2, ClaimDef, CostTable, DeductionDef, Locale, Requirement, SuspectDef, TopicDef, ZoneDef, ZoneShape,
} from '../types.ts';
import { DEFAULT_COSTS } from '../types.ts';
import type { SysKey } from '../i18n.ts';

export type FactSource = { type: 'start' | 'document' | 'scene' | 'claim' | 'press' | 'lab' | 'deduction' | 'night'; ref?: string };

export interface Found {
  day: number;
  minute: number;
  seq: number;
}

export interface LabJob {
  analysisId: string;
  submittedAt: number; // absolute game minute
  readyAt: number;
  collected: boolean;
}

export interface InterviewState {
  open: boolean;
  patience: number;
  /** the day `patience` belongs to; a new day refills it */
  patienceDay: number;
  /** patience ran out on this day */
  refusedDay?: number;
  /** co-op: the investigator holding the interview (the others follow it but cannot ask) */
  by?: string;
  /**
   * Wave 9: when (absolute game minute) and by whom the interview was last left. Re-opening it while no game time has
   * passed since — a look at the notebook, a deduction filed right, a lab job sent — costs nothing (`resumesFree`).
   */
  left?: { at: number; by?: string };
}

export type LineRef =
  | { k: 'opening' }
  | { k: 'tier'; topic: string; tier: number }
  | { k: 'press'; claim: string }
  | { k: 'resist'; claim: string; b: number }
  | { k: 'dismiss'; n: number }
  | { k: 'deflect'; n: number }
  | { k: 'repeat'; topic: string; tier: number; n: number }
  | { k: 'sys'; key: SysKey }
  | { k: 'player' };

export interface LogEntry {
  seq: number;
  day: number;
  minute: number;
  suspectId: string;
  from: 'player' | 'suspect' | 'system';
  ref: LineRef;
  actorId?: string;
  action?: 'topic' | 'press' | 'present' | 'ask' | 'start' | 'leave';
  claimId?: string;
  itemId?: string;
  topicId?: string;
  outcome?: string;
  /** typed free question (game data, never analytics) */
  text?: string;
}

export interface DayReportRecord {
  day: number;
  facts: string[];
  evidence: string[];
  deductionsConfirmed: string[];
  deductionsOpened: string[];
  labsReady: string[];
  labsRunning: string[];
  unusedMinutes: number;
  night?: { id: string; facts: string[]; evidence: string[] };
  /** a night fork offered after this day; `chosen` once settled */
  fork?: { id: string; chosen?: string; facts: string[]; evidence: string[] };
}

export interface FinaleRoundState {
  id: string;
  result: 'won' | 'lost' | null;
  attempts: number;
  firstTry: boolean;
}

export interface FinaleState {
  accusedId: string;
  culprit: boolean;
  index: number;
  tries: number;
  rounds: FinaleRoundState[];
  status: 'running' | 'done';
  outcome?: 'confession' | 'charged' | 'weak' | 'wrongful';
  stars?: { truth: boolean; proof: boolean; clock: boolean };
  closedAt?: number;
}

export interface V2State {
  day: number;
  minute: number;
  phase: 'investigating' | 'awaiting_finale' | 'finale' | 'closed';
  location: string | null;
  spent: number;
  seq: number;
  facts: Record<string, Found & { src: FactSource }>;
  evidenceFound: Record<string, Found>;
  zones: string[];
  /** `${zoneId}/${detailId}` */
  details: string[];
  lab: LabJob[];
  interviews: Record<string, InterviewState>;
  claims: Record<string, { pressed?: boolean; broken?: boolean }>;
  deductions: Record<string, {
    confirmed: boolean; attempts: number; day?: number; fills?: Record<string, string>; order?: string[];
    /** wrong filings in a row; from the second one the player gets a directional nudge */
    wrong?: number;
    /** the nudge: which blank to look at again (never the answer) */
    nudge?: { kind: 'blank'; blank: string; single: boolean } | { kind: 'outlier' } | { kind: 'order' };
    /** wrong filings after the last day ended (capped: there is no time left to charge) */
    late?: number;
    /**
     * Wave 6: wrong filings made while today had less time left than a wrong filing costs (they charged only what was
     * left, often nothing). Capped like `late`, so the end of a day is not a window for free guessing.
     */
    short?: number;
  }>;
  unlocked: string[];
  log: LogEntry[];
  reports: DayReportRecord[];
  dayStart: { visibleDeductions: string[] };
  finale?: FinaleState;
  /** per viewer: highest seq already seen (for "new" marks) */
  seen: Record<string, number>;
  /** validator simulation: no daily limit, instant lab, everyone available */
  sim?: boolean;
  /** the night fork waiting for an answer: the index of its day report */
  pendingFork?: number;
  /** wave 5: co-op team state (per-player clocks, intents, drafts, suggestions, private notes); absent in solo */
  team?: TeamState;
  /** transient while a co-op player acts or views (never saved): who, their budget and what they used today */
  actingAs?: string;
  budget?: number;
  used?: number;
}

// ───────────────────────────────────────────── co-op (wave 5)

/** One investigator's own clock in a shared investigation. */
export interface PlayerClock {
  /** calendar minute of the day (08:00 + minute): actions and waiting move it */
  minute: number;
  /** minutes of this player's budget used today (actions only; waiting is free in co-op) */
  used: number;
  location: string | null;
  /** minutes spent on actions over the whole case */
  spent: number;
  /** "done for today" was pressed on this day */
  doneDay?: number;
  /**
   * Wave 6: today's budget for a member who joined after the team's budget was fixed for the day (it holds once
   * anyone has spent a minute). They get the share for the team's new size, not the old one; cleared every morning,
   * when everyone gets the same share again.
   */
  budget?: number;
}

export type IntentKind = 'go' | 'interview' | 'lab';

export interface Intent {
  kind: IntentKind;
  target: string;
  day: number;
  seq: number;
}

export interface DraftSuggestion {
  by: string;
  /** a blank id, or 'outlier' for a timeline */
  blank: string;
  value: string;
  seq: number;
}

export interface Draft {
  fills: Record<string, string>;
  order?: string[];
  outlier?: string;
  /** who wrote it last */
  by: string;
  seq: number;
  suggestions: DraftSuggestion[];
}

export interface FinaleSuggestion {
  by: string;
  /** round index */
  round: number;
  item: string;
  seq: number;
}

/** Things one player found alone (a private source) and has not read out to the team yet. */
export interface PrivateNotes {
  facts: Record<string, Found & { src: FactSource }>;
  evidence: Record<string, Found>;
}

export interface TeamState {
  /** members the per-player budget was computed for, and the day it was fixed */
  size: number;
  budget: number;
  budgetDay: number;
  clocks: Record<string, PlayerClock>;
  intents: Record<string, Intent>;
  drafts: Record<string, Draft>;
  finale: FinaleSuggestion[];
  notes: Record<string, PrivateNotes>;
}

// ───────────────────────────────────────────── clock

export const MINUTES_PER_24H = 1440;

export function costsOf(v2: CaseV2): CostTable {
  return { ...DEFAULT_COSTS, ...(v2.clock.costs ?? {}) };
}

export const hm = (s: string): number => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s);
  return m ? Number(m[1]) * 60 + Number(m[2]) : 0;
};

export const clockLabel = (minutesOfDay: number): string => {
  const m = ((Math.round(minutesOfDay) % MINUTES_PER_24H) + MINUTES_PER_24H) % MINUTES_PER_24H;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

/** Absolute game minute: day d starts at (d−1)·24h + dayStart. Labs keep working overnight. */
export const absOf = (v2: CaseV2, day: number, minute: number) => (day - 1) * MINUTES_PER_24H + hm(v2.clock.dayStart) + minute;
export const absNow = (v2: CaseV2, s: V2State) => absOf(v2, s.day, s.minute);

/** absolute → { day, minute, label } (minute may be outside the working day, e.g. a lab result at 21:00) */
export function gameTime(v2: CaseV2, abs: number) {
  const start = hm(v2.clock.dayStart);
  const day = Math.floor((abs - start) / MINUTES_PER_24H) + 1;
  const minute = abs - absOf(v2, day, 0);
  return { day, minute, label: clockLabel(start + minute) };
}

/**
 * The case budget. Co-op (wave 5): counted in one investigator's budget (days × per-player minutes), so the Clock star
 * asks the same of a team as of a solo player: finish with a quarter of the days left.
 */
export const totalBudget = (v2: CaseV2, s?: V2State) => v2.clock.days * (s?.team ? s.team.budget : v2.clock.minutesPerDay);

/** Highest budget use today over the team (the acting player's live value counts). */
export function teamUsedMax(s: V2State): number {
  const t = s.team;
  if (!t) return s.minute;
  let m = 0;
  for (const [id, c] of Object.entries(t.clocks)) m = Math.max(m, id === s.actingAs ? s.used ?? c.used : c.used);
  return m;
}

/** Calendar/budget time used: (day − 1) × day length + today. Co-op: the busiest investigator's budget use. */
export const elapsedOf = (v2: CaseV2, s: V2State) => (s.team
  ? (s.day - 1) * s.team.budget + teamUsedMax(s)
  : (s.day - 1) * v2.clock.minutesPerDay + s.minute);

/** What is left of today for whoever is acting: the calendar day, and in co-op also their own budget. */
export const remainingToday = (v2: CaseV2, s: V2State) => Math.max(0, Math.min(
  v2.clock.minutesPerDay - s.minute,
  s.budget !== undefined ? s.budget - (s.used ?? 0) : Number.POSITIVE_INFINITY,
));

/** Calendar minutes left today (waiting is bounded by this, not by the co-op budget). */
export const calendarLeft = (v2: CaseV2, s: V2State) => Math.max(0, v2.clock.minutesPerDay - s.minute);

// ───────────────────────────────────────────── creation

export function newV2State(def: CaseDefinition): V2State {
  const v2 = def.v2!;
  const s: V2State = {
    day: 1, minute: 0, phase: 'investigating', location: v2.clock.startLocationId, spent: 0, seq: 0,
    facts: {}, evidenceFound: {}, zones: [], details: [], lab: [], interviews: {}, claims: {}, deductions: {},
    unlocked: [], log: [], reports: [], dayStart: { visibleDeductions: [] }, seen: {},
  };
  for (const f of def.briefing.startingFacts ?? []) s.facts[f] = { day: 1, minute: 0, seq: 0, src: { type: 'start' } };
  for (const e of def.briefing.startingEvidence) s.evidenceFound[e] = { day: 1, minute: 0, seq: 0 };
  for (const sus of def.suspects) s.interviews[sus.id] = { open: false, patience: patienceOf(sus), patienceDay: 1 };
  return s;
}

export const patienceOf = (s: SuspectDef) => Math.max(1, s.v2?.patience ?? 4);

// ───────────────────────────────────────────── lookups (cached per frozen definition)

export interface ClaimRef {
  suspect: SuspectDef;
  topic: TopicDef;
  tier: number;
  claim: ClaimDef;
}

interface Index {
  claims: Map<string, ClaimRef>;
  zones: Map<string, { zone: ZoneDef; locationId: string }>;
  facts: Set<string>;
  deductions: Map<string, DeductionDef>;
}

const cache = new WeakMap<CaseDefinition, Index>();

/** Claims of one tier. A tier without authored claims becomes one card holding the whole answer. */
export function claimsOf(suspect: SuspectDef, topic: TopicDef, tier: number): ClaimDef[] {
  const t = topic.tiers[tier];
  if (!t) return [];
  return t.claims?.length ? t.claims : [{ id: `${suspect.id}.${topic.id}.${tier}`, text: t.line }];
}

export function indexOf(def: CaseDefinition): Index {
  let ix = cache.get(def);
  if (ix) return ix;
  ix = { claims: new Map(), zones: new Map(), facts: new Set(def.v2?.facts.map((f) => f.id) ?? []), deductions: new Map() };
  for (const s of def.suspects) for (const t of s.topics) t.tiers.forEach((_tier, i) => {
    for (const c of claimsOf(s, t, i)) ix!.claims.set(c.id, { suspect: s, topic: t, tier: i, claim: c });
  });
  for (const sc of def.v2?.scenes ?? []) for (const z of sc.zones) ix.zones.set(z.id, { zone: z, locationId: sc.locationId });
  for (const d of def.v2?.deductions ?? []) ix.deductions.set(d.id, d);
  if (Object.isFrozen(def)) cache.set(def, ix);
  return ix;
}

// ───────────────────────────────────────────── visibility rules

export const isUnlocked = (s: V2State, key: string) => s.unlocked.includes(key);

export function locationOpen(def: CaseDefinition, s: V2State, meets: (r: Requirement | undefined) => boolean, id: string): boolean {
  const l = def.locations.find((x) => x.id === id);
  if (!l) return false;
  if (l.v2?.locked && !isUnlocked(s, `location:${id}`)) return false;
  return meets(l.requires);
}

export function zoneOpen(s: V2State, meets: (r: Requirement | undefined) => boolean, z: ZoneDef): boolean {
  if (z.locked && !isUnlocked(s, `zone:${z.id}`)) return false;
  return meets(z.requires);
}

/** Listed in the view: visible zones, plus hidden ones once found. */
export function zoneListed(s: V2State, meets: (r: Requirement | undefined) => boolean, z: ZoneDef): boolean {
  if (!zoneOpen(s, meets, z)) return false;
  return (z.reveal ?? 'visible') === 'visible' || s.zones.includes(z.id);
}

export function deductionVisible(s: V2State, meets: (r: Requirement | undefined) => boolean, d: DeductionDef): boolean {
  if (d.locked && !isUnlocked(s, `deduction:${d.id}`)) return false;
  return meets(d.requires);
}

export function shapeContains(shape: ZoneShape, x: number, y: number, tol = 0.03): boolean {
  if (shape.kind === 'rect') return x >= shape.x - tol && x <= shape.x + shape.w + tol && y >= shape.y - tol && y <= shape.y + shape.h + tol;
  if (shape.kind === 'circle') return Math.hypot(x - shape.x, y - shape.y) <= shape.r + tol;
  // poly: ray casting, then a tolerance check against the vertices
  let inside = false;
  const p = shape.points;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [xi, yi] = p[i];
    const [xj, yj] = p[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside || p.some(([px, py]) => Math.hypot(px - x, py - y) <= tol);
}

export function shapeCenter(shape: ZoneShape): [number, number] {
  if (shape.kind === 'rect') return [shape.x + shape.w / 2, shape.y + shape.h / 2];
  if (shape.kind === 'circle') return [shape.x, shape.y];
  const n = shape.points.length;
  return [shape.points.reduce((a, p) => a + p[0], 0) / n, shape.points.reduce((a, p) => a + p[1], 0) / n];
}

/** What the Proof star needs in this case: rounds won at the first try and confirmed deductions. */
export function proofNeeds(v2: CaseV2): { firstTry: number; deductions: number } {
  const cfg = v2.finale.stars ?? {};
  const n = v2.finale.rounds.length;
  return { firstTry: cfg.proofFirstTry ?? n - 1, deductions: Math.ceil(v2.deductions.length * (cfg.proofDeductions ?? 0.6) - 1e-9) };
}

export const localeOrEn =(l: Locale | undefined): Locale => (l === 'tr' ? 'tr' : 'en');
