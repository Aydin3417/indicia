import { create } from 'zustand';

export interface Toast {
  id: number;
  title: string;
  text?: string;
  tone: 'evidence' | 'neutral' | 'alert' | 'proof' | 'team' | 'lab';
  /** optional call to action (e.g. "Collect" on a lab result) */
  action?: { label: string; onPress: () => void };
}

interface ToastStore {
  toasts: Toast[];
  push: (t: Omit<Toast, 'id'>) => void;
  dismiss: (id: number) => void;
}

let seq = 1;

/** One toast queue for the whole app. */
export const useToasts = create<ToastStore>((set, get) => ({
  toasts: [],
  push: (t) => {
    const toast = { ...t, id: seq++ };
    // the same sentence twice in a row (two taps on a refused action) shows once
    if (get().toasts.some((x) => x.title === toast.title && x.text === toast.text)) return;
    set({ toasts: [...get().toasts.slice(-2), toast] });
    setTimeout(() => get().dismiss(toast.id), t.action ? 5200 : 3400);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((x) => x.id !== id) }),
}));

export const toast = (t: Omit<Toast, 'id'>) => useToasts.getState().push(t);
