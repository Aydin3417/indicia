import type { ChipType, ChipView, InvestigationView, V2Event, V2Response } from '../../../shared/api';

import type { Act, ActFailure, ActResult } from '../act';

export type { Act } from '../act';
export { isOk, failureText } from '../act';
/** A refused action: the server's `{ error, code, reason }` (see src/features/act.ts). */
export type ActionFailure = ActFailure;
export type ActionResult = ActResult;

export type Translate = (key: string) => string;

export interface DeductionBookProps {
  view: InvestigationView;
  act: Act;
  t: Translate;
  /** optional: open a specific question first */
  initialDeductionId?: string;
  /** optional: called after every action with the event (the shell may want to tick the clock / toast) */
  onEvent?: (event: V2Event) => void;
}

export type { ChipType, ChipView, InvestigationView, V2Event, V2Response };
