/** @vitest-environment jsdom */
import type { HTMLAttributes, ReactNode } from 'react';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ButtonIndicatorExamples } from './ButtonIndicatorExamples';

const artifact = vi.hoisted(() => ({
  coverage: { rounded: ['md:1'], pill: ['sm:1'] } as Partial<Record<string, string[]>>,
  outsideCoverage: { rounded: ['md:1'], pill: ['sm:1'] } as Partial<Record<string, string[]>>
}));

vi.mock('@kiskadee/react-components/button', () => ({
  useButtonArtifactConfig: () => ({
    indicatorSizesByRadius: artifact.coverage,
    outsideIndicatorSizesByRadius: artifact.outsideCoverage,
    stackedSizesByRadius: { rounded: ['md:1'] },
    stackedIndicatorSizesByRadius: { rounded: ['md:1'] },
    stackedOutsideIndicatorSizesByRadius: { rounded: ['md:1'] }
  }),
  Button: Object.assign(
    ({
      size: _size,
      radius: _radius,
      intent: _intent,
      emphasis: _emphasis,
      iconLayout: _layout,
      indicatorPlacement,
      indicator,
      controlState,
      toggle,
      pending,
      ...props
    }: HTMLAttributes<HTMLButtonElement> & {
      size?: string;
      radius?: string;
      intent?: string;
      emphasis?: string;
      iconLayout?: string;
      indicatorPlacement?: string;
      indicator?: boolean;
      controlState?: boolean;
      toggle?: boolean;
      pending?: boolean;
    }) =>
      createElement('button', {
        type: 'button',
        ...props,
        'aria-pressed': toggle ? controlState : undefined,
        'data-placement': indicatorPlacement,
        'data-indicator': indicator,
        'aria-busy': pending || undefined
      }),
    {
      Icon: ({ children }: { children: ReactNode }) => <span>{children}</span>,
      Label: ({ children }: { children: ReactNode }) => <span>{children}</span>,
      Group: ({ children }: { children: ReactNode }) => <div>{children}</div>
    }
  )
}));
vi.mock('@kiskadee/react-components/text', () => ({
  Text: ({
    as = 'span',
    profile: _profile,
    ...props
  }: HTMLAttributes<HTMLElement> & { as?: string; profile?: string }) => createElement(as, props)
}));
vi.mock('@kiskadee/react-components/icon', () => ({ FamilyResolvedIcon: () => <svg /> }));
vi.mock('@kiskadee/react-components/resources', () => ({
  useKiskadee: () => ({ density: 'compact', global: {} }),
  useComponentMetadata: () => ({ density: { c: 'md:1' } })
}));
vi.mock('@/components/ShowcaseBackground/ShowcaseExampleCard', () => ({
  ShowcaseExampleCard: ({ children }: { children: ReactNode }) => <article>{children}</article>
}));
vi.mock('@/components/ShowcaseDisplayPreferences', () => ({
  useShowcaseDisplayPreferences: () => ({ showDescriptions: true })
}));
vi.mock('@/app/ShowcaseDensityContext', () => ({
  useShowcaseDensity: () => ({ activeDensity: 'compact' })
}));
vi.mock('@/utils/showcase-text-profiles', () => ({ useShowcaseTextProfiles: () => ({}) }));
vi.mock('./ButtonUnavailableExample', () => ({
  ButtonUnavailableExample: () => <p>Not published</p>
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: Root | undefined;
let container: HTMLDivElement;

afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  container?.remove();
  artifact.coverage = { rounded: ['md:1'], pill: ['sm:1'] };
  artifact.outsideCoverage = { rounded: ['md:1'], pill: ['sm:1'] };
});

function render(
  radius: 'rounded' | 'pill' | 'square' = 'rounded',
  scale: 's:md:1' | 's:sm:1' = 's:md:1'
) {
  if (!root) {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  }
  act(() =>
    root?.render(
      <ButtonIndicatorExamples radius={radius} scale={scale} surfaceContext="onSubtle" />
    )
  );
}

describe('Button indicator Showcase', () => {
  it('leaves default and stacked samples under preset policy and explicitly opts in comparisons', () => {
    render();
    const buttons = Array.from(container.querySelectorAll('button'));
    for (const button of buttons.filter((element) =>
      ['Preset default', 'Chat'].includes(element.textContent ?? '')
    )) {
      expect(button.hasAttribute('data-indicator')).toBe(false);
    }
    for (const button of buttons.filter((element) =>
      ['I', 'primary', 'neutral', 'destructive', 'positive', 'Day', 'Week', 'Month'].includes(
        element.textContent ?? ''
      )
    )) {
      expect(button.getAttribute('data-indicator')).toBe('true');
    }
  });

  it('toggles each placement independently while preserving terminal selections', () => {
    render();
    const inside = container.querySelector<HTMLButtonElement>('button[data-placement="inside"]')!;
    const outside = container.querySelector<HTMLButtonElement>('button[data-placement="outside"]')!;
    expect(inside.getAttribute('aria-pressed')).toBe('true');
    act(() => inside.click());
    expect(inside.getAttribute('aria-pressed')).toBe('false');
    expect(outside.getAttribute('aria-pressed')).toBe('true');
    act(() => inside.click());
    expect(inside.getAttribute('aria-pressed')).toBe('true');
    for (const button of container.querySelectorAll(
      'button[disabled], button[aria-busy="true"], button[aria-disabled="true"]'
    )) {
      expect(button.getAttribute('aria-pressed')).toBe('true');
    }
  });

  it('requires published coverage for the current size and radius', () => {
    render('square');
    expect(container.querySelector('button')).toBeNull();
    expect(container.textContent).toContain('Not published');
    render('pill');
    expect(container.querySelector('button')).toBeNull();
    render('pill', 's:sm:1');
    expect(container.querySelector('button')).not.toBeNull();
    expect(container.textContent).not.toContain('Chat');
    render();
    expect(container.textContent).toContain('Chat');
  });

  it.each([
    'inside',
    'outside'
  ] as const)('keeps %s examples when only that recipe is published', (placement) => {
    if (placement === 'inside') artifact.outsideCoverage = {};
    else artifact.coverage = {};
    render();
    const buttons = Array.from(container.querySelectorAll('button'));
    expect(buttons.length).toBeGreaterThan(0);
    expect(buttons.every((button) => button.dataset.placement === placement)).toBe(true);
    expect(container.textContent).toContain('Not published');
  });
});
