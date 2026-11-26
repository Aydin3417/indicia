// SERVER-ONLY. The debrief: what really happened, and what this session found and missed.
import type { CaseResult } from '../../shared/api.ts';
import type { CaseDefinition, Locale } from './types.ts';
import { tx, txs } from './i18n.ts';
import type { SessionState } from './state.ts';
import { nameOf } from './projection.ts';

/** "What really happened" plus what this session found and missed. */
export function buildDebrief(def: CaseDefinition, st: SessionState, now: number, locale: Locale = 'en'): CaseResult['debrief'] {
  const key = def.accusation;
  const truth = def.truth;
  const evName = (id: string) => tx(def.evidence.find((e) => e.id === id)?.name ?? id, locale);
  const decisiveFound = key.decisiveEvidence.filter((e) => e in st.evidence).map((e) => ({ id: e, name: evName(e) }));
  const decisiveMissed = key.decisiveEvidence.filter((e) => !(e in st.evidence)).map((e) => ({ id: e, name: evName(e) }));

  const lies = def.statements.filter((s) => !s.truthful);
  const contradictedStatements = new Set(st.contradictions.map((c) => def.contradictions.find((x) => x.id === c)?.statementId));
  // lies exposed in the confrontation count too (a round won against them)
  const fin = st.v2?.finale;
  const refutedInFinale = new Set(
    (def.v2?.finale.rounds ?? []).flatMap((r, i) => (fin?.rounds[i]?.result === 'won' ? r.refutes ?? [] : [])),
  );
  const isUncovered = (sid: string) => {
    if (contradictedStatements.has(sid) || refutedInFinale.has(sid)) return true;
    // a lie is uncovered when the same speaker later told the truth on that topic
    const speaker = def.suspects.find((x) => x.id === def.statements.find((s) => s.id === sid)?.speakerId);
    return !!speaker?.topics.some((t) => {
      const lieTier = t.tiers.findIndex((tier) => tier.statements?.includes(sid));
      if (lieTier < 0) return false;
      return (st.suspects[speaker.id].tiers[t.id] ?? -1) > lieTier;
    });
  };
  const heard = (sid: string) => sid in st.statements || refutedInFinale.has(sid);
  const known = lies.filter((s) => heard(s.id));
  const liesUncovered = known.filter((s) => isUncovered(s.id)).map((s) => ({ speaker: nameOf(def, s.speakerId), text: tx(s.text, locale) }));
  const liesMissed = lies.filter((s) => !heard(s.id) || !isUncovered(s.id)).map((s) => ({ speaker: nameOf(def, s.speakerId), text: tx(s.text, locale) }));

  return {
    killerName: nameOf(def, truth.killerId),
    narrative: txs(truth.narrative, locale),
    decisiveFound,
    decisiveMissed,
    liesUncovered,
    liesMissed,
    contradictionsProven: st.contradictions.length,
    contradictionsTotal: def.contradictions.length,
    durationMinutes: Math.max(1, Math.round((now - st.startedAt) / 60000)),
  };
}
