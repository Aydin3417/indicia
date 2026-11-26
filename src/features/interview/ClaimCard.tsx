import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing, FadeInDown, LinearTransition, useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import type { ClaimView } from '../../../shared/api';
import { Stamp } from '../../components/ui';
import { color, font, radius, space } from '../../theme/tokens';
import { Clamp } from './Clamp';
import type { Say } from './useStrings';

export type CardFx = { kind: 'crack' | 'shake' | 'nudge'; key: number };

export function ClaimCard({ claim, selected, onPress, fx, isNew, say }: {
  claim: ClaimView; selected: boolean; onPress: () => void; fx?: CardFx; isNew: boolean; say: Say;
}) {
  const broken = claim.status === 'broken';
  const x = useSharedValue(0);
  const crack = useSharedValue(broken ? 1 : 0);
  const stamp = useSharedValue(broken ? 1 : 0);
  const lift = useSharedValue(1);

  useEffect(() => {
    if (!fx) return;
    if (fx.kind === 'shake') {
      x.value = withSequence(
        withTiming(-9, { duration: 45 }), withTiming(9, { duration: 80 }), withTiming(-7, { duration: 75 }),
        withTiming(5, { duration: 70 }), withTiming(0, { duration: 60 }),
      );
    } else if (fx.kind === 'nudge') {
      x.value = withSequence(withTiming(-4, { duration: 60 }), withTiming(0, { duration: 120 }));
    } else {
      crack.value = 0;
      stamp.value = 0;
      lift.value = withSequence(withTiming(1.035, { duration: 90 }), withSpring(1, { damping: 9 }));
      crack.value = withTiming(1, { duration: 380, easing: Easing.out(Easing.cubic) });
      stamp.value = withDelay(260, withSpring(1, { damping: 11, stiffness: 180 }));
    }
  }, [fx?.key]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (broken && !fx) { crack.value = 1; stamp.value = 1; }
  }, [broken]); // eslint-disable-line react-hooks/exhaustive-deps

  const cardSt = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }, { scale: lift.value }] }));
  const crackSt = useAnimatedStyle(() => ({ opacity: crack.value }));
  const stampSt = useAnimatedStyle(() => ({
    opacity: stamp.value,
    transform: [{ scale: 1.8 - 0.8 * stamp.value }, { rotate: '-7deg' }],
  }));

  return (
    <Animated.View entering={isNew ? FadeInDown.duration(320).springify().damping(16) : undefined} layout={LinearTransition.duration(220)}>
      <Animated.View style={cardSt}>
      <Pressable
        onPress={onPress}
        disabled={claim.status !== 'active'}
        accessibilityRole="button"
        accessibilityState={{ selected, disabled: claim.status !== 'active' }}
        style={({ pressed }) => [
          s.card,
          selected && s.selected,
          broken && s.broken,
          pressed && claim.status === 'active' && { opacity: 0.85 },
        ]}
      >
        <View style={s.quoteMark}><Text style={s.quoteGlyph}>“</Text></View>
        <View style={{ flex: 1 }}>
          <Clamp
            text={claim.text}
            style={[s.text, broken && { color: color.textFaint }]}
            fontSize={16}
            more={say('interview.more')}
            less={say('interview.less')}
          />
          <View style={s.meta}>
            {isNew && !broken ? <Text style={[s.metaText, { color: color.amber }]}>{say('interview.claim.new')}</Text> : null}
            {claim.pressed && !broken ? <Text style={s.metaText}>{say('interview.claim.pressed')}</Text> : null}
          </View>
        </View>
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, crackSt]}>
          <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <Path d="M58 0 L54 22 L61 35 L49 52 L56 66 L47 100" stroke={color.burgundyBright} strokeWidth={0.9} fill="none" />
            <Path d="M54 22 L40 28 M49 52 L66 58 L74 54 M56 66 L38 78" stroke={color.burgundyBright} strokeWidth={0.6} fill="none" opacity={0.8} />
          </Svg>
        </Animated.View>
        {broken || fx?.kind === 'crack' ? (
          <Animated.View pointerEvents="none" style={[s.stampWrap, stampSt]}>
            <Stamp label={say('interview.claim.broken').toUpperCase()} rotate={0} />
          </Animated.View>
        ) : null}
      </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row', gap: space.sm, backgroundColor: color.surface, borderWidth: 1, borderColor: color.borderSoft,
    borderRadius: radius.md, paddingVertical: space.md, paddingRight: space.md, paddingLeft: space.sm, overflow: 'hidden', minHeight: 52,
  },
  selected: { borderColor: color.amber, backgroundColor: color.elevated },
  broken: { backgroundColor: color.burgundyDeep, borderColor: color.burgundy },
  quoteMark: { width: 18, alignItems: 'center' },
  quoteGlyph: { fontFamily: font.serif, fontSize: 28, lineHeight: 30, color: color.textFaint },
  text: { fontFamily: font.serif, fontSize: 16, lineHeight: 22, color: color.text },
  meta: { flexDirection: 'row', gap: space.md, marginTop: 4 },
  metaText: { fontFamily: font.mono, fontSize: 10, letterSpacing: 1.1, color: color.textFaint, textTransform: 'uppercase' },
  stampWrap: { position: 'absolute', right: space.md, bottom: space.sm },
});
