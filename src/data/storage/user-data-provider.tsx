import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import { setHapticsEnabled } from '@/lib/haptics';

import { loadFavorites, saveFavorites } from './favorites';
import { defaultSettings, loadSettings, saveSettings, type Settings } from './settings';
import { loadTeam, saveTeam } from './team';

/**
 * Favorites, team and settings, loaded once at startup and shared through
 * context (ARCHITECTURE.md §9). Setters update the screen right away and
 * write in the background. If the write fails, the old value comes back and
 * the promise rejects with `AppError('STORAGE')` so the caller can say so.
 */
type UserData = {
  ready: boolean;
  settings: Settings;
  favorites: number[];
  team: number[];
  setSettings: (next: Settings) => Promise<void>;
  setFavorites: (next: number[]) => Promise<void>;
  setTeam: (next: number[]) => Promise<void>;
};

const UserDataContext = createContext<UserData | null>(null);

function useOptimistic<T>(initial: T, save: (value: T) => Promise<void>) {
  const [value, setValue] = useState(initial);
  const latest = useRef(initial);

  const set = async (next: T) => {
    const previous = latest.current;
    latest.current = next;
    setValue(next);
    try {
      await save(next);
    } catch (error) {
      // Only roll back if nothing newer was set while this write was running.
      if (latest.current === next) {
        latest.current = previous;
        setValue(previous);
      }
      throw error;
    }
  };

  const hydrate = (loaded: T) => {
    latest.current = loaded;
    setValue(loaded);
  };

  return [value, set, hydrate] as const;
}

export function UserDataProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [settings, setSettings, hydrateSettings] = useOptimistic(defaultSettings, saveSettings);
  const [favorites, setFavorites, hydrateFavorites] = useOptimistic<number[]>([], saveFavorites);
  const [team, setTeam, hydrateTeam] = useOptimistic<number[]>([], saveTeam);

  useEffect(() => {
    let cancelled = false;
    // Each loader returns a safe fallback instead of throwing, so this always finishes.
    Promise.all([loadSettings(), loadFavorites(), loadTeam()]).then(([s, f, t]) => {
      if (cancelled) return;
      hydrateSettings(s);
      hydrateFavorites(f);
      hydrateTeam(t);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
    // Runs once on mount; the hydrate functions only touch refs and state setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setHapticsEnabled(settings.hapticsEnabled);
  }, [settings.hapticsEnabled]);

  return (
    <UserDataContext.Provider
      value={{ ready, settings, favorites, team, setSettings, setFavorites, setTeam }}>
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData(): UserData {
  const value = useContext(UserDataContext);
  if (!value) {
    throw new Error('useUserData() must be used inside <UserDataProvider>');
  }
  return value;
}

export function useSettings() {
  const { settings, setSettings } = useUserData();
  return [settings, setSettings] as const;
}
