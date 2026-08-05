import { describe, expect, it } from 'vitest';
import {
  schemaIconsContractSchema,
  validateSchemaGlobalIconContract,
  validateSchemaIconsContract
} from './icons.contract.zod.ts';

describe('schemaIconsContractSchema', () => {
  it('accepts a lowercase kebab-case family id', () => {
    expect(schemaIconsContractSchema.parse({ family: 'fluent-system' })).toEqual({
      family: 'fluent-system'
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
