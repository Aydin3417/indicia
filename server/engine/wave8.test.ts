// Wave 8 (Agent U, playtest V5): regressions for what playing Ash and Glaze by hand turned up.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { GameService } from '../service.ts';
import { FileStore } from '../store/fileStore.ts';
import { MemoryAnalytics } from '../analytics.ts';
import { fennick } from '../cases/fennick.ts';

const HOST = 'dev-host-000008';
const GUEST = 'dev-guest-00008';

function svc() {
  return new GameService(new FileStore(mkdtempSync(path.join(tmpdir(), 'indicia-w8-'))), { provider: null, priceIn: 0, priceOut: 0 }, { perMinute: 1000, analytics: new MemoryAnalytics() });
}

test('co-op: an unnamed investigator shows in the viewer’s language (TR room said “Investigator”)', async () => {
  const s = svc();
  const { sessionId, roomCode } = await s.startSession(HOST, 'kessler-workshop', false, 'coop');
  await s.joinRoom(GUEST, roomCode!);
  const tr = await s.viewV2(GUEST, sessionId, 'tr');
  assert.deepEqual(tr.room!.players.map((p) => p.name), ['Müfettiş', 'Müfettiş']);
  assert.ok(tr.room!.activity.every((a) => a.actor === 'Müfettiş'), 'the case log too');
  assert.ok(tr.team!.members.every((m) => m.name === 'Müfettiş'), 'and the team panel');
  const en = await s.viewV2(GUEST, sessionId, 'en');
  assert.deepEqual(en.room!.players.map((p) => p.name), ['Investigator', 'Investigator']);
  // a chosen name is never touched
  await s.rename(HOST, 'Aksoy');
  const { sessionId: s2, roomCode: c2 } = await s.startSession(HOST, 'kessler-workshop', true, 'coop');
  await s.joinRoom(GUEST, c2!);
  assert.equal((await s.viewV2(GUEST, s2, 'tr')).room!.players[0]!.name, 'Aksoy');
});

test('Ash and Glaze: evidence found before Dahl is identified does not list him under “People”', () => {
  const people = (id: string) => fennick.evidence.find((e) => e.id === id)!.relatedPeople;
  for (const id of ['ev-gatelog', 'ev-cap', 'ev-ostkai']) assert.ok(!people(id).includes('oskar'), id);
});

test('Ash and Glaze: Turkish clock phrases match the case times (00:20 is not “biri yirmi geçe”, 00:55 is not “biri beş geçe”)', () => {
  const all: string[] = [];
  const walk = (v: unknown) => {
    if (!v || typeof v !== 'object') return;
    if (Array.isArray(v)) { v.forEach(walk); return; }
    const o = v as Record<string, unknown>;
    if (typeof o.tr === 'string' && typeof o.en === 'string') all.push(o.tr);
    else Object.values(o).forEach(walk);
  };
  walk(fennick);
  const text = all.join('\n');
  assert.ok(!/(?<!on )[Bb]iri yirmi geçe/.test(text), 'nothing in the case happens at 01:20 (on biri yirmi geçe = 23:20 is fine)');
  assert.ok(!/biri beş geçe/.test(text), 'the kiln programme ends at 00:55');
  assert.ok(/[Gg]ece yarısını yirmi geçe/.test(text), 'Bram reaches Kranz at 00:20');
});
