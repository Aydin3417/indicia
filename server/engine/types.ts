// SERVER-ONLY. The truth model. Never import from app/ or src/.

export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type EvidenceRole = 'decisive' | 'supporting' | 'misleading' | 'irrelevant';
export type EvidenceKind =
  | 'physical' | 'document' | 'digital' | 'forensic' | 'testimony' | 'financial' | 'footage' | 'photo';
export type Stance = 'truth' | 'lie' | 'partial' | 'evasive' | 'misremember';
export type Emotion = 'calm' | 'guarded' | 'irritated' | 'anxious' | 'distressed' | 'hostile' | 'resigned' | 'grieving';

// ───────────────────────────────────────────────────────────── localisation
export type Locale = 'en' | 'tr';
/** A player-facing content string in both languages. `tr` may be missing only in a draft case. */
export interface LocalText {
  en: string;
  tr?: string;
}
/** Every player-facing content field. A plain string counts as English only (draft content). */
export type Text = string | LocalText;

/** Things a player can have, used as prerequisites everywhere. */
export interface Requirement {
  /** evidence ids the player must have discovered */
  evidence?: string[];
  /** statement ids the player must have heard */
  statements?: string[];
  /** lab analysis ids that must be complete */
  analyses?: string[];
  /** contradiction ids the player must have proven */
  contradictions?: string[];
  /** v2: fact ids in the notebook */
  facts?: string[];
  /** v2: confirmed deduction ids */
  deductions?: string[];
}

export interface CaseDefinition {
  id: string;
  version: number;
  meta: {
    title: Text;
    caseNumber: string;
    category: Text;
    difficulty: Difficulty;
    durationMinutes: [number, number];
    synopsis: Text;
    tagline: Text;
    tier: 'free' | 'plus';
    setting: Text;
    /** 'draft' tolerates missing Turkish (warnings); anything else must be complete in en + tr. */
    contentStatus?: 'draft' | 'final';
    /** the teaching case the app opens on first launch (CaseSummary.tutorial) */
    tutorial?: boolean;
    /** what the case is about; verdict and debrief wording follow it (default 'murder'). Wave 7: 'arson'. */
    crime?: 'murder' | 'theft' | 'arson';
  };
  briefing: Briefing;
  truth: Truth;
  people: Person[];
  suspects: SuspectDef[];
  locations: LocationDef[];
  evidence: EvidenceDef[];
  analyses: LabAnalysisDef[];
  statements: StatementDef[];
  contradictions: ContradictionDef[];
  accusation: AccusationKey;
  hints: HintDef[];
  /** v2 game layer: clock, facts, scenes, claims (on tiers), deductions, finale. */
  v2?: CaseV2;
}

export interface Briefing {
  issuedBy: Text;
  date: Text; // display
  location: Text;
  victim: { personId: string; summary: Text };
  incidentReport: Text[];
  preliminaryFindings: Text[];
  knownWitnesses: string[]; // person ids
  objectives: Text[];
  /** evidence the player holds from the start */
  startingEvidence: string[];
  /** initial statements taken by uniformed officers */
  startingStatements: string[];
  /** v2: facts in the notebook from the start */
  startingFacts?: string[];
}

export interface TruthEvent {
  time: string; // HH:MM, 24h, day-relative
  day?: string;
  description: string;
  actors: string[];
}

export interface Truth {
  killerId: string;
  motiveId: string;
  methodId: string;
  weaponEvidenceId: string;
  timeOfDeath: { from: string; to: string; actual: string };
  events: TruthEvent[];
  narrative: Text[]; // the debrief "what really happened"
}

export interface Person {
  id: string;
  name: string;
  role: Text; // "Victim", "Neighbour", "Bartender"
  description: Text;
}

export interface TierDef {
  stance: Stance;
  requires?: {
    /** evidence that must have been PRESENTED to this suspect (any time in the session) */
    presented?: string[];
    /** any one of these presented is enough */
    presentedAny?: string[];
    /** player must know these (discovered / heard) */
    known?: Requirement;
    minStress?: number;
    minTrust?: number;
  };
  /** the authored, canonical answer */
  line: Text;
  /** alternate phrasings for repeats in offline mode */
  variants?: Text[];
  /** the only facts the renderer may convey (AI-internal, English) */
  facts: string[];
  emotion: Emotion;
  /** recorded claims */
  statements?: string[];
  /** evidence created by this answer (e.g. a written admission) */
  revealsEvidence?: string[];
  stress?: number; // delta when this tier is first reached
  trust?: number;
  /** v2: the answer split into claim cards the player can press or break */
  claims?: ClaimDef[];
}

