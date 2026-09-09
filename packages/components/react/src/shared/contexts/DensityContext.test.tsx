// @vitest-environment jsdom
import type { ComponentSize, Density } from '@kiskadee/core';
import { cleanup, render, screen } from '@testing-library/react';
import { createPortal } from 'react-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { DensityProvider, useComponentScale } from './DensityContext.tsx';
import { KiskadeeContext, type KiskadeeContextValue } from './KiskadeeContext.tsx';

const context: KiskadeeContextValue = {
  classesMap: {},
  designSystem: 'test',
  segment: 'default',
  theme: 'light',
  setDesignSystem: () => {},
  setSegment: () => {},
  setTheme: () => {},
  global: { density: { button: { c: 'sm:1', s: 'md:1' }, progress: { s: 'md:1' } } }
};

function Probe({
  name,
  component = 'button',
  size
}: {
  name: string;
  component?: string;
  size?: ComponentSize;
}) {
  const scale = useComponentScale(component, size);
  return <output data-testid={name}>{scale}</output>;
}

function Demo({ density }: { density: Density }) {
  return (
    <KiskadeeContext.Provider value={context}>
      <DensityProvider value={density}>
        <Probe name="following" />
        <Probe name="fixed" size="lg2" />
        <Probe name="single" component="progress" />
        {createPortal(<Probe name="portal" />, document.body)}
      </DensityProvider>
    </KiskadeeContext.Provider>
  );
}

afterEach(cleanup);

describe('density selection context', () => {
  it('resolves explicit size before nested scope and application density', () => {
    render(
      <KiskadeeContext.Provider value={{ ...context, density: 'compact' }}>
        <Probe name="application" />
        <DensityProvider value="spacious">
          <Probe name="scope" />
          <DensityProvider value="adaptive">
            <Probe name="nested" />
            <Probe name="explicit" size="sm2" />
          </DensityProvider>
        </DensityProvider>
      </KiskadeeContext.Provider>
    );
    expect(screen.getByTestId('application').textContent).toBe('sm:1');
    expect(screen.getByTestId('scope').textContent).toBe('md:1');
    expect(screen.getByTestId('nested').textContent).toBe('a');
    expect(screen.getByTestId('explicit').textContent).toBe('s:sm:2');
  });

  it('updates consumers and portals without overriding explicit sizes', () => {
    const { rerender } = render(<Demo density="adaptive" />);
    expect(screen.getByTestId('following').textContent).toBe('a');
    expect(screen.getByTestId('fixed').textContent).toBe('s:lg:2');
    rerender(<Demo density="compact" />);
    expect(screen.getByTestId('following').textContent).toBe('sm:1');
    expect(screen.getByTestId('portal').textContent).toBe('sm:1');
    expect(screen.getByTestId('single').textContent).toBe('md:1');
    expect(screen.getByTestId('fixed').textContent).toBe('s:lg:2');
    rerender(<Demo density="spacious" />);
    expect(screen.getByTestId('following').textContent).toBe('md:1');
  });

  it('uses adaptive when neither the application nor a subtree selects density', () => {
    render(
      <KiskadeeContext.Provider value={context}>
        <Probe name="default" />
      </KiskadeeContext.Provider>
    );
    expect(screen.getByTestId('default').textContent).toBe('a');
  });
});
