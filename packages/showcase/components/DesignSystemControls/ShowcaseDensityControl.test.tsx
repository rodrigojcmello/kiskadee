/** @vitest-environment jsdom */

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

let root: Root | undefined;
let container: HTMLDivElement;
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
function render(node: React.ReactNode) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  act(() => root!.render(node));
}
function cleanup() {
  act(() => root?.unmount());
  container?.remove();
}

import { createElement } from 'react';
import { afterEach, expect, it, vi } from 'vitest';

const fixture = vi.hoisted(() => ({
  events: [] as string[],
  map: undefined as undefined | { c?: string; r?: string; s?: string },
  override: undefined as string | undefined
}));
vi.mock('@/app/ShowcaseDensityContext', () => ({
  useShowcaseDensity: () => ({
    densityMap: fixture.map,
    densityOverride: fixture.override,
    activeDensity: 'compact',
    setDensityOverride: (value: string | undefined) => fixture.events.push(`set:${value}`)
  })
}));
vi.mock('@/utils/playWowTransition', () => ({
  playWowTransition: () => fixture.events.push('wow')
}));
vi.mock('@/k-components', () => ({
  Select: ({
    label,
    options,
    onValueChange
  }: {
    label: string;
    options: { label: string; value: string; disabled?: boolean }[];
    onValueChange: (value: string) => void;
  }) =>
    createElement(
      'select',
      {
        'aria-label': label,
        onChange: (e: React.ChangeEvent<HTMLSelectElement>) => onValueChange(e.target.value)
      },
      options.map((o) =>
        createElement('option', { key: o.value, value: o.value, disabled: o.disabled }, o.label)
      )
    )
}));

import { ShowcaseDensityControl } from './ShowcaseDensityControl';

afterEach(() => {
  cleanup();
  fixture.events = [];
  fixture.map = undefined;
  fixture.override = undefined;
});
it('keeps the control and all disabled options visible when the route has no map', () => {
  render(createElement(ShowcaseDensityControl));
  expect(container.querySelector('select')).toBeTruthy();
  const options = Array.from(container.querySelectorAll('option'));
  expect(options.map((o) => o.textContent)).toEqual(['Mobile', 'Tablet', 'Desktop']);
  expect(options.every((o) => o.disabled)).toBe(true);
});
it('starts wow before applying a manual density change', () => {
  fixture.map = { c: 'sm:1', r: 'md:1', s: 'lg:1' };
  render(createElement(ShowcaseDensityControl));
  act(() => {
    const select = container.querySelector('select')!;
    select.value = 'spacious';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
  expect(fixture.events).toEqual(['wow', 'set:spacious']);
});
it('starts wow before clearing the manual override', () => {
  fixture.map = { r: 'md:1' };
  fixture.override = 'regular';
  render(createElement(ShowcaseDensityControl));
  act(() => container.querySelector('button')!.click());
  expect(fixture.events).toEqual(['wow', 'set:undefined']);
});
