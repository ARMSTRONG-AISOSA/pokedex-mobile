import { TYPE_NAMES, type TypeName } from './types';

/**
 * Attack effectiveness for all 18 types (Generation 6 onward).
 * Only non-1× entries are listed. Checked against PokéAPI `/type/{name}`
 * `damage_relations` by a test that uses a saved copy of that data.
 */
const CHART: Record<TypeName, Partial<Record<TypeName, 0 | 0.5 | 2>>> = {
  normal: { rock: 0.5, steel: 0.5, ghost: 0 },
  fire: { bug: 2, steel: 2, grass: 2, ice: 2, rock: 0.5, fire: 0.5, water: 0.5, dragon: 0.5 },
  water: { ground: 2, rock: 2, fire: 2, water: 0.5, grass: 0.5, dragon: 0.5 },
  electric: { flying: 2, water: 2, grass: 0.5, electric: 0.5, dragon: 0.5, ground: 0 },
  grass: {
    ground: 2, rock: 2, water: 2,
    flying: 0.5, poison: 0.5, bug: 0.5, steel: 0.5, fire: 0.5, grass: 0.5, dragon: 0.5,
  },
  ice: { flying: 2, ground: 2, grass: 2, dragon: 2, steel: 0.5, fire: 0.5, water: 0.5, ice: 0.5 },
  fighting: {
    normal: 2, rock: 2, steel: 2, ice: 2, dark: 2,
    flying: 0.5, poison: 0.5, bug: 0.5, psychic: 0.5, fairy: 0.5, ghost: 0,
  },
  poison: { grass: 2, fairy: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0 },
  ground: { poison: 2, rock: 2, steel: 2, fire: 2, electric: 2, bug: 0.5, grass: 0.5, flying: 0 },
  flying: { fighting: 2, bug: 2, grass: 2, rock: 0.5, steel: 0.5, electric: 0.5 },
  psychic: { fighting: 2, poison: 2, steel: 0.5, psychic: 0.5, dark: 0 },
  bug: {
    grass: 2, psychic: 2, dark: 2,
    fighting: 0.5, flying: 0.5, poison: 0.5, ghost: 0.5, steel: 0.5, fire: 0.5, fairy: 0.5,
  },
  rock: { flying: 2, bug: 2, fire: 2, ice: 2, fighting: 0.5, ground: 0.5, steel: 0.5 },
  ghost: { ghost: 2, psychic: 2, dark: 0.5, normal: 0 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { ghost: 2, psychic: 2, fighting: 0.5, dark: 0.5, fairy: 0.5 },
  steel: { rock: 2, ice: 2, fairy: 2, steel: 0.5, fire: 0.5, water: 0.5, electric: 0.5 },
  fairy: { fighting: 2, dragon: 2, dark: 2, poison: 0.5, steel: 0.5, fire: 0.5 },
};

/** How hard `attack` hits a single type: 0, 0.5, 1 or 2. */
export function singleMultiplier(attack: TypeName, defender: TypeName): number {
  return CHART[attack][defender] ?? 1;
}

/** How hard `attack` hits a Pokémon with these types. Dual types multiply: 0, ¼, ½, 1, 2 or 4. */
export function multiplier(attack: TypeName, defenders: readonly TypeName[]): number {
  return defenders.reduce((product, defender) => product * singleMultiplier(attack, defender), 1);
}

export type Matchup = { type: TypeName; multiplier: number };

export type Matchups = {
  /** Attack types that hit for more than 1×, strongest first. */
  weakTo: Matchup[];
  /** Attack types that hit for less than 1× but more than 0, weakest first. */
  resists: Matchup[];
  /** Attack types that do nothing. */
  immuneTo: Matchup[];
};

/** The "Type matchups" section of the detail screen (DESIGN.md §5.2). */
export function matchupsFor(defenders: readonly TypeName[]): Matchups {
  const all = TYPE_NAMES.map((type) => ({ type, multiplier: multiplier(type, defenders) }));
  // Array.prototype.sort is stable, so ties keep the standard type order.
  return {
    weakTo: all.filter((m) => m.multiplier > 1).sort((a, b) => b.multiplier - a.multiplier),
    resists: all
      .filter((m) => m.multiplier > 0 && m.multiplier < 1)
      .sort((a, b) => a.multiplier - b.multiplier),
    immuneTo: all.filter((m) => m.multiplier === 0),
  };
}

/** "4×", "2×", "½×", "¼×", "0×" for matchup pills. */
export function formatMultiplier(value: number): string {
  if (value === 0.5) return '½×';
  if (value === 0.25) return '¼×';
  return `${value}×`;
}

export type WeakSpot = {
  attack: TypeName;
  /** Team members that take more than 1× from this type. */
  weak: number;
  /** Team members that take less than 1× (immune counts as resist). */
  resist: number;
  /** More members are weak than resist (DESIGN.md §5.3). */
  needsCover: boolean;
};

/** The team's "Type weak spots" table, one row per attack type. */
export function teamWeakSpots(team: readonly (readonly TypeName[])[]): WeakSpot[] {
  return TYPE_NAMES.map((attack) => {
    let weak = 0;
    let resist = 0;
    for (const member of team) {
      const m = multiplier(attack, member);
      if (m > 1) weak += 1;
      else if (m < 1) resist += 1;
    }
    return { attack, weak, resist, needsCover: weak > resist };
  });
}
