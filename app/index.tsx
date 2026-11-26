import { Redirect } from 'expo-router';
import { usePrefs } from '../src/state/prefs';

/** First launch goes straight into the tutorial case (app/onboarding.tsx starts it); afterwards, headquarters. */
export default function Index() {
  const onboarded = usePrefs((s) => s.onboarded);
  return <Redirect href={onboarded ? '/hq' : '/onboarding'} />;
}
