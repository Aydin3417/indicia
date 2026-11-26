/**
 * Offline modal synthesis for Indicia's interface sounds (wave 4, Agent L).
 *
 * The owner's firm rules (three percussive sets were rejected before), enforced here rather than by taste:
 *  - every voice is a small set of partials in consonant ratios (1, 2, 3, 4, 5, 6, 3/2 …), each with its own
 *    exponential decay; upper partials die faster (decay ∝ ratio^-0.75);
 *  - onsets are raised-cosine attacks of at least 4 ms: a struck glass/bell, never a tap on a damped surface;
 *  - nothing voiced below 520 Hz (`voice` refuses lower fundamentals) and the whole mix is high-passed at 300 Hz;
 *  - the only noise allowed is a "grain": white noise high-passed at 3 kHz, shorter than 3 ms (`grain` refuses longer);
 *  - no sound shorter than 35 ms (`render` refuses).
 * Output is mono 44.1 kHz 16-bit PCM WAV, normalised to a target loudness (BS.1770 K-weighted, gated).
 */

export const SR = 44100;
const TAU = Math.PI * 2;

/** [frequency ratio to the fundamental, amplitude] */
export type Partial = [number, number];

export const MIN_VOICED_HZ = 520;
export const MAX_GRAIN_S = 0.003;
export const MIN_SOUND_S = 0.035;

/** Notes used across the set (D minor / D major colour; the lowest is D5). */
export const N = {
  D5: 587.33, E5: 659.26, F5: 698.46, Fs5: 739.99, G5: 783.99, A5: 880.0, Bb5: 932.33, C6: 1046.5,
  D6: 1174.66, E6: 1318.51, F6: 1396.91, Fs6: 1479.98, G6: 1567.98, A6: 1760.0, D7: 2349.32,
} as const;

/** Partial sets. All ratios are integer or simple fractions (consonant). */
export const P = {
  /** glass: bright, mostly fundamental and octave */
  glass: [[1, 1], [2, 0.42], [3, 0.16], [4, 0.07]] as Partial[],
  /** bell: fuller, fifth-and-octave colour (3 = octave + fifth, 6 = two octaves + fifth) */
  bell: [[1, 1], [2, 0.55], [3, 0.32], [4, 0.18], [6, 0.08]] as Partial[],
  /** soft: muted, two partials only (felt-covered, but still a tone) */
  soft: [[1, 1], [2, 0.22]] as Partial[],
  /** warm: harmonic series 1..5 with gentle roll-off */
  warm: [[1, 1], [2, 0.38], [3, 0.22], [4, 0.1], [5, 0.05]] as Partial[],
};

export interface VoiceOpts {
  /** start time in seconds */
  at?: number;
  /** attack in seconds (raised cosine); >= 4 ms */
  attack?: number;
  /** decay time constant of the fundamental in seconds */
  decay: number;
  gain?: number;
  /** extra slow fade-in on top of the attack (swells) */
  swell?: number;
  /** pitch glide: starts at `glide`× and settles to 1 with time constant `glideS` */
  glide?: number;
  glideS?: number;
  /** slow shimmer: each partial is a pair detuned by ±shimmer Hz (beating, not chorus) */
  shimmer?: number;
  /** hard stop (seconds after `at`), faded over 30 ms; default: when the voice has decayed by 80 dB */
  hold?: number;
}

export class Buf {
  readonly data: Float32Array;
  constructor(readonly seconds: number) {
    if (seconds < MIN_SOUND_S) throw new Error(`sound shorter than ${MIN_SOUND_S * 1000} ms reads as a click`);
    this.data = new Float32Array(Math.ceil(seconds * SR));
  }

