/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, expect, it } from 'vitest';
import { KiskadeeContext } from '../../shared/contexts/KiskadeeContext.tsx';
import { Button } from './Button.tsx';

afterEach(cleanup);

it('exposes both native toggle states and preserves explicit ARIA overrides', () => {
  const view = render(
    <Button toggle controlState={false}>
      Toggle
    </Button>,
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <KiskadeeContext.Provider
          value={{
            designSystem: 'toggle',
            segment: 'default',
            theme: 'light',
            classesMap: {},
            setTheme() {},
            setSegment() {},
            setDesignSystem() {}
          }}
        >
          {children}
        </KiskadeeContext.Provider>
      )
    }
  );
  expect(screen.getByRole('button').getAttribute('aria-pressed')).toBe('false');
  view.rerender(
    <Button toggle controlState={true}>
      Toggle
    </Button>
  );
  expect(screen.getByRole('button').getAttribute('aria-pressed')).toBe('true');
  view.rerender(
    <Button toggle controlState={false} aria-pressed="mixed">
      Toggle
    </Button>
  );
  expect(screen.getByRole('button').getAttribute('aria-pressed')).toBe('mixed');
  view.rerender(<Button>Action</Button>);
  expect(screen.getByRole('button').hasAttribute('aria-pressed')).toBe(false);
});
