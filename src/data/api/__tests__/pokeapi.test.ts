import { artworkUrls, fetchSummary, toAbout, toPokemon } from '@/data/api/pokeapi';
import { evolutionChainSchema, pokemonSchema } from '@/data/api/schemas';
import { buildEvolutionTree } from '@/domain/evolution';

import eeveeChain from '@/domain/__tests__/fixtures/evolution-chain-eevee.json';
import graphqlAbout1 from './fixtures/graphql-about-1.json';
import graphqlAbout172 from './fixtures/graphql-about-172.json';
import graphqlSummary from './fixtures/graphql-summary.json';
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

describe('fetchSummary (GraphQL)', () => {
  const realFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  const reply = (body: unknown) => {
    globalThis.fetch = jest.fn(async () => ({ ok: true, status: 200, json: async () => body })) as unknown as typeof fetch;
  };

  it('maps a real response, using species names and built artwork URLs', async () => {
    reply(graphqlSummary);
    const list = await fetchSummary();
    expect(list.map((p) => p.name)).toEqual(['bulbasaur', 'charizard', 'pikachu', 'giratina', 'pecharunt']);
    expect(list[1]).toMatchObject({ id: 6, types: ['fire', 'flying'] });
    expect(list[2].stats).toEqual({ hp: 35, attack: 55, defense: 40, spAtk: 50, spDef: 50, speed: 90 });
    expect(list[2].artworkUrl).toBe(artworkUrls(25).artworkUrl);
    expect(artworkUrls(25).artworkUrl).toBe(pikachu.sprites.other['official-artwork'].front_default);
    expect(artworkUrls(25).artworkShinyUrl).toBe(pikachu.sprites.other['official-artwork'].front_shiny);
  });

  it('a GraphQL error (sent with HTTP 200) → SERVER, retryable', async () => {
    reply({ errors: [{ message: 'rate limit' }] });
    await expect(fetchSummary()).rejects.toMatchObject({ code: 'SERVER', retryable: true });
  });

  it('an empty list → PARSE', async () => {
    reply({ data: { pokemon: [] } });
    await expect(fetchSummary()).rejects.toMatchObject({ code: 'PARSE' });
  });
});

describe('toAbout (GraphQL)', () => {
  it('maps Bulbasaur: units converted, text cleaned, hidden ability marked', () => {
    expect(toAbout(graphqlAbout1)).toEqual({
      genus: 'Seed Pokémon',
      flavorText:
        'While it is young, it uses the nutrients that are stored in the seed on its back in order to grow.',
      generation: 'I',
      isBaby: false,
      heightM: 0.7,
      weightKg: 6.9,
      abilities: [
        { name: 'Overgrow', hidden: false },
        { name: 'Chlorophyll', hidden: true },
      ],
    });
  });

  it('marks Pichu as a baby from Generation II', () => {
    const about = toAbout(graphqlAbout172);
    expect(about).toMatchObject({ isBaby: true, generation: 'II', genus: 'Tiny Mouse Pokémon' });
    expect(about.abilities.map((a) => a.name)).toEqual(['Static', 'Lightning Rod']);
  });

  it('an unknown id → NOT_FOUND', () => {
    expect(() => toAbout({ data: { species: [] } })).toThrow(expect.objectContaining({ code: 'NOT_FOUND' }));
  });

  it('a GraphQL error → SERVER, retryable', () => {
    expect(() => toAbout({ errors: [{ message: 'boom' }] })).toThrow(
      expect.objectContaining({ code: 'SERVER', retryable: true }),
    );
  });

  it('a wrong shape → PARSE', () => {
    expect(() => toAbout({ data: { species: [{ id: 'x' }] } })).toThrow(expect.objectContaining({ code: 'PARSE' }));
  });
});
