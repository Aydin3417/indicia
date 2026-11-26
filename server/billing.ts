// SERVER-ONLY. Entitlements are decided here, never by the client.
// Two ways in: (1) the app asks us to re-check after a purchase/restore and we ask RevenueCat
// directly with the secret key; (2) RevenueCat's webhook tells us about renewals and expirations.

export interface BillingConfig {
  /** RevenueCat secret API key (v1). Without it, verification is impossible. */
  revenueCatSecret?: string;
  /** value RevenueCat sends in the Authorization header of webhooks */
  webhookAuth?: string;
  entitlementId: string;
  /** local development only: allow a no-charge "purchase" so the paywall can be exercised */
  allowDevPurchases: boolean;
}

export function billingFromEnv(env: Record<string, string | undefined>, dev: boolean): BillingConfig {
  return {
    revenueCatSecret: env.REVENUECAT_SECRET_KEY || undefined,
    webhookAuth: env.REVENUECAT_WEBHOOK_AUTH || undefined,
    entitlementId: env.REVENUECAT_ENTITLEMENT ?? 'plus',
    allowDevPurchases: dev && env.ALLOW_DEV_PURCHASES !== '0',
  };
}

/** No expiry date (lifetime / promotional) is stored as this far-future timestamp. */
export const FOREVER = 8_640_000_000_000_000;

export interface EntitlementCheck {
  active: boolean;
  until: number | null;
  productId?: string;
}

/** Ask RevenueCat for the subscriber's current entitlement. */
export async function fetchEntitlement(cfg: BillingConfig, appUserId: string, now = Date.now()): Promise<EntitlementCheck> {
  if (!cfg.revenueCatSecret) throw new Error('RevenueCat is not configured');
  const res = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`, {
    headers: { authorization: `Bearer ${cfg.revenueCatSecret}`, accept: 'application/json' },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`revenuecat ${res.status}`);
  const body = (await res.json()) as {
    subscriber?: { entitlements?: Record<string, { expires_date: string | null; product_identifier?: string }> };
  };
  return entitlementFromSubscriber(body.subscriber?.entitlements ?? {}, cfg.entitlementId, now);
}

export function entitlementFromSubscriber(
  entitlements: Record<string, { expires_date: string | null; product_identifier?: string }>,
  entitlementId: string,
  now = Date.now(),
): EntitlementCheck {
  const e = entitlements[entitlementId];
  if (!e) return { active: false, until: null };
  const until = e.expires_date === null ? FOREVER : Date.parse(e.expires_date);
  return { active: until > now, until, productId: e.product_identifier };
}

export interface WebhookOutcome {
  userId: string;
  /** new expiry; null = entitlement ended now */
  until: number | null;
  type: string;
  productId?: string;
}

const GRANTING = new Set(['INITIAL_PURCHASE', 'RENEWAL', 'UNCANCELLATION', 'PRODUCT_CHANGE', 'NON_RENEWING_PURCHASE', 'SUBSCRIPTION_EXTENDED', 'TEMPORARY_ENTITLEMENT_GRANT']);

/** Interpret a RevenueCat webhook body. Returns null for events that don't change access. */
export function interpretWebhook(cfg: BillingConfig, body: unknown): WebhookOutcome | null {
  const event = (body as { event?: Record<string, unknown> })?.event;
  if (!event || typeof event.type !== 'string' || typeof event.app_user_id !== 'string') return null;
  const ids = Array.isArray(event.entitlement_ids) ? (event.entitlement_ids as string[]) : [];
  if (ids.length && !ids.includes(cfg.entitlementId)) return null;
  const exp = typeof event.expiration_at_ms === 'number' ? event.expiration_at_ms : null;
  const productId = typeof event.product_id === 'string' ? event.product_id : undefined;
  if (GRANTING.has(event.type)) return { userId: event.app_user_id, until: exp ?? FOREVER, type: event.type, productId };
  // a cancellation keeps access until the period ends; RevenueCat sends EXPIRATION then
  if (event.type === 'EXPIRATION') return { userId: event.app_user_id, until: null, type: event.type, productId };
  return null;
}

/** Constant-time-ish comparison for the webhook secret. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
