// SERVER-ONLY. Production store over Supabase PostgREST using the service-role key.
// Runs inside the Edge Function (Deno) — the key never reaches a client.
// NOTE: written against supabase/migrations/0001_init.sql; not yet exercised against a live project.
import type { ProfileRecord, SessionRecord, Store } from './store.ts';
import type { Usage } from '../ai/gateway.ts';

export class SupabaseStore implements Store {
  constructor(private url: string, private serviceKey: string) {}

  private async rest<T>(pathAndQuery: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${this.url}/rest/v1/${pathAndQuery}`, {
      ...init,
      headers: {
        apikey: this.serviceKey,
        authorization: `Bearer ${this.serviceKey}`,
        'content-type': 'application/json',
        prefer: 'return=representation,resolution=merge-duplicates',
        ...(init.headers ?? {}),
      },
    });
    if (!res.ok) throw new Error(`supabase ${res.status}: ${await res.text()}`);
    const text = await res.text();
    return (text ? JSON.parse(text) : null) as T;
  }

  async getSession(id: string): Promise<SessionRecord | null> {
    type Row = {
      id: string; owner_id: string; case_id: string; updated_at: string; last_seen: number;
      session_state: { state: SessionRecord['state'] } | { state: SessionRecord['state'] }[] | null;
    };
    const rows = await this.rest<Row[]>(
      `game_sessions?id=eq.${encodeURIComponent(id)}&select=id,owner_id,case_id,updated_at,last_seen,session_state(state)`,
    );
    const r = rows[0];
    if (!r) return null;
    const st = Array.isArray(r.session_state) ? r.session_state[0]?.state : r.session_state?.state;
    if (!st) return null;
    const members = await this.rest<{ user_id: string }[]>(`session_players?session_id=eq.${encodeURIComponent(id)}&select=user_id`);
    const ids = [...new Set([r.owner_id, ...members.map((m) => m.user_id)])];
    return { id: r.id, userId: r.owner_id, members: ids, caseId: r.case_id, updatedAt: Date.parse(r.updated_at), lastSeen: r.last_seen ?? 0, state: st };
  }

  async saveSession(rec: SessionRecord): Promise<void> {
    await this.rest('game_sessions?on_conflict=id', {
      method: 'POST',
      body: JSON.stringify({
        id: rec.id, owner_id: rec.userId, case_id: rec.caseId, case_version: rec.state.caseVersion, case_hash: rec.state.caseHash,
        status: rec.state.status, mode: rec.state.mode, room_code: rec.state.roomCode ?? null, last_seen: rec.lastSeen, updated_at: new Date(rec.updatedAt).toISOString(),
        finished_at: rec.state.closedAt ? new Date(rec.state.closedAt).toISOString() : null,
      }),
    });
    await this.rest('session_state?on_conflict=session_id', {
      method: 'POST',
      body: JSON.stringify({ session_id: rec.id, state: rec.state, version: rec.state.version, updated_at: new Date(rec.updatedAt).toISOString() }),
    });
    if (rec.state.result) {
      await this.rest('case_results?on_conflict=session_id', {
        method: 'POST',
        body: JSON.stringify({ session_id: rec.id, user_id: rec.userId, case_id: rec.caseId, score: rec.state.result.score, rating: rec.state.result.rating, culprit_correct: rec.state.result.culpritCorrect, result: rec.state.result }),
      });
    }
  }

  async listSessions(userId: string): Promise<SessionRecord[]> {
    const u = encodeURIComponent(userId);
    const owned = await this.rest<{ id: string }[]>(`game_sessions?owner_id=eq.${u}&select=id&order=updated_at.desc&limit=50`);
    const joined = await this.rest<{ session_id: string }[]>(`session_players?user_id=eq.${u}&select=session_id&limit=50`);
    const ids = [...new Set([...owned.map((r) => r.id), ...joined.map((r) => r.session_id)])];
    const out: SessionRecord[] = [];
    for (const id of ids) {
      const s = await this.getSession(id);
      if (s) out.push(s);
    }
    return out;
  }

  async findRoom(code: string): Promise<string | null> {
    const rows = await this.rest<{ id: string }[]>(`game_sessions?room_code=eq.${encodeURIComponent(code)}&select=id`);
    return rows[0]?.id ?? null;
  }

  async claimRoom(code: string): Promise<boolean> {
    // uniqueness is enforced by the room_code unique constraint when the session is saved
    return !(await this.findRoom(code));
  }

  async linkMember(userId: string, sessionId: string, role: 'host' | 'investigator'): Promise<void> {
    await this.rest('session_players?on_conflict=session_id,user_id', {
      method: 'POST', headers: { prefer: 'return=minimal,resolution=merge-duplicates' },
      body: JSON.stringify({ session_id: sessionId, user_id: userId, role }),
    });
  }

  async unlinkMember(userId: string, sessionId: string): Promise<void> {
    await this.rest(`session_players?session_id=eq.${encodeURIComponent(sessionId)}&user_id=eq.${encodeURIComponent(userId)}`, { method: 'DELETE', headers: { prefer: 'return=minimal' } });
  }

  async touch(sessionId: string, userId: string): Promise<void> {
    await this.rest(`session_players?session_id=eq.${encodeURIComponent(sessionId)}&user_id=eq.${encodeURIComponent(userId)}`, {
      method: 'PATCH', headers: { prefer: 'return=minimal' }, body: JSON.stringify({ last_seen: new Date().toISOString() }),
    });
  }

  async presence(sessionId: string): Promise<Record<string, number>> {
    const rows = await this.rest<{ user_id: string; last_seen: string }[]>(`session_players?session_id=eq.${encodeURIComponent(sessionId)}&select=user_id,last_seen`);
    return Object.fromEntries(rows.map((r) => [r.user_id, Date.parse(r.last_seen)]));
  }

  async getProfile(userId: string): Promise<ProfileRecord | null> {
    const rows = await this.rest<{ user_id: string; display_name: string; plan: 'free' | 'plus'; plus_until: string | null; analytics_opt_out: boolean; locale: 'en' | 'tr' | null; created_at: string }[]>(
      `user_profiles?user_id=eq.${encodeURIComponent(userId)}&select=user_id,display_name,plan,plus_until,analytics_opt_out,locale,created_at`,
    );
    const r = rows[0];
    return r ? {
      userId: r.user_id, displayName: r.display_name, plan: r.plan, createdAt: Date.parse(r.created_at),
      plusUntil: r.plus_until ? Date.parse(r.plus_until) : null, analyticsOptOut: r.analytics_opt_out,
      locale: r.locale ?? undefined,
    } : null;
  }

  async saveProfile(p: ProfileRecord): Promise<void> {
    await this.rest('user_profiles?on_conflict=user_id', {
      method: 'POST',
      body: JSON.stringify({
        user_id: p.userId, display_name: p.displayName, plan: p.plan,
        plus_until: p.plusUntil ? new Date(Math.min(p.plusUntil, 253402300799000)).toISOString() : null,
        analytics_opt_out: !!p.analyticsOptOut, locale: p.locale ?? null, updated_at: new Date().toISOString(),
      }),
    });
  }

  async logUsage(userId: string, sessionId: string | null, u: Usage): Promise<void> {
    await this.rest('ai_usage_logs', {
      method: 'POST',
      headers: { prefer: 'return=minimal' },
      body: JSON.stringify({
        user_id: userId, session_id: sessionId, provider: u.provider, model: u.model, purpose: u.purpose,
        input_tokens: u.inputTokens, output_tokens: u.outputTokens, cost_usd: u.costUsd, latency_ms: u.latencyMs, ok: u.ok,
      }),
    });
  }

  async costToday(userId: string, day: string): Promise<number> {
    const n = await this.rest<number>('rpc/user_ai_cost', { method: 'POST', body: JSON.stringify({ p_user: userId, p_day: day }) });
    return typeof n === 'number' ? n : Number(n ?? 0);
  }

  async countQuestions(userId: string, day: string): Promise<number> {
    const rows = await this.rest<{ questions: number }[]>(`usage_quotas?user_id=eq.${encodeURIComponent(userId)}&day=eq.${day}&select=questions`);
    return rows[0]?.questions ?? 0;
  }

  async incrementQuestions(userId: string, day: string): Promise<number> {
    const n = await this.rest<number>('rpc/increment_questions', { method: 'POST', body: JSON.stringify({ p_user: userId, p_day: day }) });
    return typeof n === 'number' ? n : 0;
  }
}
