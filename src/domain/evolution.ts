import { displayName, titleCase } from './names';
import type { EvolutionNode } from './types';

/**
 * Turns PokéAPI's `/evolution-chain/{id}` data into an `EvolutionNode` tree
 * and writes the short "how it evolves" labels (ARCHITECTURE.md §6).
 *
 * The input types below describe only the fields we read. The data layer
 * validates the response with zod before calling `buildEvolutionTree`.
 */

type NamedRef = { name: string; url?: string };

export type EvolutionDetailInput = {
  trigger?: NamedRef | null;
  min_level?: number | null;
  item?: NamedRef | null;
  held_item?: NamedRef | null;
  min_happiness?: number | null;
  min_affection?: number | null;
  min_beauty?: number | null;
  time_of_day?: string | null;
  known_move?: NamedRef | null;
  known_move_type?: NamedRef | null;
  location?: NamedRef | null;
  gender?: number | null;
  needs_overworld_rain?: boolean | null;
  turn_upside_down?: boolean | null;
  relative_physical_stats?: number | null;
  party_species?: NamedRef | null;
  party_type?: NamedRef | null;
  trade_species?: NamedRef | null;
  /** Marks the method PokéAPI treats as the main one when several games differ. */
  is_default?: boolean | null;
};

export type ChainLinkInput = {
  species: { name: string; url: string };
  is_baby?: boolean;
  evolution_details: EvolutionDetailInput[];
  evolves_to: ChainLinkInput[];
};

/** Species id from a URL like "https://pokeapi.co/api/v2/pokemon-species/25/". */
export function idFromUrl(url: string): number {
  const match = /\/(\d+)\/?$/.exec(url);
  if (!match) throw new Error(`No id at the end of "${url}"`);
  return Number(match[1]);
}

/**
 * PokéAPI lists one entry per game where the method differs (Leafeon has six).
 * Use the entry marked `is_default`; if none is marked, use the first.
 */
export function pickDetail(details: readonly EvolutionDetailInput[]): EvolutionDetailInput | undefined {
  return details.find((d) => d.is_default) ?? details[0];
}

const TIME_LABELS: Record<string, string> = { day: 'daytime', night: 'night', dusk: 'dusk' };

/** A short label such as "Level 16", "Water Stone" or "Friendship, daytime". Never empty. */
export function evolutionLabel(detail: EvolutionDetailInput | undefined): string {
  if (!detail) return 'Special';
  const trigger = detail.trigger?.name ?? '';
  const parts: string[] = [];

  // The main condition comes first.
  if (trigger === 'trade') {
    if (detail.held_item) parts.push(`Trade holding ${titleCase(detail.held_item.name)}`);
    else if (detail.trade_species) parts.push(`Trade for ${displayName(detail.trade_species.name)}`);
    else parts.push('Trade');
  } else if (detail.item) {
    parts.push(titleCase(detail.item.name));
  } else if (detail.min_level != null) {
    parts.push(`Level ${detail.min_level}`);
  } else if (detail.min_happiness != null) {
    parts.push('Friendship');
  } else if (detail.min_affection != null) {
    parts.push('Affection');
  } else if (detail.min_beauty != null) {
    parts.push('Beauty');
  } else if (detail.known_move) {
    parts.push(`Learn ${titleCase(detail.known_move.name)}`);
  } else if (detail.location) {
    parts.push(`Level up at ${titleCase(detail.location.name)}`);
  }

  // Extra conditions follow, comma separated.
  if (trigger !== 'trade' && detail.held_item) parts.push(`holding ${titleCase(detail.held_item.name)}`);
  if (detail.known_move_type) parts.push(`${titleCase(detail.known_move_type.name)} move`);
  if (detail.known_move && parts[0] !== `Learn ${titleCase(detail.known_move.name)}`) {
    parts.push(`knows ${titleCase(detail.known_move.name)}`);
  }
  if (detail.time_of_day && TIME_LABELS[detail.time_of_day]) parts.push(TIME_LABELS[detail.time_of_day]);
  if (detail.gender === 1) parts.push('female');
  if (detail.gender === 2) parts.push('male');
  if (detail.needs_overworld_rain) parts.push('in rain');
  if (detail.turn_upside_down) parts.push('upside down');
  if (detail.party_species) parts.push(`with ${displayName(detail.party_species.name)}`);
  if (detail.party_type) parts.push(`with a ${titleCase(detail.party_type.name)} type`);
  if (detail.relative_physical_stats === 1) parts.push('Attack > Defense');
  if (detail.relative_physical_stats === -1) parts.push('Attack < Defense');
  if (detail.relative_physical_stats === 0) parts.push('Attack = Defense');

  if (parts.length === 0) {
    // "level-up" with nothing else is a plain level up; other triggers get their own name.
    return trigger === '' ? 'Special' : trigger === 'level-up' ? 'Level up' : titleCase(trigger);
  }
  const label = parts.join(', ');
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function buildEvolutionTree(link: ChainLinkInput, isRoot = true): EvolutionNode {
  return {
    speciesName: link.species.name,
    id: idFromUrl(link.species.url),
    via: isRoot ? '' : evolutionLabel(pickDetail(link.evolution_details)),
    isBaby: link.is_baby ?? false,
    // Siblings keep the order the API returns them in.
    children: link.evolves_to.map((child) => buildEvolutionTree(child, false)),
  };
}

/** Number of stages on the longest path: Charmander's line is 3, Eevee's family is 2. */
export function stageCount(node: EvolutionNode): number {
  return 1 + Math.max(0, ...node.children.map(stageCount));
}

export function familySize(node: EvolutionNode): number {
  return 1 + node.children.reduce((sum, child) => sum + familySize(child), 0);
}

export function findNode(node: EvolutionNode, id: number): EvolutionNode | undefined {
  if (node.id === id) return node;
  for (const child of node.children) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return undefined;
}

/** The first node (top-down) with more than one way to evolve, if any. */
export function branchPoint(node: EvolutionNode): EvolutionNode | undefined {
  if (node.children.length > 1) return node;
  for (const child of node.children) {
    const found = branchPoint(child);
    if (found) return found;
  }
  return undefined;
}

/** The sentence above the tree on the detail screen (DESIGN.md §5.2, §10). */
export function evolutionNote(root: EvolutionNode, currentId: number): string {
  const current = findNode(root, currentId) ?? root;
  if (root.children.length === 0) {
    return `${displayName(current.speciesName)} does not evolve.`;
  }
  const branch = branchPoint(root);
  if (branch) {
    if (branch.id === current.id) {
      return `${displayName(current.speciesName)} can become ${branch.children.length} different Pokémon. Tap one to open it.`;
    }
    return `Part of the ${displayName(root.speciesName)} family. Tap any Pokémon to open it.`;
  }
  return `${stageCount(root)} stages. Tap any Pokémon to open it.`;
}

/** The Pokémon that evolves into `id`, or undefined for the first stage. */
export function parentOf(root: EvolutionNode, id: number): EvolutionNode | undefined {
  for (const child of root.children) {
    if (child.id === id) return root;
    const found = parentOf(child, id);
    if (found) return found;
  }
  return undefined;
}
