/** @vitest-environment jsdom */
import type { RadiusMode } from '@kiskadee/core';
import type { ButtonArtifactConfig } from '@kiskadee/react-components/button';
import type { HTMLAttributes, ReactNode } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ButtonStackedExamples } from './ButtonStackedExamples';

vi.mock('@kiskadee/react-components/button', async () => {
  const { createElement, forwardRef } = await import('react');
  const Button = Object.assign(
    forwardRef<HTMLButtonElement, Record<string, unknown>>(function Button(
      {
        iconLayout,
        iconTreatment: _treatment,
        radius,
        size,
        intent,
        emphasis,
        surfaceContext: _surface,
        ...props
      },
      ref
    ) {
      return createElement('button', {
        ...props,
        ref,
        'data-layout': iconLayout,
        'data-radius': radius,
        'data-size': size,
        'data-intent': intent,
        'data-emphasis': emphasis
      });
    }),
    {
      Icon: (props: HTMLAttributes<HTMLElement>) => createElement('span', props),
      Label: (props: HTMLAttributes<HTMLElement>) => createElement('span', props)
    }
  );
  return { Button };
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
      foreground: _foreground,
      emphasis: _emphasis,
      ...props
    }: HTMLAttributes<HTMLElement> & {
      as?: 'span' | 'p';
      profile: string;
      foreground?: string;
      emphasis?: string;
    }) => createElement(as, props)
  };
});

vi.mock('@/components/ShowcaseDisplayPreferences', () => ({
  useShowcaseDisplayPreferences: () => ({ showDescriptions: true })
}));

