// Every sound the game can play. The files are rendered offline (scripts/sound/render-sfx.ts, modal synthesis) or
// built from free recordings (scripts/sound/build-rooms.py) and measured with `ear` before they land here
// (docs/handoff/L.md). Levels are baked into the files: everyday -24 LUFS, quiet -26, moment -20, lab -18, reward -15;
// room tones -34 LUFS in the file and played at ROOM_GAIN on top.

export type SfxId =
  | 'fact' | 'press' | 'resist' | 'patience' | 'wrong' | 'retry' | 'star_dim' | 'tool' | 'torch_on' | 'torch_off'
  | 'uv_on' | 'page' | 'lab' | 'day' | 'night' | 'lost' | 'verdict_bad' | 'breakthrough' | 'confirmed' | 'won'
  | 'star' | 'verdict';

export type RoomId = 'workshop' | 'interview' | 'gallery' | 'quiet';

export interface SfxDef {
  source: number;
  /** seconds; used to time the room-tone duck */
  dur: number;
  /** higher wins when the voice limit is reached */
  priority: number;
  /** how many copies may overlap (rapid repeats) */
  voices: number;
}

/* eslint-disable @typescript-eslint/no-require-imports */
export const SFX: Record<SfxId, SfxDef> = {
  fact: { source: require('../../assets/audio/sfx/fact.wav'), dur: 0.38, priority: 2, voices: 2 },
  press: { source: require('../../assets/audio/sfx/press.wav'), dur: 0.26, priority: 1, voices: 2 },
  resist: { source: require('../../assets/audio/sfx/resist.wav'), dur: 0.3, priority: 2, voices: 1 },
  patience: { source: require('../../assets/audio/sfx/patience.wav'), dur: 0.4, priority: 3, voices: 1 },
  wrong: { source: require('../../assets/audio/sfx/wrong.wav'), dur: 0.4, priority: 3, voices: 1 },
  retry: { source: require('../../assets/audio/sfx/retry.wav'), dur: 0.28, priority: 2, voices: 1 },
  star_dim: { source: require('../../assets/audio/sfx/star_dim.wav'), dur: 0.3, priority: 3, voices: 2 },
  tool: { source: require('../../assets/audio/sfx/tool.wav'), dur: 0.16, priority: 0, voices: 2 },
  torch_on: { source: require('../../assets/audio/sfx/torch_on.wav'), dur: 0.2, priority: 0, voices: 1 },
  torch_off: { source: require('../../assets/audio/sfx/torch_off.wav'), dur: 0.2, priority: 0, voices: 1 },
  uv_on: { source: require('../../assets/audio/sfx/uv_on.wav'), dur: 0.9, priority: 1, voices: 1 },
  page: { source: require('../../assets/audio/sfx/page.wav'), dur: 0.38, priority: 1, voices: 2 },
  lab: { source: require('../../assets/audio/sfx/lab.wav'), dur: 0.95, priority: 3, voices: 1 },
  day: { source: require('../../assets/audio/sfx/day.wav'), dur: 2.4, priority: 4, voices: 1 },
  night: { source: require('../../assets/audio/sfx/night.wav'), dur: 2.4, priority: 4, voices: 1 },
  lost: { source: require('../../assets/audio/sfx/lost.wav'), dur: 1.0, priority: 4, voices: 1 },
  verdict_bad: { source: require('../../assets/audio/sfx/verdict_bad.wav'), dur: 2.4, priority: 5, voices: 1 },
  breakthrough: { source: require('../../assets/audio/sfx/breakthrough.wav'), dur: 1.4, priority: 4, voices: 1 },
  confirmed: { source: require('../../assets/audio/sfx/confirmed.wav'), dur: 1.7, priority: 4, voices: 1 },
  won: { source: require('../../assets/audio/sfx/won.wav'), dur: 1.1, priority: 4, voices: 1 },
  star: { source: require('../../assets/audio/sfx/star.wav'), dur: 0.85, priority: 4, voices: 3 },
  verdict: { source: require('../../assets/audio/sfx/verdict.wav'), dur: 2.3, priority: 5, voices: 1 },
};

export const ROOMS: Record<RoomId, number> = {
  workshop: require('../../assets/audio/rooms/workshop.wav'),
  interview: require('../../assets/audio/rooms/interview.wav'),
  gallery: require('../../assets/audio/rooms/gallery.wav'),
  quiet: require('../../assets/audio/rooms/quiet.wav'),
};
/* eslint-enable @typescript-eslint/no-require-imports */

/** Player volume for room tones (file -34 LUFS → about -38 LUFS heard; everyday cues sit ~14 LU above). */
export const ROOM_GAIN = 0.62;
/** Room tone level while a cue plays (≈ -8 dB). */
export const DUCK = 0.4;
/** At most this many interface sounds at once; a new one replaces the lowest-priority voice. */
export const MAX_VOICES = 4;

/** Which room tone belongs to which scene location (case data: server/cases/*). Unknown locations: workshop. */
export const LOCATION_ROOM: Record<string, RoomId> = {
  'loc-gallery': 'gallery',
  'loc-workshop': 'workshop',
  'loc-office': 'workshop',
  'loc-vault': 'workshop',
  'loc-back': 'workshop',
  // wave 6: the side trips are closed, carpeted rooms — no pendulum clock (P's request)
  'loc-varga': 'quiet',
  'loc-clara': 'quiet',
  'loc-bank': 'quiet',
  'loc-pawn': 'quiet',
};
