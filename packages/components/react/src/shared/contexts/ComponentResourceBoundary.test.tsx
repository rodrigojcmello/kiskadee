// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, expect, it, vi } from 'vitest';
import { ComponentResourceBoundary } from './ComponentResourceBoundary.tsx';
import { KiskadeeContext, type KiskadeeContextValue } from './KiskadeeContext.tsx';

const context: KiskadeeContextValue = {
  classesMap: {},
  designSystem: 'boundary-test',
  segment: 'default',
  theme: 'light',
  setDesignSystem() {},
  setSegment() {},
  setTheme() {}
};
afterEach(cleanup);
it('does not render a component before metadata and class maps are ready', async () => {
  let ready: (value: unknown) => void = () => {};
  const metadata = new Promise((resolve) => {
    ready = resolve;
  });
  const loadComponentArtifact = vi.fn(
    () => metadata
  ) as KiskadeeContextValue['loadComponentArtifact'];
  const value = {
    ...context,
    loadComponentArtifact,
    loadComponentClassMap: async <T,>() =>
      ({ component: 'button', classMap: { e1: { s: { 'md:1': 'medium' } } } }) as T
  };
  render(
    <KiskadeeContext.Provider value={value}>
      <ComponentResourceBoundary component="button">
        <button type="button">Ready</button>
      </ComponentResourceBoundary>
    </KiskadeeContext.Provider>
  );
  expect(screen.queryByRole('button')).toBeNull();
  await act(async () => {
    ready({ component: 'button', sizeSupport: { sizes: ['md:1'] } });
  });
  await waitFor(() => expect(screen.getByRole('button', { name: 'Ready' })).toBeTruthy());
  expect(loadComponentArtifact).toHaveBeenCalledTimes(1);
});
it('renders SSR from the supplied component handoff without an aggregate fetch', () => {
  const value = {
    ...context,
    componentArtifacts: { button: { component: 'button' } },
    classesMap: { button: { e1: { s: { 'md:1': 'medium' } } } }
  };
  expect(
    renderToString(
      <KiskadeeContext.Provider value={value}>
        <ComponentResourceBoundary component="button">
          <button type="button">Server ready</button>
        </ComponentResourceBoundary>
      </KiskadeeContext.Provider>
    )
  ).toContain('Server ready');
});
