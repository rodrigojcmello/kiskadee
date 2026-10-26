/** @vitest-environment jsdom */

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  KiskadeeContext,
  type KiskadeeContextValue
} from '../../shared/contexts/KiskadeeContext.tsx';
import {
  SurfaceContextProvider,
  useSurfaceContext
} from '../../shared/contexts/SurfaceContext.tsx';
import { resolveButtonIndicatorClassName } from './Button.class-names.ts';
import { Button } from './Button.tsx';
import type { ButtonClassesMap, ButtonProps } from './Button.types.ts';

vi.mock('./effects/activation-feedback/ButtonActivationFeedback.effect.ts', () => ({
  resolveButtonActivationFeedbackEffect: ({ isActive }: { isActive: boolean }) => ({
    classNamePatch: { e1: `k-btn-e1a${isActive ? ' k-btn-e1b' : ''}` }
  })
}));

const elements: ButtonClassesMap = {
  e1: { s: { 'md:1': 'root-medium' }, rr: { 'md:1': 'root-rounded' } },
  e2: { s: { 'md:1': 'label-medium' } },
  e3: { s: { 'md:1': 'icon-medium' } },
  e8: { s: { 'md:1': 'stacked-medium' }, rr: { 'md:1': 'stacked-rounded' } },
  e9: { s: { 'md:1': 'stacked-label' } },
  e10: { s: { 'md:1': 'stacked-icon' } },
  e11: {
    s: { all: 'indicator-height-offsets', 'md:1': 'indicator-width-medium' },
    rr: { all: 'indicator-rounded' },
    rp: { all: 'indicator-pill' },
    rs: { all: 'indicator-square' },
    c: {
      s: {
        neutral: {
          h: 'indicator-neutral-high-subtle',
          m: 'indicator-neutral-medium-subtle',
          l: 'indicator-neutral-low-subtle'
        },
        primary: { h: 'indicator-primary-high-subtle' }
      },
      v: {
        neutral: {
          h: 'indicator-neutral-high-vivid',
          m: 'indicator-neutral-medium-vivid',
          l: 'indicator-neutral-low-vivid'
        }
      }
    }
  },
  e12: {
    s: { all: 'outside-indicator-height-offsets', 'md:1': 'outside-indicator-width-medium' },
    rr: { all: 'outside-indicator-rounded' },
    rp: { all: 'outside-indicator-pill' },
    rs: { all: 'outside-indicator-square' },
    c: {
      s: {
        neutral: {
          h: 'outside-indicator-neutral-high-subtle',
          m: 'outside-indicator-neutral-medium-subtle',
          l: 'outside-indicator-neutral-low-subtle'
        },
        primary: { h: 'outside-indicator-primary-high-subtle' }
      },
      v: {
        neutral: {
          h: 'outside-indicator-neutral-high-vivid',
          m: 'outside-indicator-neutral-medium-vivid',
          l: 'outside-indicator-neutral-low-vivid'
        }
      }
    }
  }
};
const sizesByRadius = { rounded: ['md:1'], pill: ['md:1'], square: ['md:1'] };
const context: KiskadeeContextValue = {
  classesMap: { button: elements },
  designSystem: 'button-indicator-test',
  segment: 'default',
  theme: 'light',
  setDesignSystem: () => {},
  setSegment: () => {},
  setTheme: () => {},
  componentArtifacts: {
    button: {
      component: 'button',
      indicator: {
        sizesByRadius,
        stackedSizesByRadius: sizesByRadius,
        outsideSizesByRadius: sizesByRadius,
        stackedOutsideSizesByRadius: sizesByRadius
      },
      layouts: { stacked: { sizesByRadius } }
    }
  }
};

