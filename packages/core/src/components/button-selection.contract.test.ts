import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  type ButtonOptions,
  type SystemButtonIntentValue,
  validateButtonComponentContract
} from '../index.ts';

describe('Button selection intent option', () => {
  it('uses only the existing optional system intent domain', () => {
    expectTypeOf<ButtonOptions['selectionIntent']>().toEqualTypeOf<
      SystemButtonIntentValue | undefined
    >();
  });

  it.each<SystemButtonIntentValue | undefined>([
    undefined,
    'neutral',
    'primary',
    'positive',
    'destructive',
    'support',
    'primary-alt',
    'neutral-alt',
    'destructive-alt',
    'positive-alt',
    'support-alt'
  ])('accepts %j without adding anatomy or requiring a new palette', (selectionIntent) => {
    expect(
      validateButtonComponentContract({
        options: selectionIntent === undefined ? {} : { selectionIntent },
        elements: { e1: { name: 'button' } }
      })
    ).toEqual([]);
  });

  it.each([
    'brand.google',
    'primary-alt-alt',
    'unknown-alt',
    'inherit',
    'unknown',
    'toString',
    '',
    null,
    false,
    1,
    {}
  ])('rejects invalid preset selection intent %j', (selectionIntent) => {
    expect(
      validateButtonComponentContract({
        options: { selectionIntent },
        elements: { e1: { name: 'button' } }
      })
    ).toEqual(['components.button.options.selectionIntent: expected a system Button intent']);
  });
});
