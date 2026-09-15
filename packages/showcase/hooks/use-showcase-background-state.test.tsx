/** @vitest-environment jsdom */
import { act, StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ResolvedCanonicalCardSurface } from '../utils/canonical-card-surfaces';
import { useShowcaseBackgroundState } from './use-showcase-background-state';

const fixtures = vi.hoisted(() => ({
  theme: 'light',
  tones: [] as ResolvedCanonicalCardSurface[]
}));
vi.mock('@kiskadee/react-components/resources', () => ({
  useKiskadee: () => ({ theme: fixtures.theme })
}));
vi.mock('./use-canonical-card-surfaces', () => ({
  useCanonicalCardSurfaces: () => ({
    tones: fixtures.tones,
    defaultToneKey: fixtures.tones[1]?.key,
    defaultSurface: fixtures.tones[1]
  })
}));

let value: ReturnType<typeof useShowcaseBackgroundState>;
let container: HTMLDivElement;
let root: Root;
function Harness({ route = '/button' }: { route?: string }) {
  value = useShowcaseBackgroundState(route);
  return <div data-canvas={value.color} data-card={value.cardSurface?.resolvedColor} />;
}
function render(route = '/button') {
  act(() =>
    root.render(
      <StrictMode>
        <Harness route={route} />
      </StrictMode>
    )
  );
}

beforeEach(() => {
  fixtures.theme = 'light';
  fixtures.tones = [
    {
      key: 'neutral.lowest',
      label: 'Base',
      contentSurfaceContext: 'onSubtle',
      resolvedColor: 'white'
    },
    {
      key: 'neutral.low',
      label: 'Alternate',
      contentSurfaceContext: 'onSubtle',
      resolvedColor: 'gray'
    },
    {
      key: 'primary.highest',
      label: 'Vivid',
      contentSurfaceContext: 'onVivid',
      resolvedColor: 'blue'
    }
  ];
  container = document.createElement('div');
  root = createRoot(container);
});
afterEach(() => act(() => root.unmount()));

describe('shared background selection', () => {
  it('updates automatic defaults on theme changes and preserves explicit choices', () => {
    render();
    fixtures.tones = [
      ...fixtures.tones,
      {
        key: 'neutral.highest',
        label: 'Black',
        resolvedColor: 'black',
        contentSurfaceContext: 'onSubtle'
      }
    ];
    fixtures.theme = 'darker';
    render();
    expect(value.color).toBe('gray');
    act(() => value.selectContext('onVivid'));
    fixtures.theme = 'dark';
    render();
    expect(value.color).toBe('blue');
    act(() => value.selectContext('onSubtle'));
    expect(value.color).toBe('gray');
    fixtures.theme = 'darker';
    render();
    expect(value.color).toBe('gray');
    act(() => value.selectBackground('neutral.lowest'));
    fixtures.theme = 'dark';
    render();
    expect(value.color).toBe('white');
  });
  it('keeps gray/white default, and selects white/white and white/gray independently', () => {
    render();
    expect([value.color, value.cardSurface?.resolvedColor]).toEqual(['gray', 'white']);
    act(() => value.selectBackground('neutral.lowest'));
    expect([value.color, value.cardSurface?.resolvedColor]).toEqual(['white', 'white']);
    act(() => value.selectBackground('neutral.lowest:cards:neutral.low'));
    expect([value.color, value.cardSurface?.resolvedColor]).toEqual(['white', 'gray']);
    expect(value.surfaceContext).toBe('onSubtle');
  });
  it('resets on navigation and returning to a previous route, without remembering the selection', () => {
    render();
    act(() => value.selectBackground('neutral.lowest:cards:neutral.low'));
    render('/switch');
    expect(value.key).toBe('neutral.low');
    render('/button');
    expect(value.key).toBe('neutral.low');
  });
  it('resolves the selected pair again for themes and releases unavailable artifacts', () => {
    render();
    act(() => value.selectBackground('neutral.lowest:cards:neutral.low'));
    fixtures.theme = 'dark';
    fixtures.tones = fixtures.tones.map((tone) => ({
      ...tone,
      resolvedColor: `dark-${tone.resolvedColor}`
    }));
    render();
    expect([value.color, value.cardSurface?.resolvedColor]).toEqual(['dark-white', 'dark-gray']);
    fixtures.tones = [];
    render();
    expect(value.color).toBeUndefined();
    expect(value.cardSurface).toBeUndefined();
  });
  it('restores the shared subtle default after a vivid context on Card', () => {
    render('/card');
    const initial = value.color;
    act(() => value.selectContext('onVivid'));
    expect(value.color).toBe('blue');
    act(() => value.selectContext('onSubtle'));
    expect(value.color).toBe(initial);
    expect(value.cardSurface?.resolvedColor).toBe('white');
  });
  it('ignores invalid selections and renders on the server without document access', () => {
    expect(renderToString(<Harness />)).toContain('data-canvas="gray"');
    render();
    act(() => value.selectBackground('unknown'));
    expect(value.key).toBe('neutral.low');
  });
});

it('uses the same Darker default for selection and shell fallback', () => {
  fixtures.theme = 'darker';
  fixtures.tones.push({
    key: 'neutral.highest',
    label: 'Black',
    resolvedColor: 'black',
    contentSurfaceContext: 'onSubtle'
  });
  render();
  expect(value.key).toBe('neutral.low');
  expect(value.defaultColor).toBe(value.color);
  expect(value.defaultColor).toBe('gray');
  act(() => value.selectBackground('neutral.lowest'));
  expect(value.color).toBe('white');
  expect(value.defaultColor).toBe('gray');
  act(() => value.selectContext('onVivid'));
  expect(value.defaultColor).toBe(value.color);
});