export interface TopicDef {
  id: string;
  label: Text; // player-facing name once raised ("The 22:43 phone call")
  /** keyword groups: a group matches if ANY term in it appears; score = groups matched */
  keywords: string[][];
  /** evidence that, when presented, points at this topic */
  evidence?: string[];
  description: string; // for AI classifier
  tiers: TierDef[];
  /** v2: when this topic can be raised */
  v2?: TopicV2;
}

export interface SuspectDef {
  id: string;
  name: string;
  age: number;
  occupation: Text;
  relationship: Text;
  background: string;
  personality: string;
  speakingStyle: string;
  vulnerabilities: string;
  publicProfile: Text; // shown in suspect profile
  claimedAlibi: Text;
  actualWhereabouts: string;
  motive: string;
  secrets: string[];
  knows: string[];
  doesNotKnow: string[];
  baseline: { trust: number; stress: number };
  /** stress at which the suspect stops cooperating for a few questions */
  shutdownStress: number;
  initials: string;
  portraitTone: string; // hex used for the monogram card
  opening: Text; // first line when interrogation starts
  /** said when a question matches no topic */
  deflections: Text[];
  /** said when irrelevant evidence is presented (v2 rotates through them in order, so keep 5–6) */
  dismissals: Text[];
  /** v2: said when the right item meets a claim too early and the break has no line of its own (rotated) */
  resists?: Text[];
  /** said when the player is aggressive without grounds */
  pushback: Text[];
  /** said while shut down */
  shutdownLines: Text[];
  topics: TopicDef[];
  /** terms the AI must never produce for this suspect unless the matching topic tier is reached */
  guarded: { term: string; unlockedBy: { topic: string; tier: number } }[];
  /** v2: interview settings */
  v2?: SuspectV2;
}

export interface HotspotDef {
  id: string;
  label: Text;
  /** position on the scene plan, 0..1 */
  x: number;
  y: number;
  description: Text; // what the player sees when examining
  reveals?: string[]; // evidence ids
  requires?: Requirement;
  /** shown when examined but requirement not met */
  lockedText?: Text;
}

export interface LocationDef {
  id: string;
  name: Text;
  summary: Text;
  plan: PlanShape[];
  hotspots: HotspotDef[];
  requires?: Requirement;
  /** v2: travel rules */
  v2?: { locked?: boolean; travel?: number };
}

/** Simple architectural plan primitives for the scene sketch (0..1 coords). */
export type PlanShape =
  | { t: 'wall'; x1: number; y1: number; x2: number; y2: number }
  | { t: 'rect'; x: number; y: number; w: number; h: number; label?: Text; dashed?: boolean }
  | { t: 'door'; x: number; y: number; r: number; angle: number }
  | { t: 'body'; x: number; y: number; angle: number }
  | { t: 'text'; x: number; y: number; text: Text };

export interface EvidenceDef {
  id: string;
  code: string; // "E-07"
  name: Text;
  kind: EvidenceKind;
  description: Text;
  locationId?: string;
  foundAt: Text;
  role: EvidenceRole;
  reliability: 'confirmed' | 'reliable' | 'questionable' | 'unverified';
  relatedPeople: string[];
  /** timeline entries this evidence establishes once known */
  timeline?: { time: string; text: Text; lane: string }[];
  /** extra document body (records, statements). v2 markup: {{fact-id|phrase}} underlined, {{?fact-id|phrase}} unmarked. */
  body?: Text[];
}

export interface LabAnalysisDef {
  id: string;
  evidenceId: string; // what you send to the lab
  discipline: 'fingerprints' | 'dna' | 'toxicology' | 'serology' | 'digital' | 'document' | 'financial' | 'autopsy' | 'trace' | 'records';
  name: Text;
  requires?: Requirement;
  lockedReason?: Text;
  result: Text[];
  conclusion: Text;
  reveals?: string[]; // evidence produced by the analysis (reports)
  /** v2: delay and gating */
  v2?: {
    /** game minutes until the result is ready (120–360) */
    minutes: number;
    /** locked until a deduction effect unlocks `analysis:<id>` */
    locked?: boolean;
    /** facts written into the notebook when the result is collected */
    facts?: string[];
  };
}

