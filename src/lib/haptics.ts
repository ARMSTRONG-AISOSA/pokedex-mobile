import * as Haptics from 'expo-haptics';

import { logger } from '@/lib/logger';

/** The four haptic cues from DESIGN.md §9. */
export type HapticKind = 'selection' | 'light' | 'medium' | 'success';

let enabled = true;

/** Kept in sync with `settings.hapticsEnabled` by the user data provider. */
export function setHapticsEnabled(value: boolean) {
  enabled = value;
}

function run(kind: HapticKind): Promise<void> {
  switch (kind) {
    case 'selection':
      return Haptics.selectionAsync();
    case 'light':
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    case 'medium':
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    case 'success':
      return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
}

/** Fire and forget. A missing vibration motor must never break a tap. */
export function haptic(kind: HapticKind) {
  if (!enabled) return;
  run(kind).catch((error: unknown) => logger.warn('Haptic failed', { kind, error }));
}
