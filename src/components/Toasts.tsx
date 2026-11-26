import { useCallback, useEffect, useRef, useState, type ComponentRef, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeInDown, FadeInUp, FadeOutDown, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { nextSlotId, useToasts } from '../state/toasts';
import { color, font, radius, space } from '../theme/tokens';

const tint = {
  evidence: color.greenBright, neutral: color.textDim, alert: color.burgundyBright, proof: color.burgundyBright,
  team: color.amber, lab: color.amber,
} as const;

export function Toasts() {
  const toasts = useToasts((s) => s.toasts);
  const slot = useToasts((s) => s.slots[s.slots.length - 1]);
  const dismiss = useToasts((s) => s.dismiss);
  const inset = useSafeAreaInsets();
  const win = useWindowDimensions();
  if (!toasts.length) return null;
  // the active screen decides where the toasts may sit (see ToastSlot); by default under the status bar.
  // a slot is a window y: the line toasts must stay below (top) or above (bottom)
  const bottom = slot?.edge === 'bottom';
  const place = bottom
    ? { bottom: Math.max(inset.bottom + 8, win.height - slot.offset + 8) }
    : { top: Math.max(inset.top + 8, (slot?.offset ?? 0) + 6) };
  return (
    <View pointerEvents="box-none" style={[s.wrap, place]} testID="toast-host">
      {toasts.map((t) => (
        <Animated.View
          key={t.id}
          entering={(bottom ? FadeInDown : FadeInUp).duration(220)}
          exiting={(bottom ? FadeOutDown : FadeOutUp).duration(180)}
          style={{ width: '100%', maxWidth: 520 }}
          pointerEvents={t.action ? 'auto' : 'none'}
        >
          <View style={[s.toast, { borderLeftColor: tint[t.tone] }]} accessibilityRole="alert">
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[s.title, { color: tint[t.tone] }]} numberOfLines={2}>{t.title}</Text>
              {t.text ? <Text style={s.text} numberOfLines={2}>{t.text}</Text> : null}
            </View>
            {t.action ? (
              <Pressable
                onPress={() => { t.action!.onPress(); dismiss(t.id); }}
                style={({ pressed }) => [s.action, { opacity: pressed ? 0.7 : 1 }]}
                accessibilityRole="button"
                accessibilityLabel={t.action.label}
              >
                <Text style={s.actionText}>{t.action.label}</Text>
              </Pressable>
            ) : null}
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

/**
 * Wraps the part of a screen toasts must not cover. `edge="top"`: toasts sit below its bottom line (the desk strip
 * and the tutorial coach line). `edge="bottom"`: toasts sit above its top line (a footer under a decision card).
 * Active only while its screen is focused, so a screen pushed on top falls back to its own placement.
 */
export function ToastGuard({ edge, children, style }: { edge: 'top' | 'bottom'; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const id = useRef(nextSlotId()).current;
  const ref = useRef<ComponentRef<typeof View>>(null);
  const [focused, setFocused] = useState(false);
  useFocusEffect(useCallback(() => { setFocused(true); return () => setFocused(false); }, []));
  const setSlot = useToasts((s) => s.setSlot);
  const clearSlot = useToasts((s) => s.clearSlot);
  const measure = useCallback(() => {
    if (!focused) return;
    ref.current?.measureInWindow((_x, y, _w, h) => {
      if (!Number.isFinite(y) || !Number.isFinite(h)) return;
      setSlot({ id, edge, offset: Math.round(edge === 'top' ? y + h : y) });
    });
  }, [focused, edge, id, setSlot]);
  useEffect(() => {
    if (!focused) { clearSlot(id); return; }
    measure();
    // the strip and the coach line animate in: measure again once they have settled
    const late = setTimeout(measure, 400);
    return () => { clearTimeout(late); clearSlot(id); };
  }, [focused, measure, clearSlot, id]);
  return <View ref={ref} style={style} onLayout={measure} collapsable={false}>{children}</View>;
}

const s = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center', gap: space.sm, paddingHorizontal: space.lg, zIndex: 50 },
  toast: {
    width: '100%', backgroundColor: color.elevated, borderRadius: radius.md, borderLeftWidth: 3, flexDirection: 'row', alignItems: 'center',
    borderColor: color.border, paddingVertical: space.sm + 2, paddingHorizontal: space.lg, gap: space.md,
    shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  title: { fontFamily: font.monoMedium, fontSize: 11, letterSpacing: 1.3, textTransform: 'uppercase' },
  text: { fontFamily: font.sans, fontSize: 14, lineHeight: 19, color: color.text, marginTop: 3 },
  action: { borderWidth: 1, borderColor: color.amber, borderRadius: radius.sm, paddingHorizontal: space.md, paddingVertical: 6 },
  actionText: { fontFamily: font.sansMedium, fontSize: 13, color: color.amber },
});
