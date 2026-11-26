import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming, Easing } from 'react-native-reanimated';
import type { ClockView, Composure, Emotion, SuspectV2View } from '../../../shared/api';
import { Icon } from '../../components/Icon';
import { PortraitPrint } from '../../art/components';
import { nextStage, portraitArt, preload } from '../../art';
import { color, font, radius, space } from '../../theme/tokens';
import { duration, type Say } from './useStrings';

const STAGES: Composure[] = ['composed', 'uneasy', 'strained', 'breaking'];
export const composureTint: Record<Composure, string> = {
  composed: color.greenBright, uneasy: color.amber, strained: color.burgundyBright, breaking: color.stamp,
};

/**
 * The interview's hero (ART_BIBLE §7): the suspect's portrait as a print pinned above the exchange, switching
 * expression with their composure. Name, composure and patience sit on a charcoal band across its foot; the clock
 * and the way out sit in its top corners. Tap the print to fold it to a strip (more room for the transcript).
 */
export function SuspectHeader({ suspect, clock, notebookCount, say, onLeave, reactKey, costFlash, emotion, width, height, compact, onToggle }: {
  suspect: SuspectV2View; clock: ClockView; notebookCount: number; say: Say; onLeave: () => void;
  /** bump to make the portrait react (a break) */
  reactKey: number;
  costFlash: { n: number; key: number } | null;
  emotion?: Emotion;
  width: number;
  height: number;
  compact: boolean;
  onToggle: () => void;
}) {
  const { interview } = suspect;
  const sub = [emotion ? say(`interview.emotion.${emotion}` as never) : null, suspect.occupation].filter(Boolean).join(' · ');
  // warm the next expression so a break lands without a blank frame
  useEffect(() => { preload([portraitArt(suspect.id, suspect.composure), portraitArt(suspect.id, nextStage(suspect.composure))]); }, [suspect.id, suspect.composure]);
  const printW = Math.max(0, width - space.md * 2);
  if (compact) {
    // folded: the face as a small print beside the name, the exchange gets the screen
    return (
      <View style={[s.wrap, s.compact, { height }]}>
        <Pressable onPress={onLeave} hitSlop={8} style={s.chipBtn} accessibilityRole="button" accessibilityLabel={say('interview.leave')} testID="interview-leave">
          <Icon name="back" size={20} tint={color.text} />
        </Pressable>
        <Pressable onPress={onToggle} accessibilityRole="button" accessibilityLabel={say('interview.portrait.open')} style={s.compactBody} testID="interview-portrait">
          <View>
            <PortraitPrint id={suspect.id} stage={suspect.composure} width={52} height={66} reactKey={reactKey} initials={suspect.initials} tone={suspect.portraitTone} anchorY={0.45} style={s.mini} />
            <BreakFlash reactKey={reactKey} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={s.name} numberOfLines={1}>{suspect.name}</Text>
            <View style={[s.bandRow, { marginTop: 4, gap: space.sm }]}>
              <ComposureMeter value={suspect.composure} say={say} />
              <Patience n={interview.patience} max={interview.maxPatience} say={say} bare />
            </View>
            <Text style={s.clockLeft} numberOfLines={1}>
              {clock.timeLabel} · {say('interview.left', { time: duration(say, clock.remainingToday) })}
            </Text>
          </View>
        </Pressable>
        <View style={{ position: 'absolute', right: space.md, top: 6 }}><CostFlash flash={costFlash} say={say} /></View>
      </View>
    );
  }
  return (
    <View style={[s.wrap, { height }]}>
      <Pressable onPress={onToggle} accessibilityRole="button" accessibilityLabel={say(compact ? 'interview.portrait.open' : 'interview.portrait.fold')} style={StyleSheet.absoluteFill} testID="interview-portrait">
        <View style={s.print}>
          <PortraitPrint
            id={suspect.id} stage={suspect.composure} width={printW} height={height - space.sm} reactKey={reactKey}
            initials={suspect.initials} tone={suspect.portraitTone} anchorY={compact ? 0.62 : 0.4}
          />
          <BreakFlash reactKey={reactKey} />
        </View>
      </Pressable>

      <View style={s.topRow} pointerEvents="box-none">
        <Pressable onPress={onLeave} hitSlop={8} style={s.chipBtn} accessibilityRole="button" accessibilityLabel={say('interview.leave')} testID="interview-leave">
          <Icon name="back" size={20} tint={color.text} />
        </Pressable>
        <View style={s.clockChip} pointerEvents="none">
          <Text style={s.clockTime}>{say('interview.day', { d: clock.day, n: clock.days })} · {clock.timeLabel}</Text>
          <Text style={[s.clockLeft, clock.remainingToday < 60 && { color: color.burgundyBright }]} numberOfLines={1}>
            {say('interview.left', { time: duration(say, clock.remainingToday) })}
          </Text>
          <CostFlash flash={costFlash} say={say} />
        </View>
      </View>

      <View style={s.band} pointerEvents="box-none">
        <View style={s.bandRow} pointerEvents="none">
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={s.name} numberOfLines={1}>{suspect.name}</Text>
            {!compact ? <Text style={s.sub} numberOfLines={1}>{sub}</Text> : null}
          </View>
          <NotebookCounter count={notebookCount} say={say} />
        </View>
        <View style={[s.bandRow, { marginTop: compact ? 4 : space.sm }]} pointerEvents="none">
          <ComposureMeter value={suspect.composure} say={say} />
          <Patience n={interview.patience} max={interview.maxPatience} say={say} />
        </View>
      </View>
    </View>
  );
}

