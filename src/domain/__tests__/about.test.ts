import { cleanFlavorText, formatHeight, formatWeight, generationLabel } from '@/domain/about';
import { buildEvolutionTree, parentOf, type ChainLinkInput } from '@/domain/evolution';

import eeveeChain from './fixtures/evolution-chain-eevee.json';
import pichuChain from './fixtures/evolution-chain-pichu.json';

describe('generationLabel', () => {
  it.each([
    ['generation-i', 'I'],
    ['generation-ii', 'II'],
    ['generation-iv', 'IV'],
    ['generation-ix', 'IX'],
  ])('%s → %s', (name, label) => {
    expect(generationLabel(name)).toBe(label);
  });

  it('unknown format → null', () => {
    expect(generationLabel('gen-1')).toBeNull();
  });
});

describe('cleanFlavorText', () => {
  it('joins hard line breaks and page breaks into one paragraph', () => {
    expect(
      cleanFlavorText('While it is young, it uses the nutrients that are\nstored in the seed\fon its back.'),
    ).toBe('While it is young, it uses the nutrients that are stored in the seed on its back.');
  });

  it('removes soft hyphens and keeps real hyphens', () => {
    expect(cleanFlavorText('electri­\ncity and peach-\nshaped')).toBe('electricity and peach-shaped');
  });
});

describe('formatHeight / formatWeight', () => {
  it('shows one decimal with the unit', () => {
    expect(formatHeight(0.7)).toBe('0.7 m');
    expect(formatHeight(2)).toBe('2.0 m');
    expect(formatWeight(6.9)).toBe('6.9 kg');
    expect(formatWeight(100)).toBe('100.0 kg');
  });
});

describe('parentOf', () => {
  const pichu = buildEvolutionTree(pichuChain.chain as ChainLinkInput);
  const eevee = buildEvolutionTree(eeveeChain.chain as ChainLinkInput);

  it('finds the previous stage', () => {
    expect(parentOf(pichu, 25)?.speciesName).toBe('pichu');
    expect(parentOf(pichu, 26)?.speciesName).toBe('pikachu');
    expect(parentOf(eevee, 197)?.speciesName).toBe('eevee');
  });

  it('the first stage has no parent', () => {
    expect(parentOf(pichu, 172)).toBeUndefined();
  });
});
