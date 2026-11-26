import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

type Persisted = {
  onboarded: boolean;
  haptics: boolean;
  /** faint glow near an unexamined spot after a while (scene) */
  idleAssist: boolean;
  /** sessions whose briefing the player has already seen */
  briefed: string[];
  /** tutorial coach marks already shown and dismissed (scene, notebook, present, deduction) */
  coached: string[];
};

interface Prefs extends Persisted {
  ready: boolean;
  hydrate: () => Promise<void>;
  set: (p: Partial<Persisted>) => void;
  markBriefed: (sessionId: string) => void;
  markCoached: (step: string) => void;
}

const KEY = 'indicia.prefs.v1';
const keys: (keyof Persisted)[] = ['onboarded', 'haptics', 'idleAssist', 'briefed', 'coached'];

export const usePrefs = create<Prefs>((set, get) => {
  const save = () => {
    const s = get();
    const out = Object.fromEntries(keys.map((k) => [k, s[k]]));
    AsyncStorage.setItem(KEY, JSON.stringify(out)).catch(() => undefined);
  };
  return {
    ready: false,
    onboarded: false,
    haptics: true,
    idleAssist: true,
    briefed: [],
    coached: [],
    hydrate: async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const data = JSON.parse(raw) as Partial<Persisted>;
          set(Object.fromEntries(Object.entries(data).filter(([k]) => (keys as string[]).includes(k))));
        }
      } catch {
        // storage unavailable: defaults apply
      }
      set({ ready: true });
    },
    set: (p) => { set(p); save(); },
    markBriefed: (sessionId) => {
      if (get().briefed.includes(sessionId)) return;
      set({ briefed: [...get().briefed.slice(-40), sessionId] });
      save();
    },
    markCoached: (step) => {
      if (get().coached.includes(step)) return;
      set({ coached: [...get().coached, step] });
      save();
    },
  };
});
