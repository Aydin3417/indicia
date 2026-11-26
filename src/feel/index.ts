// Feel layer: one place that maps server events (CONTRACT_V2 §7, PLAN §5) to haptics, small motion cues and,
// later, sound. Screens call `feelEvent(event)` (the desk store does it for every action); motion components
// subscribe with `useFeelCue(kind, fn)` or read the latest cue from `useFeel`.
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { create } from 'zustand';
import type { V2Event } from '../../shared/api';
import { usePrefs } from '../state/prefs';
import { playSound, sound, type SfxId } from '../sound';

/** The vocabulary of moments that the player should feel. */
export type FeelKind =
  | 'tick'          // the clock moved forward (cost > 0)
  | 'fact'          // a fact / evidence went into the notebook
  | 'lab'           // a lab result is ready
  | 'line'          // a press yielded something new
  | 'breakthrough'  // present: break
  | 'resist'        // present: resist
  | 'patience'      // present: wrong / ended
  | 'confirmed'     // deduction confirmed
  | 'wrong'         // deduction wrong
  | 'day'           // the day turned
  | 'won' | 'lost' | 'retry' // finale round
  | 'verdict';      // case result

export type Haptic = 'light' | 'medium' | 'double' | 'heavy' | 'warning';

/** Haptic dictionary (PLAN §5): fact light · break medium+double · stamp heavy · patience warning. */
export const HAPTIC: Partial<Record<FeelKind, Haptic>> = {
  fact: 'light',
  lab: 'light',
  line: 'light',
  breakthrough: 'double',
  resist: 'light',
  patience: 'warning',
  confirmed: 'heavy',
  wrong: 'warning',
  won: 'heavy',
  lost: 'warning',
  retry: 'light',
  verdict: 'heavy',
};

/** Which moments an event carries, strongest first. */
export function feelsFor(e: V2Event): FeelKind[] {
  const out: FeelKind[] = [];
  const o = e.outcome;
  if (e.result) out.push('verdict');
  switch (e.kind) {
    case 'present':
      if (o === 'break') out.push('breakthrough');
      else if (o === 'resist') out.push('resist');
      else if (o === 'wrong' || o === 'ended') out.push('patience');
      break;
    case 'press':
      if (o === 'detail' || o === 'advance') out.push('line');
      break;
    case 'deduce':
      out.push(o === 'confirmed' ? 'confirmed' : 'wrong');
      break;
    case 'end_day':
      out.push('day');
      break;
    case 'finale_answer':
      if (o === 'won' || o === 'lost' || o === 'retry') out.push(o);
      break;
  }
  if (e.newFacts?.length || e.newEvidence?.length) out.push('fact');
  if (e.labReady?.length) out.push('lab');
  if (e.cost > 0) out.push('tick');
  return out;
}

export function haptic(kind: Haptic) {
  if (Platform.OS === 'web') return;
  if (!usePrefs.getState().haptics) return;
  const impact = (s: Haptics.ImpactFeedbackStyle) => Haptics.impactAsync(s).catch(() => undefined);
  switch (kind) {
    case 'light': impact(Haptics.ImpactFeedbackStyle.Light); break;
    case 'medium': impact(Haptics.ImpactFeedbackStyle.Medium); break;
    case 'heavy': impact(Haptics.ImpactFeedbackStyle.Heavy); break;
    case 'double':
      impact(Haptics.ImpactFeedbackStyle.Medium);
      setTimeout(() => impact(Haptics.ImpactFeedbackStyle.Medium), 120);
      break;
    case 'warning': Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined); break;
  }
}

export interface Cue { kind: FeelKind; seq: number; event?: V2Event }

interface FeelStore {
  seq: number;
  /** latest cue per kind */
  last: Partial<Record<FeelKind, Cue>>;
  emit: (kind: FeelKind, event?: V2Event) => void;
}

export const useFeel = create<FeelStore>((set, get) => ({
  seq: 0,
  last: {},
  emit: (kind, event) => {
    const seq = get().seq + 1;
    set({ seq, last: { ...get().last, [kind]: { kind, seq, event } } });
  },
}));

// ── audio (wave 4) ────────────────────────────────────────────────────────────
/** Sound for each moment (src/sound/catalog.ts; measured with `ear`, docs/handoff/L.md). The clock tick is silent:
 * it happens on almost every action and would become a metronome. */
export const SOUND: Partial<Record<FeelKind, SfxId>> = {
  fact: 'fact',
  lab: 'lab',
  line: 'press',
  breakthrough: 'breakthrough',
  resist: 'resist',
  patience: 'patience',
  confirmed: 'confirmed',
  wrong: 'wrong',
  day: 'day',
  won: 'won',
  lost: 'lost',
  retry: 'retry',
  verdict: 'verdict',
};

/** Sound cue for one moment (screens that want a cue without a server event). */
export function playCue(kind: FeelKind, e?: V2Event): void {
  const id = kind === 'verdict' ? verdictSound(e) : SOUND[kind];
  if (id) playSound(id);
}
/** Hook form of playCue. */
export function useAudioCue(): (kind: FeelKind) => void {
  return playCue;
}

function verdictSound(e?: V2Event): SfxId {
  const o = e?.result?.outcome ?? e?.outcome;
  return o === 'weak' || o === 'wrongful' ? 'verdict_bad' : 'verdict';
}

/**
 * One event → at most one main sound, so a busy action does not stack cues: the strongest moment wins, except that
 * a press which turns up a fact sounds like a find. A lab result that finished meanwhile follows as its own cue, and
 * a night event follows the day chime once the day overlay has passed.
 */
export function soundsFor(kinds: FeelKind[], e?: V2Event): { id: SfxId; delay: number }[] {
  const out: { id: SfxId; delay: number }[] = [];
  let main = kinds.find((k) => k === 'verdict' || SOUND[k]);
  if (main === 'line' && kinds.includes('fact')) main = 'fact';
  if (main) out.push({ id: main === 'verdict' ? verdictSound(e) : SOUND[main]!, delay: 0 });
  if (main !== 'lab' && kinds.includes('lab')) out.push({ id: 'lab', delay: main ? 450 : 0 });
  if (main === 'day' && e?.report?.night) out.push({ id: 'night', delay: 1900 });
  return out;
}

export interface FeelOptions {
  /** false when the screen that caused the event plays its own haptics (interview, scene) */
  haptics?: boolean;
}

/** Feeds one server event through the feel layer: haptic for the strongest moment, cues for every moment. */
export function feelEvent(e: V2Event, opts: FeelOptions = {}): FeelKind[] {
  const kinds = feelsFor(e);
  if (opts.haptics !== false) {
    const strongest = kinds.find((k) => HAPTIC[k]);
    if (strongest) haptic(HAPTIC[strongest]!);
  }
  const { emit } = useFeel.getState();
  for (const k of kinds) emit(k, e);
  for (const s of soundsFor(kinds, e)) {
    if (s.delay) sound.later(s.id, s.delay);
    else playSound(s.id);
  }
  return kinds;
}

/** Runs `fn` whenever a cue of `kind` is emitted after mount. */
export function useFeelCue(kind: FeelKind, fn: (cue: Cue) => void) {
  const cue = useFeel((s) => s.last[kind]);
  const first = useRef(cue?.seq ?? 0);
  const cb = useRef(fn);
  cb.current = fn;
  useEffect(() => {
    if (cue && cue.seq > first.current) cb.current(cue);
  }, [cue]);
}
