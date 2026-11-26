// Art lookups (docs/ART_BIBLE.md, assets/art/manifest.json). Everything is keyed by ids the server already sends:
// suspect / person id, scene.art, zone id, evidence id, case id. A missing key returns undefined and the caller
// falls back to its code-drawn version, so new cases work before their art exists.
import { Image, Platform } from 'react-native';
import { Asset } from 'expo-asset';
import type { Composure } from '../../shared/api';
import { closeUps, covers, documents, evidence, icon, labs, nights, portraits, reports, scenes, textures, witnessPortraits } from './registry';
import type { ArtImage, Layered } from './types';

export type { ArtImage, Layered } from './types';
export type TextureName = 'paper' | 'desk' | 'charcoal';

export const STAGES: Composure[] = ['composed', 'uneasy', 'strained', 'breaking'];

/** A suspect's portrait at a composure stage (falls back to composed), or a witness's single portrait. */
export function portraitArt(id: string | undefined, stage: Composure = 'composed'): ArtImage | undefined {
  if (!id) return undefined;
  const set = portraits[id];
  if (set) return set[stage] ?? set.composed;
  return witnessPortraits[id];
}

export const hasStages = (id: string | undefined) => !!id && !!portraits[id];
export const sceneArt = (key: string | undefined): Layered | undefined => (key ? scenes[key] : undefined);
export const closeUpArt = (zoneId: string | undefined): Layered | undefined => (zoneId ? closeUps[zoneId] : undefined);
export const evidenceArt = (id: string | undefined): ArtImage | undefined => (id ? evidence[id] : undefined);
export const coverArt = (caseId: string | undefined): ArtImage | undefined => (caseId ? covers[caseId] : undefined);
export const textureArt = (name: TextureName): ArtImage | undefined => textures[name];
// wave 6: the in-app emblem is shown at 132 pt — a 17 KB webp instead of the 373 KB store PNG on the first screen
export const iconArt = (): ArtImage | undefined => icon['288'] ?? icon['512'] ?? icon['1024'];

// ── wave 4: fallbacks for items without a picture of their own, day reports, night events ─────────────────────────

/** Evidence → generic drawing ("doc:<type>", "lab:<discipline>") or the close-up of the spot it was found at ("zone:<id>"). */
const EVIDENCE_FALLBACK: Record<string, string> = {
  // Kessler
  'ev-neighbour': 'doc:statement', 'ev-anchor-claim': 'doc:statement', 'ev-anchor': 'doc:statement',
  'ev-camera': 'lab:anpr', 'ev-cctv': 'lab:anpr', 'ev-phone': 'doc:device', 'ev-consignment': 'doc:contract',
  'ev-diary': 'doc:diary', 'ev-accounts': 'doc:bank-record', 'ev-autopsy': 'lab:autopsy', 'ev-serology': 'lab:serology',
  'ev-calllog': 'doc:phone-records', 'ev-accesslog': 'doc:access-log', 'ev-copyreport': 'lab:instrument',
  'ev-geneva': 'lab:financial', 'ev-pawn': 'doc:pawn-ticket', 'ev-workbook': 'doc:workbook', 'ev-lightbook': 'zone:z-va-window',
  'ev-lawyerletter': 'zone:z-tray',
  'ev-body': 'zone:z-body', 'ev-ladder': 'zone:z-ladder', 'ev-bowcabinet': 'zone:z-bows', 'ev-frontdoor': 'zone:z-frontdoor',
  'ev-accesspanel': 'zone:z-reader', 'ev-tracks': 'zone:z-courtyard',
  // First Watch
  'ev-keyregister': 'doc:ledger', 'ev-email': 'doc:folder',
};
/** By evidence kind when the id is unknown (a new case before its art). Physical objects get nothing (icon box). */
const KIND_FALLBACK: Record<string, string> = {
  document: 'doc:folder', testimony: 'doc:statement', digital: 'doc:device', forensic: 'doc:folder',
  financial: 'doc:bank-record', footage: 'lab:anpr', photo: 'doc:folder',
};

function resolve(ref: string | undefined): ArtImage | undefined {
  if (!ref) return undefined;
  const [kind, key] = ref.split(':') as [string, string];
  if (kind === 'doc') return documents[key];
  if (kind === 'lab') return labs[key];
  if (kind === 'zone') return closeUps[key]?.base;
  return undefined;
}

/** A generic drawing for an evidence item that has no picture of its own (document type, lab type or its spot). */
export const docArt = (id: string | undefined, kind?: string): ArtImage | undefined =>
  resolve(id ? EVIDENCE_FALLBACK[id] : undefined) ?? resolve(kind ? KIND_FALLBACK[kind] : undefined);

/** The item's own picture, else its generic drawing. `generic` tells the caller to frame it as a stand-in. */
export function itemArt(id: string | undefined, kind?: string): { art: ArtImage; generic: boolean } | undefined {
  const own = evidenceArt(id);
  if (own) return { art: own, generic: false };
  const g = docArt(id, kind);
  return g ? { art: g, generic: true } : undefined;
}

