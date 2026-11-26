// The strip that sits above every desk tab: day, wall clock, time left today, lab queue, and the way to the
// prosecutor. Tapping the clock opens the day's ledger (costs + end the day).
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming, FadeOutUp, FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { InvestigationView } from '../../../shared/api';
import { Icon } from '../../components/Icon';
import { tap } from '../../components/ui';
import { fmtMinutes, useT } from '../../i18n';
import { useFeelCue } from '../../feel';
import { useDesk } from '../../state/desk';
import { color, font, radius, space } from '../../theme/tokens';

/** Lab countdown in the strip: "3:30" (hours:minutes). */
const countdown = (m: number) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;

export function TopStrip({ view }: { view: InvestigationView }) {
  const t = useT();
  const inset = useSafeAreaInsets();
  const { clock, lab, phase } = view;
  const base = `/desk/${view.sessionId}`;
  const scale = useSharedValue(1);
  const [spent, setSpent] = useState<{ cost: number; seq: number } | null>(null);

  useFeelCue('tick', (cue) => {
    scale.value = withSequence(withTiming(1.14, { duration: 140 }), withTiming(1, { duration: 260 }));
    setSpent({ cost: cue.event?.cost ?? 0, seq: cue.seq });
    setTimeout(() => setSpent((s) => (s?.seq === cue.seq ? null : s)), 1400);
  });
  const timeStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  // the next result to come in (server: lab.nextReady), possibly after tonight
  const nextLab = lab.nextReady;
  const frac = clock.minutesPerDay ? clock.remainingToday / clock.minutesPerDay : 0;
  const waiting = phase === 'awaiting_finale';
  const dayOver = clock.dayOver && phase === 'investigating';
  // co-op (wave 5): only the lead ends the day; everyone else says they are done and the day closes by itself
  const me = view.team?.members.find((m) => m.isYou);
  const follower = view.mode === 'coop' && !view.room?.isHost && !!me;
  const act = useDesk((st) => st.act);
  const [busy, setBusy] = useState(false);
  const overLabel = follower ? (me!.done ? t('coop.team.done') : t('coop.team.doneBtn')) : t('desk.strip.endDay');
  const onClock = async () => {
    tap();
    if (dayOver && follower && !me!.done && !busy) {
      setBusy(true);
      try { await act('done', { done: true }); } finally { setBusy(false); }
      return;
    }
    router.push(`${base}/day-end`);
  };

  return (
    <View style={[s.wrap, { paddingTop: inset.top + 6 }]}>
      <View style={s.row}>
        <Pressable
          onPress={onClock}
          style={({ pressed }) => [s.clock, dayOver && s.clockOver, { opacity: pressed ? 0.75 : 1 }]}
          accessibilityRole="button"
          accessibilityLabel={t('desk.strip.a11yClock', { d: clock.day, n: clock.days, time: clock.timeLabel, left: fmtMinutes(t, clock.remainingToday) })}
          testID="strip-clock"
        >
          <View>
            <Text style={s.day}>{t('desk.strip.day', { d: clock.day, n: clock.days })}</Text>
            <Animated.Text style={[s.time, timeStyle]}>{clock.timeLabel}</Animated.Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={s.bar}><View style={[s.barFill, { width: `${Math.max(0, Math.min(1, frac)) * 100}%` }, frac < 0.2 && { backgroundColor: color.burgundyBright }]} /></View>
            <Text style={[s.left, dayOver && { color: color.text }]} numberOfLines={1}>
              {waiting ? t('desk.strip.investigationOver') : dayOver ? overLabel : t('desk.strip.leftShort', { time: fmtMinutes(t, clock.remainingToday) })}
            </Text>
          </View>
          {spent && spent.cost > 0 ? (
            <Animated.Text key={spent.seq} entering={FadeIn.duration(120)} exiting={FadeOutUp.duration(400)} style={s.spent}>
              {t('desk.strip.spent', { time: fmtMinutes(t, spent.cost) })}
            </Animated.Text>
          ) : null}
        </Pressable>

        <Pressable
          onPress={() => { tap(); router.navigate(`${base}?focus=lab&at=${Date.now()}`); }}
          style={({ pressed }) => [s.lab, lab.ready > 0 && s.labReady, { opacity: pressed ? 0.75 : 1 }]}
          accessibilityRole="button"
          accessibilityLabel={t('desk.strip.a11yLab', { running: lab.running, slots: lab.slots, ready: lab.ready })}
          testID="strip-lab"
        >
          <Icon name="lab" size={16} tint={lab.ready > 0 ? color.amber : lab.running ? color.text : color.textFaint} />
          <Text style={[s.labText, lab.ready > 0 && { color: color.amber }]} numberOfLines={1}>
            {lab.ready > 0 ? t('desk.strip.labReady', { n: lab.ready })
              : nextLab ? countdown(nextLab.minutesLeft)
              : `${lab.running}/${lab.slots}`}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => { tap(); router.push(`${base}/finale`); }}
          style={({ pressed }) => [s.gavel, waiting && s.gavelHot, { opacity: pressed ? 0.75 : 1 }]}
          accessibilityRole="button"
          accessibilityLabel={t('desk.strip.a11yFinale')}
          testID="strip-finale"
        >
          <Icon name="gavel" size={18} tint={waiting ? color.text : color.textDim} />
        </Pressable>
      </View>
      <StarLine view={view} />
    </View>
  );
}

