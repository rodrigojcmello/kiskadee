/** @vitest-environment jsdom */
import type { ComponentClassMapArtifactJSON } from '@kiskadee/web-builder/types';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { createElement as h } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  type ComponentClassMapScope,
  KiskadeeContext,
  type KiskadeeContextValue
} from './KiskadeeContext.tsx';
import { useComponentClassMap } from './useComponentClassMap.ts';

type TextFieldClassMap = Record<string, any>;

const coreClassMap = {
  standard: {
    outline: {
      e1: {},
      e3: {
        d: 'control-core',
        p: {
          connected: {
            all: 'control-projection-all',
            'md:1': 'control-projection-medium-core'
          },
          disclosure: {
            all: 'control-disclosure-all'
          }
        },
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
} satisfies TextFieldClassMap;

const paletteClassMap = {
  standard: {
    outline: {
      e3: {
        c: {
          s: {
            neutral: {
              m: 'control-color'
            }
          }
        }
      },
      e4: {
        c: {
          s: {
            neutral: {
              m: 'input-color'
            }
          }
        }
      }
    }
  }
} satisfies TextFieldClassMap;

function createContextValue(): KiskadeeContextValue {
  return {
    classesMap: {},
    segment: 'default',
    theme: 'light',
    setSegment: () => {},
    setTheme: () => {},
    designSystem: 'empty-e1-test',
    setDesignSystem: () => {},
    artifactVersion: '1',
    loadComponentClassMap: async <T,>(
      componentName: string,
      scope: ComponentClassMapScope
    ): Promise<T | undefined> => {
      if (componentName !== 'textField') return undefined;

      const artifact: ComponentClassMapArtifactJSON<TextFieldClassMap> = {
        component: 'textField',
        classMap: scope.kind === 'core' ? coreClassMap : paletteClassMap
      };

      return artifact as T;
    }
  };
}

function Probe() {
  const classMap = useComponentClassMap<TextFieldClassMap>('textField', undefined);
  const outline = classMap?.standard?.outline;

  return h('pre', { 'data-testid': 'merged-class-map' }, JSON.stringify(outline ?? null));
}

afterEach(() => {
  cleanup();
});

describe('useComponentClassMap', () => {
  it('preserves core size and projection buckets while overlaying palette colors', async () => {
    render(
      h(
        KiskadeeContext.Provider,
        {
          value: createContextValue()
        },
        h(Probe)
      )
    );

    await waitFor(() => {
      expect(screen.getByTestId('merged-class-map').textContent).toContain('control-size');
    });

    const outline = JSON.parse(screen.getByTestId('merged-class-map').textContent ?? '{}');

    expect(outline.e1).toEqual({});
    expect(outline.e3).toEqual({
      d: 'control-core',
      s: {
        'md:1': 'control-size'
      },
      rr: {
        'md:1': 'control-radius'
      },
      p: {
        connected: {
          all: 'control-projection-all',
          'md:1': 'control-projection-medium-core'
        },
        disclosure: {
          all: 'control-disclosure-all'
        }
      },
      c: {
        s: {
          neutral: {
            m: 'control-color'
          }
        }
      }
    });
    expect(outline.e4).toEqual({
      s: {
        'md:1': 'input-size'
      },
      c: {
        s: {
          neutral: {
            m: 'input-color'
          }
        }
      }
    });
  });
});
