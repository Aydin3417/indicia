// v2 investigation desk store: holds the InvestigationView, runs every action through `act(path, body)`,
// replaces the view from each response, keeps the last event for feedback, surfaces refusals by `reason`,
// and keeps co-op rooms in step (pulse → refetch).
import { create } from 'zustand';
import { router } from 'expo-router';
import type { ApiError, ErrorReason, InvestigationView, V2Event, V2Response } from '../../shared/api';
import { api, ApiFailure, v2 } from '../api/client';
import { onLocaleChange, t } from '../i18n';
import { feelEvent } from '../feel';
import { toast } from './toasts';

export interface DeskError {
  message: string;
  code: ApiError['code'] | 'network';
  reason?: ErrorReason;
  path: string;
  at: number;
}

/** How a mounted screen wants feedback: shell screens get everything; feature screens do their own haptics. */
export interface ActPolicy {
  /** toast refusals (true when the caller receives only null and cannot show the reason itself) */
  toastErrors?: boolean;
  /** haptics from the feel layer (false when the screen plays its own) */
  haptics?: boolean;
  /** toast new facts / evidence (false inside screens that animate them themselves) */
  toastFinds?: boolean;
}

export type ActOutcome = { ok: V2Response } | { fail: ApiFailure };

interface DeskStore {
  sessionId: string | null;
  view: InvestigationView | null;
  /** the event of the last successful action, and a counter that bumps with every one */
  event: V2Event | null;
  eventSeq: number;
  lastPath: string | null;
  /** last refused action, with the server's reason */
  lastError: DeskError | null;
  /** load failure (no view) */
  error: DeskError | null;
  loading: boolean;
  busy: boolean;
  online: string[];
  offline: boolean;
  load: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  /** the core runner; every public act variant goes through it */
  run: (path: string, body?: unknown, policy?: ActPolicy) => Promise<ActOutcome | null>;
  /** POST /sessions/:id/v2/<path> → { view, event }, or null when refused (the refusal is toasted). */
  act: (path: string, body?: unknown) => Promise<V2Response | null>;
  clearError: () => void;
  startSync: () => void;
  stopSync: () => void;
}

let syncTimer: ReturnType<typeof setInterval> | null = null;
let lastActivityAt = 0;
/** sessions that were already told the lab is idle */
const labNudged = new Set<string>();
let queue: Promise<unknown> = Promise.resolve();
const SYNC_MS = 2500;

const asDeskError = (e: unknown, path: string): DeskError =>
  e instanceof ApiFailure
    ? { message: e.message, code: e.code, reason: e.reason, path, at: Date.now() }
    : { message: t('common.wentWrong'), code: 'server', path, at: Date.now() };

/** What to say after the server's own sentence, by reason (CONTRACT_V2 §1). */
const reasonHint: Partial<Record<ErrorReason, string>> = {
  no_time: 'desk.reason.no_time',
  not_here: 'desk.reason.not_here',
  unavailable: 'desk.reason.unavailable',
  refused: 'desk.reason.refused',
  lab_full: 'desk.reason.lab_full',
  phase: 'desk.reason.phase',
  not_host: 'desk.reason.not_host',
  wait_nothing: 'desk.reason.wait_nothing',
  late_limit: 'desk.reason.late_limit',
  press_later: 'desk.reason.press_later',
  nothing_to_press: 'desk.reason.nothing_to_press',
  // co-op (wave 5)
  private: 'coop.reason.private',
  held: 'coop.reason.held',
};
export const reasonHintKey = (r?: ErrorReason) => (r ? reasonHint[r] : undefined);

