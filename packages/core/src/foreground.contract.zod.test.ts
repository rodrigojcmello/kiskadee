import { describe, expect, it } from 'vitest';
import {
  getSchemaForegroundsContractIssues,
  validateElementForegroundContract,
  validateSchemaForegroundsDefinitionContract
} from './foreground.contract.zod.ts';
import { fg, parseForegroundReferenceToken } from './foreground.ts';

const emphasisMap = () => ({
  medium: { rest: '#333333' },
  low: { rest: '#555555' },
  lowest: { rest: '#777777' }
});

const foregrounds = () => ({
  profiles: {
    neutral: {
      standard: {
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
  }
});

describe('foreground profile contract', () => {
  it('accepts three strengths, optional foreground states, and optional onVivid', () => {
    const value = foregrounds();
    value.profiles.neutral.standard.palettes.default.light.onSubtle.medium = {
      rest: '#333333',
      hover: '#222222',
      pressed: '#111111',
      pending: '#333333b3',
      disabled: '#777777'
    };
    expect(validateSchemaForegroundsDefinitionContract(value)).toEqual([]);

    Reflect.deleteProperty(value.profiles.neutral.standard.palettes.default.light, 'onVivid');
    expect(validateSchemaForegroundsDefinitionContract(value)).toEqual([]);
  });

  it('rejects unsupported strengths, incomplete coverage, and unsupported states', () => {
    const value = foregrounds() as any;
    value.profiles.neutral.standard.palettes.default.light.onSubtle.high = {
      rest: '#111111'
    };
    value.profiles.neutral.standard.palettes.default.light.onSubtle.highest = {
      rest: '#000000'
    };
    delete value.profiles.neutral.standard.palettes.default.light.onSubtle.lowest;
    value.profiles.neutral.standard.palettes.default.light.onVivid.medium.focus = '#222222';

    const issues = validateSchemaForegroundsDefinitionContract(value);
    expect(issues).toContain(
      'global.foregrounds.profiles.neutral.standard.palettes.default.light.onSubtle.high: unrecognized emphasis'
    );
    expect(issues).toContain(
      'global.foregrounds.profiles.neutral.standard.palettes.default.light.onSubtle.highest: unrecognized emphasis'
    );
    expect(issues).toContain(
      'global.foregrounds.profiles.neutral.standard.palettes.default.light.onSubtle.lowest: required emphasis'
    );
    expect(issues).toContain(
      'global.foregrounds.profiles.neutral.standard.palettes.default.light.onVivid.medium.focus: unrecognized state'
    );
  });

  it('reserves inherit and validates profile identifiers', () => {
    expect(
      validateElementForegroundContract({
        neutral: { family: 'inherit', profile: 'standard' }
      })
    ).toContain('foreground.neutral.family: "inherit" is reserved for the React API');
    expect(
      validateElementForegroundContract({
        Neutral: { family: 'neutral', profile: 'standard' }
      })
    ).toContain('foreground.Neutral: expected a lowercase kebab-case foreground family id');

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
              e1: {
                name: 'foreground',
                foreground: { neutral: { family: 'missing', profile: 'standard' } }
              }
            }
          }
        }
      })
    ).toContain(
      'global.foregrounds: required when component elements reference foreground profiles or coordinates'
    );

    const issues = getSchemaForegroundsContractIssues({
      global: { foregrounds: foregrounds() },
      components: {
        text: {
          elements: {
            e1: {
              name: 'foreground',
              foreground: { neutral: { family: 'missing', profile: 'standard' } },
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
      'components.text.elements.e1.foreground.neutral: references unknown foreground family "missing"'
    );
    expect(issues).toContain(
      'components.text.elements.e1.palettes.default.light.onSubtle.textColor: cannot be authored together with components.text.elements.e1.foreground'
    );
  });

  it('serializes and parses direct and parent-state foreground coordinates', () => {
    expect(fg('neutral.standard.light.onSubtle.medium')).toBe(
      'fg:neutral.standard.light.onSubtle.medium'
    );
    expect(fg.parentState('red.deep.dark.onVivid.low.pending')).toEqual({
      parentState: 'fg:red.deep.dark.onVivid.low.pending'
    });
    expect(parseForegroundReferenceToken('fg:red.deep.dark.onVivid.low.pending')).toEqual({
      family: 'red',
      profile: 'deep',
      theme: 'dark',
      surfaceContext: 'onVivid',
      emphasis: 'low',
      state: 'pending'
    });
    expect(parseForegroundReferenceToken('fg:red.deep.dark.onVivid.high')).toBeUndefined();
  });

  it('validates atomic foreground coordinates and confines them to textColor', () => {
    const value = foregrounds() as any;
    value.profiles.neutral.standard.palettes.default.light.onSubtle.medium.hover = '#222222';

    const valid = getSchemaForegroundsContractIssues({
      global: { foregrounds: value },
      components: {
        button: {
          elements: {
            e2: {
              palettes: {
                default: {
                  light: {
                    onSubtle: {
                      textColor: {
                        neutral: {
                          medium: {
                            rest: fg('neutral.standard.light.onSubtle.medium'),
                            hover: fg.parentState('neutral.standard.light.onSubtle.medium.hover')
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
    expect(valid).toEqual([]);

    const invalid = getSchemaForegroundsContractIssues({
      global: { foregrounds: value },
      components: {
        button: {
          elements: {
            e1: {
              palettes: {
                default: {
                  light: {
                    onSubtle: {
                      boxColor: {
                        neutral: {
                          medium: { rest: fg('neutral.standard.light.onSubtle.medium') }
                        }
                      }
                    }
                  }
                }
              }
            },
            e2: {
              palettes: {
                default: {
                  light: {
                    onSubtle: {
                      textColor: {
                        neutral: {
                          medium: {
                            rest: 'fg:missing.standard.light.onSubtle.medium',
                            hover: {
                              ref: fg('neutral.standard.light.onSubtle.medium.hover')
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    expect(invalid).toContain(
      'components.button.elements.e1.palettes.default.light.onSubtle.boxColor.neutral.medium.rest: fg references are accepted only in textColor'
    );
    expect(invalid).toContain(
      'components.button.elements.e2.palettes.default.light.onSubtle.textColor.neutral.medium.rest: references unknown foreground family "missing"'
    );
    expect(invalid).toContain(
      'components.button.elements.e2.palettes.default.light.onSubtle.textColor.neutral.medium.hover.ref: use fg.parentState() instead of the legacy ref wrapper'
    );
  });

  it('accepts optional deep profiles and rejects unavailable profile references', () => {
    const value = foregrounds() as any;
    value.profiles.neutral.deep = {
      palettes: {
        default: {
          light: {
            onSubtle: emphasisMap(),
            onVivid: emphasisMap()
          }
        }
      }
    };

    expect(validateSchemaForegroundsDefinitionContract(value)).toEqual([]);
    expect(
      getSchemaForegroundsContractIssues({
        global: { foregrounds: foregrounds() },
        components: {
          text: {
            elements: {
              e1: {
                name: 'foreground',
                foreground: { neutral: { family: 'neutral', profile: 'deep' } }
              }
            }
          }
        }
      })
    ).toContain(
      'components.text.elements.e1.foreground.neutral: references unavailable foreground profile "neutral.deep"'
    );
  });
});
