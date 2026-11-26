// SERVER-ONLY. Truth + v2 session state → InvestigationView, in one language.
// Never included: accepted fills, blank solutions, finale answers, break/press tables, hidden zones,
// undiscovered facts or details, killer identity, timeline order.
import type {
  ChipView, ClaimView, DayReportView, DeductionDraftView, DeductionView, EvidenceV2View, FactView, FinaleView, InterviewLineView, InvestigationView,
  LabOptionView, NightForkView, PlaceView, SceneView, Segment, SuspectV2View, TeammateMark, TeamView, ZoneView,
} from '../../../shared/api.ts';
import type { AvailabilityWindow, CaseDefinition, Locale, Text } from '../types.ts';
import type { SessionState } from '../state.ts';
import { meets } from '../state.ts';
import { composureOf } from '../interrogation.ts';
import { briefingView, hintAvailable, nameOf, planView, roomView } from '../projection.ts';
import { parseMarkup, stripMarkup, sys, tx, txs, type SysKey } from '../i18n.ts';
import {
  absNow, calendarLeft, claimsOf, clockLabel, costsOf, deductionVisible, elapsedOf, gameTime, hm, indexOf, locationOpen, patienceOf,
  proofNeeds, remainingToday, totalBudget, zoneListed, type LogEntry, type V2State,
} from './state.ts';
import { asPlayer, isDone, leftFor, membersOf, notesOf, privateLocation, teamOf } from './coop.ts';
import {
  knownTimes, labMinutes, labStatus, LATE_WRONG_LIMIT, nudgeText, owns, pressState, resistText, resultView, suspectAvailableNow, topicAvailable,
  WAIT_MAX, WAIT_MIN, waitMinutes, type Ctx,
} from './actions.ts';
import { claimSpans } from './anchors.ts';

export function projectV2(
  def: CaseDefinition,
  st: SessionState,
  sessionId: string,
  viewerId: string = st.hostId,
  online: string[] = [],
  locale: Locale = 'en',
): InvestigationView {
  // co-op: the viewer sees the case from their own clock and place (wave 5)
  return asPlayer(def, st, st.mode === 'coop' ? viewerId : undefined, () => project(def, st, sessionId, viewerId, online, locale));
}

