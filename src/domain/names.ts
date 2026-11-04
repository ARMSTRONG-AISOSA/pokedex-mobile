/**
 * Turn API slugs into names for the screen.
 * "bulbasaur" → "Bulbasaur", "thunder-stone" → "Thunder Stone".
 */

/** Species whose names are not just Title Case with spaces. */
const SPECIAL_NAMES: Record<string, string> = {
  'nidoran-f': 'Nidoran♀',
  'nidoran-m': 'Nidoran♂',
  'mr-mime': 'Mr. Mime',
  'mime-jr': 'Mime Jr.',
  'mr-rime': 'Mr. Rime',
  farfetchd: 'Farfetch’d',
  sirfetchd: 'Sirfetch’d',
  'ho-oh': 'Ho-Oh',
  'porygon-z': 'Porygon-Z',
  'type-null': 'Type: Null',
  'jangmo-o': 'Jangmo-o',
  'hakamo-o': 'Hakamo-o',
  'kommo-o': 'Kommo-o',
  flabebe: 'Flabébé',
};

export function titleCase(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function displayName(slug: string): string {
  return SPECIAL_NAMES[slug] ?? titleCase(slug);
}

/** "#025" style number for cards. */
export function formatDexNumber(id: number): string {
  return `#${String(id).padStart(3, '0')}`;
}
