import { create } from 'zustand';

export interface Toast {
  id: number;
  title: string;
  text?: string;
  tone: 'evidence' | 'neutral' | 'alert' | 'proof' | 'team' | 'lab';
  /** optional call to action (e.g. "Collect" on a lab result) */
  action?: { label: string; onPress: () => void };
}

/**
 * Where the toast host may draw on the current screen (wave 7, PLAYTEST_V4 §7.4): a screen whose top holds
 * something the player must read (the desk strip + tutorial coach line) pushes the toasts below it; a screen
 * whose top half is the thing being decided (the night fork) sends them to the bottom, above its footer.
 * The most recently mounted screen wins; when it unmounts the previous one applies again.
 */
export type ToastSlot = { id: number; edge: 'top' | 'bottom'; offset: number };

interface ToastStore {
  toasts: Toast[];
  slots: ToastSlot[];
  push: (t: Omit<Toast, 'id'>) => void;
  dismiss: (id: number) => void;
  setSlot: (slot: ToastSlot) => void;
  clearSlot: (id: number) => void;
}

let seq = 1;
/** at most this many on screen; older ones leave early so a burst (fork choice, a find with a lab result) never
 *  stacks over half the screen */
export const MAX_VISIBLE = 2;

/** One toast queue for the whole app. */
export const useToasts = create<ToastStore>((set, get) => ({
  toasts: [],
  slots: [],
  push: (t) => {
    const toast = { ...t, id: seq++ };
    // the same sentence twice in a row (two taps on a refused action) shows once
    if (get().toasts.some((x) => x.title === toast.title && x.text === toast.text)) return;
    // a toast that carries an action is kept over a plain one when the stack is full
    const all = [...get().toasts, toast];
    while (all.length > MAX_VISIBLE) {
      const plain = all.findIndex((x) => !x.action && x !== toast);
      all.splice(plain >= 0 ? plain : 0, 1);
    }
    set({ toasts: all });
    setTimeout(() => get().dismiss(toast.id), t.action ? 5200 : 3400);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((x) => x.id !== id) }),
  // an update (a re-measure) keeps the slot's place in the stack; a new slot goes on top
  setSlot: (slot) => {
    const cur = get().slots;
    const at = cur.findIndex((x) => x.id === slot.id);
    if (at >= 0 && cur[at]!.edge === slot.edge && cur[at]!.offset === slot.offset) return;
    set({ slots: at >= 0 ? cur.map((x) => (x.id === slot.id ? slot : x)) : [...cur, slot] });
  },
  clearSlot: (id) => set({ slots: get().slots.filter((x) => x.id !== id) }),
}));

let slotSeq = 1;
export const nextSlotId = () => slotSeq++;

export const toast = (t: Omit<Toast, 'id'>) => useToasts.getState().push(t);