function project(def: CaseDefinition, st: SessionState, sessionId: string, viewerId: string, online: string[], locale: Locale): InvestigationView {
  const v2 = def.v2!;
  const s = st.v2!;
  const L = (t: Text | undefined) => tx(t, locale);
  const ctx: Ctx = { def, st, now: 0, locale, actorId: viewerId };
  const team = teamOf(def, st);
  const notes = notesOf(st, viewerId);
  const others = team ? membersOf(st).filter((id) => id !== viewerId && team.clocks[id]) : [];
  const nameOfMember = (id: string) => st.players[id]?.name ?? sys('former_member', locale);
  const who = (id: string) => ({ id, name: nameOfMember(id), you: id === viewerId });
  const isOnline = (id: string) => id === viewerId || online.includes(id);
  const req = (r: Parameters<typeof meets>[0]) => meets(r, st);
  const seen = s.seen[viewerId] ?? 0;
  const costs = costsOf(v2);
  const at = (day: number, minute: number) => ({ day, minute, label: clockLabel(hm(v2.clock.dayStart) + minute) });
  const abs = absNow(v2, s);

  // ── clock
  const remaining = remainingToday(v2, s);
  const cheapest = Math.min(costs.press, costs.present, costs.closeUp, costs.travel, costs.freeQuestion, costs.startInterview, costs.tool);
  const dayEndMin = hm(v2.clock.dayStart) + v2.clock.minutesPerDay;

  // ── the Clock star, made legible: "go to the prosecutor by day D, HH:MM"
  const clockStarView = () => {
    const share = v2.finale.stars?.clockRemaining ?? 0.25;
    const need = Math.ceil(totalBudget(v2, s) * share);
    const latest = totalBudget(v2, s) - need; // the latest elapsed minute that still earns the star
    // co-op: elapsed is counted in one investigator's budget per day
    const perDay = team ? team.budget : v2.clock.minutesPerDay;
    const day = Math.min(v2.clock.days, Math.floor(latest / perDay) + 1);
    const minute = latest - (day - 1) * perDay;
    const decided = s.finale ? s.finale.stars?.clock : undefined;
    return {
      minutesLeftNeeded: need, share, by: at(day, minute), ...(team ? { work: minute } : {}),
      state: decided !== undefined ? (decided ? 'won' as const : 'lost' as const) : elapsedOf(v2, s) <= latest ? 'open' as const : 'lost' as const,
    };
  };

  // ── map & scenes
  const places: PlaceView[] = def.locations
    .filter((l) => locationOpen(def, s, req, l.id))
    .map((l) => {
      const scene = v2.scenes.find((sc) => sc.locationId === l.id);
      return {
        id: l.id, name: L(l.name), summary: L(l.summary), here: s.location === l.id,
        travelCost: s.location === l.id ? 0 : l.v2?.travel ?? costs.travel,
        hasScene: !!scene,
        zonesLeft: scene ? scene.zones.filter((z) => (z.reveal ?? 'visible') === 'visible' && zoneListed(s, req, z) && !s.zones.includes(z.id)).length : 0,
        ...(team ? {
          team: others.flatMap((id): TeammateMark[] => {
            const it = team.intents[id];
            if (team.clocks[id].location === l.id) return [{ id, name: nameOfMember(id), status: 'here' }];
            if (it?.kind === 'go' && it.target === l.id) return [{ id, name: nameOfMember(id), status: 'heading' }];
            return [];
          }),
          ...(privateLocation(def, l.id) && membersOf(st).length >= 2 ? { private: true } : {}),
        } : {}),
      };
    });

  const scenes: SceneView[] = v2.scenes
    .filter((sc) => locationOpen(def, s, req, sc.locationId))
    .map((sc) => {
      const loc = def.locations.find((l) => l.id === sc.locationId)!;
      const zones: ZoneView[] = sc.zones.filter((z) => zoneListed(s, req, z)).map((z) => {
        const inspected = s.zones.includes(z.id);
        return {
          id: z.id, label: L(z.label), shape: z.shape, reveal: z.reveal ?? 'visible', inspected,
          closeUp: inspected ? {
            text: L(z.closeUp.text), art: z.closeUp.art,
            details: z.details.map((d) => {
              const found = s.details.includes(`${z.id}/${d.id}`);
              return {
                id: d.id, x: d.x, y: d.y, r: d.r ?? 0.08, tool: d.tool, found,
                ...(found ? { label: L(d.label), text: d.text === undefined ? undefined : L(d.text), newFacts: d.facts ?? [], newEvidence: d.evidence ?? [] } : {}),
              };
            }),
          } : undefined,
        };
      });
      return { locationId: sc.locationId, name: L(loc.name), art: sc.art, plan: planView(loc.plan, locale), zones, probeTools: ['uv', 'dust'] as ('uv' | 'dust')[] };
    });

  // ── notebook
  const factLabel = (src: V2State['facts'][string]['src']): string => {
    switch (src.type) {
      case 'document': return L(def.evidence.find((e) => e.id === src.ref)?.name);
      case 'scene': return L(indexOf(def).zones.get(String(src.ref).split('/')[0])?.zone.label);
      case 'claim':
      case 'press': return indexOf(def).claims.get(src.ref ?? '')?.suspect.name ?? '';
      case 'lab': return L(def.analyses.find((a) => a.id === src.ref)?.name);
      case 'deduction': return L(indexOf(def).deductions.get(src.ref ?? '')?.title);
      case 'night': return L(v2.nightEvents?.find((e) => e.id === src.ref)?.title);
      default: return L(def.briefing.issuedBy);
    }
  };
  // co-op: your private notes are in your notebook, marked; the team does not see them
  const facts: FactView[] = [
    ...Object.entries(s.facts).map(([id, f]) => [id, f, false] as const),
    ...Object.entries(notes?.facts ?? {}).filter(([id]) => !(id in s.facts)).map(([id, f]) => [id, f, true] as const),
  ]
    .sort((a, b) => a[1].seq - b[1].seq)
    .map(([id, f, priv]) => {
      const d = v2.facts.find((x) => x.id === id)!;
      return {
        id, text: L(d.text), time: d.time, about: d.about ?? [], source: { type: f.src.type, ref: f.src.ref, label: factLabel(f.src) }, found: at(f.day, f.minute), isNew: f.seq > seen,
        ...(priv ? { private: true } : {}),
      };
    });

  const analysesOf = (evidenceId: string): LabOptionView[] => def.analyses.filter((a) => a.evidenceId === evidenceId).map((a) => {
    const status = labStatus(ctx, a.id);
    const job = s.lab.find((j) => j.analysisId === a.id);
    return {
      id: a.id, name: L(a.name), discipline: a.discipline, minutes: labMinutes(a), status,
      lockedReason: status === 'locked' && a.lockedReason ? L(a.lockedReason) : undefined,
      readyAt: job ? gameTime(v2, job.readyAt) : undefined,
      ...(status === 'done' ? { result: txs(a.result, locale), conclusion: L(a.conclusion) } : {}),
    };
  });

  const segmentsOf = (evidenceId: string, line: Text, i: number): Segment[] =>
    parseMarkup(L(line)).map((seg): Segment => {
      if (!seg.factId) return { text: seg.text };
      const collected = seg.factId in s.facts || !!notes?.facts[seg.factId];
      return { text: seg.text, key: `${i}.${seg.n}`, mark: seg.subtle ? 'plain' : 'underline', collected, factId: collected ? seg.factId : undefined };
    });

  const privEvidence = Object.keys(notes?.evidence ?? {}).filter((id) => !(id in st.evidence));
  const evidence: EvidenceV2View[] = [...Object.keys(st.evidence).sort((a, b) => st.evidence[a] - st.evidence[b]), ...privEvidence]
    .map((id) => {
      const e = def.evidence.find((x) => x.id === id)!;
      const priv = !(id in st.evidence);
      const f = (priv ? notes!.evidence[id] : s.evidenceFound[id]) ?? { day: 1, minute: 0, seq: 0 };
      return {
        ...(priv ? { private: true } : {}),
        id, code: e.code, name: L(e.name), kind: e.kind, description: stripMarkup(L(e.description)),
        body: e.body?.map((line, i) => segmentsOf(id, line, i)),
        foundAt: L(e.foundAt), reliability: e.reliability,
        locationName: e.locationId ? L(def.locations.find((l) => l.id === e.locationId)?.name) : undefined,
        relatedPeople: e.relatedPeople.map((p) => ({ id: p, name: nameOf(def, p) })),
        found: at(f.day, f.minute), isNew: f.seq > seen, analyses: analysesOf(id),
      };
    });

  // ── lab
  const jobs = s.lab.map((j) => {
    const a = def.analyses.find((x) => x.id === j.analysisId)!;
    return {
      analysisId: a.id, evidenceId: a.evidenceId, name: L(a.name),
      status: j.collected ? 'collected' as const : j.readyAt <= abs ? 'ready' as const : 'running' as const,
      submitted: gameTime(v2, j.submittedAt), readyAt: gameTime(v2, j.readyAt), minutesLeft: Math.max(0, j.readyAt - abs),
    };
  });

  // ── suspects
  const lineText = (e: LogEntry): string => {
    const sus = def.suspects.find((x) => x.id === e.suspectId)!;
    const ref = e.ref;
    if (e.from === 'player') {
      if (e.action === 'ask') return e.text ?? '';
      if (e.action === 'topic') return L(sus.topics.find((t) => t.id === e.topicId)?.label);
      if (e.action === 'press' || e.action === 'present') return L(indexOf(def).claims.get(e.claimId ?? '')?.claim.text);
      return '';
    }
    switch (ref.k) {
      case 'opening': return L(sus.opening);
      case 'tier': return L(sus.topics.find((t) => t.id === ref.topic)?.tiers[ref.tier]?.line);
      case 'repeat': {
        const t = sus.topics.find((x) => x.id === ref.topic)?.tiers[ref.tier];
        return t?.variants?.length ? L(t.variants[ref.n % t.variants.length]) : L(t?.line);
      }
      case 'press': return L(indexOf(def).claims.get(ref.claim)?.claim.press?.line);
      case 'resist': return resistText(def, sus, ref, locale);
      case 'dismiss': return sus.dismissals.length ? L(sus.dismissals[ref.n % sus.dismissals.length]) : sys('wrong_present', locale);
      case 'deflect': return L(sus.deflections[ref.n % sus.deflections.length]);
      case 'sys': return sys(ref.key, locale);
      default: return '';
    }
  };
  const emotionOf = (e: LogEntry) => {
    if (e.ref.k === 'tier') {
      const r = e.ref;
      return def.suspects.find((x) => x.id === e.suspectId)?.topics.find((t) => t.id === r.topic)?.tiers[r.tier]?.emotion;
    }
    if (e.ref.k === 'dismiss') return 'irritated' as const;
    return undefined;
  };

  const suspects: SuspectV2View[] = def.suspects.map((sus) => {
    const ss = st.suspects[sus.id];
    const iv = s.interviews[sus.id];
    const topics = sus.topics
      .filter((t) => (ss.tiers[t.id] ?? -1) >= 0 || topicAvailable(ctx, sus, t))
      .map((t) => {
        const tier = ss.tiers[t.id] ?? -1;
        const claims: ClaimView[] = [];
        for (let i = 0; i <= tier; i++) {
          for (const c of claimsOf(sus, t, i)) {
            const cs = s.claims[c.id] ?? {};
            const status = cs.broken ? 'broken' : i === tier ? 'active' : 'superseded';
            const press = status === 'active' ? pressState(ctx, sus.id, c.id) : cs.pressed ? 'done' : 'none';
            claims.push({
              id: c.id, text: L(c.text), status, pressed: !!cs.pressed, canPress: status === 'active' && (press === 'yes' || press === 'free'),
              press, pressCost: press === 'yes' ? costs.press : 0,
            });
          }
        }
        return { id: t.id, label: L(t.label), state: tier >= 0 ? 'open' as const : 'available' as const, tier, claims };
      });
    const windows = v2.clock.availability?.[sus.id];
    const log: InterviewLineView[] = s.log.filter((e) => e.suspectId === sus.id).map((e) => {
      const text = lineText(e);
      const r = e.ref;
      // an answer carries its claims as spans inside the spoken words (claims that match no words come as `loose`)
      const spans = r.k === 'tier' ? claimSpans(def, sus, r.topic, r.tier, text, locale) : undefined;
      return {
        seq: e.seq, at: at(e.day, e.minute), from: e.from, text, emotion: emotionOf(e),
        action: e.action, claimId: e.claimId, itemId: e.itemId, outcome: e.outcome,
        authorName: e.actorId ? st.players[e.actorId]?.name : undefined,
        ...(spans ? { claims: spans.spans, looseClaims: spans.loose } : {}),
      };
    });
    return {
      id: sus.id, name: sus.name, age: sus.age, occupation: L(sus.occupation), relationship: L(sus.relationship),
      publicProfile: L(sus.publicProfile), initials: sus.initials, portraitTone: sus.portraitTone, composure: composureOf(ss),
      pressure: Math.round(Math.max(0, Math.min(100, ss.stress))),
      availableNow: s.phase === 'investigating' && suspectAvailableNow(v2, s, sus.id) && iv.refusedDay !== s.day,
      availability: (windows ?? Array.from({ length: v2.clock.days }, (_, i): AvailabilityWindow => ({ day: i + 1 }))).map((w) => ({
        day: w.day, from: clockLabel(hm(v2.clock.dayStart) + (w.from ?? 0)), to: clockLabel(hm(v2.clock.dayStart) + (w.to ?? v2.clock.minutesPerDay)),
        note: w.note === undefined ? undefined : L(w.note),
      })),
      interview: {
        open: iv.open,
        patience: iv.patienceDay === s.day ? iv.patience : patienceOf(sus),
        maxPatience: patienceOf(sus),
        refusedToday: iv.refusedDay === s.day,
        ...(team && iv.open && iv.by && iv.by in st.players ? { heldBy: who(iv.by) } : {}),
      },
      ...(team ? {
        team: others.flatMap((id): TeammateMark[] => {
          if (iv.open && iv.by === id) return [{ id, name: nameOfMember(id), status: 'questioning' }];
          const it = team.intents[id];
          return it?.kind === 'interview' && it.target === sus.id ? [{ id, name: nameOfMember(id), status: 'heading' }] : [];
        }),
      } : {}),
      topics,
      log,
    };
  });

  // ── co-op labels: what a chip value is called (fact text, evidence name, person, place, option, time)
  const itemLabel = (id: string): string => {
    const f = v2.facts.find((x) => x.id === id);
    if (f) return L(f.text);
    const e = def.evidence.find((x) => x.id === id);
    if (e) return `${e.code} ${L(e.name)}`;
    const d = indexOf(def).deductions.get(id);
    if (d) return L(d.title);
    const p = [...def.suspects, ...def.people].find((x) => x.id === id);
    if (p) return p.name;
    const l = def.locations.find((x) => x.id === id);
    if (l) return L(l.name);
    return id;
  };
  const valueLabel = (deductionId: string, blankId: string, value: string): string => {
    const d = indexOf(def).deductions.get(deductionId);
    if (d?.kind === 'timeline') return L(d.cards?.find((c) => c.id === value)?.text) || value;
    const b = d?.blanks?.find((x) => x.id === blankId);
    if (b?.type === 'choice') return L(b.options?.find((o) => o.id === value)?.text) || value;
    if (b?.type === 'time') return value;
    return itemLabel(value);
  };
  const draftView = (deductionId: string): DeductionDraftView => {
    const dr = team!.drafts[deductionId];
    return {
      fills: Object.entries(dr.fills).map(([blankId, value]) => ({ blankId, value, label: valueLabel(deductionId, blankId, value) })),
      order: dr.order, outlier: dr.outlier, by: who(dr.by),
      suggestions: dr.suggestions.map((x) => ({ by: who(x.by), blankId: x.blank, value: x.value, label: valueLabel(deductionId, x.blank, x.value) })),
    };
  };

  // ── deductions
  const deductions: DeductionView[] = v2.deductions
    .filter((d) => deductionVisible(s, (r) => meets(r, st), d) || s.deductions[d.id]?.confirmed)
    .map((d) => {
      const rec = s.deductions[d.id];
      const confirmed = !!rec?.confirmed;
      const firstSeen = s.reports.length === 0 || !s.dayStart.visibleDeductions.includes(d.id);
      return {
        id: d.id, kind: d.kind, title: L(d.title), prompt: L(d.prompt), status: confirmed ? 'confirmed' : 'open',
        attempts: rec?.attempts ?? 0,
        blanks: d.blanks?.map((b) => ({
          id: b.id, type: b.type, label: b.label === undefined ? undefined : L(b.label),
          options: b.options?.map((o) => ({ id: o.id, text: L(o.text) })),
          filled: confirmed ? rec?.fills?.[b.id] : undefined,
        })),
        // open: a stable shuffle keyed by case + card id (ids like k1…k6 would give the answer away);
        // confirmed: the order the player proved
        cards: d.cards ? cardOrder(def.id, d.cards, confirmed ? rec?.order : undefined, d.order ?? []).map((c) => ({ id: c.id, text: L(c.text), time: c.time })) : undefined,
        hasOutlier: d.kind === 'timeline' ? d.outlier !== undefined : undefined,
        setAside: confirmed && d.kind === 'timeline' ? d.outlier : undefined,
        confirmText: confirmed ? L(d.confirmText) : undefined,
        isNew: !confirmed && !rec && firstSeen,
        nudge: !confirmed && rec?.nudge ? nudgeText(d, rec.nudge, locale) : undefined,
        triesLeft: confirmed ? undefined
          : s.phase === 'awaiting_finale' ? Math.max(0, LATE_WRONG_LIMIT - (rec?.late ?? 0))
            // wave 6: less time left today than a miss costs → misses are capped per question until tomorrow
            : s.phase === 'investigating' && remainingToday(v2, s) < costs.wrongDeduction ? Math.max(0, LATE_WRONG_LIMIT - (rec?.short ?? 0))
              : undefined,
        ...(team && !confirmed && team.drafts[d.id] ? { draft: draftView(d.id) } : {}),
      };
    });

  // ── chips
  const chips: InvestigationView['chips'] = {
    facts: facts.filter((f) => !f.private).map((f): ChipView => ({ type: 'fact', id: f.id, label: f.text })),
    evidence: evidence.filter((e) => !e.private).map((e): ChipView => ({ type: 'evidence', id: e.id, label: `${e.code} ${e.name}` })),
    people: [...def.suspects.map((x) => ({ type: 'person' as const, id: x.id, label: x.name })), ...def.people.map((p) => ({ type: 'person' as const, id: p.id, label: p.name }))],
    times: knownTimes(def, s).map((t) => ({ type: 'time' as const, id: t, label: t })),
    places: places.map((p) => ({ type: 'place' as const, id: p.id, label: p.name })),
    deductions: deductions.filter((d) => d.status === 'confirmed').map((d) => ({ type: 'fact' as const, id: d.id, label: d.title })),
  };

  // ── night forks (wave 4)
  const forkView = (r: V2State['reports'][number], pending: boolean): NightForkView | undefined => {
    const ev = r.fork ? v2.nightEvents?.find((e) => e.id === r.fork!.id) : undefined;
    if (!ev?.choice || !r.fork) return undefined;
    return {
      id: ev.id, title: L(ev.title), text: L(ev.text), prompt: L(ev.choice.prompt),
      options: ev.choice.options.map((o) => {
        const a = o.lab ? def.analyses.find((x) => x.id === o.lab) : undefined;
        return {
          id: o.id, label: L(o.label), text: L(o.text), minutes: o.minutes ?? 0,
          lab: a ? { analysisId: a.id, name: L(a.name), minutes: labMinutes(a) } : undefined,
        };
      }),
      defaultOption: ev.choice.options[0].id, chosen: r.fork.chosen, pending,
      newFacts: r.fork.facts, newEvidence: r.fork.evidence,
    };
  };

  // ── day reports
  const reports: DayReportView[] = s.reports.map((r, i) => {
    const night = r.night ? v2.nightEvents?.find((e) => e.id === r.night!.id) : undefined;
    return {
      day: r.day,
      facts: r.facts.map((id) => ({ id, text: L(v2.facts.find((f) => f.id === id)?.text) })),
      evidence: r.evidence.map((id) => ({ id, name: L(def.evidence.find((e) => e.id === id)?.name) })),
      deductionsConfirmed: r.deductionsConfirmed.map((id) => ({ id, title: L(indexOf(def).deductions.get(id)?.title) })),
      deductionsOpened: r.deductionsOpened.map((id) => ({ id, title: L(indexOf(def).deductions.get(id)?.title) })),
      labsReady: r.labsReady.map((id) => ({ analysisId: id, name: L(def.analyses.find((a) => a.id === id)?.name) })),
      labsRunning: r.labsRunning.map((id) => {
        const job = s.lab.find((j) => j.analysisId === id)!;
        return { analysisId: id, name: L(def.analyses.find((a) => a.id === id)?.name), readyAt: gameTime(v2, job.readyAt) };
      }),
      unusedMinutes: r.unusedMinutes,
      night: night && r.night ? { id: r.night.id, title: L(night.title), text: L(night.text), newFacts: r.night.facts, newEvidence: r.night.evidence } : undefined,
      fork: forkView(r, s.pendingFork === i && !r.fork?.chosen),
    };
  });
  const pendingFork = s.phase === 'investigating' && s.pendingFork !== undefined ? reports[s.pendingFork]?.fork : undefined;
  const needs = proofNeeds(v2);

  // ── finale
  let finale: FinaleView | undefined;
  if (s.finale) {
    const f = s.finale;
    const accused = def.suspects.find((x) => x.id === f.accusedId)!;
    const inn = v2.finale.innocents[f.accusedId];
    finale = {
      accusedId: f.accusedId, accusedName: accused.name, status: f.status, intro: L(v2.finale.intro), roundIndex: f.index,
      rounds: f.culprit ? v2.finale.rounds.map((r, i) => {
        const rs = f.rounds[i];
        const status = rs.result ?? (i === f.index && f.status === 'running' ? 'current' : 'pending');
        const assisted = (r.assist ?? []).some((d) => s.deductions[d]?.confirmed);
        return {
          id: r.id, kind: r.kind, defence: i <= f.index ? L(r.defence) : '', prompt: i <= f.index ? L(r.prompt) : '',
          status, triesLeft: status === 'current' ? f.tries : rs.result ? 0 : 2, firstTry: rs.result ? rs.firstTry : undefined,
          // earned help: accepted chips the player holds, only for rounds linked to a confirmed deduction
          suggested: status === 'current' && assisted ? r.accept.filter((id) => owns(ctx, id, true)) : [],
          reaction: rs.result === 'won' ? L(r.win) : rs.result === 'lost' ? L(r.lose) : undefined,
        };
      }) : [],
      collapse: !f.culprit && inn ? { defence: L(inn.defence), text: L(inn.collapse) } : undefined,
      confession: f.outcome === 'confession' ? L(v2.finale.confession.line) : undefined,
      ...(team && f.status === 'running' ? {
        suggestions: team.finale.filter((x) => x.round === f.index && x.by in st.players).sort((a, b) => a.seq - b.seq)
          .map((x) => ({ by: who(x.by), itemId: x.item, label: itemLabel(x.item) })),
      } : {}),
    };
  }

  // ── co-op team (wave 5)
  let teamView: TeamView | undefined;
  if (team) {
    teamView = {
      perPlayer: team.budget, teamSize: membersOf(st).length,
      members: membersOf(st).map((id) => {
        const live = id === viewerId;
        const c = team.clocks[id] ?? { minute: 0, used: 0, location: v2.clock.startLocationId, spent: 0 };
        const clock = live ? { ...c, minute: s.minute, used: s.used ?? c.used, location: s.location } : c;
        const it = team.intents[id];
        const held = Object.entries(s.interviews).find(([, iv]) => iv.open && iv.by === id)?.[0];
        const n = team.notes[id];
        return {
          id, name: nameOfMember(id), isLead: id === st.hostId, isYou: live, online: isOnline(id),
          location: clock.location,
          locationName: clock.location ? L(def.locations.find((l) => l.id === clock.location)?.name) : sys('station', locale),
          timeLabel: clockLabel(hm(v2.clock.dayStart) + clock.minute), used: clock.used,
          remaining: s.phase === 'investigating' ? leftFor(v2, team, clock) : 0,
          done: s.phase !== 'investigating' || isDone(v2, s, team, clock),
          ...(it ? { intent: { kind: it.kind, target: it.target, label: it.kind === 'lab' ? L(def.analyses.find((a) => a.id === it.target)?.name) : itemLabel(it.target) } } : {}),
          ...(held ? { questioning: { id: held, name: nameOf(def, held) } } : {}),
          privateNotes: n ? Object.keys(n.facts).length + Object.keys(n.evidence).length : 0,
        };
      }),
    };
  }

  const hintOpen = s.phase === 'investigating' && !!hintAvailable(def, st);
  const next = jobs.filter((j) => j.status === 'running').sort((a, b) => a.minutesLeft - b.minutesLeft)[0];
  const room = roomView(st, viewerId, online);
  return {
    sessionId, status: st.status, version: st.version, mode: st.mode, you: viewerId,
    room: room ? {
      ...room,
      activity: st.activity.slice(-30).reverse().map((a) => ({
        at: a.at, actor: st.players[a.actorId]?.name ?? sys('former_member', locale),
        text: a.key ? sys(a.key as SysKey, locale, ...(a.args ?? []).map((x) => refText(def, x, locale))) : a.text,
      })),
    } : undefined,
    locale, startedAt: st.startedAt, phase: s.phase,
    case: {
      id: def.id, title: L(def.meta.title), caseNumber: def.meta.caseNumber, tagline: L(def.meta.tagline), difficulty: def.meta.difficulty, setting: L(def.meta.setting),
      tutorial: !!def.meta.tutorial, crime: def.meta.crime ?? 'murder',
    },
    fork: pendingFork?.pending ? pendingFork : undefined,
    proofStar: {
      deductionsNeeded: needs.deductions, deductionsConfirmed: Object.values(s.deductions).filter((d) => d.confirmed).length,
      deductionsTotal: v2.deductions.length, firstTryNeeded: needs.firstTry, roundsTotal: v2.finale.rounds.length,
    },
    briefing: briefingView(def, locale),
    clock: {
      day: s.day, days: v2.clock.days, minute: s.minute, minutesPerDay: v2.clock.minutesPerDay, remainingToday: remaining,
      timeLabel: clockLabel(hm(v2.clock.dayStart) + s.minute), dayStart: v2.clock.dayStart, dayEnd: clockLabel(dayEndMin),
      totalBudget: totalBudget(v2, s), spent: s.spent, elapsed: elapsedOf(v2, s), costs, lastDay: s.day >= v2.clock.days,
      dayOver: s.phase === 'investigating' && remaining < cheapest,
      clockStar: clockStarView(),
      waits: s.phase === 'investigating' ? {
        lab: waitMinutes(ctx, 'lab'),
        suspects: def.suspects.flatMap((x) => { const m = waitMinutes(ctx, x.id); return m === undefined ? [] : [{ id: x.id, minutes: m }]; }),
        min: WAIT_MIN, max: Math.min(WAIT_MAX, calendarLeft(v2, s)),
      } : undefined,
      ...(team ? { budget: { perPlayer: s.budget ?? team.budget, used: s.used ?? 0, teamSize: membersOf(st).length } } : {}),
    },
    map: {
      current: s.location,
      currentName: s.location ? L(def.locations.find((l) => l.id === s.location)?.name) : sys('station', locale),
      places,
    },
    scenes,
    notebook: { facts, evidence },
    lab: {
      slots: v2.clock.labSlots ?? 2, running: jobs.filter((j) => j.status === 'running').length, ready: jobs.filter((j) => j.status === 'ready').length,
      nextReady: next ? { ...next.readyAt, minutesLeft: next.minutesLeft, name: next.name } : undefined,
      jobs,
    },
    people: def.people.map((p) => ({ id: p.id, name: p.name, role: L(p.role), description: L(p.description) })),
    suspects,
    deductions,
    deductionsTotal: v2.deductions.length,
    chips,
    hints: { used: st.hintsUsed.map((h) => L(def.hints.find((x) => x.id === h)?.text)), available: hintOpen, cost: costs.hint },
    reports,
    finale,
    accusable: def.suspects.map((x) => ({ id: x.id, name: x.name })),
    finaleIntro: L(v2.finale.intro),
    result: s.finale?.status === 'done' ? resultView(ctx, locale) : undefined,
    ...(teamView ? { team: teamView } : {}),
  };
}

