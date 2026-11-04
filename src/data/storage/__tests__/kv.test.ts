import AsyncStorage from '@react-native-async-storage/async-storage';

import { loadFavorites, saveFavorites } from '@/data/storage/favorites';
import { storageKeys } from '@/data/storage/keys';
import { defaultSettings, loadSettings } from '@/data/storage/settings';
import { loadTeam } from '@/data/storage/team';

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

beforeEach(async () => {
  jest.restoreAllMocks();
  await AsyncStorage.clear();
});

describe('reading saved data', () => {
  it('returns what was saved', async () => {
    await saveFavorites([25, 133]);
    await expect(loadFavorites()).resolves.toEqual([25, 133]);
  });

  it('nothing saved → the default', async () => {
    await expect(loadFavorites()).resolves.toEqual([]);
    await expect(loadSettings()).resolves.toEqual(defaultSettings);
  });

  it('corrupt JSON → the default, no crash', async () => {
    await AsyncStorage.setItem(storageKeys.favorites, '{not json');
    await expect(loadFavorites()).resolves.toEqual([]);
  });

  it('valid JSON in the wrong shape → the default', async () => {
    await AsyncStorage.setItem(storageKeys.settings, JSON.stringify({ theme: 'purple' }));
    await expect(loadSettings()).resolves.toEqual(defaultSettings);
  });

  it('a team with more than 6 members → the default', async () => {
    await AsyncStorage.setItem(storageKeys.team, JSON.stringify([1, 2, 3, 4, 5, 6, 7]));
    await expect(loadTeam()).resolves.toEqual([]);
  });

  it('a storage read error → the default', async () => {
    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('disk error'));
    await expect(loadFavorites()).resolves.toEqual([]);
  });
});

describe('saving data', () => {
  it('a storage write error → STORAGE error so the screen can say so', async () => {
    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('disk full'));
    await expect(saveFavorites([1])).rejects.toMatchObject({ code: 'STORAGE' });
  });
});
