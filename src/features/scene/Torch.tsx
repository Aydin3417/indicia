import { memo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import type { SceneTool } from './types';

export const BEAM = 92; // beam radius in screen points

const LOOK: Record<SceneTool, { dark: string; edge: number; glow: string; glowOpacity: number; r: number }> = {
  torch: { dark: '#040405', edge: 0.93, glow: '#FFDDA8', glowOpacity: 0.1, r: BEAM },
  camera: { dark: '#040405', edge: 0.93, glow: '#FFFFFF', glowOpacity: 0.06, r: BEAM },
  dust: { dark: '#040405', edge: 0.93, glow: '#E8E2D6', glowOpacity: 0.08, r: BEAM },
  uv: { dark: '#05031A', edge: 0.96, glow: '#7B5CFF', glowOpacity: 0.34, r: BEAM * 0.86 },
};

/**
 * The darkness with a hole: one static SVG (a radial gradient on a big square) moved by a UI-thread transform.
 * Nothing re-renders while the light moves.
 */
export const Torch = memo(function Torch({ x, y, size, tool, ambient }: {
  x: SharedValue<number>; y: SharedValue<number>; size: number; tool: SceneTool;
  /** over a painted plate the room stays faintly readable outside the beam (the shapes, not the details) */
  ambient?: boolean;
}) {
  const L = ambient ? { ...LOOK[tool], edge: tool === 'uv' ? 0.9 : 0.84 } : LOOK[tool];
  const S = size;
  const c = S / 2;
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value - c }, { translateY: y.value - c }] }));
  return (
    <Animated.View pointerEvents="none" style={[st.layer, { width: S, height: S }, style]}>
      <Svg width={S} height={S}>
        <Defs>
          <RadialGradient id={`dark-${tool}`} cx={c} cy={c} r={L.r} fx={c} fy={c} gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={L.dark} stopOpacity="0" />
            <Stop offset="0.38" stopColor={L.dark} stopOpacity="0.02" />
            <Stop offset="0.66" stopColor={L.dark} stopOpacity="0.38" />
            <Stop offset="0.86" stopColor={L.dark} stopOpacity="0.8" />
            <Stop offset="1" stopColor={L.dark} stopOpacity={String(L.edge)} />
          </RadialGradient>
          <RadialGradient id={`glow-${tool}`} cx={c} cy={c} r={L.r} fx={c} fy={c} gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={L.glow} stopOpacity={String(L.glowOpacity)} />
            <Stop offset="0.7" stopColor={L.glow} stopOpacity={String(L.glowOpacity * 0.4)} />
            <Stop offset="1" stopColor={L.glow} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={S} height={S} fill={`url(#dark-${tool})`} />
        <Circle cx={c} cy={c} r={L.r} fill={`url(#glow-${tool})`} />
      </Svg>
    </Animated.View>
  );
});

const st = StyleSheet.create({
  layer: { position: 'absolute', left: 0, top: 0 },
});
