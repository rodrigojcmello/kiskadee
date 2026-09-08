/** @vitest-environment jsdom */
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import {
  KiskadeeContext,
  type KiskadeeContextValue
} from '../../../shared/contexts/KiskadeeContext.tsx';
import { useCardArtifactConfig } from './useCardArtifactConfig.ts';

afterEach(cleanup);

function Probe() {
  const { options } = useCardArtifactConfig();
  return options.canonicalSurfaces ? (
    <article data-testid="surface" />
  ) : (
    <div data-testid="empty" />
  );
}

it('preserves surface identity while cold metadata loads and clears it for an absent artifact', async () => {
  const artifact = { component: 'card', options: { canonicalSurfaces: {} } };
  let resolveNext: (value: unknown) => void = () => {};
  const pending = new Promise<unknown>((resolve) => {
    resolveNext = resolve;
  });
  const context: KiskadeeContextValue = {
    designSystem: 'card-continuity-a',
    segment: 'default',
    theme: 'light',
    classesMap: {},
    setTheme() {},
    setSegment() {},
    setDesignSystem() {},
    loadComponentArtifact: async <T,>() => artifact as T
  };
  const tree = (value: KiskadeeContextValue) => (
    <KiskadeeContext.Provider value={value}>
      <Probe />
    </KiskadeeContext.Provider>
  );
  const view = render(tree(context));
  await waitFor(() => expect(screen.queryByTestId('surface')).not.toBeNull());
  const surface = screen.getByTestId('surface');
  view.rerender(
    tree({
      ...context,
      designSystem: 'card-continuity-b',
      loadComponentArtifact: async <T,>() => (await pending) as T
    })
  );
  expect(screen.getByTestId('surface')).toBe(surface);
  await act(async () => resolveNext(artifact));
  expect(screen.getByTestId('surface')).toBe(surface);
  view.rerender(
    tree({
      ...context,
      designSystem: 'card-continuity-absent',
      loadComponentArtifact: async () => undefined
    })
  );
  await waitFor(() => expect(screen.queryByTestId('surface')).toBeNull());
  expect(screen.queryByTestId('empty')).not.toBeNull();
});
