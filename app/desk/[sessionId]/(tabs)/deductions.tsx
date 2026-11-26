import { useDesk } from '../../../../src/state/desk';
import { Feature } from '../../../../src/features/desk/mount';
import { useFeatureAct, useFeatureT } from '../../../../src/features/desk/FeatureProps';
import { View } from 'react-native';
import { DraftPanel } from '../../../../src/features/coop';

/** Deductions tab → src/features/deduction DeductionBook({ view, act, t }). */
export default function DeductionsTab() {
  const view = useDesk((s) => s.view)!;
  const t = useFeatureT();
  const act = useFeatureAct({ haptics: false, toastFinds: true });
  const book = <Feature feature="deduction" exportName="DeductionBook" props={{ view, act, t }} />;
  // co-op (wave 5): the team's pencilled-in drafts and suggestions sit above the book, folded by default
  if (!view.team) return book;
  return (
    <View style={{ flex: 1 }}>
      <DraftPanel view={view} />
      <View style={{ flex: 1 }}>{book}</View>
    </View>
  );
}
