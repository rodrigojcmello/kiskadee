/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  KiskadeeContext,
  type KiskadeeContextValue
} from '../../shared/contexts/KiskadeeContext.tsx';
import { useSurfaceContext } from '../../shared/contexts/SurfaceContext.tsx';
import { resolveButtonSelectionPaint } from './Button.selection.ts';
import { Button } from './Button.tsx';
import type { ButtonClassesMap, ButtonProps } from './Button.types.ts';

const color = (m: string, h: string) => ({ s: { neutral: { m, h, hh: 'highest-base' } } });
const elements: ButtonClassesMap = {
  e1: {
    s: { 'md:1': 'root-geometry' },
    rr: { 'md:1': 'root-radius' },
    c: color('root-base-selected', 'root-high-selected-leak'),
    e: { h: 'shadow-selected', rr: 'radius-selected' }
  },
  e2: {
    c: color('label-base-selected', 'label-high-selected-leak'),
    s: { 'md:1': 'label-geometry' }
  },
  e3: { c: color('icon-base-selected', 'icon-high-selected-leak'), s: { 'md:1': 'icon-geometry' } },
  e11: {
    s: { all: 'indicator-geometry' },
    rr: { all: 'indicator-radius' },
    c: color('indicator-base', 'indicator-high')
  },
  selectionRest: {
    e1: { c: color('', 'root-high-rest'), e: { h: 'shadow-normal', rr: 'radius-normal' } },
    e2: { c: color('', 'label-high-rest') },
    e3: { c: color('', 'icon-high-rest') }
  }
};

const context: KiskadeeContextValue = {
  classesMap: { button: elements } as KiskadeeContextValue['classesMap'],
  designSystem: 'selection-emphasis',
  segment: 'default',
  theme: 'light',
  setDesignSystem() {},
  setSegment() {},
  setTheme() {},
  componentArtifacts: {
    button: {
      component: 'button',
      indicator: { sizesByRadius: { rounded: ['md:1'] } },
      contentSurfaceContext: {
        default: {
          light: {
            onSubtle: {
              neutral: {
                medium: { rest: 'onSubtle', selected: 'onSubtle' },
                high: { rest: 'onVivid', selected: 'onSubtle', disabled: 'onSubtle' }
              }
            }
          }
        }
      }
    }
  }
};

