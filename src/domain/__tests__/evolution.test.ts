import {
  buildEvolutionTree,
  evolutionLabel,
  evolutionNote,
  familySize,
  idFromUrl,
  pickDetail,
  stageCount,
  type ChainLinkInput,
} from '@/domain/evolution';
import type { EvolutionNode } from '@/domain/types';

import charmanderChain from './fixtures/evolution-chain-charmander.json';
import eeveeChain from './fixtures/evolution-chain-eevee.json';
import pichuChain from './fixtures/evolution-chain-pichu.json';
import taurosChain from './fixtures/evolution-chain-tauros.json';

/** Real PokéAPI responses saved on 2026-11-04. */
const tree = (fixture: { chain: unknown }) => buildEvolutionTree(fixture.chain as ChainLinkInput);

/** Compact view of a tree: [name, via, children]. */
type Shape = [string, string, Shape[]];
const shape = (node: EvolutionNode): Shape => [node.speciesName, node.via, node.children.map(shape)];

describe('buildEvolutionTree', () => {
  it('Charmander: three stages in a line', () => {
    const root = tree(charmanderChain);
    expect(shape(root)).toEqual([
      'charmander',
      '',
      [['charmeleon', 'Level 16', [['charizard', 'Level 36', []]]]],
    ]);
    expect(root.id).toBe(4);
    expect(stageCount(root)).toBe(3);
  });

  it('Pichu: starts with a baby Pokémon', () => {
    const root = tree(pichuChain);
    expect(root.isBaby).toBe(true);
    expect(root.id).toBe(172);
    expect(shape(root)).toEqual([
      'pichu',
      '',
      [['pikachu', 'Friendship', [['raichu', 'Thunder Stone', []]]]],
    ]);
  });

  it('Eevee: eight branches in API order, using each default method', () => {
    const root = tree(eeveeChain);
    expect(root.children.map((c) => [c.speciesName, c.via])).toEqual([
      ['vaporeon', 'Water Stone'],
      ['jolteon', 'Thunder Stone'],
      ['flareon', 'Fire Stone'],
      ['espeon', 'Friendship, daytime'],
      ['umbreon', 'Friendship, night'],
      // The first API entry for these is an old location method; the default is the stone.
      ['leafeon', 'Leaf Stone'],
      ['glaceon', 'Ice Stone'],
      ['sylveon', 'Friendship, Fairy move'],
    ]);
    expect(stageCount(root)).toBe(2);
    expect(familySize(root)).toBe(9);
  });

  it('Tauros: does not evolve', () => {
    const root = tree(taurosChain);
    expect(shape(root)).toEqual(['tauros', '', []]);
    expect(stageCount(root)).toBe(1);
  });
});

describe('evolutionNote', () => {
  it('a straight line counts stages', () => {
    expect(evolutionNote(tree(charmanderChain), 5)).toBe('3 stages. Tap any Pokémon to open it.');
  });

  it('the Pokémon that branches says how many it can become', () => {
    expect(evolutionNote(tree(eeveeChain), 133)).toBe(
      'Eevee can become 8 different Pokémon. Tap one to open it.',
    );
  });

  it('a branch member names the family', () => {
    expect(evolutionNote(tree(eeveeChain), 197)).toBe(
      'Part of the Eevee family. Tap any Pokémon to open it.',
    );
  });

  it('a Pokémon with no evolutions says so', () => {
    expect(evolutionNote(tree(taurosChain), 128)).toBe('Tauros does not evolve.');
  });
});

describe('evolutionLabel', () => {
  const t = (name: string) => ({ name });

  it.each([
    [{ trigger: t('level-up'), min_level: 16 }, 'Level 16'],
    [{ trigger: t('use-item'), item: t('water-stone') }, 'Water Stone'],
    [{ trigger: t('level-up'), min_happiness: 220 }, 'Friendship'],
    [{ trigger: t('level-up'), min_happiness: 160, time_of_day: 'night' }, 'Friendship, night'],
    [{ trigger: t('trade') }, 'Trade'],
    [{ trigger: t('trade'), held_item: t('metal-coat') }, 'Trade holding Metal Coat'],
    [{ trigger: t('level-up'), known_move: t('ancient-power') }, 'Learn Ancient Power'],
    [{ trigger: t('level-up'), held_item: t('razor-fang'), time_of_day: 'night' }, 'Holding Razor Fang, night'],
    [{ trigger: t('level-up'), min_level: 20, relative_physical_stats: 1 }, 'Level 20, Attack > Defense'],
    [{ trigger: t('level-up'), min_level: 20, gender: 1 }, 'Level 20, female'],
    [{ trigger: t('trade'), trade_species: t('shelmet') }, 'Trade for Shelmet'],
    [{ trigger: t('level-up'), min_affection: 2 }, 'Affection'],
    [{ trigger: t('level-up'), min_beauty: 171 }, 'Beauty'],
    [{ trigger: t('level-up'), location: t('mt-coronet') }, 'Level up at Mt Coronet'],
    [{ trigger: t('level-up'), min_level: 50, needs_overworld_rain: true }, 'Level 50, in rain'],
    [{ trigger: t('level-up'), min_level: 30, turn_upside_down: true }, 'Level 30, upside down'],
    [{ trigger: t('level-up'), party_species: t('remoraid') }, 'With Remoraid'],
    [{ trigger: t('level-up'), min_level: 12, party_type: t('dark') }, 'Level 12, with a Dark type'],
    [{ trigger: t('level-up'), min_level: 20, relative_physical_stats: -1 }, 'Level 20, Attack < Defense'],
    [{ trigger: t('level-up'), min_level: 20, relative_physical_stats: 0 }, 'Level 20, Attack = Defense'],
    [{ trigger: t('use-item'), item: t('dawn-stone'), gender: 2 }, 'Dawn Stone, male'],
    [{ trigger: t('level-up'), min_level: 33, known_move: t('mimic') }, 'Level 33, knows Mimic'],
    [{ trigger: t('level-up') }, 'Level up'],
    [{ trigger: t('shed') }, 'Shed'],
    [{}, 'Special'],
  ])('%j → %p', (detail, label) => {
    expect(evolutionLabel(detail)).toBe(label);
  });

  it('never returns an empty label', () => {
    expect(evolutionLabel(undefined)).toBe('Special');
  });
});

describe('pickDetail', () => {
  it('prefers the entry marked is_default', () => {
    const a = { min_level: 1 };
    const b = { min_level: 2, is_default: true };
    expect(pickDetail([a, b])).toBe(b);
  });

  it('falls back to the first entry', () => {
    const a = { min_level: 1 };
    expect(pickDetail([a, { min_level: 2 }])).toBe(a);
    expect(pickDetail([])).toBeUndefined();
  });
});

describe('idFromUrl', () => {
  it('reads the trailing id with or without a slash', () => {
    expect(idFromUrl('https://pokeapi.co/api/v2/pokemon-species/25/')).toBe(25);
    expect(idFromUrl('https://pokeapi.co/api/v2/pokemon-species/133')).toBe(133);
  });

  it('throws on a URL without an id', () => {
    expect(() => idFromUrl('https://pokeapi.co/api/v2/pokemon-species/')).toThrow();
  });
});
