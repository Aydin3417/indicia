// SERVER-ONLY dev check (Agent B): replays every case's ideal path through the real HTTP API, once per
// locale, in-process (no port). Asserts every request succeeds, the case ends in a three-star confession,
// and that a view in one language never carries a content string from the other (no "shadow" English).
//   npx tsx server/content/playthrough.ts
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { GameService } from '../service.ts';
import { FileStore } from '../store/fileStore.ts';
import { createApp } from '../http/app.ts';
import { ALL_CASES } from '../cases/index.ts';
import { markedFacts, stripMarkup, tx } from '../engine/i18n.ts';
import { indexOf, shapeCenter } from '../engine/v2/state.ts';
import type { CaseDefinition, Locale, PathStep } from '../engine/types.ts';
import type { ApiError, InvestigationView, V2Response } from '../../shared/api.ts';

const store = new FileStore(mkdtempSync(path.join(tmpdir(), 'indicia-playthrough-')));
const service = new GameService(store, { provider: null, priceIn: 0, priceOut: 0 }, { perMinute: 10_000 });
const app = createApp(service, { allowDevAuth: true });

/** wave 7: a Detective Plus case (meta.tier 'plus') is played by a test player who has Plus for a day. */
async function grantPlus(user: string) {
  // the HTTP layer turns the bearer "dev.<id>" into the user id "dev-<id>"
  await store.saveProfile({ userId: `dev-${user}`, displayName: 'Investigator', plan: 'plus', plusUntil: Date.now() + 86_400_000, createdAt: Date.now() });
}

