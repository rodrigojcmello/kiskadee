/** @vitest-environment jsdom */

import { cleanup, render, screen } from '@testing-library/react';
import type { ComponentType, ReactNode } from 'react';
import { afterEach, describe, expect, expectTypeOf, it } from 'vitest';
import {
  KiskadeeContext,
  type KiskadeeContextValue
} from '../../shared/contexts/KiskadeeContext.tsx';
import { SurfaceContextProvider } from '../../shared/contexts/SurfaceContext.tsx';
import { Badge } from './Badge.tsx';
import type { BadgeDotProps, BadgeMarkProps, BadgeProps } from './Badge.types.ts';

type HasShadow<T> = 'shadow' extends keyof T ? true : false;

const context: KiskadeeContextValue = {
  classesMap: { badge: {} },
  designSystem: 'test',
  segment: 'default',
  theme: 'light',
  setDesignSystem: () => {},
  setSegment: () => {},
  setTheme: () => {}
};

const ringContext: KiskadeeContextValue = {
  ...context,
  classesMap: {
    badge: {
      e1: {
        d: 'badge-surface',
        rs: { all: 'badge-surface-square' },
        rr: { all: 'badge-surface-rounded' },
        rp: { all: 'badge-surface-pill' }
      },
      e3: { d: 'badge-full-bleed', rp: { all: 'badge-full-bleed-pill' } },
      e6: {
        d: 'badge-ring',
        rs: { all: 'badge-ring-square' },
        rr: { all: 'badge-ring-rounded' },
        rp: { all: 'badge-ring-pill' }
      }
    }
  }
};

const shadowContext: KiskadeeContextValue = {
  ...context,
  classesMap: {
    badge: {
      e5: { e: { h: 'badge-indicator-shadow' } },
      e6: { d: 'badge-ring', rp: { all: 'badge-ring-pill' } }
    }
  }
};

afterEach(cleanup);

describe('Badge', () => {
  it('exposes the optional static shadow only on a Dot without a ring', () => {
    type PlainDot = Extract<BadgeDotProps, { separation?: 'none' }>;
    type RingDot = Extract<BadgeDotProps, { separation: 'ring' }>;

    expectTypeOf<HasShadow<BadgeProps>>().toEqualTypeOf<false>();
    expectTypeOf<HasShadow<BadgeMarkProps>>().toEqualTypeOf<false>();
    expectTypeOf<PlainDot['shadow']>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<RingDot['shadow']>().toEqualTypeOf<undefined>();
  });

  it('renders one passive text or number value without an interactive role', () => {
    const result = render(
      <KiskadeeContext.Provider value={context}>
        <Badge data-testid="badge">Verified</Badge>
        <Badge data-testid="count">3</Badge>
      </KiskadeeContext.Provider>
    );

    expect(result.getByTestId('badge').tagName).toBe('SPAN');
    expect(screen.getByText('Verified').className).toContain('k-bdg-e2');
    expect(screen.getByText('3').className).toContain('k-bdg-e2');
    expect(result.queryByRole('button')).toBeNull();
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

  it('renders contained and full-bleed Marks as distinct icon-only anatomies', () => {
    const result = render(
      <KiskadeeContext.Provider value={context}>
        <Badge.Mark data-testid="contained">
          <svg data-testid="contained-icon" />
        </Badge.Mark>
        <Badge.Mark data-testid="full-bleed" presentation="full-bleed">
          <svg data-testid="full-bleed-icon" />
        </Badge.Mark>
      </KiskadeeContext.Provider>
    );

    expect(result.getByTestId('contained').className).toContain('k-bdg-e5');
    expect(result.getByTestId('contained-icon').parentElement?.className).toContain('k-bdg-e4');
    expect(result.getByTestId('full-bleed').className).toContain('k-bdg-e3');
    expect(result.getByTestId('full-bleed-icon').parentElement).toBe(
      result.getByTestId('full-bleed')
    );
    expect(result.getByTestId('full-bleed').querySelector('.k-bdg-e6')).toBeNull();
  });

  it('omits the separation-ring wrapper when e6 is unavailable', () => {
    const result = render(
      <KiskadeeContext.Provider value={context}>
        <Badge.Dot data-testid="dot" separation="ring" />
      </KiskadeeContext.Provider>
    );

    expect(result.getByTestId('dot').querySelector('.k-bdg-e6')).toBeNull();
  });

  it('renders a resolved ring around full-bleed Marks and follows the text Badge radius', () => {
    const result = render(
      <KiskadeeContext.Provider value={ringContext}>
        <Badge data-testid="square" radius="square" separation="ring">
          12
        </Badge>
        <Badge data-testid="rounded" radius="rounded" separation="ring">
          New
        </Badge>
        <Badge.Mark data-testid="full-bleed" presentation="full-bleed" separation="ring">
          <svg />
        </Badge.Mark>
      </KiskadeeContext.Provider>
    );

    expect(result.getByTestId('square').querySelector('.k-bdg-e6')?.className).toContain(
      'badge-ring-square'
    );
    expect(result.getByTestId('rounded').querySelector('.k-bdg-e6')?.className).toContain(
      'badge-ring-rounded'
    );
    expect(result.getByTestId('full-bleed').querySelector('.k-bdg-e6')?.className).toContain(
      'badge-ring-pill'
    );
  });

  it('applies the static shadow only to a Dot without separation', () => {
    const result = render(
      <KiskadeeContext.Provider value={shadowContext}>
        <Badge.Dot data-testid="plain" />
        <Badge.Dot data-testid="dot-shadow" shadow />
      </KiskadeeContext.Provider>
    );

    expect(result.getByTestId('plain').classList.contains('-e')).toBe(false);
    expect(result.getByTestId('dot-shadow').className).toContain('badge-indicator-shadow');
    expect(result.getByTestId('dot-shadow').classList.contains('-e')).toBe(true);
  });

  it('does not add a shadow activator when the active preset omits the recipe', () => {
    const result = render(
      <KiskadeeContext.Provider value={context}>
        <Badge.Dot data-testid="badge" shadow />
      </KiskadeeContext.Provider>
    );

    expect(result.getByTestId('badge').classList.contains('-e')).toBe(false);
  });

  it('rejects compound Badge content and full-bleed emphasis at runtime', () => {
    const UnsafeBadge = Badge as unknown as ComponentType<{ children: ReactNode }>;
    const UnsafeMark = Badge.Mark as unknown as ComponentType<{
      children: ReactNode;
      emphasis?: string;
      presentation: string;
    }>;
    const UnsafeDot = Badge.Dot as unknown as ComponentType<{
      separation: string;
      shadow: boolean;
    }>;

    expect(() =>
      render(
        <KiskadeeContext.Provider value={context}>
          <UnsafeBadge>
            <span>Invalid</span>
          </UnsafeBadge>
        </KiskadeeContext.Provider>
      )
    ).toThrow('Badge requires exactly one string or number child.');

    expect(() =>
      render(
        <KiskadeeContext.Provider value={context}>
          <UnsafeMark presentation="full-bleed" emphasis="low">
            <svg />
          </UnsafeMark>
        </KiskadeeContext.Provider>
      )
    ).toThrow('Badge.Mark does not accept emphasis when presentation is full-bleed.');

    expect(() =>
      render(
        <KiskadeeContext.Provider value={shadowContext}>
          <UnsafeDot separation="ring" shadow />
        </KiskadeeContext.Provider>
      )
    ).toThrow('Badge.Dot does not accept shadow when separation is ring.');
  });
});
