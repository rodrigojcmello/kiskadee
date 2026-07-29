import { describe, expect, it } from 'vitest';
import {
  type ColorsArtifact,
  collectPrimitiveColorDescriptors,
  collectPrimitiveToneEntries,
  materializePrimitiveColorCatalog
} from './primitive-color-catalog';

describe('collectPrimitiveColorDescriptors', () => {
  it('preserves family and variant declaration order and emits Light before Dark', () => {
    const colors = {
      primitiveColors: {
        blue: {
          v2: {
            kind: 'static',
            functionalReferences: {
              light: { subtle: 4, vivid: 50 },
              dark: { subtle: 3, vivid: 40 }
            },
            scales: {
              light: 'blue.v2.light.json',
              dark: 'blue.v2.dark.json'
            }
          },
          dynamic: {
            kind: 'dynamic',
            scales: {
              light: 'blue.dynamic.light.json',
              dark: 'blue.dynamic.dark.json'
            }
          }
        },
        black: {
          v1: {
            kind: 'static',
            scales: {
              light: 'black.v1.light.json',
              dark: 'black.v1.dark.json'
            }
          }
        }
      }
    } satisfies ColorsArtifact;

    expect(collectPrimitiveColorDescriptors(colors)).toEqual([
      {
        family: 'blue',
        id: 'blue.v2',
        kind: 'static',
        scales: [
          {
            fileName: 'blue.v2.light.json',
            functionalReferences: { subtle: 4, vivid: 50 },
            theme: 'light'
          },
          {
            fileName: 'blue.v2.dark.json',
            functionalReferences: { subtle: 3, vivid: 40 },
            theme: 'dark'
          }
        ],
        variant: 'v2'
      },
      {
        family: 'blue',
        id: 'blue.dynamic',
        kind: 'dynamic',
        scales: [
          {
            fileName: 'blue.dynamic.light.json',
            functionalReferences: undefined,
            theme: 'light'
          },
          {
            fileName: 'blue.dynamic.dark.json',
            functionalReferences: undefined,
            theme: 'dark'
          }
        ],
        variant: 'dynamic'
      },
      {
        family: 'black',
        id: 'black.v1',
        kind: 'static',
        scales: [
          {
            fileName: 'black.v1.light.json',
            functionalReferences: undefined,
            theme: 'light'
          },
          {
            fileName: 'black.v1.dark.json',
            functionalReferences: undefined,
            theme: 'dark'
          }
        ],
        variant: 'v1'
      }
    ]);
  });

  it('keeps an explicit missing-theme descriptor instead of hiding the scale', () => {
    const colors = {
      primitiveColors: {
        red: {
          v1: {
            kind: 'static',
            scales: {
              light: 'red.v1.light.json'
            }
          }
        }
      }
    } satisfies ColorsArtifact;

    expect(collectPrimitiveColorDescriptors(colors)[0]?.scales).toEqual([
      {
        fileName: 'red.v1.light.json',
        functionalReferences: undefined,
        theme: 'light'
      },
      {
        fileName: undefined,
        functionalReferences: undefined,
        theme: 'dark'
      }
    ]);
  });
});

describe('collectPrimitiveToneEntries', () => {
  it('returns every canonical tone exactly once and ignores non-contract positions', () => {
    const scale = Object.fromEntries(
      [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 35, 40, 45, 50,
        55, 60, 65, 70, 75, 80, 85, 90, 95, 99, 100
      ].map((tone) => [String(tone), `#${tone.toString(16).padStart(6, '0')}`])
    );
    scale['11'] = '#abcdef';

    const entries = collectPrimitiveToneEntries(scale);

    expect(entries).toHaveLength(36);
    expect(entries.map((entry) => entry.tone)).not.toContain(11);
    expect(new Set(entries.map((entry) => entry.tone)).size).toBe(36);
  });

  it('fails explicitly when a canonical tone is missing', () => {
    expect(() => collectPrimitiveToneEntries({ 0: '#ffffff' })).toThrow(
      'Primitive scale is missing canonical tone 1.'
    );
  });
});

describe('materializePrimitiveColorCatalog', () => {
  it('keeps successful scales visible when a sibling artifact fails', () => {
    const descriptors = collectPrimitiveColorDescriptors({
      primitiveColors: {
        blue: {
          v1: {
            kind: 'static',
            scales: {
              light: 'blue.v1.light.json',
              dark: 'blue.v1.dark.json'
            }
          }
        }
      }
    });
    const lightTones = [{ tone: 0 as const, value: '#ffffff' }];
    const loaded = materializePrimitiveColorCatalog(descriptors, [
      { status: 'fulfilled', value: lightTones },
      { status: 'rejected', reason: new Error('Dark artifact missing') }
    ]);

    expect(loaded[0]?.scales[0]?.tones).toEqual(lightTones);
    expect(loaded[0]?.scales[0]?.error).toBeNull();
    expect(loaded[0]?.scales[1]?.tones).toBeNull();
    expect(loaded[0]?.scales[1]?.error).toBe('Dark artifact missing');
  });
});
