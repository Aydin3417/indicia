import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { Stack, router, useLocalSearchParams, usePathname } from 'expo-router';
import { useDesk } from '../../../src/state/desk';
import { usePrefs } from '../../../src/state/prefs';
import { Button, ErrorState, Loading } from '../../../src/components/ui';
import { FeelOverlay } from '../../../src/feel/FeelOverlay';
import { useT } from '../../../src/i18n';
import { color } from '../../../src/theme/tokens';

/**
 * The v2 investigation desk. Loads the session's InvestigationView, keeps co-op rooms in step, and moves the
 * player when the phase changes under them: a new day (report), the last day ending (prosecutor), the case
 * closing (verdict).
 */
export default function DeskLayout() {
  const t = useT();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const view = useDesk((s) => s.view);
  const error = useDesk((s) => s.error);
  const loaded = useDesk((s) => s.sessionId);
  const load = useDesk((s) => s.load);
  const startSync = useDesk((s) => s.startSync);
  const stopSync = useDesk((s) => s.stopSync);
  const pathname = usePathname();
  const shared = view?.mode === 'coop' && view.status === 'active';

  useEffect(() => { if (sessionId) load(sessionId); }, [sessionId, load]);

  useEffect(() => {
    if (!shared) return;
    startSync();
    return stopSync;
  }, [shared, startSync, stopSync]);

  // first arrival: unread briefing → briefing; investigation over → prosecutor / verdict
  const routed = useRef<string | null>(null);
  useEffect(() => {
    if (!view || view.sessionId !== sessionId || routed.current === sessionId) return;
    const base = `/desk/${sessionId}`;
    const onTabs = !/\/(scene|interview|finale|report|day-end|briefing|room)/.test(pathname);
    if (!onTabs) return; // decided when the player reaches the desk tabs (e.g. after the co-op room)
    routed.current = sessionId;
    // after the last day the player may still be filing: a deep link to the notebook or deductions stays put
    const filing = view.phase === 'awaiting_finale' && /\/(deductions|notebook)$/.test(pathname);
    if (view.phase !== 'investigating' && !filing) router.replace(`${base}/finale`);
    // first arrival on this device: a fresh case, or a shared one someone else already started (co-op guest acts first)
    else if ((view.clock.elapsed === 0 || view.mode === 'coop') && !usePrefs.getState().briefed.includes(sessionId)) router.push(`${base}/briefing`);
  }, [view, sessionId, pathname]);

  // the day or phase moved without our own end-day action (co-op lead, another device): follow it
  const seen = useRef<{ day: number; phase: string } | null>(null);
  useEffect(() => {
    if (!view || view.sessionId !== sessionId) return;
    const prev = seen.current;
    seen.current = { day: view.clock.day, phase: view.phase };
    if (!prev) return;
    const ev = useDesk.getState().event;
    const ownEndDay = ev?.kind === 'end_day' && ev.report?.day === prev.day;
    const base = `/desk/${sessionId}`;
    const dayTurned = view.clock.day > prev.day || (prev.phase === 'investigating' && view.phase === 'awaiting_finale');
    if (dayTurned && !ownEndDay && !pathname.includes('/report')) {
      router.push(`${base}/report?day=${view.reports[view.reports.length - 1]?.day ?? prev.day}&fresh=1`);
    } else if ((view.phase === 'finale' || view.phase === 'closed') && prev.phase !== view.phase && !pathname.includes('/finale')) {
      router.push(`${base}/finale`);
    }
  }, [view, sessionId, pathname]);

  if (error && (!view || loaded !== sessionId)) {
    return (
      // a missing or outdated investigation cannot be retried: say so in the player's language, offer only the way back
      <ErrorState
        message={error.code === 'not_found' ? t('desk.error.notFound') : error.code === 'conflict' ? t('desk.error.edition') : error.message}
        onRetry={error.code === 'not_found' || error.code === 'conflict' ? undefined : () => load(sessionId!)}
      />
    );
  }
  if (!view || view.sessionId !== sessionId) return <Loading label={t('desk.loading')} />;

  return (
    <View style={{ flex: 1, backgroundColor: color.bg }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.bg }, animation: 'slide_from_right' }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="scene/[locationId]" options={{ animation: 'fade' }} />
        <Stack.Screen name="interview/[suspectId]" options={{ animation: 'fade' }} />
        <Stack.Screen name="day-end" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="report" options={{ animation: 'fade' }} />
        <Stack.Screen name="finale" options={{ animation: 'fade' }} />
      </Stack>
      <FeelOverlay />
    </View>
  );
}
