import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { altOf, caseArtKey, itemArt, nightArt, preload, reportArt } from '../../../src/art';
import { ForkCard, NightPlate } from '../../../src/features/night';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Button, Eyebrow, Paper, PaperText, Screen, Section, Stamp, T, TopBar } from '../../../src/components/ui';
import { Icon } from '../../../src/components/Icon';
import { ToastGuard } from '../../../src/components/Toasts';
import { useDesk } from '../../../src/state/desk';
import { fmtMinutes, useT } from '../../../src/i18n';
import { fmtGameTime } from '../../../src/features/desk/format';
import { color, font, space } from '../../../src/theme/tokens';

const MAX_FACTS = 6;

/** Daily report: what the day turned up, what is still cooking in the lab, and the night's event (PLAN §3.1). */
export default function DayReport() {
  const t = useT();
  const { sessionId, day, fresh } = useLocalSearchParams<{ sessionId: string; day?: string; fresh?: string }>();
  const view = useDesk((s) => s.view)!;
  const report = view.reports.find((r) => String(r.day) === day) ?? view.reports[view.reports.length - 1];
  const isFresh = fresh === '1';
  const waiting = view.phase === 'awaiting_finale';
  const base = `/desk/${sessionId}`;
  const caseKey = caseArtKey(view.case.id, view.scenes.map((sc) => sc.art));
  const dayArt = report ? reportArt(caseKey, report.day) : undefined;
  // the pawn night reads differently once the apprentice is already explained (any day up to this one)
  const leoExplained = !!report && view.reports.some((r) => r.day <= report.day && r.deductionsConfirmed.some((d) => d.id === 'd-leo'));
  const nightPic = report ? nightArt(caseKey, report.day, report.night as (typeof report.night & { id?: string }) | undefined, leoExplained) : undefined;
  // the fork: the live one while it waits (it may be newer than the report), else the settled one from history
  const fork = report?.fork ? (view.fork && view.fork.id === report.fork.id ? view.fork : report.fork) : undefined;
  useEffect(() => { preload([nightPic]); }, [nightPic]);

  const next = () => {
    if (!isFresh) { if (router.canGoBack()) router.back(); else router.replace(base); return; }
    if (view.phase !== 'investigating') router.replace(`${base}/finale`);
    else router.dismissTo(base); // back to the desk tabs already in the stack, not a second copy
  };

  if (!report) {
    return (
      <Screen>
        <TopBar title={t('desk.report.title', { d: day ?? '' })} />
        <T v="bodyDim">{t('desk.report.none')}</T>
      </Screen>
    );
  }

  const extraFacts = Math.max(0, report.facts.length - MAX_FACTS);

  return (
    <Screen texture="desk" footer={
      // the report's top (the night, the fork card) is what the player is reading: toasts go above this footer
      <ToastGuard edge="bottom" style={s.footer}>
        <Button
          label={!isFresh ? t('common.back') : waiting || view.phase !== 'investigating' ? t('desk.report.toProsecutor') : t('desk.report.nextMorning', { d: view.clock.day })}
          icon={isFresh && waiting ? 'gavel' : undefined}
          onPress={next}
        />
      </ToastGuard>
    }>
      <TopBar onBack={isFresh ? false : undefined} eyebrow={view.case.caseNumber} title={t('desk.report.title', { d: report.day })} />
      <NightPlate art={dayArt} alt={altOf(dayArt, view.locale)} maxHeight={230} style={{ marginBottom: space.lg }} />

      <Animated.View entering={FadeInDown.duration(320)}>
        <View style={s.statRow}>
          <Stat n={report.facts.length} label={t('desk.report.statFacts')} />
          <Stat n={report.evidence.length} label={t('desk.report.statEvidence')} />
          <Stat n={report.deductionsConfirmed.length} label={t('desk.report.statConfirmed')} />
        </View>
        <T v="small" style={{ marginTop: space.sm }}>
          {report.unusedMinutes > 0 ? t('desk.report.unused', { time: fmtMinutes(t, report.unusedMinutes) }) : t('desk.report.fullDay')}
        </T>
      </Animated.View>

      {report.facts.length ? (
        <Section title={t('desk.report.found')}>
          {report.facts.slice(0, MAX_FACTS).map((f) => (
            <View key={f.id} style={s.fact}><View style={s.bullet} /><T v="body" style={{ flex: 1 }}>{f.text}</T></View>
          ))}
          {extraFacts ? <T v="small" style={{ marginTop: 4 }}>{t('desk.report.more', { n: extraFacts })}</T> : null}
        </Section>
      ) : null}

      {report.evidence.length ? (
        <Section title={t('desk.report.evidence')}>
          {report.evidence.map((e) => (
            <View key={e.id} style={s.ev}>
              {itemArt(e.id, view.notebook.evidence.find((x) => x.id === e.id)?.kind) ? <Image source={itemArt(e.id, view.notebook.evidence.find((x) => x.id === e.id)?.kind)!.art.src} style={s.evThumb} /> : <View style={[s.evThumb, s.evEmpty]}><Icon name="evidence" size={16} tint={color.textFaint} /></View>}
              <T v="body" style={{ flex: 1 }}>{e.name}</T>
            </View>
          ))}
        </Section>
      ) : null}

      {report.deductionsConfirmed.length || report.deductionsOpened.length ? (
        <Section title={t('desk.report.questions')}>
          {report.deductionsConfirmed.map((d) => (
            <View key={d.id} style={s.fact}><Icon name="check" size={16} tint={color.greenBright} /><T v="body" style={{ flex: 1 }}>{d.title}</T></View>
          ))}
          {report.deductionsOpened.map((d) => (
            <View key={d.id} style={s.fact}><Icon name="deduce" size={16} tint={color.amber} /><T v="body" style={{ flex: 1 }}>{t('desk.report.opened', { title: d.title })}</T></View>
          ))}
        </Section>
      ) : null}

      {report.labsReady.length || report.labsRunning.length ? (
        <Section title={t('desk.report.lab')}>
          {report.labsReady.map((l) => (
            <View key={l.analysisId} style={s.fact}><Icon name="lab" size={16} tint={color.amber} /><T v="body" style={{ flex: 1 }}>{t('desk.report.labReady', { name: l.name })}</T></View>
          ))}
          {report.labsRunning.map((l) => (
            <View key={l.analysisId} style={s.fact}><Icon name="clock" size={16} tint={color.textDim} /><T v="bodyDim" style={{ flex: 1 }}>{t('desk.report.labRunning', { name: l.name, at: fmtGameTime(t, l.readyAt) })}</T></View>
          ))}
        </Section>
      ) : null}

      {report.night ? (
        <Animated.View entering={FadeInDown.delay(250).duration(400)}>
          <Section title={t('desk.report.night')}>
            <NightPlate art={nightPic} alt={altOf(nightPic, view.locale)} maxHeight={220} style={{ marginBottom: space.md }} />
            <Paper>
              <View style={s.nightHead}>
                <Icon name="moon" size={18} tint={color.inkDim} />
                <Stamp label={t('desk.report.nightStamp')} rotate={-3} />
              </View>
              <PaperText style={{ fontFamily: font.serif, fontSize: 21, lineHeight: 26, marginTop: space.md }}>{report.night.title}</PaperText>
              <PaperText style={{ marginTop: space.sm }}>{report.night.text}</PaperText>
              {report.night.newFacts.length || report.night.newEvidence.length ? (
                <PaperText mono dim style={{ marginTop: space.md }}>
                  {t('desk.report.nightAdds', { facts: report.night.newFacts.length, evidence: report.night.newEvidence.length })}
                </PaperText>
              ) : null}
            </Paper>
          </Section>
        </Animated.View>
      ) : null}

      {fork ? (
        <Animated.View entering={FadeInDown.delay(350).duration(400)}>
          <Section title={t('night.fork.eyebrow')}>
            <ForkCard fork={fork} view={view} art={report.night ? undefined : nightPic} />
          </Section>
        </Animated.View>
      ) : null}

      {isFresh && waiting ? (
        <Section title={t('desk.report.lastDay')}>
          <T v="body">{t('desk.report.lastDayText')}</T>
        </Section>
      ) : null}
    </Screen>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <View style={s.stat}>
      <T v="title">{String(n)}</T>
      <Eyebrow style={{ marginTop: 2 }}>{label}</Eyebrow>
    </View>
  );
}

const s = StyleSheet.create({
  footer: { paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.lg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color.border, backgroundColor: color.bg },
  statRow: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: color.border },
  stat: { flex: 1, paddingVertical: space.md },
  fact: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start', marginBottom: space.sm },
  bullet: { width: 5, height: 5, borderRadius: 3, backgroundColor: color.greenBright, marginTop: 8 },
  ev: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.sm },
  evThumb: { width: 40, height: 40, borderRadius: 2, backgroundColor: color.paper },
  evEmpty: { backgroundColor: 'transparent', borderWidth: 1, borderColor: color.border, alignItems: 'center', justifyContent: 'center' },
  nightHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
