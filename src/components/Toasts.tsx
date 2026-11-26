import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToasts } from '../state/toasts';
import { color, font, radius, space } from '../theme/tokens';

const tint = {
  evidence: color.greenBright, neutral: color.textDim, alert: color.burgundyBright, proof: color.burgundyBright,
  team: color.amber, lab: color.amber,
} as const;

export function Toasts() {
  const toasts = useToasts((s) => s.toasts);
  const dismiss = useToasts((s) => s.dismiss);
  const inset = useSafeAreaInsets();
  if (!toasts.length) return null;
  return (
    <View pointerEvents="box-none" style={[s.wrap, { top: inset.top + 8 }]}>
      {toasts.map((t) => (
        <Animated.View key={t.id} entering={FadeInUp.duration(220)} exiting={FadeOutUp.duration(180)} style={{ width: '100%', maxWidth: 520 }}
          pointerEvents={t.action ? 'auto' : 'none'}>
          <View style={[s.toast, { borderLeftColor: tint[t.tone] }]} accessibilityRole="alert">
            <View style={{ flex: 1 }}>
              <Text style={[s.title, { color: tint[t.tone] }]}>{t.title}</Text>
              {t.text ? <Text style={s.text} numberOfLines={3}>{t.text}</Text> : null}
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

const s = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center', gap: space.sm, paddingHorizontal: space.lg, zIndex: 50 },
  toast: {
    width: '100%', backgroundColor: color.elevated, borderRadius: radius.md, borderLeftWidth: 3, flexDirection: 'row', alignItems: 'center',
    borderColor: color.border, paddingVertical: space.md, paddingHorizontal: space.lg, gap: space.md,
    shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  title: { fontFamily: font.monoMedium, fontSize: 11, letterSpacing: 1.3, textTransform: 'uppercase' },
  text: { fontFamily: font.sans, fontSize: 14, lineHeight: 20, color: color.text, marginTop: 3 },
  action: { borderWidth: 1, borderColor: color.amber, borderRadius: radius.sm, paddingHorizontal: space.md, paddingVertical: 6 },
  actionText: { fontFamily: font.sansMedium, fontSize: 13, color: color.amber },
});
