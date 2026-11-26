// SERVER-ONLY. Local development store: JSON files under .data/ (gitignored). Node only.
import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { ProfileRecord, SessionRecord, Store } from './store.ts';
import type { Usage } from '../ai/gateway.ts';

const safe = (id: string) => id.replace(/[^a-zA-Z0-9_-]/g, '_');

export class FileStore implements Store {
  constructor(private root: string) {}

  private async read<T>(file: string): Promise<T | null> {
    try {
      return JSON.parse(await fs.readFile(path.join(this.root, file), 'utf8')) as T;
    } catch {
      return null;
    }
  }

  private async write(file: string, data: unknown) {
    const full = path.join(this.root, file);
    await fs.mkdir(path.dirname(full), { recursive: true });
    const tmp = `${full}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(data));
    await fs.rename(tmp, full);
  }

  getSession(id: string) {
    return this.read<SessionRecord>(`sessions/${safe(id)}.json`);
  }

  async saveSession(rec: SessionRecord) {
    await this.write(`sessions/${safe(rec.id)}.json`, rec);
    await this.linkMember(rec.userId, rec.id);
  }

  async findRoom(code: string) {
    return this.read<string>(`rooms/${safe(code)}.json`);
  }

  async claimRoom(code: string, sessionId: string) {
    if (await this.findRoom(code)) return false;
    await this.write(`rooms/${safe(code)}.json`, sessionId);
    return true;
  }

  async linkMember(userId: string, sessionId: string) {
    const file = `users/${safe(userId)}/sessions.json`;
    const idx = (await this.read<string[]>(file)) ?? [];
    if (!idx.includes(sessionId)) await this.write(file, [...idx, sessionId]);
  }

  async unlinkMember(userId: string, sessionId: string) {
    const file = `users/${safe(userId)}/sessions.json`;
    const idx = (await this.read<string[]>(file)) ?? [];
    await this.write(file, idx.filter((x) => x !== sessionId));
  }

  private seen = new Map<string, Record<string, number>>();
  private costChain: Promise<void> = Promise.resolve();

  async touch(sessionId: string, userId: string) {
    // presence is ephemeral: memory is enough for the single-process dev server
    const m = this.seen.get(sessionId) ?? {};
    m[userId] = Date.now();
    this.seen.set(sessionId, m);
  }

  async presence(sessionId: string) {
    return { ...(this.seen.get(sessionId) ?? {}) };
  }

  async listSessions(userId: string) {
    const idx = (await this.read<string[]>(`users/${safe(userId)}/sessions.json`)) ?? [];
    const out: SessionRecord[] = [];
    for (const id of idx) {
      const s = await this.getSession(id);
      if (s) out.push(s);
    }
    return out;
  }

  getProfile(userId: string) {
    return this.read<ProfileRecord>(`users/${safe(userId)}/profile.json`);
  }

  saveProfile(p: ProfileRecord) {
    return this.write(`users/${safe(p.userId)}/profile.json`, p);
  }

  async logUsage(userId: string, sessionId: string | null, u: Usage) {
    const line = JSON.stringify({ at: new Date().toISOString(), userId, sessionId, ...u }) + '\n';
    await fs.mkdir(this.root, { recursive: true });
    await fs.appendFile(path.join(this.root, 'ai_usage.log'), line);
    if (u.costUsd > 0) {
      const day = new Date().toISOString().slice(0, 10);
      // read-modify-write must not interleave between concurrent calls
      const next = this.costChain.then(async () => {
        await this.write(`users/${safe(userId)}/cost-${day}.json`, (await this.costToday(userId, day)) + u.costUsd);
      });
      this.costChain = next.catch(() => undefined);
      await next;
    }
  }

  async costToday(userId: string, day: string) {
    return (await this.read<number>(`users/${safe(userId)}/cost-${day}.json`)) ?? 0;
  }

  async countQuestions(userId: string, day: string) {
    return (await this.read<number>(`users/${safe(userId)}/q-${day}.json`)) ?? 0;
  }

  async incrementQuestions(userId: string, day: string) {
    const n = (await this.countQuestions(userId, day)) + 1;
    await this.write(`users/${safe(userId)}/q-${day}.json`, n);
    return n;
  }
}
