import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ErrorState, Loading } from '../../src/components/ui';
import { api, ApiFailure } from '../../src/api/client';
import { usePrefs } from '../../src/state/prefs';
import { useT } from '../../src/i18n';

/** Invitation links land here: indicia://join/ABC234 or https://…/join/ABC234 */
export default function JoinByLink() {
  const t = useT();
  const { code } = useLocalSearchParams<{ code: string }>();
  const setPrefs = usePrefs((s) => s.set);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { sessionId } = await api.join(code ?? '');
        // an invited friend skips the tutorial; it stays in the case library
        setPrefs({ onboarded: true });
        if (alive) router.replace(`/desk/${sessionId}/room`);
      } catch (e) {
        if (alive) setError(e instanceof ApiFailure ? e.message : t('join.failed'));
      }
    })();
    return () => { alive = false; };
  }, [code, setPrefs, t]);

  if (error) return <ErrorState message={error} />;
  return <Loading label={t('join.joining', { code: code ?? '' })} />;
}
