/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import { type ComponentPropsWithoutRef, createRef, forwardRef, type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  KiskadeeContext,
  type KiskadeeContextValue
} from '../../shared/contexts/KiskadeeContext.tsx';
import { Text } from './Text.tsx';

function createContextValue(
  textClasses: Record<string, string> | null = {
    bm: 'font-body text-medium line-medium'
  }
): KiskadeeContextValue {
  return {
    classesMap: {},
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
    expect(title.className).toBe('k-txt font-body text-medium line-medium consumer-class');
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
    renderText(<Text profile="body-medium">Loading</Text>, createContextValue(null));

    expect(screen.getByText('Loading').className).toBe('k-txt');
    expect(warn).not.toHaveBeenCalled();
  });

  it('warns and inherits when the active preset does not publish the requested profile', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderText(<Text profile="heading-large">Fallback</Text>);

    expect(screen.getByText('Fallback').className).toBe('k-txt');
    expect(warn).toHaveBeenCalledWith(
      '[Kiskadee] Text profile "heading-large" is not available in design system "test-design-system".'
    );
  });
});
