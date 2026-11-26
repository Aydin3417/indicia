import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useDesk } from '../../../../src/state/desk';
import { Feature } from '../../../../src/features/desk/mount';
import { useFeatureAct, useFeatureT } from '../../../../src/features/desk/FeatureProps';
import { color } from '../../../../src/theme/tokens';

/**
 * Full-screen interview → src/features/interview InterviewScreen({ view, suspectId, act, onExit, t }).
 * The People tab opens the interview (POST interview, cost shown on its button) before coming here;
 * leaving the room (POST interview/leave) is the screen's own decision.
 */
export default function InterviewMode() {
  const { sessionId, suspectId } = useLocalSearchParams<{ sessionId: string; suspectId: string }>();
  const view = useDesk((s) => s.view)!;
  const t = useFeatureT();
  const act = useFeatureAct({ haptics: false, toastFinds: false });
  const onExit = () => (router.canGoBack() ? router.back() : router.replace(`/desk/${sessionId}/people`));
  return (
    <View style={{ flex: 1, backgroundColor: color.bg }}>
      <Feature feature="interview" exportName="InterviewScreen" onBack={onExit} props={{ view, suspectId: suspectId!, act, onExit, t }} />
    </View>
  );
}
