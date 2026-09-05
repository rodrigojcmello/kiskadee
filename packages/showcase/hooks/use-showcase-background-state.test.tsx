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
vi.mock('@kiskadee/react-components', () => ({ useKiskadee: () => ({ theme: fixtures.theme }) }));
vi.mock('./use-canonical-card-surfaces', () => ({
  useCanonicalCardSurfaces: () => ({
    tones: fixtures.tones,
    defaultToneKey: fixtures.tones[1]?.key,
    defaultSurface: fixtures.tones[1]
  })
}));
vi.mock('./use-background-tones', () => ({
  useButtonStressTestBackgroundTones: () => ({
    tones: [
      {
        key: 'white',
        row: 'light',
        resolvedColor: 'light-stress',
        surfaceContexts: ['onSubtle'],
        availableThemes: ['light']
      },
      {
        key: 'vivid-blue',
        row: 'vivid',
        resolvedColor: 'vivid-stress',
        surfaceContexts: ['onVivid'],
        availableThemes: ['light', 'dark', 'darker']
      }
    ]
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
      key: 'neutral.low',
      label: 'Base',
      contentSurfaceContext: 'onSubtle',
      resolvedColor: 'white'
    },
    {
      key: 'neutral.medium',
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
  it('keeps gray/white default, and selects white/white and white/gray independently', () => {
    render();
    expect([value.color, value.cardSurface?.resolvedColor]).toEqual(['gray', 'white']);
    act(() => value.selectBackground('neutral.low'));
    expect([value.color, value.cardSurface?.resolvedColor]).toEqual(['white', 'white']);
    act(() => value.selectBackground('neutral.low:cards:neutral.medium'));
    expect([value.color, value.cardSurface?.resolvedColor]).toEqual(['white', 'gray']);
    expect(value.surfaceContext).toBe('onSubtle');
  });
  it('resets on navigation and returning to a previous route, without remembering the selection', () => {
    render();
    act(() => value.selectBackground('neutral.low:cards:neutral.medium'));
    render('/switch');
    expect(value.key).toBe('neutral.medium');
    render('/button');
    expect(value.key).toBe('neutral.medium');
  });
  it('resolves the selected pair again for themes and releases unavailable artifacts', () => {
    render();
    act(() => value.selectBackground('neutral.low:cards:neutral.medium'));
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
  it('coordinates surface context and stress-test mode, preserving canonical colors', () => {
    render();
    act(() => value.selectContext('onVivid'));
    expect([value.color, value.cardSurface?.resolvedColor]).toEqual(['blue', 'blue']);
    act(() => value.selectMode('stress-test'));
    expect(value.color).toBe('vivid-stress');
    act(() => value.selectBackground('white'));
    expect(value.surfaceContext).toBe('onSubtle');
    act(() => value.selectMode('canonical'));
    expect(value.color).toBe('white');
  });
  it('ignores invalid selections and renders on the server without document access', () => {
    expect(renderToString(<Harness />)).toContain('data-canvas="gray"');
    render();
    act(() => value.selectBackground('unknown'));
    expect(value.key).toBe('neutral.medium');
  });
});
