import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Button, Divider, ErrorState, Eyebrow, KeyValue, Loading, Paper, PaperText, Screen, Stamp, T, TopBar } from '../../src/components/ui';
import { Stars } from '../../src/components/Stars';
import { CoverCard } from '../../src/art/components';
import { useHq, difficultyLabel, caseStars } from '../../src/state/hq';
import { toast } from '../../src/state/toasts';
import { api, ApiFailure } from '../../src/api/client';
import { useT } from '../../src/i18n';
import { color, space } from '../../src/theme/tokens';

export default function CaseDetail() {
  const t = useT();
  const { caseId } = useLocalSearchParams<{ caseId: string }>();
  const { cases, error, refresh } = useHq();
  const [busy, setBusy] = useState<'open' | 'restart' | 'coop' | null>(null);
  const [w, setW] = useState(343);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  if (error && !cases) return <ErrorState message={error} onRetry={refresh} />;
  const c = cases?.find((x) => x.id === caseId);
  if (!cases) return <Loading />;
  if (!c) return <ErrorState message={t('case.missing')} />;

  const open = async (restart: boolean) => {
    setBusy(restart ? 'restart' : 'open');
    try {
      if (c.session?.status === 'closed' && !restart) {
        router.push(`/desk/${c.session.id}/finale`);
        return;
      }
      if (c.session?.status === 'active' && !restart) {
        router.push(`/desk/${c.session.id}`);
        return;
      }
      const { sessionId } = await api.start(c.id, restart);
      router.push(`/desk/${sessionId}`);
    } catch (e) {
      toast({ title: e instanceof ApiFailure ? e.message : t('case.openFailed'), tone: 'alert' });
    } finally {
      setBusy(null);
    }
  };

  const openRoom = async () => {
    setBusy('coop');
    try {
      const { sessionId } = await api.start(c.id, false, 'coop');
      router.push(`/desk/${sessionId}/room`);
    } catch (e) {
      toast({ title: e instanceof ApiFailure ? e.message : t('case.roomFailed'), tone: 'alert' });
    } finally {
      setBusy(null);
    }
  };

  const active = c.session?.status === 'active';
  const closed = c.session?.status === 'closed';

  return (
    <Screen texture="desk">
      <TopBar eyebrow={t('cases.eyebrow')} />
      <View onLayout={(e) => setW(Math.min(e.nativeEvent.layout.width, 520))}>
        <CoverCard
          caseId={c.id}
          width={w}
          height={Math.round(Math.min(w * 1.12, 460))}
          eyebrow={c.caseNumber}
          title={c.title}
          tagline={c.tagline}
          right={<Stamp label={closed ? t('case.stamp.closed') : active ? t('case.stamp.open') : t('case.stamp.unsolved')} rotate={closed ? -4 : 5} tint={closed ? color.greenBright : color.burgundyBright} />}
        />
      </View>
      <Paper style={{ marginTop: space.md }}>
        <PaperText selectable style={{ fontSize: 15, lineHeight: 23 }}>{c.synopsis}</PaperText>
        <View style={s.rule} />
        <PaperText mono dim>{t('case.setting')}   {c.setting}</PaperText>
      </Paper>

      {caseStars(c) !== undefined ? (
        <View style={s.starsRow}>
          <Stars count={caseStars(c)!} size={20} />
          <T v="small">{t('case.bestStars')}</T>
        </View>
      ) : null}

      <View style={{ marginTop: space.xl }}>
        <KeyValue k={t('case.difficulty')} v={difficultyLabel(c.difficulty)} />
        <KeyValue k={t('case.length')} v={t('case.lengthValue', { from: c.durationMinutes[0], to: c.durationMinutes[1] })} />
        <KeyValue k={t('case.suspects')} v={String(c.suspectCount)} />
        <KeyValue k={t('case.mode')} v={t('case.modeValue')} />
      </View>

      <Divider />
      {c.locked ? (
        <T v="bodyDim">{t('case.plusOnly')}</T>
      ) : (
        <View style={{ gap: space.sm }}>
          <Button
            label={closed ? t('case.readVerdict') : active ? t('hq.resume') : t('case.take')}
            onPress={() => open(false)}
            busy={busy === 'open'}
          />
          <Button label={t('case.withFriends')} kind="secondary" icon="people" onPress={openRoom} busy={busy === 'coop'} />
          {active || closed ? (
            <Button label={t('case.restart')} kind="ghost" onPress={() => open(true)} busy={busy === 'restart'} />
          ) : null}
        </View>
      )}
      <Eyebrow style={{ marginTop: space.xl, textAlign: 'center' }} tint={color.textFaint}>{t('common.fiction')}</Eyebrow>
    </Screen>
  );
}

const s = StyleSheet.create({
  paperHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  rule: { height: 1, backgroundColor: color.paperEdge, marginVertical: space.lg },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.lg },
});
