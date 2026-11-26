import { View } from 'react-native';
import { color } from '../../../../src/theme/tokens';
import { Tabs } from 'expo-router';
import { TabBar } from '../../../../src/components/TabBar';
import { ToastGuard } from '../../../../src/components/Toasts';
import { TopStrip } from '../../../../src/features/desk/TopStrip';
import { CoachMark } from '../../../../src/features/desk/Coach';
import { useDesk } from '../../../../src/state/desk';
import { useT } from '../../../../src/i18n';

/** Bottom bar: Map · Notebook · Deductions · People (PLAN §6), under the persistent clock strip. */
export default function DeskTabs() {
  const t = useT();
  const view = useDesk((s) => s.view);
  if (!view) return null;
  const badges = {
    index: view.lab.ready,
    notebook: view.notebook.facts.filter((f) => f.isNew).length + view.notebook.evidence.filter((e) => e.isNew).length,
    deductions: view.deductions.filter((d) => d.isNew && d.status === 'open').length,
    people: 0,
  };
  return (
    <View style={{ flex: 1, backgroundColor: color.bg }}>
      {/* toasts land under the strip and the coach line, never over them (PLAYTEST_V4 §7.4) */}
      <ToastGuard edge="top">
        <TopStrip view={view} />
        {/* tutorial only: one line of guidance, shown once per step */}
        <CoachMark view={view} where="tabs" style={{ marginHorizontal: 12, marginTop: 8 }} />
      </ToastGuard>
      <Tabs
        screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: color.bg } }}
        tabBar={(p) => <TabBar {...p} icons={{ index: 'map', notebook: 'notebook', deductions: 'deduce', people: 'people' }} badges={badges} />}
      >
        <Tabs.Screen name="index" options={{ title: t('desk.tab.map') }} />
        <Tabs.Screen name="notebook" options={{ title: t('desk.tab.notebook') }} />
        <Tabs.Screen name="deductions" options={{ title: t('desk.tab.deductions') }} />
        <Tabs.Screen name="people" options={{ title: t('desk.tab.people') }} />
      </Tabs>
    </View>
  );
}
