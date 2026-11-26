// Image components for the ink-and-watercolour art (docs/ART_BIBLE.md §7). Each one falls back to the
// code-drawn version when a case has no image for that slot yet.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Image, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import type { Composure } from '../../shared/api';
import { useLocale } from '../i18n';
import { color, font } from '../theme/tokens';
import { altOf, coverArt, faceCentre, portraitArt, textureArt, type ArtImage, type TextureName } from './index';

const hidden = { accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' as const };

/** Cover-crop an image of size (iw, ih) into (w, h), keeping the point (fx, fy) at (ax, ay) of the frame where possible. */
export function coverBox(w: number, h: number, iw: number, ih: number, fx = 0.5, fy = 0.5, ax = 0.5, ay = 0.5) {
  const k = Math.max(w / iw, h / ih);
  const W = iw * k;
  const H = ih * k;
  const left = Math.min(0, Math.max(w - W, w * ax - fx * W));
  const top = Math.min(0, Math.max(h - H, h * ay - fy * H));
  return { width: W, height: H, left, top };
}

/** Initials on a tinted card: the stand-in for anyone without a portrait. */
function Initials({ initials, tone, w, h, round }: { initials: string; tone: string; w: number; h: number; round?: boolean }) {
  return (
    <View style={{ width: w, height: h, backgroundColor: tone, alignItems: 'center', justifyContent: 'center', borderRadius: round ? w / 2 : 0 }}>
      <Text style={{ fontFamily: font.serif, fontSize: Math.min(w, h) * 0.38, color: 'rgba(232,229,222,0.86)', letterSpacing: 1 }}>{initials}</Text>
    </View>
  );
}

/**
 * A portrait print. Switching `stage` cross-fades to the new expression (180 ms) with a 1.5 % "flinch"; bumping
 * `reactKey` flinches without a stage change (a break when they are already breaking).
 */
export function PortraitPrint({ id, stage = 'composed', width, height, reactKey, initials, tone, anchorY = 0.4, style, children }: {
  id: string; stage?: Composure; width: number; height: number; reactKey?: number; initials?: string; tone?: string;
  /** where the face should sit vertically in the frame (0 top … 1 bottom) */
  anchorY?: number; style?: StyleProp<ViewStyle>; children?: ReactNode;
}) {
  const locale = useLocale();
  const art = portraitArt(id, stage);
  const [prev, setPrev] = useState<{ stage: Composure; key: number } | null>(null);
  const shown = useRef(stage);
  const fade = useSharedValue(1);
  const scale = useSharedValue(1);
  const first = useRef(true);

  useEffect(() => {
    if (shown.current === stage) return;
    setPrev({ stage: shown.current, key: Date.now() });
    shown.current = stage;
    fade.value = 0;
    fade.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) });
    scale.value = withSequence(withTiming(1.015, { duration: 90 }), withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }));
  }, [stage, fade, scale]);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (reactKey === undefined) return;
    scale.value = withSequence(withTiming(1.015, { duration: 90 }), withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }));
  }, [reactKey, scale]);
  useEffect(() => {
    if (!prev) return;
    const h = setTimeout(() => setPrev(null), 260);
    return () => clearTimeout(h);
  }, [prev]);

  const topStyle = useAnimatedStyle(() => ({ opacity: fade.value }));
  const zoom = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  if (!width || !height) return <View style={[{ width, height }, style]} />;
  if (!art) {
    return <View style={[{ width, height, overflow: 'hidden' }, style]}><Initials initials={initials ?? '?'} tone={tone ?? color.elevated} w={width} h={height} />{children}</View>;
  }
  const [fx, fy] = faceCentre(id);
  const box = coverBox(width, height, art.w, art.h, fx, fy, 0.5, anchorY);
  const prevArt = prev ? portraitArt(id, prev.stage) : undefined;
  return (
    <View style={[{ width, height, overflow: 'hidden', backgroundColor: color.surface }, style]} accessibilityRole="image" accessibilityLabel={altOf(art, locale)}>
      <Animated.View style={[StyleSheet.absoluteFill, zoom]}>
        {prevArt ? <Image source={prevArt.src} style={[s.abs, box]} resizeMode="cover" {...hidden} /> : null}
        <Animated.View style={[StyleSheet.absoluteFill, topStyle]}>
          <Image source={art.src} style={[s.abs, box]} resizeMode="cover" {...hidden} />
        </Animated.View>
      </Animated.View>
      {children}
    </View>
  );
}

