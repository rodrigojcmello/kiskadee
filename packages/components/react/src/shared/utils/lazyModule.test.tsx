/** @vitest-environment jsdom */

import { act } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { expect, it, vi } from 'vitest';
import { createLazyModuleCache, useLazyModule } from './lazyModule.ts';

it('adopts a warmed lazy module only after hydration', async () => {
  const importModule = vi.fn(async () => ({ label: 'Loaded' }));
  const cache = createLazyModuleCache(importModule);

  function Consumer() {
    const module = useLazyModule(cache, true);
    return <span>{module?.label ?? 'Fallback'}</span>;
  }

  const tree = <Consumer />;
  const serverHtml = renderToString(tree);
  expect(serverHtml).toContain('Fallback');

  await cache.load();

  const recoverableErrors: unknown[] = [];
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  const container = document.createElement('div');
  container.innerHTML = serverHtml;
  document.body.append(container);

  let root: ReturnType<typeof hydrateRoot> | undefined;
  await act(async () => {
    root = hydrateRoot(container, tree, {
      onRecoverableError: (error) => recoverableErrors.push(error)
    });
    await Promise.resolve();
  });

  expect(recoverableErrors).toEqual([]);
  expect(consoleError.mock.calls.flat().join(' ')).not.toContain('Hydration failed');
  expect(container.textContent).toBe('Loaded');
  expect(importModule).toHaveBeenCalledTimes(1);

  await act(async () => root?.unmount());
  container.remove();
  consoleError.mockRestore();
});
