/** @vitest-environment jsdom */
import type { ClassNameByElementJSON, SystemButtonIntent } from '@kiskadee/core';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  KiskadeeContext,
  type KiskadeeContextValue
} from '../../shared/contexts/KiskadeeContext.tsx';
import { useSurfaceContext } from '../../shared/contexts/SurfaceContext.tsx';
import { Button } from './Button.tsx';
import type { ButtonClassesMap, ButtonProps } from './Button.types.ts';

const levels = ['lowest', 'low', 'medium', 'high'] as const;
const intents = ['neutral', 'primary', 'positive'] as const;
const sizesByRadius = { rounded: ['md:1'], pill: [], square: ['md:1'] };
function colors(part: string, normalHigh = false): ClassNameByElementJSON['c'] {
  return {
    s: Object.fromEntries(
      intents.map((intent) => [
        intent,
        {
          m: `${part}-${intent}-medium`,
          h: `${part}-${intent}-high-${normalHigh ? 'normal' : 'selected'}`
        }
      ])
    )
  };
}
function fixture(): ButtonClassesMap {
  return {
    e1: {
      s: { 'md:1': 'root-geometry' },
      rr: { 'md:1': 'root-radius' },
      c: colors('root'),
      p: { gd: { all: 'divider-width' } }
    },
    e2: { s: { 'md:1': 'label-geometry' }, c: colors('label') },
    e3: { s: { 'md:1': 'icon-geometry' }, c: colors('icon') },
    e5: { s: { all: 'disclosure-geometry' }, c: colors('disclosure') },
    e6: { s: { all: 'divider-geometry' }, c: colors('divider') },
    e8: { s: { 'md:1': 'stacked-geometry' }, rr: { 'md:1': 'stacked-radius' } },
    e9: { d: 'stacked-font', s: { 'md:1': 'stacked-label-geometry' } },
    e10: { s: { 'md:1': 'stacked-icon-geometry' } },
    e11: {
      s: { all: 'indicator-geometry' },
      rr: { all: 'indicator-radius' },
      c: colors('indicator')
    },
    e12: {
      s: { all: 'outside-indicator-geometry' },
      rr: { all: 'outside-indicator-radius' },
      c: colors('outside-indicator')
    },
    selectionRest: {
      e1: { c: colors('root', true) },
      e2: { c: colors('label', true) },
      e3: { c: colors('icon', true) },
      e5: { c: colors('disclosure', true) }
    },
    group: {
      frame: {
        d: 'frame-style',
        s: { all: 'frame-width' },
        rr: { all: 'frame-radius' },
        c: colors('frame')
      },
      member: { d: 'member-border-off', c: colors('member') },
      selectionRestMember: { d: 'member-border-off', c: colors('member', true) }
    }
  };
}
function makeContext(
  elements = fixture(),
  selectionIntent?: SystemButtonIntent
): KiskadeeContextValue {
  return {
    classesMap: { button: elements },
    designSystem: 'selection-intent-test',
    segment: 'default',
    theme: 'light',
    setDesignSystem() {},
    setSegment() {},
    setTheme() {},
    componentArtifacts: {
      button: {
        component: 'button',
        options: { selectionIntent, groupDivider: true },
        layouts: { stacked: { sizes: ['md:1'], sizesByRadius } },
        indicator: {
          sizesByRadius,
          stackedSizesByRadius: sizesByRadius,
          outsideSizesByRadius: sizesByRadius
        },
        contentSurfaceContext: {
          default: {
            light: {
              onSubtle: {
                neutral: {
                  medium: { rest: 'onSubtle', selected: 'onSubtle' },
                  high: { rest: 'onSubtle' }
                },
                primary: {
                  medium: { rest: 'onSubtle', selected: 'onVivid' },
                  high: { rest: 'onVivid' }
                },
                positive: {
                  medium: { rest: 'onSubtle', selected: 'onSubtle' },
                  high: { rest: 'onSubtle' }
                }
              }
            }
          }
        }
      }
    }
  };
}
function ContextProbe() {
  return <span data-testid="content-context">{useSurfaceContext()}</span>;
}
function content(disclosure = true) {
  return (
    <>
      <Button.Icon>
        <svg data-testid="artwork" />
      </Button.Icon>
      <Button.Label>
        Enable
        <ContextProbe />
      </Button.Label>
      {disclosure ? (
        <Button.Disclosure>
          <svg />
        </Button.Disclosure>
      ) : null}
    </>
  );
}
function view(props: ButtonProps = {}, value = makeContext()) {
  return (
    <KiskadeeContext.Provider value={value}>
      <Button
        aria-label="Enable"
        intent="neutral"
        emphasis="medium"
        size="md"
        toggle
        controlState
        activationFeedback={false}
        {...props}
      >
        {props.children ?? content()}
      </Button>
    </KiskadeeContext.Provider>
  );
}
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('Button selection intent', () => {
  it.each(
    levels
  )('uses only Primary paint across visible parts at %s while preserving semantic selection', (level) => {
    render(view({ selectionIntent: 'primary', selectionEmphasis: level }));
    const button = screen.getByRole('button', { name: 'Enable' });
    const promoted = level === 'medium' || level === 'high';
    const suffix = promoted ? 'high-normal' : 'medium';
    expect(button.className).toContain(`root-primary-${suffix}`);
    expect(button.className).not.toContain('root-neutral');
    expect(button.className).not.toContain('root-primary-high-selected');
    for (const [selector, part] of [
      ['.k-btn-e2', 'label'],
      ['.k-btn-e3', 'icon'],
      ['.k-btn-e5', 'disclosure']
    ] as const) {
      const classes = button.querySelector(selector)?.className;
      expect(classes).toContain(`${part}-primary-${suffix}`);
      expect(classes).not.toContain(`${part}-neutral`);
      expect(classes).not.toContain(`${part}-primary-high-selected`);
    }
    expect(button.className).toContain('root-geometry');
    expect(button.className).toContain('root-radius');
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.classList.contains('-s')).toBe(true);
    expect(screen.getByTestId('content-context').textContent).toBe('onVivid');
    const indicator = button.querySelector('.k-btn-e11');
    expect(Boolean(indicator)).toBe(level === 'low' || level === 'high');
    if (indicator) {
      expect(indicator.className).toContain(
        promoted ? 'indicator-primary-high-selected' : 'indicator-primary-medium'
      );
      expect(indicator.className).not.toContain('indicator-neutral');
      expect(indicator.classList.contains('k-btn-e11b')).toBe(true);
    }
  });

  it('resolves explicit selection intent before preset intent and the base default', () => {
    const preset = makeContext(fixture(), 'primary');
    const { rerender } = render(view({ selectionEmphasis: 'lowest' }, preset));
    const button = screen.getByRole('button', { name: 'Enable' });
    expect(button.className).toContain('root-primary-medium');
    rerender(view({ selectionIntent: 'positive', selectionEmphasis: 'lowest' }, preset));
    expect(screen.getByRole('button', { name: 'Enable' })).toBe(button);
    expect(button.className).toContain('root-positive-medium');
    expect(button.className).not.toContain('root-primary');
    rerender(view({ selectionEmphasis: 'lowest' }));
    expect(button.className).toContain('root-neutral-medium');
    expect(button.className).not.toContain('root-positive');
  });

  it.each([
    'low',
    'high'
  ] as const)('uses the separate outside indicator recipe for Primary %s selection', (selectionEmphasis) => {
    const props = {
      selectionIntent: 'primary',
      selectionEmphasis,
      indicatorPlacement: 'outside'
    } satisfies ButtonProps;
    const { rerender } = render(view(props));
    const button = screen.getByRole('button', { name: 'Enable' });
    const indicator = button.querySelector('.k-btn-e11');
    expect(button.querySelectorAll('.k-btn-e11')).toHaveLength(1);
    expect(indicator?.classList.contains('k-btn-e11a')).toBe(true);
    expect(indicator?.classList.contains('k-btn-e11b')).toBe(true);
    expect(indicator?.classList.contains('outside-indicator-geometry')).toBe(true);
    expect(indicator?.classList.contains('outside-indicator-radius')).toBe(true);
    expect(indicator?.classList.contains('indicator-geometry')).toBe(false);
    expect(indicator?.classList.contains('outside-indicator-neutral-medium')).toBe(false);
    expect(
      indicator?.classList.contains(
        selectionEmphasis === 'high'
          ? 'outside-indicator-primary-high-selected'
          : 'outside-indicator-primary-medium'
      )
    ).toBe(true);
    rerender(view({ ...props, controlState: false }));
    expect(button.querySelector('.k-btn-e11')).toBe(indicator);
    expect(indicator?.classList.contains('k-btn-e11b')).toBe(false);
    expect(indicator?.classList.contains('outside-indicator-neutral-medium')).toBe(true);
  });

  it('keeps the surfaced icon Neutral while selecting a Primary High Button from Neutral', () => {
    const elements = fixture();
    const surfacePaint = { s: { neutral: { m: 'surface-neutral-medium' } } };
    elements.e4 = { s: { all: 'surface-geometry' }, c: surfacePaint };
    elements.selectionRest!.e4 = { c: surfacePaint };
    render(
      view(
        { selectionIntent: 'primary', selectionEmphasis: 'high', iconTreatment: 'surface' },
        makeContext(elements)
      )
    );
    const button = screen.getByRole('button', { name: 'Enable' });
    expect(button.className).toContain('root-primary-high-normal');
    expect(button.className).not.toContain('root-neutral');
    const surface = button.querySelector('.k-btn-e4');
    expect(surface?.className).toContain('surface-geometry');
    expect(surface?.className).toContain('surface-neutral-medium');
    expect(surface?.className).not.toContain('surface-primary');
    expect(screen.getByTestId('content-context').textContent).toBe('onVivid');
  });

  it('changes intent and restores base paint on deselection without replacing the native control', () => {
    const { rerender } = render(view({ selectionIntent: 'primary', selectionEmphasis: 'low' }));
    const button = screen.getByRole('button', { name: 'Enable' });
    const artwork = screen.getByTestId('artwork');
    rerender(view({ selectionIntent: 'positive', selectionEmphasis: 'high' }));
    expect(screen.getByRole('button', { name: 'Enable' })).toBe(button);
    expect(screen.getByTestId('artwork')).toBe(artwork);
    expect(button.className).toContain('root-positive-high-normal');
    expect(button.className).not.toContain('root-primary');
    rerender(view({ selectionIntent: 'positive', selectionEmphasis: 'high', controlState: false }));
    expect(button.className).toContain('root-neutral-medium');
    expect(button.className).not.toContain('root-positive');
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.classList.contains('-s')).toBe(false);
    expect(button.querySelector('.k-btn-e11b')).toBeNull();
    expect(screen.getByTestId('content-context').textContent).toBe('onSubtle');
  });

  it('falls back atomically when a visible part lacks the requested ordinary intent', () => {
    const elements = fixture();
    delete elements.e3!.c!.s!.primary;
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(view({ selectionIntent: 'primary', selectionEmphasis: 'low' }, makeContext(elements)));
    const button = screen.getByRole('button', { name: 'Enable' });
    expect(button.className).toContain('root-neutral-medium');
    for (const [selector, part] of [
      ['.k-btn-e2', 'label'],
      ['.k-btn-e3', 'icon'],
      ['.k-btn-e5', 'disclosure'],
      ['.k-btn-e11', 'indicator']
    ] as const) {
      expect(button.querySelector(selector)?.className).toContain(`${part}-neutral-medium`);
      expect(button.querySelector(selector)?.className).not.toContain(`${part}-primary`);
    }
    expect(screen.getByTestId('content-context').textContent).toBe('onSubtle');
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(warning).toHaveBeenCalledWith(expect.stringContaining('selectionIntent'));
  });

  it('keeps the requested intent Selected recipe when only its High coverage is incomplete', () => {
    const elements = fixture();
    delete elements.selectionRest!.e5!.c!.s!.primary;
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(view({ selectionIntent: 'primary', selectionEmphasis: 'high' }, makeContext(elements)));
    const button = screen.getByRole('button', { name: 'Enable' });
    expect(button.className).toContain('root-primary-medium');
    expect(button.className).not.toContain('root-neutral');
    expect(button.className).not.toContain('root-primary-high');
    expect(button.querySelector('.k-btn-e5')?.className).toContain('disclosure-primary-medium');
    expect(button.querySelector('.k-btn-e11')?.className).toContain('indicator-primary-medium');
    expect(warning).toHaveBeenCalledWith(expect.stringContaining('High Rest'));
  });

  it('keeps Group base frame and unselected neighbors Neutral while selecting Primary', () => {
    render(
      <KiskadeeContext.Provider value={makeContext()}>
        <Button.Group intent="neutral" emphasis="medium" size="md">
          <Button toggle controlState selectionIntent="primary" selectionEmphasis="high">
            Selected
          </Button>
          <Button toggle controlState={false} selectionIntent="primary">
            Neighbor
          </Button>
        </Button.Group>
      </KiskadeeContext.Provider>
    );
    const selected = screen.getByRole('button', { name: 'Selected' });
    const neighbor = screen.getByRole('button', { name: 'Neighbor' });
    expect(selected.className).toContain('member-primary-high-normal');
    expect(selected.className).not.toContain('member-neutral-medium');
    expect(selected.classList.contains('k-btn-e1l')).toBe(true);
    expect(selected.classList.contains('-s')).toBe(true);
    expect(neighbor.className).toContain('member-neutral-medium');
    expect(neighbor.className).not.toContain('member-primary');
    const group = selected.parentElement!;
    expect(group.classList.contains('k-btn-x3a')).toBe(true);
    expect(group.querySelectorAll(':scope > .k-btn-e6a')).toHaveLength(1);
    for (const frame of group.querySelectorAll(':scope > .k-btn-x3b')) {
      expect(frame.className).toContain('frame-neutral-medium');
      expect(frame.className).not.toContain('frame-primary');
    }
  });

  it('uses complete High coverage even when the target has no ordinary base-emphasis recipe', () => {
    const elements = fixture();
    delete elements.e1!.c!.s!.primary;
    delete elements.e2!.c!.s!.primary;
    delete elements.e3!.c!.s!.primary;
    delete elements.e5!.c!.s!.primary;
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      view({ selectionIntent: 'primary', selectionEmphasis: 'medium' }, makeContext(elements))
    );
    const button = screen.getByRole('button', { name: 'Enable' });
    expect(button.className).toContain('root-primary-high-normal');
    expect(button.querySelector('.k-btn-e5')?.className).toContain(
      'disclosure-primary-high-normal'
    );
    expect(warning).not.toHaveBeenCalled();
  });

  it('keeps the strict BrandPack boundary and does not substitute system colors for a missing brand', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { rerender } = render(
      view({ selectionIntent: 'brand.google', selectionEmphasis: 'lowest' })
    );
    const button = screen.getByRole('button', { name: 'Enable' });
    expect(button.className).toContain('root-geometry');
    expect(button.className).not.toContain('root-neutral');
    expect(button.className).not.toContain('root-primary');
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(error).toHaveBeenCalledWith(
      '[Kiskadee] Button selectionIntent="brand.google" requires a compatible BrandPackBoundary and complete paint coverage. No system intent was substituted.'
    );
    rerender(
      view({ selectionIntent: 'brand.google', selectionEmphasis: 'lowest', controlState: false })
    );
    expect(screen.getByRole('button', { name: 'Enable' })).toBe(button);
    expect(button.className).toContain('root-neutral-medium');
  });

  it('preserves the Stacked geometry while replacing its paint intent', () => {
    const value = makeContext();
    const props = {
      selectionIntent: 'primary',
      selectionEmphasis: 'high',
      iconLayout: 'stacked',
      children: content(false)
    } satisfies ButtonProps;
    const { rerender } = render(view(props, value));
    const button = screen.getByRole('button', { name: 'Enable' });
    const geometry = ['stacked-geometry', 'stacked-radius'];
    for (const name of geometry) expect(button.className).toContain(name);
    expect(button.querySelector('.k-btn-e9')?.className).toContain('stacked-label-geometry');
    expect(button.querySelector('.k-btn-e10')?.className).toContain('stacked-icon-geometry');
    expect(button.className).toContain('root-primary-high-normal');
    rerender(view({ ...props, controlState: false }, value));
    expect(screen.getByRole('button', { name: 'Enable' })).toBe(button);
    for (const name of geometry) expect(button.className).toContain(name);
    expect(button.className).toContain('root-neutral-medium');
  });

  it.each([
    { disabled: true },
    { pending: true },
    { interactionLocked: true }
  ])('preserves selected semantics and requested intent across unavailable states %j', (terminal) => {
    const { rerender } = render(
      view({ selectionIntent: 'primary', selectionEmphasis: 'high', ...terminal })
    );
    const button = screen.getByRole('button', { name: 'Enable' });
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.classList.contains('-s')).toBe(true);
    expect(button.className).toContain('root-primary-high-normal');
    expect(button.querySelector('.k-btn-e11b')).toBeNull();
    rerender(view({ selectionIntent: 'primary', selectionEmphasis: 'high' }));
    expect(screen.getByRole('button', { name: 'Enable' })).toBe(button);
    expect(button.querySelector('.k-btn-e11b')).not.toBeNull();
  });
});