function ContextProbe() {
  return <span data-testid="produced-context">{useSurfaceContext()}</span>;
}
function view(props: ButtonProps = {}, value = context) {
  return (
    <KiskadeeContext.Provider value={value}>
      <Button size="md" emphasis="medium" toggle controlState activationFeedback={false} {...props}>
        <Button.Icon>
          <svg />
        </Button.Icon>
        <Button.Label>
          Enable
          <ContextProbe />
        </Button.Label>
      </Button>
    </KiskadeeContext.Provider>
  );
}
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('Button selection emphasis', () => {
  it('keeps base selection when the framed member lacks its High surface projection', () => {
    const paint = resolveButtonSelectionPaint({
      elements,
      groupPaint: { member: { c: color('member-selected', '') } },
      controlState: true,
      selectionEmphasis: 'high',
      emphasis: 'medium',
      intent: 'neutral',
      surfaceContext: 'onSubtle',
      hasLabel: true,
      hasIcon: true,
      hasDisclosure: false,
      surfaced: false
    });
    expect(paint.emphasis).toBe('medium');
    expect(paint.selectedPaint).toBe(true);
    expect(paint.projection).toBeUndefined();
    expect(paint.highUnavailable).toBe(true);
  });

  it.each([
    ['lowest', false, false],
    ['low', false, true],
    ['medium', true, false],
    ['high', true, true]
  ] as const)('resolves %s without losing semantic selection', (level, promoted, indicated) => {
    render(view({ selectionEmphasis: level, shadow: true, radiusEffect: true }));
    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.classList.contains('-s')).toBe(true);
    expect(button.className).toContain('root-geometry');
    expect(button.className).toContain('root-radius');
    expect(button.className).toContain(promoted ? 'root-high-rest' : 'root-base-selected');
    expect(button.className).toContain(promoted ? 'shadow-normal' : 'shadow-selected');
    expect(button.className).toContain(promoted ? 'radius-normal' : 'radius-selected');
    expect(button.className).not.toContain('root-high-selected-leak');
    expect(button.querySelector('.k-btn-e2')?.className).toContain(
      promoted ? 'label-high-rest' : 'label-base-selected'
    );
    expect(button.querySelector('.k-btn-e3')?.className).toContain(
      promoted ? 'icon-high-rest' : 'icon-base-selected'
    );
    const indicator = button.querySelector('.k-btn-e11');
    expect(Boolean(indicator)).toBe(indicated);
    if (indicated) {
      expect(indicator?.className).toContain(promoted ? 'indicator-high' : 'indicator-base');
      expect(indicator?.classList.contains('k-btn-e11b')).toBe(true);
    }
    expect(screen.getByTestId('produced-context').textContent).toBe(
      promoted ? 'onVivid' : 'onSubtle'
    );
  });

  it('restores the base paint on deselection and always promotes to High even from Highest', () => {
    const { rerender } = render(view({ emphasis: 'highest', selectionEmphasis: 'high' }));
    const button = screen.getByRole('button');
    expect(button.className).toContain('root-high-rest');
    rerender(view({ emphasis: 'highest', selectionEmphasis: 'high', controlState: false }));
    expect(screen.getByRole('button')).toBe(button);
    expect(button.className).toContain('highest-base');
    expect(button.className).not.toContain('root-high-rest');
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.querySelector('.k-btn-e11')?.classList.contains('k-btn-e11b')).toBe(false);
  });

  it('uses explicit, preset and Lowest defaults in order', () => {
    const value: KiskadeeContextValue = {
      ...context,
      componentArtifacts: {
        button: {
          ...context.componentArtifacts!.button!,
          options: { selectionEmphasis: 'high' }
        }
      }
    };
    const { rerender } = render(view({}, value));
    const button = screen.getByRole('button');
    expect(button.className).toContain('root-high-rest');
    expect(button.querySelector('.k-btn-e11')).not.toBeNull();
    rerender(view({ selectionEmphasis: 'lowest' }, value));
    expect(button.className).toContain('root-base-selected');
    expect(button.querySelector('.k-btn-e11')).toBeNull();
    rerender(view());
    expect(button.querySelector('.k-btn-e11')).toBeNull();
  });

  it('keeps group emphasis shared while promoting only its selected member', () => {
    render(
      <KiskadeeContext.Provider value={context}>
        <Button.Group emphasis="medium" size="md" radius="rounded">
          <Button toggle controlState selectionEmphasis="high">
            Selected
          </Button>
          <Button toggle controlState={false} selectionEmphasis="high">
            Other
          </Button>
        </Button.Group>
      </KiskadeeContext.Provider>
    );
    const selected = screen.getByRole('button', { name: 'Selected' });
    const other = screen.getByRole('button', { name: 'Other' });
    expect(selected.parentElement).toBe(other.parentElement);
    expect(selected.className).toContain('root-high-rest');
    expect(selected.classList.contains('-s')).toBe(true);
    expect(selected.getAttribute('aria-pressed')).toBe('true');
    expect(selected.querySelector('.k-btn-e11b')).not.toBeNull();
    expect(other.className).toContain('root-base-selected');
    expect(other.className).not.toContain('root-high-rest');
    expect(other.classList.contains('-s')).toBe(false);
  });

  it('preserves the Neutral Medium icon surface when selecting a Primary High recipe', () => {
    const surfaced: ButtonClassesMap = {
      ...elements,
      e1: { ...elements.e1, c: { s: { primary: { m: 'primary-base', h: 'primary-selected' } } } },
      e2: { ...elements.e2, c: undefined },
      e3: { ...elements.e3, c: undefined },
      e4: { s: { all: 'surface-geometry' }, c: color('neutral-surface', '') },
      selectionRest: {
        ...elements.selectionRest,
        e1: { c: { s: { primary: { h: 'primary-high-rest' } } } },
        e4: { c: color('neutral-surface', '') }
      }
    };
    render(
      view(
        { intent: 'primary', iconTreatment: 'surface', selectionEmphasis: 'medium' },
        {
          ...context,
          classesMap: { button: surfaced }
        }
      )
    );
    const button = screen.getByRole('button');
    expect(button.className).toContain('primary-high-rest');
    expect(button.querySelector('.k-btn-e4')?.className).toContain('neutral-surface');
    expect(button.querySelector('.k-btn-e4')?.className).toContain('surface-geometry');
  });

  it('keeps base Selected when High or a visible part projection is unavailable', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { rerender } = render(
      view(
        { selectionEmphasis: 'high' },
        {
          ...context,
          classesMap: {
            button: { ...elements, selectionRest: undefined }
          } as KiskadeeContextValue['classesMap']
        }
      )
    );
    const button = screen.getByRole('button');
    expect(button.className).toContain('root-base-selected');
    expect(button.querySelector('.k-btn-e11')?.className).toContain('indicator-base');
    expect(warning).toHaveBeenCalledWith(expect.stringContaining('Keeping the base Selected'));
    rerender(
      view(
        { selectionEmphasis: 'medium' },
        {
          ...context,
          classesMap: {
            button: { ...elements, selectionRest: { e1: elements.selectionRest!.e1 } }
          } as KiskadeeContextValue['classesMap']
        }
      )
    );
    expect(button.className).toContain('root-base-selected');
    expect(button.querySelector('.k-btn-e11')).toBeNull();
  });

  it.each([
    { disabled: true },
    { pending: true },
    { interactionLocked: true }
  ])('suppresses the selected indicator while unavailable: %j', (terminal) => {
    const { rerender } = render(view({ selectionEmphasis: 'high', ...terminal }));
    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.classList.contains('-s')).toBe(true);
    expect(button.querySelector('.k-btn-e11')?.classList.contains('k-btn-e11b')).toBe(false);
    rerender(view({ selectionEmphasis: 'high' }));
    expect(button.querySelector('.k-btn-e11')?.classList.contains('k-btn-e11b')).toBe(true);
  });
});