export interface StatementDef {
  id: string;
  speakerId: string;
  text: Text; // the claim as recorded
  time?: string; // what time it refers to
  lane: string;
  truthful: boolean;
}

export interface ContradictionDef {
  id: string;
  statementId: string;
  evidenceId: string;
  summary: Text; // shown once proven
}

export interface AccusationOption {
  id: string;
  text: Text;
}

export interface AccusationKey {
  motives: AccusationOption[];
  methods: AccusationOption[];
  /** time-window options for "when" */
  windows: AccusationOption[];
  correctWindowId: string;
  /** evidence that proves the case; scoring is precision/recall over this set */
  decisiveEvidence: string[];
  /** for each innocent suspect, evidence any of which clears them */
  clearing: Record<string, string[]>;
  /** contradictions that matter for the prosecution */
  keyContradictions: string[];
  weights: {
    culprit: number;
    motive: number;
    method: number;
    window: number;
    evidence: number;
    contradictions: number;
    alternatives: number;
  };
}

export interface HintDef {
  id: string;
  requires?: Requirement;
  /** hint applies while the player has NOT reached this */
  until?: Requirement;
  text: Text;
}

// ═════════════════════════════════════════════════════════════ v2 GAME LAYER

export type Tool = 'torch' | 'uv' | 'dust' | 'camera';

/** Action costs in game minutes (PLAN_V2 §3.1). */
export interface CostTable {
  travel: number;
  closeUp: number;
  tool: number;
  startInterview: number;
  press: number;
  present: number;
  freeQuestion: number;
  wrongDeduction: number;
  hint: number;
  /** raising a topic inside an open interview (not in PLAN_V2's table; 0 by default) */
  openTopic: number;
}

export const DEFAULT_COSTS: CostTable = {
  travel: 30, closeUp: 20, tool: 10, startInterview: 30, press: 15, present: 15, freeQuestion: 15, wrongDeduction: 30, hint: 45, openTopic: 0,
};

export interface CaseV2 {
  clock: ClockDef;
  facts: FactDef[];
  scenes: SceneDef[];
  deductions: DeductionDef[];
  finale: FinaleDef;
  nightEvents?: NightEventDef[];
  /** A scripted perfect playthrough. The validator replays it under the real rules. */
  idealPath: PathStep[];
  /**
   * A sensible first-time player, mistakes included (wrong filings, a wrong present, looking at everything in the
   * first room). The validator replays it and checks the early win: a deduction confirmed within `firstWinBy`
   * game minutes and ~`firstWinRealMinutes` of estimated real time, and at least `minConfirmedDay1` by the end of day 1.
   */
  newcomerPath?: { steps: PathStep[]; firstWinBy: number; firstWinRealMinutes: number; minConfirmedDay1: number };
  /** wave 5: shared investigations (see docs/CONTRACT_V2.md §14) */
  coop?: CoopDef;
}

export interface CoopDef {
  /**
   * Private sources: what one investigator finds here stays in their own notes until they read it out to the team.
   * `locations`: every finding of the zones and details there · `evidence`: these items (and the phrases collected
   * from them). Ignored in solo play and when only one investigator is in the room.
   */
  private?: { locations?: string[]; evidence?: string[] };
  /**
   * Each investigator's share of `minutesPerDay` by team size (default 2: 0.6, 3: 0.42, 4: 0.36, 5: 0.31, 6: 0.27).
   * Smaller than 1/1 per head so a team that moves together does worse than one that splits up.
   */
  share?: Partial<Record<2 | 3 | 4 | 5 | 6, number>>;
}

export interface ClockDef {
  days: number;
  minutesPerDay: number;
  /** wall-clock time the working day starts, "08:00" */
  dayStart: string;
  costs?: Partial<CostTable>;
  /** concurrent lab jobs, default 2 */
  labSlots?: number;
  /** where the investigator stands at the start; null = the station (no scene) */
  startLocationId: string | null;
  /** suspectId → when they can be interviewed. A suspect without an entry is always available. */
  availability?: Record<string, AvailabilityWindow[]>;
}

