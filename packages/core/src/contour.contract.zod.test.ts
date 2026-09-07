import { describe, expect, it } from 'vitest';
import {
  schemaContoursContractSchema,
  validateSchemaContoursContract
} from './contour.contract.zod.ts';
import { contour, resolveContourReference, type SchemaContours } from './contour.ts';

const catalog: SchemaContours = {
  profiles: {
    neutral: {
      standard: { palettes: { default: { light: { onSubtle: { medium: { rest: '#aabbcc' } } } } } }
    }
  }
};
function consumer(token: string, channel = 'borderColor') {
  return {
    global: { contours: catalog },
    components: {
      card: {
        elements: {
          e1: {
            palettes: {
              default: {
                light: { onSubtle: { [channel]: { neutral: { lowest: { rest: token } } } } }
              }
            }
          }
        }
      }
    }
  };
}
describe('contour contract', () => {
  it('accepts future intents without changing the neutral contract', () => {
    const expanded = { profiles: { ...catalog.profiles, primary: catalog.profiles.neutral } };
    expect(schemaContoursContractSchema.safeParse(expanded).success).toBe(true);
    expect(
      resolveContourReference(
        contour('primary.standard.light.onSubtle.medium'),
        'default',
        expanded
      )
    ).toBe('#aabbcc');
  });
  it('validates references in both supported paint channels', () => {
    for (const channel of ['boxColor', 'borderColor'])
      expect(() =>
        validateSchemaContoursContract(
          consumer(contour('neutral.standard.light.onSubtle.medium'), channel)
        )
      ).not.toThrow();
    expect(() =>
      validateSchemaContoursContract(
        consumer(contour('neutral.standard.light.onSubtle.medium'), 'textColor')
      )
    ).toThrow('require borderColor or boxColor');
  });
  it.each([
    'neutral.standard.dark.onSubtle.medium',
    'neutral.standard.light.onVivid.medium',
    'neutral.standard.light.onSubtle.low',
    'primary.standard.light.onSubtle.medium',
    'neutral.deep.light.onSubtle.medium'
  ])('rejects unavailable coordinate %s', (coordinate) => {
    expect(() => validateSchemaContoursContract(consumer(`contour:${coordinate}`))).toThrow(
      'Cannot resolve contour'
    );
  });
  it('rejects malformed tokens, missing catalogs and recursive catalogs', () => {
    expect(() => validateSchemaContoursContract(consumer('contour:bad'))).toThrow(
      'Invalid contour'
    );
    expect(() =>
      validateSchemaContoursContract({
        components: consumer(contour('neutral.standard.light.onSubtle.medium')).components
      })
    ).toThrow('Cannot resolve contour');
    const invalid = structuredClone(catalog);
    invalid.profiles.neutral.standard.palettes.default!.light!.onSubtle.medium.rest = contour(
      'neutral.standard.light.onSubtle.medium'
    );
    expect(schemaContoursContractSchema.safeParse(invalid).success).toBe(false);
    expect(() => validateSchemaContoursContract({ components: {} })).not.toThrow();
  });
});
