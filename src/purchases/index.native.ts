// iOS / Android: RevenueCat. The app never decides it is "Plus" — after a purchase or restore it asks
// the server, which checks with RevenueCat using the secret key. Without a public SDK key (Expo Go,
// early dev builds) this falls back to test purchases.
import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL, type PurchasesPackage } from 'react-native-purchases';
import { TEST_PLANS, testStore, type Plan, type Store } from './types';

export * from './types';

const apiKey = Platform.OS === 'ios' ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;

const revenueCat: Store = {
  kind: 'store',
  async configure(appUserId) {
    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR);
    // the app user id is our server's user id, so webhooks and checks line up with the account
    Purchases.configure({ apiKey: apiKey!, appUserID: appUserId });
  },
  async plans() {
    try {
      const offerings = await Purchases.getOfferings();
      const pkgs = offerings.current?.availablePackages ?? [];
      if (!pkgs.length) return TEST_PLANS.map((p) => ({ ...p, handle: undefined }));
      return pkgs.map((pkg: PurchasesPackage): Plan => {
        const year = pkg.packageType === 'ANNUAL';
        const perMonth = year ? pkg.product.price / 12 : undefined;
        return {
          id: pkg.product.identifier,
          title: year ? 'Annual' : 'Monthly',
          price: pkg.product.priceString,
          period: year ? 'year' : 'month',
          note: perMonth ? `≈ ${pkg.product.currencyCode} ${perMonth.toFixed(2)} / month` : undefined,
          handle: pkg,
        };
      });
    } catch {
      return [];
    }
  },
  async purchase(plan) {
    if (!plan.handle) return { ok: false, error: 'This plan is not available in the store yet.' };
    try {
      await Purchases.purchasePackage(plan.handle as PurchasesPackage);
      return { ok: true };
    } catch (e) {
      const err = e as { userCancelled?: boolean; message?: string };
      if (err.userCancelled) return { ok: false, cancelled: true };
      return { ok: false, error: 'The purchase did not go through.' };
    }
  },
  async restore() {
    try {
      await Purchases.restorePurchases();
      return { ok: true };
    } catch {
      return { ok: false, error: 'Could not restore purchases.' };
    }
  },
};

export const store: Store = apiKey ? revenueCat : testStore;
