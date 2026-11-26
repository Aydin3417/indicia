// SERVER-ONLY. Persistence boundary. File store for local development; Supabase store for production.
import type { SessionState } from '../engine/state.ts';
import type { Usage } from '../ai/gateway.ts';

export interface SessionRecord {
  id: string;
  /** owner / host */
  userId: string;
  /** everyone with access, host included */
  members: string[];
  caseId: string;
  updatedAt: number;
  lastSeen: number;
  state: SessionState;
}

export interface ProfileRecord {
  userId: string;
  displayName: string;
  /** legacy field; the effective plan is derived from plusUntil */
  plan: 'free' | 'plus';
  /** Plus access until this time (ms). Set only by verified store data or webhooks. */
  plusUntil?: number | null;
  analyticsOptOut?: boolean;
  /** v2: chosen content language; absent = follow the device */
  locale?: 'en' | 'tr';
  createdAt: number;
}

export interface Store {
  getSession(id: string): Promise<SessionRecord | null>;
  saveSession(rec: SessionRecord): Promise<void>;
  /** sessions this user owns or is a member of */
  listSessions(userId: string): Promise<SessionRecord[]>;
  /** room code → session id */
  findRoom(code: string): Promise<string | null>;
  claimRoom(code: string, sessionId: string): Promise<boolean>;
  /** record that a user can reach this session from their history */
  linkMember(userId: string, sessionId: string, role: 'host' | 'investigator'): Promise<void>;
  unlinkMember(userId: string, sessionId: string): Promise<void>;
  touch(sessionId: string, userId: string): Promise<void>;
  /** userId → last seen (ms) */
  presence(sessionId: string): Promise<Record<string, number>>;
  getProfile(userId: string): Promise<ProfileRecord | null>;
  saveProfile(p: ProfileRecord): Promise<void>;
  logUsage(userId: string, sessionId: string | null, u: Usage): Promise<void>;
  /** AI spend for this user today (UTC), USD */
  costToday(userId: string, day: string): Promise<number>;
  /** interrogation questions asked today (UTC) */
  countQuestions(userId: string, day: string): Promise<number>;
  incrementQuestions(userId: string, day: string): Promise<number>;
}

/** Serialises async work per key (one action at a time per session). */
export class KeyedMutex {
  private tails = new Map<string, Promise<unknown>>();
  run<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const prev = this.tails.get(key) ?? Promise.resolve();
    const next = prev.then(fn, fn);
    this.tails.set(key, next.catch(() => undefined));
    return next;
  }
}
