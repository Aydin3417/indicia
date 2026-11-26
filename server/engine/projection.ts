// SERVER-ONLY. Shared projection helpers (names, plans, hints, briefing, room). The investigation view itself
// is built in ./v2/projection.ts.
import type { BriefingView, PlanShape as PlanShapeView, RoomView } from '../../shared/api.ts';
import type { CaseDefinition, Locale, PlanShape } from './types.ts';
import { tx, txs } from './i18n.ts';
import type { SessionState } from './state.ts';
import { MAX_PLAYERS, meets } from './state.ts';

export function nameOf(def: CaseDefinition, id: string): string {
  return def.suspects.find((s) => s.id === id)?.name ?? def.people.find((p) => p.id === id)?.name ?? id;
}

export function planView(plan: PlanShape[], locale: Locale): PlanShapeView[] {
  return plan.map((p) => {
    if (p.t === 'rect') return { ...p, label: p.label === undefined ? undefined : tx(p.label, locale) };
    if (p.t === 'text') return { ...p, text: tx(p.text, locale) };
    return p;
  });
}

export function hintAvailable(def: CaseDefinition, st: SessionState) {
  return def.hints.find((h) => !st.hintsUsed.includes(h.id) && meets(h.requires, st) && !(h.until && meets(h.until, st)));
}

export function briefingView(def: CaseDefinition, locale: Locale): BriefingView {
  const L = (t: Parameters<typeof tx>[0]) => tx(t, locale);
  const victim = def.people.find((p) => p.id === def.briefing.victim.personId)!;
  return {
    issuedBy: L(def.briefing.issuedBy),
    date: L(def.briefing.date),
    location: L(def.briefing.location),
    victim: { id: victim.id, name: victim.name, role: L(victim.role), description: L(victim.description), summary: L(def.briefing.victim.summary) },
    incidentReport: txs(def.briefing.incidentReport, locale),
    preliminaryFindings: txs(def.briefing.preliminaryFindings, locale),
    knownWitnesses: def.briefing.knownWitnesses.map((id) => def.people.find((p) => p.id === id)!).filter(Boolean)
      .map((p) => ({ id: p.id, name: p.name, role: L(p.role), description: L(p.description) })),
    objectives: txs(def.briefing.objectives, locale),
  };
}

/** The co-op room without its activity (localised by the caller). */
export function roomView(st: SessionState, viewerId: string, online: string[]): Omit<RoomView, 'activity'> | undefined {
  if (st.mode !== 'coop' || !st.roomCode) return undefined;
  return {
    code: st.roomCode,
    hostId: st.hostId,
    isHost: viewerId === st.hostId,
    locked: st.roomLocked,
    maxPlayers: MAX_PLAYERS,
    players: Object.entries(st.players)
      .sort((a, b) => a[1].joinedAt - b[1].joinedAt)
      .map(([id, p]) => ({ id, name: p.name, role: p.role, online: id === viewerId || online.includes(id) })),
  };
}
