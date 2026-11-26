// UI language for the whole app. One `t(key, vars)` with {name} interpolation and `_one` plural variants,
// shell dictionaries (en.ts / tr.ts) merged with every feature's strings.ts.
//
// Language order: the profile setting (PUT /me/locale) → the choice saved on this device → the device language → en.
// Changing it takes effect immediately: the store updates, Accept-Language follows, and listeners (the desk view,
// headquarters) refetch so server content arrives in the new language too.
import { useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import type { Locale, Profile } from '../../shared/api';
import { api, setNetworkMessage, setRequestLocale } from '../api/client';
import { en } from './en';
import { tr } from './tr';
import { loadFeatureStrings } from './features';

export type { Locale };
export type Vars = Record<string, string | number>;
/** The translate function handed to every screen and feature. */
export type Translate = (key: string, vars?: Vars) => string;

const CHOICE_KEY = 'indicia.locale.v1';

let tables: Record<Locale, Record<string, string>> = { en: { ...en }, tr: { ...tr } };
let featureSources: string[] = [];

/** Re-reads features' strings.ts (they may land while the app runs). Cheap; called on start and on demand. */
export function mergeFeatureStrings() {
  const f = loadFeatureStrings();
  featureSources = f.sources;
  // shell keys win on a collision; features own their own namespaces (interview.*, scene.*, …)
  tables = { en: { ...f.en, ...en }, tr: { ...f.tr, ...tr } };
}
export const mergedFeatureSources = () => featureSources;

export function deviceLocale(): Locale {
  try {
    const nav = Platform.OS === 'web' && typeof navigator !== 'undefined' ? (navigator.languages?.[0] ?? navigator.language) : undefined;
    const tag = nav ?? Intl.DateTimeFormat().resolvedOptions().locale ?? 'en';
    return tag.toLowerCase().startsWith('tr') ? 'tr' : 'en';
  } catch {
    return 'en';
  }
}

const fill = (s: string, vars?: Vars) =>
  vars ? s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m)) : s;

export function translate(locale: Locale, key: string, vars?: Vars): string {
  const table = tables[locale];
  const n = vars?.n;
  if (typeof n === 'number' && n === 1) {
    // the English singular is a fallback only when this language has no form of the key at all (Turkish has no
    // separate singular: "1 öneri" must not become "1 suggestion" — wave 6)
    const one = table[`${key}_one`] ?? (table[key] === undefined ? tables.en[`${key}_one`] : undefined);
    if (one !== undefined) return fill(one, vars);
  }
  const s = table[key] ?? tables.en[key];
  return s === undefined ? key : fill(s, vars);
}

interface I18nStore {
  /** the language in use */
  locale: Locale;
  /** what the player picked; null = follow the device */
  choice: Locale | null;
  /** bumps whenever the language or the tables change, so memoised screens re-render */
  rev: number;
  hydrate: () => Promise<void>;
  /** the player picked a language (or null = device): applies now, saves on the device and in the profile */
  choose: (choice: Locale | null) => Promise<void>;
  /** adopt the profile's language when headquarters loads it */
  adoptProfile: (p: Pick<Profile, 'locale'>) => void;
}

const listeners = new Set<(l: Locale) => void>();
/** Called after the language changes (the desk refetches its view, HQ refreshes the catalogue). */
export function onLocaleChange(fn: (l: Locale) => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

const apply = (locale: Locale) => {
  setRequestLocale(locale);
  setNetworkMessage(translate(locale, 'common.network'));
  // web: CSS text-transform follows the document language (Turkish dotted İ in uppercase labels)
  if (Platform.OS === 'web' && typeof document !== 'undefined') document.documentElement.lang = locale;
};

export const useI18n = create<I18nStore>((set, get) => {
  const switchTo = (locale: Locale, choice: Locale | null) => {
    const changed = locale !== get().locale;
    apply(locale);
    set({ locale, choice, rev: get().rev + 1 });
    if (changed) for (const fn of listeners) fn(locale);
  };
  const initial = deviceLocale();
  apply(initial);
  return {
    locale: initial,
    choice: null,
    rev: 0,
    hydrate: async () => {
      mergeFeatureStrings();
      let saved: Locale | null = null;
      try {
        const raw = await AsyncStorage.getItem(CHOICE_KEY);
        if (raw === 'en' || raw === 'tr') saved = raw;
      } catch {
        // storage unavailable: device language
      }
      switchTo(saved ?? deviceLocale(), saved);
      set({ rev: get().rev + 1 });
    },
    choose: async (choice) => {
      switchTo(choice ?? deviceLocale(), choice);
      AsyncStorage.setItem(CHOICE_KEY, choice ?? 'device').catch(() => undefined);
      await api.setLocale(choice).catch(() => undefined);
      for (const fn of listeners) fn(get().locale);
    },
    adoptProfile: (p) => {
      if (p.locale && p.locale !== get().choice) {
        AsyncStorage.setItem(CHOICE_KEY, p.locale).catch(() => undefined);
        switchTo(p.locale, p.locale);
      }
    },
  };
});

/** Non-React translate in the current language (stores, toasts). */
export const t: Translate = (key, vars) => translate(useI18n.getState().locale, key, vars);

/** React translate bound to the current language; identity changes when the language does. */
export function useT(): Translate {
  const locale = useI18n((s) => s.locale);
  const rev = useI18n((s) => s.rev);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback((key: string, vars?: Vars) => translate(locale, key, vars), [locale, rev]);
}

export const useLocale = () => useI18n((s) => s.locale);

/** "1 h 30 min" · "45 min" · "2 h" in the current language. */
export function fmtMinutes(tr_: Translate, minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h === 0) return tr_('time.min', { m: r });
  if (r === 0) return tr_('time.h', { h });
  return tr_('time.hm', { h, m: r });
}

/** The cost label shown on every button that spends time: "30 min" or "free". */
export function fmtCost(tr_: Translate, minutes: number): string {
  return minutes > 0 ? fmtMinutes(tr_, minutes) : tr_('time.free');
}
