import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Divider, Screen, Section, Segmented, T, TopBar } from '../src/components/ui';
import { usePrefs } from '../src/state/prefs';
import { useSoundPrefs } from '../src/sound/prefs';
import { api, resetIdentity } from '../src/api/client';
import { useI18n, useT, type Locale } from '../src/i18n';
import type { Profile } from '../shared/api';
import { color, space } from '../src/theme/tokens';

type LangChoice = Locale | 'device';

export default function Settings() {
  const t = useT();
  const { haptics, idleAssist, set } = usePrefs();
  const choice = useI18n((s) => s.choice);
  const choose = useI18n((s) => s.choose);
  const sfx = useSoundPrefs((x) => x.sfx);
  const ambience = useSoundPrefs((x) => x.ambience);
  const setSound = useSoundPrefs((x) => x.set);
  const [profile, setProfile] = useState<Profile | null>(null);
  useEffect(() => { api.me().then(setProfile).catch(() => undefined); }, []);
  useEffect(() => { useSoundPrefs.getState().hydrate().catch(() => undefined); }, []);
  const toggleAnalytics = async (share: boolean) => {
    if (!profile) return;
    setProfile({ ...profile, analyticsOptOut: !share });
    setProfile(await api.setPrivacy(!share).catch(() => profile));
  };
  return (
    <Screen texture="desk">
      <TopBar title={t('settings.title')} />
      <Section title={t('settings.language')}>
        <Segmented<LangChoice>
          value={choice ?? 'device'}
          onChange={(v) => { choose(v === 'device' ? null : v); }}
          options={[
            { value: 'en', label: t('settings.lang.en') },
            { value: 'tr', label: t('settings.lang.tr') },
            { value: 'device', label: t('settings.languageDevice') },
          ]}
        />
        <T v="small" style={{ marginTop: space.sm }}>{t('settings.languageNote')}</T>
      </Section>
      <Section title={t('settings.feedback')}>
        <Pressable style={s.row} onPress={() => set({ haptics: !haptics })} accessibilityRole="switch" accessibilityState={{ checked: haptics }}>
          <T>{t('settings.haptics')}</T>
          <Switch value={haptics} onValueChange={(v) => set({ haptics: v })} trackColor={{ true: color.burgundy, false: color.border }} thumbColor={color.paper} {...({ activeThumbColor: color.paper } as object)} />
        </Pressable>
        <Pressable style={s.row} onPress={() => setSound({ sfx: !sfx })} accessibilityRole="switch" accessibilityState={{ checked: sfx }} testID="settings-sfx">
          <View style={{ flex: 1, paddingRight: space.md }}>
            <T>{t('settings.sfx')}</T>
            <T v="small" style={{ marginTop: 2 }}>{t('settings.sfxNote')}</T>
          </View>
          <Switch value={sfx} onValueChange={(v) => setSound({ sfx: v })} trackColor={{ true: color.burgundy, false: color.border }} thumbColor={color.paper} {...({ activeThumbColor: color.paper } as object)} />
        </Pressable>
        <Pressable style={s.row} onPress={() => setSound({ ambience: !ambience })} accessibilityRole="switch" accessibilityState={{ checked: ambience }} testID="settings-ambience">
          <View style={{ flex: 1, paddingRight: space.md }}>
            <T>{t('settings.ambience')}</T>
            <T v="small" style={{ marginTop: 2 }}>{t('settings.ambienceNote')}</T>
          </View>
          <Switch value={ambience} onValueChange={(v) => setSound({ ambience: v })} trackColor={{ true: color.burgundy, false: color.border }} thumbColor={color.paper} {...({ activeThumbColor: color.paper } as object)} />
        </Pressable>
        <Pressable style={s.row} onPress={() => set({ idleAssist: !idleAssist })} accessibilityRole="switch" accessibilityState={{ checked: idleAssist }}>
          <View style={{ flex: 1, paddingRight: space.md }}>
            <T>{t('settings.idleAssist')}</T>
            <T v="small" style={{ marginTop: 2 }}>{t('settings.idleAssistNote')}</T>
          </View>
          <Switch value={idleAssist} onValueChange={(v) => set({ idleAssist: v })} trackColor={{ true: color.burgundy, false: color.border }} thumbColor={color.paper} {...({ activeThumbColor: color.paper } as object)} />
        </Pressable>
      </Section>
      <Section title={t('settings.privacy')}>
        <Pressable style={s.row} onPress={() => profile && toggleAnalytics(profile.analyticsOptOut)} disabled={!profile}>
          <View style={{ flex: 1, paddingRight: space.md }}>
            <T>{t('settings.analytics')}</T>
            <T v="small" style={{ marginTop: 2 }}>{t('settings.analyticsNote')}</T>
          </View>
          <Switch
            value={profile ? !profile.analyticsOptOut : true}
            disabled={!profile}
            onValueChange={toggleAnalytics}
            trackColor={{ true: color.burgundy, false: color.border }} thumbColor={color.paper} {...({ activeThumbColor: color.paper } as object)}
          />
        </Pressable>
      </Section>
      <Section title={t('settings.content')}>
        <T v="bodyDim">{t('settings.contentText')}</T>
      </Section>
      <Section title={t('settings.data')}>
        <T v="bodyDim">{t('settings.dataText')}</T>
        <Button
          label={t('settings.reset')}
          kind="danger"
          style={{ marginTop: space.lg }}
          onPress={async () => { await resetIdentity(); set({ onboarded: false, briefed: [] }); router.replace('/onboarding'); }}
        />
        <T v="small" style={{ marginTop: space.sm }}>{t('settings.resetNote')}</T>
      </Section>
      {profile?.billing.devPurchases ? (
        <Section title={t('settings.dev')}>
          <T v="small">{t('settings.devPlan', { plan: profile.plan })}</T>
          <Button label={t('settings.devReset')} kind="secondary" compact style={{ marginTop: space.sm, alignSelf: 'flex-start' }}
            onPress={async () => setProfile(await api.devResetPlan())} />
        </Section>
      ) : null}
      <Divider style={{ marginTop: space.xxl }} />
      <T v="small">{t('settings.version')}</T>
    </Screen>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: space.sm },
});
