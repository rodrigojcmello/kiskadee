import { describe, expect, expectTypeOf, it } from 'vitest';
import { getElementPaletteValidationIssues } from './components/palettes.ts';
import {
  type ButtonIntentValue,
  type ColorSchema,
  type ContentSurfaceContextVariants,
  colorVariantBuckets,
  parseButtonIntentValue,
  resolveColorVariantPalette,
  resolveContentSurfaceContextVariant,
  validateButtonComponentContract
} from './index.ts';

describe('shared color variants', () => {
  it('inherits missing leaves while replacing whole authored state maps without mutating input', () => {
    const standard: ColorSchema = {
      boxColor: {
        primary: { high: { rest: '#ffffff', hover: '#eeeeee', pressed: '#dddddd' } },
        neutral: { low: { rest: '#aaaaaa', hover: '#bbbbbb' } }
      },
      textColor: { rest: '#222222', hover: '#111111' }
    };
    const alternative: ColorSchema = {
      boxColor: { primary: { high: { rest: '#000000' } } },
      textColor: { rest: '#ffffff' }
    };
    const variants = { standard, alternative };
    const original = structuredClone(variants);
    expect(resolveColorVariantPalette(variants, 'alternative')).toEqual({
      boxColor: {
        primary: { high: { rest: '#000000' } },
        neutral: { low: { rest: '#aaaaaa', hover: '#bbbbbb' } }
      },
      textColor: { rest: '#ffffff' }
    });
    expect(resolveColorVariantPalette({ standard }, 'alternative')).toEqual(standard);
    expect(resolveColorVariantPalette(variants, 'standard')).toEqual(standard);
    expect(variants).toEqual(original);
    expect(colorVariantBuckets).toEqual({ standard: 's', alternative: 'a' });
  });

  it('applies whole-leaf inheritance to descendant surface outputs', () => {
    const variants: ContentSurfaceContextVariants = {
      standard: {
        primary: { high: { rest: 'onVivid', selected: 'onSubtle' } },
        neutral: { low: { rest: 'inherit' } }
      },
      alternative: { primary: { high: { rest: 'onSubtle' } } }
    };
    expect(resolveContentSurfaceContextVariant(variants, 'alternative')).toEqual({
      primary: { high: { rest: 'onSubtle' } },
      neutral: { low: { rest: 'inherit' } }
    });
  });

  it('requires Standard in each context and checks parity only for Standard', () => {
    const standard = { boxColor: { primary: { high: { rest: '#ffffff' } } } };
    const alternate = { boxColor: { neutral: { low: { rest: '#000000' } } } };
    expect(
      getElementPaletteValidationIssues(
        {
          default: {
            light: {
              onSubtle: { standard },
              onVivid: { standard, alternative: alternate }
            }
          }
        },
        ['boxColor']
      )
    ).toEqual([]);
    expect(
      getElementPaletteValidationIssues(
        {
          default: {
            light: {
              onSubtle: { alternative: alternate }
            }
          }
        },
        ['boxColor']
      )
    ).toContainEqual({
      path: ['default', 'light', 'onSubtle', 'standard'],
      message: 'required color variant'
    });
    expect(
      getElementPaletteValidationIssues(
        {
          default: {
            light: {
              onSubtle: {
                standard,
                alternative: { boxColor: { primary: { high: { hover: '#ffffff' } } } }
              }
            }
          }
        },
        ['boxColor']
      )
    ).toContainEqual({
      path: ['default', 'light', 'onSubtle', 'alternative', 'boxColor', 'primary', 'high', 'rest'],
      message: 'required state'
    });
  });
});

describe('removed Button paint anatomy', () => {
  it.each([
    'e13',
    'e18',
    'e19',
    'e22'
  ])('rejects %s instead of accepting parallel paint sources', (element) => {
    expect(
      validateButtonComponentContract({ elements: { [element]: { name: 'paint' } } })
    ).toContain(`components.button.elements.${element}: unrecognized key`);
  });
  it.each([
    'colorTreatment',
    'indicatorColorTreatment'
  ])('rejects the obsolete %s option', (option) => {
    expect(
      validateButtonComponentContract({ options: { [option]: 'alternative' }, elements: {} })
    ).toContain(`components.button.options.${option}: unrecognized key`);
  });
});

describe('qualified Button intent', () => {
  it.each([
    'primary',
    'neutral',
    'destructive',
    'positive',
    'support'
  ])('normalizes %s and its qualified form', (intent) => {
    expect(parseButtonIntentValue(intent)).toEqual({ intent, colorVariant: 'standard' });
    expect(parseButtonIntentValue(`${intent}-alt`)).toEqual({
      intent,
      colorVariant: 'alternative'
    });
  });

  it('preserves external names before interpreting the alternative suffix', () => {
    expectTypeOf<'primary-alt'>().toExtend<ButtonIntentValue>();
    expect(parseButtonIntentValue('brand.example-alt')).toEqual({
      intent: 'brand.example-alt',
      colorVariant: 'standard'
    });
  });

  it.each([
    'primary-alt-alt',
    'unknown-alt',
    'primary-standard',
    'brand.',
    'toString',
    '',
    null
  ])('rejects invalid qualification %j', (value) => {
    expect(parseButtonIntentValue(value)).toBeUndefined();
  });
});
