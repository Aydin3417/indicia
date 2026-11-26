// Shared investigations (co-op rooms) on the investigation desk.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { GameService } from '../service.ts';
import { FileStore } from '../store/fileStore.ts';

const svc = () => new GameService(new FileStore(mkdtempSync(path.join(tmpdir(), 'indicia-coop-'))), { provider: null, priceIn: 0, priceOut: 0 }, { perMinute: 1000 });
const HOST = 'dev-host-000001';
const GUEST = 'dev-guest-00001';
const OTHER = 'dev-other-00001';

async function room() {
  const s = svc();
  await s.rename(HOST, 'Aksoy');
  await s.rename(GUEST, 'Demir');
  const { sessionId, roomCode } = await s.startSession(HOST, 'kessler-workshop', false, 'coop');
  assert.match(roomCode!, /^[A-HJKMNP-Z2-9]{6}$/);
  return { s, sessionId, code: roomCode! };
}

test('a friend joins by code and sees the same investigation, activity in their own language', async () => {
  const { s, sessionId, code } = await room();
  const joined = await s.joinRoom(GUEST, ` ${code.toLowerCase()} `);
  assert.equal(joined.sessionId, sessionId);
  // joining twice is harmless
  assert.equal((await s.joinRoom(GUEST, code)).sessionId, sessionId);

  const before = await s.pulse(GUEST, sessionId);
  await s.travel(HOST, sessionId, 'loc-workshop');
  await s.inspectZone(HOST, sessionId, 'z-body');
  const after = await s.pulse(GUEST, sessionId);
  assert.ok(after.version > before.version, 'shared changes bump the version');
  assert.ok(after.online.includes(HOST) && after.online.includes(GUEST));

  const guestView = await s.viewV2(GUEST, sessionId, 'en');
  assert.ok(guestView.notebook.evidence.some((e) => e.id === 'ev-body'));
  assert.equal(guestView.room?.isHost, false);
  assert.deepEqual(guestView.room?.players.map((p) => p.name), ['Aksoy', 'Demir']);
  const en = guestView.room!.activity.map((a) => `${a.actor}: ${a.text}`);
  assert.ok(en.includes('Aksoy: went to Workshop'), en.join('\n'));
  assert.ok(en.includes('Aksoy: inspected The victim'), en.join('\n'));
  assert.ok(en.includes('Demir: joined the investigation'), en.join('\n'));

  const tr = (await s.viewV2(GUEST, sessionId, 'tr')).room!.activity.map((a) => `${a.actor}: ${a.text}`);
  assert.ok(tr.includes('Aksoy: Atölye yolunu tuttu'), tr.join('\n'));
  assert.ok(tr.includes('Aksoy: inceledi: Maktul'), tr.join('\n'));
  assert.ok(tr.includes('Aksoy: odayı açtı'), tr.join('\n'));
});

test('outsiders and bad codes get nothing', async () => {
  const { s, sessionId } = await room();
  await assert.rejects(() => s.viewV2(OTHER, sessionId), /not found/i);
  await assert.rejects(() => s.pulse(OTHER, sessionId), /not found/i);
  await assert.rejects(() => s.joinRoom(OTHER, 'ZZZZZZ'), /No open room/);
});

test('interviews are shared and signed', async () => {
  const { s, sessionId, code } = await room();
  await s.joinRoom(GUEST, code);
  await s.interviewStart(GUEST, sessionId, 'jonas');
  const topic = (await s.viewV2(GUEST, sessionId)).suspects.find((x) => x.id === 'jonas')!.topics.find((t) => t.state === 'available')!;
  await s.openTopic(GUEST, sessionId, 'jonas', topic.id);
  const hostView = await s.viewV2(HOST, sessionId);
  const jonas = hostView.suspects.find((x) => x.id === 'jonas')!;
  assert.equal(jonas.interview.open, true, 'one interview for the whole room');
  assert.equal(jonas.log.find((l) => l.action === 'topic')?.authorName, 'Demir');
  assert.ok(jonas.topics.some((t) => t.id === topic.id && t.state === 'open'), 'what one learns, all learn');
});

