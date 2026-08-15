import { describe, expect, it } from 'vitest';
import { validateSeparatorComponentContract } from './separator.ts';

describe('Separator component contract', () => {
  it('accepts the single recipe-backed line element', () => {
    expect(
      validateSeparatorComponentContract({
        elements: {
          e1: {
            name: 'line',
            separator: { 's:all': 'subtle' }
          }
        }
      })
    ).toEqual([]);
  });

  it('rejects local visual authorship and missing references', () => {
    expect(
      validateSeparatorComponentContract({
        elements: {
          e1: {
            name: 'line',
            scales: { boxWidth: 1 }
          }
        }
      })
    ).toEqual(
      expect.arrayContaining([
        'components.separator.elements.e1.scales: unrecognized key',
        expect.stringContaining('components.separator.elements.e1.separator')
      ])
    );
  });
});