/** Small stable string hash (FNV-1a), for orders that must look random but never change between requests. */
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

/**
 * Timeline cards: the proven order once confirmed (outlier last); while open, a stable shuffle keyed by case and
 * card id. The shuffle is checked against the solution (server-side, never sent) so the cards never arrive in the
 * solution order or simply reversed — both would hand the puzzle over.
 */
function cardOrder<C extends { id: string }>(caseId: string, cards: C[], proven: string[] | undefined, solution: string[]): C[] {
  if (proven?.length) {
    const rank = (id: string) => { const i = proven.indexOf(id); return i < 0 ? proven.length : i; };
    return [...cards].sort((a, b) => rank(a.id) - rank(b.id));
  }
  const trivial = (list: C[]) => {
    const pos = solution.map((id) => list.findIndex((c) => c.id === id)).filter((i) => i >= 0);
    if (pos.length < 3) return false;
    const up = pos.every((p, i) => i === 0 || p > pos[i - 1]);
    const down = pos.every((p, i) => i === 0 || p < pos[i - 1]);
    // also refuse orders where most neighbours already sit next to each other in the right sense
    const adjacent = pos.filter((p, i) => i > 0 && Math.abs(p - pos[i - 1]) === 1).length;
    return up || down || adjacent > pos.length / 2;
  };
  let best = cards;
  for (let salt = 0; salt < 24; salt++) {
    best = [...cards].sort((a, b) => hash(`${caseId}:${salt}:${a.id}`) - hash(`${caseId}:${salt}:${b.id}`) || a.id.localeCompare(b.id));
    if (!trivial(best)) break;
  }
  return best;
}

