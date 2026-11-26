// SERVER-ONLY. The refusal every engine action throws. The player actions live in ./v2/actions.ts.

export type ActionErrorCode = 'bad_request' | 'locked' | 'conflict' | 'not_found';

/** A refused action: costs nothing, becomes an HTTP 4xx `{ error, code, reason }`. */
export class ActionError extends Error {
  constructor(message: string, public code: ActionErrorCode = 'bad_request', public reason?: string) {
    super(message);
  }
}
