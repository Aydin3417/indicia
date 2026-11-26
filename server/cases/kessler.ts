// SERVER-ONLY. Case 001 — "The Kessler Workshop" / "Kessler Atölyesi". Contains the full truth.
// All people, places and organisations are fictional. Content lives in ./kessler/*; this file assembles it.
import type { CaseDefinition } from '../engine/types.ts';
import { withV2 } from './overlay.ts';
import { briefing, meta, people, truth } from './kessler/meta.ts';
import { clara } from './kessler/clara.ts';
import { jonas } from './kessler/jonas.ts';
import { miriam } from './kessler/miriam.ts';
import { leo } from './kessler/leo.ts';
import { locations } from './kessler/places.ts';
import { evidence } from './kessler/evidence.ts';
import { accusation, analyses, contradictions, hints, statements } from './kessler/records.ts';
import { suspectsV2 } from './kessler/claims.ts';
import { kesslerV2Layer } from './kessler/v2.ts';

const kesslerBase: CaseDefinition = {
  id: 'kessler-workshop',
  version: 2,
  meta,
  briefing,
  truth,
  people,
  suspects: [clara, jonas, miriam, leo],
  locations,
  evidence,
  analyses,
  statements,
  contradictions,
  accusation,
  hints,
};

/** v1 truth + v2 game layer (final, English + Turkish). */
export const kessler: CaseDefinition = withV2(kesslerBase, {
  v2: kesslerV2Layer,
  startingFacts: ['f-fobs', 'f-camera'],
  suspects: suspectsV2,
});
