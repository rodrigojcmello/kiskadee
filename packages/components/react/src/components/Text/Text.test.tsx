/** @vitest-environment jsdom */
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { type ComponentPropsWithoutRef, createRef, forwardRef, type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  KiskadeeContext,
  type KiskadeeContextValue
} from '../../shared/contexts/KiskadeeContext.tsx';
import { SurfaceContextProvider } from '../../shared/contexts/SurfaceContext.tsx';
import { Text } from './Text.tsx';

const TEXT_COLORS = {
  e1: {
    c: {
      s: {
        neutral: { m: 'fg-medium', l: 'fg-low', ll: 'fg-lowest' },
        red: { m: 'fg-red-medium', l: 'fg-red-low', ll: 'fg-red-lowest' }
      },
      v: {
        neutral: {
          m: 'fg-vivid-medium',
          l: 'fg-vivid-low',
          ll: 'fg-vivid-lowest'
        },
        red: {
          m: 'fg-vivid-red-medium',
          l: 'fg-vivid-red-low',
          ll: 'fg-vivid-red-lowest'
        }
      }
    }
  }
} as const;

function createContextValue(
  textClasses: Record<string, string> | null = {
    bm: 'font-body text-medium line-medium'
  },
  colorClasses: typeof TEXT_COLORS | null = TEXT_COLORS
): KiskadeeContextValue {
  return {
    classesMap: colorClasses ? { text: colorClasses } : {},
    segment: 'default',
    theme: 'light',
    setSegment: () => {},
    setTheme: () => {},
    designSystem: 'test-design-system',
    setDesignSystem: () => {},
    global: textClasses
      ? {
          classMap: {
            text: {
              e1: { t: textClasses }
            }
          }
        }
      : undefined
  };
}

