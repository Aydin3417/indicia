import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { caseArtKey, preload, reportArt } from '../../../src/art';
import { router, useLocalSearchParams } from 'expo-router';
import type { CostTableView } from '../../../shared/api';
import { Button, Card, Eyebrow, Paper, PaperText, Screen, Section, T, TopBar } from '../../../src/components/ui';
import { useDesk } from '../../../src/state/desk';
import { fmtCost, fmtMinutes, useT } from '../../../src/i18n';
import { useAction } from '../../../src/features/desk/useAction';
import { fmtGameTime } from '../../../src/features/desk/format';
import { WaitCard } from '../../../src/features/desk/WaitCard';
import { color, font, space } from '../../../src/theme/tokens';

const COST_ROWS: (keyof CostTableView)[] = ['travel', 'closeUp', 'tool', 'startInterview', 'openTopic', 'press', 'present', 'freeQuestion', 'wrongDeduction', 'hint'];

/** The day's ledger: what is left, what things cost, and ending the day (CONTRACT_V2 §2). */
export default function DayEnd() {
  const t = useT();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const view = useDesk((s) => s.view)!;
  const { run, pending } = useAction();
  const { clock, lab } = view;
  const investigating = view.phase === 'investigating';
  const lead = view.mode !== 'coop' || !!view.room?.isHost;
  const me = view.team?.members.find((m) => m.isYou);
  const running = lab.jobs.filter((j) => j.status === 'running');
  const openInterviews = view.suspects.filter((s) => s.interview.open);
  // warm tonight's report illustration while the player reads the ledger (one image, fetched not decoded)
  const tonight = reportArt(caseArtKey(view.case.id, view.scenes.map((sc) => sc.art)), clock.day);
  useEffect(() => { preload([tonight]); }, [tonight]);

  const endDay = async () => {
    const r = await run('end', 'end-day');
    if (!r) return;
    const day = r.event.report?.day ?? clock.day;
    router.replace(`/desk/${sessionId}/report?day=${day}&fresh=1`);
  };

  return (
    <Screen>
      <TopBar eyebrow={t('desk.strip.day', { d: clock.day, n: clock.days })} title={t('desk.dayEnd.title')} />

      <View style={s.big}>
        <T v="display" style={{ fontFamily: font.monoMedium, fontSize: 44, lineHeight: 50, letterSpacing: 1 }}>{clock.timeLabel}</T>
        <View style={s.dayBar}>
          <View style={[s.dayFill, { width: `${Math.max(0, Math.min(1, 1 - clock.remainingToday / (clock.minutesPerDay || 1))) * 100}%` }]} />
        </View>
        <View style={s.dayEnds}>
          <T v="small">{clock.dayStart}</T>
          <T v="small">{clock.dayEnd}</T>
        </View>
        <T v="body" style={{ marginTop: space.sm, color: clock.dayOver ? color.burgundyBright : color.text }}>
          {clock.dayOver ? t('desk.dayEnd.over') : t('desk.strip.left', { time: fmtMinutes(t, clock.remainingToday) })}
        </T>
      </View>

      <WaitCard view={view} />

      {investigating ? (
        <Card accent={clock.lastDay ? color.burgundyBright : color.border}>
          <T v="heading">{clock.lastDay ? t('desk.dayEnd.lastTitle') : t('desk.dayEnd.confirmTitle', { d: clock.day })}</T>
          <T v="bodyDim" style={{ marginTop: space.sm }}>
            {clock.remainingToday > 0 ? t('desk.dayEnd.forfeit', { time: fmtMinutes(t, clock.remainingToday) }) : t('desk.dayEnd.nothingLost')}
          </T>
          {openInterviews.length ? <T v="bodyDim" style={{ marginTop: 4 }}>{t('desk.dayEnd.interviewsClose', { names: openInterviews.map((x) => x.name).join(', ') })}</T> : null}
          {running.length ? (
            <View style={{ marginTop: space.sm, gap: 2 }}>
              <T v="bodyDim">{t('desk.dayEnd.labsOvernight')}</T>
              {running.map((j) => <T key={j.analysisId} v="small">· {j.name} — {fmtGameTime(t, j.readyAt, clock.day)}</T>)}
            </View>
          ) : null}
          {clock.lastDay ? <T v="body" style={{ marginTop: space.sm, color: color.burgundyBright }}>{t('desk.dayEnd.lastWarning')}</T> : null}
          {lead ? (
            <Button
              label={clock.lastDay ? t('desk.dayEnd.endLast') : t('desk.dayEnd.end', { d: clock.day })}
              kind={clock.dayOver ? 'primary' : 'danger'}
              icon="moon"
              busy={pending === 'end'}
              onPress={endDay}
              style={{ marginTop: space.lg }}
            />
          ) : (
            <>
              <T v="small" style={{ marginTop: space.lg, color: color.amber }}>{me?.done ? t('coop.team.done') : t('desk.dayEnd.leadOnly')}</T>
              {me ? (
                <Button
                  label={me.done ? t('coop.team.resume') : t('coop.team.doneBtn')}
                  kind={me.done ? 'secondary' : 'primary'}
                  icon="moon"
                  busy={pending === 'done'}
                  disabled={me.done && (me.remaining <= 0 || clock.dayOver)}
                  onPress={async () => { const r = await run('done', 'done', { done: !me.done }); if (r && !me.done) router.back(); }}
                  style={{ marginTop: space.sm }}
                />
              ) : null}
            </>
          )}
          <Button label={t('desk.dayEnd.keep')} kind="ghost" onPress={() => router.back()} style={{ marginTop: space.sm }} />
        </Card>
      ) : (
        <Card><T v="bodyDim">{t('desk.dayEnd.closed')}</T></Card>
      )}

      <Section title={t('desk.costs.title')}>
        {/* the price list, typed on a sheet: what every move costs on the clock */}
        <Paper style={{ paddingVertical: space.md, paddingHorizontal: space.lg }}>
          {COST_ROWS.map((k) => (
            <View key={k} style={s.costRow}>
              <PaperText style={{ flex: 1 }}>{t(`desk.costs.${k}`)}</PaperText>
              <PaperText mono style={s.cost}>{fmtCost(t, clock.costs[k])}</PaperText>
            </View>
          ))}
          <View style={s.costRow}>
            <PaperText style={{ flex: 1 }}>{t('desk.costs.lab')}</PaperText>
            <PaperText mono style={s.cost}>{t('desk.costs.labValue')}</PaperText>
          </View>
          <View style={[s.costRow, { borderBottomWidth: 0 }]}>
            <PaperText style={{ flex: 1 }}>{t('desk.costs.wait')}</PaperText>
            <PaperText mono style={s.cost}>{t('desk.costs.waitValue')}</PaperText>
          </View>
        </Paper>
        <T v="small" style={{ marginTop: space.md }}>{t('desk.costs.note')}</T>
      </Section>

      <Section title={t('desk.budget.title')}>
        <Eyebrow>{t('desk.budget.line', { spent: fmtMinutes(t, clock.spent), total: fmtMinutes(t, clock.totalBudget) })}</Eyebrow>
      </Section>
    </Screen>
  );
}

const s = StyleSheet.create({
  big: { alignItems: 'stretch', marginBottom: space.lg },
  dayBar: { height: 4, backgroundColor: color.border, borderRadius: 2, marginTop: space.md, overflow: 'hidden' },
  dayFill: { height: 4, backgroundColor: color.amber },
  dayEnds: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  costRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: color.paperEdge },
  cost: { fontFamily: font.monoMedium, color: color.stamp },
});
