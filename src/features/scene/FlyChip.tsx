import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { color, font } from '../../theme/tokens';

export interface Flight {
  key: number;
  kind: 'fact' | 'evidence';
  label: string;
  text: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  delay: number;
}

/** A found fact/evidence chip: pops where it was found, holds a beat, then flies into the notebook. */
export function FlyChip({ f }: { f: Flight }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(f.delay, withTiming(1, { duration: 1500, easing: Easing.bezier(0.5, 0, 0.3, 1) }));
  }, [f.delay, p]);
  const W = 220;
  const style = useAnimatedStyle(() => {
    const fly = interpolate(p.value, [0, 0.55, 1], [0, 0, 1], 'clamp');
    const x = f.from.x + (f.to.x - f.from.x) * fly - W / 2;
    const y = f.from.y + (f.to.y - f.from.y) * fly - 20 - Math.sin(fly * Math.PI) * 40;
    return {
      opacity: interpolate(p.value, [0, 0.08, 0.85, 1], [0, 1, 1, 0], 'clamp'),
      transform: [{ translateX: x }, { translateY: y }, { scale: interpolate(p.value, [0, 0.08, 0.55, 1], [0.85, 1, 1, 0.25], 'clamp') }],
    };
  });
  return (
    <Animated.View pointerEvents="none" style={[st.chip, { width: W }, style]}>
      <View style={[st.dot, { backgroundColor: f.kind === 'fact' ? color.amber : color.greenBright }]} />
      <View style={{ flex: 1 }}>
        <Text style={st.label}>{f.label}</Text>
        <Text style={st.text} numberOfLines={2}>{f.text}</Text>
      </View>
    </Animated.View>
  );
}

const st = StyleSheet.create({
  chip: {
    position: 'absolute', left: 0, top: 0, flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    backgroundColor: color.paper, borderRadius: 3, paddingVertical: 7, paddingHorizontal: 10,
    shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  dot: { width: 7, height: 7, borderRadius: 4, marginTop: 4 },
  label: { fontFamily: font.mono, fontSize: 9, letterSpacing: 1.2, color: color.inkDim, textTransform: 'uppercase' },
  text: { fontFamily: font.serif, fontSize: 13, lineHeight: 17, color: color.ink },
});
