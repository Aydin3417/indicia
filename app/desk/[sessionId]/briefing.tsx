import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { CoverCard, FaceCrop } from '../../../src/art/components';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Divider, Eyebrow, Paper, PaperText, Screen, Section, Stamp, T, TopBar } from '../../../src/components/ui';
import { Icon, type IconName } from '../../../src/components/Icon';
import { useDesk } from '../../../src/state/desk';
import { usePrefs } from '../../../src/state/prefs';
import { fmtMinutes, useT } from '../../../src/i18n';
import { color, font, space } from '../../../src/theme/tokens';

/** The case briefing, with the three rules of the clock. Shown once at the start; reachable from the Map tab. */
export default function Briefing() {
  const t = useT();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const view = useDesk((s) => s.view)!;
  const markBriefed = usePrefs((s) => s.markBriefed);
  const b = view.briefing;
  const first = !usePrefs.getState().briefed.includes(sessionId!);
  const { clock } = view;
  const [w, setW] = useState(343);

  const begin = () => {
    markBriefed(sessionId!);
    if (router.canGoBack()) router.back();
    else router.replace(`/desk/${sessionId}`);
  };

  const rules: { icon: IconName; text: string }[] = [
    { icon: 'clock', text: t('desk.briefing.rule1', { n: clock.days, days: clock.days, hours: fmtMinutes(t, clock.minutesPerDay), start: clock.dayStart, end: clock.dayEnd }) },
    { icon: 'search', text: t('desk.briefing.rule2') },
    { icon: 'lab', text: t('desk.briefing.rule3', { n: view.lab.slots }) },
    { icon: 'gavel', text: t('desk.briefing.rule4') },
  ];

  return (
    <Screen texture="desk" footer={<View style={s.footer}><Button label={first ? t('desk.briefing.begin') : t('common.back')} onPress={begin} /></View>}>
      <TopBar onBack={first ? false : undefined} eyebrow={view.case.caseNumber} title={t('desk.briefing.title')} />
      <View onLayout={(e) => setW(Math.min(e.nativeEvent.layout.width, 520))}>
        <CoverCard caseId={view.case.id} width={w} height={Math.round(Math.min(w * 0.95, 380))} eyebrow={b.issuedBy} title={view.case.title} tagline={`${b.date} · ${b.location}`} />
      </View>
      <Paper style={{ marginTop: space.md }}>
        <View style={s.head}>
          <PaperText mono dim style={{ flex: 1 }}>{t((view.case.offence ?? view.case.crime) === 'theft' ?'desk.briefing.reporter' : 'desk.briefing.victim')}</PaperText>
          <Stamp label={t('desk.briefing.stamp')} rotate={4} />
        </View>
        <View style={s.victim}>
          <FaceCrop id={b.victim.id} size={64} initials={b.victim.name.split(' ').map((x) => x[0]).join('').slice(0, 2)} ring={color.paperEdge} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <PaperText style={{ fontFamily: font.serifBold, fontSize: 18, lineHeight: 23 }}>{b.victim.name}</PaperText>
            <PaperText dim>{b.victim.role}</PaperText>
          </View>
        </View>
        <PaperText style={{ marginTop: space.md }} selectable>{b.victim.summary}</PaperText>
        <View style={s.rule} />
        {b.incidentReport.map((p, i) => <PaperText key={i} selectable style={{ marginBottom: space.sm }}>{p}</PaperText>)}
        {b.preliminaryFindings.length ? (
          <>
            <View style={s.rule} />
            <PaperText mono dim>{t('desk.briefing.findings')}</PaperText>
            {b.preliminaryFindings.map((p, i) => <PaperText key={i} style={{ marginTop: 4 }}>— {p}</PaperText>)}
          </>
        ) : null}
      </Paper>

      <Section title={t('desk.briefing.clock')}>
        <View style={{ gap: space.md }}>
          {rules.map((r, i) => (
            <View key={i} style={s.ruleRow}>
              <Icon name={r.icon} size={18} tint={color.amber} />
              <T v="bodyDim" style={{ flex: 1 }}>{r.text}</T>
            </View>
          ))}
        </View>
      </Section>

      {b.objectives.length ? (
        <Section title={t('desk.briefing.objectives')}>
          {b.objectives.map((o, i) => (
            <View key={i} style={s.ruleRow}>
              <T v="mono" style={{ color: color.burgundyBright }}>{String(i + 1).padStart(2, '0')}</T>
              <T v="bodyDim" style={{ flex: 1 }}>{o}</T>
            </View>
          ))}
        </Section>
      ) : null}
      <Divider style={{ marginTop: space.xl }} />
      <Eyebrow style={{ textAlign: 'center' }} tint={color.textFaint}>{t('common.fiction')}</Eyebrow>
    </Screen>
  );
}

const s = StyleSheet.create({
  footer: { paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.lg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color.border, backgroundColor: color.bg },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: space.md },
  victim: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.md },
  rule: { height: 1, backgroundColor: color.paperEdge, marginVertical: space.lg },
  ruleRow: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start', marginBottom: space.sm },
});
