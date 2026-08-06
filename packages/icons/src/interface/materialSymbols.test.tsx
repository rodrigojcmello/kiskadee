/** @vitest-environment jsdom */

import type { ReactElement } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { createMaterialSymbolGlyph, prepareMaterialSymbolsOutlined } from './materialSymbols.tsx';

type MaterialGlyphElement = ReactElement<{
  style: {
    fontVariationSettings: string;
    fontWeight: number;
  };
}>;

afterEach(() => {
  document.head.replaceChildren();
});

describe('Material Symbols variants', () => {
  it('projects the selected FILL value while keeping weight 400', () => {
    const Glyph = createMaterialSymbolGlyph('search');
    const outlineElement = (Glyph as (props: { fill?: 0 | 1 }) => MaterialGlyphElement)({
      fill: 0
    });
    const filledElement = (Glyph as (props: { fill?: 0 | 1 }) => MaterialGlyphElement)({ fill: 1 });

    expect(outlineElement.props.style.fontVariationSettings).toContain("'FILL' 0");
    expect(filledElement.props.style.fontVariationSettings).toContain("'FILL' 1");
    expect(filledElement.props.style.fontWeight).toBe(400);
  });

  it('deduplicates the subset stylesheet and requests the shared FILL range', async () => {
    const first = prepareMaterialSymbolsOutlined(['search', 'home']);
    const second = prepareMaterialSymbolsOutlined(['home', 'search']);
    const link = document.querySelector<HTMLLinkElement>('link[data-kiskadee-material-symbols]');

    expect(second).toBe(first);
    expect(link).not.toBeNull();
    expect(decodeURIComponent(link?.href ?? '')).toContain(
      'Material+Symbols+Outlined:FILL,GRAD,opsz,wght@0..1,0,24,400'
    );

    link?.dispatchEvent(new Event('load'));
    await expect(first).resolves.toBeUndefined();
  });
});
