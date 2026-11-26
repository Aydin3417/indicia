// Per-session memory of the player's own hands (wave 7, PLAYTEST_V4 §7.5): things the server does not keep because
// they are not moves — a timeline being arranged, blanks half filled, the prosecutor's paragraph already read.
// Kept on the device (AsyncStorage → localStorage on web) and keyed by session, so a reload or leaving the screen
// does not throw the work away. Small and bounded: the newest few dozen entries survive.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

/** An unfiled answer to one question. */
export interface Draft {
  order?: string[];
  outlier?: string | null;
  fills?: Record<string, string>;
  at: number;
}

type Persisted = {
  /** `${sessionId}/${deductionId}` → the player's unfiled arrangement */
  drafts: Record<string, Draft>;
  /** sessions whose finale introduction (the prosecutor's paragraph) the player has read */
  introRead: string[];
};

interface SessionMemory extends Persisted {
  ready: boolean;
  hydrate: () => Promise<void>;
  saveDraft: (sessionId: string, deductionId: string, d: Omit<Draft, 'at'>) => void;
  clearDraft: (sessionId: string, deductionId: string) => void;
  markIntroRead: (sessionId: string) => void;
}

const KEY = 'indicia.session.v1';
const MAX_DRAFTS = 40;
const MAX_SESSIONS = 40;
export const draftKey = (sessionId: string, deductionId: string) => `${sessionId}/${deductionId}`;

let hydrating: Promise<void> | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;

export const useSessionMemory = create<SessionMemory>((set, get) => {
  // drags fire many changes in a row: write once they settle
  const save = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      const { drafts, introRead } = get();
      AsyncStorage.setItem(KEY, JSON.stringify({ drafts, introRead })).catch(() => undefined);
    }, 250);
  };
  return {
    ready: false,
    drafts: {},
    introRead: [],
    hydrate: () => {
      hydrating ??= (async () => {
        try {
          const raw = await AsyncStorage.getItem(KEY);
          if (raw) {
            const data = JSON.parse(raw) as Partial<Persisted>;
            // whatever was changed in this run before storage answered wins over the stored copy
            set({
              drafts: { ...(data.drafts && typeof data.drafts === 'object' ? data.drafts : {}), ...get().drafts },
              introRead: [...new Set([...(Array.isArray(data.introRead) ? data.introRead : []), ...get().introRead])],
            });
          }
        } catch {
          // storage unavailable: this run only
        }
        set({ ready: true });
      })();
      return hydrating;
    },
    saveDraft: (sessionId, deductionId, d) => {
      const all = { ...get().drafts, [draftKey(sessionId, deductionId)]: { ...d, at: Date.now() } };
      const keys = Object.keys(all);
      if (keys.length > MAX_DRAFTS) {
        keys.sort((a, b) => all[a]!.at - all[b]!.at).slice(0, keys.length - MAX_DRAFTS).forEach((k) => delete all[k]);
      }
      set({ drafts: all });
      save();
    },
    clearDraft: (sessionId, deductionId) => {
      const k = draftKey(sessionId, deductionId);
      if (!get().drafts[k]) return;
      const { [k]: _drop, ...rest } = get().drafts;
      set({ drafts: rest });
      save();
    },
    markIntroRead: (sessionId) => {
      if (get().introRead.includes(sessionId)) return;
      set({ introRead: [...get().introRead.slice(-(MAX_SESSIONS - 1)), sessionId] });
      save();
    },
  };
});

/** Start reading the stored memory (idempotent); screens call it on mount. */
export const hydrateSessionMemory = () => useSessionMemory.getState().hydrate();
