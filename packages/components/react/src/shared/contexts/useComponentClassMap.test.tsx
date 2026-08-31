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
import { useComponentClassMap, useComponentClassMapResolution } from './useComponentClassMap.ts';

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

function createContextValue(
  designSystem = 'empty-e1-test',
  overrides: Partial<KiskadeeContextValue> = {}
): KiskadeeContextValue {
  return {
    classesMap: {},
    segment: 'default',
    theme: 'light',
    setSegment: () => {},
    setTheme: () => {},
    designSystem,
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
    },
    ...overrides
  };
}

function Probe({ testId = 'merged-class-map' }: { testId?: string }) {
  const classMap = useComponentClassMap<TextFieldClassMap>('textField', undefined);
  const outline = classMap?.standard?.outline;

  return h('pre', { 'data-testid': testId }, JSON.stringify(outline ?? null));
}

function ResolutionProbe({ testId = 'class-map-resolution' }: { testId?: string }) {
  const { classMap, pending } = useComponentClassMapResolution<TextFieldClassMap>(
    'textField',
    undefined
  );
  const outline = classMap?.standard?.outline;

  return h(
    'pre',
    { 'data-testid': testId },
    JSON.stringify({ classMap: outline ?? null, pending })
  );
}

function readResolution(testId = 'class-map-resolution') {
  return JSON.parse(screen.getByTestId(testId).textContent ?? '{}') as {
    classMap: TextFieldClassMap | null;
    pending: boolean;
  };
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

  it('shares a resolved component map synchronously with later subscribers', async () => {
    const context = createContextValue('shared-snapshot-test');
    render(h(KiskadeeContext.Provider, { value: context }, h(Probe)));

    await waitFor(() => {
      expect(screen.getByTestId('merged-class-map').textContent).toContain('control-color');
    });

    render(
      h(
        KiskadeeContext.Provider,
        { value: context },
        h(Probe, { testId: 'late-subscriber-class-map' })
      )
    );

    expect(screen.getByTestId('late-subscriber-class-map').textContent).toContain('control-color');
  });

  it('does not resurrect a map from before a resolved empty artifact', async () => {
    const { rerender } = render(
      h(
        KiskadeeContext.Provider,
        { value: createContextValue('resolved-map-transition-a') },
        h(ResolutionProbe)
      )
    );

    await waitFor(() => {
      expect(readResolution().classMap).not.toBeNull();
    });

    const emptyLoader: NonNullable<KiskadeeContextValue['loadComponentClassMap']> = async () =>
      undefined;
    rerender(
      h(
        KiskadeeContext.Provider,
        {
          value: createContextValue('resolved-map-transition-b', {
            loadComponentClassMap: emptyLoader
          })
        },
        h(ResolutionProbe)
      )
    );

    await waitFor(() => {
      expect(readResolution()).toEqual({ classMap: null, pending: false });
    });

    const never = new Promise<undefined>(() => {});
    const pendingLoader: NonNullable<KiskadeeContextValue['loadComponentClassMap']> = async <
      T,
    >() => (await never) as T | undefined;
    rerender(
      h(
        KiskadeeContext.Provider,
        {
          value: createContextValue('resolved-map-transition-c', {
            loadComponentClassMap: pendingLoader
          })
        },
        h(ResolutionProbe)
      )
    );

    expect(readResolution()).toEqual({ classMap: null, pending: true });
  });

  it('preserves the previous map when a replacement provider has no loader', async () => {
    const { rerender } = render(
      h(
        KiskadeeContext.Provider,
        { value: createContextValue('loader-transition-present') },
        h(ResolutionProbe)
      )
    );

    await waitFor(() => {
      expect(readResolution().classMap).not.toBeNull();
    });

    rerender(
      h(
        KiskadeeContext.Provider,
        {
          value: createContextValue('loader-transition-absent', {
            loadComponentClassMap: undefined
          })
        },
        h(ResolutionProbe)
      )
    );

    expect(readResolution().classMap).not.toBeNull();
    expect(readResolution().classMap?.e3?.c?.s?.neutral?.m).toBe('control-color');
    expect(readResolution().pending).toBe(false);
  });

  it('deduplicates the core and palette loads across concurrent subscribers', async () => {
    const scopes: ComponentClassMapScope[] = [];
    const loader: NonNullable<KiskadeeContextValue['loadComponentClassMap']> = async <T,>(
      componentName: string,
      scope: ComponentClassMapScope
    ) => {
      scopes.push(scope);
      if (componentName !== 'textField') return undefined;

      const artifact: ComponentClassMapArtifactJSON<TextFieldClassMap> = {
        component: 'textField',
        classMap: scope.kind === 'core' ? coreClassMap : paletteClassMap
      };
      return artifact as T;
    };
    const context = createContextValue('concurrent-subscriber-dedupe', {
      loadComponentClassMap: loader
    });

    render(
      h(
        KiskadeeContext.Provider,
        { value: context },
        h(
          'div',
          null,
          h(Probe, { testId: 'concurrent-map-a' }),
          h(Probe, { testId: 'concurrent-map-b' })
        )
      )
    );

    await waitFor(() => {
      expect(screen.getByTestId('concurrent-map-a').textContent).toContain('control-color');
      expect(screen.getByTestId('concurrent-map-b').textContent).toContain('control-color');
    });

    expect(scopes).toHaveLength(2);
    expect(scopes.map((scope) => scope.kind).sort()).toEqual(['core', 'palette']);
  });

  it('retries a transient class-map failure for a later subscriber', async () => {
    const attempts: Record<ComponentClassMapScope['kind'], number> = {
      core: 0,
      palette: 0
    };
    const loader: NonNullable<KiskadeeContextValue['loadComponentClassMap']> = async <T,>(
      componentName: string,
      scope: ComponentClassMapScope
    ) => {
      attempts[scope.kind] += 1;
      if (attempts[scope.kind] === 1) {
        throw new Error(`Transient ${scope.kind} failure`);
      }
      if (componentName !== 'textField') return undefined;

      const artifact: ComponentClassMapArtifactJSON<TextFieldClassMap> = {
        component: 'textField',
        classMap: scope.kind === 'core' ? coreClassMap : paletteClassMap
      };
      return artifact as T;
    };
    const context = createContextValue('transient-class-map-retry', {
      loadComponentClassMap: loader
    });
    const first = render(
      h(KiskadeeContext.Provider, { value: context }, h(Probe, { testId: 'failed-map' }))
    );

    await waitFor(() => {
      expect(attempts).toEqual({ core: 1, palette: 1 });
    });
    await Promise.resolve();
    first.unmount();

    render(h(KiskadeeContext.Provider, { value: context }, h(Probe, { testId: 'retried-map' })));

    await waitFor(() => {
      expect(screen.getByTestId('retried-map').textContent).toContain('control-color');
    });
    expect(attempts).toEqual({ core: 2, palette: 2 });
  });
});
