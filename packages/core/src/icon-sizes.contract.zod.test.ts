import { describe, expect, it } from 'vitest';
import {
  getSchemaIconSizesContractIssues,
  validateElementIconSizeContract,
  validateSchemaIconSizesDefinitionContract
} from './icon-sizes.contract.zod.ts';

describe('icon size contract', () => {
  it('accepts positive preset sizes and responsive component references', () => {
    expect(
      validateSchemaIconSizesDefinitionContract({
        's:sm:1': 16,
        's:md:1': 20,
        's:lg:1': 24
      })
    ).toEqual([]);

    expect(
      validateElementIconSizeContract({
        's:md:1': {
          'bp:all': 's:lg:1',
          'bp:lg:1': 's:md:1'
        }
      })
    ).toEqual([]);
  });

  it('rejects missing default size, invalid values and mixed all-size references', () => {
    expect(validateSchemaIconSizesDefinitionContract({ 's:sm:1': 0 })).toEqual(
      expect.arrayContaining([
        expect.stringContaining('global.iconSizes.s:md:1'),
        expect.stringContaining('global.iconSizes.s:sm:1')
      ])
    );
    expect(
      validateElementIconSizeContract({
        's:all': 's:md:1',
        's:md:1': 's:md:1'
      })
    ).toContain('iconSize.s:all: "s:all" cannot be combined with another size');
  });

  it('validates catalog, breakpoint and raw geometry references across a schema', () => {
    const issues = getSchemaIconSizesContractIssues({
      breakpoints: {
        'bp:all': 0,
        'bp:lg:1': 1152
      },
      global: {
        iconSizes: {
          's:md:1': 20,
          's:lg:1': 24
        }
      },
      components: {
        button: {
          elements: {
            e3: {
              iconSize: {
                's:md:1': {
                  'bp:all': 's:lg:1',
                  'bp:lg:4': 's:sm:1'
                }
              },
              scales: {
                boxWidth: { 's:md:1': 24 }
              }
            }
          }
        }
      }
    });

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.stringContaining('scales.boxWidth: cannot be authored together'),
        expect.stringContaining('breakpoint "bp:lg:4" is not declared'),
        expect.stringContaining('references unknown icon size "s:sm:1"')
      ])
    );
  });

  it('requires a global catalog when a component references icon sizes', () => {
    expect(
      getSchemaIconSizesContractIssues({
        breakpoints: {
          'bp:all': 0,
          'bp:lg:1': 1152
        },
        components: {
          icon: {
            elements: {
              e1: {
                iconSize: { 's:md:1': 's:md:1' }
              }
            }
          }
        }
      })
    ).toContain('global.iconSizes: required when component elements reference icon sizes');
  });
});
