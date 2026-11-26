// SERVER-ONLY. Case registry: every published case is validated, hashed and deep-frozen at load.
import type { CaseDefinition } from '../engine/types.ts';
import { kessler } from './kessler.ts';
import { FIRST_WATCH_ID, firstWatch } from './first-watch.ts';

/** Kessler stays first (the case list's default); the tutorial carries meta.tutorial (→ CaseSummary.tutorial). */
export const ALL_CASES: CaseDefinition[] = [kessler, firstWatch];

/** The tutorial ("İlk Nöbet / First Watch"); clients read CaseSummary.tutorial instead of this id. */
export const TUTORIAL_CASE_ID = FIRST_WATCH_ID;

function deepFreeze<T>(o: T): T {
  if (o && typeof o === 'object' && !Object.isFrozen(o)) {
    Object.freeze(o);
    for (const v of Object.values(o as Record<string, unknown>)) deepFreeze(v);
  }
  return o;
}

export async function hashCase(def: CaseDefinition): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(def));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

export interface LockedCase {
  def: CaseDefinition;
  hash: string;
}

let registry: Map<string, LockedCase> | null = null;

export async function loadRegistry(validate: (d: CaseDefinition) => { ok: boolean; errors: string[] }): Promise<Map<string, LockedCase>> {
  if (registry) return registry;
  const map = new Map<string, LockedCase>();
  for (const def of ALL_CASES) {
    const report = validate(def);
    if (!report.ok) {
      // an invalid case is never playable
      console.error(`[cases] ${def.id} failed validation and is not published:\n  ${report.errors.join('\n  ')}`);
      continue;
    }
    map.set(def.id, { def: deepFreeze(def), hash: await hashCase(def) });
  }
  registry = map;
  return map;
}
