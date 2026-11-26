import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { usePrefs } from '../../state/prefs';

export type Feel = 'light' | 'medium' | 'break' | 'warning';

/** Haptic vocabulary of PLAN §5 / CONTRACT §7. Skipped on web and when the player turned haptics off. */
export function feel(kind: Feel) {
  if (Platform.OS === 'web') return;
  try { if (!usePrefs.getState().haptics) return; } catch { /* prefs not ready: still give feedback */ }
  const impact = (s: Haptics.ImpactFeedbackStyle) => Haptics.impactAsync(s).catch(() => undefined);
  switch (kind) {
    case 'light': impact(Haptics.ImpactFeedbackStyle.Light); break;
    case 'medium': impact(Haptics.ImpactFeedbackStyle.Medium); break;
    case 'break':
      impact(Haptics.ImpactFeedbackStyle.Medium);
      setTimeout(() => impact(Haptics.ImpactFeedbackStyle.Medium), 120);
      break;
    case 'warning': Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined); break;
  }
}
