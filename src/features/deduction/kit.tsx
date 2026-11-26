// Small building blocks shared by the deduction book, the notebook and the finale.
// Kept inside the feature folders so the three features stay self-contained.
import { useEffect, useState, type ReactNode } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming, Easing } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { ChipType, ChipView } from '../../../shared/api';
import { color, font, radius, space } from '../../theme/tokens';
import type { Translate } from './types';
import { evidenceArt, portraitArt } from '../../art';
import { FaceCrop } from '../../art/components';

// ─────────────────────────────────────────────────────────── feel

export type FeelKind = 'light' | 'medium' | 'heavy' | 'double' | 'warning' | 'success';

/** Haptic vocabulary (PLAN §5). No-op on web. */
export function feel(kind: FeelKind) {
  if (Platform.OS === 'web') return;
  const run = () => {
    switch (kind) {
      case 'light': return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      case 'medium': return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      case 'heavy': return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      case 'warning': return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      case 'success': return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      case 'double':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).then(() =>
          new Promise((r) => setTimeout(r, 90)).then(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)));
    }
  };
  try { run()?.catch(() => undefined); } catch { /* haptics unavailable */ }
}

// ─────────────────────────────────────────────────────────── text helpers

/** Fill {name} placeholders. */
export const fmt = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));

/** "2 h 15 min" / "45 min" using the feature's own unit strings. */
export function duration(t: Translate, ns: string, minutes: number) {
  const m = Math.max(0, Math.round(minutes));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h && r) return fmt(t(`${ns}.hm`), { h, m: r });
  if (h) return fmt(t(`${ns}.h`), { h });
  return fmt(t(`${ns}.min`), { n: r });
}

/** A paragraph clamped to three lines, with "more". */
export function MoreText({ children, style, lines = 3, moreLabel, lessLabel, tint }: {
  children: string; style?: StyleProp<TextStyle>; lines?: number; moreLabel: string; lessLabel?: string; tint?: string;
}) {
  const [open, setOpen] = useState(false);
  const [clamped, setClamped] = useState(false);
  // a cheap heuristic first (works on web where onTextLayout is unreliable), refined by onTextLayout on native
  const long = children.length > lines * 46;
  const show = clamped || long;
  return (
    <View>
      <Text
        style={style}
        numberOfLines={open ? undefined : lines}
        onTextLayout={(e) => { if (!open && e.nativeEvent.lines.length > lines) setClamped(true); }}
      >
        {children}
      </Text>
      {show ? (
        <Pressable hitSlop={8} onPress={() => setOpen((o) => !o)} accessibilityRole="button">
          <Text style={[k.more, tint ? { color: tint } : null]}>{open ? (lessLabel ?? '−') : moreLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/**
 * Root view that tells the browser which language the text is in, so CSS uppercase is right
 * (English "file" → FILE, not FİLE, when the page itself is marked Turkish). No-op on native.
 */
export function LangRoot({ lang, children, style }: { lang: string; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const extra = (Platform.OS === 'web' ? { lang } : {}) as object;
  return <View style={[{ flex: 1 }, style]} {...extra}>{children}</View>;
}

// ─────────────────────────────────────────────────────────── buttons

export function Btn({ label, onPress, kind = 'primary', disabled, busy, style, small, icon }: {
  label: string; onPress: () => void; kind?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'paper';
  disabled?: boolean; busy?: boolean; style?: StyleProp<ViewStyle>; small?: boolean; icon?: ReactNode;
}) {
  const bg = kind === 'primary' ? color.burgundy : kind === 'danger' ? color.burgundyDeep : kind === 'paper' ? color.ink : 'transparent';
  const border = kind === 'secondary' ? color.border : kind === 'danger' ? color.burgundy : 'transparent';
  const fg = kind === 'ghost' ? color.textDim : kind === 'paper' ? color.paper : color.text;
  return (
    <Pressable
      disabled={disabled || busy}
      onPress={() => { feel('light'); onPress(); }}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!(disabled || busy), busy: !!busy }}
      style={({ pressed }) => [
        k.btn, small && k.btnSmall,
        { backgroundColor: bg, borderColor: border, opacity: disabled ? 0.4 : busy ? 0.7 : pressed ? 0.82 : 1 },
        style,
      ]}
    >
      {icon}
      <Text style={[k.btnText, { color: fg }, small && { fontSize: 13 }]}>{busy ? '…' : label}</Text>
    </Pressable>
  );
}

export function Eyebrow({ children, tint, style }: { children: ReactNode; tint?: string; style?: StyleProp<TextStyle> }) {
  return <Text style={[k.eyebrow, tint ? { color: tint } : null, style]}>{children}</Text>;
}

export function NewDot({ label }: { label: string }) {
  return (
    <View style={k.newDot} accessibilityLabel={label}>
      <Text style={k.newDotText}>{label}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────── chips

export const chipTint: Record<ChipType | 'deduction', string> = {
  fact: color.paper,
  evidence: color.amber,
  person: color.burgundyBright,
  time: color.greenBright,
  place: color.textDim,
  choice: color.text,
  deduction: color.stamp,
};

const chipGlyph: Record<ChipType | 'deduction', string> = {
  fact: '¶', evidence: '§', person: '●', time: '◷', place: '⌂', choice: '◇', deduction: '✓',
};

export type AnyChip = Omit<ChipView, 'type'> & { type: ChipType | 'deduction' };

/** The one chip used everywhere: facts, evidence, people, times, places, deductions. */
export function Chip({ chip, onPress, selected, dim, lines = 2, style, accessibilityHint }: {
  chip: AnyChip; onPress?: () => void; selected?: boolean; dim?: boolean; lines?: number; style?: StyleProp<ViewStyle>; accessibilityHint?: string;
}) {
  const tint = chipTint[chip.type];
  const body = (
    <View style={[k.chip, { borderColor: selected ? tint : color.border }, selected && { backgroundColor: color.elevated }, dim && { opacity: 0.4 }, style]}>
      {chip.type === 'person' && portraitArt(chip.id) ? <FaceCrop id={chip.id} size={22} />
        : chip.type === 'evidence' && evidenceArt(chip.id) ? <Image source={evidenceArt(chip.id)!.src} style={k.chipThumb} resizeMode="cover" />
        : <Text style={[k.chipGlyph, { color: tint }]}>{chipGlyph[chip.type]}</Text>}
      <Text style={[k.chipText, chip.type === 'time' && { fontFamily: font.monoMedium }]} numberOfLines={lines}>{chip.label}</Text>
    </View>
  );
  if (!onPress) return body;
  return (
    <Pressable
      onPress={() => { feel('light'); onPress(); }}
      accessibilityRole="button"
      accessibilityLabel={chip.label}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
    >
      {body}
    </Pressable>
  );
}

// ─────────────────────────────────────────────────────────── motion

/** A rubber stamp that lands: drops from large and tilted, settles with a slight bounce. */
export function LandingStamp({ label, tint = color.stamp, delay = 0, rotate = -7, size = 'lg', onLanded }: {
  label: string; tint?: string; delay?: number; rotate?: number; size?: 'md' | 'lg'; onLanded?: () => void;
}) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(delay, withTiming(1, { duration: 260, easing: Easing.in(Easing.quad) }));
    const id = setTimeout(() => onLanded?.(), delay + 250);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const st = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ scale: 1 + (1 - p.value) * 1.4 }, { rotate: `${rotate - (1 - p.value) * 10}deg` }],
  }));
  return (
    <Animated.View style={[k.stamp, size === 'md' && k.stampMd, { borderColor: tint }, st]} accessibilityLabel={label}>
      <Text style={[k.stampText, size === 'md' && { fontSize: 13 }, { color: tint }]}>{label}</Text>
    </Animated.View>
  );
}

