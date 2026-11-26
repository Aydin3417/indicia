import { useCallback } from 'react';
import type { Locale } from '../../../shared/api';
import { interviewStrings, type InterviewStringKey } from './strings';

export type Say = (key: InterviewStringKey, vars?: Record<string, string | number>) => string;

const fill = (s: string, vars?: Record<string, string | number>) =>
  vars ? s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m)) : s;

/**
 * Wraps the shell's `t`. Falls back to this feature's own table when the shell does not know a key
 * (it returns the key itself or nothing), so the screen never shows raw keys.
 */
export function useSay(t: (key: string) => string, locale: Locale): Say {
  return useCallback<Say>((key, vars) => {
    let s: string | undefined;
    try { s = t(key); } catch { s = undefined; }
    if (!s || s === key) s = (interviewStrings[locale] ?? interviewStrings.en)[key] ?? key;
    return fill(s, vars);
  }, [t, locale]);
}

/** "15 min" · "free" for 0. */
export const minutes = (say: Say, n: number) => (n > 0 ? say('interview.minutes', { n }) : say('interview.free'));

/** "3 h 10 min" · "45 min" */
export const duration = (say: Say, n: number) => {
  const h = Math.floor(n / 60);
  const m = n % 60;
  if (h === 0) return say('interview.minutes', { n: m });
  if (m === 0) return say('interview.h', { h });
  return say('interview.hm', { h, m });
};