  /** One modal voice: partials over a fundamental, each with its own decay. */
  voice(f0: number, partials: Partial[], o: VoiceOpts): this {
    if (f0 < MIN_VOICED_HZ) throw new Error(`voiced content below ${MIN_VOICED_HZ} Hz (${f0})`);
    const at = Math.floor((o.at ?? 0) * SR);
    const attack = Math.max(0.004, o.attack ?? 0.006);
    const gain = o.gain ?? 1;
    const glide = o.glide ?? 1;
    const glideS = o.glideS ?? 0.05;
    const shimmer = o.shimmer ?? 0;
    const norm = partials.reduce((s, [, a]) => s + a, 0);
    const life = o.hold ?? o.decay * 9.2; // 80 dB
    const n = Math.min(this.data.length - at, Math.ceil((life + 0.03) * SR));
    for (const [ratio, amp] of partials) {
      const decay = o.decay * Math.pow(ratio, -0.75);
      if (f0 * ratio > SR * 0.45) continue;
      // every partial starts at zero phase: the attack envelope, not a phase step, shapes the onset
      let ph1 = 0;
      let ph2 = 0;
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        const g = 1 + (glide - 1) * Math.exp(-t / glideS);
        const f = f0 * ratio * g;
        ph1 += (TAU * (f + shimmer)) / SR;
        ph2 += (TAU * (f - shimmer)) / SR;
        const osc = shimmer ? 0.5 * (Math.sin(ph1) + Math.sin(ph2)) : Math.sin(ph1);
        let e = t < attack ? 0.5 - 0.5 * Math.cos((Math.PI * t) / attack) : 1;
        if (o.swell) e *= t < o.swell ? 0.5 - 0.5 * Math.cos((Math.PI * t) / o.swell) : 1;
        e *= Math.exp(-t / decay);
        if (o.hold !== undefined && t > o.hold) e *= Math.max(0, 1 - (t - o.hold) / 0.03);
        this.data[at + i] += (osc * e * amp * gain) / norm;
      }
    }
    return this;
  }

  /** A grain of air: white noise high-passed at 3 kHz, Hann-windowed, shorter than 3 ms. */
  grain(atS: number, durS: number, gain: number, seed: number): this {
    if (durS > MAX_GRAIN_S) throw new Error(`noise longer than ${MAX_GRAIN_S * 1000} ms`);
    const at = Math.floor(atS * SR);
    const n = Math.floor(durS * SR);
    const r = rng(seed);
    const hp = biquadHighpass(3000, 0.707);
    // warm the filter up so the grain starts on filtered noise, not on a step
    for (let i = 0; i < 64; i++) hp(r() * 2 - 1);
    for (let i = 0; i < n && at + i < this.data.length; i++) {
      const w = 0.5 - 0.5 * Math.cos((TAU * i) / (n - 1));
      this.data[at + i] += hp(r() * 2 - 1) * w * gain;
    }
    return this;
  }

  /** Final chain: 300 Hz high-pass (24 dB/oct), DC removal, edge fades, loudness normalisation. */
  finish(targetLufs: number, maxPeakDb = -1.5): Float32Array {
    const a = biquadHighpass(300, 0.5412);
    const b = biquadHighpass(300, 1.3066);
    const d = this.data;
    for (let i = 0; i < d.length; i++) d[i] = b(a(d[i]));
    // 2 ms fade-in (the attack already shapes it); the last fifth of the sound (at least 25 ms) bends the ring
    // down to true silence so a tail never leaves a bed that stacks up when sounds overlap
    const fi = Math.floor(0.002 * SR);
    const fo = Math.max(Math.floor(0.025 * SR), Math.floor(d.length * 0.2));
    for (let i = 0; i < fi; i++) d[i] *= i / fi;
    for (let i = 0; i < fo; i++) d[d.length - 1 - i] *= 0.5 - 0.5 * Math.cos((Math.PI * i) / fo);
    const maxPeak = Math.pow(10, maxPeakDb / 20);
    // reach the target loudness; if that would clip, a gentle look-ahead limiter takes up to 6 dB off the
    // strike transient (it shortens nothing and adds no distortion), then the rest is plain gain
    for (let pass = 0; pass < 4; pass++) {
      const g = Math.pow(10, (targetLufs - loudness(d)) / 20);
      for (let i = 0; i < d.length; i++) d[i] *= g;
      if (truePeak(d) <= maxPeak * 1.001) break;
      limit(d, maxPeak * 0.97, 0.5);
    }
    const p = truePeak(d);
    if (p > maxPeak) for (let i = 0; i < d.length; i++) d[i] *= maxPeak / p;
    return d;
  }
}

/** Look-ahead peak limiter: 3 ms look-ahead, 80 ms release, gain reduction floored at `floor` (0.5 = 6 dB). */
function limit(d: Float32Array, ceiling: number, floor: number) {
  const look = Math.floor(0.003 * SR);
  const rel = Math.exp(-1 / (0.08 * SR));
  const need = new Float32Array(d.length);
  for (let i = 0; i < d.length; i++) need[i] = Math.max(floor, Math.min(1, ceiling / (Math.abs(d[i]) + 1e-9)));
  // minimum over the look-ahead window, then smooth: instant down, slow up
  let g = 1;
  const out = new Float32Array(d.length);
  for (let i = 0; i < d.length; i++) {
    let m = 1;
    for (let k = i; k < Math.min(d.length, i + look); k++) m = Math.min(m, need[k]);
    g = m < g ? g + (m - g) * 0.35 : m + (g - m) * rel;
    out[i] = g;
  }
  for (let i = 0; i < d.length; i++) d[i] *= out[i];
}

