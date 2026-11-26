import { Tabs } from 'expo-router';
import { TabBar } from '../../src/components/TabBar';
import { useT } from '../../src/i18n';
import { color } from '../../src/theme/tokens';

export default function HqLayout() {
  const t = useT();
  return (
    <Tabs
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: color.bg } }}
      tabBar={(p) => <TabBar {...p} icons={{ index: 'hq', cases: 'cases', dossier: 'dossier' }} />}
    >
      <Tabs.Screen name="index" options={{ title: t('hq.tab.hq') }} />
      <Tabs.Screen name="cases" options={{ title: t('hq.tab.cases') }} />
      <Tabs.Screen name="dossier" options={{ title: t('hq.tab.dossier') }} />
    </Tabs>
  );
}