/** Returns an animated style and a trigger that shakes the view sideways (a claim / filing that doesn't hold). */
export function useShake() {
  const x = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const shake = () => {
    x.value = withSequence(
      withTiming(-8, { duration: 50 }), withTiming(8, { duration: 70 }), withTiming(-6, { duration: 60 }),
      withTiming(4, { duration: 50 }), withSpring(0, { damping: 12 }),
    );
  };
  return { style, shake };
}

/** Fades and lifts its children in when mounted (or when `k` changes). */
export function Rise({ children, delay = 0, style, distance = 10 }: { children: ReactNode; delay?: number; style?: StyleProp<ViewStyle>; distance?: number }) {
  const p = useSharedValue(0);
  useEffect(() => { p.value = withDelay(delay, withTiming(1, { duration: 340, easing: Easing.out(Easing.cubic) })); }, [delay, p]);
  const st = useAnimatedStyle(() => ({ opacity: p.value, transform: [{ translateY: (1 - p.value) * distance }] }));
  return <Animated.View style={[st, style]}>{children}</Animated.View>;
}

const k = StyleSheet.create({
  more: { fontFamily: font.monoMedium, fontSize: 11, letterSpacing: 1.2, color: color.amber, marginTop: 4, textTransform: 'uppercase' },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, minHeight: 48,
    paddingHorizontal: space.lg, borderRadius: radius.md, borderWidth: 1,
  },
  btnSmall: { minHeight: 36, paddingHorizontal: space.md },
  btnText: { fontFamily: font.sansMedium, fontSize: 15, letterSpacing: 0.2 },
  eyebrow: { fontFamily: font.mono, fontSize: 11, letterSpacing: 1.6, color: color.textFaint, textTransform: 'uppercase' },
  newDot: { backgroundColor: color.burgundy, borderRadius: radius.sm, paddingHorizontal: 5, paddingVertical: 1, alignSelf: 'flex-start' },
  newDotText: { fontFamily: font.monoMedium, fontSize: 9.5, letterSpacing: 1, color: color.text, textTransform: 'uppercase' },
  chip: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderWidth: 1, borderRadius: radius.md,
    paddingHorizontal: 10, paddingVertical: 8, backgroundColor: color.surface, minHeight: 40,
  },
  chipThumb: { width: 26, height: 26, borderRadius: 2, marginTop: -3, backgroundColor: color.paper },
  chipGlyph: { fontFamily: font.monoMedium, fontSize: 13, lineHeight: 20, width: 12, textAlign: 'center' },
  chipText: { flex: 1, fontFamily: font.sans, fontSize: 14, lineHeight: 20, color: color.text },
  stamp: { borderWidth: 3, paddingHorizontal: 14, paddingVertical: 6, alignSelf: 'flex-start', borderRadius: 4 },
  stampMd: { borderWidth: 2, paddingHorizontal: 10, paddingVertical: 4 },
  stampText: { fontFamily: font.monoMedium, fontSize: 18, letterSpacing: 3 },
});
