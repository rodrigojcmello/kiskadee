import type { ComponentClassNameMapJSON } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { mergeMaps } from './merge-class-maps.ts';

describe('mergeMaps', () => {
  it('preserves core size buckets and overlays palette colors when the first eN element is empty', () => {
    const core = {
      textField: {
        standard: {
          outline: {
            e1: {},
            e3: {
              d: 'control-core',
              s: {
                'md:1': 'control-size'
              },
              rr: {
                'md:1': 'control-radius'
              }
            },
            e4: {
              s: {
                'md:1': 'input-size'
              }
            }
          }
        }
      }
    } as unknown as ComponentClassNameMapJSON;
    const palette = {
      textField: {
        standard: {
          outline: {
            e3: {
              c: {
                neutral: {
                  m: 'control-color'
                }
              }
            },
            e4: {
              c: {
                neutral: {
                  m: 'input-color'
                }
              }
            }
          }
        }
      }
    } as unknown as ComponentClassNameMapJSON;

    const merged = mergeMaps(core, palette) as Record<string, any>;
    const outline = merged.textField.standard.outline;

    expect(outline.e1).toEqual({});
    expect(outline.e3).toEqual({
      d: 'control-core',
      s: {
        'md:1': 'control-size'
      },
      rr: {
        'md:1': 'control-radius'
      },
      c: {
        neutral: {
          m: 'control-color'
        }
      }
    });
    expect(outline.e4).toEqual({
      s: {
        'md:1': 'input-size'
      },
      c: {
        neutral: {
          m: 'input-color'
        }
      }
    });
  });
});
