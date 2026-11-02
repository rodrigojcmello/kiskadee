/** @vitest-environment jsdom */
import type { ComponentResourceArtifact, Manifest } from '@kiskadee/web-builder/types';
import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook } from '@/test-utils/react';
import { useButtonColorVariantMetadata } from './use-button-color-variants';

const fixture = vi.hoisted(() => ({
  designSystem: 'first',
  loadJson: vi.fn(),
  loadMetadata: vi.fn()
}));
vi.mock('@kiskadee/react-components/resources', () => ({
  useKiskadee: () => ({ designSystem: fixture.designSystem })
}));
vi.mock('@/utils/build-artifacts.client', () => ({ loadJsonFromBuild: fixture.loadJson }));
vi.mock('@/utils/component-resources.client', () => ({
  loadComponentMetadata: fixture.loadMetadata
}));
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
  fixture.designSystem = 'first';
});

it('waits for the new preset manifest before discovering its metadata', async () => {
  const first = { formatVersion: 3, key: 'first', revision: 'first-revision' } as Manifest;
  const second = { formatVersion: 3, key: 'second', revision: 'second-revision' } as Manifest;
  let resolveManifest!: (value: Manifest) => void;
  fixture.loadJson.mockResolvedValueOnce(first).mockImplementationOnce(
    () =>
      new Promise<Manifest>((resolve) => {
        resolveManifest = resolve;
      })
  );
  const firstMetadata = { component: 'button' } as ComponentResourceArtifact;
  const secondMetadata = { component: 'button' } as ComponentResourceArtifact;
  fixture.loadMetadata.mockResolvedValueOnce(firstMetadata).mockResolvedValue(secondMetadata);
  const view = renderHook(() => useButtonColorVariantMetadata(), { initialProps: undefined });
  await vi.waitFor(() => expect(view.result.current).toBe(firstMetadata));
  fixture.designSystem = 'second';
  view.rerender(undefined);
  expect(view.result.current).toBeUndefined();
  expect(fixture.loadMetadata).toHaveBeenCalledTimes(1);
  await act(async () => resolveManifest(second));
  await vi.waitFor(() => expect(view.result.current).toBe(secondMetadata));
  expect(fixture.loadMetadata).toHaveBeenLastCalledWith('second', second, 'button');
});
