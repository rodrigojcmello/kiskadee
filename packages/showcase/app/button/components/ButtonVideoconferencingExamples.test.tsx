/** @vitest-environment jsdom */
import type { ElementSizeValue, RadiusMode } from '@kiskadee/core';
import type { ButtonArtifactConfig } from '@kiskadee/react-components/button';
import type { HTMLAttributes, ReactNode } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ButtonVideoconferencingExamples } from './ButtonVideoconferencingExamples';

const artifact = vi.hoisted(() => ({
  sizes: ['md:1'],
  globalRadius: 'rounded' as RadiusMode
}));

vi.mock('@kiskadee/react-components/button', async () => {
  const { createElement } = await import('react');
  return {
    Button: Object.assign(
      ({
        toggle,
        controlState,
        iconLayout,
        iconTreatment: _treatment,
        intent,
        emphasis,
        selectionEmphasis,
        selectionIntent,
        radius,
        size: _size,
        'aria-pressed': ariaPressed,
        ...props
      }: HTMLAttributes<HTMLButtonElement> & {
        toggle?: boolean;
        controlState?: boolean;
        iconLayout?: string;
        iconTreatment?: string;
        intent?: string;
        emphasis?: string;
        selectionEmphasis?: string;
        selectionIntent?: string;
        radius?: string;
        size?: string;
      }) =>
        createElement('button', {
          ...props,
          'aria-pressed': ariaPressed ?? (toggle ? controlState === true : undefined),
          'data-control-state': controlState === true,
          'data-emphasis': emphasis,
          'data-selection-emphasis': selectionEmphasis,
          'data-selection-intent': selectionIntent,
          'data-intent': intent,
          'data-layout': iconLayout,
          'data-radius': radius
        }),
      {
        Icon: (props: HTMLAttributes<HTMLElement>) =>
          createElement('span', { ...props, 'data-button-part': 'icon' }),
        Label: (props: HTMLAttributes<HTMLElement>) =>
          createElement('span', { ...props, 'data-button-part': 'label' })
      }
    )
  };
});

vi.mock('@kiskadee/react-components/resources', () => ({
  useComponentMetadata: () => ({ sizeSupport: { sizes: artifact.sizes } }),
  useKiskadee: () => ({ global: { radius: artifact.globalRadius } })
}));

vi.mock('@kiskadee/react-components/icon', () => ({
  FamilyResolvedIcon: ({ name }: { name: string }) => <svg data-icon={name} aria-hidden="true" />,
  Icon: ({ label, children }: { label: string; children: ReactNode }) => (
    <span role="img" aria-label={label}>
      {children}
    </span>
  )
}));

vi.mock('@kiskadee/react-components/smooth-text', () => ({
  SmoothText: ({ children }: { children: ReactNode }) => <span>{children}</span>
}));

vi.mock('@kiskadee/react-components/container', () => ({
  Container: ({
    children,
    intent,
    emphasis
  }: {
    children: ReactNode;
    intent?: string;
    emphasis?: string;
  }) => (
    <div data-container-intent={intent} data-container-emphasis={emphasis}>
      {children}
    </div>
  )
}));

vi.mock('@kiskadee/react-components/layout', () => ({
  Layout: ({
    children,
    padding,
    columns
  }: {
    children: ReactNode;
    padding?: string;
    columns?: Record<string, number>;
  }) => (
    <div data-layout-padding={padding} data-layout-columns={JSON.stringify(columns)}>
      {children}
    </div>
  )
}));

vi.mock('@kiskadee/react-components/separator', () => ({
  Separator: () => <hr data-card-separator />
}));

