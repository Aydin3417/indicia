// SERVER-ONLY. Orchestrates registry, store, engine and AI. Server-authoritative: the client
// sends intents (travel, press a claim, file a deduction), never state. Solo and shared investigations use
// the same session; a shared one simply has several members, a room code and a version counter.
import type {
  CaseSummary, ErrorReason, InvestigationView, Profile, Pulse, SessionMode, V2Event, V2Response,
} from '../shared/api.ts';
import type { Locale } from './engine/types.ts';
import { sys, tx, type SysKey } from './engine/i18n.ts';
import * as v2 from './engine/v2/actions.ts';
import type { Ctx as V2Ctx } from './engine/v2/actions.ts';
import { projectV2, refText } from './engine/v2/projection.ts';
import * as team from './engine/v2/team.ts';
import { asPlayer, asPlayerAsync, everyoneDone, refreshBudget, teamOf } from './engine/v2/coop.ts';
import type { IntentKind } from './engine/v2/state.ts';
import { loadRegistry, type LockedCase } from './cases/index.ts';
import { validateCase } from './engine/validate.ts';
import { MAX_PLAYERS, logActivity, newSessionState, normaliseState } from './engine/state.ts';
import { nameOf } from './engine/projection.ts';
import { ActionError } from './engine/actions.ts';
import { classifyQuestion, type GatewayConfig } from './ai/gateway.ts';
import { KeyedMutex, type ProfileRecord, type SessionRecord, type Store } from './store/store.ts';
import { fetchEntitlement, interpretWebhook, safeEqual, type BillingConfig } from './billing.ts';
import { CLIENT_EVENTS, NoopAnalytics, type Analytics, type Props } from './analytics.ts';

