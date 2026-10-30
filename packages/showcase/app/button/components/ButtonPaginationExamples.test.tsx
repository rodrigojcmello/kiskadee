/** @vitest-environment jsdom */
import type { RadiusMode } from '@kiskadee/core';
import type { HTMLAttributes, ReactNode } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ButtonPaginationExamples } from './ButtonPaginationExamples';

const artifact = vi.hoisted(() => ({
  intents: ['primary', 'neutral', 'destructive', 'positive', 'support']
}));

vi.mock('@kiskadee/react-components/button', async () => {
  const { createElement } = await import('react');
  return {
    Button: Object.assign(
      ({
        toggle,
        controlState,
        intent,
        emphasis,
        selectionIntent,
        selectionEmphasis,
        radius,
        size: _size,
        ...props
      }: HTMLAttributes<HTMLButtonElement> & {
        toggle?: boolean;
        controlState?: boolean;
        intent?: string;
        emphasis?: string;
        selectionIntent?: string;
        selectionEmphasis?: string;
        radius?: string;
        size?: string;
      }) =>
        createElement('button', {
          ...props,
          'aria-pressed': toggle ? controlState === true : undefined,
          'data-selected': controlState === true,
          'data-intent': intent,
          'data-emphasis': emphasis,
          'data-selection-intent': selectionIntent,
          'data-selection-emphasis': selectionEmphasis,
          'data-radius': radius
        }),
      {
        Icon: (props: HTMLAttributes<HTMLElement>) => createElement('span', props),
        Label: (props: HTMLAttributes<HTMLElement>) => createElement('span', props),
        Group: ({
          intent,
          emphasis,
          radius,
          size: _size,
          ...props
        }: HTMLAttributes<HTMLDivElement> & {
          intent?: string;
          emphasis?: string;
          radius?: string;
          size?: string;
        }) =>
          createElement('div', {
            ...props,
            'data-pagination-group': true,
            'data-intent': intent,
            'data-emphasis': emphasis,
            'data-radius': radius
          })
      }
    ),
    useButtonArtifactConfig: () => ({
      buttonClassesMap: {
        e1: {
          c: {
            s: Object.fromEntries(artifact.intents.map((intent) => [intent, { m: 'published' }]))
          }
        }
      }
    })
  };
});

vi.mock('@kiskadee/react-components/icon', () => ({
  FamilyResolvedIcon: ({ name }: { name: string }) => <svg data-icon={name} aria-hidden="true" />
}));

vi.mock('@kiskadee/react-components/container', () => ({
  Container: ({ children }: { children: ReactNode }) => <div>{children}</div>
}));

vi.mock('@kiskadee/react-components/layout', () => ({
  Layout: ({ children }: { children: ReactNode }) => <div>{children}</div>
}));

vi.mock('@kiskadee/react-components/separator', () => ({ Separator: () => <hr /> }));

vi.mock('@kiskadee/react-components/text', async () => {
  const { createElement } = await import('react');
  return {
    Text: ({
      as = 'span',
      profile: _profile,
      emphasis: _emphasis,
      ...props
    }: HTMLAttributes<HTMLElement> & { as?: string; profile?: string; emphasis?: string }) =>
      createElement(as, props)
  };
});