export const useDesk = create<DeskStore>((set, get) => {
  /** adopt a server view, announcing what teammates did (co-op) and remembering stars */
  const adopt = (next: InvestigationView) => {
    const cur = get().view;
    if (next.room && cur?.room && next.sessionId === cur.sessionId) {
      const mine = next.room.players.find((p) => p.id === next.you)?.name;
      const fresh = next.room.activity.filter((a) => a.at > lastActivityAt && a.actor !== mine);
      for (const a of fresh.slice(0, 2).reverse()) toast({ title: a.actor, text: a.text, tone: 'team' });
    }
    if (next.room?.activity[0]) lastActivityAt = Math.max(lastActivityAt, next.room.activity[0].at);
    set({ view: next });
  };

  const announce = (res: V2Response, policy: ActPolicy) => {
    const { event, view } = res;
    feelEvent(event, { haptics: policy.haptics });
    if (policy.toastFinds !== false) {
      for (const id of event.newEvidence ?? []) {
        const e = view.notebook.evidence.find((x) => x.id === id);
        if (e) toast({ title: t('desk.toast.evidence', { code: e.code }), text: e.name, tone: 'evidence' });
      }
      const facts = (event.newFacts ?? []).map((id) => view.notebook.facts.find((f) => f.id === id)).filter(Boolean);
      if (facts.length === 1) toast({ title: t('desk.toast.fact'), text: facts[0]!.text, tone: 'evidence' });
      else if (facts.length > 1) toast({ title: t('desk.toast.facts', { n: facts.length }), text: facts[0]!.text, tone: 'evidence' });
    }
    for (const id of event.labReady ?? []) {
      const job = view.lab.jobs.find((j) => j.analysisId === id);
      if (job && view.phase !== 'closed') {
        toast({
          title: t('desk.toast.labReady'), text: job.name, tone: 'lab',
          action: { label: t('desk.lab.collect'), onPress: () => { get().act('lab/collect', { analysisId: id }); } },
        });
      }
    }
    // the lab is the one resource that works while you do something else: say so the first time it could
    const idle = view.lab.running < view.lab.slots && view.phase === 'investigating';
    const sendable = (event.newEvidence ?? []).map((id) => view.notebook.evidence.find((x) => x.id === id))
      .find((e) => e?.analyses.some((a) => a.status === 'available'));
    if (idle && sendable && !labNudged.has(view.sessionId)) {
      labNudged.add(view.sessionId);
      toast({
        title: t('desk.toast.labIdle'), text: t('desk.toast.labIdleText', { name: sendable.name }), tone: 'lab',
        action: { label: t('desk.toast.labOpen'), onPress: () => router.navigate(`/desk/${view.sessionId}?focus=lab&at=${Date.now()}`) },
      });
    }
    if (event.newDeductions?.length && event.kind !== 'end_day') {
      toast({ title: t('desk.toast.newQuestion', { n: event.newDeductions.length }), tone: 'proof' });
    }
  };

  const tick = async () => {
    const id = get().sessionId;
    const v = get().view;
    if (!id || !v) return;
    try {
      const p = await api.pulse(id);
      set({ online: p.online, offline: false });
      if (p.version > v.version && !get().busy) {
        const fresh = await v2.view(id);
        if (get().sessionId === id) adopt(fresh);
      }
    } catch (e) {
      if (e instanceof ApiFailure && e.code === 'not_found') {
        get().stopSync();
        set({ error: { message: t('desk.error.notMember'), code: 'not_found', path: 'pulse', at: Date.now() }, view: null });
      } else {
        set({ offline: true });
      }
    }
  };

  const run: DeskStore['run'] = (path, body, policy = {}) => {
    // actions are serialised: two quick taps never race each other's view
    const job = queue.then(async (): Promise<ActOutcome | null> => {
      const id = get().sessionId;
      if (!id) return null;
      const clean = path.replace(/^\/+/, '');
      set({ busy: true });
      try {
        const res = await v2.post(id, clean, body);
        if (get().sessionId !== id) return null;
        adopt(res.view);
        set({ event: res.event, eventSeq: get().eventSeq + 1, lastPath: clean, lastError: null });
        announce(res, policy);
        return { ok: res };
      } catch (e) {
        const err = asDeskError(e, clean);
        set({ lastError: err });
        if (e instanceof ApiFailure && (e.code === 'quota' || e.reason === 'quota')) {
          router.push('/premium?source=quota');
        } else if (policy.toastErrors !== false) {
          const hint = reasonHintKey(err.reason);
          toast({ title: err.message, text: hint ? t(hint) : undefined, tone: 'alert' });
        }
        // a refusal carries no view and the state may have moved under us (co-op partner, another device,
        // day over): fetch the truth so every screen re-renders from the server
        if (e instanceof ApiFailure && e.code !== 'network') get().refresh();
        return e instanceof ApiFailure ? { fail: e } : null;
      } finally {
        set({ busy: false });
      }
    });
    queue = job.catch(() => undefined);
    return job;
  };

  return {
    sessionId: null,
    view: null,
    event: null,
    eventSeq: 0,
    lastPath: null,
    lastError: null,
    error: null,
    loading: false,
    busy: false,
    online: [],
    offline: false,
    load: async (id) => {
      if (get().sessionId !== id) {
        get().stopSync();
        lastActivityAt = 0;
        set({ view: null, sessionId: id, online: [], event: null, lastError: null });
      }
      set({ loading: true, error: null });
      try {
        const v = await v2.view(id);
        if (get().sessionId !== id) return;
        lastActivityAt = v.room?.activity[0]?.at ?? 0;
        adopt(v);
      } catch (e) {
        set({ error: asDeskError(e, 'view') });
      } finally {
        set({ loading: false });
      }
    },
    refresh: async () => {
      const id = get().sessionId;
      if (!id) return;
      try {
        const v = await v2.view(id);
        if (get().sessionId === id) adopt(v);
      } catch {
        // keep the view we have; the next action or pulse retries
      }
    },
    run,
    act: async (path, body) => {
      const r = await run(path, body, { toastErrors: true });
      return r && 'ok' in r ? r.ok : null;
    },
    clearError: () => set({ lastError: null }),
    startSync: () => {
      if (syncTimer) return;
      tick();
      syncTimer = setInterval(tick, SYNC_MS);
    },
    stopSync: () => {
      if (syncTimer) clearInterval(syncTimer);
      syncTimer = null;
    },
  };
});

// ── act adapters for feature screens ──────────────────────────────────────────
// Every feature takes `act(path, body?)`. They all accept { view, event } and null; some also accept a richer
// failure so they can show the server's sentence themselves. Each adapter below matches one feature's types.

const run = (path: string, body: unknown, policy: ActPolicy) => useDesk.getState().run(path, body, policy);

/** Plain contract: { view, event } or null (refusal toasted by the shell). */
export const actPlain = (path: string, body?: unknown) => useDesk.getState().act(path, body);

/**
 * The one feature `act` (src/features/act.ts): { view, event } | { error, code, reason } | null.
 * Refusals are not toasted (the feature shows the server's sentence); the store refetches the view after them.
 */
export function makeAct(policy: ActPolicy = {}) {
  return async (path: string, body?: unknown): Promise<V2Response | ApiError | null> => {
    const r = await run(path, body, { toastErrors: false, ...policy });
    if (!r) return null;
    if ('ok' in r) return r.ok;
    const f = r.fail;
    return { error: f.message, code: f.code === 'network' ? 'server' : f.code, ...(f.reason ? { reason: f.reason } : {}) };
  };
}

// the language changed: fetch the view again so case content arrives in the new language
onLocaleChange(() => { useDesk.getState().refresh(); });
