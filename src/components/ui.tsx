import { type ReactNode } from 'react';
import {
  ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { color, font, radius, space, type } from '../theme/tokens';
import { Icon, type IconName } from './Icon';
import { usePrefs } from '../state/prefs';
import { useT } from '../i18n';
import { Textured } from '../art/components';
import type { TextureName } from '../art';

export const tap = (kind: 'light' | 'medium' = 'light') => {
  if (Platform.OS === 'web' || !usePrefs.getState().haptics) return;
  Haptics.impactAsync(kind === 'light' ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
};

export function Screen({ children, scroll = true, padded = true, style, footer, noInset, texture }: {
  children: ReactNode; scroll?: boolean; padded?: boolean; style?: StyleProp<ViewStyle>; footer?: ReactNode; noInset?: boolean;
  /** a painted surface under the page (the desk at headquarters, the charcoal board) */
  texture?: TextureName;
}) {
  const safe = useSafeAreaInsets();
  const inset = noInset ? { top: 0 } : safe;
  const inner = [padded && { paddingHorizontal: space.lg }, { paddingBottom: space.xxxl }, style];
  const rootStyle = [s.screen, { paddingTop: inset.top }];
  const body = (
      <View style={s.column}>
        {scroll ? (
          <ScrollView contentContainerStyle={inner} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        ) : (
          <View style={[{ flex: 1 }, padded && { paddingHorizontal: space.lg }, style]}>{children}</View>
        )}
        {footer}
      </View>
  );
  return texture ? <Textured name={texture} style={rootStyle}>{body}</Textured> : <View style={rootStyle}>{body}</View>;
}

export function TopBar({ title, eyebrow, onBack, right }: { title?: string; eyebrow?: string; onBack?: (() => void) | false; right?: ReactNode }) {
  const t = useT();
  return (
    <View style={s.topbar}>
      {onBack !== false ? (
        <Pressable hitSlop={12} onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))} style={s.topbarBack} accessibilityLabel={t('common.back')}>
          <Icon name="back" size={22} tint={color.textDim} />
        </Pressable>
      ) : <View style={{ width: 4 }} />}
      <View style={{ flex: 1 }}>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        {title ? <Text style={s.topbarTitle} numberOfLines={1}>{title}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function Eyebrow({ children, style, tint }: { children: ReactNode; style?: StyleProp<TextStyle>; tint?: string }) {
  return <Text style={[type.eyebrow, tint ? { color: tint } : null, style]}>{children}</Text>;
}

export function T({ v = 'body', children, style, numberOfLines, selectable }: {
  v?: keyof typeof type; children: ReactNode; style?: StyleProp<TextStyle>; numberOfLines?: number; selectable?: boolean;
}) {
  return <Text style={[type[v], style]} numberOfLines={numberOfLines} selectable={selectable}>{children}</Text>;
}

export function Button({ label, onPress, kind = 'primary', icon, disabled, busy, style, compact }: {
  label: string; onPress: () => void; kind?: 'primary' | 'secondary' | 'ghost' | 'danger'; icon?: IconName;
  disabled?: boolean; busy?: boolean; style?: StyleProp<ViewStyle>; compact?: boolean;
}) {
  const bg = kind === 'primary' ? color.burgundy : kind === 'danger' ? color.burgundyDeep : 'transparent';
  const border = kind === 'secondary' ? color.border : kind === 'danger' ? color.burgundy : 'transparent';
  const fg = kind === 'ghost' ? color.textDim : color.text;
  return (
    <Pressable
      disabled={disabled || busy}
      onPress={() => { tap(); onPress(); }}
      style={({ pressed }) => [
        s.button, compact && s.buttonCompact, { backgroundColor: bg, borderColor: border, opacity: disabled ? 0.4 : pressed ? 0.8 : 1 }, style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {busy ? <ActivityIndicator color={fg} size="small" /> : (
        <>
          {icon ? <Icon name={icon} size={17} tint={fg} /> : null}
          <Text style={[s.buttonText, { color: fg }, compact && { fontSize: 13 }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

export function Card({ children, style, onPress, accent }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; accent?: string }) {
  const body = (
    <View style={[s.card, accent ? { borderLeftColor: accent, borderLeftWidth: 2 } : null, style]}>{children}</View>
  );
  if (!onPress) return body;
  return (
    <Pressable onPress={() => { tap(); onPress(); }} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
      {body}
    </Pressable>
  );
}

export function Tag({ label, tint = color.textDim, filled }: { label: string; tint?: string; filled?: boolean }) {
  return (
    <View style={[s.tag, { borderColor: tint }, filled && { backgroundColor: tint }]}>
      <Text style={[s.tagText, { color: filled ? color.bg : tint }]}>{label}</Text>
    </View>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[s.divider, style]} />;
}

export function Section({ title, children, right, style }: { title: string; children: ReactNode; right?: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ marginTop: space.xl }, style]}>
      <View style={s.sectionHead}>
        <Eyebrow>{title}</Eyebrow>
        {right}
      </View>
      {children}
    </View>
  );
}

/** Off-white document sheet: official paperwork inside the dark workstation. */
export function Paper({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <Textured name="paper" opacity={0.7} style={[s.paper, style]}>{children}</Textured>;
}

export function PaperText({ children, mono, dim, style, selectable }: { children: ReactNode; mono?: boolean; dim?: boolean; style?: StyleProp<TextStyle>; selectable?: boolean }) {
  return (
    <Text selectable={selectable} style={[{ fontFamily: mono ? font.mono : font.sans, fontSize: mono ? 12.5 : 14, lineHeight: mono ? 19 : 21, color: dim ? color.inkDim : color.ink }, style]}>
      {children}
    </Text>
  );
}

export function Stamp({ label, tint = color.stamp, rotate = -6, style }: { label: string; tint?: string; rotate?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[s.stamp, { borderColor: tint, transform: [{ rotate: `${rotate}deg` }] }, style]}>
      <Text style={[s.stampText, { color: tint }]}>{label}</Text>
    </View>
  );
}

export function Monogram({ initials, tone, size = 56 }: { initials: string; tone: string; size?: number }) {
  return (
    <View style={[s.mono, { width: size, height: size * 1.22, backgroundColor: tone }]}>
      <View style={[s.monoInner, { borderColor: 'rgba(232,229,222,0.16)' }]}>
        <Text style={{ fontFamily: font.serif, fontSize: size * 0.42, color: 'rgba(232,229,222,0.86)', letterSpacing: 1 }}>{initials}</Text>
      </View>
    </View>
  );
}

export function Loading({ label }: { label?: string }) {
  const t = useT();
  return (
    <View style={s.center}>
      <ActivityIndicator color={color.textDim} />
      <Eyebrow style={{ marginTop: space.md }}>{label ?? t('common.loading')}</Eyebrow>
    </View>
  );
}

export function ErrorState({ message, onRetry, title, extra }: { message: string; onRetry?: () => void; title?: string; extra?: ReactNode }) {
  const t = useT();
  return (
    <View style={s.center}>
      <T v="title" style={{ textAlign: 'center' }}>{title ?? t('common.unavailable')}</T>
      <T v="bodyDim" style={{ textAlign: 'center', marginTop: space.sm, maxWidth: 320 }}>{message}</T>
      {extra}
      {onRetry ? <Button label={t('common.retry')} kind="secondary" onPress={onRetry} style={{ marginTop: space.lg }} /> : null}
      <Button label={t('common.backToHq')} kind="ghost" onPress={() => router.replace('/hq')} style={{ marginTop: space.sm }} />
    </View>
  );
}

export function KeyValue({ k, v }: { k: string; v: ReactNode }) {
  return (
    <View style={s.kv}>
      <Text style={s.kvKey}>{k}</Text>
      <Text style={s.kvValue}>{v}</Text>
    </View>
  );
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <View style={s.segment}>
      {options.map((o) => (
        <Pressable key={o.value} onPress={() => { tap(); onChange(o.value); }} style={[s.segmentItem, value === o.value && s.segmentActive]}>
          <Text style={[s.segmentText, value === o.value && { color: color.text }]}>{o.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  column: { flex: 1, width: '100%', maxWidth: 760, alignSelf: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, backgroundColor: color.bg },
  topbar: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md, minHeight: 56 },
  topbarBack: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginLeft: -12, marginRight: -6 },
  topbarTitle: { fontFamily: font.serif, fontSize: 19, color: color.text, marginTop: 1 },
  button: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, minHeight: 48,
    paddingHorizontal: space.lg, borderRadius: radius.md, borderWidth: 1,
  },
  buttonCompact: { minHeight: 36, paddingHorizontal: space.md },
  buttonText: { fontFamily: font.sansMedium, fontSize: 15, letterSpacing: 0.2 },
  card: { backgroundColor: color.surface, borderColor: color.borderSoft, borderWidth: 1, borderRadius: radius.md, padding: space.lg },
  tag: { borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start' },
  tagText: { fontFamily: font.mono, fontSize: 10, letterSpacing: 1.1, textTransform: 'uppercase' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: color.border, marginVertical: space.lg },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.md },
  paper: {
    backgroundColor: color.paper, borderRadius: radius.sm, padding: space.xl, borderWidth: 1, borderColor: color.paperEdge,
    shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 4,
  },
  stamp: { borderWidth: 2, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', borderRadius: 3, opacity: 0.85 },
  stampText: { fontFamily: font.monoMedium, fontSize: 12, letterSpacing: 2.2 },
  mono: { borderRadius: radius.sm, padding: 4 },
  monoInner: { flex: 1, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  kv: { flexDirection: 'row', paddingVertical: 6, gap: space.md },
  kvKey: { fontFamily: font.mono, fontSize: 11, letterSpacing: 1, color: color.textFaint, width: 96, textTransform: 'uppercase', paddingTop: 2 },
  kvValue: { flex: 1, fontFamily: font.sans, fontSize: 14, lineHeight: 20, color: color.text },
  segment: { flexDirection: 'row', borderWidth: 1, borderColor: color.border, borderRadius: radius.md, padding: 3, gap: 3 },
  segmentItem: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: radius.sm },
  segmentActive: { backgroundColor: color.elevated },
  segmentText: { fontFamily: font.sansMedium, fontSize: 13, color: color.textFaint },
});
