// SERVER-ONLY. Suspect composure, read from the stress the interview has built up (see v2/actions.ts reachTier).
import type { SuspectState } from './state.ts';

/** Stress at which composure drops a stage: composed < 40 ≤ uneasy < 60 ≤ strained < 78 ≤ breaking. */
export const COMPOSURE_STEPS = [40, 60, 78] as const;

export function composureOf(ss: SuspectState): 'composed' | 'uneasy' | 'strained' | 'breaking' {
  if (ss.stress < COMPOSURE_STEPS[0]) return 'composed';
  if (ss.stress < COMPOSURE_STEPS[1]) return 'uneasy';
  if (ss.stress < COMPOSURE_STEPS[2]) return 'strained';
  return 'breaking';
}
