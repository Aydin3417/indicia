import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import type {
  ApiError, CaseSummary, ErrorReason, InvestigationView, Locale, Profile, Pulse, SessionMode, V2Response,
} from '../../shared/api';

const BASE = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8787').replace(/\/$/, '');
const TOKEN_KEY = 'indicia.token.v1';

export class ApiFailure extends Error {
  constructor(
    message: string,
    public code: ApiError['code'] | 'network',
    public status: number,
    /** v2: machine-readable detail (CONTRACT_V2 §1 Errors) */
    public reason?: ErrorReason,
  ) {
    super(message);
  }
}

let tokenPromise: Promise<string> | null = null;

/** Development identity: a random device id. Production swaps this for a Supabase session token. */
async function token(): Promise<string> {
  if (!tokenPromise) {
    tokenPromise = (async () => {
      let t = await AsyncStorage.getItem(TOKEN_KEY).catch(() => null);
      if (!t) {
        t = `dev.${Crypto.randomUUID()}`;
        await AsyncStorage.setItem(TOKEN_KEY, t).catch(() => undefined);
      }
      return t;
    })();
  }
  return tokenPromise;
}

export async function resetIdentity() {
  await AsyncStorage.removeItem(TOKEN_KEY).catch(() => undefined);
  tokenPromise = null;
}

/** The app's UI language, sent as Accept-Language on every request (CONTRACT_V2 §1). Set by src/i18n. */
let requestLocale: Locale = 'en';
export function setRequestLocale(l: Locale) { requestLocale = l; }
export function getRequestLocale(): Locale { return requestLocale; }

/** Shown when the network itself fails; the i18n layer replaces it with the current language. */
let networkMessage = 'Cannot reach headquarters. Check your connection.';
export function setNetworkMessage(m: string) { networkMessage = m; }

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${await token()}`,
        'accept-language': requestLocale === 'tr' ? 'tr, en;q=0.5' : 'en, tr;q=0.5',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiFailure(networkMessage, 'network', 0);
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = data as ApiError | null;
    throw new ApiFailure(err?.error ?? `HTTP ${res.status}`, err?.code ?? 'server', res.status, err?.reason);
  }
  return data as T;
}

/** Every v2 action path: POST /sessions/:id/v2/<path>. */
export type V2Path =
  | 'travel' | 'inspect' | 'probe' | 'detail' | 'collect' | 'lab' | 'lab/collect'
  | 'interview' | 'interview/leave' | 'topic' | 'press' | 'present' | 'ask'
  | 'deduce' | 'hint' | 'end-day' | 'finale' | 'finale/answer';

const v2post = (id: string, path: string, body?: unknown) =>
  request<V2Response>('POST', `/sessions/${id}/v2/${path.replace(/^\/+/, '')}`, body ?? {});

/** Typed v2 endpoints (CONTRACT_V2 §3). Every POST resolves to { view, event }. */
export const v2 = {
  view: (id: string) => request<InvestigationView>('GET', `/sessions/${id}/v2`),
  /** generic form used by the desk store's act(path, body) */
  post: v2post,
  travel: (id: string, locationId: string) => v2post(id, 'travel', { locationId }),
  inspect: (id: string, zoneId: string) => v2post(id, 'inspect', { zoneId }),
  probe: (id: string, locationId: string, tool: 'uv' | 'dust', x: number, y: number) => v2post(id, 'probe', { locationId, tool, x, y }),
  detail: (id: string, zoneId: string, detailId: string, tool?: 'uv' | 'dust' | 'camera') => v2post(id, 'detail', { zoneId, detailId, tool }),
  collect: (id: string, evidenceId: string, key: string) => v2post(id, 'collect', { evidenceId, key }),
  lab: (id: string, analysisId: string) => v2post(id, 'lab', { analysisId }),
  labCollect: (id: string, analysisId?: string) => v2post(id, 'lab/collect', analysisId ? { analysisId } : {}),
  interview: (id: string, suspectId: string) => v2post(id, 'interview', { suspectId }),
  leaveInterview: (id: string, suspectId: string) => v2post(id, 'interview/leave', { suspectId }),
  topic: (id: string, suspectId: string, topicId: string) => v2post(id, 'topic', { suspectId, topicId }),
  press: (id: string, suspectId: string, claimId: string) => v2post(id, 'press', { suspectId, claimId }),
  present: (id: string, suspectId: string, claimId: string, itemId: string) => v2post(id, 'present', { suspectId, claimId, itemId }),
  ask: (id: string, suspectId: string, text: string) => v2post(id, 'ask', { suspectId, text }),
  deduce: (id: string, deductionId: string, body: { fills?: Record<string, string>; order?: string[]; outlier?: string }) =>
    v2post(id, 'deduce', { deductionId, ...body }),
  hint: (id: string) => v2post(id, 'hint'),
  endDay: (id: string) => v2post(id, 'end-day'),
  finale: (id: string, accusedId: string) => v2post(id, 'finale', { accusedId }),
  finaleAnswer: (id: string, itemId: string) => v2post(id, 'finale/answer', { itemId }),
};

export const api = {
  cases: () => request<CaseSummary[]>('GET', '/cases'),
  me: () => request<Profile>('GET', '/me'),
  rename: (displayName: string) => request<Profile>('PUT', '/me', { displayName }),
  /** v2: content language; null = follow the device */
  setLocale: (locale: Locale | null) => request<Profile>('PUT', '/me/locale', { locale }),
  start: (caseId: string, restart = false, mode: SessionMode = 'solo') =>
    request<{ sessionId: string; roomCode?: string }>('POST', '/sessions', { caseId, restart, mode }),
  join: (code: string) => request<{ sessionId: string }>('POST', '/rooms/join', { code }),
  pulse: (id: string) => request<Pulse>('GET', `/sessions/${id}/pulse`),
  lockRoom: (id: string, locked: boolean) => request<{ ok: true }>('POST', `/sessions/${id}/room/lock`, { locked }),
  removePlayer: (id: string, userId: string) => request<{ ok: true }>('POST', `/sessions/${id}/room/remove`, { userId }),
  leave: (id: string) => request<{ ok: true }>('POST', `/sessions/${id}/leave`),
  syncEntitlement: (devGrant = false) => request<Profile>('POST', '/me/entitlement/sync', { devGrant }),
  devResetPlan: () => request<Profile>('POST', '/me/entitlement/dev-reset'),
  setPrivacy: (analyticsOptOut: boolean) => request<Profile>('PUT', '/me/privacy', { analyticsOptOut }),
  /** fire-and-forget; analytics must never interrupt play */
  event: (name: string, props: Record<string, string | number | boolean> = {}) => {
    request('POST', '/events', { name, props }).catch(() => undefined);
  },
};
