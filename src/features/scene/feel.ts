import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/** Haptic vocabulary of the scene (PLAN §5): fact = light, tool switch = selection, refusal = warning. */
export function makeFeel(enabled: boolean) {
  const on = enabled && Platform.OS !== 'web';
  const run = (p: () => Promise<unknown>) => { if (on) p().catch(() => undefined); };
  return {
    select: () => run(() => Haptics.selectionAsync()),
    light: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
    medium: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
    warning: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
    success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  };
}
export type Feel = ReturnType<typeof makeFeel>;
