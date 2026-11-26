import type { InvestigationView, V2Response } from '../../../shared/api';
import type { Act, ActFailure as SharedFailure } from '../act';
export type { Act };

/** What a successful action resolves to: the server's `{ view, event }`. */
export type ActionResult = V2Response;

/** A refused action: the server's `{ error, code, reason }` (see src/features/act.ts). */
export type ActFailure = SharedFailure;

export type SceneTool = 'torch' | 'uv' | 'dust' | 'camera';

export interface SceneScreenProps {
  view: InvestigationView;
  locationId: string;
  act: Act;
  onExit: () => void;
  t: (key: string) => string;
  /** faint shimmer near the closest unexamined zone after 20 s without progress (default on) */
  idleAssist?: boolean;
  /** haptic feedback on native (default on) */
  haptics?: boolean;
}

export const isFailure = (r: ActionResult | ActFailure | null): r is ActFailure | null => !r || !('view' in r);
