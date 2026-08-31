import { describe, expect, it } from 'vitest';
import {
  getSchemaForegroundsContractIssues,
  validateElementForegroundContract,
  validateSchemaForegroundsDefinitionContract
} from './foreground.contract.zod.ts';

const emphasisMap = () => ({
  medium: { rest: '#333333' },
  low: { rest: '#555555' },
  lowest: { rest: '#777777' }
});

const foregrounds = () => ({
  profiles: {
    neutral: {
      palettes: {
        default: {
          light: {
            onSubtle: emphasisMap(),
            onVivid: emphasisMap()
          }
        }
      }
    }
  }
});

describe('foreground profile contract', () => {
  it('accepts the three Rest-only Text emphases and optional onVivid', () => {
    const value = foregrounds();
    expect(validateSchemaForegroundsDefinitionContract(value)).toEqual([]);

    Reflect.deleteProperty(value.profiles.neutral.palettes.default.light, 'onVivid');
    expect(validateSchemaForegroundsDefinitionContract(value)).toEqual([]);
  });

  it('rejects unsupported strengths, incomplete coverage, and non-Rest states', () => {
    const value = foregrounds() as any;
    value.profiles.neutral.palettes.default.light.onSubtle.high = { rest: '#111111' };
    value.profiles.neutral.palettes.default.light.onSubtle.highest = { rest: '#000000' };
    delete value.profiles.neutral.palettes.default.light.onSubtle.lowest;
    value.profiles.neutral.palettes.default.light.onVivid.medium.hover = '#222222';

    const issues = validateSchemaForegroundsDefinitionContract(value);
    expect(issues).toContain(
      'global.foregrounds.profiles.neutral.palettes.default.light.onSubtle.high: unrecognized emphasis'
    );
    expect(issues).toContain(
      'global.foregrounds.profiles.neutral.palettes.default.light.onSubtle.highest: unrecognized emphasis'
    );
    expect(issues).toContain(
      'global.foregrounds.profiles.neutral.palettes.default.light.onSubtle.lowest: required emphasis'
    );
    expect(issues).toContain(
      'global.foregrounds.profiles.neutral.palettes.default.light.onVivid.medium.hover: unrecognized state'
    );
  });

  it('reserves inherit and validates profile identifiers', () => {
    expect(validateElementForegroundContract({ neutral: 'inherit' })).toContain(
      'foreground.neutral: "inherit" is reserved for the React API'
    );
    expect(validateElementForegroundContract({ Neutral: 'neutral' })).toContain(
      'foreground.Neutral: expected a lowercase kebab-case foreground profile id'
    );

    const value = foregrounds() as any;
    value.profiles.inherit = value.profiles.neutral;
    expect(validateSchemaForegroundsDefinitionContract(value)).toContain(
      'global.foregrounds.profiles.inherit: "inherit" is reserved for the React API'
    );
  });

  it('requires declared profiles and rejects authored textColor conflicts', () => {
    expect(
      getSchemaForegroundsContractIssues({
        components: {
          text: {
            elements: {
              e1: { name: 'foreground', foreground: { neutral: 'missing' } }
            }
          }
        }
      })
    ).toContain(
      'global.foregrounds: required when component elements reference foreground profiles'
    );

    const issues = getSchemaForegroundsContractIssues({
      global: { foregrounds: foregrounds() },
      components: {
        text: {
          elements: {
            e1: {
              name: 'foreground',
              foreground: { neutral: 'missing' },
              palettes: {
                default: {
                  light: {
                    onSubtle: { textColor: { neutral: emphasisMap() } }
                  }
                }
              }
            }
          }
        }
      }
    });

    expect(issues).toContain(
      'components.text.elements.e1.foreground.neutral: references unknown foreground profile "missing"'
    );
    expect(issues).toContain(
      'components.text.elements.e1.palettes.default.light.onSubtle.textColor: cannot be authored together with components.text.elements.e1.foreground'
    );
  });
});
