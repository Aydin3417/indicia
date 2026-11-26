// The one `act` contract every feature screen uses (interview, scene, deduction, notebook, finale).
//
//   act(path, body?) → { view, event }            the action went through
//                    → { error, code, reason }    the server refused it (ApiError, localised `error`)
//                    → null                       nothing to show (no session)
//
// `path` is relative to /sessions/:id/v2, with or without a leading slash. Refusals never cost time; after
// one the desk store refetches the view, so the screen re-renders with the truth (e.g. a co-op partner
// closed the interview). A network failure arrives as { error, code: 'server' }.
import type { ApiError, V2Response } from '../../shared/api';

export type ActFailure = ApiError;
export type ActResult = V2Response | ActFailure;
export type Act = (path: string, body?: unknown) => Promise<ActResult | null>;

export const isOk = (r: ActResult | null | undefined): r is V2Response => !!r && typeof r === 'object' && 'view' in r && 'event' in r;
export const isFailure = (r: ActResult | null | undefined): r is ActFailure => !!r && typeof r === 'object' && 'error' in r && !('view' in r);
export const failureText = (r: ActResult | null | undefined): string | undefined => (isFailure(r) ? r.error : undefined);