function renderText(node: ReactElement, context = createContextValue()) {
  return render(<KiskadeeContext.Provider value={context}>{node}</KiskadeeContext.Provider>);
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('Text', () => {
  it('preserves element semantics, native props, atomic utilities, and consumer classes', () => {
    renderText(
      <Text
        as="h2"
        profile="body-medium"
        className="consumer-class"
        id="page-title"
        aria-live="polite"
      >
        Button
      </Text>
    );

    const title = screen.getByRole('heading', { level: 2, name: 'Button' });
    expect(title.id).toBe('page-title');
    expect(title.getAttribute('aria-live')).toBe('polite');
    expect(title.className).toBe(
      'k-txt font-body text-medium line-medium fg-medium consumer-class'
    );
  });

  it('forwards refs and defaults to span', () => {
    const ref = createRef<HTMLSpanElement>();
    renderText(
      <Text ref={ref} profile="body-medium">
        Inline text
      </Text>
    );

    expect(ref.current?.tagName).toBe('SPAN');
    expect(ref.current?.textContent).toBe('Inline text');
  });

  it('supports class-forwarding polymorphic components', () => {
    const CustomLink = forwardRef<HTMLAnchorElement, ComponentPropsWithoutRef<'a'>>(
      function CustomLink(props, ref) {
        return <a {...props} ref={ref} data-custom-link="true" />;
      }
    );
    const ref = createRef<HTMLAnchorElement>();

    renderText(
      <Text as={CustomLink} ref={ref} profile="body-medium" href="/button">
        Custom link
      </Text>
    );

    expect(ref.current?.getAttribute('href')).toBe('/button');
    expect(ref.current?.dataset.customLink).toBe('true');
    expect(ref.current?.className).toContain('font-body');
  });

  it('keeps content rendered while the matching global artifact is unavailable', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderText(<Text profile="body-medium">Loading</Text>, createContextValue(null, null));

    expect(screen.getByText('Loading').className).toBe('k-txt');
    expect(warn).not.toHaveBeenCalled();
  });

  it('keeps typography and inherits color when the preset has no Text color artifact', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderText(
      <Text profile="body-medium">Typography only</Text>,
      createContextValue({ bm: 'font-body text-medium line-medium' }, null)
    );

    expect(screen.getByText('Typography only').className).toBe(
      'k-txt font-body text-medium line-medium'
    );
    expect(warn).not.toHaveBeenCalled();
  });

  it('warns and inherits when the active preset does not publish the requested profile', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderText(<Text profile="heading-large">Fallback</Text>);

    expect(screen.getByText('Fallback').className).toBe('k-txt fg-medium');
    expect(warn).toHaveBeenCalledWith(
      '[Kiskadee] Text profile "heading-large" is not available in design system "test-design-system".'
    );
  });

  it('defaults to neutral.medium and supports every Text emphasis', () => {
    renderText(
      <>
        <Text data-testid="default" profile="body-medium">
          Default
        </Text>
        <Text data-testid="low" profile="body-medium" emphasis="low">
          Low
        </Text>
        <Text data-testid="lowest" profile="body-medium" emphasis="lowest">
          Lowest
        </Text>
      </>
    );

    expect(screen.getByTestId('default').className).toContain('fg-medium');
    expect(screen.getByTestId('low').className).toContain('fg-low');
    expect(screen.getByTestId('lowest').className).toContain('fg-lowest');
  });

  it('selects a named chromatic foreground without changing its semantic meaning', () => {
    renderText(
      <>
        <Text data-testid="red-subtle" profile="body-medium" foreground="red">
          Red subtle
        </Text>
        <Text
          data-testid="red-vivid"
          profile="body-medium"
          foreground="red"
          emphasis="low"
          surfaceContext="onVivid"
        >
          Red vivid
        </Text>
      </>
    );

    expect(screen.getByTestId('red-subtle').className).toContain('fg-red-medium');
    expect(screen.getByTestId('red-vivid').className).toContain('fg-vivid-red-low');
  });

  it('inherits color when the active preset does not publish a requested color family', () => {
    renderText(
      <Text profile="body-medium" foreground="teal">
        Unsupported teal
      </Text>
    );

    expect(screen.getByText('Unsupported teal').className).toBe(
      'k-txt font-body text-medium line-medium'
    );
  });

  it('uses the nearest Surface Context Provider and lets an explicit prop override it', () => {
    renderText(
      <SurfaceContextProvider value="onVivid">
        <Text data-testid="inherited" profile="body-medium" emphasis="low">
          Inherited
        </Text>
        <Text data-testid="explicit" profile="body-medium" emphasis="low" surfaceContext="onSubtle">
          Explicit
        </Text>
      </SurfaceContextProvider>
    );

    expect(screen.getByTestId('inherited').className).toContain('fg-vivid-low');
    expect(screen.getByTestId('explicit').className).toContain('fg-low');
  });

  it('inherit removes only the foreground class', () => {
    const loader = vi.fn(async () => undefined);
    renderText(
      <Text profile="body-medium" foreground="inherit" className="consumer-class">
        Inherited color
      </Text>,
      { ...createContextValue(), loadComponentClassMap: loader }
    );

    expect(screen.getByText('Inherited color').className).toBe(
      'k-txt font-body text-medium line-medium consumer-class'
    );
    expect(loader).not.toHaveBeenCalled();
  });

  it('warns and inherits instead of falling back to onSubtle when onVivid is missing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const subtleOnly = {
      e1: { c: { s: TEXT_COLORS.e1.c.s } }
    } as unknown as typeof TEXT_COLORS;

    renderText(
      <Text profile="body-medium" surfaceContext="onVivid">
        Missing vivid
      </Text>,
      createContextValue(undefined, subtleOnly)
    );

    expect(screen.getByText('Missing vivid').className).toBe(
      'k-txt font-body text-medium line-medium'
    );
    expect(warn).toHaveBeenCalledWith(
      '[Kiskadee] surfaceContext="onVivid" was requested, but the active palette does not provide onVivid color classes.'
    );
  });

  it('renders typography and foreground during SSR without extra runtime lookup', () => {
    const html = renderToString(
      <KiskadeeContext.Provider value={createContextValue()}>
        <Text profile="body-medium">Server text</Text>
      </KiskadeeContext.Provider>
    );

    expect(html).toContain('font-body text-medium line-medium fg-medium');
    expect(html).toContain('Server text');
  });

  it('drops a stale foreground while the next palette artifact is pending', async () => {
    type Deferred<T> = {
      promise: Promise<T>;
      resolve: (value: T) => void;
    };
    const deferred = <T,>(): Deferred<T> => {
      let resolve!: (value: T) => void;
      const promise = new Promise<T>((done) => {
        resolve = done;
      });
      return { promise, resolve };
    };
    const light = deferred<any>();
    const dark = deferred<any>();
    const loader = vi.fn(
      async (_componentName: string, scope: { kind: 'core' | 'palette'; theme?: string }) => {
        if (scope.kind === 'core') return undefined;
        return scope.theme === 'dark' ? dark.promise : light.promise;
      }
    );
    const contextForTheme = (theme: 'light' | 'dark'): KiskadeeContextValue => ({
      ...createContextValue(undefined, null),
      designSystem: 'foreground-swap-test',
      artifactVersion: '1',
      theme,
      loadComponentClassMap: loader
    });
    const view = renderText(<Text profile="body-medium">Swapping</Text>, contextForTheme('light'));

    await act(async () => {
      light.resolve({ component: 'text', classMap: TEXT_COLORS });
    });
    await waitFor(() => expect(screen.getByText('Swapping').className).toContain('fg-medium'));

    view.rerender(
      <KiskadeeContext.Provider value={contextForTheme('dark')}>
        <Text profile="body-medium">Swapping</Text>
      </KiskadeeContext.Provider>
    );
    expect(screen.getByText('Swapping').className).toBe('k-txt font-body text-medium line-medium');

    await act(async () => {
      dark.resolve({
        component: 'text',
        classMap: {
          e1: { c: { s: { neutral: { m: 'fg-dark-medium' } } } }
        }
      });
    });
    await waitFor(() => expect(screen.getByText('Swapping').className).toContain('fg-dark-medium'));
  });
});