/** The Clock star made legible (PLAYTEST_V2 §7.10): the latest moment to reach the prosecutor and still earn it. */
function StarLine({ view }: { view: InvestigationView }) {
  const t = useT();
  const star = view.clock.clockStar;
  if (!star || view.phase === 'closed') return null;
  const today = star.by.day === view.clock.day;
  // co-op: the star is counted in work time (each investigator's budget), not on the wall clock
  const open = star.work !== undefined
    ? t(today ? 'desk.strip.starWorkToday' : 'desk.strip.starWork', { d: star.by.day, time: fmtMinutes(t, star.work) })
    : t('desk.strip.star', { when: today ? t('desk.strip.starToday', { time: star.by.label }) : t('desk.strip.starDay', { d: star.by.day, time: star.by.label }) });
  const text = star.state === 'won' ? t('desk.strip.starWon') : star.state === 'lost' ? t('desk.strip.starLost') : open;
  return (
    <Text style={[s.star, star.state === 'lost' && { color: color.textFaint }]} numberOfLines={1} testID="strip-star">{text}</Text>
  );
}

const s = StyleSheet.create({
  wrap: { backgroundColor: color.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: color.border, paddingHorizontal: space.md, paddingBottom: space.sm },
  row: { flexDirection: 'row', alignItems: 'stretch', gap: space.sm, maxWidth: 760, width: '100%', alignSelf: 'center' },
  clock: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.md, paddingVertical: 6,
    borderWidth: 1, borderColor: color.borderSoft, borderRadius: radius.md, backgroundColor: color.surface, minWidth: 0,
  },
  clockOver: { borderColor: color.burgundyBright, backgroundColor: color.burgundyDeep },
  day: { fontFamily: font.mono, fontSize: 10, letterSpacing: 1.2, color: color.textFaint, textTransform: 'uppercase' },
  time: { fontFamily: font.monoMedium, fontSize: 18, color: color.text, letterSpacing: 0.5 },
  bar: { height: 3, backgroundColor: color.border, borderRadius: 2, overflow: 'hidden' },
  barFill: { height: 3, backgroundColor: color.greenBright },
  left: { fontFamily: font.sans, fontSize: 12, color: color.textDim, marginTop: 5 },
  spent: { position: 'absolute', right: 8, top: 4, fontFamily: font.monoMedium, fontSize: 11, color: color.amber },
  lab: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: space.sm, borderWidth: 1, borderColor: color.borderSoft,
    borderRadius: radius.md, backgroundColor: color.surface, minWidth: 64, justifyContent: 'center',
  },
  labReady: { borderColor: color.amber },
  labText: { fontFamily: font.monoMedium, fontSize: 12, color: color.textDim },
  gavel: { width: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: color.borderSoft, borderRadius: radius.md, backgroundColor: color.surface },
  gavelHot: { backgroundColor: color.burgundy, borderColor: color.burgundyBright },
  star: { fontFamily: font.mono, fontSize: 10.5, letterSpacing: 0.4, color: color.amber, marginTop: 5, maxWidth: 760, width: '100%', alignSelf: 'center' },
});
