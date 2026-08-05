/** @vitest-environment jsdom */

import { defineIconFamily } from '@kiskadee/icons/interface';
import { fluentSystemIconFamily } from '@kiskadee/icons/interface/fluent-system';
import { fontAwesomeClassicSolidIconFamily } from '@kiskadee/icons/interface/font-awesome-classic-solid';
import { iconoirIconFamily } from '@kiskadee/icons/interface/iconoir';
import { cleanup, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { IconFamilyProvider } from '../../shared/contexts/IconFamilyContext.tsx';
import {
  KiskadeeContext,
  type KiskadeeContextValue
} from '../../shared/contexts/KiskadeeContext.tsx';
import { Button } from '../Button/Button.tsx';
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
  it('keeps standalone accessibility semantics outside the family glyph', () => {
    const result = renderWithKiskadee(<Icon name="search" label="Search" />);
    const semanticIcon = result.getByRole('img', { name: 'Search' });
    const glyph = result.getByTestId('search-glyph');

    expect(semanticIcon.contains(glyph)).toBe(true);
    expect(glyph.closest('[data-k-icon-family]')?.getAttribute('data-k-icon-family')).toBe(
      'test-icons'
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
      <Icon decorative name="search" fallback={<svg data-testid="explicit-fallback" />} />,
      false
    );

    expect(result.getByTestId('explicit-fallback')).toBeDefined();
    expect(result.container.querySelector('[data-k-icon-family]')).toBeNull();
  });

  it('returns null and reports a missing provider when no fallback exists', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = renderWithKiskadee(<Icon decorative name="search" />, false);

    expect(result.container.innerHTML).toBe('');
    expect(error).toHaveBeenCalledWith(expect.stringContaining('requires an IconFamilyProvider'));
  });

  it('keeps Button.Icon presentational while the Button label owns the accessible name', () => {
    const result = renderWithKiskadee(
      <Button activationFeedback={false}>
        <Button.Icon name="search" />
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
        <IconFamilyProvider
          families={[fontAwesomeClassicSolidIconFamily]}
          family="font-awesome-classic-solid"
        >
          <Icon decorative name="search" />
        </IconFamilyProvider>
      </KiskadeeContext.Provider>
    );
    const svg = result.container.querySelector('svg');

    expect(svg?.getAttribute('fill')).toBe('currentColor');
    expect(svg?.getAttribute('viewBox')).toBe('0 0 512 512');
    expect(svg?.querySelector('path')?.getAttribute('d')).toBeTruthy();
  });

  it('renders explicit Fluent RTL list artwork without mirroring numbers', () => {
    const result = render(
      <KiskadeeContext.Provider value={kiskadeeContext}>
        <IconFamilyProvider families={[fluentSystemIconFamily]} family="fluent-system">
          <div dir="rtl">
            <Icon decorative name="list-ordered" />
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
            <Icon decorative name="list" />
            <Icon decorative name="list-ordered" />
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
