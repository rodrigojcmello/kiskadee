import { describe, expect, it } from 'vitest';
import {
  schemaIconsContractSchema,
  validateSchemaGlobalIconContract,
  validateSchemaIconsContract
} from './icons.contract.zod.ts';

describe('schemaIconsContractSchema', () => {
  it('accepts lowercase kebab-case family and variant ids', () => {
    expect(
      schemaIconsContractSchema.parse({ family: 'fluent-system', variant: 'regular' })
    ).toEqual({
      family: 'fluent-system',
      variant: 'regular'
    });
  });

  it.each([
    'Fluent',
    'fluent_system',
    '-fluent',
    'fluent-',
    '',
    'fluent system'
  ])('rejects invalid family id %j', (family) => {
    expect(validateSchemaIconsContract({ family })).not.toEqual([]);
  });

  it.each([
    'Fill',
    'fill_1',
    '-fill',
    'fill-',
    '',
    'fill 1'
  ])('rejects invalid variant id %j', (variant) => {
    expect(validateSchemaIconsContract({ family: 'material-symbols', variant })).not.toEqual([]);
  });

  it('rejects missing and extra fields', () => {
    expect(validateSchemaIconsContract({})).not.toEqual([]);
    expect(validateSchemaIconsContract({ family: 'lucide', load: 'somewhere' })).not.toEqual([]);
  });
});

describe('validateSchemaGlobalIconContract', () => {
  it('allows schemas without icon recommendations', () => {
    expect(() => validateSchemaGlobalIconContract({})).not.toThrow();
  });

  it('reports the global path for invalid recommendations', () => {
    expect(() =>
      validateSchemaGlobalIconContract({ global: { icons: { family: 'Fluent' } } })
    ).toThrow(/global\.icons\.family/);
  });
});
