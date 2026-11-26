import { useCallback, useState } from 'react';
import type { V2Response } from '../../../shared/api';
import { useDesk } from '../../state/desk';

/** Runs shell actions through the desk store, remembering which button is busy. Refusals are toasted by the store. */
export function useAction() {
  const act = useDesk((s) => s.act);
  const [pending, setPending] = useState<string | null>(null);
  const run = useCallback(async (key: string, path: string, body?: unknown): Promise<V2Response | null> => {
    setPending(key);
    try {
      return await act(path, body);
    } finally {
      setPending((p) => (p === key ? null : p));
    }
  }, [act]);
  return { run, pending };
}
