import { displayName, formatDexNumber } from '@/domain/names';
import { defaultAscending, filterPokemon, matchesQuery, sortPokemon } from '@/domain/sorting';
import { isTypeName, statTotal, type Pokemon, type Stats } from '@/domain/types';

describe('types helpers', () => {
  it('isTypeName accepts the 18 types only', () => {
    expect(isTypeName('fairy')).toBe(true);
    expect(isTypeName('shadow')).toBe(false);
  });

  it('statTotal adds all six stats (Pikachu = 320)', () => {
    expect(statTotal({ hp: 35, attack: 55, defense: 40, spAtk: 50, spDef: 50, speed: 90 })).toBe(320);
  });
});

const stats = (total: number): Stats => ({
  hp: total,
  attack: 0,
  defense: 0,
  spAtk: 0,
  spDef: 0,
  speed: 0,
});

const mon = (id: number, name: string, total: number): Pokemon => ({
  id,
  name,
  types: ['normal'],
  stats: stats(total),
  artworkUrl: null,
  artworkShinyUrl: null,
});

const list = [
  mon(25, 'pikachu', 320),
  mon(4, 'charmander', 309),
  mon(1, 'bulbasaur', 318),
  mon(133, 'eevee', 325),
  mon(122, 'mr-mime', 460),
  mon(150, 'mewtwo', 680),
  mon(26, 'raichu', 320), // ties Pikachu on power
];
const ids = (l: Pokemon[]) => l.map((p) => p.id);

describe('sortPokemon', () => {
  it('by number, low to high', () => {
    expect(ids(sortPokemon(list, 'number', true))).toEqual([1, 4, 25, 26, 122, 133, 150]);
  });

  it('by name uses the display name ("Mr. Mime")', () => {
    expect(ids(sortPokemon(list, 'name', true))).toEqual([1, 4, 133, 150, 122, 25, 26]);
  });

  it('by power, high to low, ties by number', () => {
    expect(ids(sortPokemon(list, 'power', false))).toEqual([150, 122, 133, 25, 26, 1, 4]);
  });

  it('does not change the input array', () => {
    const copy = [...list];
    sortPokemon(list, 'name', false);
    expect(list).toEqual(copy);
  });

  it('Power starts high to low; Number and Name start low to high', () => {
    expect(defaultAscending('power')).toBe(false);
    expect(defaultAscending('number')).toBe(true);
    expect(defaultAscending('name')).toBe(true);
  });
});

describe('matchesQuery', () => {
  const pikachu = { id: 25, name: 'pikachu' };

  it.each(['#25', '25', '025', 'pika', 'PIKA', '  pikachu  ', ''])('"%s" finds Pikachu', (q) => {
    expect(matchesQuery(pikachu, q)).toBe(true);
  });

  it.each(['2', '#250', 'raichu'])('"%s" does not find Pikachu', (q) => {
    expect(matchesQuery(pikachu, q)).toBe(false);
  });

  it('matches names written with spaces or punctuation', () => {
    const mrMime = { id: 122, name: 'mr-mime' };
    expect(matchesQuery(mrMime, 'mr mime')).toBe(true);
    expect(matchesQuery(mrMime, 'mr. mime')).toBe(true);
  });
});

describe('names', () => {
  it.each([
    ['bulbasaur', 'Bulbasaur'],
    ['mr-mime', 'Mr. Mime'],
    ['nidoran-f', 'Nidoran♀'],
    ['farfetchd', 'Farfetch’d'],
    ['tapu-koko', 'Tapu Koko'],
  ])('%s → %s', (slug, name) => {
    expect(displayName(slug)).toBe(name);
  });

  it('pads dex numbers to three digits', () => {
    expect(formatDexNumber(25)).toBe('#025');
    expect(formatDexNumber(1025)).toBe('#1025');
  });
});

describe('filterPokemon', () => {
  const dex = [
    { ...mon(1, 'bulbasaur', 318), types: ['grass', 'poison'] as Pokemon['types'] },
    { ...mon(4, 'charmander', 309), types: ['fire'] as Pokemon['types'] },
    { ...mon(6, 'charizard', 534), types: ['fire', 'flying'] as Pokemon['types'] },
  ];

  it('"all" with no search keeps everything', () => {
    expect(ids(filterPokemon(dex, { type: 'all', query: '' }))).toEqual([1, 4, 6]);
  });

  it('filters by either type slot', () => {
    expect(ids(filterPokemon(dex, { type: 'fire', query: '' }))).toEqual([4, 6]);
    expect(ids(filterPokemon(dex, { type: 'poison', query: '' }))).toEqual([1]);
  });

  it('combines type and search', () => {
    expect(ids(filterPokemon(dex, { type: 'fire', query: 'char' }))).toEqual([4, 6]);
    expect(ids(filterPokemon(dex, { type: 'fire', query: 'zard' }))).toEqual([6]);
    expect(ids(filterPokemon(dex, { type: 'grass', query: 'char' }))).toEqual([]);
  });
});
