// Playback for Indicia's sound (wave 4). One app-lifetime engine on top of expo-audio:
//  - interface sounds: preloaded players (one per sound, more created on demand up to `voices`), a global voice
//    limit with priorities, and a duck of the room tone while a cue plays;
//  - room tones: seamless AAC loops (.m4a, sample-exact via the MP4 edit list; scripts/sound/encode.py), loaded on
//    first use, crossfaded when the room changes, faded by a 50 ms ticker;
//  - silent when the app is in the background (AppState), off-switches in Settings (src/sound/prefs.ts);
//  - iOS: `playsInSilentMode: false`, so the ring/silent switch mutes the game like any other UI sound;
//  - web: browsers refuse audio before the first user gesture, so nothing plays until one (pointer/key/touch)
//    has happened; nothing here ever throws into the caller.
import { AppState, Platform, type AppStateStatus } from 'react-native';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { DUCK, MAX_VOICES, ROOMS, ROOM_GAIN, SFX, type RoomId, type SfxId } from './catalog';
import { useSoundPrefs } from './prefs';

export interface SoundLogEntry {
  /** ms since the engine started */
  t: number;
  kind: 'sfx' | 'room';
  id: string;
  /** what happened: played / or why not */
  result: 'played' | 'set' | 'off' | 'locked' | 'background' | 'not-ready' | 'dropped' | 'error' | 'stop';
}

interface Voice { id: SfxId; player: AudioPlayer; until: number; priority: number }

const now = () => Date.now();

class SoundEngine {
  private started = false;
  private t0 = now();
  private unlocked = Platform.OS !== 'web';
  private suspended = false;
  private pools: Partial<Record<SfxId, AudioPlayer[]>> = {};
  private cursor: Partial<Record<SfxId, number>> = {};
  private voices: Voice[] = [];
  private rooms: Partial<Record<RoomId, AudioPlayer>> = {};
  private level: Record<RoomId, number> = { workshop: 0, interview: 0, gallery: 0, quiet: 0 };
  private playing: Record<RoomId, boolean> = { workshop: false, interview: false, gallery: false, quiet: false };
  private wanted: RoomId | null = null;
  private duckUntil = 0;
  private ticker: ReturnType<typeof setInterval> | null = null;
  private readonly entries: SoundLogEntry[] = [];