export interface AvailabilityWindow {
  day: number;
  /** minutes after day start; default 0 */
  from?: number;
  /** minutes after day start; default end of day */
  to?: number;
  /** shown to the player, e.g. "with her lawyer" */
  note?: Text;
}

/** An atomic one-sentence finding. Its sources are declared where it is found. */
export interface FactDef {
  id: string;
  text: Text;
  /** "23:04" — makes the fact a time chip for deduction blanks */
  time?: string;
  /** person / suspect ids this fact is about (UI grouping only) */
  about?: string[];
}

export interface SuspectV2 {
  /** wrong presentations allowed per day, 3–5 (default 4) */
  patience?: number;
}

export interface TopicV2 {
  /** fact / evidence / person ids; the topic can be raised once the player holds any of them. Empty = always. */
  chips?: string[];
  requires?: Requirement;
  /** hidden until a deduction effect unlocks `topic:<suspectId>:<topicId>` */
  locked?: boolean;
}

/** One assertion inside a tier answer. */
export interface ClaimDef {
  id: string;
  text: Text;
  /** facts written into the notebook when the claim is made */
  facts?: string[];
  press?: PressDef;
  breaks?: BreakDef[];
  /**
   * The words of the spoken answer this claim stands for (v2 shows claims as tappable spans inside the answer).
   * Optional: without it the span is found by matching the claim against the answer's sentences.
   */
  anchor?: Text;
}

export interface PressDef {
  /** the suspect's elaboration */
  line: Text;
  facts?: string[];
  evidence?: string[];
  /** pressing moves the topic to this tier (if `requires` is met) */
  toTier?: number;
  requires?: Requirement;
}

export interface BreakDef {
  /** fact or evidence ids that break the claim (any one) */
  by: string[];
  /** tier the topic jumps to; default: the next tier */
  toTier?: number;
  /** the right item, but not enough yet: the claim holds and no patience is lost */
  requires?: Requirement;
  /** said when the requirement is not met */
  resist?: Text;
}

export type ZoneShape =
  | { kind: 'rect'; x: number; y: number; w: number; h: number }
  | { kind: 'circle'; x: number; y: number; r: number }
  | { kind: 'poly'; points: [number, number][] };

export interface SceneDef {
  locationId: string;
  /** art key for the client's layered drawing */
  art?: string;
  zones: ZoneDef[];
}

export interface ZoneDef {
  id: string;
  label: Text;
  shape: ZoneShape;
  /** 'visible' zones are listed; 'uv'/'dust' zones exist only once found by probing with that tool */
  reveal?: 'visible' | 'uv' | 'dust';
  requires?: Requirement;
  /** hidden until a deduction effect unlocks `zone:<id>` */
  locked?: boolean;
  /** v1 hotspot this zone stands for: inspecting marks it examined and reveals its evidence */
  hotspotId?: string;
  closeUp: { text: Text; art?: string };
  /** found by opening the close-up */
  facts?: string[];
  evidence?: string[];
  details: DetailDef[];
}

export interface DetailDef {
  id: string;
  label: Text;
  /** what the player reads once found */
  text?: Text;
  /** position inside the close-up card, 0..1 */
  x: number;
  y: number;
  r?: number;
  /** needs this tool (+tool cost). Without: a free tap. */
  tool?: 'uv' | 'dust' | 'camera';
  facts?: string[];
  evidence?: string[];
}

export type ChipType = 'fact' | 'evidence' | 'person' | 'time' | 'place' | 'choice';

export interface BlankDef {
  id: string;
  type: ChipType;
  /** placeholder, e.g. "who" */
  label?: Text;
  /** only for type 'choice' */
  options?: { id: string; text: Text }[];
  /** any of these fills is right (equivalents) */
  accept: string[];
}

export type DeductionEffect =
  /** 'analysis:<id>' | 'topic:<suspectId>:<topicId>' | 'location:<id>' | 'zone:<id>' | 'deduction:<id>' */
  | { type: 'unlock'; target: string }
  | { type: 'grant'; facts?: string[]; evidence?: string[] };

