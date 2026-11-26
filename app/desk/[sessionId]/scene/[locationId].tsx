import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useDesk } from '../../../../src/state/desk';
import { usePrefs } from '../../../../src/state/prefs';
import { Feature } from '../../../../src/features/desk/mount';
import { useSceneAct, useFeatureT } from '../../../../src/features/desk/FeatureProps';
import { color } from '../../../../src/theme/tokens';

/** Full-screen scene → src/features/scene SceneScreen({ view, locationId, act, onExit, t, idleAssist, haptics }). */
export default function SceneMode() {
  const { sessionId, locationId } = useLocalSearchParams<{ sessionId: string; locationId: string }>();
  const view = useDesk((s) => s.view)!;
  const t = useFeatureT();
  const act = useSceneAct();
  const idleAssist = usePrefs((s) => s.idleAssist);
  const haptics = usePrefs((s) => s.haptics);
  const onExit = () => (router.canGoBack() ? router.back() : router.replace(`/desk/${sessionId}`));
  return (
    <View style={{ flex: 1, backgroundColor: color.bg }}>
      <Feature feature="scene" exportName="SceneScreen" onBack={onExit} props={{ view, locationId: locationId!, act, onExit, t, idleAssist, haptics }} />
    </View>
  );
}
