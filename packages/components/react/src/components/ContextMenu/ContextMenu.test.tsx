/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  KiskadeeContext,
  type KiskadeeContextValue
} from '../../shared/contexts/KiskadeeContext.tsx';
import { ContextMenu } from './ContextMenu.tsx';

const context: KiskadeeContextValue = {
  classesMap: {
    dropdown: {
      e1: {},
      e2: {},
      e3: {},
      e4: {},
      e5: {},
      e6: {},
      e7: {},
      e8: {},
      e9: {},
      e10: {}
    }
  },
  designSystem: 'test',
  segment: 'default',
  theme: 'light',
  setDesignSystem: () => {},
  setSegment: () => {},
  setTheme: () => {}
};

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    }
  );
  vi.stubGlobal(
    'MutationObserver',
    class {
      observe() {}
      disconnect() {}
    }
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('ContextMenu', () => {
  it('keeps its trigger consumer-owned and reuses ButtonMenu content', async () => {
    const onContextMenu = vi.fn();
    const result = render(
      <KiskadeeContext.Provider value={context}>
        <ContextMenu.Root>
          <ContextMenu.Trigger>
            <section data-testid="area" aria-label="Marked area" onContextMenu={onContextMenu}>
              Marked area
            </section>
          </ContextMenu.Trigger>
          <ContextMenu.Content portalled={false}>
            <ContextMenu.Group>
              <ContextMenu.Item textValue="Copy">
                <ContextMenu.Label>Copy</ContextMenu.Label>
              </ContextMenu.Item>
            </ContextMenu.Group>
          </ContextMenu.Content>
        </ContextMenu.Root>
      </KiskadeeContext.Provider>
    );

    const area = result.getByTestId('area');
    expect(area.tagName).toBe('SECTION');
    expect(area.textContent).toContain('Marked area');
    fireEvent.contextMenu(area, { clientX: 32, clientY: 48 });

    expect(onContextMenu).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(result.getByRole('menu')).toBeTruthy());
    expect(result.getByRole('menuitem', { name: 'Copy' })).toBeTruthy();
  });
});
