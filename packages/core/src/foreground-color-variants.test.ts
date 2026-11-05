import { describe, expect, it } from 'vitest';
import { validateSchemaForegroundsDefinitionContract } from './foreground.contract.zod.ts';
import {
  type ForegroundColorVariants,
  fg,
  parseForegroundReferenceToken,
  parseTextForegroundName,
  resolveForegroundVariant
} from './foreground.ts';

const variants: ForegroundColorVariants = {
  standard: {
    high: { rest: '#123456', hover: '#234567' },
    medium: { rest: '#345678' },
    low: { rest: '#456789' },
    lowest: { rest: '#56789a' }
  },
  alternative: { high: { rest: '#abcdef' } }
};

describe('Foreground color variants', () => {
  it('keeps profile selection independent from the alternative qualifier', () => {
    expect(parseTextForegroundName('blue-alt')).toEqual({
      foreground: 'blue',
      colorVariant: 'alternative'
    });
    expect(parseTextForegroundName('red-deep-alt')).toEqual({
      foreground: 'red-deep',
      colorVariant: 'alternative'
    });
    for (const invalid of [
      'blue-alt-alt',
      'blue-alt-deep',
      'unknown-alt',
      'neutral-alt',
      'inherit'
    ])
      expect(parseTextForegroundName(invalid)).toBeUndefined();
  });
  it('inherits whole emphasis leaves without borrowing Standard states', () => {
    const resolved = resolveForegroundVariant(variants, 'alternative');
    expect(resolved.high).toEqual({ rest: '#abcdef' });
    expect(resolved.medium).toEqual(variants.standard.medium);
    expect(resolveForegroundVariant({ standard: variants.standard }, 'alternative')).toEqual(
      variants.standard
    );
  });
  it('accepts sparse alternatives, but requires Rest in each authored leaf', () => {
    const catalog = {
      profiles: { blue: { standard: { palettes: { default: { light: { onSubtle: variants } } } } } }
    };
    expect(validateSchemaForegroundsDefinitionContract(catalog)).toEqual([]);
    const invalid = structuredClone(catalog);
    (invalid.profiles.blue.standard.palettes.default.light.onSubtle.alternative as any).high = {
      hover: '#ffffff'
    };
    expect(validateSchemaForegroundsDefinitionContract(invalid)).toContain(
      'global.foregrounds.profiles.blue.standard.palettes.default.light.onSubtle.alternative.high.rest: required state'
    );
  });
  it('supports explicit alternative coordinates and preserves unqualified Standard references', () => {
    expect(
      parseForegroundReferenceToken(fg('blue.standard.light.onVivid.alternative.high'))
    ).toMatchObject({
      family: 'blue',
      profile: 'standard',
      colorVariant: 'alternative',
      emphasis: 'high',
      state: 'rest'
    });
    expect(parseForegroundReferenceToken(fg('blue.deep.dark.onVivid.medium'))).toMatchObject({
      profile: 'deep',
      colorVariant: 'standard'
    });
    expect(
      parseForegroundReferenceToken('fg:blue.standard.light.onVivid.alt.high')
    ).toBeUndefined();
  });
});
