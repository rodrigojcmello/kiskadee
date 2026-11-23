/** @vitest-environment jsdom */

import type { HTMLAttributes, ReactNode } from 'react';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ButtonStateSection } from './ButtonStateSection';

const scenario = vi.hoisted(() => ({ context: 'onVivid', available: true, other: false }));
vi.mock('@kiskadee/react-components/resources', () => ({
  useKiskadee: () => ({ segment: 'default', theme: 'light' }),
  useSurfaceContext: () => scenario.context
}));
vi.mock('@/hooks/use-button-color-variants', () => ({
  useButtonColorVariants: () =>
    scenario.available || scenario.other
      ? {
          alternative: {
            'default.light': {
              onVivid: {
                ...(scenario.available ? { neutral: ['high', 'low', 'lowest'] } : {}),
                ...(scenario.other ? { primary: ['high'] } : {})
              }
            }
          }
        }
      : undefined
}));
vi.mock('@kiskadee/react-components/button', () => ({
  Button: Object.assign(
    ({
      emphasis,
      radius: _radius,
      size: _size,
      status,
      controlState,
      selectionEmphasis,
      intent,
      radiusEffect: _radiusEffect,
      ...props
    }: HTMLAttributes<HTMLButtonElement> & {
      emphasis?: string;
      intent?: string;
      radius?: string;
      size?: string;
      status?: string;
      controlState?: boolean;
      selectionEmphasis?: 'lowest' | 'low' | 'medium' | 'high';
      radiusEffect?: boolean;
    }) =>
      createElement('button', {
        type: 'button',
        ...props,
        'data-emphasis': emphasis,
        'data-status': status,
        'data-control-state': controlState,
        'data-selection-emphasis': selectionEmphasis,
        'data-intent': intent
      }),
    {
      Label: ({ children }: { children: ReactNode }) => <span>{children}</span>,
      Disclosure: () => <span aria-hidden="true">v</span>,
      Group: ({ children }: { children: ReactNode }) => <div>{children}</div>
    }
  )
}));

vi.mock('@kiskadee/react-components/text', () => ({
  Text: ({
    as = 'span',
    profile: _profile,
    emphasis: _emphasis,
    ...props
  }: HTMLAttributes<HTMLElement> & { as?: string; profile?: string; emphasis?: string }) =>
    createElement(as, props)
}));

vi.mock('@kiskadee/react-components/smooth-text', () => ({
  SmoothText: ({ children }: { children: ReactNode }) => <span>{children}</span>
}));

vi.mock('@/components/ShowcaseBackground/ShowcaseExampleCard', () => ({
  ShowcaseExampleCard: ({ children, ...props }: HTMLAttributes<HTMLElement>) => (
    <article {...props}>{children}</article>
  )
}));