/** A circular crop of someone's face (composed unless a stage is given). */
export function FaceCrop({ id, size, stage, initials, tone, ring }: {
  id: string; size: number; stage?: Composure; initials?: string; tone?: string; ring?: string;
}) {
  const art = portraitArt(id, stage);
  const border = ring ? { borderWidth: 1.5, borderColor: ring } : { borderWidth: StyleSheet.hairlineWidth, borderColor: color.border };
  if (!art) {
    return <View style={[{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden' }, border]}><Initials initials={initials ?? '?'} tone={tone ?? color.elevated} w={size} h={size} round /></View>;
  }
  const [fx, fy] = faceCentre(id);
  // the face is about 40 % of the portrait's width: scale so it fills the circle with a little air
  const W = size / 0.46;
  const H = W * (art.h / art.w);
  const left = size / 2 - fx * W;
  const top = size / 2 - fy * H;
  return (
    <View style={[{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', backgroundColor: color.surface }, border]} {...hidden}>
      <Image source={art.src} style={{ position: 'absolute', width: W, height: H, left, top }} resizeMode="cover" />
    </View>
  );
}

/** A tall card-shaped crop of someone's portrait (people lists): head and shoulders. */
export function PortraitCard({ id, width, height, initials, tone, stage }: { id: string; width: number; height: number; initials?: string; tone?: string; stage?: Composure }) {
  return <PortraitPrint id={id} stage={stage} width={width} height={height} initials={initials} tone={tone} anchorY={0.42} style={s.card} />;
}

/** An image drawn to an exact box (close-ups, evidence, plates), or nothing. */
export function ArtBox({ art, width, height, style, label }: { art?: ArtImage; width: number; height: number; style?: StyleProp<ViewStyle>; label?: string }) {
  if (!art) return null;
  return (
    <View style={[{ width, height, overflow: 'hidden' }, style]} accessibilityRole="image" accessibilityLabel={label}>
      <Image source={art.src} style={{ width, height }} resizeMode="cover" />
    </View>
  );
}

/**
 * A surface with one of the art textures under its content (paper cards, the desk, the charcoal board).
 * The texture is decorative and very low contrast; `tint` is the flat colour under it (the token), so the
 * surface reads the same where the image has not loaded yet.
 */
export function Textured({ name, children, style, opacity = 1, tint }: {
  name: TextureName; children?: ReactNode; style?: StyleProp<ViewStyle>; opacity?: number; tint?: string;
}) {
  const art = textureArt(name);
  const bg = tint ?? (name === 'paper' ? color.paper : name === 'charcoal' ? '#141618' : color.bg);
  return (
    <View style={[{ backgroundColor: bg, overflow: 'hidden' }, style]}>
      {art ? <Image source={art.src} resizeMode="repeat" style={[StyleSheet.absoluteFill, { opacity, width: '100%', height: '100%' }]} {...hidden} /> : null}
      {children}
    </View>
  );
}

/**
 * A case cover: the crime-poster key art with the title set in Newsreader over its dark, empty top (ART_BIBLE §4).
 * `height` crops the poster (it keeps the top, where the title sits); `children` sit on a dark strip at the foot.
 */
export function CoverCard({ caseId, width, height, eyebrow, title, tagline, right, children, style, onPress }: {
  caseId: string; width: number; height?: number; eyebrow?: string; title: string; tagline?: string;
  right?: ReactNode; children?: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void;
}) {
  const locale = useLocale();
  const art = coverArt(caseId);
  const H = height ?? Math.round(width * 4 / 3);
  const imgH = width * (art ? art.h / art.w : 4 / 3);
  return (
    <View style={[{ width, height: H, overflow: 'hidden', borderRadius: 3, backgroundColor: '#0D0E0F' }, s.cover, style]} accessibilityLabel={altOf(art, locale)}>
      {art ? <Image source={art.src} style={{ position: 'absolute', left: 0, top: 0, width, height: Math.max(imgH, H) }} resizeMode="cover" {...hidden} /> : null}
      {onPress ? <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={title} style={StyleSheet.absoluteFill} /> : null}
      <View style={s.coverHead} pointerEvents="none">
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          {eyebrow ? <Text style={s.coverEyebrow} numberOfLines={1}>{eyebrow}</Text> : <View />}
          {right}
        </View>
        <Text style={[s.coverTitle, { fontSize: width < 220 ? 22 : width < 320 ? 28 : 34, lineHeight: width < 220 ? 26 : width < 320 ? 32 : 38 }]}>{title}</Text>
      </View>
      {/* the tagline sits on the dark strip at the foot: the poster's light would swallow it up top */}
      {tagline || children ? (
        <View style={s.coverFoot}>
          {tagline ? <Text style={s.coverTag} numberOfLines={3}>{tagline}</Text> : null}
          {children ? <View style={tagline ? { marginTop: 12 } : undefined}>{children}</View> : null}
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  cover: { borderWidth: StyleSheet.hairlineWidth, borderColor: color.paperEdge },
  coverHead: { position: 'absolute', left: 0, right: 0, top: 0, padding: 16 },
  coverEyebrow: { fontFamily: font.mono, fontSize: 11, letterSpacing: 1.6, color: color.amber, textTransform: 'uppercase', flexShrink: 1 },
  coverTitle: { fontFamily: font.serif, color: color.text, marginTop: 8, letterSpacing: -0.3 },
  coverTag: { fontFamily: font.serifItalic, fontSize: 15, lineHeight: 21, color: color.text },
  coverFoot: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 14, backgroundColor: 'rgba(14,15,16,0.88)' },
  abs: { position: 'absolute' },
  card: { borderRadius: 3, borderWidth: StyleSheet.hairlineWidth, borderColor: color.paperEdge },
});
