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
it.each([
  'metadata',
  'classMap'
] as const)('renders static resources after a failed %s loader at the same provider key', async (failedResource) => {
  const failed: KiskadeeContextValue = {
    ...context,
    designSystem: `boundary-failed-then-static-${failedResource}`,
    ...(failedResource === 'metadata'
      ? { loadComponentArtifact: vi.fn().mockRejectedValue(new Error('metadata offline')) }
      : { loadComponentClassMap: vi.fn().mockRejectedValue(new Error('map offline')) })
  };
  const tree = (value: KiskadeeContextValue) => (
    <KiskadeeContext.Provider value={value}>
      <ComponentResourceBoundary component="button">
        <button type="button">Static ready</button>
      </ComponentResourceBoundary>
    </KiskadeeContext.Provider>
  );
  const view = render(tree(failed));
  await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
  if (failedResource === 'classMap') {
    view.rerender(
      tree({
        ...failed,
        classesMap: { button: { e1: { s: { 'md:1': 'static-medium' } } } }
      })
    );
    expect(screen.getByRole('alert')).toBeTruthy();
  }
  view.unmount();
  const supplied: KiskadeeContextValue = {
    ...context,
    designSystem: failed.designSystem,
    componentArtifacts: { button: { formatVersion: 3, component: 'button' } },
    classesMap: { button: { e1: { s: { 'md:1': 'static-medium' } } } }
  };
  render(tree(supplied));
  expect(screen.queryByRole('alert')).toBeNull();
  expect(screen.getByRole('button', { name: 'Static ready' })).toBeTruthy();
});

it.each([
  'loaded',
  'preloaded'
] as const)('blocks incompatible %s metadata at the resource boundary', async (source) => {
  const invalid = { formatVersion: 2, component: 'button' };
  const value: KiskadeeContextValue = {
    ...context,
    designSystem: `boundary-invalid-${source}`,
    ...(source === 'preloaded'
      ? {
          componentArtifacts: {
            button: invalid
          } as unknown as KiskadeeContextValue['componentArtifacts']
        }
      : {
          loadComponentArtifact: (async () =>
            invalid) as KiskadeeContextValue['loadComponentArtifact']
        })
  };
  const child = vi.fn(() => <button type="button">Must not render</button>);
  const Child = child;
  render(
    <KiskadeeContext.Provider value={value}>
      <ComponentResourceBoundary component="button">
        <Child />
      </ComponentResourceBoundary>
    </KiskadeeContext.Provider>
  );
  await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
  expect(child).not.toHaveBeenCalled();
});

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
      ({
        formatVersion: 3,
        component: 'button',
        classMap: { e1: { s: { 'md:1': 'medium' } } }
      }) as T
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
    ready({ formatVersion: 3, component: 'button', sizeSupport: { sizes: ['md:1'] } });
  });
  await waitFor(() => expect(screen.getByRole('button', { name: 'Ready' })).toBeTruthy());
  expect(loadComponentArtifact).toHaveBeenCalledTimes(1);
});
it('renders SSR from the supplied component handoff without an aggregate fetch', () => {
  const value = {
    ...context,
    componentArtifacts: { button: { formatVersion: 3, component: 'button' } },
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
