import type {
  ClassNameByElementJSON,
  ColorClasses,
  ComponentStyleKeyMap,
  Schema
} from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import {
  buildScopedToneMetadataKey,
  type ToneMetadataByPalette
} from '../phase-1-convert-schema-to-style-keys/colors/convertElementColorsToStyleKeys.ts';
import { convertElementSchemaToStyleKeys } from '../phase-1-convert-schema-to-style-keys/convertElementSchemaToStyleKeys.ts';
import type { ShortenCssClassNames } from '../phase-3-shorten-css-class-names/shortenCssClassNames.ts';
import { DEFAULT_WEB_STYLE_EMISSION_POLICY } from '../style-emission/web-build-policy.ts';
import { buildStyleKey } from '../utils/index.ts';
import { generateClassNamesMapSplit } from './generateClassNamesMap.ts';

describe('generateClassNamesMapSplit', () => {
  it('publishes Button divider geometry and color through the generic class map', () => {
    const schema = {
      name: 'Button divider pipeline test',
      version: [1, 0, 0],
      author: 'Kiskadee',
      breakpoints: { 'bp:all': 0 },
      components: {
        button: {
          options: { groupDivider: true, disclosureDivider: false },
          elements: {
            e1: {
              name: 'button-root',
              scales: { boxHeight: { 's:md:1': 32 } }
            },
            e6: {
              name: 'button-divider',
              scales: {
                boxWidth: { 's:md:1': 1 },
                boxHeight: { 's:md:1': 20 }
              },
              palettes: {
                default: {
                  light: {
                    onSubtle: {
                      boxColor: { neutral: { medium: { rest: '#dddddd' } } }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } as unknown as Schema;

    const { styleKeys, toneMetadataByPalette } = convertElementSchemaToStyleKeys(schema);
    const out = generateClassNamesMapSplit(
      styleKeys,
      {
        'boxWidth__1@@t': 'divider-width',
        'boxHeight__20@@t': 'divider-height',
        boxHeight__32: 'button-height',
        'boxColor__#dddddd': 'divider-color'
      },
      toneMetadataByPalette,
      { webStyleEmissionPolicy: DEFAULT_WEB_STYLE_EMISSION_POLICY }
    );

    const core = out.core.button as Record<string, ClassNameByElementJSON>;
    const palette = out.palettes['default.light'].button as Record<string, ClassNameByElementJSON>;

    expect(core.e6.s?.['md:1']?.split(' ')).toEqual(
      expect.arrayContaining(['divider-width', 'divider-height'])
    );
    expect(core.e1.p?.gd).toEqual({ 'md:1': 'divider-width' });
    expect(palette.e6.c?.s?.neutral).toEqual({ m: 'divider-color' });
  });

  it('reuses the same atomic separator utilities without a dedicated bucket', () => {
    const profile = {
      scales: { boxWidth: 1 },
      palettes: {
        default: {
          light: {
            onSubtle: {
              boxColor: { neutral: { medium: { rest: '#dddddd' } } }
            }
          }
        }
      }
    } as const;
    const schema = {
      name: 'Separator pipeline test',
      version: [1, 0, 0],
      author: 'Kiskadee',
      breakpoints: { 'bp:all': 0 },
      global: { separators: { profiles: { subtle: profile } } },
      components: {
        button: {
          elements: {
            e1: {
              name: 'button-root',
              scales: { boxHeight: { 's:md:1': 32 } }
            },
            e6: {
              name: 'button-divider',
              scales: {
                boxWidth: { 's:md:1': 1 },
                boxHeight: { 's:md:1': 20 }
              },
              palettes: profile.palettes
            }
          }
        },
        separator: {
          elements: { e1: { name: 'line', separator: { 's:all': 'subtle' } } }
        },
        dropdown: {
          elements: { e7: { name: 'separator', separator: { 's:all': 'subtle' } } }
        }
      }
    } as unknown as Schema;

    const { styleKeys, toneMetadataByPalette } = convertElementSchemaToStyleKeys(schema);
    const out = generateClassNamesMapSplit(
      styleKeys,
      {
        'boxWidth__1@@t': 'thickness-1',
        'boxHeight__20@@t': 'height-20',
        boxHeight__32: 'button-height',
        'boxColor__#dddddd': 'neutral-line'
      },
      toneMetadataByPalette,
      { webStyleEmissionPolicy: DEFAULT_WEB_STYLE_EMISSION_POLICY }
    );

    const separatorCore = out.core.separator as Record<string, ClassNameByElementJSON>;
    const dropdownCore = out.core.dropdown as Record<string, ClassNameByElementJSON>;
    const buttonCore = out.core.button as Record<string, ClassNameByElementJSON>;
    const separatorPalette = out.palettes['default.light'].separator as Record<
      string,
      ClassNameByElementJSON
    >;
    const dropdownPalette = out.palettes['default.light'].dropdown as Record<
      string,
      ClassNameByElementJSON
    >;
    const buttonPalette = out.palettes['default.light'].button as Record<
      string,
      ClassNameByElementJSON
    >;

    expect(separatorCore.e1.s?.all).toBe('thickness-1');
    expect(dropdownCore.e7.s?.all).toBe('thickness-1');
    expect(buttonCore.e6.s?.['md:1']?.split(' ')).toEqual(
      expect.arrayContaining(['thickness-1', 'height-20'])
    );
    expect(buttonCore.e1.p?.gd).toEqual({ 'md:1': 'thickness-1' });
    expect(separatorPalette.e1.c?.s?.neutral).toEqual({ m: 'neutral-line' });
    expect(dropdownPalette.e7.c?.s?.neutral).toEqual({ m: 'neutral-line' });
    expect(buttonPalette.e6.c?.s?.neutral).toEqual({ m: 'neutral-line' });
  });

  it('carries the Icon scale and both surface-context color branches from schema to class maps', () => {
    const schema = {
      name: 'Icon pipeline test',
      version: [1, 0, 0],
      author: 'Kiskadee',
      breakpoints: { 'bp:all': 0 },
      global: {
        iconSizes: {
          's:sm:2': 12,
          's:md:1': 20
        }
      },
      components: {
        icon: {
          elements: {
            e1: {
              name: 'glyph',
              iconSize: {
                's:sm:2': 's:sm:2'
              },
              palettes: {
                default: {
                  light: {
                    onSubtle: {
                      textColor: {
                        neutral: { medium: { rest: '#21242d' } },
                        primary: { medium: { rest: '#0064b4' } }
                      }
                    },
                    onVivid: {
                      textColor: {
                        neutral: { medium: { rest: '#d6dbe7' } },
                        primary: { medium: { rest: '#c1deff' } }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } satisfies Schema;

    const { styleKeys, toneMetadataByPalette } = convertElementSchemaToStyleKeys(schema);
    const out = generateClassNamesMapSplit(
      styleKeys,
      {
        boxWidth__12: 'width-12',
        boxHeight__12: 'height-12',
        'textColor__#21242d': 'neutral-subtle',
        'textColor__#0064b4': 'primary-subtle',
        'textColor__#d6dbe7': 'neutral-vivid',
        'textColor__#c1deff': 'primary-vivid'
      },
      toneMetadataByPalette
    );

    const coreIcon = out.core.icon as Record<string, ClassNameByElementJSON>;
    const lightIcon = out.palettes['default.light'].icon as Record<string, ClassNameByElementJSON>;

    expect(coreIcon.e1.s?.['sm:2']?.split(' ')).toEqual(
      expect.arrayContaining(['width-12', 'height-12'])
    );
    expect(lightIcon.e1.c?.s?.neutral).toEqual({ m: 'neutral-subtle' });
    expect(lightIcon.e1.c?.s?.primary).toEqual({ m: 'primary-subtle' });
    expect(lightIcon.e1.c?.v?.neutral).toEqual({ m: 'neutral-vivid' });
    expect(lightIcon.e1.c?.v?.primary).toEqual({ m: 'primary-vivid' });
  });

  it('publishes Dropdown checkmark geometry and color through the generic element pipeline', () => {
    const schema = {
      name: 'Dropdown checkmark pipeline test',
      version: [1, 0, 0],
      author: 'Kiskadee',
      breakpoints: { 'bp:all': 0 },
      global: {
        iconSizes: {
          's:md:1': 20
        }
      },
      components: {
        dropdown: {
          elements: {
            e10: {
              name: 'dropdown-checkmark',
              iconSize: { 's:all': 's:md:1' },
              scales: { paddingRight: 4 },
              palettes: {
                default: {
                  light: {
                    onSubtle: {
                      textColor: {
                        neutral: { medium: { rest: '#21242d' } }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } as unknown as Schema;

    const { styleKeys, toneMetadataByPalette } = convertElementSchemaToStyleKeys(schema);
    const out = generateClassNamesMapSplit(
      styleKeys,
      {
        boxWidth__20: 'width-20',
        boxHeight__20: 'height-20',
        paddingRight__4: 'inset-4',
        'textColor__#21242d': 'neutral-text'
      },
      toneMetadataByPalette
    );

    const dropdownCore = out.core.dropdown as Record<string, ClassNameByElementJSON>;
    const dropdownPalette = out.palettes['default.light'].dropdown as Record<
      string,
      ClassNameByElementJSON
    >;

    expect(dropdownCore.e10.s?.all?.split(' ')).toEqual(
      expect.arrayContaining(['width-20', 'height-20', 'inset-4'])
    );
    expect(dropdownPalette.e10.c?.s?.neutral).toEqual({ m: 'neutral-text' });
  });

  it('reuses the mirrored canonical class name for raw and mirrored scale consumers', () => {
    const styleKeys = {
      button: {
        e1: {
          scales: {
            's:md:1': ['borderWidth__2']
          }
        }
      },
      card: {
        e1: {
          scales: {
            's:md:1': ['borderWidth__2']
          }
        }
      }
    } as unknown as ComponentStyleKeyMap;

    const shortenMap = {
      'borderWidth__2@@m': 'bw1'
    } as ShortenCssClassNames;

    const toneMetadataByPalette = new Map() as ToneMetadataByPalette;
    const out = generateClassNamesMapSplit(styleKeys, shortenMap, toneMetadataByPalette, {
      webStyleEmissionPolicy: DEFAULT_WEB_STYLE_EMISSION_POLICY,
      collapseDirectIntoMirrored: true
    });

    const button = out.core.button as Record<string, ClassNameByElementJSON>;
    const card = out.core.card as Record<string, ClassNameByElementJSON>;

    expect(button.e1.s?.['md:1']).toBe('bw1');
    expect(card.e1.s?.['md:1']).toBe('bw1');
  });

  it('keeps raw and mirrored class names separate when collapse is disabled', () => {
    const styleKeys = {
      button: {
        e1: {
          scales: {
            's:md:1': ['borderWidth__2']
          }
        }
      },
      card: {
        e1: {
          scales: {
            's:md:1': ['borderWidth__2']
          }
        }
      }
    } as unknown as ComponentStyleKeyMap;

    const shortenMap = {
      borderWidth__2: 'bw0',
      'borderWidth__2@@m': 'bw1'
    } as ShortenCssClassNames;

    const toneMetadataByPalette = new Map() as ToneMetadataByPalette;
    const out = generateClassNamesMapSplit(styleKeys, shortenMap, toneMetadataByPalette, {
      webStyleEmissionPolicy: DEFAULT_WEB_STYLE_EMISSION_POLICY
    });

    const button = out.core.button as Record<string, ClassNameByElementJSON>;
    const card = out.core.card as Record<string, ClassNameByElementJSON>;

    expect(button.e1.s?.['md:1']).toBe('bw1');
    expect(card.e1.s?.['md:1']).toBe('bw0');
  });

  it('generates class maps for later eN elements when the first element is empty', () => {
    const colorKey = 'textColor__#000000';
    const styleKeys = {
      textField: {
        standard: {
          outline: {
            e1: {},
            e3: {
              scales: {
                's:md:1': ['boxHeight__40', 'paddingLeft__12']
              }
            },
            e4: {
              palettes: {
                default: {
                  light: {
                    onSubtle: {
                      neutral: {
                        rest: [colorKey]
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } as unknown as ComponentStyleKeyMap;
    const toneMetadataByPalette = new Map([
      [
        'default.light.onSubtle',
        new Map([
          [
            buildScopedToneMetadataKey(
              {
                componentName: 'textField',
                variantName: 'standard',
                modeName: 'outline',
                elementName: 'e4'
              },
              `neutral::${colorKey}`
            ),
            { tones: ['medium'] }
          ]
        ])
      ]
    ]) as ToneMetadataByPalette;

    const out = generateClassNamesMapSplit(
      styleKeys,
      {
        boxHeight__40: 'tf-height',
        paddingLeft__12: 'tf-padding',
        [colorKey]: 'tf-color'
      },
      toneMetadataByPalette
    );

    const coreTextField = out.core.textField as Record<
      string,
      Record<string, ClassNameByElementJSON>
    >;
    const paletteTextField = out.palettes['default.light'].textField as Record<
      string,
      Record<string, ClassNameByElementJSON>
    >;
    const coreOutline = coreTextField.standard.outline;
    const paletteOutline = paletteTextField.standard.outline;

    expect((coreOutline as any).e1).toEqual({
      d: undefined,
      e: undefined,
      l: undefined,
      s: undefined,
      w: undefined,
      rr: undefined,
      rp: undefined,
      rs: undefined
    });
    expect((coreOutline as any).e3.s?.['md:1']).toBe('tf-height tf-padding');
    expect((paletteOutline as any).e4.c?.s?.neutral).toEqual({
      m: 'tf-color'
    });
  });

  it('keeps shared palette style keys in the tone bucket declared by the current element', () => {
    const sharedColor = '#000000' as const;
    const schema = {
      name: 'Test Design System',
      version: [1, 0, 0],
      author: 'Kiskadee',
      breakpoints: {
        'bp:all': 0
      },
      components: {
        button: {
          elements: {
            e2: {
              name: 'label',
              palettes: {
                default: {
                  light: {
                    onSubtle: {
                      textColor: {
                        primary: {
                          high: {
                            rest: sharedColor
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            e3: {
              name: 'icon',
              palettes: {
                default: {
                  light: {
                    onSubtle: {
                      textColor: {
                        primary: {
                          medium: {
                            rest: sharedColor
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
    } satisfies Schema;

    const { styleKeys, toneMetadataByPalette } = convertElementSchemaToStyleKeys(schema);
    const out = generateClassNamesMapSplit(
      styleKeys,
      {
        'textColor__#000000': 'txt'
      },
      toneMetadataByPalette
    );

    const button = out.palettes['default.light'].button as Record<string, ClassNameByElementJSON>;
    const e2Primary = button.e2.c?.s?.primary as ColorClasses;
    const e3Primary = button.e3.c?.s?.primary as ColorClasses;

    expect(e2Primary).toEqual({
      h: 'txt'
    });
    expect(e3Primary).toEqual({
      m: 'txt'
    });
  });

  it('isolates emphasis metadata and class-map buckets by surface context', () => {
    const schema = {
      name: 'Surface context test',
      version: [1, 0, 0],
      author: 'Kiskadee',
      breakpoints: { 'bp:all': 0 },
      components: {
        button: {
          elements: {
            e1: {
              name: 'button',
              palettes: {
                default: {
                  light: {
                    onSubtle: {
                      boxColor: {
                        primary: { high: { rest: '#ffffff' } }
                      }
                    },
                    onVivid: {
                      boxColor: {
                        primary: { low: { rest: '#ffffff' } }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } satisfies Schema;

    const { styleKeys, toneMetadataByPalette } = convertElementSchemaToStyleKeys(schema);
    const out = generateClassNamesMapSplit(
      styleKeys,
      { 'boxColor__#ffffff': 'surface' },
      toneMetadataByPalette
    );
    const button = out.palettes['default.light'].button as Record<string, ClassNameByElementJSON>;

    expect(button.e1.c?.s?.primary).toEqual({ h: 'surface' });
    expect(button.e1.c?.v?.primary).toEqual({ l: 'surface' });
  });

  it('groups border radius effects by size inside effect buckets', () => {
    const styleKeys = {
      button: {
        e1: {
          effects: {
            hover: [
              'borderRadiusRounded--hover__20',
              'borderRadiusRounded--hover++s:md:1__16',
              'borderRadiusRounded--hover++s:lg:1__12'
            ]
          }
        }
      }
    } as unknown as ComponentStyleKeyMap;

    const toneMetadataByPalette = new Map() as ToneMetadataByPalette;
    const out = generateClassNamesMapSplit(
      styleKeys,
      {} as ShortenCssClassNames,
      toneMetadataByPalette
    );

    const button = out.core.button as Record<string, ClassNameByElementJSON>;

    expect(button.e1.e).toEqual({
      rr: {
        all: 'borderRadiusRounded--hover__20',
        'md:1': 'borderRadiusRounded--hover++s:md:1__16',
        'lg:1': 'borderRadiusRounded--hover++s:lg:1__12'
      }
    });
  });

  it('groups activation feedback profile effects by profile capability buckets', () => {
    const baseKey = buildStyleKey({
      propertyName: 'activationFeedback',
      value: {}
    });
    const rippleKey = buildStyleKey({
      propertyName: 'activationFeedbackProfile',
      value: { profile: 'ripple' }
    });
    const overflowKey = buildStyleKey({
      propertyName: 'activationFeedbackProfile',
      value: { profile: 'ripple-overflow' }
    });
    const haloKey = buildStyleKey({
      propertyName: 'activationFeedbackProfile',
      value: { profile: 'halo' }
    });
    const pressedKey = buildStyleKey({
      propertyName: 'activationFeedbackProfile',
      value: { profile: 'pressed' }
    });
    const styleKeys = {
      button: {
        e1: {
          effects: {
            rest: [baseKey, rippleKey, overflowKey, haloKey, pressedKey]
          }
        }
      }
    } as unknown as ComponentStyleKeyMap;

    const out = generateClassNamesMapSplit(
      styleKeys,
      {
        [baseKey]: 'af-base',
        [rippleKey]: 'af-ripple',
        [overflowKey]: 'af-overflow',
        [haloKey]: 'af-halo',
        [pressedKey]: 'af-pressed'
      },
      new Map() as ToneMetadataByPalette
    );

    const button = out.core.button as Record<string, ClassNameByElementJSON>;

    expect(button.e1.e).toEqual({
      af: 'af-base',
      afs: 'af-ripple',
      afo: 'af-overflow',
      afx: 'af-halo',
      afp: 'af-pressed'
    });
  });

  it('throws when activation feedback profile effects use an unknown profile', () => {
    const invalidKey = buildStyleKey({
      propertyName: 'activationFeedbackProfile',
      value: { profile: 'hallo' }
    });
    const styleKeys = {
      button: {
        e1: {
          effects: {
            rest: [invalidKey]
          }
        }
      }
    } as unknown as ComponentStyleKeyMap;

    expect(() =>
      generateClassNamesMapSplit(
        styleKeys,
        {
          [invalidKey]: 'af-invalid'
        },
        new Map() as ToneMetadataByPalette
      )
    ).toThrowError(`Unable to resolve activation feedback bucket for style key "${invalidKey}".`);
  });
});
