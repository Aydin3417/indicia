import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ActivityIndicator, Image } from 'react-native';
import { iconArt } from '../src/art';
import { Button, Eyebrow, Screen, T } from '../src/components/ui';
import { usePrefs } from '../src/state/prefs';
import { tutorialCase } from '../src/state/hq';
import { api, ApiFailure } from '../src/api/client';
import { useT } from '../src/i18n';
import { color, space } from '../src/theme/tokens';

/**
 * First launch: no text onboarding (PLAN §4). The tutorial case ("first-watch", or the first case in the catalogue
 * while it is not written yet) is opened straight onto the desk, whose briefing teaches the clock.
 */
export default function FirstWatch() {
  const t = useT();
  const setPrefs = usePrefs((s) => s.set);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async () => {
    setError(null);
    try {
      const cases = await api.cases();
      const c = tutorialCase(cases);
      if (!c) throw new Error(t('onboarding.noCase'));
      const sessionId = c.session?.status === 'active' ? c.session.id : (await api.start(c.id)).sessionId;
      setPrefs({ onboarded: true });
      api.event('onboarding_completed', { tutorial: c.id === 'first-watch' });
      router.replace('/hq');
      router.push(`/desk/${sessionId}`);
    } catch (e) {
      setError(e instanceof ApiFailure || e instanceof Error ? e.message : t('common.wentWrong'));
    }
  }, [setPrefs, t]);

  useEffect(() => { start(); }, [start]);

  return (
    <Screen scroll={false} style={s.page} texture="desk">
      <Animated.View entering={FadeIn.duration(500)} style={{ alignItems: 'center', gap: space.md }}>
        {iconArt() ? <Image source={iconArt()!.src} style={s.icon} accessibilityIgnoresInvertColors /> : null}
        <Eyebrow style={{ marginTop: space.lg }}>{t('onboarding.eyebrow')}</Eyebrow>
        <T v="display" style={{ textAlign: 'center' }}>{t('onboarding.title')}</T>
        {error ? (
          <>
            <T v="bodyDim" style={{ textAlign: 'center', maxWidth: 300 }}>{error}</T>
            <Button label={t('common.retry')} onPress={start} style={{ marginTop: space.md, alignSelf: 'stretch' }} />
            <Button label={t('onboarding.skip')} kind="ghost" onPress={() => { setPrefs({ onboarded: true }); router.replace('/hq'); }} />
          </>
        ) : (
          <View style={{ marginTop: space.lg }}><ActivityIndicator color={color.textDim} /></View>
        )}
      </Animated.View>
    </Screen>
  );
}

const s = StyleSheet.create({
  page: { justifyContent: 'center', alignItems: 'center' },
  icon: { width: 132, height: 132, borderRadius: 30, borderWidth: StyleSheet.hairlineWidth, borderColor: color.border },
});
