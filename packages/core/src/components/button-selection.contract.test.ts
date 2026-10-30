import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  type ButtonOptions,
  type SystemButtonIntent,
  validateButtonComponentContract
} from '../index.ts';

describe('Button selection intent option', () => {
  it('uses only the existing optional system intent domain', () => {
    expectTypeOf<ButtonOptions['selectionIntent']>().toEqualTypeOf<
      SystemButtonIntent | undefined
    >();
  });

  it.each<SystemButtonIntent | undefined>([
    undefined,
    'neutral',
    'primary',
    'positive',
    'destructive',
    'support'
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
