/**
 * Core types shared by every layer. Pure TypeScript: nothing in `domain/`
 * may import React, Expo or anything from `data/`, `theme/` or `app/`.
 */

export const TYPE_NAMES = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
] as const;

export type TypeName = (typeof TYPE_NAMES)[number];

export function isTypeName(value: string): value is TypeName {
  return (TYPE_NAMES as readonly string[]).includes(value);
}

export type Stats = {
  hp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
};

export type Pokemon = {
  id: number;
  /** API slug, e.g. "mr-mime". Use `displayName()` for the screen. */
  name: string;
  /** One or two types, in slot order. The first one themes the screen. */
  types: TypeName[];
  stats: Stats;
  artworkUrl: string | null;
  artworkShinyUrl: string | null;
};

export function statTotal(stats: Stats): number {
  return stats.hp + stats.attack + stats.defense + stats.spAtk + stats.spDef + stats.speed;
}

export type EvolutionNode = {
  /** Species slug, e.g. "pikachu". */
  speciesName: string;
  /** Species id, which equals the Pokédex number of its default form. */
  id: number;
  /** How this Pokémon is reached from its parent, e.g. "Level 16". Empty for the first stage. */
  via: string;
  isBaby: boolean;
  children: EvolutionNode[];
};
