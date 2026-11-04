import {
  formatMultiplier,
  matchupsFor,
  multiplier,
  singleMultiplier,
  teamWeakSpots,
} from '@/domain/typeChart';
import { TYPE_NAMES, type TypeName } from '@/domain/types';

import pokeapi from './fixtures/pokeapi-type-relations.json';

describe('type chart matches PokéAPI', () => {
  const relations = pokeapi.relations as Record<TypeName, Record<'2' | '0.5' | '0', TypeName[]>>;

  it.each(TYPE_NAMES)('%s attacking every type', (attack) => {
    for (const defender of TYPE_NAMES) {
      const rel = relations[attack];
      const expected = rel['2'].includes(defender)
        ? 2
        : rel['0.5'].includes(defender)
          ? 0.5
          : rel['0'].includes(defender)
            ? 0
            : 1;
      expect({ attack, defender, m: singleMultiplier(attack, defender) }).toEqual({
        attack,
        defender,
        m: expected,
      });
    }
  });
});

describe('multiplier for dual types (hand-checked)', () => {
  it('Charizard (fire/flying): 4× Rock, 2× Water and Electric, immune to Ground', () => {
    const charizard: TypeName[] = ['fire', 'flying'];
    expect(multiplier('rock', charizard)).toBe(4);
    expect(multiplier('water', charizard)).toBe(2);
    expect(multiplier('electric', charizard)).toBe(2);
    expect(multiplier('ground', charizard)).toBe(0);
    expect(multiplier('grass', charizard)).toBe(0.25);
    expect(multiplier('bug', charizard)).toBe(0.25);
    expect(multiplier('ice', charizard)).toBe(1);
  });

  it('Umbreon (dark): immune to Psychic', () => {
    expect(multiplier('psychic', ['dark'])).toBe(0);
  });

  it('Eevee (normal): 2× Fighting, immune to Ghost', () => {
    expect(multiplier('fighting', ['normal'])).toBe(2);
    expect(multiplier('ghost', ['normal'])).toBe(0);
  });

  it('Gyarados (water/flying): 4× Electric, immune to Ground', () => {
    expect(multiplier('electric', ['water', 'flying'])).toBe(4);
    expect(multiplier('ground', ['water', 'flying'])).toBe(0);
  });
});

describe('matchupsFor', () => {
  it('groups and orders Charizard’s matchups', () => {
    const m = matchupsFor(['fire', 'flying']);
    expect(m.weakTo).toEqual([
      { type: 'rock', multiplier: 4 },
      { type: 'water', multiplier: 2 },
      { type: 'electric', multiplier: 2 },
    ]);
    expect(m.resists.slice(0, 2)).toEqual([
      { type: 'grass', multiplier: 0.25 },
      { type: 'bug', multiplier: 0.25 },
    ]);
    expect(m.resists.map((x) => x.type).sort()).toEqual(
      ['bug', 'fairy', 'fighting', 'fire', 'grass', 'steel'].sort(),
    );
    expect(m.immuneTo).toEqual([{ type: 'ground', multiplier: 0 }]);
  });

  it('Bulbasaur (grass/poison) is weak to Fire, Ice, Flying and Psychic', () => {
    expect(matchupsFor(['grass', 'poison']).weakTo.map((x) => x.type)).toEqual([
      'fire',
      'ice',
      'flying',
      'psychic',
    ]);
  });

  it('a type with no immunities has an empty immune list', () => {
    expect(matchupsFor(['fire']).immuneTo).toEqual([]);
  });
});

describe('formatMultiplier', () => {
  it.each([
    [4, '4×'],
    [2, '2×'],
    [0.5, '½×'],
    [0.25, '¼×'],
    [0, '0×'],
  ])('%p → %p', (value, label) => {
    expect(formatMultiplier(value)).toBe(label);
  });
});

describe('teamWeakSpots', () => {
  const team: TypeName[][] = [
    ['fire', 'flying'], // Charizard
    ['grass', 'poison'], // Bulbasaur
  ];
  const row = (attack: TypeName) => teamWeakSpots(team).find((r) => r.attack === attack);

  it('has one row per attack type', () => {
    expect(teamWeakSpots(team)).toHaveLength(18);
  });

  it('flags a type when more members are weak than resist', () => {
    expect(row('rock')).toEqual({ attack: 'rock', weak: 1, resist: 0, needsCover: true });
    expect(row('ice')).toEqual({ attack: 'ice', weak: 1, resist: 0, needsCover: true });
  });

  it('does not flag a tie', () => {
    expect(row('fire')).toEqual({ attack: 'fire', weak: 1, resist: 1, needsCover: false });
  });

  it('counts an immunity as a resist', () => {
    expect(row('ground')).toEqual({ attack: 'ground', weak: 0, resist: 1, needsCover: false });
  });

  it('an empty team has no weak spots', () => {
    expect(teamWeakSpots([]).some((r) => r.needsCover)).toBe(false);
  });
});
