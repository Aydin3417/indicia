// Public surface of the sound layer. Screens normally get sound for free through the feel layer (src/feel:
// every server event goes through `feelEvent`). Moments that are not server events (torch, tool switch, a document
// opening, a verdict star appearing) call `playSound` directly.
import { sound } from './engine';
import { LOCATION_ROOM, type RoomId, type SfxId } from './catalog';

export { sound } from './engine';
export type { SoundLogEntry } from './engine';
export { useSoundPrefs } from './prefs';
export type { RoomId, SfxId } from './catalog';

/** Plays one interface sound; never throws, silent when the player turned sound effects off. */
export function playSound(id: SfxId): void {
  try { sound.play(id); } catch { /* never break a screen over a sound */ }
}

/** Room tone for a route inside a case (`/desk/<session>/…`); null = no room tone. */
export function roomForPath(path: string): RoomId | null {
  const m = /\/desk\/[^/]+\/(scene|interview|finale)(?:\/([^/?#]+))?/.exec(path);
  if (!m) return null;
  if (m[1] === 'scene') return LOCATION_ROOM[decodeURIComponent(m[2] ?? '')] ?? 'workshop';
  return 'interview';
}
