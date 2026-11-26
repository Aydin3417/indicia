// SERVER-ONLY. Offline intent classifier: keyword groups → topic ids, plus tone.
import type { SuspectDef } from './types.ts';

export type Tone = 'neutral' | 'aggressive' | 'empathetic';

export interface Classification {
  topicIds: string[];
  tone: Tone;
}

const AGGRESSIVE = [
  'liar', 'lying', 'you lie', 'stop lying', 'murderer', 'killer', 'admit it', 'confess', 'bullshit', 'shut up',
  'i know you did', 'you did it', 'pathetic', 'disgusting', 'rot', 'prison', 'jail',
];
const EMPATHETIC = [
  'sorry for your loss', 'i\'m sorry', 'im sorry', 'must be hard', 'take your time', 'condolence', 'understand',
  'not accusing', 'help me', 'i believe you', 'how are you', 'are you ok', 'are you okay',
];

export function normalise(text: string): string {
  return text
    .replace(/İ/g, 'i')
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    // letters of any language (Turkish keywords: ç, ğ, ı, ö, ş, ü), digits, and a little punctuation
    .replace(/[^\p{L}\p{N}:'\s\-.]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function termHits(norm: string, tokens: string[], term: string): boolean {
  const t = term.toLowerCase();
  if (t.includes(' ') || t.includes(':') || /\d/.test(t)) return norm.includes(t);
  return tokens.some((tok) => tok.startsWith(t));
}

export function classifyOffline(suspect: SuspectDef, message: string): Classification {
  const norm = normalise(message);
  const tokens = norm.split(/[\s.\-]+/).filter(Boolean);
  const scored: { id: string; score: number; order: number }[] = [];
  // keywords[0] is the core group (must match for the topic to be a candidate);
  // later groups are context boosters. Distinct terms add weight; long/specific terms more.
  suspect.topics.forEach((topic, order) => {
    const [core, ...boosters] = topic.keywords;
    if (!core || !core.some((term) => termHits(norm, tokens, term))) return;
    let score = 1;
    const hit = new Set<string>();
    for (const group of topic.keywords) {
      for (const term of group) if (termHits(norm, tokens, term)) hit.add(term);
    }
    for (const group of boosters) if (group.some((term) => termHits(norm, tokens, term))) score += 1;
    for (const term of hit) score += term.length >= 6 || /\d/.test(term) ? 0.55 : 0.3;
    scored.push({ id: topic.id, score, order });
  });
  scored.sort((a, b) => b.score - a.score || a.order - b.order);

  let tone: Tone = 'neutral';
  const bangs = (message.match(/!/g) ?? []).length;
  if (AGGRESSIVE.some((w) => norm.includes(w)) || bangs >= 3 || (message.length > 12 && message === message.toUpperCase() && /[A-Z]/.test(message))) {
    tone = 'aggressive';
  } else if (EMPATHETIC.some((w) => norm.includes(w))) {
    tone = 'empathetic';
  }
  return { topicIds: scored.map((s) => s.id), tone };
}
