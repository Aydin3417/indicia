/**
 * Renders Indicia's interface sounds to assets/audio/sfx/*.wav.
 *   npx tsx scripts/sound/render-sfx.ts            (all)
 *   npx tsx scripts/sound/render-sfx.ts fact star  (some)
 * Then measure: `python -m ear.sfx assets/audio/sfx --profile ui-tap -q` (see docs/handoff/L.md for the per-sound profile).
 *
 * Loudness tiers (integrated, BS.1770): everyday -24 LUFS · quiet everyday -26 · moment -20 · notification -18 · reward -15.
 * The gap between everyday and reward is deliberate (~9 LU): rewards are rare and should feel bigger.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Buf, N, P, encodeWavMono, loudness, rng, truePeak, type Partial } from './modal';

const OUT = join(__dirname, '..', '..', 'assets', 'audio', 'sfx');

const TIER = { quiet: -26, everyday: -24, moment: -20, notify: -18, reward: -15 } as const;

/** Glass crackle: a scatter of sub-3 ms air grains (the claim card cracking). */
function crackle(b: Buf, at: number, span: number, count: number, gain: number, seed: number) {
  const r = rng(seed);
  for (let i = 0; i < count; i++) {
    const t = at + Math.pow(r(), 1.6) * span; // denser at the start
    b.grain(t, 0.0012 + r() * 0.0015, gain * (0.4 + 0.6 * r()) * (1 - (t - at) / (span * 1.3)), seed * 31 + i);
  }
}

/** Paper: a cloud of sub-3 ms air grains under an arch envelope (lift, flutter, settle) plus a faint airy tone. */
function paper(b: Buf, seed: number) {
  const r = rng(seed);
  const span = 0.34;
  for (let i = 0; i < 70; i++) {
    const u = r();
    const t = 0.004 + u * span;
    const arch = Math.sin(Math.PI * Math.min(1, u * 1.05)) ** 1.5;
    b.grain(t, 0.0008 + r() * 0.0019, 0.5 * arch * (0.3 + 0.7 * r()), seed * 17 + i);
  }
  b.voice(N.A6, [[1, 1], [2, 0.3]], { at: 0.02, attack: 0.08, decay: 0.12, gain: 0.05 });
}

type Def = { tier: keyof typeof TIER; len: number; build: (b: Buf) => void; what: string };

