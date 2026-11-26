import type { ZoneShapeView } from '../../../shared/api';

/** Drawing units of a scene (viewBox). Zones and plan shapes are 0..1 of these. Same aspect as the v1 plan. */
export const UNITS_W = 1000;
export const UNITS_H = 820;
/** Rendered pixel size of the scene layer before the camera transform (rendered large so zooming stays crisp). */
export const CANVAS_W = 1100;
export const CANVAS_H = CANVAS_W * (UNITS_H / UNITS_W);

/** A zone flattened for worklets: plain numbers only. */
export interface FlatZone {
  id: string;
  kind: 0 | 1 | 2; // rect, circle, poly
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
  pts: number[]; // poly: x0,y0,x1,y1,…
}

export function flatten(id: string, s: ZoneShapeView): FlatZone {
  if (s.kind === 'rect') return { id, kind: 0, x: s.x, y: s.y, w: s.w, h: s.h, r: 0, pts: [] };
  if (s.kind === 'circle') return { id, kind: 1, x: s.x, y: s.y, w: 0, h: 0, r: s.r, pts: [] };
  return { id, kind: 2, x: 0, y: 0, w: 0, h: 0, r: 0, pts: s.points.flat() };
}

/**
 * Distance (in 0..1 scene units, x scaled to the canvas aspect) from a point to a zone; 0 inside.
 * Runs on the UI thread.
 */
export function zoneDistance(z: FlatZone, px: number, py: number): number {
  'worklet';
  const ax = UNITS_W / UNITS_H; // y units are shorter on screen; normalise to x units
  if (z.kind === 0) {
    const dx = Math.max(z.x - px, 0, px - (z.x + z.w));
    const dy = Math.max(z.y - py, 0, py - (z.y + z.h)) / ax;
    return Math.sqrt(dx * dx + dy * dy);
  }
  if (z.kind === 1) {
    const dx = px - z.x;
    const dy = (py - z.y) / ax;
    return Math.max(0, Math.sqrt(dx * dx + dy * dy) - z.r);
  }
  // poly: inside test, else distance to the nearest vertex (good enough for a soft highlight)
  const p = z.pts;
  let inside = false;
  let best = 1e9;
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
    const xi = p[i], yi = p[i + 1], xj = p[j], yj = p[j + 1];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
    const dx = px - xi;
    const dy = (py - yi) / ax;
    best = Math.min(best, Math.sqrt(dx * dx + dy * dy));
  }
  return inside ? 0 : best;
}

/** Index of the zone the light falls on (within `reach` scene units of the beam centre), or -1. */
export function zoneUnderLight(zones: FlatZone[], px: number, py: number, reach: number): number {
  'worklet';
  let best = -1;
  let bestD = reach;
  let bestArea = 1e9;
  for (let i = 0; i < zones.length; i++) {
    const z = zones[i];
    const d = zoneDistance(z, px, py);
    const area = z.kind === 0 ? z.w * z.h : z.kind === 1 ? z.r * z.r * 3.14 : 0.05;
    // the closest wins; when the beam is inside several zones, the smallest (most specific) wins
    if (d < bestD - 1e-6 || (best >= 0 && d === 0 && bestD === 0 && area < bestArea) || (best < 0 && d <= bestD)) {
      best = i;
      bestD = d;
      bestArea = area;
    }
  }
  return best;
}

export function zoneCentre(s: ZoneShapeView): { x: number; y: number } {
  if (s.kind === 'rect') return { x: s.x + s.w / 2, y: s.y + s.h / 2 };
  if (s.kind === 'circle') return { x: s.x, y: s.y };
  const n = s.points.length || 1;
  return { x: s.points.reduce((a, p) => a + p[0], 0) / n, y: s.points.reduce((a, p) => a + p[1], 0) / n };
}

/** Clamp a camera offset so the canvas always covers the viewport (or is centred when smaller). */
export function clampOffset(o: number, view: number, content: number): number {
  'worklet';
  if (content <= view) return (view - content) / 2;
  return Math.min(0, Math.max(view - content, o));
}

/** Tiny deterministic PRNG for scattered props (same room every render). */
export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}