async function call<T>(user: string, method: string, url: string, locale: Locale, body?: unknown): Promise<{ status: number; json: T }> {
  const res = await app.request(url, {
    method,
    headers: { authorization: `Bearer dev.${user}`, 'content-type': 'application/json', 'accept-language': locale },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status, json: (await res.json()) as T };
}

function requests(def: CaseDefinition, step: PathStep): { url: string; body: unknown }[] {
  switch (step.do) {
    case 'travel': return [{ url: 'travel', body: { locationId: step.to } }];
    case 'inspect': {
      const hit = indexOf(def).zones.get(step.zone)!;
      if ((hit.zone.reveal ?? 'visible') === 'visible') return [{ url: 'inspect', body: { zoneId: step.zone } }];
      const [x, y] = shapeCenter(hit.zone.shape);
      return [{ url: 'probe', body: { locationId: hit.locationId, tool: hit.zone.reveal, x, y } }];
    }
    case 'detail': {
      const d = indexOf(def).zones.get(step.zone)!.zone.details.find((x) => x.id === step.detail)!;
      return [{ url: 'detail', body: { zoneId: step.zone, detailId: step.detail, tool: d.tool } }];
    }
    case 'collect': {
      const e = def.evidence.find((x) => x.id === step.evidence)!;
      let key = '';
      e.body!.forEach((line, i) => markedFacts(tx(line, 'en')).forEach((f, n) => { if (f === step.fact && !key) key = `${i}.${n}`; }));
      return [{ url: 'collect', body: { evidenceId: step.evidence, key } }];
    }
    case 'lab': return [{ url: 'lab', body: { analysisId: step.analysis } }];
    case 'labCollect': return [{ url: 'lab/collect', body: {} }];
    case 'interview': return [{ url: 'interview', body: { suspectId: step.suspect } }];
    case 'leave': return [{ url: 'interview/leave', body: { suspectId: step.suspect } }];
    case 'topic': return [{ url: 'topic', body: { suspectId: step.suspect, topicId: step.topic } }];
    case 'press': return [{ url: 'press', body: { suspectId: step.suspect, claimId: step.claim } }];
    case 'present': return [{ url: 'present', body: { suspectId: step.suspect, claimId: step.claim, itemId: step.item } }];
    case 'deduce':
    case 'wrongDeduce': return [{ url: 'deduce', body: { deductionId: step.deduction, fills: step.fills, order: step.order, outlier: step.outlier } }];
    case 'wrongPresent': return [{ url: 'present', body: { suspectId: step.suspect, claimId: step.claim, itemId: step.item } }];
    case 'wait': return [{ url: 'wait', body: step.until ? { until: step.until } : { minutes: step.minutes } }];
    case 'nightChoice': return [{ url: 'night-choice', body: { optionId: step.option } }];
    case 'endDay': return [{ url: 'end-day', body: {} }];
    case 'finale': return [{ url: 'finale', body: { accusedId: step.accused } }, ...step.answers.map((a) => ({ url: 'finale/answer', body: { itemId: a } }))];
  }
}

/** Every bilingual content string of a case, per language (markup stripped), where the two differ. */
function languageStrings(def: CaseDefinition): Record<Locale, Set<string>> {
  const out: Record<Locale, Set<string>> = { en: new Set(), tr: new Set() };
  const walk = (v: unknown) => {
    if (!v || typeof v !== 'object') return;
    if (Array.isArray(v)) { v.forEach(walk); return; }
    const o = v as Record<string, unknown>;
    if (typeof o.en === 'string' && typeof o.tr === 'string' && Object.keys(o).length === 2) {
      const en = stripMarkup(o.en).trim();
      const tr = stripMarkup(o.tr).trim();
      // long, distinctive strings only: short labels (names, times, "G.B.G.") may legitimately coincide
      if (en !== tr && en.length >= 16) out.en.add(en);
      if (en !== tr && tr.length >= 16) out.tr.add(tr);
      return;
    }
    Object.values(o).forEach(walk);
  };
  walk(def);
  return out;
}

function leaks(view: unknown, foreign: Set<string>): string[] {
  const json = JSON.stringify(view);
  return [...foreign].filter((s) => json.includes(JSON.stringify(s).slice(1, -1))).slice(0, 5);
}

async function main() {
let failed = false;
const fail = (msg: string) => { failed = true; console.log(`  ✗ ${msg}`); };

for (const def of ALL_CASES) {
  if (!def.v2) continue;
  const strings = languageStrings(def);
  for (const locale of ['en', 'tr'] as Locale[]) {
    const other: Locale = locale === 'en' ? 'tr' : 'en';
    const user = `play-${def.id}-${locale}`.slice(0, 40);
    if (def.meta.tier === 'plus') await grantPlus(user);
    const start = await call<{ sessionId: string }>(user, 'POST', '/sessions', locale, { caseId: def.id });
    if (start.status !== 200) { fail(`${def.id}/${locale}: cannot start (${start.status})`); continue; }
    const sid = start.json.sessionId;
    let view = (await call<InvestigationView>(user, 'GET', `/sessions/${sid}/v2`, locale)).json;
    let leaked = leaks(view, strings[other]);
    if (view.locale !== locale) fail(`${def.id}/${locale}: view locale is ${view.locale}`);
    if (leaked.length) fail(`${def.id}/${locale}: opening view carries ${other} text: ${leaked.join(' | ')}`);
    let requestsSent = 0;
    let last: V2Response | undefined;
    const counts = { break: 0, confirmed: 0, nights: 0, forks: 0 };
    for (const step of def.v2.idealPath) {
      for (const r of requests(def, step)) {
        const res = await call<V2Response | ApiError>(user, 'POST', `/sessions/${sid}/v2/${r.url}`, locale, r.body);
        requestsSent++;
        if (res.status !== 200) { fail(`${def.id}/${locale}: ${JSON.stringify(step)} → ${res.status} ${JSON.stringify(res.json)}`); break; }
        last = res.json as V2Response;
        if (last.event.outcome === 'break') counts.break++;
        if (last.event.outcome === 'confirmed') counts.confirmed++;
        if (last.event.report?.night) counts.nights++;
        if (last.event.kind === 'night_choice') counts.forks++;
        leaked = leaks(last, strings[other]);
        if (leaked.length) fail(`${def.id}/${locale}: ${JSON.stringify(step)} carries ${other} text: ${leaked.join(' | ')}`);
      }
    }
    view = (await call<InvestigationView>(user, 'GET', `/sessions/${sid}/v2`, locale)).json;
    const r = view.result;
    if (!r || r.outcome !== 'confession' || r.starCount !== 3) fail(`${def.id}/${locale}: ended ${r?.outcome ?? 'open'} with ${r?.starCount ?? 0} stars`);
    leaked = leaks(view, strings[other]);
    if (leaked.length) fail(`${def.id}/${locale}: closed view carries ${other} text: ${leaked.join(' | ')}`);
    console.log(
      `■ ${def.id} [${locale}] ${requestsSent} requests · ${r?.outcome} · ${r?.starCount}★ · breaks ${counts.break} · deductions ${counts.confirmed}/${def.v2.deductions.length}` +
        ` · nights ${counts.nights} · forks ${counts.forks} · spent ${view.clock.spent}/${view.clock.totalBudget} min · left ${r?.minutesLeft}`,
    );
    if (view.reports.length) {
      console.log(`    nights: ${view.reports.map((x) => [x.night?.title ?? '—', x.fork ? `fork “${x.fork.title}” → ${x.fork.chosen ?? 'open'}` : ''].filter(Boolean).join(' + ')).join(' / ')}`);
    }
    console.log(`    verdict: ${r?.title} — ${view.finale?.confession?.slice(0, 70)}…`);
    // case-aware wording (wave 4; wave 7: every crime that is not a murder): never talk about a killing, in either language
    const offence = def.meta.crime ?? 'murder';
    if (offence !== 'murder') {
      const { crime: _legacy, ...caseText } = view.case;
      const words = JSON.stringify([r?.detail, caseText]).toLowerCase();
      if (/killer|murder|katil|cinayet/.test(words)) fail(`${def.id}/${locale}: a ${offence}'s verdict talks about a killing: ${r?.detail}`);
    }
    if (r?.offence !== offence) fail(`${def.id}/${locale}: result.offence is ${r?.offence}`);
    if (r?.crime !== (offence === 'theft' ? 'theft' : 'murder')) fail(`${def.id}/${locale}: result.crime (legacy) is ${r?.crime}`);

    // the newcomer's first day over HTTP: mistakes included, early win, no foreign text
    const nc = def.v2.newcomerPath;
    if (nc) {
      const u2 = `new-${def.id}-${locale}`.slice(0, 40);
      if (def.meta.tier === 'plus') await grantPlus(u2);
      const s2 = (await call<{ sessionId: string }>(u2, 'POST', '/sessions', locale, { caseId: def.id })).json.sessionId;
      let firstWin = '';
      for (const step of nc.steps) {
        for (const q of requests(def, step)) {
          const res = await call<V2Response | ApiError>(u2, 'POST', `/sessions/${s2}/v2/${q.url}`, locale, q.body);
          if (res.status !== 200) { fail(`${def.id}/${locale} newcomer: ${JSON.stringify(step)} → ${res.status} ${JSON.stringify(res.json)}`); break; }
          const ev = (res.json as V2Response).event;
          if (step.do.startsWith('wrong') && ev.outcome !== 'wrong') fail(`${def.id}/${locale} newcomer: ${step.do} gave ${ev.outcome}`);
          if (ev.outcome === 'confirmed' && !firstWin) firstWin = (res.json as V2Response).view.clock.timeLabel;
          leaked = leaks(res.json, strings[other]);
          if (leaked.length) fail(`${def.id}/${locale} newcomer: ${JSON.stringify(step)} carries ${other} text: ${leaked.join(' | ')}`);
        }
      }
      const v2view = (await call<InvestigationView>(u2, 'GET', `/sessions/${s2}/v2`, locale)).json;
      const day1 = v2view.reports[0]?.deductionsConfirmed.length ?? v2view.deductions.filter((d) => d.status === 'confirmed').length;
      if (day1 < nc.minConfirmedDay1) fail(`${def.id}/${locale} newcomer: ${day1} confirmed on day 1`);
      console.log(`    newcomer: first confirmation at ${firstWin || 'never'} · day 1 confirmed ${day1}`);
    }
  }
}

process.exit(failed ? 1 : 0);
}

void main();
