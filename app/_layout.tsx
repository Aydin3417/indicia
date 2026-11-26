import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Newsreader_400Regular_Italic, Newsreader_500Medium, Newsreader_600SemiBold } from '@expo-google-fonts/newsreader';
import { IBMPlexSans_400Regular, IBMPlexSans_500Medium, IBMPlexSans_600SemiBold } from '@expo-google-fonts/ibm-plex-sans';
import { IBMPlexMono_400Regular, IBMPlexMono_500Medium } from '@expo-google-fonts/ibm-plex-mono';
import { color } from '../src/theme/tokens';
import { usePrefs } from '../src/state/prefs';
import { useI18n } from '../src/i18n';
import { Toasts } from '../src/components/Toasts';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function Root() {
  const [fontsLoaded, fontError] = useFonts({
    Newsreader_400Regular_Italic, Newsreader_500Medium, Newsreader_600SemiBold,
    IBMPlexSans_400Regular, IBMPlexSans_500Medium, IBMPlexSans_600SemiBold,
    IBMPlexMono_400Regular, IBMPlexMono_500Medium,
  });
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
