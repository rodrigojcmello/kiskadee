/** @vitest-environment jsdom */

import { cleanup, render, screen } from '@testing-library/react';
import { Fragment } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  KiskadeeContext,
  type KiskadeeContextValue
} from '../../shared/contexts/KiskadeeContext.tsx';
import { SurfaceContextProvider } from '../../shared/contexts/SurfaceContext.tsx';
import { Badge } from './Badge.tsx';

const context: KiskadeeContextValue = {
  classesMap: { badge: {} },
  designSystem: 'test',
  segment: 'default',
  theme: 'light',
  setDesignSystem: () => {},
  setSegment: () => {},
  setTheme: () => {}
};

afterEach(cleanup);

describe('Badge', () => {
  it('normalizes direct passive content and keeps compound slots non-interactive', () => {
    const result = render(
      <KiskadeeContext.Provider value={context}>
        <Badge data-testid="badge">
          Verified
          <Badge.Count>3</Badge.Count>
        </Badge>
      </KiskadeeContext.Provider>
    );

    expect(result.getByTestId('badge').tagName).toBe('SPAN');
    expect(screen.getByText('Verified').className).toContain('k-bdg-e2');
    expect(screen.getByText('3').className).toContain('k-bdg-e4');
    expect(result.queryByRole('button')).toBeNull();
  });

  it('normalizes direct content nested in transparent Fragments', () => {
    render(
      <KiskadeeContext.Provider value={context}>
        <Badge>
          <Fragment key="outer">
            <Fragment key="inner">Verified</Fragment>
          </Fragment>
        </Badge>
      </KiskadeeContext.Provider>
    );

    expect(screen.getByText('Verified').className).toContain('k-bdg-e2');
  });

  it('renders a content-free dot and consumes a nested surface context', () => {
    const result = render(
      <KiskadeeContext.Provider value={context}>
        <SurfaceContextProvider value="onVivid">
          <Badge.Dot data-testid="dot" aria-label="New notification" />
        </SurfaceContextProvider>
      </KiskadeeContext.Provider>
    );

    const dot = result.getByTestId('dot');
    expect(dot.className).toContain('k-bdg-e5');
    expect(dot.childNodes).toHaveLength(0);
    expect(dot.getAttribute('aria-label')).toBe('New notification');
  });
});
