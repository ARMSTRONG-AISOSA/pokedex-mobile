/** The detail screen's "About" section (added to the design 2026-11-04). */

export type Ability = { name: string; hidden: boolean };

export type PokemonAbout = {
  /** e.g. "Seed Pokémon". */
  genus: string | null;
  /** The newest English Pokédex entry, whitespace cleaned. */
  flavorText: string | null;
  /** Roman numeral, e.g. "I" or "IX". */
  generation: string | null;
  isBaby: boolean;
  heightM: number | null;
  weightKg: number | null;
  abilities: Ability[];
};

const ROMAN: Record<string, string> = {
  i: 'I', ii: 'II', iii: 'III', iv: 'IV', v: 'V', vi: 'VI', vii: 'VII', viii: 'VIII', ix: 'IX', x: 'X',
};

/** "generation-ix" → "IX". Unknown formats → null. */
export function generationLabel(name: string): string | null {
  const match = /^generation-([ivx]+)$/i.exec(name);
  return match ? (ROMAN[match[1].toLowerCase()] ?? match[1].toUpperCase()) : null;
}

/**
 * Pokédex entries come from old game text with hard line breaks, page breaks
 * (\f) and soft hyphens. Turn them into one normal paragraph.
 */
export function cleanFlavorText(text: string): string {
  return text
    .replace(/­\n/g, '') // soft hyphen at a line end joins the word
    .replace(/­/g, '')
    .replace(/-\n/g, '-')
    .replace(/[\f\n\r\t\v]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** 0.7 → "0.7 m" */
export function formatHeight(meters: number): string {
  return `${meters.toFixed(1)} m`;
}

/** 6.9 → "6.9 kg" */
export function formatWeight(kilograms: number): string {
  return `${kilograms.toFixed(1)} kg`;
}
