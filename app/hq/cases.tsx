import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Card, ErrorState, Eyebrow, Loading, Screen, T, Tag } from '../../src/components/ui';
import { Icon } from '../../src/components/Icon';
import { Stars } from '../../src/components/Stars';
import { ArtBox } from '../../src/art/components';
import { coverArt } from '../../src/art';
import { useHq, difficultyLabel, caseStars } from '../../src/state/hq';
import { useT } from '../../src/i18n';
import { color, space } from '../../src/theme/tokens';

export default function CaseLibrary() {
  const t = useT();
  const { cases, error, refresh } = useHq();
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));
  if (error && !cases) return <ErrorState message={error} onRetry={refresh} />;
  if (!cases) return <Loading />;

  return (
    <Screen texture="desk">
      <View style={{ marginTop: space.xl, marginBottom: space.lg }}>
        <Eyebrow>{t('cases.eyebrow')}</Eyebrow>
        <T v="display" style={{ marginTop: space.sm }}>{t('cases.title')}</T>
      </View>
      <View style={{ gap: space.md }}>
        {cases.map((c) => (
          <Card key={c.id} onPress={() => router.push(`/case/${c.id}`)} accent={c.session?.status === 'active' ? color.burgundyBright : undefined} style={{ padding: space.md }}>
            <View style={s.top}>
              <ArtBox art={coverArt(c.id)} width={92} height={124} style={s.thumb} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={s.row}>
                  <Eyebrow style={{ flexShrink: 1 }}>{c.caseNumber}</Eyebrow>
                  {c.locked ? <Icon name="lock" size={16} tint={color.textFaint} /> : caseStars(c) !== undefined ? <Stars count={caseStars(c)!} /> : null}
                </View>
                <T v="title" style={{ marginTop: 4, fontSize: 21, lineHeight: 25 }}>{c.title}</T>
                <T v="small" style={{ marginTop: 2, color: color.textFaint }} numberOfLines={1}>{c.category}</T>
                <T v="bodyDim" style={{ marginTop: space.sm, fontSize: 13.5, lineHeight: 19 }} numberOfLines={3}>{c.tagline}</T>
              </View>
            </View>
            <View style={[s.row, { marginTop: space.md, justifyContent: 'flex-start', gap: space.sm, flexWrap: 'wrap' }]}>
              {c.tutorial ? <Tag label={t('cases.tutorial')} tint={color.amber} /> : null}
              {c.locked ? <Tag label={t('hq.planPlusName')} tint={color.amber} /> : null}
              {c.session?.status === 'active' ? <Tag label={t('hq.inProgress')} tint={color.burgundyBright} /> : null}
              {c.session?.status === 'closed' ? <Tag label={t('cases.closed')} tint={color.greenBright} /> : null}
              <Tag label={difficultyLabel(c.difficulty)} />
              <Tag label={t('cases.minutes', { from: c.durationMinutes[0], to: c.durationMinutes[1] })} />
              <Tag label={t('cases.suspects', { n: c.suspectCount })} />
            </View>
          </Card>
        ))}
      </View>
      <T v="small" style={{ marginTop: space.xl, color: color.textFaint }}>{t('cases.more')}</T>
    </Screen>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm },
  top: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  thumb: { borderRadius: 2, borderWidth: StyleSheet.hairlineWidth, borderColor: color.paperEdge, backgroundColor: '#0D0E0F' },
});
