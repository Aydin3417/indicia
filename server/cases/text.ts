// SERVER-ONLY. Small authoring helpers for bilingual case content.
import type { LocalText } from '../engine/types.ts';

/** A player-facing string in both languages. Write each side natively; never translate word for word. */
export const L = (en: string, tr: string): LocalText => ({ en, tr });
