import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDesk } from '../../../src/state/desk';
import { useHq } from '../../../src/state/hq';
import { Feature } from '../../../src/features/desk/mount';
import { useFeatureAct, useFeatureT } from '../../../src/features/desk/FeatureProps';
import { Paper, PaperText } from '../../../src/components/ui';
import { color, space } from '../../../src/theme/tokens';
import { FinaleTeam } from '../../../src/features/coop';

/**
 * The prosecutor's meeting, the confrontation and the verdict → src/features/finale FinaleScreen({ view, act, onDone, t }).
 * Reached from the strip's gavel (early), forced after the last day's report, and on reopening a closed case.
 */
export default function FinaleMode() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const view = useDesk((s) => s.view)!;
  const t = useFeatureT();
  const act = useFeatureAct({ haptics: false, toastFinds: false });
  const inset = useSafeAreaInsets();
  const onDone = () => {
    const v = useDesk.getState().view;
    if (v?.phase === 'closed') {
      useHq.getState().refresh();
      router.replace('/hq');
    } else if (v?.phase === 'awaiting_finale') {
      // after the last day: back to the desk to collect overnight results and file deductions
      router.replace(`/desk/${sessionId}/deductions`);
    } else if (router.canGoBack()) router.back();
    else router.replace(`/desk/${sessionId}`);
  };
  return (
    <View style={{ flex: 1, backgroundColor: color.bg, paddingTop: inset.top }}>
      <Feature
        feature="finale"
        exportName="FinaleScreen"
        onBack={onDone}
        props={{ view, act, onDone, t }}
        fallback={<Paper style={{ marginTop: space.lg, maxWidth: 340 }}><PaperText>{view.finaleIntro}</PaperText></Paper>}
      />
      {/* co-op (wave 5): teammates' suggestions for the round (lead) / suggest a chip (others) */}
      <FinaleTeam view={view} />
    </View>
  );
}
