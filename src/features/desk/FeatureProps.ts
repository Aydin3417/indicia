// Builds the exact props each feature screen expects (see docs/handoff/F.md "What features receive").
import { useMemo } from 'react';
import type { InvestigationView } from '../../../shared/api';
import { makeAct } from '../../state/desk';
import { useT, type Translate } from '../../i18n';

/**
 * `act` for every feature screen (src/features/act.ts): resolves { view, event }, or { error, code, reason } on a
 * refusal (the feature shows it), or null. Haptics are left to the feature when it plays its own.
 */
export function useFeatureAct(opts: { haptics: boolean; toastFinds: boolean }) {
  return useMemo(() => makeAct({ haptics: opts.haptics, toastFinds: opts.toastFinds }), [opts.haptics, opts.toastFinds]);
}

/** `act` for the scene (it animates finds and plays its own haptics). */
export function useSceneAct() {
  return useMemo(() => makeAct({ haptics: false, toastFinds: false }), []);
}

export interface BaseFeatureProps { view: InvestigationView; t: Translate }
export const useFeatureT = useT;