function example(props: ButtonProps = {}, value = context) {
  return (
    <KiskadeeContext.Provider value={value}>
      <Button activationFeedback={false} size="md" {...props}>
        {props.children ?? 'Chat'}
      </Button>
    </KiskadeeContext.Provider>
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Button indicator coverage', () => {
  const coordinate = {
    element: elements.e11,
    sizesByRadius,
    scale: 's:md:1',
    radius: 'rounded' as const,
    placement: 'inside' as const,
    intent: 'neutral' as const,
    emphasis: 'medium' as const,
    surfaceContext: 'onSubtle' as const
  };

  it('requires baseline geometry, the effective radius, and exact resolved surface paint', () => {
    expect(resolveButtonIndicatorClassName(coordinate)).toContain('indicator-width-medium');
    expect(resolveButtonIndicatorClassName(coordinate)).toContain('indicator-rounded');
    expect(resolveButtonIndicatorClassName(coordinate)).toContain(
      'indicator-neutral-medium-subtle'
    );
    expect(
      resolveButtonIndicatorClassName({ ...coordinate, sizesByRadius: undefined })
    ).toBeUndefined();
    expect(
      resolveButtonIndicatorClassName({ ...coordinate, sizesByRadius: { rounded: [] } })
    ).toBeUndefined();
    expect(
      resolveButtonIndicatorClassName({ ...coordinate, element: { ...elements.e11, rr: {} } })
    ).toBeUndefined();
    expect(
      resolveButtonIndicatorClassName({ ...coordinate, element: { ...elements.e11, s: {} } })
    ).toBeUndefined();
    expect(resolveButtonIndicatorClassName({ ...coordinate, emphasis: 'lowest' })).toBeUndefined();
    expect(resolveButtonIndicatorClassName({ ...coordinate, intent: 'positive' })).toBeUndefined();
    expect(
      resolveButtonIndicatorClassName({
        ...coordinate,
        element: elements.e12,
        placement: 'outside',
        intent: 'primary',
        emphasis: 'high'
      })
    ).toContain('outside-indicator-primary-high-subtle');
    expect(
      resolveButtonIndicatorClassName({
        ...coordinate,
        surfaceContext: 'onVivid',
        intent: 'primary',
        emphasis: 'high'
      })
    ).toBeUndefined();
  });
});