/** The burgundy edge that flares on a break (with the print's flinch). */
function BreakFlash({ reactKey }: { reactKey: number }) {
  const glow = useSharedValue(0);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    glow.value = withSequence(withTiming(1, { duration: 120 }), withTiming(0, { duration: 900 }));
  }, [reactKey, glow]);
  const st = useAnimatedStyle(() => ({ opacity: glow.value }));
  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, s.flash, st]} />;
}

function CostFlash({ flash, say }: { flash: { n: number; key: number } | null; say: Say }) {
  const p = useSharedValue(0);
  useEffect(() => {
    if (!flash) return;
    p.value = 0;
    p.value = withTiming(1, { duration: 1100, easing: Easing.out(Easing.quad) });
  }, [flash?.key, flash, p]);
  const st = useAnimatedStyle(() => ({ opacity: p.value === 0 ? 0 : 1 - p.value, transform: [{ translateY: 10 * p.value }] }));
  if (!flash) return null;
  return <Animated.Text style={[s.costFlash, st]}>−{say('interview.minutes', { n: flash.n })}</Animated.Text>;
}

function ComposureMeter({ value, say }: { value: Composure; say: Say }) {
  const idx = STAGES.indexOf(value);
  const filled = 4 - idx; // composed = 4 bars, breaking = 1
  const pulse = useSharedValue(1);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current !== value) {
      pulse.value = withSequence(withTiming(1.12, { duration: 140 }), withSpring(1, { damping: 8 }));
      prev.current = value;
    }
  }, [value, pulse]);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  const tint = composureTint[value];
  return (
    <View style={{ flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: space.sm }} accessibilityLabel={`${say('interview.composure')}: ${say(`interview.composure.${value}` as never)}`}>
      <Animated.View style={[{ flexDirection: 'row', gap: 3 }, st]}>
        {STAGES.map((_, i) => (
          <View key={i} style={[s.bar, { backgroundColor: i < filled ? tint : 'rgba(232,229,222,0.16)' }]} />
        ))}
      </Animated.View>
      <Text style={[s.meterValue, { color: tint }]} numberOfLines={1}>{say(`interview.composure.${value}` as never)}</Text>
    </View>
  );
}

