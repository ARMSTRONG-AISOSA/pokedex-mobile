import { toPokemon } from '@/data/api/pokeapi';
import { evolutionChainSchema, pokemonSchema } from '@/data/api/schemas';
import { buildEvolutionTree } from '@/domain/evolution';

import eeveeChain from '@/domain/__tests__/fixtures/evolution-chain-eevee.json';
import pecharunt from './fixtures/pokemon-1025.json';
import pikachu from './fixtures/pokemon-25.json';
import charizard from './fixtures/pokemon-6.json';

/** Saved real responses from PokéAPI (2026-11-04), trimmed to the fields we read. */

describe('pokemonSchema + toPokemon', () => {
  it('maps Pikachu', () => {
    expect(toPokemon(pokemonSchema.parse(pikachu))).toEqual({
      id: 25,
      name: 'pikachu',
      types: ['electric'],
      stats: { hp: 35, attack: 55, defense: 40, spAtk: 50, spDef: 50, speed: 90 },
      artworkUrl:
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
      artworkShinyUrl:
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/25.png',
    });
  });

  it('keeps type order for dual types (Charizard: fire, flying)', () => {
    expect(toPokemon(pokemonSchema.parse(charizard)).types).toEqual(['fire', 'flying']);
  });

  it('maps the newest species (Pecharunt, #1025)', () => {
    const p = toPokemon(pokemonSchema.parse(pecharunt));
    expect(p.types).toEqual(['poison', 'ghost']);
    expect(p.stats.defense).toBe(160);
  });

  it('uses the species name, not the form name', () => {
    const giratina = {
      ...pikachu,
      id: 487,
      name: 'giratina-altered',
      species: { name: 'giratina', url: 'https://pokeapi.co/api/v2/pokemon-species/487/' },
    };
    expect(toPokemon(pokemonSchema.parse(giratina)).name).toBe('giratina');
  });

  it('missing artwork becomes null', () => {
    const noArt = { ...pikachu, sprites: { other: {} } };
    const p = toPokemon(pokemonSchema.parse(noArt));
    expect(p.artworkUrl).toBeNull();
    expect(p.artworkShinyUrl).toBeNull();
  });

  it('throws PARSE when a stat is missing', () => {
    const broken = { ...pikachu, stats: pikachu.stats.slice(1) };
    expect(() => toPokemon(pokemonSchema.parse(broken))).toThrow(
      expect.objectContaining({ code: 'PARSE' }),
    );
  });

  it('ignores unknown types, but throws PARSE if none are left', () => {
    const odd = { ...pikachu, types: [{ slot: 1, type: { name: 'stellar', url: '' } }] };
    expect(() => toPokemon(pokemonSchema.parse(odd))).toThrow(expect.objectContaining({ code: 'PARSE' }));
  });

  it('rejects a response with no types', () => {
    expect(pokemonSchema.safeParse({ ...pikachu, types: [] }).success).toBe(false);
  });
});

describe('evolutionChainSchema', () => {
  it('accepts a real chain and the result builds a tree', () => {
    const parsed = evolutionChainSchema.parse(eeveeChain);
    expect(buildEvolutionTree(parsed.chain).children).toHaveLength(8);
  });

  it('rejects a chain with a missing species', () => {
    expect(evolutionChainSchema.safeParse({ id: 1, chain: { evolves_to: [] } }).success).toBe(false);
  });
});
