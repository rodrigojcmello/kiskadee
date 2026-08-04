import { describe, expect, it } from 'vitest';
import {
  schemaFontsContractSchema,
  validateSchemaFontsContract,
  validateSchemaGlobalFontContract
} from './fonts.contract.zod.ts';

const validFonts = {
  families: {
    roboto: {
      stack: ['Roboto', 'Arial', 'sans-serif']
    },
    'roboto-mono': {
      stack: ['Roboto Mono']
    }
  },
  roles: {
    body: 'roboto',
    heading: 'roboto',
    code: 'roboto-mono'
  }
};

describe('schemaFontsContractSchema', () => {
  it('accepts one-item and multi-item stacks', () => {
    expect(schemaFontsContractSchema.safeParse(validFonts).success).toBe(true);
  });

  it('rejects the legacy body and heading stack shape', () => {
    const result = schemaFontsContractSchema.safeParse({
      body: ['Roboto', 'sans-serif'],
      heading: ['Roboto', 'sans-serif']
    });

    expect(result.success).toBe(false);
  });

  it('rejects missing body roles and empty catalogs', () => {
    const issues = validateSchemaFontsContract({
      families: {},
      roles: {}
    });

    expect(issues.some((issue) => issue.includes('global.fonts.families'))).toBe(true);
    expect(issues.some((issue) => issue.includes('global.fonts.roles.body'))).toBe(true);
  });

  it('rejects invalid ids', () => {
    const uppercaseIssues = validateSchemaFontsContract({
      families: {
        'Roboto Main': {
          stack: ['Roboto']
        }
      },
      roles: {
        body: 'Roboto Main'
      }
    });

    const numericIssues = validateSchemaFontsContract({
      families: {
        '2-roboto': {
          stack: ['Roboto']
        }
      },
      roles: {
        body: '2-roboto'
      }
    });

    expect(uppercaseIssues.some((issue) => issue.includes('lowercase kebab-case'))).toBe(true);
    expect(numericIssues.some((issue) => issue.includes('lowercase kebab-case'))).toBe(true);
  });

  it('rejects blank stack items', () => {
    const blankIssues = validateSchemaFontsContract({
      families: {
        roboto: {
          stack: ['   ']
        }
      },
      roles: {
        body: 'roboto'
      }
    });

    const emptyIssues = validateSchemaFontsContract({
      families: {
        roboto: {
          stack: []
        }
      },
      roles: {
        body: 'roboto'
      }
    });

    expect(blankIssues.some((issue) => issue.includes('non-empty font-family'))).toBe(true);
    expect(emptyIssues.some((issue) => issue.includes('global.fonts.families.roboto.stack'))).toBe(
      true
    );
  });

  it('rejects roles that reference families outside the catalog', () => {
    const issues = validateSchemaFontsContract({
      families: {
        roboto: {
          stack: ['Roboto']
        }
      },
      roles: {
        body: 'inter',
        code: 'roboto-mono'
      }
    });

    expect(issues).toContain('global.fonts.roles.body: references unknown family "inter"');
    expect(issues).toContain('global.fonts.roles.code: references unknown family "roboto-mono"');
  });

  it('does not treat inherited object property names as catalog entries', () => {
    const issues = validateSchemaFontsContract({
      families: {
        roboto: {
          stack: ['Roboto']
        }
      },
      roles: {
        body: 'constructor'
      }
    });

    expect(issues).toContain('global.fonts.roles.body: references unknown family "constructor"');
  });
});

describe('validateSchemaGlobalFontContract', () => {
  it('accepts schemas without global font recommendations', () => {
    expect(() => validateSchemaGlobalFontContract({})).not.toThrow();
    expect(() => validateSchemaGlobalFontContract({ global: {} })).not.toThrow();
  });

  it('throws a contextual build-time error for invalid font contracts', () => {
    expect(() =>
      validateSchemaGlobalFontContract({
        global: {
          fonts: {
            families: {
              roboto: { stack: ['Roboto'] }
            },
            roles: { body: 'inter' }
          }
        }
      })
    ).toThrow(/Invalid global font contract[\s\S]*global\.fonts\.roles\.body/);
  });
});
