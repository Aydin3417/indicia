import type { ChipType, DeductionBlankView, DeductionView, FactView, InvestigationView } from '../../../shared/api';
import type { AnyChip } from './kit';

/** id → chip for everything the player holds (facts, evidence, people, times, places, confirmed deductions). */
export function chipIndex(view: InvestigationView): Map<string, AnyChip> {
  const m = new Map<string, AnyChip>();
  const c = view.chips;
  for (const list of [c.facts, c.evidence, c.people, c.times, c.places]) for (const x of list) if (!m.has(x.id)) m.set(x.id, x);
  for (const d of c.deductions) m.set(d.id, { ...d, type: 'deduction' });
  return m;
}

/** Small stable string hash (FNV-1a), for orders that must not change between renders. */
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}

/**
 * The people offered for a "who" blank. The server lists suspects first, always in the same order, so the same name
 * sat in the same place in every question and the answer could be read off the tray. Here each question gets its own
 * stable shuffle of the living (the victim goes last: rarely the answer to "who did this"), so the tray never points.
 */
export function peopleForBlank(view: InvestigationView, seed: string): AnyChip[] {
  const victim = view.briefing?.victim?.id;
  const living = view.chips.people.filter((p) => p.id !== victim);
  const dead = view.chips.people.filter((p) => p.id === victim);
  const keyed = living.map((p) => ({ p, k: hash(`${seed}|${p.id}`) }));
  keyed.sort((a, b) => a.k - b.k || a.p.id.localeCompare(b.p.id));
  return [...keyed.map((x) => x.p), ...dead];
}

/**
 * Times in the order the night ran (wave 8): the server sorts "HH:MM" as text, so a case whose night crosses
 * midnight listed 00:40 before 21:15. When the set holds both evening (≥ 18:00) and small hours (< 12:00), the
 * morning half counts as the next day.
 */
function nightOrder<T extends { id: string }>(times: T[]): T[] {
  const h = (id: string) => Number(id.slice(0, 2)) * 60 + Number(id.slice(3, 5));
  const all = times.map((x) => h(x.id)).filter((m) => Number.isFinite(m));
  if (!(all.some((m) => m >= 18 * 60) && all.some((m) => m < 12 * 60))) return times;
  const key = (id: string) => { const m = h(id); return m < 12 * 60 ? m + 24 * 60 : m; };
  return [...times].sort((a, b) => key(a.id) - key(b.id));
}

/** Chips that fit a blank (`seed`: the question's id, for a per-question order of people). */
export function chipsForBlank(view: InvestigationView, blank: DeductionBlankView, seed = ''): AnyChip[] {
  switch (blank.type) {
    case 'fact': return view.chips.facts;
    case 'evidence': return view.chips.evidence;
    case 'person': return peopleForBlank(view, `${seed}:${blank.id}`);
    case 'time': return nightOrder(view.chips.times);
    case 'place': return view.chips.places;
    case 'choice': return (blank.options ?? []).map((o) => ({ type: 'choice' as ChipType, id: o.id, label: o.text }));
  }
}

/** Label for a value placed in a blank. */
export function labelFor(view: InvestigationView, blank: DeductionBlankView, value: string, index = chipIndex(view)): string {
  if (blank.type === 'choice') return blank.options?.find((o) => o.id === value)?.text ?? value;
  return index.get(value)?.label ?? value;
}

export type Token = { kind: 'text'; text: string } | { kind: 'blank'; id: string };

/** Split a prompt with {blankId} tokens. */
export function tokenize(prompt: string, blanks: DeductionBlankView[] = []): Token[] {
  const ids = new Set(blanks.map((b) => b.id));
  const out: Token[] = [];
  const re = /\{(\w[\w-]*)\}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(prompt))) {
    if (!ids.has(m[1])) continue;
    if (m.index > last) out.push({ kind: 'text', text: prompt.slice(last, m.index) });
    out.push({ kind: 'blank', id: m[1] });
    last = m.index + m[0].length;
  }
  if (last < prompt.length) out.push({ kind: 'text', text: prompt.slice(last) });
  return out;
}

/** The prompt as plain text, with blanks shown as a line or as their accepted fill. */
export function sentence(view: InvestigationView, d: DeductionView, blankText = '____', index = chipIndex(view)): string {
  return tokenize(d.prompt, d.blanks).map((tk) => {
    if (tk.kind === 'text') return tk.text;
    const b = d.blanks!.find((x) => x.id === tk.id)!;
    return b.filled ? labelFor(view, b, b.filled, index) : blankText;
  }).join('');
}

/** People a fact is about, for filtering. */
export const factAbout = (facts: FactView[]) => new Map(facts.map((f) => [f.id, f.about] as const));
