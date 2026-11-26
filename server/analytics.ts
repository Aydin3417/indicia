// SERVER-ONLY. Product analytics. Events are sent from the server (one source of truth, nothing the
// client can forge into a funnel) and never contain free text a player typed.

export type Props = Record<string, string | number | boolean | null | undefined>;

export interface Analytics {
  track(distinctId: string, event: string, props?: Props): void;
  flush(): Promise<void>;
}

export class NoopAnalytics implements Analytics {
  track() {}
  async flush() {}
}

/** Development: one line per event in the server log. */
export class ConsoleAnalytics implements Analytics {
  track(distinctId: string, event: string, props: Props = {}) {
    console.log(`[analytics] ${event} ${distinctId.slice(0, 12)} ${JSON.stringify(props)}`);
  }
  async flush() {}
}

/** Tests: keep everything in memory. */
export class MemoryAnalytics implements Analytics {
  events: { distinctId: string; event: string; props: Props }[] = [];
  track(distinctId: string, event: string, props: Props = {}) {
    this.events.push({ distinctId, event, props });
  }
  async flush() {}
}

/** Mixpanel ingestion API (EU residency by default). Batches; flushed after each request. */
export class MixpanelAnalytics implements Analytics {
  private queue: Record<string, unknown>[] = [];
  constructor(private token: string, private host = 'https://api-eu.mixpanel.com') {}

  track(distinctId: string, event: string, props: Props = {}) {
    this.queue.push({
      event,
      properties: {
        token: this.token,
        distinct_id: distinctId,
        time: Date.now(),
        $insert_id: crypto.randomUUID().replace(/-/g, '').slice(0, 32),
        ...props,
      },
    });
    if (this.queue.length >= 50) void this.flush();
  }

  async flush() {
    if (!this.queue.length) return;
    const batch = this.queue.splice(0, 50);
    try {
      const res = await fetch(`${this.host}/track?ip=0`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'text/plain' },
        body: JSON.stringify(batch),
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) console.warn(`[analytics] mixpanel ${res.status}`);
    } catch (e) {
      // analytics must never break gameplay; drop the batch
      console.warn('[analytics] mixpanel unreachable', (e as Error).message);
    }
  }
}

export function analyticsFromEnv(env: Record<string, string | undefined>, dev: boolean): Analytics {
  if (env.MIXPANEL_TOKEN) return new MixpanelAnalytics(env.MIXPANEL_TOKEN, env.MIXPANEL_API_HOST);
  return dev ? new ConsoleAnalytics() : new NoopAnalytics();
}

/** Events the app itself may report (things only the client can see). Everything else is server-side. */
export const CLIENT_EVENTS = new Set(['paywall_viewed', 'purchase_started', 'purchase_cancelled', 'invite_shared', 'onboarding_completed']);