export interface DeductionDef {
  id: string;
  kind: 'fill' | 'timeline';
  title: Text;
  /** fill: sentence with {blankId} tokens. timeline: instruction. */
  prompt: Text;
  blanks?: BlankDef[];
  /** timeline: the cards to order */
  cards?: { id: string; text: Text; time?: string }[];
  /** timeline: the correct order of the true cards */
  order?: string[];
  /** timeline: the one card that does not fit (a lie) */
  outlier?: string;
  /** becomes visible once met */
  requires?: Requirement;
  locked?: boolean;
  effects?: DeductionEffect[];
  /** shown on the stamp when confirmed */
  confirmText: Text;
  /**
   * Wave 7: shown on the open card while the player cannot fill it yet (some fact/evidence/time blank has nothing in
   * the notebook that would do). Says what kind of thing is still missing, never the answer. Without it the engine's
   * generic line is used.
   */
  notYet?: Text;
}

export type FinaleRoundKind = 'opportunity' | 'lie' | 'motive' | 'means' | 'staging';

export interface FinaleRoundDef {
  id: string;
  kind: FinaleRoundKind;
  /** the accused's defence line */
  defence: Text;
  /** what the player must show */
  prompt: Text;
  /** fact / evidence / deduction ids that win the round */
  accept: string[];
  /** confirmed deductions that make the accepted chips come forward */
  assist?: string[];
  /** lie statements this round exposes when won (the debrief counts them as uncovered) */
  refutes?: string[];
  win: Text;
  lose: Text;
}

export interface FinaleDef {
  /** the prosecutor's meeting before the confrontation */
  intro: Text;
  /** rounds against the true culprit (4–5) */
  rounds: FinaleRoundDef[];
  /** when every round is won */
  confession: { line: Text; statementId?: string };
  /** for every innocent suspect: their defence, then the collapse */
  innocents: Record<string, { defence: Text; collapse: Text }>;
  stars?: {
    /** rounds won at the first try needed for the Proof star (default rounds − 1) */
    proofFirstTry?: number;
    /** share of deductions confirmed needed for the Proof star (default 0.6) */
    proofDeductions?: number;
    /** share of the total budget left needed for the Clock star (default 0.25) */
    clockRemaining?: number;
  };
}

export interface NightEventDef {
  id: string;
  afterDay: number;
  title: Text;
  text: Text;
  requires?: Requirement;
  grants?: { facts?: string[]; evidence?: string[] };
  unlock?: string[];
  /**
   * A fork (wave 4): the night offers a decision instead of only news. Forks are a separate channel from the
   * story events above: after a day, the first matching story event AND the first matching fork both fire.
   * The first option is the default (it settles the fork if the player acts without choosing).
   */
  choice?: { prompt: Text; options: NightOptionDef[] };
}

export interface NightOptionDef {
  id: string;
  label: Text;
  /** what happens, shown before choosing */
  text: Text;
  /** minutes of the next morning it costs */
  minutes?: number;
  grants?: { facts?: string[]; evidence?: string[] };
  unlock?: string[];
  /** a lab analysis started at the beginning of the next day (it takes a slot until ready) */
  lab?: string;
}

export type PathStep =
  | { do: 'travel'; to: string }
  | { do: 'inspect'; zone: string }
  | { do: 'detail'; zone: string; detail: string }
  | { do: 'collect'; evidence: string; fact: string }
  | { do: 'lab'; analysis: string }
  | { do: 'labCollect' }
  | { do: 'interview'; suspect: string }
  | { do: 'leave'; suspect: string }
  | { do: 'topic'; suspect: string; topic: string }
  | { do: 'press'; suspect: string; claim: string }
  | { do: 'present'; suspect: string; claim: string; item: string }
  | { do: 'deduce'; deduction: string; fills?: Record<string, string>; order?: string[]; outlier?: string }
  | { do: 'endDay' }
  /** let time pass: a number of minutes, or until the next lab result / a suspect's hours */
  | { do: 'wait'; minutes?: number; until?: string }
  /** a deliberate mistake (newcomer paths): a filing / present that is expected to fail */
  | { do: 'wrongDeduce'; deduction: string; fills?: Record<string, string>; order?: string[]; outlier?: string }
  | { do: 'wrongPresent'; suspect: string; claim: string; item: string }
  /** answer the night fork offered after the previous day */
  | { do: 'nightChoice'; option: string }
  | { do: 'finale'; accused: string; answers: string[] };
