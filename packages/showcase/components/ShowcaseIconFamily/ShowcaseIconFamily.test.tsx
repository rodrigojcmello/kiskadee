/** @vitest-environment jsdom */

import { defineIconFamily } from '@kiskadee/icons/interface';
import { IconFamilyProvider, IconGlyph } from '@kiskadee/react-components';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  SHOWCASE_ICON_FAMILY_ID,
  SHOWCASE_ICON_VARIANT_ID,
  ShowcaseIconFamilyBoundary
} from './ShowcaseIconFamily';

const dynamicFamily = defineIconFamily({
  id: 'dynamic-test',
  label: 'Dynamic test',
  glyphs: {
    search: () => <svg />
  }
});

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe('ShowcaseIconFamilyBoundary', () => {
  it('keeps Showcase glyphs on Carbon inside a dynamic example family', () => {
    act(() => {
      root.render(
        <IconFamilyProvider families={[dynamicFamily]} family={dynamicFamily.id}>
          <IconGlyph name="search" />
          <ShowcaseIconFamilyBoundary>
            <IconGlyph name="search" />
          </ShowcaseIconFamilyBoundary>
        </IconFamilyProvider>
      );
    });
    const glyphs = container.querySelectorAll('[data-k-icon-name="search"]');

    expect(glyphs).toHaveLength(2);
    expect(glyphs[0]?.getAttribute('data-k-icon-family')).toBe(dynamicFamily.id);
    expect(glyphs[1]?.getAttribute('data-k-icon-family')).toBe(SHOWCASE_ICON_FAMILY_ID);
    expect(glyphs[1]?.getAttribute('data-k-icon-variant')).toBe(SHOWCASE_ICON_VARIANT_ID);
    expect(SHOWCASE_ICON_FAMILY_ID).toBe('carbon');
    expect(SHOWCASE_ICON_VARIANT_ID).toBe('regular');
  });
});
