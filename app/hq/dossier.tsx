import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Button, Card, Divider, ErrorState, Eyebrow, KeyValue, Loading, Screen, Section, T, Tag } from '../../src/components/ui';
import { Stars } from '../../src/components/Stars';
import { ArtBox } from '../../src/art/components';
import { coverArt } from '../../src/art';
import { useHq } from '../../src/state/hq';
import { api } from '../../src/api/client';
import { useLocale, useT } from '../../src/i18n';
import { color, font, space } from '../../src/theme/tokens';

export default function Dossier() {
  const t = useT();
  const locale = useLocale();
  const { profile, error, refresh } = useHq();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));
  useEffect(() => { if (profile) setName(profile.displayName); }, [profile]);

  if (error && !profile) return <ErrorState message={error} onRetry={refresh} />;
  if (!profile) return <Loading />;

  const save = async () => {
    setSaving(true);
    try { await api.rename(name); await refresh(); } finally { setSaving(false); }
  };
  const date = (ms: number) => new Date(ms).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-GB');

  return (
    <Screen texture="desk">
      <View style={{ marginTop: space.xl }}>
        <Eyebrow>{t('dossier.eyebrow')}</Eyebrow>
        <T v="display" style={{ marginTop: space.sm }}>{profile.displayName === 'Investigator' ? t('desk.room.investigator') : profile.displayName}</T>
        <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.md }}>
          <Tag label={profile.rank} tint={color.text} />
          {profile.plan === 'plus' ? <Tag label={t('hq.planPlusName')} tint={color.amber} /> : null}
        </View>
        {profile.nextRank ? (
          <T v="small" style={{ marginTop: space.md }}>{t('dossier.nextRank', { n: profile.nextRank.needed, rank: profile.nextRank.name })}</T>
        ) : null}
      </View>

      <Section title={t('dossier.plan')}>
        <Card accent={profile.plan === 'plus' ? color.amber : undefined}>
          <T v="heading">{profile.plan === 'plus' ? t('hq.planPlusName') : t('dossier.planFreeName')}</T>
          <T v="small" style={{ marginTop: 2 }}>
            {profile.plan === 'plus' && profile.plusUntil
              ? t('dossier.plusUntil', { date: date(profile.plusUntil), n: profile.usage.dailyLimit })
              : t('dossier.questionsUsed', { n: profile.usage.questionsToday, max: profile.usage.dailyLimit })}
          </T>
          <Button
            label={profile.plan === 'plus' ? t('dossier.manage') : t('dossier.seePlus')}
            kind="secondary"
            compact
            style={{ marginTop: space.md, alignSelf: 'flex-start' }}
            onPress={() => router.push('/premium?source=dossier')}
          />
        </Card>
      </Section>

      <Section title={t('dossier.record')}>
        {/* the service record as a ledger line, not a form */}
        <View style={s.ledger}>
          {[
            [t('hq.stat.closed'), String(profile.stats.casesClosed)],
            [t('hq.stat.correct'), String(profile.stats.correctAccusations)],
            [t('hq.stat.stars'), profile.stars ? String(profile.stars) : '—'],
            [t('dossier.questions'), String(profile.stats.questionsAsked)],
          ].map(([k, v]) => (
            <View key={k} style={{ flex: 1, minWidth: 0 }}>
              <T v="title">{v}</T>
              <Eyebrow style={{ marginTop: 2 }} >{k}</Eyebrow>
            </View>
          ))}
        </View>
      </Section>

      <Section title={t('dossier.history')}>
        {profile.history.length === 0 ? <T v="bodyDim">{t('dossier.noCases')}</T> : null}
        <View style={{ gap: space.sm }}>
          {profile.history.map((h) => (
            <Card key={h.sessionId} onPress={() => router.push(h.status === 'closed' ? `/desk/${h.sessionId}/finale` : `/desk/${h.sessionId}`)}>
              <View style={s.row}>
                <ArtBox art={coverArt(h.caseId)} width={36} height={48} style={s.thumb} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <T v="heading">{h.title}</T>
                  <T v="small" style={{ marginTop: 2 }}>{h.status === 'closed' ? t('dossier.closed') : t('dossier.inProgress')} · {date(h.at)}</T>
                </View>
                {h.status === 'closed' && h.stars !== undefined ? <Stars count={h.stars} />
                  : <Tag label={h.status === 'closed' ? t('dossier.closed') : t('dossier.open')} tint={h.status === 'closed' ? color.greenBright : color.burgundyBright} />}
              </View>
            </Card>
          ))}
        </View>
      </Section>

      <Section title={t('dossier.name')}>
        <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
          <TextInput value={name} onChangeText={setName} maxLength={40} style={s.input} placeholderTextColor={color.textFaint} accessibilityLabel={t('dossier.name')} />
          <Button label={t('common.save')} kind="secondary" compact onPress={save} busy={saving} disabled={!name.trim() || name === profile.displayName} />
        </View>
      </Section>

      <Divider style={{ marginTop: space.xxl }} />
      <Button label={t('settings.title')} kind="ghost" icon="chevron" onPress={() => router.push('/settings')} />
    </Screen>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  ledger: { flexDirection: 'row', gap: space.sm, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: color.border, paddingVertical: space.lg },
  thumb: { borderRadius: 2, borderWidth: StyleSheet.hairlineWidth, borderColor: color.paperEdge },
  input: { flex: 1, borderBottomWidth: 1, borderColor: color.border, paddingVertical: 8, fontFamily: font.sans, fontSize: 16, color: color.text },
});