function Patience({ n, max, say, bare }: { n: number; max: number; say: Say; bare?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }} accessibilityLabel={say('interview.patienceA11y', { n, max })}>
      {bare ? null : <Text style={s.meterLabel}>{say('interview.patience')}</Text>}
      <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
        {Array.from({ length: max }, (_, i) => <Pip key={i} on={i < n} />)}
      </View>
    </View>
  );
}

function Pip({ on }: { on: boolean }) {
  const sc = useSharedValue(1);
  const prev = useRef(on);
  useEffect(() => {
    if (prev.current && !on) sc.value = withSequence(withTiming(1.9, { duration: 120 }), withTiming(1, { duration: 260 }));
    prev.current = on;
  }, [on, sc]);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: sc.value }] }));
  return <Animated.View style={[s.pip, on ? s.pipOn : s.pipOff, st]} />;
}

function NotebookCounter({ count, say }: { count: number; say: Say }) {
  const sc = useSharedValue(1);
  const prev = useRef(count);
  useEffect(() => {
    if (count > prev.current) sc.value = withSequence(withTiming(1, { duration: 520 }), withTiming(1.3, { duration: 120 }), withSpring(1, { damping: 7 }));
    prev.current = count;
  }, [count, sc]);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: sc.value }] }));
  return (
    <Animated.View style={[s.nb, st]} accessibilityLabel={`${say('interview.notebook')}: ${count}`}>
      <Icon name="note" size={15} tint={color.amber} />
      <Text style={s.nbText}>{count}</Text>
    </Animated.View>
  );
}

const BAND = 'rgba(14,15,16,0.86)';
const s = StyleSheet.create({
  wrap: { backgroundColor: color.bg, overflow: 'hidden' },
  compact: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: color.border },
  compactBody: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 66 },
  mini: { borderRadius: radius.sm, borderWidth: StyleSheet.hairlineWidth, borderColor: color.paperEdge },
  print: {
    position: 'absolute', left: space.md, right: space.md, top: space.sm, bottom: 0, borderRadius: radius.sm, overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth, borderColor: color.paperEdge,
  },
  flash: { borderWidth: 2, borderColor: color.burgundyBright, borderRadius: radius.sm },
  topRow: { position: 'absolute', left: space.md + 8, right: space.md + 8, top: space.sm + 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  chipBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: BAND, alignItems: 'center', justifyContent: 'center' },
  clockChip: { backgroundColor: BAND, borderRadius: radius.md, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'flex-end' },
  clockTime: { fontFamily: font.monoMedium, fontSize: 12, color: color.text, letterSpacing: 0.4 },
  clockLeft: { fontFamily: font.mono, fontSize: 11, color: color.textDim, marginTop: 1 },
  costFlash: { position: 'absolute', right: 10, bottom: -18, fontFamily: font.monoMedium, fontSize: 12, color: color.amber },
  band: {
    position: 'absolute', left: space.md, right: space.md, bottom: 0, backgroundColor: BAND, paddingHorizontal: space.md,
    paddingTop: space.sm, paddingBottom: space.sm + 2, borderBottomLeftRadius: radius.sm, borderBottomRightRadius: radius.sm,
  },
  bandRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  name: { fontFamily: font.serif, fontSize: 21, lineHeight: 25, color: color.text },
  sub: { fontFamily: font.sans, fontSize: 12, lineHeight: 16, color: color.textDim },
  meterLabel: { fontFamily: font.mono, fontSize: 9.5, letterSpacing: 1.2, color: color.textFaint, textTransform: 'uppercase' },
  meterValue: { fontFamily: font.sansMedium, fontSize: 12.5 },
  bar: { width: 16, height: 5, borderRadius: 1 },
  pip: { width: 9, height: 9, borderRadius: 5 },
  pipOn: { backgroundColor: color.text },
  pipOff: { borderWidth: 1, borderColor: 'rgba(232,229,222,0.35)', backgroundColor: 'transparent' },
  nb: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: 'rgba(232,229,222,0.2)', borderRadius: radius.md, paddingHorizontal: 8, height: 28 },
  nbText: { fontFamily: font.monoMedium, fontSize: 13, color: color.text },
});
