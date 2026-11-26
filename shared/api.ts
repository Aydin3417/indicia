// Contracts shared by client and server. MUST NOT contain case truth.

export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type EvidenceKind =
  | 'physical' | 'document' | 'digital' | 'forensic' | 'testimony' | 'financial' | 'footage' | 'photo';
export type Emotion = 'calm' | 'guarded' | 'irritated' | 'anxious' | 'distressed' | 'hostile' | 'resigned' | 'grieving';
export type Composure = 'composed' | 'uneasy' | 'strained' | 'breaking';
/** wave 4: the kind of crime a case is about (default 'murder') */
export type CrimeKind = 'murder' | 'theft';

export interface CaseSummary {
  id: string;
  title: string;
  caseNumber: string;
  category: string;
  difficulty: Difficulty;
  durationMinutes: [number, number];
  tagline: string;
  synopsis: string;
  setting: string;
  suspectCount: number;
  tier: 'free' | 'plus';
  locked: boolean;
  /** the teaching case the app opens on first launch */
  tutorial?: boolean;
  /** what kind of case this is (wave 4): pick case-fitting words ("thief" vs "killer", "the key" vs "the weapon") */
  crime?: CrimeKind;
  /** player's latest session on this case, if any (stars once a v2 case is closed) */
  session?: { id: string; status: SessionStatus; score?: number; stars?: number };
  /** best star count over all closed sessions of this case (0â€“3) */
  bestStars?: number;
}

export type SessionStatus = 'active' | 'closed';

export type PlanShape =
  | { t: 'wall'; x1: number; y1: number; x2: number; y2: number }
  | { t: 'rect'; x: number; y: number; w: number; h: number; label?: string; dashed?: boolean }
  | { t: 'door'; x: number; y: number; r: number; angle: number }
  | { t: 'body'; x: number; y: number; angle: number }
  | { t: 'text'; x: number; y: number; text: string };

export interface BriefingView {
  issuedBy: string;
  date: string;
  location: string;
  victim: PersonView & { summary: string };
  incidentReport: string[];
  preliminaryFindings: string[];
  knownWitnesses: PersonView[];
  objectives: string[];
}

export interface PersonView {
  id: string;
  name: string;
  role: string;
  description: string;
}

export interface RoomPlayer {
  id: string;
  name: string;
  role: 'host' | 'investigator';
  online: boolean;
}

export interface RoomView {
  code: string;
  hostId: string;
  isHost: boolean;
  locked: boolean;
  maxPlayers: number;
  players: RoomPlayer[];
  activity: { at: number; actor: string; text: string }[];
}

export interface Pulse {
  version: number;
  online: string[];
  status: SessionStatus;
}

export interface ScoreLine {
  key: string;
  label: string;
  points: number;
  max: number;
  verdict: 'correct' | 'partial' | 'wrong';
  feedback: string;
}

export interface CaseResult {
  score: number;
  rating: string;
  ratingDetail: string;
  culpritCorrect: boolean;
  lines: ScoreLine[];
  penalties: { label: string; points: number }[];
  debrief: {
    killerName: string;
    narrative: string[];
    decisiveFound: { id: string; name: string }[];
    decisiveMissed: { id: string; name: string }[];
    liesUncovered: { speaker: string; text: string }[];
    liesMissed: { speaker: string; text: string }[];
    contradictionsProven: number;
    contradictionsTotal: number;
    durationMinutes: number;
  };
}

export type SessionMode = 'solo' | 'coop';

export interface Profile {
  userId: string;
  displayName: string;
  plan: 'free' | 'plus';
  /** Plus access ends at this time (ms); absent when on the free plan */
  plusUntil?: number;
  analyticsOptOut: boolean;
  billing: {
    /** the server can verify purchases with the store */
    storeVerification: boolean;
    /** development build: no-charge test purchases are allowed */
    devPurchases: boolean;
  };
  /** localised rank name; rank grows with the best stars per case */
  rank: string;
  /** stars still needed for the next rank */
  nextRank?: { name: string; needed: number };
  /** sum of the best star count per case */
  stars: number;
  stats: {
    casesClosed: number;
    correctAccusations: number;
    averageScore: number;
    bestScore: number;
    questionsAsked: number;
  };
  usage: { questionsToday: number; dailyLimit: number; aiPhrasingToday: boolean };
  /** v2: the player's chosen content language; absent = follow the device (Accept-Language) */
  locale?: Locale;
  history: { sessionId: string; caseId: string; title: string; status: SessionStatus; score?: number; stars?: number; rating?: string; at: number }[];
}

