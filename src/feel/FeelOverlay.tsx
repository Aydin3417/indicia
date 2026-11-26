// Full-screen moments the shell owns: the day turning (the clock runs on to the next morning), and the case's
// room tone (wave 4).
// Claim cracks and deduction stamps are drawn by the feature screens themselves.
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withDelay, withTiming, Easing } from 'react-native-reanimated';
import { usePathname } from 'expo-router';
import { useFeelCue } from './index';
import { playSound, roomForPath, sound } from '../sound';
import { useT } from '../i18n';
import { color, font, space } from '../theme/tokens';

/** The case's sound host: the room tone follows the route (scene location, interview, finale), the daily report
 * opens with a page turn, and everything stops when the case screens unmount. */
function useCaseSound() {
  const path = usePathname();
  useEffect(() => { sound.start(); return () => sound.setRoom(null); }, []);
  useEffect(() => {
    sound.setRoom(roomForPath(path));
    if (/\/desk\/[^/]+\/report(?:$|[/?#])/.test(path)) playSound('page');
  }, [path]);
}

export function FeelOverlay() {
  useCaseSound();
  const t = useT();
  const [day, setDay] = useState<{ from: number; to: number; last: boolean; seq: number } | null>(null);

  useFeelCue('day', (cue) => {
    const report = cue.event?.report;
    const from = report?.day ?? 0;
    setDay({ from, to: from + 1, last: cue.event?.outcome === 'last_day', seq: cue.seq });
  });

  useEffect(() => {
    if (!day) return;
    const id = setTimeout(() => setDay(null), 1900);
    return () => clearTimeout(id);
  }, [day]);

  if (!day) return null;
  return (
    <Animated.View key={day.seq} entering={FadeIn.duration(250)} exiting={FadeOut.duration(450)} style={s.veil} pointerEvents="none" testID="feel-day">
      <DialHand />
      <Text style={s.eyebrow}>{t('feel.day.end', { d: day.from })}</Text>
      <Text style={s.title}>{day.last ? t('feel.day.last') : t('feel.day.next', { d: day.to })}</Text>
    </Animated.View>
  );
}

/** A clock hand sweeping a full turn: the night passing. */
function DialHand() {
  const turn = useSharedValue(0);
  useEffect(() => { turn.value = withDelay(150, withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.cubic) })); }, [turn]);
  const hand = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.value * 360}deg` }] }));
  return (
    <View style={s.dial}>
      <Animated.View style={[s.handWrap, hand]}><View style={s.hand} /></Animated.View>
      <View style={s.hub} />
    </View>
  );
}

const s = StyleSheet.create({
  veil: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(8,9,10,0.92)', alignItems: 'center', justifyContent: 'center', zIndex: 40, gap: space.md },
  eyebrow: { fontFamily: font.mono, fontSize: 11, letterSpacing: 1.6, color: color.textFaint, textTransform: 'uppercase', marginTop: space.lg },
  title: { fontFamily: font.serif, fontSize: 30, color: color.text },
  dial: { width: 84, height: 84, borderRadius: 42, borderWidth: 1, borderColor: color.border, alignItems: 'center', justifyContent: 'center' },
  handWrap: { position: 'absolute', width: 84, height: 84, alignItems: 'center' },
  hand: { width: 2, height: 34, marginTop: 8, backgroundColor: color.amber, borderRadius: 1 },
  hub: { width: 6, height: 6, borderRadius: 3, backgroundColor: color.amber },
});
