import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Button, Divider, ErrorState, Eyebrow, Loading, Screen, Section, Stamp, T, Tag } from '../../src/components/ui';
import { Stars } from '../../src/components/Stars';
import { CoverCard } from '../../src/art/components';
import { useHq, difficultyLabel, caseHref, caseStars } from '../../src/state/hq';
import { toast } from '../../src/state/toasts';
import { api, ApiFailure } from '../../src/api/client';
import { useT } from '../../src/i18n';
import { color, font, radius, space } from '../../src/theme/tokens';

export default function Headquarters() {
  const t = useT();
  const { cases, profile, error, refresh } = useHq();
  const [w, setW] = useState(343);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  if (error && !profile) return <ErrorState message={error} onRetry={refresh} />;
  if (!cases || !profile) return <Loading label={t('hq.loading')} />;

  const active = cases.find((c) => c.session?.status === 'active');
  const featured = active ?? cases.find((c) => !c.session) ?? cases[0];

  return (
    <Screen texture="desk">
      <View style={s.head}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Eyebrow>{t('hq.eyebrow')}</Eyebrow>
          <T v="title" style={{ marginTop: 4, fontSize: 26, lineHeight: 31 }} numberOfLines={1}>{profile.displayName === 'Investigator' ? t('desk.room.investigator') : profile.displayName}</T>
          <T v="small" style={{ marginTop: 2 }}>{profile.rank}</T>
        </View>
        <Pressable onPress={() => router.push('/premium?source=hq')} accessibilityRole="button" accessibilityLabel={t('hq.plan')} hitSlop={8} style={s.planBtn}>
          <Stamp label={profile.plan === 'plus' ? t('hq.planPlus') : t('hq.planFree')} tint={profile.plan === 'plus' ? color.amber : color.textFaint} rotate={0} />
        </Pressable>
      </View>

      {featured ? (
        <View style={{ marginTop: space.lg }}>
          <Eyebrow style={{ marginBottom: space.sm }}>{active ? t('hq.open') : featured.session?.status === 'closed' ? t('hq.last') : t('hq.onDesk')}</Eyebrow>
          <View onLayout={(e) => setW(Math.min(e.nativeEvent.layout.width, 520))}>
            <CoverCard
              onPress={() => router.push(`/case/${featured.id}`)}
              caseId={featured.id}
              width={w}
              height={Math.round(Math.min(w * 1.18, 470))}
              eyebrow={featured.caseNumber}
              title={featured.title}
              tagline={featured.tagline}
              right={active ? <Tag label={t('hq.inProgress')} tint={color.burgundyBright} />
                : caseStars(featured) !== undefined ? <Stars count={caseStars(featured)!} />
                : <Tag label={difficultyLabel(featured.difficulty)} tint={color.textDim} />}
            >
              <Button
                label={active ? t('hq.resume') : featured.session?.status === 'closed' ? t('hq.review') : t('hq.openFile')}
                onPress={() => router.push(active || featured.session?.status === 'closed' ? caseHref(featured) : `/case/${featured.id}`)}
              />
            </CoverCard>
          </View>
        </View>
      ) : null}

      <View style={s.stats}>
        <Stat label={t('hq.stat.closed')} value={profile.stats.casesClosed} />
        <Stat label={t('hq.stat.correct')} value={profile.stats.correctAccusations} />
        <Stat label={t('hq.stat.stars')} value={profile.stars || '—'} />
      </View>

      <JoinRoom />

      <Section title={t('hq.orders')}>
        <View style={{ gap: space.md }}>
          <Order n="1" text={t('hq.order1')} />
          <Order n="2" text={t('hq.order2')} />
          <Order n="3" text={t('hq.order3')} />
        </View>
      </Section>

      <Divider style={{ marginTop: space.xxl }} />
      <T v="small">{t('hq.questionsToday', { n: profile.usage.questionsToday, max: profile.usage.dailyLimit })}</T>
    </Screen>
  );
}

function JoinRoom() {
  const t = useT();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const clean = code.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  const join = async () => {
    setBusy(true);
    try {
      const { sessionId } = await api.join(clean);
      setCode('');
      router.push(`/desk/${sessionId}/room`);
    } catch (e) {
      toast({ title: e instanceof ApiFailure ? e.message : t('hq.joinFailed'), tone: 'alert' });
    } finally {
      setBusy(false);
    }
  };
  return (
    <Section title={t('hq.join')}>
      <View style={s.joinRow}>
        <TextInput
          value={clean}
          onChangeText={setCode}
          placeholder={t('hq.joinPlaceholder')}
          placeholderTextColor={color.textFaint}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={8}
          style={s.joinInput}
          onSubmitEditing={() => clean.length === 6 && join()}
          accessibilityLabel={t('hq.joinPlaceholder')}
        />
        <Button label={t('hq.joinButton')} kind="secondary" onPress={join} busy={busy} disabled={clean.length !== 6} />
      </View>
    </Section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={s.stat}>
      <T v="title">{String(value)}</T>
      <Eyebrow style={{ marginTop: 2 }}>{label}</Eyebrow>
    </View>
  );
}

function Order({ n, text }: { n: string; text: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: space.md }}>
      <T v="mono" style={{ color: color.burgundyBright }}>{n.padStart(2, '0')}</T>
      <T v="bodyDim" style={{ flex: 1 }}>{text}</T>
    </View>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md, marginTop: space.lg },
  planBtn: { minHeight: 44, justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  stats: { flexDirection: 'row', marginTop: space.lg, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: color.border },
  stat: { flex: 1, paddingVertical: space.lg },
  joinRow: { flexDirection: 'row', gap: space.sm, alignItems: 'center' },
  joinInput: {
    flex: 1, height: 48, borderWidth: 1, borderColor: color.border, borderRadius: radius.md, paddingHorizontal: space.md,
    fontFamily: font.monoMedium, fontSize: 18, letterSpacing: 4, color: color.text, backgroundColor: color.surface,
  },
});