export function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

/** RBJ biquad high-pass; returns a stateful per-sample function. */
export function biquadHighpass(fc: number, q: number, sr = SR): (x: number) => number {
  const w = (TAU * fc) / sr;
  const alpha = Math.sin(w) / (2 * q);
  const cos = Math.cos(w);
  const a0 = 1 + alpha;
  const b0 = (1 + cos) / 2 / a0, b1 = -(1 + cos) / a0, b2 = (1 + cos) / 2 / a0;
  const a1 = (-2 * cos) / a0, a2 = (1 - alpha) / a0;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  return (x) => {
    const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    return y;
  };
}

function biquad(b0: number, b1: number, b2: number, a1: number, a2: number) {
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  return (x: number) => {
    const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    return y;
  };
}

/** ITU-R BS.1770-4 integrated loudness (mono), K-weighted, 400 ms blocks / 75 % overlap, gated. */
export function loudness(x: Float32Array, sr = SR): number {
  // K-weighting coefficients for 48 kHz re-derived for `sr` (pyloudnorm's formulation)
  const shelf = (() => {
    const G = 3.999843853973347, Q = 0.7071752369554196, fc = 1681.974450955533;
    const A = Math.pow(10, G / 40), w0 = (TAU * fc) / sr, alpha = Math.sin(w0) / (2 * Q), c = Math.cos(w0);
    const a0 = (A + 1) - (A - 1) * c + 2 * Math.sqrt(A) * alpha;
    return biquad(
      (A * ((A + 1) + (A - 1) * c + 2 * Math.sqrt(A) * alpha)) / a0,
      (-2 * A * ((A - 1) + (A + 1) * c)) / a0,
      (A * ((A + 1) + (A - 1) * c - 2 * Math.sqrt(A) * alpha)) / a0,
      (2 * ((A - 1) - (A + 1) * c)) / a0,
      ((A + 1) - (A - 1) * c - 2 * Math.sqrt(A) * alpha) / a0,
    );
  })();
  const hp = biquadHighpass(38.13547087602444, 0.5003270373238773, sr);
  // sounds shorter than one 400 ms block are measured over their own length (as `ear` does), not padded
  const block = Math.min(Math.floor(0.4 * sr), x.length);
  const len = x.length;
  const y = new Float32Array(len);
  for (let i = 0; i < len; i++) y[i] = hp(shelf(i < x.length ? x[i] : 0));
  const hop = Math.floor(block / 4);
  const z: number[] = [];
  for (let s = 0; s + block <= len; s += hop) {
    let sum = 0;
    for (let i = s; i < s + block; i++) sum += y[i] * y[i];
    z.push(sum / block);
  }
  const L = (m: number) => -0.691 + 10 * Math.log10(m + 1e-20);
  const abs = z.filter((m) => L(m) > -70);
  if (!abs.length) return -70;
  const rel = L(abs.reduce((a, b) => a + b, 0) / abs.length) - 10;
  const gated = abs.filter((m) => L(m) > rel);
  return L(gated.reduce((a, b) => a + b, 0) / gated.length);
}

/** Peak with 4× linear-interpolated oversampling (a cheap true-peak estimate). */
export function truePeak(x: Float32Array): number {
  let m = 0;
  for (let i = 0; i < x.length; i++) {
    m = Math.max(m, Math.abs(x[i]));
    if (i + 1 < x.length) for (let k = 1; k < 4; k++) m = Math.max(m, Math.abs(x[i] + ((x[i + 1] - x[i]) * k) / 4));
  }
  return m;
}

export function encodeWavMono(x: Float32Array, sr = SR): Uint8Array {
  const bytes = new Uint8Array(44 + x.length * 2);
  const v = new DataView(bytes.buffer);
  const str = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  str(0, 'RIFF'); v.setUint32(4, 36 + x.length * 2, true); str(8, 'WAVE'); str(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  str(36, 'data'); v.setUint32(40, x.length * 2, true);
  for (let i = 0; i < x.length; i++) v.setInt16(44 + i * 2, Math.round(Math.max(-1, Math.min(1, x[i])) * 32767), true);
  return bytes;
}