test('only the lead investigator runs the finale; everyone sees the result', async () => {
  const { s, sessionId, code } = await room();
  await s.joinRoom(GUEST, code);
  await assert.rejects(() => s.finaleStart(GUEST, sessionId, 'leo'), /lead investigator/);
  await assert.rejects(() => s.endDay(GUEST, sessionId), /lead investigator/);
  await s.finaleStart(HOST, sessionId, 'leo');
  const v = await s.viewV2(GUEST, sessionId);
  assert.equal(v.status, 'closed');
  assert.equal(v.result?.outcome, 'wrongful');
  const h = (await s.profile(GUEST)).history.find((x) => x.sessionId === sessionId);
  assert.equal(h?.stars, 0);
});

test('host controls: lock, remove; capacity is six', async () => {
  const { s, sessionId, code } = await room();
  await s.joinRoom(GUEST, code);
  await assert.rejects(() => s.lockRoom(GUEST, sessionId, true), /Only the lead/);
  await s.lockRoom(HOST, sessionId, true);
  await assert.rejects(() => s.joinRoom(OTHER, code), /locked/);
  await s.lockRoom(HOST, sessionId, false);

  await s.removePlayer(HOST, sessionId, GUEST);
  await assert.rejects(() => s.viewV2(GUEST, sessionId), /not found/i);
  assert.ok(!(await s.profile(GUEST)).history.some((h) => h.sessionId === sessionId));
  const tr = (await s.viewV2(HOST, sessionId, 'tr')).room!.activity.map((a) => a.text);
  assert.ok(tr.includes('Demir adlı kişiyi odadan çıkardı'), tr.join('\n'));

  for (let i = 0; i < 5; i++) await s.joinRoom(`dev-extra-${i}0000`, code);
  await assert.rejects(() => s.joinRoom(OTHER, code), /full/);
  await s.leave('dev-extra-00000', sessionId);
  await s.joinRoom(OTHER, code);
  // wave 5: the lead may leave a full room; the longest-serving member takes over
  await s.leave(HOST, sessionId);
  const v = await s.viewV2('dev-extra-10000', sessionId);
  assert.equal(v.room?.hostId, 'dev-extra-10000');
});

test('solo investigations stay private and reuse works per mode', async () => {
  const s = svc();
  const solo = await s.startSession(HOST, 'kessler-workshop', false, 'solo');
  assert.equal(solo.roomCode, undefined);
  const coop = await s.startSession(HOST, 'kessler-workshop', false, 'coop');
  assert.notEqual(coop.sessionId, solo.sessionId);
  assert.equal((await s.startSession(HOST, 'kessler-workshop', false, 'coop')).sessionId, coop.sessionId);
  await assert.rejects(() => s.removePlayer(HOST, solo.sessionId, GUEST), /solo/);
});

test('simultaneous actions from different players are serialised, none lost', async () => {
  const { s, sessionId, code } = await room();
  await s.joinRoom(GUEST, code);
  await s.travel(HOST, sessionId, 'loc-workshop');
  await s.travel(GUEST, sessionId, 'loc-workshop');
  const zones = ['z-body', 'z-ladder', 'z-toolwall', 'z-bench', 'z-floor', 'z-sink', 'z-bows'];
  await Promise.all(zones.map((z, i) => s.inspectZone(i % 2 ? GUEST : HOST, sessionId, z)));
  const v = await s.viewV2(HOST, sessionId);
  const scene = v.scenes.find((x) => x.locationId === 'loc-workshop')!;
  assert.equal(scene.zones.filter((z) => z.inspected && zones.includes(z.id)).length, zones.length);
  assert.equal(v.clock.spent, 60 + zones.length * v.clock.costs.closeUp, 'every inspection charged once');
  assert.ok(v.version >= zones.length + 3);
});
