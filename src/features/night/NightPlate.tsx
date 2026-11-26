import { useState } from 'react';
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import type { ArtImage } from '../../art';
import { color, radius } from '../../theme/tokens';

/**
 * A day-report or night-event illustration, set like a print pinned to the desk (ART_BIBLE §7: one hero image per
 * screen, no tint — the lamp is already in the picture). Fades in once decoded so a slow decode never flashes white.
 * Renders nothing without art, so the screen falls back to its typography.
 */
export function NightPlate({ art, alt, maxHeight = 260, style }: { art: ArtImage | undefined; alt?: string; maxHeight?: number; style?: StyleProp<ViewStyle> }) {
  const [ready, setReady] = useState(false);
  if (!art) return null;
  const ratio = art.w && art.h ? art.w / art.h : 4 / 3;
  return (
    <View style={[s.frame, { aspectRatio: ratio, maxHeight }, style]} accessible accessibilityRole="image" accessibilityLabel={alt}>
      {ready ? null : <View style={s.wait} />}
      <Animated.View entering={FadeIn.duration(360)} style={StyleSheet.absoluteFill}>
        <Image source={art.src} style={s.img} resizeMode="cover" onLoad={() => setReady(true)} />
      </Animated.View>
      <View style={s.edge} pointerEvents="none" />
    </View>
  );
}

const s = StyleSheet.create({
  frame: { width: '100%', alignSelf: 'center', borderRadius: radius.sm, overflow: 'hidden', backgroundColor: color.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: color.paperEdge },
  img: { width: '100%', height: '100%' },
  wait: { ...StyleSheet.absoluteFill, backgroundColor: color.surface },
  // a 2 px inner shadow, like the portrait prints
  edge: { ...StyleSheet.absoluteFill, borderRadius: radius.sm, borderWidth: 2, borderColor: 'rgba(0,0,0,0.28)' },
});
