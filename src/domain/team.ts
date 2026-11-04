import { titleCase } from './names';
import type { WeakSpot } from './typeChart';
import type { Stats } from './types';

export const TEAM_SIZE = 6;

/** The sentence above the weak-spot table (DESIGN.md §5.3). */
export function teamSummary(spots: readonly WeakSpot[], memberCount: number): string {
  const weak = spots.filter((s) => s.needsCover).map((s) => titleCase(s.attack));
  let summary =
    weak.length > 0
      ? `Your team is weak to ${weak.join(', ')}. Add a Pokémon that resists ${weak.length > 1 ? 'them' : 'it'}.`
      : 'No type hits your team harder than your team resists. Nice balance.';
  if (memberCount < TEAM_SIZE) summary += ` Based on ${memberCount} of ${TEAM_SIZE} Pokémon.`;
  return summary;
}

/** Each stat averaged across the team, rounded to whole numbers. */
export function averageStats(members: readonly Stats[]): Stats {
  const keys: (keyof Stats)[] = ['hp', 'attack', 'defense', 'spAtk', 'spDef', 'speed'];
  const result = {} as Stats;
  for (const key of keys) {
    result[key] = members.length
      ? Math.round(members.reduce((sum, m) => sum + m[key], 0) / members.length)
      : 0;
  }
  return result;
}