vi.mock('@/utils/showcase-text-profiles', () => ({ useShowcaseTextProfiles: () => ({}) }));
vi.mock('./ButtonUnavailableExample', () => ({
  ButtonUnavailableExample: () => <p>Not published</p>
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: Root | undefined;
let container: HTMLDivElement | undefined;

afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  scenario.context = 'onVivid';
  scenario.available = true;
  scenario.other = false;
  container?.remove();
  container = undefined;
});

function render({
  selectionEmphasis,
  showFocusRing,
  simplified,
  grouped,
  colorVariant = 'standard',
  intent = 'neutral'
}: {
  selectionEmphasis?: 'lowest' | 'low' | 'medium' | 'high';
  showFocusRing?: boolean;
  simplified?: boolean;
  grouped?: boolean;
  colorVariant?: 'standard' | 'alternative';
  intent?: 'neutral' | 'neutral-alt';
} = {}) {
  if (!root) {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  }
  act(() =>
    root?.render(
      <ButtonStateSection
        colorVariant={colorVariant}
        intent={intent}
        title="Neutral"
        fontName="Test font"
        radius="rounded"
        scale="s:md:1"
        surfaceContext="onSubtle"
        selectionEmphasis={selectionEmphasis}
        showFocusRing={showFocusRing}
        simplified={simplified}
        grouped={grouped}
      />
    )
  );
}

function selectionControls() {
  return Array.from(
    container?.querySelectorAll<HTMLButtonElement>('button[data-control-state]') ?? []
  );
}

function selectedCount() {
  return container?.querySelectorAll('button[data-control-state="true"]').length;
}

describe('Button state section selection emphasis control', () => {
  it('changes qualified intent without replacing Buttons or resetting their selected state', () => {
    render({ selectionEmphasis: 'low' });
    const controls = selectionControls();
    const high = controls.find((button) => button.dataset.emphasis === 'high')!;
    act(() => high.click());
    render({ selectionEmphasis: 'low', colorVariant: 'alternative' });
    expect(selectionControls()).toEqual(controls);
    expect(high.dataset.controlState).toBe('false');
    expect(high.dataset.selectionEmphasis).toBe('low');
    expect(high.dataset.intent).toBe('neutral-alt');
  });
  it('applies the section variant only to supported emphasis and surface combinations', () => {
    const showAlt = () => render({ simplified: true, colorVariant: 'alternative' });
    showAlt();
    expect(container!.querySelector('[role=switch]')).toBeNull();
    expect(container!.querySelector('[data-emphasis="high"]')?.getAttribute('data-intent')).toBe(
      'neutral-alt'
    );
    expect(container!.querySelector('[data-emphasis="medium"]')?.getAttribute('data-intent')).toBe(
      'neutral'
    );
    scenario.context = 'onSubtle';
    showAlt();
    expect(container!.querySelector('[data-emphasis="high"]')?.getAttribute('data-intent')).toBe(
      'neutral'
    );
  });
  it('changes selection emphasis without changing selected state or replacing the controls', () => {
    render();
    const controls = selectionControls();
    expect(controls).toHaveLength(4);
    expect(selectedCount()).toBe(4);
    expect(
      controls.every((button) => button.getAttribute('data-selection-emphasis') === 'lowest')
    ).toBe(true);
    render({ selectionEmphasis: 'low' });
    expect(selectionControls()).toEqual(controls);
    expect(selectedCount()).toBe(4);
    expect(
      controls.every((button) => button.getAttribute('data-selection-emphasis') === 'low')
    ).toBe(true);
    render({ selectionEmphasis: 'lowest' });
    expect(selectionControls()).toEqual(controls);
    expect(selectedCount()).toBe(4);
    expect(
      controls.every((button) => button.getAttribute('data-selection-emphasis') === 'lowest')
    ).toBe(true);
  });

  it('preserves the level while individual controls are deselected and selected again', () => {
    render({ selectionEmphasis: 'low' });
    const high = selectionControls().find(
      (button) => button.getAttribute('data-emphasis') === 'high'
    )!;
    act(() => high.click());
    expect(high.textContent).toBe('Select');
    expect(high.getAttribute('data-control-state')).toBe('false');
    expect(high.getAttribute('data-selection-emphasis')).toBe('low');
    expect(selectedCount()).toBe(3);
    render({ selectionEmphasis: 'lowest' });
    expect(high.getAttribute('data-control-state')).toBe('false');
    expect(high.getAttribute('data-selection-emphasis')).toBe('lowest');
    act(() => high.click());
    expect(high.textContent).toBe('Selected');
    expect(high.getAttribute('data-selection-emphasis')).toBe('lowest');
    expect(selectedCount()).toBe(4);
  });

  it('keeps forced focus independent and does not force indicators onto ordinary or simplified rest examples', () => {
    render({ selectionEmphasis: 'low', showFocusRing: false });
    const focusControls = Array.from(container?.querySelectorAll('button') ?? []).filter(
      (button) => button.textContent === 'Focus'
    );
    expect(focusControls).toHaveLength(4);
    expect(focusControls.every((button) => !button.hasAttribute('data-status'))).toBe(true);
    expect(container?.querySelectorAll('button[data-selection-emphasis]')).toHaveLength(4);
    render({ selectionEmphasis: 'lowest', showFocusRing: true });
    expect(focusControls.every((button) => button.getAttribute('data-status') === 'focus')).toBe(
      true
    );
    expect(
      selectionControls().every(
        (button) => button.getAttribute('data-selection-emphasis') === 'lowest'
      )
    ).toBe(true);
    expect(selectedCount()).toBe(4);
    render({ selectionEmphasis: 'low', showFocusRing: true, simplified: true });
    expect(container?.querySelectorAll('button')).toHaveLength(4);
    expect(container?.querySelector('button[data-selection-emphasis]')).toBeNull();
    expect(container?.querySelector('button[data-control-state]')).toBeNull();
    expect(container?.querySelector('button[data-status="focus"]')).toBeNull();
  });

  it('applies the comparison level only to selection controls in connected groups', () => {
    render({ grouped: true, selectionEmphasis: 'low' });
    expect(container?.querySelectorAll('button')).toHaveLength(48);
    expect(container?.querySelectorAll('button[data-selection-emphasis="low"]')).toHaveLength(4);
    expect(selectionControls()).toHaveLength(4);
    expect(selectedCount()).toBe(4);
    for (const button of container?.querySelectorAll('button[aria-label$="additional action"]') ??
      []) {
      expect(button.hasAttribute('data-selection-emphasis')).toBe(false);
      expect(button.hasAttribute('data-control-state')).toBe(false);
    }
  });
});
