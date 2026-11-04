import { averageStats, teamSummary } from '@/domain/team';
import { teamWeakSpots } from '@/domain/typeChart';
import type { Stats } from '@/domain/types';

describe('teamSummary', () => {
  it('names the weak types and asks for cover (one type → "it")', () => {
    const spots = teamWeakSpots([['grass', 'poison']]); // Bulbasaur alone
    expect(teamSummary(spots, 1)).toBe(
      'Your team is weak to Fire, Ice, Flying, Psychic. Add a Pokémon that resists them. Based on 1 of 6 Pokémon.',
    );
  });

  it('uses "it" for a single weak type', () => {
    const spots = teamWeakSpots([['normal']]); // only Fighting hits Normal hard
    expect(teamSummary(spots, 1)).toBe(
      'Your team is weak to Fighting. Add a Pokémon that resists it. Based on 1 of 6 Pokémon.',
    );
  });

  it('praises balance when no type needs cover, and drops "Based on" at 6 of 6', () => {
    const noWeakSpots = teamWeakSpots([]); // every row has weak 0, resist 0
    expect(teamSummary(noWeakSpots, 6)).toBe('No type hits your team harder than your team resists. Nice balance.');
  });
});

describe('averageStats', () => {
  const s = (n: number): Stats => ({ hp: n, attack: n, defense: n, spAtk: n, spDef: n, speed: n });

  it('averages and rounds each stat', () => {
    expect(averageStats([s(45), s(60), s(80)])).toEqual(s(62)); // 61.67 → 62
  });

  it('an empty team averages to zero', () => {
    expect(averageStats([])).toEqual(s(0));
  });
});
