/** @vitest-environment jsdom */
import { act, StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ResolvedCanonicalCardSurface } from '../utils/canonical-card-surfaces';
import { playWowTransition } from '../utils/playWowTransition';
import { useShowcaseBackgroundState } from './use-showcase-background-state';

const fixtures = vi.hoisted(() => ({
  theme: 'light',
  tones: [] as ResolvedCanonicalCardSurface[]
}));
vi.mock('@kiskadee/react-components/resources', () => ({
  useKiskadee: () => ({ theme: fixtures.theme })
}));
vi.mock('./use-canonical-container-surfaces', () => ({
  useCanonicalContainerSurfaces: () => fixtures.tones
}));
vi.mock('../utils/playWowTransition', () => ({ playWowTransition: vi.fn() }));

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
      key: 'neutral.medium',
      label: 'Medium',
      contentSurfaceContext: 'onSubtle',
      resolvedColor: 'medium-gray'
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
  it('starts the content transition only when a manual choice changes the visible scenario', () => {
    vi.mocked(playWowTransition).mockClear();
    render();
    act(() => value.selectContext('onSubtle'));
    act(() => value.selectBackground('unknown'));
    expect(playWowTransition).not.toHaveBeenCalled();
    act(() => value.selectContext('onVivid'));
    act(() => value.selectBackground('neutral.lowest'));
    act(() => value.selectBackground('neutral.lowest'));
    expect(playWowTransition).toHaveBeenCalledTimes(2);
  });
  it('pairs a published vivid companion canvas with the main Primary Card', () => {
    fixtures.tones.push({
      key: 'primaryComplementary.highest',
      label: 'Vivid companion',
      contentSurfaceContext: 'onVivid',
      resolvedColor: 'deep-blue'
    });
    render();
    act(() => value.selectContext('onVivid'));
    expect([value.key, value.color, value.cardSurface?.resolvedColor]).toEqual([
      'primaryComplementary.highest',
      'deep-blue',
      'blue'
    ]);
  });
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
    expect(value.color).toBe('medium-gray');
    act(() => value.selectContext('onVivid'));
    fixtures.theme = 'dark';
    render();
    expect(value.color).toBe('blue');
    act(() => value.selectContext('onSubtle'));
    expect(value.color).toBe('medium-gray');
    fixtures.theme = 'darker';
    render();
    expect(value.color).toBe('medium-gray');
    act(() => value.selectBackground('neutral.lowest'));
    fixtures.theme = 'dark';
    render();
    expect(value.color).toBe('white');
  });
  it('keeps an explicitly selected primary pair when the target theme renders a split swatch', () => {
    fixtures.tones.push({
      key: 'primaryComplementary.highest',
      label: 'Companion',
      contentSurfaceContext: 'onVivid',
      resolvedColor: 'companion'
    });
    const lightSurfaces = fixtures.tones;
    render();
    act(() => value.selectBackground('primaryComplementary.highest'));
    fixtures.theme = 'dark';
    fixtures.tones = lightSurfaces.map((tone) => ({
      ...tone,
      contentSurfaceContext: 'onSubtle',
      resolvedColor: `dark-${tone.resolvedColor}`
    }));
    render();
    expect([value.color, value.cardSurface?.resolvedColor, value.surfaceContext]).toEqual([
      'dark-companion',
      'dark-blue',
      'onSubtle'
    ]);
    act(() => value.selectBackground(value.key!));
    fixtures.theme = 'light';
    fixtures.tones = lightSurfaces;
    render();
    expect([value.color, value.cardSurface?.resolvedColor, value.surfaceContext]).toEqual([
      'companion',
      'blue',
      'onVivid'
    ]);
  });
  it('keeps Medium/Low default, and selects white/white and white/gray independently', () => {
    render();
    expect([value.color, value.cardSurface?.resolvedColor]).toEqual(['medium-gray', 'gray']);
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
    expect(value.key).toBe('neutral.medium');
    render('/button');
    expect(value.key).toBe('neutral.medium');
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
    expect(value.cardSurface?.resolvedColor).toBe('gray');
  });
  it('ignores invalid selections and renders on the server without document access', () => {
    expect(renderToString(<Harness />)).toContain('data-canvas="medium-gray"');
    render();
    act(() => value.selectBackground('unknown'));
    expect(value.key).toBe('neutral.medium');
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
  expect(value.key).toBe('neutral.medium');
  expect(value.defaultColor).toBe(value.color);
  expect(value.defaultColor).toBe('medium-gray');
  act(() => value.selectBackground('neutral.lowest'));
  expect(value.color).toBe('white');
  expect(value.defaultColor).toBe('medium-gray');
  act(() => value.selectContext('onVivid'));
  expect(value.defaultColor).toBe(value.color);
});
