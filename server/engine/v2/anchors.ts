// SERVER-ONLY. Claims inside the spoken answer (PLAYTEST_V2 §7.9): the interview shows an answer once, with each
// claim as a tappable span of the suspect's own words instead of repeating it as a card underneath.
// A claim is placed by its authored `anchor` (exact words), or else by matching its words against the answer's
// sentences (stem overlap, Turkish-aware). Stage directions in parentheses are never part of a span.
// Claims that match nothing well enough come back as `loose` and are shown as short quotes under the answer.
import type { CaseDefinition, Locale, SuspectDef } from '../types.ts';
import { tx } from '../i18n.ts';
import { claimsOf } from './state.ts';

export interface ClaimSpan {
  claimId: string;
  /** character offsets into the answer text, [start, end) */
  start: number;
  end: number;
}

interface Placed { spans: ClaimSpan[]; loose: string[] }

const cache = new WeakMap<CaseDefinition, Map<string, Placed>>();

const STOP: Record<Locale, Set<string>> = {
  en: new Set(['the', 'and', 'was', 'that', 'this', 'with', 'for', 'you', 'but', 'not', 'had', 'his', 'her', 'she', 'him', 'have', 'has',
    'about', 'all', 'what', 'there', 'they', 'were', 'from', 'when', 'then', 'just', 'who', 'did', 'any', 'one', 'out', 'are', 'its',
    'it’s', 'i’m', 'don’t', 'didn’t', 'would', 'could', 'been', 'into', 'him.', 'our', 'your', 'very', 'yes', 'well']),
  tr: new Set(['bir', 'bu', 'şu', 'ama', 'için', 'gibi', 'çok', 'daha', 'ben', 'sen', 'biz', 'siz', 'onu', 'ona', 'onun', 'beni', 'bana',
    'benim', 'diye', 'kadar', 'sonra', 'önce', 'hiç', 'her', 'evet', 'hayır', 'değil', 'yok', 'var', 'olan', 'oldu', 'ile', 'mi', 'mı', 'de', 'da']),
};

function stems(text: string, locale: Locale): Set<string> {
  const words = text.toLocaleLowerCase(locale === 'tr' ? 'tr' : 'en').match(/[\p{L}\p{N}’']+/gu) ?? [];
  const out = new Set<string>();
  for (const w of words) {
    const word = w.replace(/[’']s$/, '').replace(/[’']/g, '');
    if (word.length < 3 && !/\d/.test(word)) continue;
    if (STOP[locale].has(word)) continue;
    out.add(word.slice(0, 5));
  }
  return out;
}

/** Sentence ranges of the spoken text; parenthesised stage directions are left out. */
function sentences(text: string): { start: number; end: number }[] {
  const out: { start: number; end: number }[] = [];
  const blocked: [number, number][] = [...text.matchAll(/\([^)]*\)/g)].map((m) => [m.index!, m.index! + m[0].length]);
  const isBlocked = (i: number) => blocked.some(([a, b]) => i >= a && i < b);
  let start = -1;
  const push = (end: number) => {
    if (start < 0) return;
    let a = start;
    let b = end;
    while (a < b && /\s/.test(text[a])) a++;
    while (b > a && /\s/.test(text[b - 1])) b--;
    if (b - a > 1) out.push({ start: a, end: b });
    start = -1;
  };
  for (let i = 0; i < text.length; i++) {
    if (isBlocked(i)) { push(i); continue; }
    if (start < 0) { if (/\s/.test(text[i])) continue; start = i; }
    if (/[.!?…]/.test(text[i])) {
      let j = i + 1;
      while (j < text.length && /[.!?…"”’]/.test(text[j]) && !isBlocked(j)) j++;
      push(j);
      i = j - 1;
    }
  }
  push(text.length);
  return out;
}

function place(def: CaseDefinition, suspect: SuspectDef, topicId: string, tier: number, text: string, locale: Locale): Placed {
  const topic = suspect.topics.find((t) => t.id === topicId);
  if (!topic) return { spans: [], loose: [] };
  const claims = claimsOf(suspect, topic, tier);
  const spans: ClaimSpan[] = [];
  const free = (a: number, b: number) => spans.every((x) => b <= x.start || a >= x.end);
  const todo: typeof claims = [];
  for (const c of claims) {
    const words = tx(c.anchor ?? c.text, locale).trim();
    const i = words ? text.indexOf(words) : -1;
    if (i >= 0 && free(i, i + words.length)) spans.push({ claimId: c.id, start: i, end: i + words.length });
    else todo.push(c);
  }
  const sents = sentences(text);
  // candidates: one sentence, or two/three neighbours when the claim sums up more than one sentence
  const cands: { start: number; end: number; stems: Set<string>; n: number }[] = [];
  for (let i = 0; i < sents.length; i++) {
    for (let n = 1; n <= 3 && i + n <= sents.length; n++) {
      const a = sents[i].start;
      const b = sents[i + n - 1].end;
      cands.push({ start: a, end: b, stems: stems(text.slice(a, b), locale), n });
    }
  }
  const scored: { claimId: string; start: number; end: number; score: number }[] = [];
  for (const c of todo) {
    const cs = stems(tx(c.text, locale), locale);
    if (!cs.size) continue;
    for (const cand of cands) {
      let hit = 0;
      for (const w of cs) if (cand.stems.has(w)) hit++;
      if (!hit) continue;
      // a longer span must earn its length
      const score = hit / cs.size - (cand.n - 1) * 0.18 - Math.max(0, cand.stems.size - cs.size * 2.5) * 0.01;
      scored.push({ claimId: c.id, start: cand.start, end: cand.end, score });
    }
  }
  scored.sort((a, b) => b.score - a.score || (a.end - a.start) - (b.end - b.start));
  const done = new Set(spans.map((x) => x.claimId));
  for (const x of scored) {
    if (x.score < 0.3 || done.has(x.claimId) || !free(x.start, x.end)) continue;
    spans.push({ claimId: x.claimId, start: x.start, end: x.end });
    done.add(x.claimId);
  }
  spans.sort((a, b) => a.start - b.start);
  return { spans, loose: claims.filter((c) => !done.has(c.id)).map((c) => c.id) };
}

/** Claim spans for one spoken tier answer, cached per case definition. */
export function claimSpans(def: CaseDefinition, suspect: SuspectDef, topicId: string, tier: number, text: string, locale: Locale): Placed {
  let m = cache.get(def);
  if (!m) { m = new Map(); if (Object.isFrozen(def)) cache.set(def, m); }
  const key = `${suspect.id}|${topicId}|${tier}|${locale}`;
  const hit = m.get(key);
  if (hit) return hit;
  const p = place(def, suspect, topicId, tier, text, locale);
  m.set(key, p);
  return p;
}
