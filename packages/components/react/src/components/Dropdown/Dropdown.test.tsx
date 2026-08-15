/** @vitest-environment jsdom */

import { cleanup, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  KiskadeeContext,
  type KiskadeeContextValue
} from '../../shared/contexts/KiskadeeContext.tsx';
import { Dropdown } from './Dropdown.tsx';

const context: KiskadeeContextValue = {
  classesMap: {
    dropdown: {
      e1: { d: 'surface' },
      e2: {
        d: 'item-geometry',
        s: { all: 'item-size' },
        c: {
          s: {
            neutral: { m: 'item-neutral' },
            destructive: { m: 'item-destructive' }
          }
        }
      },
      e3: { s: { all: 'icon-size' } },
      e4: {},
      e5: {},
      e6: {},
      e7: {}
    }
  },
  designSystem: 'test',
  segment: 'default',
  theme: 'light',
  setDesignSystem: () => {},
  setSegment: () => {},
  setTheme: () => {}
};

function renderDropdown(children: ReactNode) {
  return render(
    <KiskadeeContext.Provider value={context}>
      <Dropdown.VisualProvider>
        <Dropdown.Surface>
          <Dropdown.Items>{children}</Dropdown.Items>
        </Dropdown.Surface>
      </Dropdown.VisualProvider>
    </KiskadeeContext.Provider>
  );
}

afterEach(cleanup);

describe('styled Dropdown', () => {
  it('resolves one intent palette without retaining neutral color classes', () => {
    const result = renderDropdown(
      <Dropdown.Item intent="destructive" data-testid="destructive-item">
        <Dropdown.Label>Delete</Dropdown.Label>
      </Dropdown.Item>
    );
    const item = result.getByTestId('destructive-item');

    expect(item.className).toContain('item-geometry');
    expect(item.className).toContain('item-size');
    expect(item.className).toContain('item-destructive');
    expect(item.className).not.toContain('item-neutral');
  });

  it('renders no placeholder icon while keeping one collection scope for CSS alignment', () => {
    const result = renderDropdown(
      <>
        <Dropdown.Item>
          <Dropdown.Icon>
            <svg data-testid="glyph" />
          </Dropdown.Icon>
          <Dropdown.Label>With icon</Dropdown.Label>
        </Dropdown.Item>
        <Dropdown.Item data-testid="without-icon">
          <Dropdown.Label>Without icon</Dropdown.Label>
        </Dropdown.Item>
      </>
    );

    expect(result.container.querySelectorAll('.k-ddn-x1')).toHaveLength(1);
    expect(result.container.querySelectorAll('.k-ddn-e3')).toHaveLength(1);
    expect(result.getByTestId('without-icon').querySelector('.k-ddn-e3')).toBeNull();
  });
});