const SOUNDS: Record<string, Def> = {
  // ── everyday ───────────────────────────────────────────────────────────────
  fact: {
    tier: 'everyday', len: 0.38, what: 'a fact or exhibit goes into the notebook: glass A5, then its fifth a breath later',
    build: (b) => b
      .voice(N.A5, P.glass, { decay: 0.11, attack: 0.005 })
      .voice(N.E6, P.glass, { at: 0.045, decay: 0.09, attack: 0.005, gain: 0.38 })
      .grain(0.001, 0.0015, 0.05, 11),
  },
  press: {
    tier: 'everyday', len: 0.26, what: 'pressing a claim yields a new line: one soft glass D6',
    build: (b) => b.voice(N.D6, P.glass, { decay: 0.075, attack: 0.006 }),
  },
  resist: {
    tier: 'everyday', len: 0.3, what: 'the suspect holds: a muted G5/D6 fifth that does not ring',
    build: (b) => b
      .voice(N.G5, P.soft, { decay: 0.07, attack: 0.008 })
      .voice(N.D6, P.soft, { decay: 0.06, attack: 0.008, gain: 0.6 }),
  },
  patience: {
    tier: 'everyday', len: 0.4, what: 'wrong exhibit, patience lost: Bb5 falling a semitone to A5',
    build: (b) => b
      .voice(N.Bb5, P.warm, { decay: 0.07, attack: 0.006 })
      .voice(N.A5, P.warm, { at: 0.11, decay: 0.1, attack: 0.006, gain: 0.7 }),
  },
  wrong: {
    tier: 'everyday', len: 0.4, what: 'deduction rejected ("it does not hold"): D6 falling a fourth to A5, damped',
    build: (b) => b
      .voice(N.D6, P.soft, { decay: 0.08, attack: 0.006 })
      .voice(N.A5, P.soft, { at: 0.12, decay: 0.09, attack: 0.006, gain: 0.7 }),
  },
  retry: {
    tier: 'quiet', len: 0.28, what: 'finale round: the answer is not enough, try again: one muted Bb5',
    build: (b) => b.voice(N.Bb5, P.soft, { decay: 0.08, attack: 0.007 }),
  },
  star_dim: {
    tier: 'quiet', len: 0.3, what: 'a verdict star not earned: a muted A5 that barely rings',
    build: (b) => b.voice(N.A5, P.soft, { decay: 0.07, attack: 0.01 }),
  },
  tool: {
    tier: 'quiet', len: 0.16, what: 'scene tool switch: a short glass E6',
    build: (b) => b.voice(N.E6, P.soft, { decay: 0.04, attack: 0.005 }),
  },
  torch_on: {
    tier: 'everyday', len: 0.2, what: 'torch on: two glints rising a fifth (A5 → E6)',
    build: (b) => b
      .voice(N.A5, P.glass, { decay: 0.045, attack: 0.005 })
      .voice(N.E6, P.glass, { at: 0.03, decay: 0.05, attack: 0.005, gain: 0.5 }),
  },
  torch_off: {
    tier: 'quiet', len: 0.2, what: 'torch off: the same glints falling (E6 → A5)',
    build: (b) => b
      .voice(N.E6, P.glass, { decay: 0.045, attack: 0.005 })
      .voice(N.A5, P.glass, { at: 0.03, decay: 0.05, attack: 0.005, gain: 0.5 }),
  },
  uv_on: {
    tier: 'everyday', len: 0.9, what: 'UV lamp strikes: two starter pings, then a thin high tube whine gliding up into pitch and fading',
    build: (b) => {
      b.voice(N.A6, P.glass, { decay: 0.02, attack: 0.004, gain: 0.5 })
        .voice(N.A6, P.glass, { at: 0.07, decay: 0.025, attack: 0.004, gain: 0.6 });
      // the tube: A6 with its octave and twelfth, sliding up from a quarter-tone flat, slow swell, slight beating
      b.voice(N.A6, [[1, 1], [2, 0.5], [3, 0.25]], { at: 0.1, attack: 0.02, swell: 0.22, decay: 0.32, glide: 0.97, glideS: 0.15, shimmer: 1.6, gain: 1.2 });
    },
  },
  page: {
    tier: 'everyday', len: 0.38, what: 'paper / page turn: a cloud of sub-3 ms air grains (>3 kHz) under a lift-flutter-settle arch',
    build: (b) => paper(b, 5),
  },
  // ── moments ────────────────────────────────────────────────────────────────
  lab: {
    tier: 'notify', len: 0.95, what: 'lab result ready: a bell rising a fifth (A5 → E6)',
    build: (b) => b
      .voice(N.A5, P.bell, { decay: 0.3, attack: 0.006 })
      .voice(N.E6, P.bell, { at: 0.12, decay: 0.32, attack: 0.006, gain: 0.32 }),
  },
  day: {
    tier: 'moment', len: 2.4, what: 'the day turns: a distant clock chime, three soft bell strokes falling A5 · F5 · D5',
    build: (b) => b
      .voice(N.A5, P.bell, { decay: 0.6, attack: 0.012 })
      .voice(N.F5, P.bell, { at: 0.42, decay: 0.65, attack: 0.012, gain: 0.55 })
      .voice(N.D5, P.bell, { at: 0.84, decay: 0.75, attack: 0.012, gain: 0.45 }),
  },
  night: {
    tier: 'moment', len: 2.4, what: 'a night event: a D minor triad swelling in slowly, with a slow beat, and fading',
    build: (b) => b
      // a faint glass touch on the A an octave up gives the swell an onset (no leading silence)
      .voice(N.A6, P.soft, { attack: 0.006, decay: 0.25, gain: 0.35 })
      .voice(N.D5, P.warm, { attack: 0.05, swell: 0.5, decay: 0.9, shimmer: 0.7 })
      .voice(N.F5, P.warm, { at: 0.08, attack: 0.05, swell: 0.5, decay: 0.85, shimmer: 0.9, gain: 0.75 })
      .voice(N.A5, P.warm, { at: 0.16, attack: 0.05, swell: 0.5, decay: 0.8, shimmer: 1.1, gain: 0.6 }),
  },
  lost: {
    tier: 'moment', len: 1.0, what: 'finale round lost: F5 falling a minor third to D5',
    build: (b) => b
      .voice(N.F5, P.warm, { decay: 0.18, attack: 0.008 })
      .voice(N.D5, P.warm, { at: 0.16, decay: 0.3, attack: 0.008, gain: 0.7 }),
  },
  verdict_bad: {
    tier: 'moment', len: 2.4, what: 'verdict, weak or wrongful: a D minor bell chord rolled slowly',
    build: (b) => strum(b, [N.D5, N.F5, N.A5, N.D6], 0.05, 0.75, P.bell),
  },
  // ── rewards ────────────────────────────────────────────────────────────────
  breakthrough: {
    tier: 'reward', len: 1.4, what: 'a claim cracks: glass crackle (air grains) over a rolled D major chord',
    build: (b) => {
      crackle(b, 0.0, 0.12, 18, 0.35, 3);
      strum(b, [N.D5, N.Fs5, N.A5, N.D6], 0.028, 0.42, P.glass, 0.02);
    },
  },
  confirmed: {
    tier: 'reward', len: 1.7, what: 'deduction confirmed (the stamp): D5 bell with its fifth and octave, struck softly together',
    build: (b) => b
      .voice(N.D5, P.bell, { decay: 0.55, attack: 0.009 })
      .voice(N.A5, P.bell, { at: 0.012, decay: 0.5, attack: 0.009, gain: 0.6 })
      .voice(N.D6, P.bell, { at: 0.024, decay: 0.45, attack: 0.009, gain: 0.4 }),
  },
  won: {
    tier: 'reward', len: 1.1, what: 'finale round won: a bell rising a fourth (A5 → D6)',
    build: (b) => b
      .voice(N.A5, P.bell, { decay: 0.25, attack: 0.007 })
      .voice(N.D6, P.bell, { at: 0.13, decay: 0.38, attack: 0.007, gain: 0.75 }),
  },
  star: {
    tier: 'reward', len: 0.85, what: 'a verdict star lights: a quick D6 · A6 · D7 glass arpeggio',
    build: (b) => strum(b, [N.D6, N.A6, N.D7], 0.045, 0.2, P.glass),
  },
  verdict: {
    tier: 'reward', len: 2.3, what:'verdict (confession / charged): a D major bell chord rolled, with the high octave last',
    build: (b) => strum(b, [N.D5, N.Fs5, N.A5, N.D6, N.A6], 0.04, 0.8, P.bell),
  },
};

function strum(b: Buf, notes: number[], step: number, decay: number, partials: Partial[], start = 0) {
  notes.forEach((f, i) => b.voice(f, partials, { at: start + i * step, decay: decay * (1 - i * 0.06), attack: 0.008, gain: 1 - i * 0.08 }));
}

mkdirSync(OUT, { recursive: true });
const only = process.argv.slice(2);
for (const [id, d] of Object.entries(SOUNDS)) {
  if (only.length && !only.includes(id)) continue;
  const b = new Buf(d.len);
  d.build(b);
  const x = b.finish(TIER[d.tier]);
  writeFileSync(join(OUT, `${id}.wav`), encodeWavMono(x));
  const tp = 20 * Math.log10(truePeak(x));
  console.log(`${id.padEnd(13)} ${d.len.toFixed(2)} s  ${loudness(x).toFixed(1)} LUFS  peak ${tp.toFixed(1)} dB  (${d.tier})`);
}