vi.mock('@/components/ShowcaseControls', () => ({
  ShowcaseContentSelectControl: ({
    label,
    value,
    onValueChange,
    options
  }: {
    label: string;
    value: string;
    onValueChange: (value: string) => void;
    options: ReadonlyArray<{ value: string; label: string }>;
  }) => (
    <label>
      {label}
      <select value={value} onChange={(event) => onValueChange(event.currentTarget.value)}>
        {options.map((option) => (
          <option value={option.value} key={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}));

vi.mock('@/components/ShowcaseBackground/ShowcaseExampleCard', () => ({
  ShowcaseExampleCard: ({ children }: { children: ReactNode }) => (
    <div data-example-card>{children}</div>
  )
}));

vi.mock('@/components/ShowcaseDisplayPreferences', () => ({
  useShowcaseDisplayPreferences: () => ({ showDescriptions: true })
}));

vi.mock('@/utils/showcase-text-profiles', () => ({
  useShowcaseTextProfiles: () => ({
    subsectionTitle: 'test-heading',
    bodyStrong: 'test-subheading',
    body: 'test-body',
    caption: 'test-caption'
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
  artifact.intents = ['primary', 'neutral', 'destructive', 'positive', 'support'];
});

function render(radius: RadiusMode = 'rounded') {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  act(() => root?.render(example(radius)));
}

function example(radius: RadiusMode = 'rounded') {
  return <ButtonPaginationExamples radius={radius} scale="s:md:1" surfaceContext="onSubtle" />;
}

function nav(id: string) {
  const result = container?.querySelector(`[data-button-pagination-example="${id}"]`);
  expect(result).not.toBeNull();
  return result as HTMLElement;
}

function button(id: string, label: string) {
  const result = nav(id).querySelector(`button[aria-label="${label}"]`);
  expect(result).not.toBeNull();
  return result as HTMLButtonElement;
}

function current(id: string) {
  const selected = nav(id).querySelectorAll('button[aria-current="page"]');
  expect(selected).toHaveLength(1);
  expect(selected[0].getAttribute('data-selected')).toBe('true');
  return selected[0].textContent;
}

function control(label: string) {
  const result = Array.from(container?.querySelectorAll('label') ?? [])
    .find((element) => element.firstChild?.textContent === label)
    ?.querySelector('select');
  expect(result).toBeDefined();
  return result as HTMLSelectElement;
}

function changeControl(label: string, value: string) {
  act(() => {
    const element = control(label);
    element.value = value;
    element.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

describe('Button pagination compositions', () => {
  it('starts four independent current pages with one shared set of visual controls', () => {
    render();
    const card = container?.querySelector('[data-example-card]');
    expect(card?.contains(container?.querySelector('#button-pagination-title') ?? null)).toBe(
      false
    );
    expect(container?.querySelectorAll('select')).toHaveLength(5);
    expect(control('Button intent').value).toBe('neutral');
    expect(control('Emphasis').value).toBe('low');
    expect(control('Selection intent').value).toBe('primary');
    expect(control('Selection emphasis').value).toBe('lowest');
    expect(control('Radius').value).toBe('rounded');
    for (const [id, expected] of [
      ['numbered', '3'],
      ['connected', '3'],
      ['window', '6'],
      ['compact', '3']
    ]) {
      expect(current(id)).toBe(expected);
      expect(nav(id).querySelector('[aria-pressed]')).toBeNull();
      expect(nav(id).getAttribute('aria-labelledby')).toBeTruthy();
    }
    expect(nav('connected').querySelector('[data-pagination-group]')).not.toBeNull();
    expect(nav('numbered').querySelector('[data-pagination-group]')).toBeNull();
    expect(nav('compact').querySelectorAll('button')).toHaveLength(3);
  });

  it.each([
    'numbered',
    'connected'
  ])('changes the %s page without deselecting the current page or touching other examples', (id) => {
    render();
    act(() => button(id, 'Page 3').click());
    expect(current(id)).toBe('3');
    act(() => button(id, 'Page 1').click());
    expect(current(id)).toBe('1');
    expect(button(id, 'Previous page').disabled).toBe(true);
    act(() => button(id, 'Previous page').click());
    expect(current(id)).toBe('1');
    act(() => button(id, 'Next page').click());
    expect(current(id)).toBe('2');
    act(() => button(id, 'Page 5').click());
    expect(button(id, 'Next page').disabled).toBe(true);
    act(() => button(id, 'Previous page').click());
    expect(current(id)).toBe('4');
    const other = id === 'numbered' ? 'connected' : 'numbered';
    expect(current(other)).toBe('3');
    expect(current('window')).toBe('6');
    expect(current('compact')).toBe('3');
  });

  it('moves the long page window and its gaps while preserving endpoint navigation', () => {
    render();
    expect(nav('window').textContent).toContain('\u2026');
    expect(button('window', 'Page 5')).toBeTruthy();
    expect(button('window', 'Page 7')).toBeTruthy();
    act(() => button('window', 'Page 20').click());
    expect(current('window')).toBe('20');
    expect(button('window', 'Next page').disabled).toBe(true);
    expect(nav('window').querySelector('button[aria-label="Page 6"]')).toBeNull();
    act(() => button('window', 'Previous page').click());
    expect(current('window')).toBe('19');
    act(() => button('window', 'Page 1').click());
    expect(current('window')).toBe('1');
    expect(button('window', 'Previous page').disabled).toBe(true);
    expect(button('window', 'Page 2')).toBeTruthy();
  });

  it('keeps compact navigation within its bounds and announces the changing page count', () => {
    render();
    for (let index = 0; index < 4; index++) act(() => button('compact', 'Previous page').click());
    expect(current('compact')).toBe('1');
    expect(button('compact', 'Previous page').disabled).toBe(true);
    for (let index = 0; index < 15; index++) act(() => button('compact', 'Next page').click());
    expect(current('compact')).toBe('12');
    expect(button('compact', 'Next page').disabled).toBe(true);
    expect(container?.querySelector('[aria-live="polite"]')?.textContent).toBe('Page 12 of 12');
    expect(current('numbered')).toBe('3');
  });

  it('updates all four visual axes without resetting current pages', () => {
    render();
    act(() => button('numbered', 'Page 4').click());
    act(() => button('connected', 'Page 2').click());
    changeControl('Button intent', 'positive');
    changeControl('Emphasis', 'high');
    changeControl('Selection intent', 'destructive');
    changeControl('Selection emphasis', 'high');
    for (const element of container?.querySelectorAll('button') ?? []) {
      expect(element.getAttribute('data-intent')).toBe('positive');
      expect(element.getAttribute('data-emphasis')).toBe('high');
      expect(element.getAttribute('data-selection-intent')).toBe('destructive');
      expect(element.getAttribute('data-selection-emphasis')).toBe('high');
    }
    const group = nav('connected').querySelector('[data-pagination-group]');
    expect(group?.getAttribute('data-intent')).toBe('positive');
    expect(group?.getAttribute('data-emphasis')).toBe('high');
    changeControl('Selection intent', 'same');
    expect(button('numbered', 'Page 4').getAttribute('data-selection-intent')).toBe('positive');
    expect(current('numbered')).toBe('4');
    expect(current('connected')).toBe('2');
    expect(current('window')).toBe('6');
    expect(current('compact')).toBe('3');
  });

  it('inherits the current radius until locally overridden without resetting pages or appearance', () => {
    render('pill');
    expect(control('Radius').value).toBe('pill');
    expect(Array.from(control('Radius').options, (option) => option.value)).toEqual([
      'rounded',
      'pill',
      'square'
    ]);
    for (const element of container?.querySelectorAll('button, [data-pagination-group]') ?? []) {
      expect(element.getAttribute('data-radius')).toBe('pill');
    }
    act(() => root?.render(example('square')));
    expect(control('Radius').value).toBe('square');

    act(() => button('numbered', 'Page 4').click());
    act(() => button('connected', 'Page 2').click());
    act(() => button('window', 'Page 7').click());
    act(() => button('compact', 'Next page').click());
    changeControl('Button intent', 'positive');
    changeControl('Emphasis', 'high');
    changeControl('Selection intent', 'destructive');
    changeControl('Selection emphasis', 'high');

    for (const radius of ['rounded', 'pill', 'square'] as const) {
      changeControl('Radius', radius);
      for (const element of container?.querySelectorAll('button, [data-pagination-group]') ?? []) {
        expect(element.getAttribute('data-radius')).toBe(radius);
      }
      expect(current('numbered')).toBe('4');
      expect(current('connected')).toBe('2');
      expect(current('window')).toBe('7');
      expect(current('compact')).toBe('4');
      expect(control('Button intent').value).toBe('positive');
      expect(control('Emphasis').value).toBe('high');
      expect(control('Selection intent').value).toBe('destructive');
      expect(control('Selection emphasis').value).toBe('high');
    }

    act(() => root?.render(example('rounded')));
    expect(control('Radius').value).toBe('square');
    for (const element of container?.querySelectorAll('button, [data-pagination-group]') ?? []) {
      expect(element.getAttribute('data-radius')).toBe('square');
    }
    expect(current('numbered')).toBe('4');
    expect(current('connected')).toBe('2');
    expect(current('window')).toBe('7');
    expect(current('compact')).toBe('4');
  });

  it('preserves pages when preset intent coverage changes and restores requested choices', () => {
    render();
    act(() => button('window', 'Page 7').click());
    changeControl('Button intent', 'support');
    changeControl('Selection intent', 'support');
    artifact.intents = ['primary', 'neutral', 'destructive', 'positive'];
    act(() => root?.render(example()));
    expect(control('Button intent').value).toBe('neutral');
    expect(control('Selection intent').value).toBe('same');
    expect(current('window')).toBe('7');
    artifact.intents.push('support');
    act(() => root?.render(example()));
    expect(control('Button intent').value).toBe('support');
    expect(control('Selection intent').value).toBe('support');
    expect(current('window')).toBe('7');
  });
});
