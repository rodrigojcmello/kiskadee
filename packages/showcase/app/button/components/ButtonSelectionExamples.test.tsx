/** @vitest-environment jsdom */
import type { HTMLAttributes, ReactNode } from 'react';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ButtonSelectionExamples } from './ButtonSelectionExamples';

const artifact = vi.hoisted(() => ({
  mediumSizes: ['md:1'],
  radius: 'rounded' as 'rounded' | 'pill' | 'square',
  placement: 'inside' as 'inside' | 'outside',
  inside: { rounded: ['md:1'] } as Partial<Record<string, string[]>>,
  outside: { rounded: ['md:1'] } as Partial<Record<string, string[]>>,
  stacked: { rounded: ['md:1'] } as Partial<Record<string, string[]>>,
  stackedInside: { rounded: ['md:1'] } as Partial<Record<string, string[]>>,
  stackedOutside: { rounded: ['md:1'] } as Partial<Record<string, string[]>>
}));

vi.mock('@kiskadee/react-components/button', () => ({
  useButtonArtifactConfig: () => ({
    buttonClassesMap: {
      e8: { s: { all: 'container' }, rr: { all: 'rounded' }, rs: { all: 'square' } },
      e9: { s: { all: 'label' } },
      e10: { s: { all: 'icon' } }
    },
    indicatorSizesByRadius: artifact.inside,
    outsideIndicatorSizesByRadius: artifact.outside,
    stackedSizesByRadius: artifact.stacked,
    stackedIndicatorSizesByRadius: artifact.stackedInside,
    stackedOutsideIndicatorSizesByRadius: artifact.stackedOutside,
    options: { indicatorPlacement: artifact.placement }
  }),
  Button: Object.assign(
    ({
      size,
      radius,
      intent,
      emphasis,
      selectionEmphasis,
      indicatorPlacement,
      iconLayout,
      iconTreatment: _treatment,
      controlState,
      toggle,
      ...props
    }: HTMLAttributes<HTMLButtonElement> & {
      size?: string;
      radius?: string;
      intent?: string;
      emphasis?: string;
      selectionEmphasis?: string;
      indicatorPlacement?: string;
      iconLayout?: string;
      iconTreatment?: string;
      controlState?: boolean;
      toggle?: boolean;
    }) =>
      createElement('button', {
        type: 'button',
        ...props,
        'aria-pressed': toggle ? controlState : undefined,
        'data-size': size,
        'data-radius': radius,
        'data-intent': intent,
        'data-emphasis': emphasis,
        'data-selection-emphasis': selectionEmphasis,
        'data-placement': indicatorPlacement,
        'data-layout': iconLayout
      }),
    {
      Icon: ({ children }: { children: ReactNode }) => <span>{children}</span>,
      Label: ({ children }: { children: ReactNode }) => <span>{children}</span>
    }
  )
}));

