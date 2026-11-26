import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { color, font, space } from '../theme/tokens';
import { Icon, type IconName } from './Icon';
import { tap } from './ui';

export function TabBar({ state, descriptors, emitter, navigateToTab, icons, badges }: BottomTabBarProps & { icons: Record<string, IconName>; badges?: Record<string, number> }) {
  const inset = useSafeAreaInsets();
  return (
    <View style={[s.bar, { paddingBottom: Math.max(inset.bottom, 8) }]}>
      <View style={s.inner}>
        {state.routes.map((route, i) => {
          const focused = state.index === i;
          const label = (descriptors[route.key].options.title ?? route.name) as string;
          const badge = badges?.[route.name] ?? 0;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={label}
              onPress={() => {
                tap();
                const e = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !e.defaultPrevented) navigateToTab(route.key);
              }}
              style={s.item}
            >
              <View>
                <Icon name={icons[route.name] ?? 'file'} size={21} tint={focused ? color.text : color.textFaint} />
                {badge > 0 ? <View style={s.badge} /> : null}
              </View>
              <Text style={[s.label, focused && { color: color.text }]}>{label}</Text>
              {focused ? <View style={s.rule} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  bar: { backgroundColor: color.bg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color.border },
  inner: { flexDirection: 'row', maxWidth: 760, width: '100%', alignSelf: 'center' },
  item: { flex: 1, alignItems: 'center', paddingTop: 10, paddingBottom: 4, gap: 4 },
  label: { fontFamily: font.mono, fontSize: 10, letterSpacing: 1, color: color.textFaint, textTransform: 'uppercase' },
  rule: { position: 'absolute', top: 0, height: 2, width: 24, backgroundColor: color.burgundyBright },
  badge: { position: 'absolute', top: -2, right: -5, width: 7, height: 7, borderRadius: 4, backgroundColor: color.amber },
});
