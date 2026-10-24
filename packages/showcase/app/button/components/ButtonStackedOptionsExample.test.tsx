/** @vitest-environment jsdom */
import type { RadiusMode } from '@kiskadee/core';
import type { ButtonArtifactConfig } from '@kiskadee/react-components/button';
import type { HTMLAttributes, ReactNode } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ButtonStackedOptionsExample } from './ButtonStackedOptionsExample';

vi.mock('@kiskadee/react-components/button', async () => {
  const { createElement } = await import('react');
  return {
    Button: Object.assign(
      ({
        toggle,
        controlState,
        iconLayout: _layout,
        iconTreatment: _treatment,
        intent: _intent,
        emphasis: _emphasis,
        radius: _radius,
        size: _size,
        ...props
      }: HTMLAttributes<HTMLButtonElement> & {
        toggle?: boolean;
        controlState?: boolean;
        iconLayout?: string;
        iconTreatment?: string;
        intent?: string;
        emphasis?: string;
        radius?: string;
        size?: string;
      }) =>
        createElement('button', {
          ...props,
          'aria-pressed': toggle ? controlState === true : undefined
        }),
      {
        Icon: (props: HTMLAttributes<HTMLElement>) => createElement('span', props),
        Label: (props: HTMLAttributes<HTMLElement>) => createElement('span', props)
      }
    )
  };
});

vi.mock('@kiskadee/react-components/icon', () => ({
  FamilyResolvedIcon: () => <svg aria-hidden="true" />,
  Icon: ({ label, children }: { label: string; children: ReactNode }) => (
    <span role="img" aria-label={label}>
      {children}
    </span>
  )
}));

vi.mock('@kiskadee/react-components/smooth-text', () => ({
  SmoothText: ({ children }: { children: ReactNode }) => <span>{children}</span>
}));

vi.mock('@kiskadee/react-components/text', async () => {
  const { createElement } = await import('react');
  return {
    Text: ({
      as = 'span',
      profile: _profile,
      emphasis: _emphasis,
      ...props
    }: HTMLAttributes<HTMLElement> & {
      as?: 'span' | 'p' | 'h3';
      profile: string;
      emphasis?: string;
    }) => createElement(as, props)
  };
});

vi.mock('@/components/ShowcaseBackground/ShowcaseExampleCard', () => ({
  ShowcaseExampleCard: ({ children }: { children: ReactNode }) => <div>{children}</div>
}));

vi.mock('@/components/ShowcaseDisplayPreferences', () => ({
  useShowcaseDisplayPreferences: () => ({ showDescriptions: true })
}));

vi.mock('@/utils/showcase-text-profiles', () => ({
  useShowcaseTextProfiles: () => ({ sectionTitle: 'test-heading', body: 'test-body' })
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: Root | undefined;
let container: HTMLDivElement | undefined;

afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  container?.remove();
  container = undefined;
});

function example({
  classesMap = {
    e8: { s: { all: 'container' }, rr: { all: 'rounded' } },
    e9: { s: { all: 'label' } },
    e10: { s: { all: 'icon' } }
  },
  radius = 'rounded',
  stackedSizes = ['md:1']
}: {
  classesMap?: ButtonArtifactConfig['buttonClassesMap'];
  radius?: RadiusMode;
  stackedSizes?: readonly string[];
} = {}) {
  return (
    <ButtonStackedOptionsExample
      classesMap={classesMap}
      fontName="Test font"
      radius={radius}
      stackedSizes={stackedSizes}
      surfaceContext="onSubtle"
    />
  );
}

function render() {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  act(() => root?.render(example()));
}

function button(label: string) {
  const result = Array.from(container?.querySelectorAll('button') ?? []).find(
    (element) => element.textContent === label
  );
  expect(result).toBeDefined();
  return result as HTMLButtonElement;
}

function selected() {
  return Array.from(
    container?.querySelectorAll('button[aria-pressed="true"]') ?? [],
    (element) => element.textContent
  );
}

describe('Stacked options selection', () => {
  it('toggles options and removes the oldest selection when a third option is selected', () => {
    render();
    expect(selected()).toEqual([]);
    expect(container?.querySelector('[role="status"]')).toBeNull();
    act(() => button('Record').click());
    act(() => button('Chat').click());
    expect(selected()).toEqual(['Record', 'Chat']);
    act(() => button('People').click());
    expect(selected()).toEqual(['Chat', 'People']);
    act(() => button('Chat').click());
    expect(selected()).toEqual(['People']);
    act(() => button('Chat').click());
    expect(selected()).toEqual(['Chat', 'People']);
    act(() => button('Raise').click());
    expect(selected()).toEqual(['Chat', 'Raise']);
    expect(button('People').getAttribute('aria-pressed')).toBe('false');
  });

  it('preserves selection order and toggles across clicks batched in one update', () => {
    render();
    act(() => {
      button('Record').click();
      button('Chat').click();
      button('Record').click();
      button('People').click();
    });
    expect(selected()).toEqual(['Chat', 'People']);
    act(() => {
      button('Raise').click();
      button('React').click();
      button('View').click();
    });
    expect(selected()).toEqual(['React', 'View']);
  });

  it('requires the active radius and restores the option bar when switching to a supported radius', () => {
    render();
    const classesMap = {
      e8: { s: { all: 'container' }, rp: { 'md:1': 'pill' } },
      e9: { s: { all: 'label' } },
      e10: { s: { all: 'icon' } }
    };
    act(() => root?.render(example({ classesMap, radius: 'rounded', stackedSizes: [] })));
    expect(container?.querySelector('button')).toBeNull();
    act(() => root?.render(example({ classesMap, radius: 'pill', stackedSizes: ['md:1'] })));
    expect(container?.querySelectorAll('button')).toHaveLength(11);
    act(() => {
      button('Record').click();
      button('Chat').click();
      button('People').click();
    });
    expect(selected()).toEqual(['Chat', 'People']);
    act(() => root?.render(example({ classesMap, radius: 'rounded', stackedSizes: [] })));
    expect(container?.querySelector('button')).toBeNull();
  });
});
