export interface Plan {
  id: string;
  title: string;
  price: string;
  period: 'month' | 'year';
  /** e.g. "≈ $3.75 / month" */
  note?: string;
  /** a store package handle (native only) */
  handle?: unknown;
}

export interface PurchaseOutcome {
  ok: boolean;
  cancelled?: boolean;
  error?: string;
}

export interface Store {
  /** 'store' = real App Store / Play billing; 'test' = no-charge development purchases */
  kind: 'store' | 'test';
  configure(appUserId: string): Promise<void>;
  plans(): Promise<Plan[]>;
  purchase(plan: Plan): Promise<PurchaseOutcome>;
  restore(): Promise<PurchaseOutcome>;
}

/** Test prices from the product brief — not validated market prices. */
export const TEST_PLANS: Plan[] = [
  { id: 'indicia_plus_annual', title: 'Annual', price: '$44.99', period: 'year', note: '≈ $3.75 / month' },
  { id: 'indicia_plus_monthly', title: 'Monthly', price: '$6.99', period: 'month' },
];

/** No store: every "purchase" succeeds locally; the server only honours it in development. */
export const testStore: Store = {
  kind: 'test',
  async configure() {},
  async plans() { return TEST_PLANS; },
  async purchase() { return { ok: true }; },
  async restore() { return { ok: true }; },
};
