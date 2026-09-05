/** @vitest-environment jsdom */

import { act, StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useShowcaseRouteBackground } from './use-showcase-route-background';

function Scenario({ color }: { color?: string }) {
  useShowcaseRouteBackground(color);
  return <p>Specimen</p>;
}

let canvas: HTMLDivElement;
let container: HTMLDivElement;
let root: Root;
const overrideProperty = '--showcase-route-background';
const defaultProperty = '--showcase-default-route-background';

beforeEach(() => {
  canvas = document.createElement('div');
  canvas.setAttribute('data-showcase-canvas', '');
  canvas.style.setProperty(defaultProperty, '#f9fbff');
  container = document.createElement('div');
  canvas.append(container);
  document.body.append(canvas);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  canvas.remove();
});

describe('shared Showcase canvas background', () => {
  it('lets routes inherit the default without configuring an override', () => {
    act(() => root.render(<p>Any component route</p>));
    expect(canvas.style.getPropertyValue(defaultProperty)).toBe('#f9fbff');
    expect(canvas.style.getPropertyValue(overrideProperty)).toBe('');
  });

  it('scopes a manual background to the canvas and restores the default on route exit', () => {
    act(() => root.render(<Scenario color="#0064b4" />));
    expect(canvas.style.getPropertyValue(overrideProperty)).toBe('#0064b4');
    expect(document.documentElement.style.getPropertyValue(overrideProperty)).toBe('');
    act(() => root.render(<p>Next component route</p>));
    expect(canvas.style.getPropertyValue(overrideProperty)).toBe('');
    expect(canvas.style.getPropertyValue(defaultProperty)).toBe('#f9fbff');
  });

  it('updates manual choices and releases pending or unavailable artifact colors', () => {
    act(() => root.render(<Scenario color="#0064b4" />));
    act(() => root.render(<Scenario color="#ffffff" />));
    expect(canvas.style.getPropertyValue(overrideProperty)).toBe('#ffffff');
    act(() => root.render(<Scenario />));
    expect(canvas.style.getPropertyValue(overrideProperty)).toBe('');
  });

  it('does not let an outgoing route clear a newer selection of the same color', () => {
    act(() => root.render(<Scenario key="outgoing" color="#0064b4" />));
    act(() =>
      root.render([
        <Scenario key="outgoing" color="#0064b4" />,
        <Scenario key="incoming" color="#0064b4" />
      ])
    );
    act(() => root.render(<Scenario key="incoming" color="#0064b4" />));
    expect(canvas.style.getPropertyValue(overrideProperty)).toBe('#0064b4');
  });

  it('supports Strict Mode replay and server rendering without document access', () => {
    expect(renderToString(<Scenario color="#0064b4" />)).toContain('Specimen');
    expect(canvas.style.getPropertyValue(overrideProperty)).toBe('');
    act(() =>
      root.render(
        <StrictMode>
          <Scenario color="#0064b4" />
        </StrictMode>
      )
    );
    expect(canvas.style.getPropertyValue(overrideProperty)).toBe('#0064b4');
  });
});
