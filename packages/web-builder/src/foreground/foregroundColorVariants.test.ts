import { fg, type Schema } from '@kiskadee/core';
import { validateSchemaForegroundsContract } from '@kiskadee/core/foreground-contract';
import { expect, it } from 'vitest';
import { buildColorVariantCapabilities } from '../component-artifacts/colorVariantCapabilities.ts';
import { resolveElementPaletteSources } from '../palettes/resolveElementPaletteSources.ts';
import { resolveForegroundReferences } from './resolveForegroundReferences.ts';

const standard = {
  high: { rest: '#123456', hover: '#234567' },
  medium: { rest: '#345678' },
  low: { rest: '#456789' },
  lowest: { rest: '#56789a' }
};
const foregrounds = {
  profiles: {
    blue: {
      standard: {
        palettes: {
          default: {
            light: {
              onSubtle: { standard },
              onVivid: { standard, alternative: { high: { rest: '#abcdef' } } }
            }
          }
        }
      }
    }
  }
};
const element = {
  name: 'foreground',
  foreground: { blue: { family: 'blue', profile: 'standard' as const } }
};
it('publishes alternatives from foreground authorship and inherits the remaining text strengths', () => {
  const palettes = resolveElementPaletteSources(element, { foregrounds }).palettes!;
  expect(palettes.default!.light!.onSubtle.alternative).toBeUndefined();
  expect(palettes.default!.light!.onVivid!.alternative!.textColor!.blue!.high).toEqual({
    rest: '#abcdef'
  });
  expect(palettes.default!.light!.onVivid!.alternative!.textColor!.blue!.medium).toEqual(
    standard.medium
  );
  const schema = {
    global: { foregrounds },
    components: { text: { elements: { e1: element } } }
  } as unknown as Schema;
  expect(buildColorVariantCapabilities(schema, 'text')).toEqual({
    alternative: { 'default.light': { onVivid: { blue: ['high'] } } }
  });
});
it('resolves alternative atomic references in component palettes without leaking Standard Hover', () => {
  const palette = {
    default: {
      light: {
        onVivid: {
          standard: {
            textColor: {
              primary: { high: { rest: fg('blue.standard.light.onVivid.alternative.high') } }
            }
          }
        }
      }
    }
  };
  validateSchemaForegroundsContract({
    global: { foregrounds },
    components: { button: { elements: { e2: { palettes: palette } } } }
  });
  expect(
    resolveForegroundReferences(palette, foregrounds).default.light.onVivid.standard.textColor
      .primary.high.rest
  ).toBe('#abcdef');
  const missing = structuredClone(palette) as any;
  missing.default.light.onVivid.standard.textColor.primary.high.rest = fg(
    'blue.standard.light.onVivid.alternative.high.hover'
  );
  expect(() =>
    validateSchemaForegroundsContract({
      global: { foregrounds },
      components: { button: { elements: { e2: { palettes: missing } } } }
    })
  ).toThrow('does not publish state "hover"');
});
