import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { color } from '../src/theme/tokens';
import { usePrefs } from '../src/state/prefs';
import { useI18n } from '../src/i18n';
import { Toasts } from '../src/components/Toasts';

// Wave 7: Latin + Turkish subsets of the @expo-google-fonts files (scripts/subset-fonts.py, `npm run fonts`), same
// family names. 648 → 326 KB gzipped on the web first screen; characters outside the subset fall back to system fonts.
/* eslint-disable @typescript-eslint/no-require-imports */
const FONTS = {
  Newsreader_400Regular_Italic: require('../assets/fonts/Newsreader_400Regular_Italic.ttf'),
  Newsreader_500Medium: require('../assets/fonts/Newsreader_500Medium.ttf'),
  Newsreader_600SemiBold: require('../assets/fonts/Newsreader_600SemiBold.ttf'),
  IBMPlexSans_400Regular: require('../assets/fonts/IBMPlexSans_400Regular.ttf'),
  IBMPlexSans_500Medium: require('../assets/fonts/IBMPlexSans_500Medium.ttf'),
  IBMPlexSans_600SemiBold: require('../assets/fonts/IBMPlexSans_600SemiBold.ttf'),
  IBMPlexMono_400Regular: require('../assets/fonts/IBMPlexMono_400Regular.ttf'),
  IBMPlexMono_500Medium: require('../assets/fonts/IBMPlexMono_500Medium.ttf'),
};
/* eslint-enable @typescript-eslint/no-require-imports */

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function Root() {
  const [fontsLoaded, fontError] = useFonts(FONTS);
  const ready = usePrefs((s) => s.ready);
  const hydrate = usePrefs((s) => s.hydrate);
  const hydrateI18n = useI18n((s) => s.hydrate);
  const [langReady, setLangReady] = useState(false);

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => { hydrateI18n().finally(() => setLangReady(true)); }, [hydrateI18n]);
  const loaded = (fontsLoaded || !!fontError) && ready && langReady;
  useEffect(() => { if (loaded) SplashScreen.hideAsync().catch(() => undefined); }, [loaded]);

  if (!loaded) return <View style={{ flex: 1, backgroundColor: color.bg }} />;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: color.bg }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.bg }, animation: 'fade' }} />
        <Toasts />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