vi.mock('@kiskadee/react-components/resources', () => ({
  useComponentMetadata: () => ({ sizeSupport: { sizes: artifact.mediumSizes } })
}));
vi.mock('@kiskadee/react-components/icon', () => ({
  FamilyResolvedIcon: ({ name }: { name: string }) => <svg data-icon={name} aria-hidden="true" />
}));
vi.mock('@kiskadee/react-components/smooth-text', () => ({
  SmoothText: ({ children }: { children: ReactNode }) => <span>{children}</span>
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
vi.mock('@/components/ShowcaseBackground/ShowcaseExampleCard', () => ({
  ShowcaseExampleCard: ({ children }: { children: ReactNode }) => <div>{children}</div>
}));
vi.mock('@/components/ShowcaseDisplayPreferences', () => ({
  useShowcaseDisplayPreferences: () => ({ showDescriptions: true })
}));
vi.mock('@/utils/showcase-text-profiles', () => ({
  useShowcaseTextProfiles: () => ({})
}));
vi.mock('./ButtonUnavailableExample', () => ({
  ButtonUnavailableExample: () => <p data-button-unavailable>Not published</p>
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: Root | undefined;
let container: HTMLDivElement;

afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  container?.remove();
  artifact.mediumSizes = ['md:1'];
  artifact.radius = 'rounded';
  artifact.placement = 'inside';
  artifact.inside = { rounded: ['md:1'] };
  artifact.outside = { rounded: ['md:1'] };
  artifact.stacked = { rounded: ['md:1'] };
  artifact.stackedInside = { rounded: ['md:1'] };
  artifact.stackedOutside = { rounded: ['md:1'] };
});

function render() {
  if (!root) {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  }
  act(() =>
    root?.render(
      <ButtonSelectionExamples
        fontName="Test font"
        radius={artifact.radius}
        surfaceContext="onSubtle"
      />
    )
  );
}

function sample(name: 'emphasis' | 'selected' | 'indicator' | 'stacked') {
  return container.querySelector(`[data-button-selection-example="${name}"]`)!;
}

function button(name: 'emphasis' | 'selected' | 'indicator' | 'stacked') {
  const element = sample(name).querySelector('button');
  expect(element).not.toBeNull();
  return element!;
}

describe('Button selection behavior examples', () => {
  it('demonstrates all four selection levels without changing the base emphasis or bypassing selection', () => {
    render();
    const levels = {
      selected: 'lowest',
      indicator: 'low',
      emphasis: 'medium',
      stacked: 'high'
    } as const;
    for (const name of ['selected', 'indicator', 'emphasis', 'stacked'] as const) {
      const action = button(name);
      expect(action.dataset.emphasis).toBe('medium');
      expect(action.dataset.selectionEmphasis).toBe(levels[name]);
      expect(action.getAttribute('aria-pressed')).toBe('false');
      act(() => action.click());
      expect(action.getAttribute('aria-pressed')).toBe('true');
      expect(action.dataset.emphasis).toBe('medium');
      expect(action.dataset.selectionEmphasis).toBe(levels[name]);
    }
    expect(button('emphasis').textContent).toBe('Unfollow');
    expect(button('selected').textContent).toBe('Enabled');
    expect(button('indicator').textContent).toBe('Enabled');
    expect(button('stacked').textContent).toBe('Hand raised');
    expect(button('stacked').dataset.layout).toBe('stacked');
    expect(button('stacked').querySelector('[data-icon="hand"]')).not.toBeNull();
    act(() => button('indicator').click());
    expect(button('indicator').getAttribute('aria-pressed')).toBe('false');
    expect(button('selected').getAttribute('aria-pressed')).toBe('true');
    expect(button('emphasis').getAttribute('aria-pressed')).toBe('true');
    expect(button('stacked').getAttribute('aria-pressed')).toBe('true');
  });

  it('removes unsupported indicator comparisons on a preset change and restores their state', () => {
    render();
    act(() => button('indicator').click());
    act(() => button('stacked').click());
    artifact.inside = {};
    artifact.stackedInside = {};
    render();
    expect(sample('indicator').querySelector('button')).toBeNull();
    expect(sample('stacked').querySelector('button')).toBeNull();
    expect(container.querySelectorAll('button')).toHaveLength(2);
    expect(container.querySelectorAll('[data-button-unavailable]')).toHaveLength(2);
    artifact.placement = 'outside';
    render();
    expect(button('indicator').dataset.placement).toBe('outside');
    expect(button('stacked').dataset.placement).toBe('outside');
    expect(button('indicator').getAttribute('aria-pressed')).toBe('true');
    expect(button('stacked').getAttribute('aria-pressed')).toBe('true');
  });

  it('normalizes Pill to Rounded for Stacked while requiring the effective indicator coverage', () => {
    render();
    artifact.radius = 'pill';
    render();
    expect(button('emphasis').dataset.radius).toBe('pill');
    expect(button('selected').dataset.radius).toBe('pill');
    expect(sample('indicator').querySelector('button')).toBeNull();
    expect(button('stacked').dataset.radius).toBe('rounded');
    artifact.outside = { pill: ['md:1'] };
    artifact.stacked = { pill: ['md:1'] };
    artifact.stackedOutside = { pill: ['md:1'] };
    artifact.placement = 'outside';
    render();
    expect(button('indicator').dataset.radius).toBe('pill');
    expect(sample('stacked').querySelector('button')).toBeNull();
    artifact.stacked = { rounded: ['md:1'] };
    render();
    expect(sample('stacked').querySelector('button')).toBeNull();
    artifact.stackedOutside = { rounded: ['md:1'] };
    render();
    expect(button('stacked').dataset.radius).toBe('rounded');
    expect(container.querySelectorAll('[data-button-unavailable]')).toHaveLength(0);
    artifact.mediumSizes = ['sm:1'];
    render();
    expect(container.querySelector('button')).toBeNull();
    expect(container.querySelectorAll('[data-button-unavailable]')).toHaveLength(4);
  });

  it('preserves Square for Stacked and checks its own layout and indicator coverage', () => {
    artifact.radius = 'square';
    render();
    expect(sample('stacked').querySelector('button')).toBeNull();
    artifact.stacked = { square: ['md:1'] };
    render();
    expect(sample('stacked').querySelector('button')).toBeNull();
    artifact.stackedInside = { square: ['md:1'] };
    render();
    expect(button('stacked').dataset.radius).toBe('square');
    act(() => button('stacked').click());
    expect(button('stacked').getAttribute('aria-pressed')).toBe('true');
  });
});