export class ServiceError extends Error {
  constructor(
    message: string,
    public code: 'unauthorized' | 'not_found' | 'bad_request' | 'quota' | 'rate_limited' | 'locked' | 'conflict' | 'server',
    public reason?: ErrorReason,
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

/**
 * True for a ServiceError even when it comes from a second copy of this module (an in-process driver that imports
 * the service through another path got HTTP 500 for a plain 409 `phase`; see docs/handoff/O.md).
 */
export function isServiceError(e: unknown): e is ServiceError {
  if (e instanceof ServiceError) return true;
  const x = e as { name?: unknown; code?: unknown } | null;
  return !!x && x.name === 'ServiceError' && typeof x.code === 'string';
}

/** Ranks by the sum of the best stars per case (names: sys rank_0 … rank_5). */
const RANK_STARS = [0, 2, 4, 6, 9, 12];

/** Stars of a closed v2 session (undefined while open). */
const starsOf = (s: SessionRecord): number | undefined => {
  const st = s.state.v2?.finale?.stars;
  return s.state.status === 'closed' && st ? Number(st.truth) + Number(st.proof) + Number(st.clock) : undefined;
};

const DAILY_LIMIT = { free: 80, plus: 400 } as const;
const PER_MINUTE = 12;
/** a member counts as online if they pulsed within this window */
const ONLINE_MS = 12_000;
/** wave 5: a member may take the lead when the lead has not pulsed for this long */
const LEAD_AWAY_MS = 90_000;
const ROOM_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

type Def = LockedCase['def'];

export interface ServiceOptions {
  perMinute: number;
  billing: BillingConfig;
  analytics: Analytics;
  /** USD of AI question routing per user per day; beyond it free questions are routed by keywords */
  aiDailyCap: { free: number; plus: number };
}

const DEFAULTS: ServiceOptions = {
  perMinute: PER_MINUTE,
  billing: { entitlementId: 'plus', allowDevPurchases: false },
  analytics: new NoopAnalytics(),
  aiDailyCap: { free: 0.05, plus: 0.25 },
};

export const effectivePlan = (p: ProfileRecord, now = Date.now()): 'free' | 'plus' => (p.plusUntil && p.plusUntil > now ? 'plus' : 'free');

export class GameService {
  private mutex = new KeyedMutex();
  private recent = new Map<string, number[]>();

  private opts: ServiceOptions;

  constructor(private store: Store, private ai: GatewayConfig, opts: Partial<ServiceOptions> = {}) {
    this.opts = { ...DEFAULTS, ...opts };
  }

  /** Analytics respecting the player's opt-out. Never includes typed text. */
  private async emit(userId: string, event: string, props: Props = {}) {
    const p = await this.store.getProfile(userId);
    if (p?.analyticsOptOut) return;
    this.opts.analytics.track(userId, event, { plan: p ? effectivePlan(p) : 'free', ...props });
  }

  flushAnalytics() {
    return this.opts.analytics.flush();
  }

  private async cases(): Promise<Map<string, LockedCase>> {
    return loadRegistry(validateCase);
  }

  private async locked(caseId: string): Promise<LockedCase> {
    const c = (await this.cases()).get(caseId);
    if (!c) throw new ServiceError('Case not found.', 'not_found');
    return c;
  }

  private async ensureProfile(userId: string) {
    let p = await this.store.getProfile(userId);
    if (!p) {
      p = { userId, displayName: 'Investigator', plan: 'free', createdAt: Date.now() };
      await this.store.saveProfile(p);
    }
    return p;
  }

  async listCases(userId: string, hint?: Locale): Promise<CaseSummary[]> {
    const profile = await this.ensureProfile(userId);
    const locale = profile.locale ?? hint ?? 'en';
    const L = (t: Parameters<typeof tx>[0]) => tx(t, locale);
    const sessions = await this.store.listSessions(userId);
    return [...(await this.cases()).values()].map(({ def, hash }) => {
      const latest = sessions
        .filter((s) => s.caseId === def.id && (s.state.status === 'closed' || s.state.caseHash === hash))
        .sort((a, b) => b.updatedAt - a.updatedAt)[0];
      const best = sessions.filter((s) => s.caseId === def.id).map(starsOf).filter((n): n is number => n !== undefined);
      return {
        id: def.id, title: L(def.meta.title), caseNumber: def.meta.caseNumber, category: L(def.meta.category),
        difficulty: def.meta.difficulty, durationMinutes: def.meta.durationMinutes, tagline: L(def.meta.tagline),
        synopsis: L(def.meta.synopsis), setting: L(def.meta.setting), suspectCount: def.suspects.length, tier: def.meta.tier,
        locked: def.meta.tier === 'plus' && effectivePlan(profile) !== 'plus',
        ...(def.meta.tutorial ? { tutorial: true } : {}),
        crime: def.meta.crime ?? 'murder',
        session: latest ? { id: latest.id, status: latest.state.status, score: latest.state.result?.score, stars: starsOf(latest) } : undefined,
        ...(best.length ? { bestStars: Math.max(...best) } : {}),
      };
    });
  }

  private async newRoomCode(sessionId: string): Promise<string> {
    for (let attempt = 0; attempt < 20; attempt++) {
      const bytes = crypto.getRandomValues(new Uint8Array(6));
      const code = Array.from(bytes, (b) => ROOM_ALPHABET[b % ROOM_ALPHABET.length]).join('');
      if (await this.store.claimRoom(code, sessionId)) return code;
    }
    throw new ServiceError('Could not open a room. Try again.', 'server');
  }

  async startSession(userId: string, caseId: string, restart: boolean, mode: SessionMode = 'solo'): Promise<{ sessionId: string; roomCode?: string }> {
    const profile = await this.ensureProfile(userId);
    const { def, hash } = await this.locked(caseId);
    if (def.meta.tier === 'plus' && effectivePlan(profile) !== 'plus') throw new ServiceError('This case requires Detective Plus.', 'locked');
    if (!restart) {
      // reuse an open investigation of the same kind on the current edition of the case
      const existing = (await this.store.listSessions(userId)).filter(
        (s) => s.caseId === caseId && s.state.status === 'active' && s.state.caseHash === hash && (s.state.mode ?? 'solo') === mode && s.userId === userId,
      );
      if (existing.length) {
        const latest = existing.sort((a, b) => b.updatedAt - a.updatedAt)[0];
        return { sessionId: latest.id, roomCode: latest.state.roomCode };
      }
    }
    const now = Date.now();
    const id = crypto.randomUUID();
    const state = newSessionState(def, hash, now, { id: userId, name: profile.displayName }, mode);
    if (mode === 'coop') {
      state.roomCode = await this.newRoomCode(id);
      logActivity(state, userId, sys('act_open', 'en'), now, 'act_open', []);
    }
    const rec: SessionRecord = { id, userId, members: [userId], caseId, updatedAt: now, lastSeen: now, state };
    await this.store.saveSession(rec);
    await this.store.linkMember(userId, id, 'host');
    await this.emit(userId, 'case_started', { case: caseId, mode, restart });
    return { sessionId: id, roomCode: state.roomCode };
  }

  async joinRoom(userId: string, rawCode: string): Promise<{ sessionId: string }> {
    const code = rawCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const sessionId = code.length === 6 ? await this.store.findRoom(code) : null;
    if (!sessionId) throw new ServiceError('No open room with that code.', 'not_found');
    const profile = await this.ensureProfile(userId);
    return this.mutex.run(sessionId, async () => {
      const rec = await this.store.getSession(sessionId);
      if (!rec) throw new ServiceError('No open room with that code.', 'not_found');
      const st = normaliseState(rec.state, rec.userId);
      rec.members ??= [rec.userId];
      if (rec.members.includes(userId)) return { sessionId };
      if (st.status !== 'active') throw new ServiceError('That investigation is already closed.', 'conflict');
      if (st.roomLocked) throw new ServiceError('The lead investigator has locked this room.', 'locked');
      if (rec.members.length >= MAX_PLAYERS) throw new ServiceError(`This room is full (${MAX_PLAYERS} investigators).`, 'conflict');
      const lc = await this.locked(rec.caseId);
      if (lc.hash !== st.caseHash) throw new ServiceError('That room is on an earlier edition of the case file.', 'conflict');
      const { def } = lc;
      if (def.meta.tier === 'plus' && effectivePlan(profile) !== 'plus') throw new ServiceError('This case requires Detective Plus.', 'locked');
      const now = Date.now();
      rec.members.push(userId);
      st.players[userId] = { name: profile.displayName, role: 'investigator', joinedAt: now };
      // wave 5: a bigger team means a smaller budget each (only while nobody has spent anything today)
      if (st.v2) refreshBudget(def, st);
      logActivity(st, userId, sys('act_join', 'en'), now, 'act_join', []);
      st.version += 1;
      rec.updatedAt = now;
      await this.store.saveSession(rec);
      await this.store.linkMember(userId, sessionId, 'investigator');
      await this.emit(userId, 'room_joined', { case: rec.caseId, players: rec.members.length });
      return { sessionId };
    });
  }

  private async load(userId: string, sessionId: string, readOnly = false) {
    const rec = await this.store.getSession(sessionId);
    rec && (rec.members ??= [rec.userId]);
    if (!rec || !rec.members.includes(userId)) throw new ServiceError('Investigation not found.', 'not_found');
    const ownerName = (await this.store.getProfile(rec.userId))?.displayName;
    normaliseState(rec.state, rec.userId, ownerName);
    // seats follow the players' current names
    for (const id of Object.keys(rec.state.players)) {
      const name = id === rec.userId ? ownerName : (await this.store.getProfile(id))?.displayName;
      if (name) rec.state.players[id].name = name;
    }
    const lc = await this.locked(rec.caseId);
    // a closed case stays readable (its result is stored); an open one may not continue on a changed truth
    if (lc.hash !== rec.state.caseHash && !(readOnly && rec.state.status === 'closed')) {
      throw new ServiceError('This investigation was opened on an earlier edition of the case file and can no longer continue.', 'conflict');
    }
    return { rec, def: lc.def };
  }

  private async online(sessionId: string): Promise<string[]> {
    const seen = await this.store.presence(sessionId);
    const now = Date.now();
    return Object.entries(seen).filter(([, t]) => now - t < ONLINE_MS).map(([id]) => id);
  }

  /** Cheap heartbeat: marks the caller online and tells them whether the shared state changed. */
  async pulse(userId: string, sessionId: string): Promise<Pulse> {
    const rec = await this.store.getSession(sessionId);
    if (!rec || !(rec.members ?? [rec.userId]).includes(userId)) throw new ServiceError('Investigation not found.', 'not_found');
    await this.store.touch(sessionId, userId);
    return { version: rec.state.version ?? 1, online: await this.online(sessionId), status: rec.state.status };
  }

  // ───────────────────────────── room management (host)

  private async roomAction(userId: string, sessionId: string, fn: (rec: SessionRecord) => Promise<[SysKey, string[]]> | [SysKey, string[]]): Promise<{ ok: true }> {
    return this.mutex.run(sessionId, async () => {
      const { rec } = await this.load(userId, sessionId, true);
      if (rec.state.mode !== 'coop') throw new ServiceError('This is a solo investigation.', 'conflict');
      const [key, args] = await fn(rec);
      const now = Date.now();
      logActivity(rec.state, userId, sys(key, 'en', ...args), now, key, args);
      rec.state.version += 1;
      rec.updatedAt = now;
      await this.store.saveSession(rec);
      return { ok: true as const };
    });
  }

  lockRoom(userId: string, sessionId: string, locked: boolean) {
    return this.roomAction(userId, sessionId, (rec) => {
      if (rec.state.hostId !== userId) throw new ServiceError('Only the lead investigator can lock the room.', 'locked', 'not_host');
      rec.state.roomLocked = locked;
      return [locked ? 'act_lock' : 'act_unlock', []];
    });
  }

  removePlayer(userId: string, sessionId: string, targetId: string) {
    return this.roomAction(userId, sessionId, async (rec) => {
      if (rec.state.hostId !== userId) throw new ServiceError('Only the lead investigator can remove someone.', 'locked', 'not_host');
      if (targetId === userId) throw new ServiceError('You lead this room. Close the case instead.', 'conflict');
      if (!rec.members.includes(targetId)) throw new ServiceError('Not in this room.', 'not_found');
      const name = rec.state.players[targetId]?.name ?? 'An investigator';
      await this.memberGone(rec, targetId);
      rec.members = rec.members.filter((m) => m !== targetId);
      delete rec.state.players[targetId];
      await this.store.unlinkMember(targetId, sessionId);
      const { def } = await this.locked(rec.caseId);
      if (rec.state.v2) refreshBudget(def, rec.state);
      await this.endDayIfAllDone(rec, def, userId, [userId], await this.localeFor(userId));
      return ['act_remove', [name]];
    });
  }

  /**
   * Wave 5: a member leaves or is removed — their private notes are read out, the interview they held closes, their
   * intent goes. Nothing they spent is refunded.
   */
  private async memberGone(rec: SessionRecord, userId: string) {
    const st = rec.state;
    if (!st.v2?.team) return;
    const { def } = await this.locked(rec.caseId);
    const shared = team.memberLeaves(def, st, userId, Date.now());
    if (shared > 0) logActivity(st, userId, sys('act_share_left', 'en', String(shared)), Date.now(), 'act_share_left', [String(shared)]);
  }

  async leave(userId: string, sessionId: string): Promise<{ ok: true }> {
    await this.mutex.run(sessionId, async () => {
      const { rec, def } = await this.load(userId, sessionId, true);
      if (rec.state.hostId === userId) {
        // wave 5: the lead may leave a room with others in it; the longest-serving member takes over
        const next = Object.entries(rec.state.players).filter(([id]) => id !== userId).sort((a, b) => a[1].joinedAt - b[1].joinedAt)[0]?.[0];
        if (!next || rec.state.mode !== 'coop') throw new ServiceError('You lead this room. Close the case, or remove the others first.', 'conflict');
        team.handOver(rec.state, next);
        logActivity(rec.state, next, sys('act_handover', 'en'), Date.now(), 'act_handover', []);
      }
      await this.memberGone(rec, userId);
      rec.members = rec.members.filter((m) => m !== userId);
      delete rec.state.players[userId];
      if (rec.state.v2 && rec.state.mode === 'coop') refreshBudget(def, rec.state);
      logActivity(rec.state, userId, sys('act_left', 'en'), Date.now(), 'act_left', []);
      await this.endDayIfAllDone(rec, def, userId, [], await this.localeFor(userId));
      rec.state.version += 1;
      rec.updatedAt = Date.now();
      await this.store.saveSession(rec);
      await this.store.unlinkMember(userId, sessionId);
    });
    return { ok: true };
  }

  private rateLimit(userId: string) {
    const now = Date.now();
    const list = (this.recent.get(userId) ?? []).filter((t) => now - t < 60_000);
    if (list.length >= this.opts.perMinute) throw new ServiceError('Slow down — give the suspect a moment.', 'rate_limited');
    list.push(now);
    this.recent.set(userId, list);
  }

  // ───────────────────────────────────────────────────────────── investigation desk

  /** Content language: the profile setting wins, then the device (Accept-Language), then English. */
  async localeFor(userId: string, hint?: Locale): Promise<Locale> {
    const p = await this.store.getProfile(userId);
    return p?.locale ?? hint ?? 'en';
  }

  async setLocale(userId: string, locale: Locale | null) {
    const p = await this.ensureProfile(userId);
    p.locale = locale ?? undefined;
    await this.store.saveProfile(p);
    return this.profile(userId);
  }

  private projectV2For(def: Def, rec: SessionRecord, userId: string, online: string[], locale: Locale): InvestigationView {
    if (!def.v2 || !rec.state.v2) throw new ServiceError('This case has no v2 investigation.', 'not_found');
    const view = projectV2(def, rec.state, rec.id, userId, online, locale);
    rec.state.v2.seen[userId] = rec.state.v2.seq;
    return view;
  }

  async viewV2(userId: string, sessionId: string, hint?: Locale): Promise<InvestigationView> {
    const locale = await this.localeFor(userId, hint);
    return this.mutex.run(sessionId, async () => {
      const { rec, def } = await this.load(userId, sessionId, true);
      await this.store.touch(sessionId, userId);
      const v = this.projectV2For(def, rec, userId, await this.online(sessionId), locale);
      rec.lastSeen = Date.now();
      await this.store.saveSession(rec);
      return v;
    });
  }

  /**
   * Co-op: the day ends by itself once every playing member is done or out of time. Checked after every action, and
   * (wave 6) when someone leaves or is removed — a lead who leaves a team that is all done used to leave the day open
   * with nobody left who would act.
   */
  private async endDayIfAllDone(rec: SessionRecord, def: Def, userId: string, alsoOnline: string[], locale: Locale) {
    if (rec.state.mode !== 'coop' || !rec.state.v2 || rec.state.v2.phase !== 'investigating') return undefined;
    const online = await this.online(rec.id);
    if (!everyoneDone(def, rec.state, [...online, ...alsoOnline].filter((id) => id in rec.state.players))) return undefined;
    const now = Date.now();
    const day = rec.state.v2.day;
    const host = rec.state.hostId;
    asPlayer(def, rec.state, host, () => v2.endDay({ def, st: rec.state, now, locale, actorId: host }));
    const viewer = rec.state.players[userId] ? userId : host;
    const report = projectV2(def, rec.state, rec.id, viewer, [], locale).reports.find((r) => r.day === day);
    logActivity(rec.state, host, sys('act_day_all', 'en', String(day)), now, 'act_day_all', [String(day)]);
    await this.emit(userId, 'day_ended', { case: rec.caseId, mode: 'coop', day, ended_day: day, auto: true, unused_minutes: report?.unusedMinutes ?? 0 });
    return report;
  }

  private async actV2(
    userId: string,
    sessionId: string,
    hint: Locale | undefined,
    fn: (ctx: V2Ctx, rec: SessionRecord, def: Def) => Promise<V2Event> | V2Event,
    opts: {
      /** co-op activity line: a sys key and args; args like "@loc:id" are named per viewer (see refText) */
      activity?: (e: V2Event, def: Def) => [SysKey, string[]] | null;
      track?: (e: V2Event, rec: SessionRecord) => [string, Props] | null;
    } = {},
  ): Promise<V2Response> {
    const locale = await this.localeFor(userId, hint);
    return this.mutex.run(sessionId, async () => {
      const { rec, def } = await this.load(userId, sessionId);
      if (!def.v2 || !rec.state.v2) throw new ServiceError('This case has no v2 investigation.', 'not_found');
      const now = Date.now();
      const ctx: V2Ctx = { def, st: rec.state, now, locale, actorId: userId };
      let event: V2Event;
      try {
        // co-op (wave 5): the action runs on the actor's own clock and place
        event = await asPlayerAsync(def, rec.state, userId, () => v2.runAsync(ctx, () => fn(ctx, rec, def)));
      } catch (e) {
        if (e instanceof ActionError) throw new ServiceError(e.message, e.code, e.reason as ErrorReason | undefined);
        throw e;
      }
      rec.state.version += 1;
      if (rec.state.mode === 'coop' && event.ok) {
        const a = opts.activity?.(event, def);
        if (a) logActivity(rec.state, userId, sys(a[0], 'en', ...a[1].map((x) => refText(def, x, 'en'))), now, a[0], a[1]);
        // the day ends by itself once every playing member is done or out of time
        if (event.kind !== 'end_day') event.dayEnded = await this.endDayIfAllDone(rec, def, userId, [userId], locale);
      }
      rec.updatedAt = now;
      await this.store.saveSession(rec);
      await this.store.touch(sessionId, userId);
      const t = opts.track?.(event, rec);
      if (t) await this.emit(userId, t[0], { case: rec.caseId, mode: rec.state.mode, day: rec.state.v2.day, cost: event.cost, ...t[1] });
      return { view: this.projectV2For(def, rec, userId, await this.online(sessionId), locale), event };
    });
  }

  travel(userId: string, sessionId: string, locationId: string, hint?: Locale) {
    return this.actV2(userId, sessionId, hint, (ctx) => v2.travel(ctx, locationId), {
      activity: () => ['act_travel', [`@loc:${locationId}`]],
      track: () => ['location_travelled', { location: locationId }],
    });
  }

  inspectZone(userId: string, sessionId: string, zoneId: string, hint?: Locale) {
    return this.actV2(userId, sessionId, hint, (ctx) => v2.inspect(ctx, zoneId), {
      activity: (e) => (e.outcome === 'already' ? null : ['act_inspect', [`@zone:${zoneId}`]]),
      track: (e) => (e.outcome === 'already' ? null : ['zone_inspected', { zone: zoneId, new_facts: e.newFacts?.length ?? 0, new_evidence: e.newEvidence?.length ?? 0 }]),
    });
  }

  probe(userId: string, sessionId: string, locationId: string, tool: 'uv' | 'dust', x: number, y: number, hint?: Locale) {
    return this.actV2(userId, sessionId, hint, (ctx) => v2.probe(ctx, locationId, tool, x, y), {
      activity: (e) => (e.outcome === 'hit' ? ['act_inspect', [`@zone:${e.zoneId}`]] : null),
      track: (e) => ['scene_probed', { location: locationId, tool, hit: e.outcome === 'hit' }],
    });
  }

  inspectDetail(userId: string, sessionId: string, zoneId: string, detailId: string, tool: string | undefined, hint?: Locale) {
    return this.actV2(userId, sessionId, hint, (ctx) => v2.detail(ctx, zoneId, detailId, tool), {
      activity: (e) => (e.outcome === 'already' ? null : ['act_detail', [`@detail:${zoneId}/${detailId}`]]),
      track: (e) => (e.outcome === 'already' ? null : ['detail_found', { zone: zoneId, detail: detailId, tool: tool ?? 'none' }]),
    });
  }

  collectFact(userId: string, sessionId: string, evidenceId: string, key: string, hint?: Locale) {
    return this.actV2(userId, sessionId, hint, (ctx) => v2.collect(ctx, evidenceId, key), {
      activity: (e) => (e.newFacts?.length ? ['act_fact', []] : null),
      track: (e) => (e.newFacts?.length ? ['fact_collected', { source: 'document', evidence: evidenceId }] : null),
    });
  }

  labSubmit(userId: string, sessionId: string, analysisId: string, hint?: Locale) {
    return this.actV2(userId, sessionId, hint, (ctx) => v2.labSubmit(ctx, analysisId), {
      activity: () => ['act_lab', [`@analysis:${analysisId}`]],
      track: () => ['lab_submitted', { analysis: analysisId }],
    });
  }

  labCollect(userId: string, sessionId: string, analysisId: string | undefined, hint?: Locale) {
    return this.actV2(userId, sessionId, hint, (ctx) => v2.labCollect(ctx, analysisId), {
      activity: (e) => (Number(e.outcome) > 0 ? ['act_lab_collect', []] : null),
      track: (e) => (Number(e.outcome) > 0 ? ['lab_collected', { results: Number(e.outcome) }] : null),
    });
  }

  interviewStart(userId: string, sessionId: string, suspectId: string, hint?: Locale) {
    return this.actV2(userId, sessionId, hint, (ctx) => v2.interviewStart(ctx, suspectId), {
      activity: (e, def) => (e.outcome === 'already' ? null : ['act_interview', [nameOf(def, suspectId)]]),
      track: (e) => (e.outcome === 'already' ? null : ['interview_started', { suspect: suspectId }]),
    });
  }

  interviewLeave(userId: string, sessionId: string, suspectId: string, hint?: Locale) {
    return this.actV2(userId, sessionId, hint, (ctx) => v2.interviewLeave(ctx, suspectId));
  }

  openTopic(userId: string, sessionId: string, suspectId: string, topicId: string, hint?: Locale) {
    return this.actV2(userId, sessionId, hint, (ctx) => v2.openTopic(ctx, suspectId, topicId), {
      track: () => ['topic_opened', { suspect: suspectId, topic: topicId }],
    });
  }

  press(userId: string, sessionId: string, suspectId: string, claimId: string, hint?: Locale) {
    return this.actV2(userId, sessionId, hint, (ctx) => v2.press(ctx, suspectId, claimId), {
      track: (e) => ['claim_pressed', { suspect: suspectId, outcome: e.outcome }],
    });
  }

  present(userId: string, sessionId: string, suspectId: string, claimId: string, itemId: string, hint?: Locale) {
    return this.actV2(userId, sessionId, hint, (ctx) => v2.present(ctx, suspectId, claimId, itemId), {
      activity: (e, def) => (e.outcome === 'break' ? ['act_break', [nameOf(def, suspectId)]] : null),
      track: (e) => ['claim_presented', { suspect: suspectId, outcome: e.outcome, patience: e.patience }],
    });
  }

  /** Free-text question: counts towards the daily question allowance like v1 interrogation. */
  async ask(userId: string, sessionId: string, suspectId: string, message: string, hint?: Locale) {
    const text = message.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 400);
    if (!text) throw new ServiceError('Ask something.', 'bad_request', 'bad_fill');
    this.rateLimit(userId);
    const profile = await this.ensureProfile(userId);
    const plan = effectivePlan(profile);
    const day = new Date().toISOString().slice(0, 10);
    if ((await this.store.countQuestions(userId, day)) >= DAILY_LIMIT[plan]) {
      await this.emit(userId, 'quota_reached', { limit: DAILY_LIMIT[plan] });
      throw new ServiceError(sys(plan === 'plus' ? 'quota_plus' : 'quota_free', await this.localeFor(userId, hint)), 'quota', 'quota');
    }
    const overBudget = (await this.store.costToday(userId, day)) >= this.opts.aiDailyCap[plan];
    const ai: GatewayConfig = overBudget ? { ...this.ai, provider: null } : this.ai;
    return this.actV2(userId, sessionId, hint, async (ctx, _rec, def) => {
      const suspect = def.suspects.find((s) => s.id === suspectId);
      if (!suspect) throw new ActionError('Unknown suspect.', 'not_found');
      const logged: Promise<void>[] = [];
      const cls = await classifyQuestion(ai, suspect, text, (u) => { logged.push(this.store.logUsage(userId, sessionId, u).catch(() => undefined)); });
      const e = v2.ask(ctx, suspectId, text, cls);
      await this.store.incrementQuestions(userId, day);
      await Promise.all(logged);
      return e;
    }, { track: (e) => ['free_question', { suspect: suspectId, outcome: e.outcome }] });
  }

  deduce(userId: string, sessionId: string, deductionId: string, filing: v2.DeductionFiling, hint?: Locale) {
    return this.actV2(userId, sessionId, hint, (ctx) => v2.deduce(ctx, deductionId, filing), {
      activity: (e) => (e.outcome === 'confirmed' ? ['act_deduce', []] : null),
      track: (e) => ['deduction_filed', { deduction: deductionId, correct: e.outcome === 'confirmed' }],
    });
  }

  wait(userId: string, sessionId: string, opts: { minutes?: number; until?: string }, hint?: Locale) {
    return this.actV2(userId, sessionId, hint, (ctx) => v2.wait(ctx, opts), {
      track: (e) => ['waited', { minutes: e.cost, until: opts.until === 'lab' ? 'lab' : opts.until ? 'suspect' : 'minutes' }],
    });
  }

  /** Wave 4: answer last night's fork (lead only in co-op). */
  nightChoice(userId: string, sessionId: string, optionId: string, hint?: Locale) {
    return this.actV2(userId, sessionId, hint, (ctx) => v2.nightChoice(ctx, optionId), {
      track: (e) => ['night_choice', { option: optionId, minutes: e.cost }],
    });
  }

  hintV2(userId: string, sessionId: string, hint?: Locale) {
    return this.actV2(userId, sessionId, hint, (ctx) => v2.hint(ctx), {
      activity: (e) => (e.ok ? ['act_hint', []] : null),
      track: (e) => (e.ok ? ['hint_used', { v2: true }] : null),
    });
  }

  endDay(userId: string, sessionId: string, hint?: Locale) {
    return this.actV2(userId, sessionId, hint, (ctx) => {
      const day = ctx.st.v2!.day;
      const e = v2.endDay(ctx);
      e.report = projectV2(ctx.def, ctx.st, sessionId, userId, [], ctx.locale).reports.find((r) => r.day === day);
      return e;
    }, {
      activity: (_e, _def) => ['act_day', [String(_e.report?.day ?? '')]],
      track: (e) => ['day_ended', { ended_day: e.report?.day, unused_minutes: e.report?.unusedMinutes, last: e.outcome === 'last_day' }],
    });
  }

  finaleStart(userId: string, sessionId: string, accusedId: string, hint?: Locale) {
    return this.actV2(userId, sessionId, hint, (ctx) => v2.finaleStart(ctx, accusedId), {
      activity: (_e, def) => ['act_finale', [nameOf(def, accusedId)]],
      track: (e, rec) => ['finale_started', { culprit_correct: rec.state.v2?.finale?.culprit, wrongful: e.outcome === 'wrongful' }],
    });
  }

  finaleAnswer(userId: string, sessionId: string, itemId: string, hint?: Locale) {
    return this.actV2(userId, sessionId, hint, (ctx) => v2.finaleAnswer(ctx, itemId), {
      track: (e, rec) => (e.result
        ? ['finale_finished', { outcome: e.result.outcome, stars: e.result.starCount, rounds_won: e.result.roundsWon, minutes_left: e.result.minutesLeft, players: rec.members.length }]
        : ['finale_round', { outcome: e.outcome }]),
    });
  }

  // ───────────────────────────── co-op team (wave 5): all free, never with typed text in analytics

  intent(userId: string, sessionId: string, kind: IntentKind | null, target: string | undefined, hint?: Locale) {
    return this.actV2(userId, sessionId, hint, (ctx) => team.intent(ctx, kind, target), {
      activity: () => (kind && target ? [`act_intent_${kind}` as SysKey, [kind === 'go' ? `@loc:${target}` : kind === 'lab' ? `@analysis:${target}` : `@sus:${target}`]] : null),
      track: () => ['intent_marked', { kind: kind ?? 'clear' }],
    });
  }

  doneForToday(userId: string, sessionId: string, isDone: boolean, hint?: Locale) {
    return this.actV2(userId, sessionId, hint, (ctx) => team.done(ctx, isDone), {
      activity: () => (isDone ? ['act_done', []] : null),
      track: () => ['done_for_today', { done: isDone }],
    });
  }

  share(userId: string, sessionId: string, itemId: string | undefined, hint?: Locale) {
    return this.actV2(userId, sessionId, hint, (ctx) => team.share(ctx, itemId), {
      activity: (e) => {
        const first = e.newEvidence?.[0] ?? e.newFacts?.[0];
        return first ? ['act_share', [`@item:${first}`]] : null;
      },
      track: (e) => ['notes_shared', { facts: e.newFacts?.length ?? 0, evidence: e.newEvidence?.length ?? 0 }],
    });
  }

  draft(userId: string, sessionId: string, deductionId: string, input: team.DraftInput, hint?: Locale) {
    return this.actV2(userId, sessionId, hint, (ctx) => team.draft(ctx, deductionId, input), {
      activity: () => ['act_draft', [`@ded:${deductionId}`]],
      track: () => ['draft_saved', { deduction: deductionId }],
    });
  }

  clearDraft(userId: string, sessionId: string, deductionId: string, hint?: Locale) {
    return this.actV2(userId, sessionId, hint, (ctx) => team.clearDraft(ctx, deductionId));
  }

  suggest(userId: string, sessionId: string, deductionId: string, blankId: string, value: string, hint?: Locale) {
    return this.actV2(userId, sessionId, hint, (ctx) => team.suggest(ctx, deductionId, blankId, value), {
      activity: () => ['act_suggest', [`@ded:${deductionId}`]],
      track: () => ['draft_suggested', { deduction: deductionId }],
    });
  }

  finaleSuggest(userId: string, sessionId: string, itemId: string, hint?: Locale) {
    return this.actV2(userId, sessionId, hint, (ctx) => team.finaleSuggest(ctx, itemId), {
      activity: () => ['act_finale_suggest', [`@item:${itemId}`]],
      track: () => ['finale_suggested', {}],
    });
  }

  /** The lead hands over to another member. */
  handOver(userId: string, sessionId: string, playerId: string, hint?: Locale) {
    return this.actV2(userId, sessionId, hint, (ctx) => team.handOverTo(ctx, playerId), {
      track: () => ['lead_handed_over', { claimed: false }],
    }).then(async (r) => {
      await this.logAs(sessionId, playerId, 'act_handover');
      return r;
    });
  }

  /** A member takes the lead when the lead has been away (no pulse) for a while. */
  claimLead(userId: string, sessionId: string, hint?: Locale) {
    return this.actV2(userId, sessionId, hint, async (ctx, rec) => {
      if (rec.state.mode !== 'coop' || !teamOf(ctx.def, rec.state)) throw new ActionError(sys('not_member', ctx.locale), 'conflict', 'solo');
      if (rec.state.hostId === userId) return { kind: 'handover', ok: true, cost: 0, outcome: 'already' } as V2Event;
      const seen = (await this.store.presence(sessionId))[rec.state.hostId] ?? 0;
      if (Date.now() - seen < LEAD_AWAY_MS) throw new ActionError(sys('lead_online', ctx.locale), 'conflict', 'not_host');
      team.handOver(rec.state, userId);
      rec.state.v2!.seq += 1;
      return { kind: 'handover', ok: true, cost: 0, outcome: userId } as V2Event;
    }, {
      activity: (e) => (e.outcome === userId ? ['act_handover', []] : null),
      track: () => ['lead_handed_over', { claimed: true }],
    });
  }

  private async logAs(sessionId: string, actorId: string, key: SysKey) {
    await this.mutex.run(sessionId, async () => {
      const rec = await this.store.getSession(sessionId);
      if (!rec) return;
      logActivity(rec.state, actorId, sys(key, 'en'), Date.now(), key, []);
      rec.state.version += 1;
      await this.store.saveSession(rec);
    });
  }

  // ───────────────────────────── profile

  async profile(userId: string, hint?: Locale): Promise<Profile> {
    const p = await this.ensureProfile(userId);
    const sessions = await this.store.listSessions(userId);
    const reg = await this.cases();
    const closed = sessions.filter((s) => s.state.status === 'closed' && s.state.result);
    const correct = closed.filter((s) => s.state.result!.culpritCorrect);
    const bestByCase = new Map<string, number>();
    for (const s of sessions) {
      const n = starsOf(s);
      if (n !== undefined) bestByCase.set(s.caseId, Math.max(bestByCase.get(s.caseId) ?? 0, n));
    }
    const stars = [...bestByCase.values()].reduce((a, b) => a + b, 0);
    const rankIdx = RANK_STARS.reduce((idx, need, i) => (stars >= need ? i : idx), 0);
    const locale = p.locale ?? hint ?? 'en';
    const rankName = (i: number) => sys(`rank_${i}` as SysKey, locale);
    const day = new Date().toISOString().slice(0, 10);
    const scores = closed.map((s) => s.state.result!.score);
    return {
      userId,
      displayName: p.displayName,
      plan: effectivePlan(p),
      plusUntil: effectivePlan(p) === 'plus' ? p.plusUntil ?? undefined : undefined,
      analyticsOptOut: !!p.analyticsOptOut,
      locale: p.locale,
      billing: { storeVerification: !!this.opts.billing.revenueCatSecret, devPurchases: this.opts.billing.allowDevPurchases },
      rank: rankName(rankIdx),
      nextRank: RANK_STARS[rankIdx + 1] !== undefined ? { name: rankName(rankIdx + 1), needed: RANK_STARS[rankIdx + 1] - stars } : undefined,
      stars,
      stats: {
        casesClosed: closed.length,
        correctAccusations: correct.length,
        averageScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
        bestScore: scores.length ? Math.max(...scores) : 0,
        questionsAsked: sessions.reduce((n, s) => n + (s.state.v2?.log ?? []).filter((e) => e.from === 'player' && e.action === 'ask' && (e.actorId ?? s.userId) === userId).length, 0),
      },
      usage: {
        questionsToday: await this.store.countQuestions(userId, day),
        dailyLimit: DAILY_LIMIT[effectivePlan(p)],
        aiPhrasingToday: !!this.ai.provider && (await this.store.costToday(userId, day)) < this.opts.aiDailyCap[effectivePlan(p)],
      },
      history: sessions
        // an open investigation on an earlier edition of its case can never be continued: leave it out
        .filter((s) => s.state.status === 'closed' || !reg.get(s.caseId) || reg.get(s.caseId)!.hash === s.state.caseHash)
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .map((s) => ({
          sessionId: s.id, caseId: s.caseId, title: tx(reg.get(s.caseId)?.def.meta.title ?? s.caseId, locale), status: s.state.status,
          score: s.state.result?.score, stars: starsOf(s), rating: s.state.result?.rating, at: s.updatedAt,
        })),
    };
  }

  // ───────────────────────────── billing

  private async setPlusUntil(userId: string, until: number | null) {
    const p = await this.ensureProfile(userId);
    const was = effectivePlan(p);
    p.plusUntil = until;
    p.plan = effectivePlan(p);
    await this.store.saveProfile(p);
    return { was, now: p.plan };
  }

  /** After a purchase or restore the app asks us to re-check. We ask the store, not the app. */
  async syncEntitlement(userId: string, opts: { devGrant?: boolean } = {}) {
    const b = this.opts.billing;
    if (b.revenueCatSecret) {
      let check;
      try {
        check = await fetchEntitlement(b, userId);
      } catch {
        throw new ServiceError('Could not reach the store to confirm your purchase. Try Restore in a moment.', 'server');
      }
      const r = await this.setPlusUntil(userId, check.active ? check.until : null);
      if (r.was !== r.now) await this.emit(userId, r.now === 'plus' ? 'purchase_verified' : 'plus_ended', { product: check.productId, via: 'sync' });
      return this.profile(userId);
    }
    if (b.allowDevPurchases && opts.devGrant) {
      const r = await this.setPlusUntil(userId, Date.now() + 30 * 24 * 3600_000);
      if (r.was !== r.now) await this.emit(userId, 'purchase_verified', { product: 'dev_test', via: 'dev' });
      return this.profile(userId);
    }
    throw new ServiceError('Purchases are not available in this build.', 'bad_request');
  }

  /** Development only: drop back to the free plan to test limits and the paywall again. */
  async devResetPlan(userId: string) {
    if (!this.opts.billing.allowDevPurchases) throw new ServiceError('Not available.', 'not_found');
    await this.setPlusUntil(userId, null);
    return this.profile(userId);
  }

  /** RevenueCat to us. Returns false when the request is not authentic. */
  async handleRevenueCatWebhook(authorization: string | undefined, body: unknown): Promise<boolean> {
    const secret = this.opts.billing.webhookAuth;
    const strip = (v: string) => v.replace(/^Bearer\s+/i, '');
    if (!secret || !authorization || !safeEqual(strip(authorization), strip(secret))) return false;
    const outcome = interpretWebhook(this.opts.billing, body);
    if (!outcome) return true;
    const r = await this.setPlusUntil(outcome.userId, outcome.until);
    await this.emit(outcome.userId, outcome.until === null ? 'plus_ended' : 'subscription_event', { type: outcome.type, product: outcome.productId, changed: r.was !== r.now });
    return true;
  }

  async setAnalyticsOptOut(userId: string, optOut: boolean) {
    const p = await this.ensureProfile(userId);
    if (optOut && !p.analyticsOptOut) await this.emit(userId, 'analytics_opted_out');
    p.analyticsOptOut = optOut;
    await this.store.saveProfile(p);
    return this.profile(userId);
  }

  /** A short allow-list of events only the app can observe. */
  async clientEvent(userId: string, name: string, props: Record<string, unknown> = {}) {
    if (!CLIENT_EVENTS.has(name)) throw new ServiceError('Unknown event.', 'bad_request');
    const clean: Props = {};
    for (const [k, v] of Object.entries(props).slice(0, 8)) {
      if (!/^[a-z_]{1,32}$/.test(k)) continue;
      if (typeof v === 'number' || typeof v === 'boolean') clean[k] = v;
      else if (typeof v === 'string') clean[k] = v.slice(0, 48);
    }
    await this.emit(userId, name, clean);
    return { ok: true as const };
  }

  async rename(userId: string, displayName: string) {
    const p = await this.ensureProfile(userId);
    p.displayName = displayName.trim().slice(0, 40) || 'Investigator';
    await this.store.saveProfile(p);
    return this.profile(userId);
  }
}
