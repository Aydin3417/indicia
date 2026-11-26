import type { InvestigationView } from '../../../shared/api';
import type { Act, ActFailure, ActResult } from '../act';

export type { Act } from '../act';
export { isFailure } from '../act';
/** A refused action: the server's `{ error, code, reason }` (see src/features/act.ts). */
export type ActionFailure = ActFailure;
export type ActionResult = ActResult;

export interface InterviewScreenProps {
  view: InvestigationView;
  suspectId: string;
  act: Act;
  onExit: () => void;
  t: (key: string) => string;
}