describe('Button decorative state indicator', () => {
  it('follows preset scope by actual layout and supports explicit per-instance overrides', () => {
    const scoped: KiskadeeContextValue = {
      ...context,
      componentArtifacts: {
        button: { ...context.componentArtifacts!.button!, options: { indicatorScope: 'stacked' } }
      }
    };
    const children = (
      <>
        <Button.Icon>
          <svg aria-hidden="true" />
        </Button.Icon>
        <Button.Label>Chat</Button.Label>
      </>
    );
    const { rerender } = render(example({ controlState: true, children }, scoped));
    const button = screen.getByRole('button');
    const label = screen.getByText('Chat');
    expect(button.querySelector('.k-btn-e11')).toBeNull();
    rerender(example({ controlState: true, children, iconLayout: 'stacked' }, scoped));
    expect(button.querySelector('.k-btn-e11')?.classList.contains('k-btn-e11b')).toBe(true);
    rerender(
      example({ controlState: true, children, iconLayout: 'stacked', indicator: false }, scoped)
    );
    expect(button.querySelector('.k-btn-e11')).toBeNull();
    expect(button.classList.contains('k-btn-e1k')).toBe(false);
    rerender(example({ controlState: true, children, indicator: true }, scoped));
    expect(button.querySelector('.k-btn-e11')?.classList.contains('k-btn-e11b')).toBe(true);
    expect(button.hasAttribute('indicator')).toBe(false);
    rerender(example({ controlState: true, children }, scoped));
    expect(button.querySelector('.k-btn-e11')).toBeNull();
    rerender(example({ controlState: true, children }));
    expect(button.querySelector('.k-btn-e11')).not.toBeNull();
    expect(screen.getByRole('button')).toBe(button);
    expect(screen.getByText('Chat')).toBe(label);
  });

  it('applies stacked scope after content fallback and does not force missing recipes or states', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const scoped: KiskadeeContextValue = {
      ...context,
      componentArtifacts: {
        button: { ...context.componentArtifacts!.button!, options: { indicatorScope: 'stacked' } }
      }
    };
    const props: ButtonProps = { controlState: true, iconLayout: 'stacked' };
    const { rerender } = render(example(props, scoped));
    const button = screen.getByRole('button');
    expect(button.classList.contains('k-btn-e8')).toBe(false);
    expect(button.querySelector('.k-btn-e11')).toBeNull();
    rerender(example({ ...props, indicator: true }, scoped));
    const indicator = button.querySelector('.k-btn-e11');
    expect(indicator?.classList.contains('k-btn-e11b')).toBe(true);
    rerender(example({ ...props, indicator: true, disabled: true }, scoped));
    expect(button.querySelector('.k-btn-e11')).toBe(indicator);
    expect(indicator?.classList.contains('k-btn-e11b')).toBe(false);
    rerender(example({ ...props, controlState: false, indicator: true }, scoped));
    expect(indicator?.classList.contains('k-btn-e11b')).toBe(false);
    rerender(example({ ...props, indicator: true }, { ...scoped, componentArtifacts: {} }));
    expect(button.querySelector('.k-btn-e11')).toBeNull();
  });

  it('preserves the native control, ref, label and stable passive node across states', () => {
    const ref = createRef<HTMLButtonElement>();
    const view = (props: ButtonProps) => (
      <KiskadeeContext.Provider value={context}>
        <Button ref={ref} activationFeedback={false} size="md" toggle {...props}>
          Chat
        </Button>
      </KiskadeeContext.Provider>
    );
    const { rerender } = render(view({ controlState: false }));
    const button = screen.getByRole('button', { name: 'Chat' });
    const label = screen.getByText('Chat');
    const indicator = button.querySelector('.k-btn-e11');
    expect(ref.current).toBe(button);
    expect(button.tagName).toBe('BUTTON');
    expect(indicator?.tagName).toBe('SPAN');
    expect(indicator?.getAttribute('aria-hidden')).toBe('true');
    expect(indicator?.hasAttribute('tabindex')).toBe(false);
    expect(indicator?.classList.contains('k-btn-e11b')).toBe(false);
    expect(button.getAttribute('aria-pressed')).toBe('false');
    for (const status of [undefined, 'hover', 'focus', 'pressed'] as const) {
      rerender(view({ controlState: true, status }));
      expect(ref.current).toBe(button);
      expect(screen.getByText('Chat')).toBe(label);
      expect(button.querySelector('.k-btn-e11')).toBe(indicator);
      expect(indicator?.classList.contains('k-btn-e11b')).toBe(true);
      expect(button.getAttribute('aria-pressed')).toBe('true');
    }
    rerender(view({ controlState: false, 'aria-pressed': true }));
    expect(indicator?.classList.contains('k-btn-e11b')).toBe(false);
    expect(button.hasAttribute('indicatorPlacement')).toBe(false);
  });

  it.each([
    { disabled: true },
    { 'aria-disabled': true },
    { 'aria-disabled': 'true' },
    { interactionLocked: true },
    { pending: true },
    { status: 'disabled' },
    { status: 'disabled', 'aria-disabled': true },
    { status: 'pending' }
  ] satisfies ButtonProps[])('hides paint without changing selection while unavailable: %j', (blocked) => {
    const { rerender } = render(example({ controlState: true, toggle: true }));
    const button = screen.getByRole('button');
    const indicator = button.querySelector('.k-btn-e11');
    rerender(example({ controlState: true, toggle: true, ...blocked }));
    expect(button.querySelector('.k-btn-e11')).toBe(indicator);
    expect(indicator?.classList.contains('k-btn-e11b')).toBe(false);
    expect(button.getAttribute('aria-pressed')).toBe('true');
    rerender(example({ controlState: true, toggle: true }));
    expect(indicator?.classList.contains('k-btn-e11b')).toBe(true);
  });

  it('uses prop, preset, then inside defaults and updates the same node on direction changes', () => {
    const value: KiskadeeContextValue = {
      ...context,
      componentArtifacts: {
        button: {
          ...context.componentArtifacts!.button!,
          options: { indicatorPlacement: 'outside' }
        }
      }
    };
    const { rerender } = render(example({ controlState: true }, value));
    const button = screen.getByRole('button');
    const indicator = button.querySelector('.k-btn-e11');
    expect(indicator?.className).toContain('outside-indicator-neutral-medium-subtle');
    expect(indicator?.classList.contains('k-btn-e11a')).toBe(true);
    rerender(example({ controlState: true, indicatorPlacement: 'inside', dir: 'rtl' }, value));
    expect(button.querySelector('.k-btn-e11')).toBe(indicator);
    expect(indicator?.className).toContain('indicator-neutral-medium-subtle');
    expect(indicator?.classList.contains('k-btn-e11a')).toBe(false);
    expect(button.dir).toBe('rtl');
    rerender(example({ controlState: true }));
    expect(indicator?.className).toContain('indicator-neutral-medium-subtle');
  });

  it('does not turn an ARIA busy announcement into an activation lock', () => {
    render(example({ controlState: true, 'aria-busy': true }));
    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.querySelector('.k-btn-e11')?.classList.contains('k-btn-e11b')).toBe(true);
  });

  it('resolves actual intent and emphasis without borrowing another palette coordinate', () => {
    const { rerender } = render(example({ controlState: true, emphasis: 'low' }));
    expect(screen.getByRole('button').querySelector('.k-btn-e11')?.className).toContain(
      'indicator-neutral-low-subtle'
    );
    rerender(example({ controlState: true, intent: 'primary', emphasis: 'high' }));
    expect(screen.getByRole('button').querySelector('.k-btn-e11')?.className).toContain(
      'indicator-primary-high-subtle'
    );
    rerender(
      <SurfaceContextProvider value="onVivid">
        {example({ controlState: true, intent: 'primary', emphasis: 'high' })}
      </SurfaceContextProvider>
    );
    expect(screen.getByRole('button').querySelector('.k-btn-e11')).toBeNull();
  });

  it.each([
    { ambient: 'onSubtle', emphasis: 'high' },
    { ambient: 'onVivid', emphasis: 'high' },
    { ambient: 'onSubtle', emphasis: 'low' },
    { ambient: 'onVivid', emphasis: 'low' }
  ] as const)('keeps ambient recipe coordinates independent from sparse child surfaces: %j', ({
    ambient,
    emphasis
  }) => {
    const value: KiskadeeContextValue = {
      ...context,
      componentArtifacts: {
        button: {
          ...context.componentArtifacts!.button!,
          contentSurfaceContext: {
            default: {
              light: {
                onSubtle: { neutral: { high: { rest: 'onVivid' }, low: { rest: 'inherit' } } },
                onVivid: { neutral: { high: { rest: 'onSubtle' }, low: { rest: 'inherit' } } }
              }
            }
          }
        }
      }
    };
    const { rerender } = render(
      example({ controlState: true, emphasis, surfaceContext: ambient }, value)
    );
    const button = screen.getByRole('button');
    const indicator = button.querySelector('.k-btn-e11');
    const palette = (surface: 'onSubtle' | 'onVivid') =>
      `indicator-neutral-${emphasis}-${surface === 'onVivid' ? 'vivid' : 'subtle'}`;
    expect(indicator?.className).toContain(palette(ambient));
    expect(indicator?.className).not.toContain('outside-indicator');
    expect(indicator?.classList.contains('k-btn-e11b')).toBe(true);
    rerender(
      example(
        { controlState: true, emphasis, surfaceContext: ambient, indicatorPlacement: 'outside' },
        value
      )
    );
    expect(button.querySelector('.k-btn-e11')).toBe(indicator);
    expect(indicator?.className).toContain(`outside-${palette(ambient)}`);
    rerender(example({ controlState: false, emphasis, surfaceContext: ambient }, value));
    expect(indicator?.className).toContain(palette(ambient));
    expect(indicator?.className).not.toContain('outside-indicator');
    expect(indicator?.classList.contains('k-btn-e11b')).toBe(false);
  });

  it('uses independent ambient recipes without changing the produced context of children', () => {
    function SurfaceProbe() {
      return <span data-testid="content-surface">{useSurfaceContext()}</span>;
    }
    const children = (
      <Button.Label>
        Chat
        <SurfaceProbe />
      </Button.Label>
    );
    const value: KiskadeeContextValue = {
      ...context,
      componentArtifacts: {
        button: {
          ...context.componentArtifacts!.button!,
          contentSurfaceContext: {
            default: {
              light: {
                onSubtle: {
                  neutral: {
                    medium: {
                      rest: 'onSubtle',
                      selected: 'onVivid',
                      pending: 'onSubtle',
                      disabled: 'onSubtle'
                    }
                  }
                },
                onVivid: {
                  neutral: { medium: { rest: 'onVivid', selected: 'onSubtle' } }
                }
              }
            }
          }
        }
      }
    };
    const { rerender } = render(example({ controlState: true, children }, value));
    const button = screen.getByRole('button');
    const indicator = button.querySelector('.k-btn-e11');
    const contentSurface = screen.getByTestId('content-surface');
    expect(indicator?.className).toContain('indicator-neutral-medium-subtle');
    expect(contentSurface.textContent).toBe('onVivid');
    rerender(example({ controlState: true, children, indicatorPlacement: 'outside' }, value));
    expect(button.querySelector('.k-btn-e11')).toBe(indicator);
    expect(indicator?.className).toContain('outside-indicator-neutral-medium-subtle');
    expect(screen.getByTestId('content-surface')).toBe(contentSurface);
    expect(contentSurface.textContent).toBe('onVivid');
    rerender(
      example(
        { controlState: true, children, surfaceContext: 'onVivid', indicatorPlacement: 'outside' },
        value
      )
    );
    expect(indicator?.className).toContain('outside-indicator-neutral-medium-vivid');
    expect(contentSurface.textContent).toBe('onSubtle');
    rerender(example({ controlState: true, children, surfaceContext: 'onVivid' }, value));
    expect(indicator?.className).toContain('indicator-neutral-medium-vivid');
    expect(contentSurface.textContent).toBe('onSubtle');
    rerender(example({ controlState: false, children }, value));
    expect(indicator?.className).toContain('indicator-neutral-medium-subtle');
    expect(contentSurface.textContent).toBe('onSubtle');
    rerender(example({ controlState: true, children, pending: true }, value));
    expect(indicator?.className).toContain('indicator-neutral-medium-subtle');
    expect(indicator?.classList.contains('k-btn-e11b')).toBe(false);
    expect(contentSurface.textContent).toBe('onSubtle');
    rerender(example({ controlState: true, children }, value));
    expect(button.querySelector('.k-btn-e11')).toBe(indicator);
    expect(indicator?.className).toContain('indicator-neutral-medium-subtle');
    expect(contentSurface.textContent).toBe('onVivid');
  });

  it('omits the anatomy when coverage, resolved surface paint or radius is unavailable', () => {
    const { rerender } = render(example({ controlState: true }));
    const button = screen.getByRole('button');
    expect(button.querySelector('.k-btn-e11')).not.toBeNull();
    for (const value of [
      { ...context, componentArtifacts: {} },
      { ...context, classesMap: { button: { e1: {}, e2: {}, e3: {} } } },
      {
        ...context,
        componentArtifacts: {
          button: { component: 'button', indicator: { sizesByRadius: { rounded: [] } } }
        }
      }
    ] satisfies KiskadeeContextValue[]) {
      rerender(example({ controlState: true }, value));
      expect(button.querySelector('.k-btn-e11')).toBeNull();
      expect(button.classList.contains('k-btn-e1k')).toBe(false);
    }
    rerender(example({ controlState: true, emphasis: 'lowest' }));
    expect(button.querySelector('.k-btn-e11')).toBeNull();
    rerender(example({ controlState: true, size: 'sm' }));
    expect(button.querySelector('.k-btn-e11')).toBeNull();
    expect(screen.getByRole('button')).toBe(button);
  });

  it('treats inside and outside anatomy and coverage as independent optional capabilities', () => {
    const outsideOnly = { ...elements };
    delete outsideOnly.e11;
    const insideOnly = { ...elements };
    delete insideOnly.e12;
    const { rerender } = render(
      example(
        { controlState: true },
        {
          ...context,
          classesMap: { button: outsideOnly }
        }
      )
    );
    const button = screen.getByRole('button');
    expect(button.querySelector('.k-btn-e11')).toBeNull();
    rerender(
      example(
        { controlState: true, indicatorPlacement: 'outside' },
        {
          ...context,
          classesMap: { button: outsideOnly }
        }
      )
    );
    expect(button.querySelectorAll('.k-btn-e11')).toHaveLength(1);
    expect(button.querySelector('.k-btn-e11')?.className).toContain(
      'outside-indicator-width-medium'
    );
    rerender(
      example(
        { controlState: true, indicatorPlacement: 'outside' },
        {
          ...context,
          classesMap: { button: insideOnly }
        }
      )
    );
    expect(button.querySelector('.k-btn-e11')).toBeNull();
    rerender(
      example(
        { controlState: true },
        {
          ...context,
          classesMap: { button: insideOnly }
        }
      )
    );
    expect(button.querySelector('.k-btn-e11')).not.toBeNull();
    rerender(
      example(
        { controlState: true, indicatorPlacement: 'outside' },
        {
          ...context,
          componentArtifacts: {
            button: {
              ...context.componentArtifacts!.button!,
              indicator: { sizesByRadius, outsideSizesByRadius: { rounded: [] } }
            }
          }
        }
      )
    );
    expect(button.querySelector('.k-btn-e11')).toBeNull();
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByRole('button')).toBe(button);
  });

  it('combines indicator geometry from core with normal colors from split palette artifacts', async () => {
    const { c: insideColors, ...insideGeometry } = elements.e11!;
    const { c: outsideColors, ...outsideGeometry } = elements.e12!;
    const value: KiskadeeContextValue = {
      ...context,
      designSystem: 'button-indicator-split-test',
      classesMap: {},
      loadComponentClassMap: async <T,>(component: string, scope: { kind: string }) =>
        ({
          component,
          classMap:
            scope.kind === 'core'
              ? { ...elements, e11: insideGeometry, e12: outsideGeometry }
              : { e11: { c: insideColors }, e12: { c: outsideColors } }
        }) as T
    };
    render(example({ controlState: true, indicatorPlacement: 'outside' }, value));
    await waitFor(() => {
      const indicator = screen.getByRole('button').querySelector('.k-btn-e11');
      expect(indicator?.className).toContain('outside-indicator-width-medium');
      expect(indicator?.className).toContain('outside-indicator-rounded');
      expect(indicator?.className).toContain('outside-indicator-neutral-medium-subtle');
    });
  });

  it.each([
    'inside',
    'outside'
  ] as const)('follows resolved adaptive density for %s while preserving the CSS adaptive root alias', (placement) => {
    const listeners = new Set<() => void>();
    vi.stubGlobal('innerWidth', 1600);
    vi.stubGlobal('matchMedia', () => ({
      addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener)
    }));
    const value: KiskadeeContextValue = {
      ...context,
      classesMap: {
        button: {
          ...elements,
          e1: { s: { a: 'root-adaptive' }, rr: { a: 'root-adaptive-rounded' } },
          e11: {
            ...elements.e11,
            s: {
              all: 'indicator-height-offsets',
              'sm:1': 'indicator-width-small',
              'md:1': 'indicator-width-medium',
              'lg:1': 'indicator-width-large'
            }
          },
          e12: {
            ...elements.e12,
            s: {
              all: 'outside-indicator-height-offsets',
              'sm:1': 'outside-indicator-width-small',
              'md:1': 'outside-indicator-width-medium',
              'lg:1': 'outside-indicator-width-large'
            }
          }
        }
      },
      componentArtifacts: {
        button: {
          component: 'button',
          density: { c: 'sm:1', r: 'md:1', s: 'lg:1' },
          sizeSupport: { sizes: ['sm:1', 'md:1', 'lg:1'] },
          indicator: {
            sizesByRadius: { rounded: placement === 'inside' ? ['sm:1', 'md:1', 'lg:1'] : [] },
            outsideSizesByRadius: {
              rounded: placement === 'outside' ? ['sm:1', 'md:1', 'lg:1'] : []
            }
          }
        }
      }
    };
    render(example({ controlState: true, size: undefined, indicatorPlacement: placement }, value));
    const button = screen.getByRole('button');
    const indicator = button.querySelector('.k-btn-e11');
    const prefix = placement === 'outside' ? 'outside-' : '';
    expect(indicator?.className).toContain(`${prefix}indicator-width-small`);
    expect(button.className).toContain('root-adaptive');
    act(() => {
      vi.stubGlobal('innerWidth', 500);
      for (const listener of listeners) listener();
    });
    expect(button.querySelector('.k-btn-e11')).toBe(indicator);
    expect(indicator?.className).toContain(`${prefix}indicator-width-large`);
    expect(button.className).toContain('root-adaptive');
    act(() => {
      vi.stubGlobal('innerWidth', 900);
      for (const listener of listeners) listener();
    });
    expect(indicator?.className).toContain(`${prefix}indicator-width-medium`);
  });

  it('does not subscribe to adaptive media queries when the indicator anatomy is unavailable', () => {
    const matchMedia = vi.fn(() => ({
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }));
    vi.stubGlobal('matchMedia', matchMedia);
    const value: KiskadeeContextValue = {
      ...context,
      classesMap: { button: { e1: { s: { a: 'root-adaptive' } } } },
      componentArtifacts: {
        button: {
          component: 'button',
          density: { c: 'md:1', s: 'md:1' },
          sizeSupport: { sizes: ['md:1'] }
        }
      }
    };
    render(example({ size: undefined }, value));
    expect(screen.getByRole('button').className).toContain('root-adaptive');
    expect(matchMedia).not.toHaveBeenCalled();
  });

  it.each([
    'inside',
    'outside'
  ] as const)('checks actual %s layout border coverage independently for horizontal and stacked geometry', (placement) => {
    const value = (horizontal: string[], stacked: string[]): KiskadeeContextValue => ({
      ...context,
      componentArtifacts: {
        button: {
          ...context.componentArtifacts!.button!,
          indicator: {
            sizesByRadius: { rounded: placement === 'inside' ? horizontal : [] },
            stackedSizesByRadius: { rounded: placement === 'inside' ? stacked : [] },
            outsideSizesByRadius: { rounded: placement === 'outside' ? horizontal : [] },
            stackedOutsideSizesByRadius: { rounded: placement === 'outside' ? stacked : [] }
          }
        }
      }
    });
    const props: ButtonProps = {
      controlState: true,
      indicatorPlacement: placement,
      children: (
        <>
          <Button.Icon>
            <svg aria-hidden="true" />
          </Button.Icon>
          <Button.Label>Chat</Button.Label>
        </>
      )
    };
    const { rerender } = render(example(props, value([], ['md:1'])));
    const button = screen.getByRole('button');
    expect(button.querySelector('.k-btn-e11')).toBeNull();
    rerender(example({ ...props, iconLayout: 'stacked' }, value([], ['md:1'])));
    expect(button.querySelector('.k-btn-e11')).not.toBeNull();
    rerender(example({ ...props, iconLayout: 'stacked' }, value(['md:1'], [])));
    expect(button.querySelector('.k-btn-e11')).toBeNull();
    rerender(example(props, value(['md:1'], [])));
    expect(button.querySelector('.k-btn-e11')).not.toBeNull();
  });

  it('keeps connected controls as native siblings and uses the effective group radius', () => {
    render(
      <KiskadeeContext.Provider value={context}>
        <Button.Group size="md" radius="square">
          <Button controlState activationFeedback={false}>
            Chat
          </Button>
          <Button controlState activationFeedback={false}>
            People
          </Button>
        </Button.Group>
      </KiskadeeContext.Provider>
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]?.parentElement).toBe(buttons[1]?.parentElement);
    expect(buttons[0]?.parentElement?.className).toContain('k-btn-x3');
    for (const button of buttons) {
      expect(button.querySelector('.k-btn-e11')?.className).toContain('indicator-square');
    }
  });

  it('separates feedback clipping from overlay Badge and stacked content without replacing the root', async () => {
    const onClick = vi.fn();
    const value: KiskadeeContextValue = {
      ...context,
      classesMap: { button: { ...elements, e1: { ...elements.e1, e: { afs: 'feedback' } } } }
    };
    render(
      example(
        {
          controlState: true,
          activationFeedback: undefined,
          iconLayout: 'stacked',
          onClick,
          children: (
            <>
              <Button.Icon>
                <svg aria-hidden="true" />
              </Button.Icon>
              <Button.Label>Chat</Button.Label>
              <Button.Badge>
                <span>New</span>
              </Button.Badge>
            </>
          )
        },
        value
      )
    );
    const button = screen.getByRole('button', { name: /Chat/ });
    const indicator = button.querySelector('.k-btn-e11');
    await waitFor(() => expect(button.querySelector(':scope > .k-btn-x6')).not.toBeNull());
    expect(button.classList.contains('k-btn-e8')).toBe(true);
    expect(button.querySelector(':scope > .k-btn-x4')).not.toBeNull();
    expect(button.querySelector(':scope > .k-btn-e11')).toBe(indicator);
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });
});
