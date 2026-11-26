import { useDesk } from '../../../../src/state/desk';
import { Feature } from '../../../../src/features/desk/mount';
import { useFeatureAct, useFeatureT } from '../../../../src/features/desk/FeatureProps';

/** Notebook tab → src/features/notebook Notebook({ view, act, t }). */
export default function NotebookTab() {
  const view = useDesk((s) => s.view)!;
  const t = useFeatureT();
  const act = useFeatureAct({ haptics: false, toastFinds: true });
  return <Feature feature="notebook" exportName="Notebook" props={{ view, act, t, mode: 'browse' as const }} />;
}
