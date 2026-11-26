// SERVER-ONLY. Case 002 — "Ash and Glaze" / "Kül ve Sır" (arson). Contains the full truth.
// All people, places and companies are fictional; nobody is hurt. Content lives in ./fennick/*; this file assembles it.
import type { CaseDefinition } from '../engine/types.ts';
import { briefing, FENNICK_ID, meta, people, truth } from './fennick/meta.ts';
import { suspects } from './fennick/suspects.ts';
import { locations } from './fennick/places.ts';
import { accusation, analyses, contradictions, evidence, hints, statements } from './fennick/evidence.ts';
import { fennickV2Layer } from './fennick/v2.ts';

export { FENNICK_ID };

export const fennick: CaseDefinition = {
  id: FENNICK_ID,
  version: 1,
  meta,
  briefing,
  truth,
  people,
  suspects,
  locations,
  evidence,
  analyses,
  statements,
  contradictions,
  accusation,
  hints,
  v2: fennickV2Layer,
};
