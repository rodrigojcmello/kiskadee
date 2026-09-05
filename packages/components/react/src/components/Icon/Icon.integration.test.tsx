/** @vitest-environment jsdom */

import { defineIconFamily } from '@kiskadee/icons/interface';
import { fluentSystemIconFamily } from '@kiskadee/icons/interface/fluent-system';
import { fontAwesomeClassicIconFamily } from '@kiskadee/icons/interface/font-awesome-classic';
import { iconoirIconFamily } from '@kiskadee/icons/interface/iconoir';
import { lucideIconFamily } from '@kiskadee/icons/interface/lucide';
import { phosphorIconFamily } from '@kiskadee/icons/interface/phosphor';
import { cleanup, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { IconFamilyProvider } from '../../shared/contexts/IconFamilyContext.tsx';
import {
  KiskadeeContext,
  type KiskadeeContextValue
} from '../../shared/contexts/KiskadeeContext.tsx';
import { Button } from '../Button/Button.tsx';
import { FamilyResolvedIcon } from './FamilyResolvedIcon.tsx';
import { Icon } from './Icon.tsx';

function SearchGlyph() {
  return <svg data-testid="search-glyph" />;
}

const iconFamily = defineIconFamily({
  id: 'test-icons',
  label: 'Test Icons',
  glyphs: {
    search: SearchGlyph
  }
});

const kiskadeeContext: KiskadeeContextValue = {
  classesMap: {},
  designSystem: 'test',
  segment: 'default',
  setDesignSystem: () => {},
  setSegment: () => {},
  setTheme: () => {},
  theme: 'light'
};

function renderWithKiskadee(children: ReactNode, withIconFamily = true) {
  return render(
    <KiskadeeContext.Provider value={kiskadeeContext}>
      {withIconFamily ? (
        <IconFamilyProvider families={[iconFamily]} family="test-icons">
          {children}
        </IconFamilyProvider>
      ) : (
        children
      )}
    </KiskadeeContext.Provider>
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('styled Icon family composition', () => {
  it('switches inherited paint without changing glyph attributes or accessibility', () => {
    const context: KiskadeeContextValue = {
      ...kiskadeeContext,
      classesMap: {
        icon: { e1: { s: { 'md:1': 'size' }, c: { s: { neutral: { m: 'own-color' } } } } }
      }
    };
    function Example({ inherit }: { inherit: boolean }) {
      return (
        <KiskadeeContext.Provider value={context}>
          <Icon label="Artwork" {...(inherit ? { foreground: 'inherit' as const } : {})}>
            <svg aria-hidden="true" fill="none" stroke="currentColor">
              <path fill="currentColor" d="M0 0h1v1z" />
              <path fill="#123456" d="M1 1h1v1z" />
            </svg>
          </Icon>
        </KiskadeeContext.Provider>
      );
    }
    const result = render(<Example inherit={false} />);
    expect(result.getByRole('img', { name: 'Artwork' }).className).toContain('own-color');
    result.rerender(<Example inherit />);
    const root = result.getByRole('img', { name: 'Artwork' });
    expect(root.className).not.toContain('own-color');
    expect(root.className).toContain('size');
    expect(root.hasAttribute('foreground')).toBe(false);
    expect(root.querySelector('svg')?.getAttribute('fill')).toBe('none');
    expect(root.querySelector('svg')?.getAttribute('stroke')).toBe('currentColor');
    expect([...root.querySelectorAll('path')].map((path) => path.getAttribute('fill'))).toEqual([
      'currentColor',
      '#123456'
    ]);
    result.rerender(<Example inherit={false} />);
    expect(root.className).toContain('own-color');
  });

  it('keeps standalone accessibility semantics outside the family glyph', () => {
    const result = renderWithKiskadee(
      <Icon label="Search">
        <FamilyResolvedIcon name="search" />
      </Icon>
    );
    const semanticIcon = result.getByRole('img', { name: 'Search' });
    const glyph = result.getByTestId('search-glyph');

    expect(semanticIcon.contains(glyph)).toBe(true);
    expect(glyph.closest('[data-k-icon-family]')?.getAttribute('data-k-icon-family')).toBe(
      'test-icons'
    );
    expect(glyph.closest('[data-k-icon-family]')?.getAttribute('data-k-icon-variant')).toBe(
      'regular'
    );
    expect(glyph.closest('[data-k-icon-family]')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('preserves direct arbitrary children without an icon-family provider', () => {
    const result = renderWithKiskadee(
      <Icon label="Custom">
        <svg data-testid="custom-glyph" />
      </Icon>,
      false
    );

    expect(
      result.getByRole('img', { name: 'Custom' }).contains(result.getByTestId('custom-glyph'))
    ).toBe(true);
  });

  it('uses an explicit fallback without silently selecting another family', () => {
    const result = renderWithKiskadee(
      <Icon decorative>
        <FamilyResolvedIcon name="search" fallback={<svg data-testid="explicit-fallback" />} />
      </Icon>,
      false
    );

    expect(result.getByTestId('explicit-fallback')).toBeDefined();
    expect(result.container.querySelector('[data-k-icon-family]')).toBeNull();
  });

  it('omits the family-resolved child and reports a missing provider when no fallback exists', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = renderWithKiskadee(
      <Icon decorative>
        <FamilyResolvedIcon name="search" />
      </Icon>,
      false
    );

    expect(result.container.querySelector('.k-icn')).not.toBeNull();
    expect(result.container.querySelector('.k-gly')).toBeNull();
    expect(error).toHaveBeenCalledWith(expect.stringContaining('requires an IconFamilyProvider'));
  });

  it('keeps Button.Icon presentational while the Button label owns the accessible name', () => {
    const result = renderWithKiskadee(
      <Button activationFeedback={false}>
        <Button.Icon>
          <FamilyResolvedIcon name="search" />
        </Button.Icon>
        <Button.Label>Search</Button.Label>
      </Button>
    );
    const button = result.getByRole('button', { name: 'Search' });

    expect(
      button.querySelector('[data-k-icon-family="test-icons"]')?.getAttribute('aria-hidden')
    ).toBe('true');
    expect(button.querySelector('[role="img"]')).toBeNull();
  });

  it('renders Font Awesome definitions as normalized SVG without a global icon runtime', () => {
    const result = render(
      <KiskadeeContext.Provider value={kiskadeeContext}>
        <IconFamilyProvider families={[fontAwesomeClassicIconFamily]} family="font-awesome-classic">
          <Icon decorative>
            <FamilyResolvedIcon name="search" />
          </Icon>
        </IconFamilyProvider>
      </KiskadeeContext.Provider>
    );
    const svg = result.container.querySelector('svg');

    expect(svg?.getAttribute('fill')).toBe('currentColor');
    expect(svg?.getAttribute('viewBox')).toBe('0 0 512 512');
    expect(svg?.querySelector('path')?.getAttribute('d')).toBeTruthy();
  });

  it('applies Lucide stroke profiles through the selected local variant', () => {
    const result = render(
      <KiskadeeContext.Provider value={kiskadeeContext}>
        <IconFamilyProvider families={[lucideIconFamily]} family="lucide" variant="bold">
          <Icon decorative>
            <FamilyResolvedIcon name="search" />
          </Icon>
        </IconFamilyProvider>
      </KiskadeeContext.Provider>
    );
    const glyph = result.container.querySelector('[data-k-icon-name="search"]');

    expect(glyph?.getAttribute('data-k-icon-variant')).toBe('bold');
    expect(glyph?.querySelector('svg')?.getAttribute('stroke-width')).toBe('2.5');
  });

  it('applies Phosphor geometry weights without loading another family', () => {
    const thin = render(
      <KiskadeeContext.Provider value={kiskadeeContext}>
        <IconFamilyProvider families={[phosphorIconFamily]} family="phosphor" variant="thin">
          <Icon decorative>
            <FamilyResolvedIcon name="search" />
          </Icon>
        </IconFamilyProvider>
      </KiskadeeContext.Provider>
    );
    const thinPath = thin.container.querySelector('path')?.getAttribute('d');
    thin.unmount();
    const filled = render(
      <KiskadeeContext.Provider value={kiskadeeContext}>
        <IconFamilyProvider families={[phosphorIconFamily]} family="phosphor" variant="fill">
          <Icon decorative>
            <FamilyResolvedIcon name="search" />
          </Icon>
        </IconFamilyProvider>
      </KiskadeeContext.Provider>
    );

    expect(
      filled.container.querySelector('[data-k-icon-family]')?.getAttribute('data-k-icon-family')
    ).toBe('phosphor');
    expect(
      filled.container.querySelector('[data-k-icon-variant]')?.getAttribute('data-k-icon-variant')
    ).toBe('fill');
    expect(filled.container.querySelector('path')?.getAttribute('d')).not.toBe(thinPath);
  });

  it('renders explicit Fluent RTL list artwork without mirroring numbers', () => {
    const result = render(
      <KiskadeeContext.Provider value={kiskadeeContext}>
        <IconFamilyProvider families={[fluentSystemIconFamily]} family="fluent-system">
          <div dir="rtl">
            <Icon decorative>
              <FamilyResolvedIcon name="list-ordered" />
            </Icon>
          </div>
        </IconFamilyProvider>
      </KiskadeeContext.Provider>
    );
    const glyph = result.container.querySelector('[data-k-icon-name="list-ordered"]');

    expect(glyph?.getAttribute('data-k-icon-direction')).toBe('unique');
    expect(glyph?.querySelector('.k-gly-ltr svg')).not.toBeNull();
    expect(glyph?.querySelector('.k-gly-rtl svg')).not.toBeNull();
  });

  it('distinguishes mirrored and explicit RTL list geometry in Iconoir', () => {
    const result = render(
      <KiskadeeContext.Provider value={kiskadeeContext}>
        <IconFamilyProvider families={[iconoirIconFamily]} family="iconoir">
          <div dir="rtl">
            <Icon decorative>
              <FamilyResolvedIcon name="list" />
            </Icon>
            <Icon decorative>
              <FamilyResolvedIcon name="list-ordered" />
            </Icon>
          </div>
        </IconFamilyProvider>
      </KiskadeeContext.Provider>
    );
    const list = result.container.querySelector('[data-k-icon-name="list"]');
    const ordered = result.container.querySelector('[data-k-icon-name="list-ordered"]');

    expect(list?.getAttribute('data-k-icon-direction')).toBe('mirror');
    expect(list?.querySelector('.k-gly-rtl')).toBeNull();
    expect(ordered?.getAttribute('data-k-icon-direction')).toBe('unique');
    expect(ordered?.querySelector('.k-gly-rtl svg')).not.toBeNull();
  });
});
