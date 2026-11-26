// SERVER-ONLY. Attach a v2 game layer to an existing (v1) case without retyping it.
// Authors may also write v2 fields inline in the case file; both shapes produce the same CaseDefinition.
import type {
  CaseDefinition, CaseV2, ClaimDef, LabAnalysisDef, LocationDef, SuspectV2, Text, TopicV2,
} from '../engine/types.ts';
import { stripMarkup, tx } from '../engine/i18n.ts';

export interface V2Overlay {
  v2: CaseV2;
  /** facts the player holds at the start (briefing) */
  startingFacts?: string[];
  /** document bodies with {{fact|phrase}} markup. Must read exactly like the original once the markup is removed. */
  bodies?: Record<string, Text[]>;
  /** shorthand for draft content: mark a phrase that already occurs in the English line */
  marks?: Record<string, { line: number; phrase: string; fact: string; subtle?: boolean }[]>;
  analyses?: Record<string, NonNullable<LabAnalysisDef['v2']>>;
  locations?: Record<string, NonNullable<LocationDef['v2']>>;
  suspects?: Record<string, {
    v2?: SuspectV2;
    topics?: Record<string, { v2?: TopicV2; claims?: Record<number, ClaimDef[]> }>;
  }>;
}

export function withV2(base: CaseDefinition, o: V2Overlay): CaseDefinition {
  const def: CaseDefinition = structuredClone(base);
  def.v2 = o.v2;
  if (o.startingFacts) def.briefing.startingFacts = o.startingFacts;
  for (const [id, body] of Object.entries(o.bodies ?? {})) {
    const e = def.evidence.find((x) => x.id === id);
    if (!e?.body) throw new Error(`overlay: evidence ${id} has no body`);
    if (body.length !== e.body.length) throw new Error(`overlay: body of ${id} has ${body.length} lines, original ${e.body.length}`);
    body.forEach((line, i) => {
      for (const l of ['en', 'tr'] as const) {
        const orig = tx(e.body![i], l);
        if (typeof e.body![i] === 'string' && l === 'tr') continue;
        if (stripMarkup(tx(line, l)) !== orig) throw new Error(`overlay: ${id} line ${i} (${l}) changes the document text`);
      }
    });
    e.body = body;
  }
  for (const [id, list] of Object.entries(o.marks ?? {})) {
    const e = def.evidence.find((x) => x.id === id);
    if (!e?.body) throw new Error(`overlay: evidence ${id} has no body`);
    for (const m of list) {
      const line = e.body[m.line];
      const en = tx(line, 'en');
      if (line === undefined || !en.includes(m.phrase)) throw new Error(`overlay: "${m.phrase}" not found in ${id} line ${m.line}`);
      const marked = en.replace(m.phrase, `{{${m.subtle ? '?' : ''}${m.fact}|${m.phrase}}}`);
      e.body[m.line] = typeof line === 'string' ? marked : { ...line, en: marked };
    }
  }
  for (const [id, v] of Object.entries(o.analyses ?? {})) {
    const a = def.analyses.find((x) => x.id === id);
    if (!a) throw new Error(`overlay: unknown analysis ${id}`);
    a.v2 = v;
  }
  for (const [id, v] of Object.entries(o.locations ?? {})) {
    const l = def.locations.find((x) => x.id === id);
    if (!l) throw new Error(`overlay: unknown location ${id}`);
    l.v2 = v;
  }
  for (const [sid, sv] of Object.entries(o.suspects ?? {})) {
    const s = def.suspects.find((x) => x.id === sid);
    if (!s) throw new Error(`overlay: unknown suspect ${sid}`);
    if (sv.v2) s.v2 = sv.v2;
    for (const [tid, tv] of Object.entries(sv.topics ?? {})) {
      const t = s.topics.find((x) => x.id === tid);
      if (!t) throw new Error(`overlay: unknown topic ${sid}/${tid}`);
      if (tv.v2) t.v2 = tv.v2;
      for (const [n, claims] of Object.entries(tv.claims ?? {})) {
        const tier = t.tiers[Number(n)];
        if (!tier) throw new Error(`overlay: ${sid}/${tid} has no tier ${n}`);
        tier.claims = claims;
      }
    }
  }
  return def;
}
