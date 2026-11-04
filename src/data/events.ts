import type { PokemonAbout } from '@/domain/about';
import type { EvolutionNode, Pokemon } from '@/domain/types';

/**
 * Tells the query layer when a background refresh saved newer data, so the
 * screen updates without the repositories knowing about TanStack Query.
 */
type DataEvent =
  | { kind: 'pokemon'; pokemon: Pokemon }
  | { kind: 'all'; list: Pokemon[] }
  | { kind: 'about'; speciesId: number; about: PokemonAbout }
  | { kind: 'evolution'; speciesId: number; tree: EvolutionNode }
  | { kind: 'speciesCount'; count: number };

type Listener = (event: DataEvent) => void;

const listeners = new Set<Listener>();

export function onDataRefreshed(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitDataRefreshed(event: DataEvent) {
  for (const listener of listeners) listener(event);
}
