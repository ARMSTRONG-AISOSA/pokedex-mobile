import { z } from 'zod';

import { storageKeys } from './keys';
import { readJson, writeJson } from './kv';

export const settingsSchema = z.object({
  theme: z.enum(['system', 'light', 'dark']),
  sort: z.object({
    key: z.enum(['number', 'name', 'power']),
    asc: z.boolean(),
  }),
  hapticsEnabled: z.boolean(),
});

export type Settings = z.infer<typeof settingsSchema>;
export type ThemePreference = Settings['theme'];
export type SortKey = Settings['sort']['key'];

export const defaultSettings: Settings = {
  theme: 'system',
  sort: { key: 'number', asc: true },
  hapticsEnabled: true,
};

export function loadSettings(): Promise<Settings> {
  return readJson(storageKeys.settings, settingsSchema, defaultSettings);
}

export function saveSettings(settings: Settings): Promise<void> {
  return writeJson(storageKeys.settings, settings);
}