vi.mock('@/utils/showcase-text-profiles', () => ({
  useShowcaseTextProfiles: () => ({ caption: 'test-caption', subsectionTitle: 'test-heading' })
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

function examples(
  classesMap: ButtonArtifactConfig['buttonClassesMap'],
  stackedSizes: readonly string[] | undefined = ['sm:1', 'md:1', 'lg:1', 'lg:2'],
  radius: RadiusMode = 'rounded'
) {
  return (
    <ButtonStackedExamples
      classesMap={classesMap}
      fontName="Test font"
      heightReference={{ 's:sm:1': 48, 's:md:1': 56, 's:lg:1': 68, 's:lg:2': 80 }}
      radius={radius}
      referenceProfile="caption-small"
      stackedSizes={stackedSizes}
      surfaceContext="onSubtle"
    />
  );
}

function render(classesMap: ButtonArtifactConfig['buttonClassesMap']) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  act(() => root?.render(examples(classesMap)));
  return container;
}

describe('Stacked Button Showcase examples', () => {
  it('uses stacked height references and exposes a functional Neutral Low action', () => {
    const container = render({
      e8: { s: { all: 'container' }, rr: { all: 'rounded' } },
      e9: { s: { all: 'label' } },
      e10: { s: { all: 'icon' } }
    });
    expect(
      Array.from(container.querySelectorAll('[data-button-expected-height]'), (element) =>
        element.getAttribute('data-button-expected-height')
      )
    ).toEqual(['48', '56', '68', '80']);
    const buttons = Array.from(container.querySelectorAll('button'));
    expect(buttons).toHaveLength(5);
    expect(buttons.every((button) => button.dataset.layout === 'stacked')).toBe(true);
    expect(buttons.slice(0, 4).map((button) => button.dataset.size)).toEqual([
      'sm',
      'md',
      'lg',
      'lg2'
    ]);
    const action = buttons[4];
    expect(action.dataset.intent).toBe('neutral');
    expect(action.dataset.emphasis).toBe('low');
    expect(action.type).toBe('button');
    expect(container.querySelector('[role="status"]')?.textContent).toBe('No items added yet.');
    act(() => action.click());
    expect(container.querySelector('[role="status"]')?.textContent).toBe('Added 1 item.');
    act(() => action.click());
    expect(container.querySelector('[role="status"]')?.textContent).toBe('Added 2 items.');
  });

  it('replaces unsupported sizes and removes stacked actions after a preset capability change', () => {
    const container = render({
      e8: { s: { 'md:1': 'container' }, rr: { all: 'rounded' } },
      e9: { s: { 'md:1': 'label' } },
      e10: { s: { 'md:1': 'icon' } }
    });
    expect(container.querySelectorAll('[data-button-unavailable]')).toHaveLength(3);
    expect(container.querySelectorAll('button')).toHaveLength(2);
    act(() => root?.render(examples({})));
    expect(container.querySelectorAll('[data-button-unavailable]')).toHaveLength(4);
    expect(container.querySelector('button')).toBeNull();
    expect(container.querySelector('[role="status"]')).toBeNull();
    expect(container.querySelector('[data-button-height-ruler]')).toBeNull();
  });

  it('uses derived size coverage rather than shared classes when metadata changes', () => {
    const classesMap = {
      e8: { s: { all: 'border' }, rr: { all: 'rounded' } },
      e9: { s: { all: 'gap' } },
      e10: { s: { all: 'icon' } }
    };
    const container = render(classesMap);
    act(() => root?.render(examples(classesMap, ['md:1'])));
    expect(container.querySelectorAll('[data-button-unavailable]')).toHaveLength(3);
    expect(container.querySelectorAll('button')).toHaveLength(2);
    expect(
      container
        .querySelector('[data-button-expected-height]')
        ?.getAttribute('data-button-expected-height')
    ).toBe('56');
    act(() => root?.render(examples(classesMap, [])));
    expect(container.querySelectorAll('[data-button-unavailable]')).toHaveLength(4);
    expect(container.querySelector('button')).toBeNull();
  });

  it('does not activate legacy Pill-only recipes and normalizes Pill requests to authored Rounded', () => {
    const classesMap = {
      e8: { s: { all: 'container' }, rp: { 'md:1': 'pill' } },
      e9: { s: { all: 'label' } },
      e10: { s: { all: 'icon' } }
    };
    const container = render(classesMap);
    act(() => root?.render(examples(classesMap, [], 'rounded')));
    expect(container.querySelectorAll('[data-button-unavailable]')).toHaveLength(4);
    expect(container.querySelector('button')).toBeNull();
    expect(container.querySelector('[data-button-height-ruler]')).toBeNull();
    expect(container.querySelector('[role="status"]')).toBeNull();

    act(() => root?.render(examples(classesMap, ['md:1'], 'pill')));
    expect(container.querySelector('button')).toBeNull();

    const roundedClasses = {
      ...classesMap,
      e8: { s: { all: 'container' }, rr: { 'md:1': 'rounded' } }
    };
    act(() => root?.render(examples(roundedClasses, ['md:1'], 'pill')));
    expect(container.querySelectorAll('button')).toHaveLength(2);
    expect(
      Array.from(container.querySelectorAll('button'), (button) => button.dataset.radius)
    ).toEqual(['rounded', 'rounded']);
    expect(container.querySelector('[data-button-height-ruler]')).not.toBeNull();

    act(() => root?.render(examples(classesMap, [], 'rounded')));
    expect(container.querySelector('button')).toBeNull();
  });

  it('preserves Square requests and requires their own authored recipe', () => {
    const classesMap = {
      e8: { s: { all: 'container' }, rs: { all: 'square' } },
      e9: { s: { all: 'label' } },
      e10: { s: { all: 'icon' } }
    };
    const container = render(classesMap);
    expect(container.querySelector('button')).toBeNull();
    act(() => root?.render(examples(classesMap, ['md:1'], 'square')));
    expect(container.querySelectorAll('button')).toHaveLength(2);
    expect(
      Array.from(container.querySelectorAll('button'), (button) => button.dataset.radius)
    ).toEqual(['square', 'square']);
  });
});
