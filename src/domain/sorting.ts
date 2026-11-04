import { displayName } from './names';
import { statTotal, type Pokemon, type TypeName } from './types';

export type SortKey = 'number' | 'name' | 'power';

/** Number and Name start low→high; Power starts high→low (DESIGN.md §5.1). */
export function defaultAscending(key: SortKey): boolean {
  return key !== 'power';
}

function compare(a: Pokemon, b: Pokemon, key: SortKey): number {
  switch (key) {
    case 'number':
      return a.id - b.id;
    case 'name':
      return displayName(a.name).localeCompare(displayName(b.name));
    case 'power':
      return statTotal(a.stats) - statTotal(b.stats);
  }
}

/** Returns a new sorted array. Ties fall back to Pokédex number, low→high. */
export function sortPokemon(list: readonly Pokemon[], key: SortKey, ascending: boolean): Pokemon[] {
  return [...list].sort((a, b) => {
    const result = compare(a, b, key);
    if (result !== 0) return ascending ? result : -result;
    return a.id - b.id;
  });
}

/**
 * Search by name or number: "pika", "#25", "25" and "025" all find Pikachu.
 * A number matches the Pokédex number exactly; text matches part of the name.
 */
export function matchesQuery(pokemon: Pick<Pokemon, 'id' | 'name'>, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (q === '') return true;
  const digits = /^#?(\d+)$/.exec(q);
  if (digits) return Number(digits[1]) === pokemon.id;
  return (
    pokemon.name.includes(q.replace(/\s+/g, '-')) ||
    displayName(pokemon.name).toLowerCase().includes(q)
  );
}

export type DexFilter = { type: TypeName | 'all'; query: string };

/** The list after the type chip and the search box are applied. */
export function filterPokemon(list: readonly Pokemon[], { type, query }: DexFilter): Pokemon[] {
  return list.filter((p) => (type === 'all' || p.types.includes(type)) && matchesQuery(p, query));
}