export interface ApiError {
  error: string;
  code: 'unauthorized' | 'not_found' | 'bad_request' | 'quota' | 'rate_limited' | 'locked' | 'conflict' | 'server';
  /** v2: a machine-readable detail for the UI (see ErrorReason) */
  reason?: ErrorReason;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• v2 â€” investigation desk
// Everything below is additive. See docs/CONTRACT_V2.md for endpoint and state-machine details.
// Every string in these views is already in the requested language (en | tr).

export type Locale = 'en' | 'tr';
export type Tool = 'torch' | 'uv' | 'dust' | 'camera';
export type ChipType = 'fact' | 'evidence' | 'person' | 'time' | 'place' | 'choice';
export type FinaleRoundKind = 'opportunity' | 'lie' | 'motive' | 'means' | 'staging';

/** Machine-readable error detail (ApiError.reason). */
export type ErrorReason =
  | 'no_time' | 'not_here' | 'unavailable' | 'refused' | 'not_open' | 'lab_full' | 'phase' | 'not_host'
  | 'claim_closed' | 'not_owned' | 'locked' | 'already' | 'needs_tool' | 'bad_fill'
  /** v2.1: pressing would yield nothing / needs more first · nothing to wait for · no more late guesses */
  | 'nothing_to_press' | 'press_later' | 'wait_nothing' | 'late_limit'
  /** wave 4: night-choice with no fork waiting */
  | 'no_fork'
  /** wave 5 (co-op): still only in your private notes (read it out first) · someone else holds that interview */
  | 'private' | 'held'
  /** daily free-question allowance used (HTTP 402): open the paywall */
  | 'quota';

/** Game minutes per action. Lab work is free but delayed. */
export interface CostTableView {
  travel: number;
  closeUp: number;
  tool: number;
  startInterview: number;
  press: number;
  present: number;
  freeQuestion: number;
  wrongDeduction: number;
  hint: number;
  openTopic: number;
}

export interface GameTime {
  day: number;
  /** minutes after the day started */
  minute: number;
  /** wall clock, "14:30" */
  label: string;
}

export interface ClockView {
  day: number;
  days: number;
  minute: number;
  minutesPerDay: number;
  remainingToday: number;
  /** wall clock now, "14:30" */
  timeLabel: string;
  dayStart: string;
  dayEnd: string;
  /** days Ã— minutesPerDay */
  totalBudget: number;
  /** minutes spent on actions so far */
  spent: number;
  /** (day âˆ’ 1) Ã— minutesPerDay + minute; an ended day counts in full */
  elapsed: number;
  costs: CostTableView;
  lastDay: boolean;
  /** true when nothing costing time fits any more today: suggest ending the day */
  dayOver: boolean;
  /** the Clock star made legible: reach the prosecutor by `by` (= finish with minutesLeftNeeded left) */
  /**
   * `by` is the latest moment that still earns the star. Co-op (wave 6): the star is counted in work time (each
   * investigator's budget), not on the wall clock, so `work` carries the minutes of that day's work by the busiest
   * investigator ("day 3, within 1 h 12 min of work"); `by.label` then is only nominal.
   */
  clockStar: { minutesLeftNeeded: number; share: number; by: GameTime; work?: number; state: 'open' | 'lost' | 'won' };
  /** POST /v2/wait options while investigating: minutes until the next lab result / a suspect's hours today */
  waits?: { lab?: number; suspects: { id: string; minutes: number }[]; min: number; max: number };
  /**
   * wave 5, co-op only: your own budget. `perPlayer` minutes per investigator per day (set by the team size), `used`
   * today. `remainingToday` already counts it. In co-op, `totalBudget`/`elapsed` are counted in one investigator's
   * budget (days × perPlayer; the busiest member today).
   */
  budget?: { perPlayer: number; used: number; teamSize: number };
}

export interface PlaceView {
  id: string;
  name: string;
  summary: string;
  here: boolean;
  /** 0 when already here */
  travelCost: number;
  hasScene: boolean;
  /** visible zones not yet inspected (hidden ones are never counted) */
  zonesLeft: number;
  /** wave 5, co-op: teammates standing here or heading here (never you) */
  team?: TeammateMark[];
  /** wave 5, co-op: what one investigator finds here stays in their own notes until read out */
  private?: boolean;
}

/** wave 5: a teammate shown on a place / person / lab item. */
export interface TeammateMark {
  id: string;
  name: string;
  /** place: here | heading · suspect: questioning | heading · lab: waiting */
  status: 'here' | 'heading' | 'questioning' | 'waiting';
}

export type ZoneShapeView =
  | { kind: 'rect'; x: number; y: number; w: number; h: number }
  | { kind: 'circle'; x: number; y: number; r: number }
  | { kind: 'poly'; points: [number, number][] };

export interface DetailView {
  id: string;
  /** position in the close-up card, 0..1 */
  x: number;
  y: number;
  r: number;
  /** tool needed (costs clock.costs.tool); absent = free tap */
  tool?: 'uv' | 'dust' | 'camera';
  found: boolean;
  /** only once found */
  label?: string;
  text?: string;
  newFacts?: string[];
  newEvidence?: string[];
}

export interface ZoneView {
  id: string;
  label: string;
  shape: ZoneShapeView;
  /** how the zone was found: 'visible' zones are always listed; 'uv' / 'dust' ones only after a hit */
  reveal: 'visible' | 'uv' | 'dust';
  inspected: boolean;
  /** present once inspected */
  closeUp?: { text: string; art?: string; details: DetailView[] };
}

export interface SceneView {
  locationId: string;
  name: string;
  art?: string;
  /** v1 architectural sketch, for a fallback drawing */
  plan: PlanShape[];
  zones: ZoneView[];
  /** tools that can find hidden things here (always ['uv', 'dust']; camera is used on details) */
  probeTools: ('uv' | 'dust')[];
}

/** A run of document text. Tappable when `key` is set: POST /v2/collect { evidenceId, key }. */
export interface Segment {
  text: string;
  key?: string;
  /** 'underline' = shown as important; 'plain' = tappable but not marked (the player has to notice) */
  mark?: 'underline' | 'plain';
  /** fact id, only once collected */
  factId?: string;
  collected?: boolean;
}

export interface LabOptionView {
  id: string;
  name: string;
  discipline: string;
  /** game minutes from submission to result */
  minutes: number;
  status: 'available' | 'locked' | 'running' | 'ready' | 'done';
  lockedReason?: string;
  readyAt?: GameTime;
  result?: string[];
  conclusion?: string;
}

export interface EvidenceV2View {
  id: string;
  code: string;
  name: string;
  kind: EvidenceKind;
  description: string;
  /** document lines, split into segments (some tappable) */
  body?: Segment[][];
  foundAt: string;
  reliability: string;
  locationName?: string;
  relatedPeople: { id: string; name: string }[];
  found: GameTime;
  isNew: boolean;
  analyses: LabOptionView[];
  /** wave 5, co-op: only in your own notes — the team cannot see or use it until you read it out (POST /v2/share) */
  private?: boolean;
}

export interface FactView {
  id: string;
  text: string;
  time?: string;
  about: string[];
  source: { type: 'start' | 'document' | 'scene' | 'claim' | 'press' | 'lab' | 'deduction' | 'night'; ref?: string; label: string };
  found: GameTime;
  isNew: boolean;
  /** wave 5, co-op: only in your own notes (see EvidenceV2View.private) */
  private?: boolean;
}

export interface LabJobView {
  analysisId: string;
  evidenceId: string;
  name: string;
  status: 'running' | 'ready' | 'collected';
  submitted: GameTime;
  readyAt: GameTime;
  /** game minutes until ready (0 when ready) */
  minutesLeft: number;
}

export interface LabView {
  slots: number;
  running: number;
  ready: number;
  /** the next running job to finish (may be after tonight), for the top strip */
  nextReady?: GameTime & { minutesLeft: number; name: string };
  jobs: LabJobView[];
}

export interface ClaimView {
  id: string;
  text: string;
  /** active: can be pressed / broken now; broken: you broke it; superseded: the suspect moved past it */
  status: 'active' | 'broken' | 'superseded';
  pressed: boolean;
  /** pressing is possible now (press is 'yes' or 'free') */
  canPress: boolean;
  /**
   * what a press would do, known before spending: yes = yields a finding (costs pressCost) · free = only their
   * colour, no finding (costs nothing) · later = something is behind it, know more first · none = nothing · done = pressed
   */
  press: 'yes' | 'free' | 'later' | 'none' | 'done';
  pressCost: number;
}

export interface TopicV2View {
  id: string;
  label: string;
  state: 'available' | 'open';
  tier: number;
  claims: ClaimView[];
}

export interface InterviewLineView {
  seq: number;
  at: GameTime;
  from: 'player' | 'suspect' | 'system';
  text: string;
  emotion?: Emotion;
  /** what the player did */
  action?: 'topic' | 'press' | 'present' | 'ask' | 'start' | 'leave';
  claimId?: string;
  itemId?: string;
  outcome?: string;
  authorName?: string;
  /** a suspect's answer: its claims as spans of `text` ([start, end) offsets) */
  claims?: { claimId: string; start: number; end: number }[];
  /** claims of this answer that are not a span of its words (show them as short quotes under it) */
  looseClaims?: string[];
}

export interface SuspectV2View {
  id: string;
  name: string;
  age: number;
  occupation: string;
  relationship: string;
  publicProfile: string;
  initials: string;
  portraitTone: string;
  composure: Composure;
  /** 0..100: how far the suspect's composure has worn (moves on every breakthrough) */
  pressure: number;
  /** can an interview start right now */
  availableNow: boolean;
  availability: { day: number; from: string; to: string; note?: string }[];
  interview: {
    open: boolean;
    patience: number;
    maxPatience: number;
    /** patience ran out today: no more interviews until tomorrow */
    refusedToday: boolean;
    /** wave 5, co-op: who holds the open interview (only they can ask; the others follow the log) */
    heldBy?: { id: string; name: string; you: boolean };
  };
  /** wave 5, co-op: teammates questioning or about to question this person (never you) */
  team?: TeammateMark[];
  topics: TopicV2View[];
  log: InterviewLineView[];
}

export interface DeductionBlankView {
  id: string;
  type: ChipType;
  label?: string;
  /** only for type 'choice' */
  options?: { id: string; text: string }[];
  /** only once confirmed: the fill that was accepted */
  filled?: string;
}

export interface DeductionView {
  id: string;
  kind: 'fill' | 'timeline';
  title: string;
  /** fill: sentence with {blankId} tokens; timeline: instruction */
  prompt: string;
  status: 'open' | 'confirmed';
  attempts: number;
  blanks?: DeductionBlankView[];
  /** timeline cards: a stable shuffle (hash of case + card id) while open; the solution order once confirmed */
  cards?: { id: string; text: string; time?: string }[];
  /** confirmed timeline: the card that was set aside as not fitting */
  setAside?: string;
  /** whether the timeline expects one card set aside as not fitting */
  hasOutlier?: boolean;
  confirmText?: string;
  isNew: boolean;
  /** after two wrong filings: which blank to look at again (never the answer) */
  nudge?: string;
  /** after the last day: wrong filings still allowed for this question */
  triesLeft?: number;
  /** wave 5, co-op: the team's pencilled-in answer (not filed) and teammates' suggestions */
  draft?: DeductionDraftView;
}

/** wave 5: a shared, unfiled deduction draft. Filing stays POST /v2/deduce (anyone may file; a wrong filing costs the filer). */
export interface DeductionDraftView {
  /** blank → value (+ a label to show) */
  fills: { blankId: string; value: string; label: string }[];
  /** timeline: card order and the card set aside */
  order?: string[];
  outlier?: string;
  by: { id: string; name: string; you: boolean };
  suggestions: { by: { id: string; name: string; you: boolean }; blankId: string; value: string; label: string }[];
}

export interface ChipView {
  type: ChipType;
  id: string;
  label: string;
}

export interface DayReportView {
  day: number;
  facts: { id: string; text: string }[];
  evidence: { id: string; name: string }[];
  deductionsConfirmed: { id: string; title: string }[];
  deductionsOpened: { id: string; title: string }[];
  labsReady: { analysisId: string; name: string }[];
  labsRunning: { analysisId: string; name: string; readyAt: GameTime }[];
  unusedMinutes: number;
  /** `id` (wave 5): the night event's id, for art lookups */
  night?: { id?: string; title: string; text: string; newFacts: string[]; newEvidence: string[] };
  /** wave 4: a night fork offered after this day (see InvestigationView.fork while it is still open) */
  fork?: NightForkView;
}

/**
 * Wave 4: a decision the night puts in front of the player (e.g. chase something tonight and start late, or hand it
 * to the lab and lose a slot). Offered after `end-day`; answered with `POST …/v2/night-choice { optionId }` before
 * anything else the next morning. Any other action first settles it with the first option (`defaultOption`).
 */
export interface NightForkView {
  id: string;
  title: string;
  text: string;
  /** the question, e.g. "Seize the car tonight?" */
  prompt: string;
  options: {
    id: string;
    label: string;
    /** what happens if chosen (shown before choosing) */
    text: string;
    /** morning minutes it costs (0 = none) */
    minutes: number;
    /** a lab job it starts at the beginning of the day (takes one of the two slots until ready) */
    lab?: { analysisId: string; name: string; minutes: number };
  }[];
  defaultOption: string;
  /** the option taken, once settled */
  chosen?: string;
  pending: boolean;
  /** what the chosen option gave (facts / evidence ids) */
  newFacts: string[];
  newEvidence: string[];
}

export interface FinaleRoundView {
  id: string;
  kind: FinaleRoundKind;
  defence: string;
  prompt: string;
  status: 'pending' | 'current' | 'won' | 'lost';
  triesLeft: number;
  firstTry?: boolean;
  /** chips brought forward because a linked deduction was confirmed */
  suggested: string[];
  /** the accused's reaction once decided */
  reaction?: string;
}

export interface V2Result {
  outcome: 'confession' | 'charged' | 'weak' | 'wrongful';
  title: string;
  detail: string;
  accusedId: string;
  culpritCorrect: boolean;
  stars: { truth: boolean; proof: boolean; clock: boolean };
  starCount: number;
  roundsWon: number;
  roundsTotal: number;
  firstTry: number;
  deductionsConfirmed: number;
  deductionsTotal: number;
  minutesLeft: number;
  /** wave 4: what the Proof star needed (rounds won at the first try, deductions confirmed) */
  proofNeeds?: { firstTry: number; deductions: number };
  /** wave 4: the case's crime (verdict and debrief wording) */
  crime?: CrimeKind;
  debrief: CaseResult['debrief'];
}

export interface FinaleView {
  accusedId: string;
  accusedName: string;
  status: 'running' | 'done';
  intro: string;
  roundIndex: number;
  rounds: FinaleRoundView[];
  /** wrong accused: their defence, then the collapse */
  collapse?: { defence: string; text: string };
  confession?: string;
  /** wave 5, co-op: what teammates suggest for the current round (POST /v2/finale/suggest), newest last */
  suggestions?: { by: { id: string; name: string; you: boolean }; itemId: string; label: string }[];
}

export interface InvestigationView {
  sessionId: string;
  status: SessionStatus;
  version: number;
  mode: SessionMode;
  you: string;
  room?: RoomView;
  locale: Locale;
  startedAt: number;
  /**
   * investigating: normal play Â· awaiting_finale: the last day ended, only POST /v2/finale is allowed Â·
   * finale: the confrontation is running Â· closed: result available
   */
  phase: 'investigating' | 'awaiting_finale' | 'finale' | 'closed';
  case: { id: string; title: string; caseNumber: string; tagline: string; difficulty: Difficulty; setting: string; tutorial?: boolean; crime?: CrimeKind };
  /** wave 4: the night fork waiting for an answer (only while pending) */
  fork?: NightForkView;
  /** wave 4: the Proof star made legible — how many deductions and first-try rounds it needs */
  proofStar?: { deductionsNeeded: number; deductionsConfirmed: number; deductionsTotal: number; firstTryNeeded: number; roundsTotal: number };
  briefing: BriefingView;
  clock: ClockView;
  map: { current: string | null; currentName: string; places: PlaceView[] };
  scenes: SceneView[];
  notebook: { facts: FactView[]; evidence: EvidenceV2View[] };
  lab: LabView;
  people: PersonView[];
  suspects: SuspectV2View[];
  deductions: DeductionView[];
  /** how many questions the case has in all (hidden ones included; a number only) */
  deductionsTotal: number;
  /** everything the player can drop into a blank or present, grouped */
  chips: { facts: ChipView[]; evidence: ChipView[]; people: ChipView[]; times: ChipView[]; places: ChipView[]; deductions: ChipView[] };
  hints: { used: string[]; available: boolean; cost: number };
  reports: DayReportView[];
  finale?: FinaleView;
  /** who can be accused */
  accusable: { id: string; name: string }[];
  /** the prosecutor's meeting text, shown before choosing whom to accuse */
  finaleIntro: string;
  result?: V2Result;
  /** wave 5: the co-op team (absent in solo) */
  team?: TeamView;
}

/** wave 5: per-player clocks, places, intents and private notes of a shared investigation. */
export interface TeamView {
  /** minutes each investigator has per day (by team size) */
  perPlayer: number;
  teamSize: number;
  /** the day ends when the lead ends it, or by itself once every playing member is done or out of time */
  members: TeamMemberView[];
}

export interface TeamMemberView {
  id: string;
  name: string;
  isLead: boolean;
  isYou: boolean;
  online: boolean;
  location: string | null;
  locationName: string;
  /** their own clock */
  timeLabel: string;
  used: number;
  remaining: number;
  /** pressed "done for today" or out of time */
  done: boolean;
  intent?: { kind: 'go' | 'interview' | 'lab'; target: string; label: string };
  /** the interview they hold, if any */
  questioning?: { id: string; name: string };
  /** how many items they hold privately (never what) */
  privateNotes: number;
}

export type V2EventKind =
  | 'travel' | 'inspect' | 'probe' | 'detail' | 'collect' | 'lab_submit' | 'lab_collect'
  | 'interview_start' | 'interview_leave' | 'topic' | 'press' | 'present' | 'ask'
  | 'deduce' | 'hint' | 'end_day' | 'finale_start' | 'finale_answer' | 'wait' | 'night_choice'
  /** wave 5 (co-op, all free) */
  | 'intent' | 'done' | 'share' | 'draft' | 'suggest' | 'finale_suggest' | 'handover';

export interface SpokenLine {
  speakerId: string;
  speakerName: string;
  text: string;
  emotion?: Emotion;
}

export interface V2Event {
  kind: V2EventKind;
  ok: boolean;
  /** game minutes charged */
  cost: number;
  message?: string;
  /**
   * probe: hit | miss Â· press: detail | advance | nothing Â· present: break | resist | wrong | ended Â·
   * ask: opened | repeat | deflect Â· deduce: confirmed | wrong Â· finale_answer: won | retry | lost Â·
   * finale_start / finale_answer (last): confession | charged | weak | wrongful
   */
  outcome?: string;
  line?: SpokenLine;
  newFacts?: string[];
  newEvidence?: string[];
  newClaims?: string[];
  /** deductions that became visible */
  newDeductions?: string[];
  /** lab jobs that finished during the time this action took */
  labReady?: string[];
  /** human-readable list of what a confirmed deduction / night event opened */
  unlocked?: { kind: 'analysis' | 'topic' | 'location' | 'zone' | 'deduction'; id: string; label: string }[];
  patience?: number;
  /** present → break: composure before and after (a break always shows) */
  composure?: { from: Composure; to: Composure };
  /** press / present: the claim acted on */
  claimId?: string;
  zoneId?: string;
  detailId?: string;
  report?: DayReportView;
  result?: V2Result;
  /** wave 5, co-op: the day ended by itself after this action (everyone done); the report of the day that closed */
  dayEnded?: DayReportView;
}

export interface V2Response {
  view: InvestigationView;
  event: V2Event;
}
