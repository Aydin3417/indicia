// The player's two sound switches, kept apart from the shared prefs store (src/state/prefs.ts) so the sound layer
// owns its own file. Haptics stay in src/state/prefs.ts and are independent of both.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

interface SoundPrefs {
  /** interface sounds (finds, cracks, stamps, the clock) */
  sfx: boolean;
  /** room tones under the scenes and interviews */
  ambience: boolean;
  ready: boolean;
  hydrate: () => Promise<void>;
  set: (p: Partial<Pick<SoundPrefs, 'sfx' | 'ambience'>>) => void;
}

const KEY = 'indicia.sound.v1';

export const useSoundPrefs = create<SoundPrefs>((set, get) => ({
  sfx: true,
  ambience: true,
  ready: false,
  hydrate: async () => {
    if (get().ready) return;
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw) as { sfx?: unknown; ambience?: unknown };
        set({
          sfx: typeof d.sfx === 'boolean' ? d.sfx : true,
          ambience: typeof d.ambience === 'boolean' ? d.ambience : true,
        });
      }
    } catch {
      // storage unavailable: both on
    }
    set({ ready: true });
  },
  set: (p) => {
    set(p);
    const { sfx, ambience } = get();
    AsyncStorage.setItem(KEY, JSON.stringify({ sfx, ambience })).catch(() => undefined);
  },
}));