vi.mock('@/components/ShowcaseControls', () => ({
  ShowcaseContentSelectControl: ({
    label,
    value,
    disabled,
    size,
    variant,
    loop,
    width,
    maxWidth,
    onValueChange,
    options,
    'aria-describedby': descriptionId
  }: {
    label: string;
    value: string;
    disabled?: boolean;
    size?: string;
    variant?: string;
    loop?: boolean;
    width?: string;
    maxWidth?: string;
    onValueChange: (value: string) => void;
    options: ReadonlyArray<{ value: string; label: string }>;
    'aria-describedby'?: string;
  }) => (
    <label>
      {label}
      <select
        value={value}
        disabled={disabled}
        data-size={size}
        data-variant={variant}
        data-loop={loop}
        data-width={width}
        data-max-width={maxWidth}
        aria-describedby={descriptionId}
        onChange={(event) => onValueChange(event.currentTarget.value)}
      >
        {options.map((option) => (
          <option value={option.value} key={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
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
      as?: string;
      profile: string;
      emphasis?: string;
    }) => createElement(as, props)
  };
});

vi.mock('@/components/ShowcaseBackground/ShowcaseExampleCard', () => ({
  ShowcaseExampleCard: ({
    children,
    padding,
    clipContent
  }: {
    children: ReactNode;
    padding?: false | string;
    clipContent?: boolean;
  }) => (
    <div data-example-card data-card-padding={String(padding)} data-card-clipped={clipContent}>
      {children}
    </div>
  )
}));

vi.mock('@/components/ShowcaseDisplayPreferences', () => ({
  useShowcaseDisplayPreferences: () => ({ showDescriptions: true })
}));

vi.mock('@/utils/showcase-text-profiles', () => ({
  useShowcaseTextProfiles: () => ({
    subsectionTitle: 'test-heading',
    bodyStrong: 'test-subheading',
    body: 'test-body'
  })
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: Root | undefined;
let container: HTMLDivElement | undefined;

afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  container?.remove();
  container = undefined;
  artifact.sizes = ['md:1'];
  artifact.globalRadius = 'rounded';
});

const normalElements = {
  e1: {
    s: { all: 'button' },
    rr: { all: 'rounded' },
    c: {
      s: {
        primary: { m: 'primary' },
        neutral: { m: 'neutral' },
        destructive: { m: 'destructive' },
        positive: { m: 'positive' }
      }
    }
  },
  e3: { s: { all: 'normal-icon' } }
};
const stackedElements = {
  e8: { s: { all: 'container' }, rr: { all: 'rounded' } },
  e9: { s: { all: 'label' } },
  e10: { s: { all: 'stacked-icon' } }
};

function example({
  classesMap = { ...normalElements, ...stackedElements },
  radius = 'rounded',
  scale = 's:md:1',
  selectionControlAvailable = true,
  stackedSizes = ['md:1']
}: {
  classesMap?: ButtonArtifactConfig['buttonClassesMap'];
  radius?: RadiusMode;
  scale?: ElementSizeValue;
  selectionControlAvailable?: boolean;
  stackedSizes?: readonly string[];
} = {}) {
  return (
    <ButtonVideoconferencingExamples
      classesMap={classesMap}
      fontName="Test font"
      radius={radius}
      scale={scale}
      selectionControlAvailable={selectionControlAvailable}
      stackedSizes={stackedSizes}
      surfaceContext="onSubtle"
    />
  );
}

function render(selectionControlAvailable = true) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  act(() => root?.render(example({ selectionControlAvailable })));
}

function bar(layout: 'stacked' | 'icon') {
  const result = container?.querySelector(`[data-button-meeting-layout="${layout}"]`);
  expect(result).toBeDefined();
  return result as HTMLElement;
}

function button(layout: 'stacked' | 'icon', label: string) {
  const result = Array.from(bar(layout).querySelectorAll('button')).find(
    (element) => element.getAttribute('aria-label') === label || element.textContent === label
  );
  expect(result).toBeDefined();
  return result as HTMLButtonElement;
}

function selected(layout: 'stacked' | 'icon') {
  return Array.from(
    bar(layout).querySelectorAll('button[aria-pressed="true"]'),
    (element) => element.getAttribute('aria-label') ?? element.textContent
  );
}

function control(layout: 'stacked' | 'icon', label: string) {
  const result = Array.from(bar(layout).querySelectorAll('label'))
    .find((element) => element.firstChild?.textContent === label)
    ?.querySelector('select');
  expect(result).not.toBeNull();
  expect(result).toBeDefined();
  return result as HTMLSelectElement;
}

function selectionControl(layout: 'stacked' | 'icon') {
  return control(layout, 'Selection emphasis');
}

function changeControl(layout: 'stacked' | 'icon', label: string, value: string) {
  const element = control(layout, label);
  act(() => {
    element.value = value;
    element.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

function changeSelectionEmphasis(layout: 'stacked' | 'icon', value: string) {
  changeControl(layout, 'Selection emphasis', value);
}

describe('Videoconferencing options', () => {
  it('places four equal-width presentation controls in each Card header above the options', () => {
    render();
    expect(container?.querySelectorAll('select')).toHaveLength(8);
    expect(container?.querySelectorAll('[data-example-card]')).toHaveLength(2);
    for (const layout of ['stacked', 'icon'] as const) {
      const card = bar(layout).querySelector('[data-example-card]');
      const header = card?.querySelector('[data-container-intent="neutralComplementary"]');
      const options = bar(layout).querySelector('fieldset');
      expect(card?.getAttribute('data-card-padding')).toBe('false');
      expect(card?.getAttribute('data-card-clipped')).toBe('true');
      expect(header?.getAttribute('data-container-emphasis')).toBe('low');
      for (const label of ['Button intent', 'Emphasis', 'Selection intent', 'Selection emphasis']) {
        const element = control(layout, label);
        expect(header?.contains(element)).toBe(true);
        expect(element.getAttribute('data-size')).toBe('sm');
        expect(element.getAttribute('data-variant')).toBe('sequential');
        expect(element.getAttribute('data-loop')).toBe('true');
        expect(element.getAttribute('data-width')).toBe('100%');
        expect(element.getAttribute('data-max-width')).toBe('100%');
      }
      expect(
        header?.querySelector('[data-layout-columns]')?.getAttribute('data-layout-columns')
      ).toBe(JSON.stringify({ 'bp:all': 1, 'bp:lg:1': 4 }));
      expect(control(layout, 'Button intent').value).toBe('original');
      expect(control(layout, 'Emphasis').value).toBe('low');
      expect(control(layout, 'Selection intent').value).toBe('same');
      expect(header?.contains(options ?? null)).toBe(false);
      expect(card?.querySelector('[data-card-separator]')).not.toBeNull();
      expect(selectionControl(layout).closest('[data-layout-padding="md"]')).not.toBeNull();
      expect(options?.closest('[data-layout-padding="md"]')).not.toBeNull();
      const descriptionId = selectionControl(layout).getAttribute('aria-describedby');
      expect(descriptionId).toBeTruthy();
      expect(document.getElementById(descriptionId!)).not.toBeNull();
    }
  });

  it('starts Stacked at Low and Icon only at Medium and changes their presentation independently', () => {
    render();
    expect(selectionControl('stacked').value).toBe('low');
    expect(selectionControl('icon').value).toBe('medium');
    for (const layout of ['stacked', 'icon'] as const) {
      expect(Array.from(selectionControl(layout).options, (option) => option.value)).toEqual([
        'lowest',
        'low',
        'medium',
        'high'
      ]);
      const otherLayout = layout === 'stacked' ? 'icon' : 'stacked';
      const otherLevel = selectionControl(otherLayout).value;
      for (const level of ['lowest', 'low', 'medium', 'high']) {
        changeSelectionEmphasis(layout, level);
        expect(selected(layout)).toEqual(
          layout === 'stacked' ? ['Share', 'Raise'] : ['React', 'Leave']
        );
        for (const element of bar(layout).querySelectorAll('button')) {
          expect(element.getAttribute('data-emphasis')).toBe('low');
          expect(element.getAttribute('data-selection-emphasis')).toBe(level);
          expect(element.getAttribute('data-control-state')).toBe(
            element.getAttribute('aria-pressed')
          );
        }
        expect(selectionControl(otherLayout).value).toBe(otherLevel);
        expect(selected(otherLayout)).toEqual(
          otherLayout === 'stacked' ? ['Share', 'Raise'] : ['React', 'Leave']
        );
        for (const element of bar(otherLayout).querySelectorAll('button')) {
          expect(element.getAttribute('data-selection-emphasis')).toBe(otherLevel);
        }
      }
    }
    act(() => button('stacked', 'Record').click());
    act(() => button('icon', 'Record').click());
    expect(selected('stacked')).toEqual(['Record', 'Raise']);
    expect(selected('icon')).toEqual(['Record', 'Leave']);
    expect(button('icon', 'Leave').getAttribute('data-intent')).toBe('destructive');
    expect(button('icon', 'Leave').getAttribute('data-selection-emphasis')).toBe('high');
    expect(button('icon', 'Leave').getAttribute('data-control-state')).toBe('true');
  });

  it.each([
    'stacked',
    'icon'
  ] as const)('changes the %s bar intents and emphasis without changing either selection or the other controls', (layout) => {
    render();
    const otherLayout = layout === 'stacked' ? 'icon' : 'stacked';
    const initialSelection = selected(layout);
    const otherSelection = selected(otherLayout);
    const otherSelectionEmphasis = selectionControl(otherLayout).value;
    expect(Array.from(control(layout, 'Button intent').options, (option) => option.value)).toEqual([
      'original',
      'primary',
      'neutral',
      'destructive',
      'positive'
    ]);
    expect(
      Array.from(control(layout, 'Selection intent').options, (option) => option.value)
    ).toEqual(['same', 'primary', 'neutral', 'destructive', 'positive']);
    for (const label of ['Record', 'Share', 'Leave']) {
      expect(button(layout, label).getAttribute('data-selection-intent')).toBe(
        button(layout, label).getAttribute('data-intent')
      );
    }
    changeControl(layout, 'Button intent', 'positive');
    changeControl(layout, 'Emphasis', 'high');
    changeControl(layout, 'Selection intent', 'destructive');
    changeSelectionEmphasis(layout, 'high');
    for (const element of bar(layout).querySelectorAll('button')) {
      expect(element.getAttribute('data-intent')).toBe('positive');
      expect(element.getAttribute('data-emphasis')).toBe('high');
      expect(element.getAttribute('data-selection-intent')).toBe('destructive');
      expect(element.getAttribute('data-selection-emphasis')).toBe('high');
    }
    expect(selected(layout)).toEqual(initialSelection);
    expect(selected(otherLayout)).toEqual(otherSelection);
    expect(control(otherLayout, 'Button intent').value).toBe('original');
    expect(control(otherLayout, 'Emphasis').value).toBe('low');
    expect(control(otherLayout, 'Selection intent').value).toBe('same');
    expect(selectionControl(otherLayout).value).toBe(otherSelectionEmphasis);

    changeControl(layout, 'Button intent', 'original');
    changeControl(layout, 'Selection intent', 'same');
    expect(button(layout, 'Record').getAttribute('data-intent')).toBe('neutral');
    expect(button(layout, 'Share').getAttribute('data-intent')).toBe('positive');
    expect(button(layout, 'Leave').getAttribute('data-intent')).toBe('destructive');
    for (const label of ['Record', 'Share', 'Leave']) {
      expect(button(layout, label).getAttribute('data-selection-intent')).toBe(
        button(layout, label).getAttribute('data-intent')
      );
    }
    expect(selected(layout)).toEqual(initialSelection);
  });

  it('preserves requested intents and selected options while a preset lacks their recipes', () => {
    render();
    changeControl('stacked', 'Button intent', 'positive');
    changeControl('stacked', 'Selection intent', 'destructive');
    act(() => button('stacked', 'Record').click());
    act(() =>
      root?.render(
        example({
          classesMap: {
            ...normalElements,
            ...stackedElements,
            e1: {
              ...normalElements.e1,
              c: { s: { primary: { m: 'primary' }, neutral: { m: 'neutral' } } }
            }
          }
        })
      )
    );
    expect(control('stacked', 'Button intent').value).toBe('neutral');
    expect(control('stacked', 'Selection intent').value).toBe('same');
    expect(button('stacked', 'Record').getAttribute('data-intent')).toBe('neutral');
    expect(button('stacked', 'Record').getAttribute('data-selection-intent')).toBe('neutral');
    expect(selected('stacked')).toEqual(['Record', 'Raise']);
    expect(selected('icon')).toEqual(['React', 'Leave']);
    act(() => root?.render(example()));
    expect(control('stacked', 'Button intent').value).toBe('positive');
    expect(control('stacked', 'Selection intent').value).toBe('destructive');
    expect(button('stacked', 'Record').getAttribute('data-intent')).toBe('positive');
    expect(button('stacked', 'Record').getAttribute('data-selection-intent')).toBe('destructive');
    expect(selected('stacked')).toEqual(['Record', 'Raise']);
    expect(selected('icon')).toEqual(['React', 'Leave']);
  });

  it('preserves normal selection when the presentation Select is unavailable', () => {
    render(false);
    expect(container?.querySelector('select')).toBeNull();
    act(() => button('icon', 'Record').click());
    expect(selected('icon')).toEqual(['Record', 'Leave']);
    expect(selected('stacked')).toEqual(['Share', 'Raise']);
    expect(button('icon', 'Record').getAttribute('data-selection-emphasis')).toBe('lowest');
    expect(button('icon', 'Record').getAttribute('data-control-state')).toBe('true');
  });

  it('suspends the chosen presentation while its control is unavailable without resetting either selection', () => {
    render();
    changeSelectionEmphasis('stacked', 'high');
    changeSelectionEmphasis('icon', 'low');
    act(() => button('stacked', 'Record').click());
    act(() => root?.render(example({ selectionControlAvailable: false })));
    expect(container?.querySelector('select')).toBeNull();
    expect(selected('stacked')).toEqual(['Record', 'Raise']);
    expect(selected('icon')).toEqual(['React', 'Leave']);
    expect(button('stacked', 'Record').getAttribute('data-selection-emphasis')).toBe('lowest');
    expect(button('icon', 'Leave').getAttribute('data-selection-emphasis')).toBe('lowest');
    expect(button('stacked', 'Record').getAttribute('data-control-state')).toBe('true');
    act(() => root?.render(example()));
    expect(selectionControl('stacked').value).toBe('high');
    expect(selectionControl('icon').value).toBe('low');
    expect(selected('stacked')).toEqual(['Record', 'Raise']);
    expect(selected('icon')).toEqual(['React', 'Leave']);
    expect(button('stacked', 'Record').getAttribute('data-selection-emphasis')).toBe('high');
    expect(button('icon', 'Leave').getAttribute('data-selection-emphasis')).toBe('low');
  });

  it('shares mapped artwork but gives the icon-only bar accessible names instead of visible labels', () => {
    render();
    const stacked = bar('stacked').querySelectorAll('button');
    const icons = bar('icon').querySelectorAll('button');
    expect(stacked).toHaveLength(11);
    expect(icons).toHaveLength(11);
    expect(stacked[2].textContent).toBe('Share');
    expect(icons[2].getAttribute('aria-label')).toBe('Share');
    for (const layout of ['stacked', 'icon'] as const) {
      expect(button(layout, 'Share').getAttribute('data-intent')).toBe('positive');
      expect(button(layout, 'Leave').getAttribute('data-intent')).toBe('destructive');
    }
    for (let index = 0; index < stacked.length; index++) {
      const label = stacked[index].textContent;
      expect(icons[index].getAttribute('aria-label')).toBe(label);
      expect(icons[index].getAttribute('title')).toBe(label);
      expect(icons[index].querySelector('[data-button-part="label"]')).toBeNull();
      expect(icons[index].textContent).toBe('');
      expect(icons[index].querySelector('svg')?.getAttribute('data-icon')).toBe(
        stacked[index].querySelector('svg')?.getAttribute('data-icon')
      );
      expect(stacked[index].getAttribute('data-radius')).toBe('rounded');
      expect(icons[index].hasAttribute('data-radius')).toBe(false);
      expect(icons[index].getAttribute('data-layout')).toBe('inline');
    }
    expect(selected('stacked')).toEqual(['Share', 'Raise']);
    expect(selected('icon')).toEqual(['React', 'Leave']);
    expect(container?.querySelector('[role="status"]')).toBeNull();
  });

  it('toggles stacked options with FIFO replacement without changing the icon-only selection', () => {
    render();
    act(() => button('stacked', 'Record').click());
    expect(selected('stacked')).toEqual(['Record', 'Raise']);
    expect(button('stacked', 'Share').getAttribute('aria-pressed')).toBe('false');
    expect(button('stacked', 'Raise').getAttribute('aria-pressed')).toBe('true');
    changeSelectionEmphasis('stacked', 'high');
    act(() => button('stacked', 'Chat').click());
    expect(selected('stacked')).toEqual(['Record', 'Chat']);
    act(() => button('stacked', 'People').click());
    expect(selected('stacked')).toEqual(['Chat', 'People']);
    act(() => button('stacked', 'Chat').click());
    expect(selected('stacked')).toEqual(['People']);
    act(() => button('stacked', 'Chat').click());
    expect(selected('stacked')).toEqual(['Chat', 'People']);
    expect(selected('icon')).toEqual(['React', 'Leave']);
  });

  it('keeps the icon-only FIFO independent across clicks batched in one update', () => {
    render();
    act(() => {
      button('icon', 'Record').click();
      button('icon', 'Chat').click();
      button('icon', 'Record').click();
      button('icon', 'People').click();
    });
    expect(selected('icon')).toEqual(['Chat', 'People']);
    expect(selected('stacked')).toEqual(['Share', 'Raise']);
    act(() => {
      button('icon', 'Raise').click();
      button('icon', 'React').click();
      button('icon', 'View').click();
    });
    expect(selected('icon')).toEqual(['React', 'View']);
    expect(selected('stacked')).toEqual(['Share', 'Raise']);
  });

  it('renders icon-only Buttons without stacked anatomy and preserves selection while stacked is unavailable', () => {
    render();
    changeSelectionEmphasis('stacked', 'high');
    changeSelectionEmphasis('icon', 'lowest');
    act(() => button('stacked', 'Record').click());
    act(() => root?.render(example({ classesMap: normalElements, stackedSizes: [] })));
    expect(bar('stacked').querySelector('button')).toBeNull();
    expect(bar('stacked').querySelector('select')).toBeNull();
    expect(selectionControl('icon').value).toBe('lowest');
    expect(bar('icon').querySelectorAll('button')).toHaveLength(11);
    act(() => button('icon', 'Chat').click());
    act(() => root?.render(example()));
    expect(selected('stacked')).toEqual(['Record', 'Raise']);
    expect(selected('icon')).toEqual(['Chat', 'Leave']);
    expect(selectionControl('stacked').value).toBe('high');
    expect(selectionControl('icon').value).toBe('lowest');
  });

  it('requires normal icon and preset-default radius recipes independently from stacked', () => {
    render();
    act(() => root?.render(example({ classesMap: { ...stackedElements, e1: normalElements.e1 } })));
    expect(bar('icon').querySelector('button')).toBeNull();
    expect(bar('stacked').querySelectorAll('button')).toHaveLength(11);
    artifact.globalRadius = 'square';
    act(() =>
      root?.render(
        example({
          classesMap: {
            ...stackedElements,
            e1: { s: { all: 'button' }, rr: { all: 'rounded' } },
            e3: normalElements.e3
          }
        })
      )
    );
    expect(bar('icon').querySelector('button')).toBeNull();
    expect(bar('stacked').querySelectorAll('button')).toHaveLength(11);
    act(() =>
      root?.render(
        example({
          classesMap: {
            ...stackedElements,
            e1: { s: { all: 'button' }, rs: { all: 'square' } },
            e3: normalElements.e3
          }
        })
      )
    );
    expect(bar('icon').querySelectorAll('button')).toHaveLength(11);
    expect(button('icon', 'Raise').hasAttribute('data-radius')).toBe(false);
  });

  it.each([
    ['rounded', 'rr'],
    ['pill', 'rp'],
    ['square', 'rs']
  ] as const)('uses the preset %s recipe without an icon-only radius override', (globalRadius, bucket) => {
    render();
    artifact.globalRadius = globalRadius;
    act(() =>
      root?.render(
        example({
          radius: 'pill',
          classesMap: {
            ...stackedElements,
            e1: { s: { all: 'button' }, [bucket]: { all: 'preset-radius' } },
            e3: normalElements.e3
          }
        })
      )
    );
    expect(bar('icon').querySelectorAll('button')).toHaveLength(11);
    expect(button('icon', 'Raise').hasAttribute('data-radius')).toBe(false);
    expect(button('stacked', 'Raise').dataset.radius).toBe('rounded');
    expect(selected('icon')).toEqual(['React', 'Leave']);
  });

  it('checks icon-only availability at the effective supported size', () => {
    render();
    act(() =>
      root?.render(
        example({
          classesMap: {
            e1: { s: { 'md:1': 'button' }, rr: { 'md:1': 'rounded' } },
            e3: { s: { 'md:1': 'icon' } }
          },
          scale: 's:lg:3',
          stackedSizes: []
        })
      )
    );
    expect(bar('icon').querySelectorAll('button')).toHaveLength(11);
    expect(bar('stacked').querySelector('button')).toBeNull();
  });
});