/** Lab analysis → drawing: by analysis id where the discipline is too broad ("records"), else by discipline. */
const ANALYSIS_LAB: Record<string, string> = {
  'a-cctv': 'lab:anpr', 'a-violin': 'lab:instrument', 'a-anchor': 'doc:statement', 'a-pawn': 'doc:pawn-ticket',
  'a-access': 'doc:access-log', 'a-phone': 'lab:digital', 'a-volvo': 'lab:serology', 'a-halberd': 'lab:financial',
  'a-brandl': 'doc:contract',
};
const DISCIPLINE_LAB: Record<string, string> = {
  autopsy: 'lab:autopsy', serology: 'lab:serology', fingerprints: 'lab:fingerprints', trace: 'lab:fingerprints',
  digital: 'lab:digital', records: 'doc:folder', document: 'lab:document', financial: 'lab:financial',
};
export const labArt = (analysisId: string | undefined, discipline?: string): ArtImage | undefined =>
  resolve(analysisId ? ANALYSIS_LAB[analysisId] : undefined) ?? resolve(discipline ? DISCIPLINE_LAB[discipline] : undefined);

/** The art folder of a case ("kessler" for kessler-workshop): taken from its scene art keys, else the case id. */
export function caseArtKey(caseId: string | undefined, sceneArtKeys: (string | undefined)[] = []): string | undefined {
  const fromScene = sceneArtKeys.find(Boolean)?.split('/')[0];
  return fromScene ?? caseId;
}

/** The day report's illustration for that day; undefined for a case or day without one (the screen stays typographic). */
export const reportArt = (caseKey: string | undefined, day: number): ArtImage | undefined =>
  caseKey ? reports[`${caseKey}/${day}`] : undefined;

/**
 * A night event's illustration. Keyed by the night event id; the day report does not send that id yet (request in
 * docs/handoff/M.md), so until it does the id is recovered from what the night carried: the evidence it granted,
 * the day, and whether the apprentice was already explained.
 */
export function nightArt(caseKey: string | undefined, day: number, night: { title: string; newEvidence: string[]; id?: string } | undefined, leoExplained = false): ArtImage | undefined {
  if (!caseKey || !night) return undefined;
  if (night.id && nights[`${caseKey}/${night.id}`]) return nights[`${caseKey}/${night.id}`];
  if (caseKey !== 'kessler') return undefined;
  let id: string;
  if (night.newEvidence.includes('ev-pawn')) id = leoExplained ? 'n1-pawn-known' : 'n1-pawn';
  else if (night.newEvidence.includes('ev-anchor')) id = 'n2-ruben';
  else if (day === 1) id = /clara/i.test(night.title) ? 'n1-lawyer' : 'n-day1';
  else id = 'n-day2';
  return nights[`${caseKey}/${id}`];
}

/**
 * Where the face sits in each portrait (fractions of width / height), measured on the composed images.
 * Used for circular crops; anyone not listed uses the art bible's default (0.55, 0.32).
 */
const FACE: Record<string, [number, number]> = {
  clara: [0.52, 0.32], jonas: [0.6, 0.34], miriam: [0.6, 0.31], leo: [0.5, 0.31], ada: [0.55, 0.33], nils: [0.62, 0.34],
  'p-thomas': [0.6, 0.35], 'p-varga': [0.58, 0.39], 'p-okafor': [0.55, 0.38], 'p-lind': [0.55, 0.36], 'p-saar': [0.55, 0.37],
};
export const faceCentre = (id: string | undefined): [number, number] => (id && FACE[id]) || [0.55, 0.32];

/** The composure the accused shows in the confrontation, by rounds won (ART_BIBLE §7, finale). */
export function finaleStage(won: number, total: number, broken: boolean): Composure {
  if (broken || (total > 0 && won >= total)) return 'breaking';
  if (won >= 2) return 'strained';
  if (won >= 1) return 'uneasy';
  return 'composed';
}

/** The next stage after `c` (for warming the image cache before a break lands). */
export const nextStage = (c: Composure): Composure => STAGES[Math.min(STAGES.length - 1, STAGES.indexOf(c) + 1)];

const warmed = new Set<string>();
/**
 * Fetch images ahead of the screen that needs them, without decoding them all at once: the browser (or the native
 * image cache) gets the bytes, decoding happens when an <Image> actually shows it. Bundled native assets are local
 * files already, so on device this only matters for development builds served over the network.
 */
export function preload(images: (ArtImage | undefined)[]) {
  for (const a of images) {
    if (!a) continue;
    let uri: string | undefined;
    try { uri = Asset.fromModule(a.src as number).uri; } catch { uri = undefined; }
    if (!uri || warmed.has(uri)) continue;
    warmed.add(uri);
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') { const img = new window.Image(); img.decoding = 'async'; img.src = uri; }
    } else if (/^https?:/.test(uri)) {
      Image.prefetch(uri).catch(() => undefined);
    }
  }
}

/** Alt text in the UI language. */
export const altOf = (a: ArtImage | undefined, locale: string) => (a ? (locale === 'tr' ? a.alt.tr : a.alt.en) : undefined);
