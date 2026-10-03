/** @vitest-environment jsdom */

import {
  type ComponentSize,
  componentSizeScales,
  type LayoutResponsiveColumns
} from '@kiskadee/core';
import { cleanup, render } from '@testing-library/react';
import { createRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import {
  KiskadeeContext,
  type KiskadeeContextValue
} from '../../shared/contexts/KiskadeeContext.tsx';
import {
  SurfaceContextProvider,
  useSurfaceContext
} from '../../shared/contexts/SurfaceContext.tsx';
import { resolveLayoutClassNames } from './Layout.class-names.ts';
import { Layout } from './Layout.tsx';
import type { LayoutClassesMap, LayoutProps } from './Layout.types.ts';

const bucket = (property: string) =>
  Object.fromEntries(
    Object.entries(componentSizeScales).map(([size, scale]) => [
      scale.slice(2),
      `${property}-${size}`
    ])
  );
const map: LayoutClassesMap = {
  e1: {
    s: { 'md:1': 'forbidden-combined-size' },
    sp: Object.fromEntries(
      ['pt', 'pr', 'pb', 'pl', 'mt', 'mr', 'mb', 'ml'].map((key) => [key, bucket(key)])
    )
  },
  e2: {
    sp: { pt: bucket('row'), pl: bucket('column') },
    gc: {
      'bp:all': 'columns-all',
      'bp:md:2': 'columns-medium',
      'bp:lg:1': 'columns-large'
    }
  }
};
const context: KiskadeeContextValue = {
  classesMap: { layout: map },
  designSystem: 'test',
  segment: 'default',
  theme: 'light',
  setDesignSystem: () => {},
  setSegment: () => {},
  setTheme: () => {}
};

afterEach(cleanup);

describe('Layout', () => {
  it.each(
    Object.keys(componentSizeScales) as ComponentSize[]
  )('resolves %s for all three spacing families without aggregated size classes', (size) => {
    const result = resolveLayoutClassNames(map, { padding: size, margin: size, gap: size });
    expect(result.e1).toContain(`pt-${size}`);
    expect(result.e1).toContain(`ml-${size}`);
    expect(result.e2).toContain(`row-${size}`);
    expect(result.e2).toContain(`column-${size}`);
    expect(result.e1).not.toContain('forbidden-combined-size');
  });

  it('keeps padding, margin, row gap, and column gap independent', () => {
    const result = resolveLayoutClassNames(map, {
      padding: 'md',
      margin: 'sm',
      gap: { row: 'lg', column: 'sm5' }
    });
    expect(result.e1).toContain('pt-md');
    expect(result.e1).toContain('mt-sm');
    expect(result.e1).not.toContain('mt-md');
    expect(result.e2).toContain('row-lg');
    expect(result.e2).toContain('column-sm5');
    expect(result.e1).not.toContain('row-lg');
    expect(result.e2).not.toContain('pt-md');
  });

  it('lets logical edges override axes, including explicitly disabling an edge', () => {
    const result = resolveLayoutClassNames(map, {
      padding: { block: 'md', blockEnd: false, inline: 'sm', inlineStart: 'lg' },
      margin: { inline: 'sm2', inlineEnd: false }
    });
    expect(result.e1).toContain('pt-md');
    expect(result.e1).not.toContain('pb-');
    expect(result.e1).toContain('pr-sm');
    expect(result.e1).toContain('pl-lg');
    expect(result.e1).toContain('ml-sm2');
    expect(result.e1).not.toContain('mr-');
  });

  it('does not activate spacing implicitly or use inherited token values for missing utilities', () => {
    expect(resolveLayoutClassNames(map, {}).e1).toBe('k-lyt');
    const absent = resolveLayoutClassNames(undefined, { padding: 'md', gap: 'md' });
    expect(absent.e1).toBe('k-lyt');
    expect(absent.e2).not.toContain('k-lyt-e2a');
    expect(absent.e2).not.toContain('k-lyt-e2b');
  });

  it('forwards root props/ref, preserves child semantics and inherited surface context', () => {
    const ref = createRef<HTMLDivElement>();
    const rootStyle = Object.freeze({ width: 240 });
    function Probe() {
      return <output>{useSurfaceContext()}</output>;
    }
    const result = render(
      <KiskadeeContext.Provider value={context}>
        <SurfaceContextProvider value="onVivid">
          <Layout
            ref={ref}
            data-testid="frame"
            dir="rtl"
            padding="md"
            className="custom"
            classNames={{ e2: 'content' }}
            display="grid"
            columns={2}
            style={rootStyle}
          >
            <button type="button">Action</button>
            <Probe />
          </Layout>
        </SurfaceContextProvider>
      </KiskadeeContext.Provider>
    );
    const frame = result.getByTestId('frame');
    expect(frame).toBe(ref.current);
    expect(frame.getAttribute('dir')).toBe('rtl');
    expect(frame.className).toContain('custom');
    expect(frame.children).toHaveLength(1);
    expect(frame.firstElementChild?.className).toContain('content');
    const flow = frame.firstElementChild as HTMLDivElement;
    expect(flow.className).toContain('columns-all');
    expect(flow.style.getPropertyValue('--k-lyt-gc-all')).toBe('2');
    expect(frame.style.width).toBe('240px');
    expect(flow.style.width).toBe('');
    expect(frame.style.getPropertyValue('--k-lyt-gc-all')).toBe('');
    expect(rootStyle).toEqual({ width: 240 });
    expect(result.getByRole('button').parentElement).toBe(frame.firstElementChild);
    expect(result.getByRole('status').textContent).toBe('onVivid');
    expect(frame.hasAttribute('padding')).toBe(false);
    expect(frame.hasAttribute('columns')).toBe(false);
    expect(frame.hasAttribute('role')).toBe(false);
  });

  it('emits paired column classes and local values on the server without viewport-dependent rendering', () => {
    const markup = renderToStaticMarkup(
      <KiskadeeContext.Provider value={context}>
        <Layout display="grid" columns={{ 'bp:all': 1, 'bp:md:2': 3, 'bp:lg:1': 4 }}>
          Content
        </Layout>
      </KiskadeeContext.Provider>
    );
    expect(markup).toContain('columns-all columns-medium columns-large');
    expect(markup).toContain('style="--k-lyt-gc-all:1;--k-lyt-gc-md2:3;--k-lyt-gc-lg1:4"');
    expect(markup).toContain('<div class="k-lyt"><div');
  });

  it('uses one base selector for every supported scalar count', () => {
    for (let count = 1; count <= 12; count += 1) {
      const result = resolveLayoutClassNames(map, {
        display: 'grid',
        columns: count as LayoutResponsiveColumns
      });
      expect(result.e2).toContain('columns-all');
      expect(result.e2Style).toEqual({ '--k-lyt-gc-all': count });
    }
  });

  it('leaves omitted breakpoints inactive instead of filling them from a base count', () => {
    const result = resolveLayoutClassNames(map, {
      display: 'grid',
      columns: { 'bp:lg:1': 5 }
    });
    expect(result.e2).toContain('columns-large');
    expect(result.e2).not.toContain('columns-all');
    expect(result.e2).not.toContain('columns-medium');
    expect(result.e2Style).toEqual({ '--k-lyt-gc-lg1': 5 });
  });

  it('keeps nested layouts and siblings independent by pairing every active selector with a local value', () => {
    const result = render(
      <KiskadeeContext.Provider value={context}>
        <Layout data-testid="outer" display="grid" columns={{ 'bp:all': 2, 'bp:md:2': 4 }}>
          <Layout data-testid="inner" display="grid" columns={{ 'bp:all': 3, 'bp:lg:1': 5 }} />
          <Layout data-testid="sibling" display="grid" columns={{ 'bp:md:2': 6 }} />
        </Layout>
      </KiskadeeContext.Provider>
    );
    const outer = result.getByTestId('outer').firstElementChild as HTMLDivElement;
    const inner = result.getByTestId('inner').firstElementChild as HTMLDivElement;
    const sibling = result.getByTestId('sibling').firstElementChild as HTMLDivElement;
    expect(outer.style.cssText).toBe('--k-lyt-gc-all: 2; --k-lyt-gc-md2: 4;');
    expect(inner.style.cssText).toBe('--k-lyt-gc-all: 3; --k-lyt-gc-lg1: 5;');
    expect(inner.className).not.toContain('columns-medium');
    expect(sibling.style.cssText).toBe('--k-lyt-gc-md2: 6;');
    expect(sibling.className).not.toContain('columns-all');
    expect(sibling.className).not.toContain('columns-large');
  });

  it('removes obsolete values and selectors when columns or display change', () => {
    const view = (props: Pick<LayoutProps, 'columns' | 'display'>) => (
      <KiskadeeContext.Provider value={context}>
        <Layout data-testid="frame" {...props} />
      </KiskadeeContext.Provider>
    );
    const result = render(view({ display: 'grid', columns: { 'bp:all': 1, 'bp:md:2': 3 } }));
    const flow = result.getByTestId('frame').firstElementChild as HTMLDivElement;
    expect(flow.style.getPropertyValue('--k-lyt-gc-md2')).toBe('3');

    result.rerender(view({ display: 'grid', columns: { 'bp:all': 2 } }));
    expect(flow.style.getPropertyValue('--k-lyt-gc-all')).toBe('2');
    expect(flow.style.getPropertyValue('--k-lyt-gc-md2')).toBe('');
    expect(flow.className).not.toContain('columns-medium');

    result.rerender(view({ display: 'grid' }));
    expect(flow.style.cssText).toBe('');
    expect(flow.className).not.toContain('columns-');

    result.rerender(view({ display: 'grid', columns: 4 }));
    expect(flow.style.getPropertyValue('--k-lyt-gc-all')).toBe('4');
    result.rerender(view({ display: 'flex', columns: 4 }));
    expect(flow.style.cssText).toBe('');
    expect(flow.className).not.toContain('columns-');
  });

  it.each([
    0,
    -1,
    13,
    1.5,
    NaN,
    Infinity,
    '3',
    null,
    undefined
  ])('does not activate a responsive selector for an invalid count (%s)', (count) => {
    const result = resolveLayoutClassNames(map, {
      display: 'grid',
      columns: { 'bp:all': 2, 'bp:md:2': count } as LayoutResponsiveColumns
    });
    expect(result.e2).toContain('columns-all');
    expect(result.e2).not.toContain('columns-medium');
    expect(result.e2Style).toEqual({ '--k-lyt-gc-all': 2 });
  });

  it('omits both class and variable when a breakpoint is unknown or unpublished', () => {
    const result = resolveLayoutClassNames(map, {
      display: 'grid',
      columns: { 'bp:sm:1': 2, unknown: 3 } as LayoutResponsiveColumns
    });
    expect(result.e2).not.toContain('columns-');
    expect(result.e2Style).toBeUndefined();
    const missingMap = resolveLayoutClassNames(undefined, { display: 'grid', columns: 3 });
    expect(missingMap.e2).not.toContain('columns-');
    expect(missingMap.e2Style).toBeUndefined();
  });

  it('removes paired column styling when the active preset no longer publishes it', () => {
    const view = (value: KiskadeeContextValue) => (
      <KiskadeeContext.Provider value={value}>
        <Layout data-testid="frame" display="grid" columns={3} />
      </KiskadeeContext.Provider>
    );
    const result = render(view(context));
    const flow = result.getByTestId('frame').firstElementChild as HTMLDivElement;
    expect(flow.style.getPropertyValue('--k-lyt-gc-all')).toBe('3');

    result.rerender(view({ ...context, classesMap: { layout: { e1: {}, e2: {} } } }));
    expect(flow.className).not.toContain('columns-');
    expect(flow.style.cssText).toBe('');
  });
});
