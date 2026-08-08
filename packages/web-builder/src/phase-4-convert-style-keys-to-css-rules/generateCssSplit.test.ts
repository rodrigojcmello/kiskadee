import type { ComponentStyleKeyMap } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import type { ShortenCssClassNames } from '../phase-3-shorten-css-class-names/shortenCssClassNames.ts';
import { DEFAULT_WEB_STYLE_EMISSION_POLICY } from '../style-emission/web-build-policy.ts';
import { generateCssSplit } from './generateCssSplit.ts';

describe('generateCssSplit', () => {
  it('keeps base rules first and orders min-width utilities from smallest to largest', async () => {
    const input = {
      button: {
        e2: {
          scales: {
            's:md:1': [
              'textSize++s:md:1::bp:lg:1__20',
              'textSize__16',
              'textSize++s:md:1::bp:sm:1__17',
              'textSize++s:md:1::bp:md:1__18'
            ]
          }
        }
      }
    } as any;
    const shortenMap = {
      'textSize++s:md:1::bp:lg:1__20': 'large',
      textSize__16: 'base',
      'textSize++s:md:1::bp:sm:1__17': 'small',
      'textSize++s:md:1::bp:md:1__18': 'medium'
    };

    const result = await generateCssSplit(input, shortenMap, {
      breakpoints: {
        'bp:all': 0,
        'bp:sm:1': 320,
        'bp:md:1': 568,
        'bp:lg:1': 1152
      }
    });
    const baseIndex = result.coreCss.indexOf('.base');
    const smallIndex = result.coreCss.indexOf('(min-width: 320px)');
    const mediumIndex = result.coreCss.indexOf('(min-width: 568px)');
    const largeIndex = result.coreCss.indexOf('(min-width: 1152px)');

    expect(baseIndex).toBeGreaterThanOrEqual(0);
    expect(baseIndex).toBeLessThan(smallIndex);
    expect(smallIndex).toBeLessThan(mediumIndex);
    expect(mediumIndex).toBeLessThan(largeIndex);
  });

  it('uses a code-unit tie-break for reproducible core rule ordering', async () => {
    const input = {
      button: {
        e1: {
          decorations: ['borderStyle__none', 'textWeight__bold']
        }
      }
    } as unknown as ComponentStyleKeyMap;
    const result = await generateCssSplit(input, {
      borderStyle__none: 'a-b',
      textWeight__bold: 'a_b'
    });

    expect(result.coreCss.indexOf('.a-b')).toBeLessThan(result.coreCss.indexOf('.a_b'));
  });

  it('returns empty bundles for empty input', async () => {
    const input = {} as ComponentStyleKeyMap;
    const shortenMap: ShortenCssClassNames = {};
    const result = await generateCssSplit(input, shortenMap);

    expect(result.coreCss).toBe('');
    expect(result.effectsCss).toBe('');
    expect(result.palettes).toEqual({});
  });

  it('generates core CSS for decorations', async () => {
    const input = {
      button: {
        e1: {
          decorations: ['borderStyle__none', 'textWeight__bold']
        }
      }
    } as unknown as ComponentStyleKeyMap;
    const shortenMap: ShortenCssClassNames = {
      borderStyle__none: 'bs1',
      textWeight__bold: 'tw1'
    };
    const result = await generateCssSplit(input, shortenMap);

    expect(result.coreCss).toContain('.bs1');
    expect(result.coreCss).toContain('border-style');
    expect(result.coreCss).toContain('.tw1');
    expect(result.coreCss).toContain('font-weight');
    expect(result.effectsCss).toBe('');
    expect(result.palettes).toEqual({});
  });

  it('generates core CSS for scales', async () => {
    const input = {
      button: {
        e1: {
          scales: {
            's:md:1': ['paddingTop__@md>16px', 'paddingBottom__@md>16px']
          }
        }
      }
    } as unknown as ComponentStyleKeyMap;
    const shortenMap: ShortenCssClassNames = {
      'paddingTop__@md>16px': 'pt1',
      'paddingBottom__@md>16px': 'pb1'
    };
    const result = await generateCssSplit(input, shortenMap);

    expect(result.coreCss).toContain('.pt1');
    expect(result.coreCss).toContain('padding-top');
    expect(result.coreCss).toContain('.pb1');
    expect(result.coreCss).toContain('padding-bottom');
    expect(result.effectsCss).toBe('');
    expect(result.palettes).toEqual({});
  });

  it('generates effects CSS with gating logic', async () => {
    const input = {
      button: {
        e1: {
          effects: {
            hover: ['shadow--hover__[0,4,10,"#00000059"]'],
            focus: ['shadow--focus__[0,4,10,"#00000059"]']
          }
        }
      }
    } as unknown as ComponentStyleKeyMap;
    const shortenMap: ShortenCssClassNames = {
      'shadow--hover__[0,4,10,"#00000059"]': 'sh1',
      'shadow--focus__[0,4,10,"#00000059"]': 'sh2'
    };
    const result = await generateCssSplit(input, shortenMap);

    expect(result.coreCss).toBe('');
    expect(result.effectsCss).toContain('.sh1');
    expect(result.effectsCss).toContain('box-shadow');
    // Should have gating selectors (native pseudos or forced state classes)
    expect(result.effectsCss).toMatch(/:(hover|focus)|\.-([hfa])/);
    expect(result.palettes).toEqual({});
  });

  it('generates palette CSS with segment.theme composite keys', async () => {
    const input = {
      button: {
        e1: {
          palettes: {
            ios: {
              light: {
                onSubtle: {
                  primary: {
                    rest: ['boxColor__#0091ff']
                  }
                }
              }
            }
          }
        }
      }
    } as unknown as ComponentStyleKeyMap;
    const shortenMap: ShortenCssClassNames = {
      'boxColor__#0091ff': 'bc1'
    };
    const result = await generateCssSplit(input, shortenMap);

    expect(result.coreCss).toBe('');
    expect(result.effectsCss).toBe('');
    expect(Object.keys(result.palettes)).toEqual(['ios.light']);
    expect(result.palettes['ios.light']).toContain('.bc1');
    expect(result.palettes['ios.light']).toContain('background');
  });

  it('emits onSubtle and onVivid surface contexts into the same segment.theme CSS bundle', async () => {
    const input = {
      button: {
        e1: {
          palettes: {
            ios: {
              light: {
                onSubtle: {
                  primary: { rest: ['boxColor__#0091ff'] }
                },
                onVivid: {
                  primary: { rest: ['boxColor__#ffffff'] }
                }
              }
            }
          }
        }
      }
    } as unknown as ComponentStyleKeyMap;

    const result = await generateCssSplit(input, {
      'boxColor__#0091ff': 'on-subtle-color',
      'boxColor__#ffffff': 'on-vivid-color'
    });

    expect(Object.keys(result.palettes)).toEqual(['ios.light']);
    expect(result.palettes['ios.light']).toContain('.on-subtle-color');
    expect(result.palettes['ios.light']).toContain('.on-vivid-color');
  });

  it('generates multiple palette bundles for multiple segment.theme combinations', async () => {
    const input = {
      button: {
        e1: {
          palettes: {
            ios: {
              light: {
                onSubtle: {
                  primary: {
                    rest: ['boxColor__#0091ff']
                  }
                }
              },
              dark: {
                onSubtle: {
                  primary: {
                    rest: ['boxColor__#005799']
                  }
                }
              }
            },
            youtube: {
              light: {
                onSubtle: {
                  primary: {
                    rest: ['boxColor__#000000']
                  }
                }
              }
            }
          }
        }
      }
    } as unknown as ComponentStyleKeyMap;
    const shortenMap: ShortenCssClassNames = {
      'boxColor__#0091ff': 'bc1',
      'boxColor__#005799': 'bc2',
      'boxColor__#000000': 'bc3'
    };
    const result = await generateCssSplit(input, shortenMap);

    expect(result.coreCss).toBe('');
    expect(result.effectsCss).toBe('');
    expect(Object.keys(result.palettes).sort()).toEqual(['ios.dark', 'ios.light', 'youtube.light']);

    expect(result.palettes['ios.light']).toContain('.bc1');
    expect(result.palettes['ios.dark']).toContain('.bc2');
    expect(result.palettes['youtube.light']).toContain('.bc3');
  });

  it('handles palette colors with multiple interaction states', async () => {
    const input = {
      button: {
        e1: {
          palettes: {
            ios: {
              light: {
                onSubtle: {
                  primary: {
                    rest: ['boxColor__#0091ff'],
                    hover: ['boxColor==hover__#0074cccc'],
                    pressed: ['boxColor--pressed__#33a7ffcc']
                  }
                }
              }
            }
          }
        }
      }
    } as unknown as ComponentStyleKeyMap;
    const shortenMap: ShortenCssClassNames = {
      'boxColor__#0091ff': 'bc1',
      'boxColor==hover__#0074cccc': 'bc2',
      'boxColor--pressed__#33a7ffcc': 'bc3'
    };
    const result = await generateCssSplit(input, shortenMap);

    expect(result.palettes['ios.light']).toContain('.bc1');
    expect(result.palettes['ios.light']).toContain('.bc2');
    expect(result.palettes['ios.light']).toContain('.bc3');
  });

  it('handles palette colors with multiple semantic colors', async () => {
    const input = {
      button: {
        e1: {
          palettes: {
            ios: {
              light: {
                onSubtle: {
                  primary: {
                    rest: ['boxColor__#0091ff']
                  },
                  secondary: {
                    rest: ['boxColor__#29a3a3']
                  },
                  redLike: {
                    rest: ['boxColor__#ec1313']
                  }
                }
              }
            }
          }
        }
      }
    } as unknown as ComponentStyleKeyMap;
    const shortenMap: ShortenCssClassNames = {
      'boxColor__#0091ff': 'bc1',
      'boxColor__#29a3a3': 'bc2',
      'boxColor__#ec1313': 'bc3'
    };
    const result = await generateCssSplit(input, shortenMap);

    const iosLight = result.palettes['ios.light'];
    expect(iosLight).toContain('.bc1');
    expect(iosLight).toContain('.bc2');
    expect(iosLight).toContain('.bc3');
  });

  it('combines decorations, scales, effects, and palettes correctly', async () => {
    const input = {
      button: {
        e1: {
          decorations: ['borderStyle__none'],
          scales: {
            's:md:1': ['paddingTop__@md>16px']
          },
          effects: {
            hover: ['shadow--hover__[0,4,10,"#00000059"]']
          },
          palettes: {
            ios: {
              light: {
                onSubtle: {
                  primary: {
                    rest: ['boxColor__#0091ff']
                  }
                }
              }
            }
          }
        }
      }
    } as ComponentStyleKeyMap;
    const shortenMap: ShortenCssClassNames = {
      borderStyle__none: 'bs1',
      'paddingTop__@md>16px': 'pt1',
      'shadow--hover__[0,4,10,"#00000059"]': 'sh1',
      'boxColor__#0091ff': 'bc1'
    };
    const result = await generateCssSplit(input, shortenMap);

    // Decorations and scales go to core
    expect(result.coreCss).toContain('.bs1');
    expect(result.coreCss).toContain('.pt1');

    // Effects go to effects bundle
    expect(result.effectsCss).toContain('.sh1');

    // Palettes go to palette bundles
    expect(result.palettes['ios.light']).toContain('.bc1');
  });

  it('handles multiple elements in the same component', async () => {
    const input = {
      button: {
        e1: {
          decorations: ['borderStyle__none']
        },
        e2: {
          decorations: ['textWeight__bold']
        }
      }
    } as unknown as ComponentStyleKeyMap;
    const shortenMap: ShortenCssClassNames = {
      borderStyle__none: 'bs1',
      textWeight__bold: 'tw1'
    };
    const result = await generateCssSplit(input, shortenMap);

    expect(result.coreCss).toContain('.bs1');
    expect(result.coreCss).toContain('.tw1');
  });

  it('generates CSS for later eN elements when the first element is empty', async () => {
    const input = {
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
                        rest: ['textColor__#000000']
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
    const shortenMap: ShortenCssClassNames = {
      boxHeight__40: 'tf-height',
      paddingLeft__12: 'tf-padding',
      'textColor__#000000': 'tf-color'
    };

    const result = await generateCssSplit(input, shortenMap);

    expect(result.coreCss).toContain('.tf-height');
    expect(result.coreCss).toContain('height');
    expect(result.coreCss).toContain('.tf-padding');
    expect(result.coreCss).toContain('padding-left');
    expect(result.palettes['default.light']).toContain('.tf-color');
    expect(result.palettes['default.light']).toContain('color');
  });

  it('handles multiple components', async () => {
    const input = {
      button: {
        e1: {
          decorations: ['borderStyle__none']
        }
      },
      tabs: {
        line: {
          e1: {
            decorations: ['textWeight__bold']
          }
        }
      }
    } as unknown as ComponentStyleKeyMap;
    const shortenMap: ShortenCssClassNames = {
      borderStyle__none: 'bs1',
      textWeight__bold: 'tw1'
    };
    const result = await generateCssSplit(input, shortenMap);

    expect(result.coreCss).toContain('.bs1');
    expect(result.coreCss).toContain('.tw1');
  });

  it('uses shortened class names from shortenMap', async () => {
    const input = {
      button: {
        e1: {
          decorations: ['borderStyle__none']
        }
      }
    } as unknown as ComponentStyleKeyMap;
    const shortenMap: ShortenCssClassNames = {
      borderStyle__none: 'a'
    };
    const result = await generateCssSplit(input, shortenMap);

    expect(result.coreCss).toContain('.a');
    expect(result.coreCss).not.toContain('borderStyle__none');
  });

  it('uses original key when not in shortenMap', async () => {
    const input = {
      button: {
        e1: {
          decorations: ['borderStyle__none']
        }
      }
    } as unknown as ComponentStyleKeyMap;
    const shortenMap: ShortenCssClassNames = {};
    const result = await generateCssSplit(input, shortenMap);

    expect(result.coreCss).toContain('.borderStyle__none');
  });

  it('handles forceState flag for color keys', async () => {
    const input = {
      button: {
        e1: {
          palettes: {
            ios: {
              light: {
                onSubtle: {
                  primary: {
                    rest: ['boxColor__#0091ff'],
                    hover: ['boxColor==hover__#0074cccc']
                  }
                }
              }
            }
          }
        }
      }
    } as unknown as ComponentStyleKeyMap;
    const shortenMap: ShortenCssClassNames = {
      'boxColor__#0091ff': 'bc1',
      'boxColor==hover__#0074cccc': 'bc2'
    };

    // Without forceState flag
    const resultNoForce = await generateCssSplit(input, shortenMap, false);
    expect(resultNoForce.palettes['ios.light']).toBeTruthy();

    // With forceState flag
    const resultWithForce = await generateCssSplit(input, shortenMap, true);
    expect(resultWithForce.palettes['ios.light']).toBeTruthy();

    // Both should generate CSS, but forceState may affect selector structure
    expect(resultWithForce.palettes['ios.light']).toContain('.bc1');
    expect(resultWithForce.palettes['ios.light']).toContain('.bc2');
  });

  it('skips undefined or empty elements', async () => {
    const input = {
      button: {
        e1: {
          decorations: undefined,
          scales: {},
          effects: {},
          palettes: {}
        }
      }
    } as unknown as ComponentStyleKeyMap;
    const shortenMap: ShortenCssClassNames = {};
    const result = await generateCssSplit(input, shortenMap);

    expect(result.coreCss).toBe('');
    expect(result.effectsCss).toBe('');
    expect(result.palettes).toEqual({});
  });

  it('handles nested segment and theme structures correctly', async () => {
    const input = {
      button: {
        e1: {
          palettes: {
            ios: {
              light: {
                onSubtle: {
                  primary: {
                    rest: ['boxColor__#0091ff']
                  }
                }
              },
              dark: {
                onSubtle: {
                  primary: {
                    rest: ['boxColor__#005799']
                  }
                }
              }
            }
          }
        },
        e2: {
          palettes: {
            ios: {
              light: {
                onSubtle: {
                  primary: {
                    rest: ['textColor__#ffffff']
                  }
                }
              }
            }
          }
        }
      }
    } as unknown as ComponentStyleKeyMap;
    const shortenMap: ShortenCssClassNames = {
      'boxColor__#0091ff': 'bc1',
      'boxColor__#005799': 'bc2',
      'textColor__#ffffff': 'tc1'
    };
    const result = await generateCssSplit(input, shortenMap);

    // Both elements should contribute to ios.light bundle
    expect(result.palettes['ios.light']).toContain('.bc1');
    expect(result.palettes['ios.light']).toContain('.tc1');

    // Only e1 contributes to ios.dark
    expect(result.palettes['ios.dark']).toContain('.bc2');
    expect(result.palettes['ios.dark']).not.toContain('.tc1');
  });

  it('generates valid CSS with proper syntax', async () => {
    const input = {
      button: {
        e1: {
          decorations: ['borderStyle__none'],
          palettes: {
            ios: {
              light: {
                onSubtle: {
                  primary: {
                    rest: ['boxColor__#0091ff']
                  }
                }
              }
            }
          }
        }
      }
    } as unknown as ComponentStyleKeyMap;
    const shortenMap: ShortenCssClassNames = {
      borderStyle__none: 'bs1',
      'boxColor__#0091ff': 'bc1'
    };
    const result = await generateCssSplit(input, shortenMap);

    // Check for basic CSS syntax elements
    expect(result.coreCss).toMatch(/\./); // Has class selector
    expect(result.coreCss).toMatch(/\{/); // Has opening brace
    expect(result.coreCss).toMatch(/}/); // Has closing brace
    expect(result.coreCss).toMatch(/:/); // Has property-value separator

    expect(result.palettes['ios.light']).toMatch(/\./);
    expect(result.palettes['ios.light']).toMatch(/\{/);
    expect(result.palettes['ios.light']).toMatch(/}/);
    expect(result.palettes['ios.light']).toMatch(/:/);
  });

  it('reuses one mirrored class when raw and mirrored consumers share the same scale value', async () => {
    const input = {
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

    const shortenMap: ShortenCssClassNames = {
      'borderWidth__2@@m': 'bw1'
    };

    const result = await generateCssSplit(input, shortenMap, {
      webStyleEmissionPolicy: DEFAULT_WEB_STYLE_EMISSION_POLICY,
      collapseDirectIntoMirrored: true
    });

    expect(result.coreCss).toContain('.bw1');
    expect(result.coreCss).toContain('--k-bdw: 2px; border-width: 2px');
    expect(result.coreCss.match(/\.bw1 \{/g)).toHaveLength(1);
  });

  it('keeps raw and mirrored classes separate when collapse is disabled', async () => {
    const input = {
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

    const shortenMap: ShortenCssClassNames = {
      borderWidth__2: 'bw0',
      'borderWidth__2@@m': 'bw1'
    };

    const result = await generateCssSplit(input, shortenMap, {
      webStyleEmissionPolicy: DEFAULT_WEB_STYLE_EMISSION_POLICY
    });

    expect(result.coreCss).toContain('.bw0 { border-width: 2px }');
    expect(result.coreCss).toContain('.bw1 { --k-bdw: 2px; border-width: 2px }');
  });
});
