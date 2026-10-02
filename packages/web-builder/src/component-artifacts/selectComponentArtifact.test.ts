import type { Schema } from '@kiskadee/core';
import { expect, it } from 'vitest';
import { convertElementSchemaToStyleKeys } from '../phase-1-convert-schema-to-style-keys/convertElementSchemaToStyleKeys.ts';
import { buildSelectComponentArtifact } from './selectComponentArtifact.ts';

it('publishes defaults and modes without copying visual elements into metadata', () => {
  const schema = {
    components: {
      select: {
        variants: {
          standard: {
            modes: {
              outline: { elements: { e4: { name: 'trigger' } } },
              underline: { elements: { e7: { name: 'indicator' } } },
              borderless: { elements: { e11: { name: 'placeholder' } } }
            }
          }
        }
      }
    }
  } as Schema;
  expect(buildSelectComponentArtifact(schema)).toEqual({
    component: 'select',
    options: {
      variant: 'standard',
      mode: 'outline',
      focusIndicator: 'underline',
      focusRingColorSource: 'global',
      showDividers: false
    },
    modes: ['outline', 'underline', 'borderless'],
    modeOptions: {
      outline: { focusIndicator: 'underline', focusRingColorSource: 'global', showDividers: false },
      underline: {
        focusIndicator: 'underline',
        focusRingColorSource: 'global',
        showDividers: false
      },
      borderless: {
        focusIndicator: 'underline',
        focusRingColorSource: 'global',
        showDividers: false
      }
    }
  });
  expect(buildSelectComponentArtifact({ components: {} } as Schema)).toBeNull();
});

it('resolves mode presentation over component options without leaking recipe values', () => {
  const schema = {
    components: {
      select: {
        options: {
          mode: 'borderless',
          focusIndicator: 'outer',
          focusRingColorSource: 'global',
          showDividers: true
        },
        variants: {
          standard: {
            modes: {
              outline: {
                options: { focusIndicator: 'inner', focusRingColorSource: 'component' },
                elements: { e4: { name: 'trigger' } }
              },
              underline: { options: { focusIndicator: 'underline' }, elements: {} },
              borderless: { options: { showDividers: false }, elements: {} }
            }
          }
        }
      }
    }
  } as Schema;
  const artifact = buildSelectComponentArtifact(schema)!;
  expect(artifact.options.mode).toBe('borderless');
  expect(artifact.options.focusIndicator).toBe('outer');
  expect(artifact.modeOptions).toEqual({
    outline: { focusIndicator: 'inner', focusRingColorSource: 'component', showDividers: true },
    underline: { focusIndicator: 'underline', focusRingColorSource: 'global', showDividers: true },
    borderless: { focusIndicator: 'outer', focusRingColorSource: 'global', showDividers: false }
  });
  expect(JSON.stringify(artifact)).not.toContain('elements');
});

it('lowers Select dividers through shared separator profiles and diagnoses missing authorship', () => {
  const schema = {
    name: 'select-divider-test',
    version: [1, 0, 0],
    author: 'Kiskadee',
    breakpoints: { 'bp:all': 0 },
    global: {
      separators: {
        profiles: {
          subtle: {
            scales: { boxWidth: 1 },
            palettes: {
              default: {
                light: {
                  onSubtle: { boxColor: { neutral: { medium: { rest: '#dddddd' } } } }
                }
              }
            }
          }
        }
      }
    },
    components: {
      select: {
        variants: {
          standard: {
            modes: {
              outline: {
                elements: {
                  e12: {
                    name: 'divider',
                    separator: { 's:all': 'subtle' },
                    scales: { boxHeight: 20 }
                  }
                }
              }
            }
          }
        }
      }
    }
  } as Schema;
  const { styleKeys } = convertElementSchemaToStyleKeys(schema);
  const divider = styleKeys.select?.standard?.outline?.e12;
  expect(divider?.scales?.['s:all']).toEqual(
    expect.arrayContaining(['boxWidth__1', 'boxHeight__20'])
  );
  expect(divider?.palettes).toEqual({
    default: { light: { onSubtle: { neutral: { rest: ['boxColor__#dddddd'] } } } }
  });
  expect(() => convertElementSchemaToStyleKeys({ ...schema, global: {} })).toThrow(
    'select.e12 references separator without global.separators'
  );
});

it('publishes positioner geometry as scale keys for the consumer, without local fallback values', () => {
  const schema = {
    components: {
      select: {
        variants: {
          standard: {
            modes: {
              outline: {
                elements: {
                  e13: {
                    name: 'positioner',
                    scales: {
                      marginTop: 13,
                      paddingTop: 3,
                      paddingRight: 5,
                      paddingBottom: 7,
                      paddingLeft: 11
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  } as Schema;
  const { styleKeys } = convertElementSchemaToStyleKeys(schema);
  expect(styleKeys.select?.standard?.outline?.e13?.scales?.['s:all']).toEqual(
    expect.arrayContaining([
      'marginTop__13',
      'paddingTop__3',
      'paddingRight__5',
      'paddingBottom__7',
      'paddingLeft__11'
    ])
  );
});
