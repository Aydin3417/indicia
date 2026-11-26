import type { ClockView, GameTime, SuspectV2View } from '../../../shared/api';
import { fmtMinutes, type Translate } from '../../i18n';

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

/** "Day 2 · 10:00", or just "10:00" when it is today. */
export function fmtGameTime(t: Translate, at: GameTime, today?: number): string {
  return at.day === today ? at.label : t('desk.time.dayAt', { d: at.day, time: at.label });
}

/** Can this action be afforded now? */
export const fits = (clock: ClockView, cost: number) => cost <= clock.remainingToday;

/**
 * Where a suspect stands right now, in one short line:
 * "Available now" · "From 12:00" · "Day 2 · with her lawyer" · "Not today" · "Refuses until tomorrow".
 */
export function availabilityLine(t: Translate, s: SuspectV2View, clock: ClockView): { text: string; now: boolean } {
  if (s.interview.refusedToday) return { text: t('desk.people.refused'), now: false };
  if (s.interview.open) return { text: t('desk.people.inRoom'), now: true };
  const nowMin = toMin(clock.timeLabel);
  const today = s.availability.filter((w) => w.day === clock.day);
  const current = today.find((w) => toMin(w.from) <= nowMin && nowMin < toMin(w.to));
  if (s.availableNow || current) {
    // a window's note explains the edge that is not the day's own: "until 14:30" for one that ends early, "with his
    // mother until noon" for one that opens late. Once a late window is open its note is stale (wave 8): say "now".
    const endsEarly = !!current && toMin(current.to) < toMin(clock.dayEnd);
    return { text: current?.note && endsEarly ? t('desk.people.nowWithNote', { note: current.note }) : t('desk.people.now'), now: true };
  }
  const later = today.find((w) => toMin(w.from) > nowMin);
  if (later) return { text: t('desk.people.from', { time: later.from }) + (later.note ? ` · ${later.note}` : ''), now: false };
  const next = s.availability.filter((w) => w.day > clock.day).sort((a, b) => a.day - b.day)[0];
  if (next) return { text: t('desk.people.day', { d: next.day, time: next.from }) + (next.note ? ` · ${next.note}` : ''), now: false };
  return { text: t('desk.people.never'), now: false };
}

export const remainingLabel = (t: Translate, clock: ClockView) => t('desk.strip.left', { time: fmtMinutes(t, clock.remainingToday) });