/** Activity arguments: "@loc:id", "@zone:id", "@detail:zone/detail", "@analysis:id" are named in the viewer's language. */
export function refText(def: CaseDefinition, arg: string, locale: Locale): string {
  const m = /^@(loc|zone|detail|analysis|item|ded|sus):(.+)$/.exec(arg);
  if (!m) return arg;
  const L = (t: Text | undefined) => tx(t, locale);
  const id = m[2];
  switch (m[1]) {
    case 'loc': return L(def.locations.find((l) => l.id === id)?.name) || id;
    case 'zone': return L(indexOf(def).zones.get(id)?.zone.label) || id;
    case 'detail': {
      const [z, d] = id.split('/');
      return L(indexOf(def).zones.get(z)?.zone.details.find((x) => x.id === d)?.label) || d;
    }
    case 'item': {
      const f = def.v2?.facts.find((x) => x.id === id);
      if (f) return L(f.text);
      const e = def.evidence.find((x) => x.id === id);
      if (e) return L(e.name);
      return L(indexOf(def).deductions.get(id)?.title) || id;
    }
    case 'ded': return L(indexOf(def).deductions.get(id)?.title) || id;
    case 'sus': return [...def.suspects, ...def.people].find((x) => x.id === id)?.name ?? id;
    default: return L(def.analyses.find((a) => a.id === id)?.name) || id;
  }
}
