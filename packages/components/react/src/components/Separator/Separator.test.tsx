/** @vitest-environment jsdom */

import { cleanup, render } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  KiskadeeContext,
  type KiskadeeContextValue
} from '../../shared/contexts/KiskadeeContext.tsx';
import { Separator } from './Separator.tsx';

const context: KiskadeeContextValue = {
  classesMap: {
    separator: {
      e1: {
        d: 'separator-default',
        s: { all: 'separator-thickness' },
        c: { s: { neutral: { m: 'separator-color' } } }
      }
    }
  },
  designSystem: 'test',
  segment: 'default',
  theme: 'light',
  setDesignSystem: () => {},
  setSegment: () => {},
  setTheme: () => {}
};

afterEach(cleanup);

describe('Separator', () => {
  it('renders a horizontal semantic separator with preset and consumer classes', () => {
    const result = render(
      <KiskadeeContext.Provider value={context}>
        <Separator data-testid="separator" className="consumer" />
      </KiskadeeContext.Provider>
    );
    const separator = result.getByTestId('separator');

    expect(separator.tagName).toBe('HR');
    expect(result.getByRole('separator')).toBe(separator);
    expect(separator.getAttribute('aria-orientation')).toBe('horizontal');
    expect(separator.className).toContain('separator-default');
    expect(separator.className).toContain('separator-thickness');
    expect(separator.className).toContain('separator-color');
    expect(separator.className.split(' ')).toContain('k-sep');
    expect(separator.className.split(' ')).toContain('k-sep-e1');
    expect(separator.className).toContain('consumer');
  });

  it('publishes vertical orientation and forwards its native ref', () => {
    const ref = createRef<HTMLHRElement>();
    const result = render(
      <KiskadeeContext.Provider value={context}>
        <Separator ref={ref} orientation="vertical" />
      </KiskadeeContext.Provider>
    );

    expect(result.getByRole('separator').getAttribute('aria-orientation')).toBe('vertical');
    expect(ref.current).toBe(result.getByRole('separator'));
  });
});
