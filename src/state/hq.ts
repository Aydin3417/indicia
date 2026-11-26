import { create } from 'zustand';
import type { CaseSummary, Difficulty, Profile } from '../../shared/api';
import { api, ApiFailure } from '../api/client';
import { onLocaleChange, t, useI18n } from '../i18n';

interface HqStore {
  cases: CaseSummary[] | null;
  profile: Profile | null;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useHq = create<HqStore>((set) => ({
  cases: null,
  profile: null,
  error: null,
  refresh: async () => {
    try {
      const profile = await api.me();
      // the profile's language wins over the device (CONTRACT_V2 §1); adopt it before the catalogue loads
      useI18n.getState().adoptProfile(profile);
      const cases = await api.cases();
      set({ cases, profile, error: null });
    } catch (e) {
      set({ error: e instanceof ApiFailure ? e.message : t('hq.error.unreachable') });
    }
  },
}));

onLocaleChange(() => { useHq.getState().refresh(); });

export const difficultyLabel = (d: Difficulty | string) => t(`difficulty.${d}`);

/** The tutorial case (CaseSummary.tutorial) if the catalogue has one, otherwise the first case (PLAN §4). */
export const tutorialCase = (cases: CaseSummary[]) => cases.find((c) => c.tutorial) ?? cases[0];

/** Best stars on a case (server: CaseSummary.bestStars), undefined while never closed. */
export const caseStars = (c: CaseSummary): number | undefined => c.bestStars ?? c.session?.stars;

/** Where a case's session opens: the v2 desk (a closed case goes straight to the verdict). */
export const caseHref = (c: CaseSummary) =>
  c.session ? (c.session.status === 'closed' ? `/desk/${c.session.id}/finale` : `/desk/${c.session.id}`) : `/case/${c.id}`;
