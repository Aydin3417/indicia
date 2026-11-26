/// <reference path="../../node_modules/expo/types/metro-require.d.ts" />
// Picks up every feature's strings.ts ({ en, tr } of flat keys) without importing a folder that may not exist yet.
// require.context is resolved by Metro at bundle time and updates when files are added, so a feature that lands
// while the app runs is merged on the next refresh. Under Node / tsc the call is simply unavailable.
import type { Locale } from '../../shared/api';

type Table = Record<string, string>;
type Ctx = { keys(): string[]; (id: string): unknown };

function context(): Ctx | null {
  try {
    // must stay a literal require.context call for Metro to see it
    return require.context('../features', true, /\/strings\.tsx?$/) as unknown as Ctx;
  } catch {
    return null;
  }
}

const isTable = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);

/** Flattens { a: { b: 'x' } } to { 'a.b': 'x' } so nested tables work as well as flat ones. */
function flatten(obj: Record<string, unknown>, prefix = '', out: Table = {}): Table {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') out[key] = v;
    else if (isTable(v)) flatten(v, key, out);
  }
  return out;
}

/** Finds `{ en, tr }` in a module: default export, a named export, or the module itself. */
function pairsIn(mod: unknown): { en?: Record<string, unknown>; tr?: Record<string, unknown> }[] {
  if (!isTable(mod)) return [];
  const found: { en?: Record<string, unknown>; tr?: Record<string, unknown> }[] = [];
  const consider = (x: unknown) => {
    if (isTable(x) && (isTable(x.en) || isTable(x.tr))) found.push({ en: isTable(x.en) ? x.en : undefined, tr: isTable(x.tr) ? x.tr : undefined });
  };
  consider(mod);
  for (const v of Object.values(mod)) consider(v);
  return found;
}

export interface FeatureStrings { en: Table; tr: Table; sources: string[] }

export function loadFeatureStrings(): FeatureStrings {
  const out: FeatureStrings = { en: {}, tr: {}, sources: [] };
  const ctx = context();
  if (!ctx) return out;
  for (const key of ctx.keys()) {
    try {
      const mod = ctx(key);
      for (const pair of pairsIn(mod)) {
        if (pair.en) Object.assign(out.en, flatten(pair.en));
        if (pair.tr) Object.assign(out.tr, flatten(pair.tr));
      }
      out.sources.push(key);
    } catch {
      // a feature mid-build may throw while loading; its keys fall back to the key text
    }
  }
  return out;
}

export type { Locale };