  /** Idempotent: audio mode, prefs, preloading, lifecycle listeners. Safe to call from render paths. */
  start(): void {
    if (this.started) return;
    this.started = true;
    this.t0 = now();
    try {
      if (Platform.OS !== 'web') {
        setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers', shouldPlayInBackground: false }).catch(() => undefined);
      }
      useSoundPrefs.getState().hydrate().then(() => this.apply()).catch(() => undefined);
      useSoundPrefs.subscribe((s, prev) => {
        if (prev.sfx && !s.sfx) this.stopVoices();
        if (s.ambience !== prev.ambience || s.ready !== prev.ready) this.apply();
      });
      AppState.addEventListener('change', (st: AppStateStatus) => this.onAppState(st));
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const unlock = () => {
          if (this.unlocked) return;
          this.unlocked = true;
          for (const ev of ['pointerdown', 'keydown', 'touchend'] as const) window.removeEventListener(ev, unlock, true);
          this.apply();
          this.preload();
        };
        for (const ev of ['pointerdown', 'keydown', 'touchend'] as const) window.addEventListener(ev, unlock, true);
        if (__DEV__) (globalThis as { __indiciaSound?: unknown }).__indiciaSound = { log: this.entries, engine: this, prefs: useSoundPrefs };
      }
      // preload one player per interface sound; the room tones load when first needed (they are larger).
      // Web (wave 6): not before the first gesture — nothing can play until then, and 22 WAVs (≈1.8 MB) used to be
      // fetched on the very first screen, competing with the briefing's art on a phone connection. (Wave 7: the
      // files are AAC now, 276 KB for all 22.)
      if (Platform.OS !== 'web') this.preload();
    } catch {
      // audio unavailable on this device: the game stays silent
    }
  }

  private preloaded = false;
  private preload(): void {
    if (this.preloaded) return;
    this.preloaded = true;
    try {
      for (const id of Object.keys(SFX) as SfxId[]) this.pool(id);
    } catch { /* silent */ }
  }

  /** Plays one interface sound now (if the player allows sound effects and the app is in front). */
  play(id: SfxId): void {
    this.start();
    const prefs = useSoundPrefs.getState();
    if (!prefs.ready) return this.log('sfx', id, 'not-ready');
    if (!prefs.sfx) return this.log('sfx', id, 'off');
    if (this.suspended) return this.log('sfx', id, 'background');
    if (!this.unlocked) return this.log('sfx', id, 'locked');
    const def = SFX[id];
    try {
      const t = now();
      this.voices = this.voices.filter((v) => v.until > t);
      if (this.voices.length >= MAX_VOICES) {
        const weakest = this.voices.reduce((a, b) => (b.priority < a.priority ? b : a));
        if (weakest.priority > def.priority) return this.log('sfx', id, 'dropped');
        try { weakest.player.pause(); } catch { /* already gone */ }
        this.voices = this.voices.filter((v) => v !== weakest);
      }
      const player = this.voice(id);
      this.voices = this.voices.filter((v) => v.player !== player);
      player.volume = 1;
      player.seekTo(0).catch(() => undefined);
      player.play();
      this.voices.push({ id, player, until: t + def.dur * 1000, priority: def.priority });
      this.duckUntil = Math.max(this.duckUntil, t + Math.min(def.dur, 1.2) * 1000);
      this.tick();
      this.ensureTicker();
      this.log('sfx', id, 'played');
    } catch {
      this.log('sfx', id, 'error');
    }
  }

  /** Plays `id` after `ms` (cue sequences such as day → night). */
  later(id: SfxId, ms: number): void {
    setTimeout(() => this.play(id), ms);
  }

  /** The room tone that should be under the current screen; null for none. */
  setRoom(room: RoomId | null): void {
    this.start();
    if (room === this.wanted) return;
    this.wanted = room;
    this.log('room', room ?? 'none', room ? 'set' : 'stop');
    this.apply();
  }

  get room(): RoomId | null { return this.wanted; }

  /** Recent decisions (newest last): for tests and the browser check (`globalThis.__indiciaSound.log` on web dev). */
  history(): readonly SoundLogEntry[] { return this.entries; }

  // ── internals ──────────────────────────────────────────────────────────────

  private log(kind: SoundLogEntry['kind'], id: string, result: SoundLogEntry['result']) {
    this.entries.push({ t: now() - this.t0, kind, id, result });
    if (this.entries.length > 80) this.entries.splice(0, this.entries.length - 80);
  }

  private pool(id: SfxId): AudioPlayer[] {
    let p = this.pools[id];
    if (!p) {
      p = [createAudioPlayer(SFX[id].source)];
      this.pools[id] = p;
    }
    return p;
  }

  /** A player for `id` that is not mid-sound if possible; grows the pool up to the sound's `voices`. */
  private voice(id: SfxId): AudioPlayer {
    const pool = this.pool(id);
    const t = now();
    const busy = new Set(this.voices.filter((v) => v.id === id && v.until > t).map((v) => v.player));
    const free = pool.find((p) => !busy.has(p));
    if (free) return free;
    if (pool.length < SFX[id].voices) {
      const p = createAudioPlayer(SFX[id].source);
      pool.push(p);
      return p;
    }
    const i = ((this.cursor[id] ?? 0) + 1) % pool.length;
    this.cursor[id] = i;
    return pool[i];
  }

  private roomPlayer(id: RoomId): AudioPlayer {
    let p = this.rooms[id];
    if (!p) {
      p = createAudioPlayer(ROOMS[id]);
      p.loop = true;
      p.volume = 0;
      this.rooms[id] = p;
    }
    return p;
  }

  private target(id: RoomId): number {
    const prefs = useSoundPrefs.getState();
    const on = prefs.ready && prefs.ambience && !this.suspended && this.unlocked && this.wanted === id;
    return on ? ROOM_GAIN * (now() < this.duckUntil ? DUCK : 1) : 0;
  }

  /** Re-evaluates what should be sounding and starts the fader. */
  private apply(): void {
    try {
      for (const id of Object.keys(ROOMS) as RoomId[]) {
        if (this.target(id) > 0 && !this.playing[id]) {
          const p = this.roomPlayer(id);
          p.play();
          this.playing[id] = true;
        }
      }
      this.ensureTicker();
    } catch {
      // ignore: a room tone failing must never break the screen
    }
  }

  private ensureTicker() {
    if (this.ticker) return;
    this.ticker = setInterval(() => this.tick(), 50);
  }

  /** One fader step: fast duck down (~100 ms), slow return (~600 ms), crossfades in ~1 s. */
  private tick() {
    let settled = true;
    for (const id of Object.keys(ROOMS) as RoomId[]) {
      const p = this.rooms[id];
      if (!p) continue;
      const target = this.target(id);
      const cur = this.level[id];
      const rate = target < cur ? (now() < this.duckUntil ? 0.45 : 0.08) : 0.06;
      const next = Math.abs(target - cur) < 0.004 ? target : cur + (target - cur) * rate;
      if (next !== target) settled = false;
      this.level[id] = next;
      try {
        p.volume = Math.max(0, Math.min(1, next));
        if (next === 0 && this.playing[id]) { p.pause(); this.playing[id] = false; }
      } catch { /* player released */ }
    }
    if (now() < this.duckUntil) settled = false;
    if (settled && this.ticker) { clearInterval(this.ticker); this.ticker = null; }
  }

  private stopVoices() {
    for (const v of this.voices) { try { v.player.pause(); } catch { /* gone */ } }
    this.voices = [];
  }

  private onAppState(st: AppStateStatus) {
    const away = st !== 'active';
    if (away === this.suspended) return;
    this.suspended = away;
    if (away) {
      // cut at once: timers may be throttled in the background, so no fade
      this.stopVoices();
      for (const id of Object.keys(ROOMS) as RoomId[]) {
        const p = this.rooms[id];
        if (!p) continue;
        try { p.pause(); p.volume = 0; } catch { /* gone */ }
        this.playing[id] = false;
        this.level[id] = 0;
      }
      if (this.ticker) { clearInterval(this.ticker); this.ticker = null; }
    } else {
      this.apply();
    }
  }
}

export const sound = new SoundEngine();
