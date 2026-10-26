import { describe, expect, it } from 'vitest';
import {
  getSchemaForegroundsContractIssues,
  validateElementForegroundContract,
  validateSchemaForegroundsDefinitionContract
} from './foreground.contract.zod.ts';
import {
  type ForegroundEmphasisMap,
  fg,
  parseForegroundReferenceToken,
  type SchemaForegrounds,
  type TextForegroundName
} from './foreground.ts';

// These assignments are checked by tsc; the function is intentionally not executed.
function assertStaticForegroundContracts() {
  // @ts-expect-error Neutral has no Deep public alias.
  const invalidName: TextForegroundName = 'neutral-deep';
  // @ts-expect-error Neutral has no Deep atomic coordinate.
  fg('neutral.deep.light.onSubtle.high');
  // @ts-expect-error Parent-state references follow the same neutral restriction.
  fg.parentState('neutral.deep.light.onSubtle.high.pending');
  const invalidCatalog: SchemaForegrounds = {
    profiles: {
      neutral: {
        standard: { palettes: {} },
        // @ts-expect-error Neutral owns one Standard recipe.
        deep: { palettes: {} }
      }
    }
  };
  void invalidName;
  void invalidCatalog;
}

void assertStaticForegroundContracts;

const emphasisMap = (): ForegroundEmphasisMap => ({
  high: { rest: '#111111' },
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
  it.each([
    'e11',
    'e12'
  ])('allows foreground-owned box paint only in the Button %s indicator palette', (element) => {
    const palettes = {
      default: {
        light: {
          onSubtle: {
            boxColor: {
              neutral: {
                medium: {
                  selected: { rest: fg.parentState('neutral.standard.light.onSubtle.high') }
                }
              }
            }
          }
        }
      }
    };
    expect(
      getSchemaForegroundsContractIssues({
        global: { foregrounds: foregrounds() },
        components: {
          button: {
            elements: {
              [element]: {
                name: 'button-indicator',
                palettes
              }
            }
          }
        }
      } as any)
    ).toEqual([]);
    expect(
      getSchemaForegroundsContractIssues({
        global: { foregrounds: foregrounds() },
        components: {
          button: { elements: { e1: { name: 'button', palettes } } }
        }
      } as any)
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining('fg references are accepted only in textColor')
      ])
    );
  });
  it('accepts four strengths, optional foreground states, and optional onVivid', () => {
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
    value.profiles.neutral.standard.palettes.default.light.onSubtle.highest = {
      rest: '#000000'
    };
    delete value.profiles.neutral.standard.palettes.default.light.onSubtle.lowest;
    value.profiles.neutral.standard.palettes.default.light.onVivid.medium.focus = '#222222';

    const issues = validateSchemaForegroundsDefinitionContract(value);
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
    expect(parseForegroundReferenceToken('fg:red.deep.dark.onVivid.high')?.emphasis).toBe('high');
    expect(parseForegroundReferenceToken('fg:neutral.deep.dark.onVivid.high')).toBeUndefined();
    expect(parseForegroundReferenceToken('fg:red.deep.dark.onVivid.highest')).toBeUndefined();
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
    value.profiles.red = { standard: value.profiles.neutral.standard };
    value.profiles.red.deep = {
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
                foreground: { red: { family: 'red', profile: 'deep' } }
              }
            }
          }
        }
      })
    ).toContain(
      'components.text.elements.e1.foreground.red: references unknown foreground family "red"'
    );
  });

  it('rejects neutral deep in definitions and element references', () => {
    const value = foregrounds() as any;
    value.profiles.neutral.deep = value.profiles.neutral.standard;
    expect(validateSchemaForegroundsDefinitionContract(value)).toContain(
      'global.foregrounds.profiles.neutral.deep: neutral supports only the standard profile'
    );
    expect(
      validateElementForegroundContract({
        neutral: { family: 'neutral', profile: 'deep' }
      })
    ).toContain('foreground.neutral.profile: neutral supports only the standard profile');
  });

  it('retains custom chromatic family profiles and coordinates', () => {
    const value = foregrounds() as any;
    value.profiles['brand-accent'] = {
      standard: value.profiles.neutral.standard,
      deep: value.profiles.neutral.standard
    };
    expect(validateSchemaForegroundsDefinitionContract(value)).toEqual([]);
    expect(fg('brand-accent.deep.light.onSubtle.high')).toBe(
      'fg:brand-accent.deep.light.onSubtle.high'
    );
  });

  it('rejects dynamic neutral Deep atomic tokens at the Schema boundary', () => {
    const issues = getSchemaForegroundsContractIssues({
      global: { foregrounds: foregrounds() },
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
                            rest: 'fg:neutral.deep.light.onSubtle.high',
                            pending: { parentState: 'fg:neutral.deep.light.onSubtle.high.pending' }
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
    expect(issues).toEqual(
      expect.arrayContaining([
        expect.stringContaining('rest: invalid fg coordinate'),
        expect.stringContaining('pending.parentState: invalid fg coordinate')
      ])
    );
  });
});
