/** @vitest-environment jsdom */
import { act, createContext, createElement, useContext } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';

let root: Root | undefined;
let container: HTMLDivElement;
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

import { ChromaticForegroundCardContent } from './TypographyPage';

const surface = createContext('onSubtle');
const fixture = vi.hoisted(() => ({ theme: 'light' }));
vi.mock('@kiskadee/react-components/resources', () => ({
  SurfaceContextProvider: ({ children }: any) => children,
  useSurfaceContext: () => useContext(surface),
  useKiskadee: () => ({ segment: 'default', theme: fixture.theme }),
  useComponentMetadata: () => ({
    capabilities: {
      colorVariants: {
        alternative: {
          'default.light': { onVivid: { blue: ['high', 'medium', 'low', 'lowest'], red: ['high'] } }
        }
      }
    }
  }),
  useFontFamilyStatus: () => ({})
}));
vi.mock('@kiskadee/react-components/text', () => ({
  Text: ({ as = 'span', children, foreground, ...props }: any) =>
    createElement(
      as,
      { 'data-foreground': foreground, 'data-text-foreground': props['data-text-foreground'] },
      children
    )
}));
vi.mock('@kiskadee/react-components/switch', () => ({
  Switch: ({ label, controlState, disabled, onControlStateChange }: any) => (
    <input
      type="checkbox"
      role="switch"
      aria-label={label}
      aria-checked={controlState}
      checked={controlState}
      disabled={disabled}
      onChange={(e) => onControlStateChange(e.target.checked)}
    />
  )
}));
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  container?.remove();
  fixture.theme = 'light';
});
it('keeps surface switches independent and identifies rows without an authored alternative', () => {
  const tree = () => (
    <>
      {(['onSubtle', 'onVivid'] as const).map((context) => (
        <surface.Provider key={context} value={context}>
          <ChromaticForegroundCardContent
            surfaceLabel={context === 'onSubtle' ? 'subtle' : 'vivid'}
            standardForegrounds={['blue', 'red', 'green']}
            deepForegrounds={['blue-deep']}
            textProfiles={{} as any}
          />
        </surface.Provider>
      ))}
    </>
  );
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  const view = { container, rerender: (node: React.ReactNode) => act(() => root!.render(node)) };
  view.rerender(tree());
  const [subtle, vivid] = Array.from(
    container.querySelectorAll<HTMLInputElement>('[role="switch"]')
  );
  expect(subtle!.disabled).toBe(true);
  expect(vivid!.checked).toBe(false);
  act(() => vivid!.click());
  expect(view.container.querySelectorAll('[data-text-foreground="blue-alt"]')).toHaveLength(1);
  expect(view.container.querySelectorAll('[data-text-foreground="blue"]')).toHaveLength(1);
  expect(
    Array.from(container.querySelectorAll('span')).filter((node) =>
      node.textContent?.includes('Alt unavailable')
    )
  ).toHaveLength(2);
  fixture.theme = 'dark';
  view.rerender(tree());
  expect(vivid!.disabled).toBe(true);
  expect(vivid!.checked).toBe(false);
  fixture.theme = 'light';
  view.rerender(tree());
  expect(vivid!.checked).toBe(true);
});
