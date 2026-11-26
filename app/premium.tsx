import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { iconArt } from '../src/art';
import { router, useLocalSearchParams } from 'expo-router';
import type { Profile } from '../shared/api';
import { Button, Divider, Eyebrow, Loading, Screen, Stamp, T, Tag, TopBar, tap } from '../src/components/ui';
import { Icon } from '../src/components/Icon';
import { api, ApiFailure } from '../src/api/client';
import { store, type Plan } from '../src/purchases';
import { toast } from '../src/state/toasts';
import { useHq } from '../src/state/hq';
import { useLocale, useT } from '../src/i18n';
import { color, font, radius, space } from '../src/theme/tokens';

let configuredFor: string | null = null;

const BENEFITS = ['b1', 'b2', 'b3'] as const;

export default function Premium() {
  const { source } = useLocalSearchParams<{ source?: string }>();
  const t = useT();
  const locale = useLocale();

  const refreshHq = useHq((s) => s.refresh);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);
  const [busy, setBusy] = useState<'buy' | 'restore' | null>(null);
  const tracked = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const me = await api.me();
        setProfile(me);
        if (configuredFor !== me.userId) {
          await store.configure(me.userId);
          configuredFor = me.userId;
        }
        const list = await store.plans();
        setPlans(list);
        setChosen(list[0]?.id ?? null);
        if (!tracked.current) {
          tracked.current = true;
          api.event('paywall_viewed', { source: source ?? 'direct', plan: me.plan });
        }
      } catch (e) {
        toast({ title: e instanceof ApiFailure ? e.message : t('premium.storeDown'), tone: 'alert' });
        setPlans([]);
      }
    })();
  }, [source, t]);

  const finish = async (devGrant: boolean, verb: string) => {
    const me = await api.syncEntitlement(devGrant);
    setProfile(me);
    await refreshHq();
    if (me.plan === 'plus') toast({ title: t('premium.activeToast'), text: verb, tone: 'evidence' });
    else toast({ title: t('premium.noneFound'), tone: 'neutral' });
  };

  const buy = async () => {
    const plan = plans?.find((p) => p.id === chosen);
    if (!plan) return;
    setBusy('buy');
    api.event('purchase_started', { plan: plan.id, store: store.kind });
    try {
      const out = await store.purchase(plan);
      if (out.cancelled) { api.event('purchase_cancelled', { plan: plan.id }); return; }
      if (!out.ok) { toast({ title: out.error ?? t('premium.buyFailed'), tone: 'alert' }); return; }
      await finish(store.kind === 'test', t('premium.thanks'));
    } catch (e) {
      toast({ title: e instanceof ApiFailure ? e.message : t('premium.confirmFailed'), tone: 'alert' });
    } finally {
      setBusy(null);
    }
  };

  const restore = async () => {
    setBusy('restore');
    try {
      const out = await store.restore();
      if (!out.ok) { toast({ title: out.error ?? t('premium.restoreFailed'), tone: 'alert' }); return; }
      await finish(false, t('premium.restored'));
    } catch (e) {
      toast({ title: e instanceof ApiFailure ? e.message : t('premium.restoreFailed'), tone: 'alert' });
    } finally {
      setBusy(null);
    }
  };

  if (!profile || !plans) return <Loading label={t('premium.loading')} />;
  const active = profile.plan === 'plus';
  const testMode = store.kind === 'test';

  return (
    <Screen texture="desk">
      <TopBar eyebrow={t('premium.eyebrow')} />
      <View style={s.hero}>
        {iconArt() ? <Image source={iconArt()!.src} style={s.emblem} /> : null}
        <Stamp label={t('premium.stamp')} tint={color.amber} rotate={-3} />
      </View>
      <T v="display" style={{ marginTop: space.lg }}>{active ? t('premium.titleActive') : t('premium.title')}</T>
      {active && profile.plusUntil ? (
        <T v="bodyDim" style={{ marginTop: space.sm }}>
          {t('premium.activeUntil', { date: new Date(profile.plusUntil).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-GB') })}
        </T>
      ) : source === 'quota' ? (
        <T v="bodyDim" style={{ marginTop: space.sm }}>{t('premium.quota')}</T>
      ) : null}

      <View style={{ marginTop: space.xl, gap: space.lg }}>
        {BENEFITS.map((b) => (
          <View key={b} style={s.benefit}>
            <Icon name="check" size={18} tint={color.amber} />
            <View style={{ flex: 1 }}>
              <T v="heading">{t(`premium.${b}.title`)}</T>
              <T v="bodyDim" style={{ marginTop: 2 }}>{t(`premium.${b}.text`)}</T>
            </View>
          </View>
        ))}
      </View>

      {!active ? (
        <>
          <Divider style={{ marginTop: space.xl }} />
          {plans.length === 0 ? <T v="bodyDim">{t('premium.unavailable')}</T> : null}
          <View style={{ gap: space.sm }}>
            {plans.map((p, i) => (
              <Pressable key={p.id} onPress={() => { tap(); setChosen(p.id); }} style={[s.plan, chosen === p.id && s.planOn]} accessibilityRole="radio" accessibilityState={{ checked: chosen === p.id }}>
                <View style={[s.radio, chosen === p.id && s.radioOn]} />
                <View style={{ flex: 1 }}>
                  {/* the store's own title, except the test store's plain English placeholders */}
                  <T v="heading">{/^(annual|yearly|monthly)$/i.test(p.title.trim()) ? t(`premium.plan.${p.period}`) : p.title}</T>
                  {p.note ? <T v="small">{p.note}</T> : null}
                  {i === 0 && p.period === 'year' ? <View style={{ marginTop: 6 }}><Tag label={t('premium.bestValue')} tint={color.amber} /></View> : null}
                </View>
                <Text style={s.price}>{p.price}<Text style={s.per}> {t('premium.per', { period: t(`premium.period.${p.period}`) })}</Text></Text>
              </Pressable>
            ))}
          </View>
          <Button label={t('premium.start')} style={{ marginTop: space.lg }} onPress={buy} busy={busy === 'buy'} disabled={!chosen || busy !== null} />
        </>
      ) : null}

      <Button label={t('premium.restore')} kind="ghost" onPress={restore} busy={busy === 'restore'} disabled={busy !== null} style={{ marginTop: space.sm }} />

      <T v="small" style={{ marginTop: space.lg, color: color.textFaint }}>
        {t('premium.legal')}
      </T>
      {testMode ? (
        <View style={s.testBox}>
          <Eyebrow tint={color.amber}>{t('premium.dev.title')}</Eyebrow>
          <T v="small" style={{ marginTop: 4 }}>
            {t('premium.dev.text')} {profile.billing.devPurchases ? t('premium.dev.accepted') : t('premium.dev.refused')}
          </T>
        </View>
      ) : null}
      <Button label={active ? t('premium.back') : t('premium.notNow')} kind="ghost" onPress={() => (router.canGoBack() ? router.back() : router.replace('/hq'))} style={{ marginTop: space.lg }} />
    </Screen>
  );
}

const s = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  emblem: { width: 72, height: 72, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: color.border },
  benefit: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  plan: { flexDirection: 'row', alignItems: 'center', gap: space.md, borderWidth: 1, borderColor: color.border, borderRadius: radius.md, padding: space.lg, backgroundColor: color.surface },
  planOn: { borderColor: color.amber },
  radio: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: color.textFaint },
  radioOn: { borderColor: color.amber, backgroundColor: color.amber },
  price: { fontFamily: font.serif, fontSize: 20, color: color.text },
  per: { fontFamily: font.sans, fontSize: 12, color: color.textDim },
  testBox: { marginTop: space.lg, borderWidth: 1, borderColor: color.amber, borderStyle: 'dashed', borderRadius: radius.md, padding: space.md },
});
