/** @vitest-environment jsdom */

import { afterEach, describe, expect, it } from 'vitest';
import { resolveIconGlyph } from './defineIconFamily.ts';

afterEach(() => {
  document.head.replaceChildren();
});

describe('canonical visibility icons', () => {
  it('resolves distinct fixed artwork in every official family variant', async () => {
    const [lucide, fluent, material, carbon, iconoir, phosphor, fontAwesome] = await Promise.all([
      import('./families/lucide.tsx'),
      import('./families/fluent-system.tsx'),
      import('./families/material-symbols-outlined.tsx'),
      import('./families/carbon.tsx'),
      import('./families/iconoir.tsx'),
      import('./families/phosphor.tsx'),
      import('./families/font-awesome-classic-solid.tsx')
    ]);
    const families = [
      lucide.lucideIconFamily,
      fluent.fluentSystemIconFamily,
      material.materialSymbolsIconFamily,
      carbon.carbonIconFamily,
      iconoir.iconoirIconFamily,
      phosphor.phosphorIconFamily,
      fontAwesome.fontAwesomeClassicIconFamily
    ];

    for (const family of families) {
      for (const variant of Object.keys(family.variants)) {
        const eye = resolveIconGlyph(family, 'eye', variant);
        const eyeOff = resolveIconGlyph(family, 'eye-off', variant);
        for (const glyph of [eye, eyeOff]) {
          expect(glyph, `${family.id}/${variant}`).toBeDefined();
          expect(glyph?.direction, `${family.id}/${variant}`).toBe('fixed');
          expect(glyph?.rtlGlyph, `${family.id}/${variant}`).toBeUndefined();
        }
        expect(eye?.glyph, `${family.id}/${variant}`).not.toBe(eyeOff?.glyph);
      }
    }
  });

  it('prepares both Material fill variants with the shared visibility ligature subset', async () => {
    const { materialSymbolsIconFamily } = await import('./families/material-symbols-outlined.tsx');
    const first = materialSymbolsIconFamily.variants['fill-0'].prepare?.();
    const second = materialSymbolsIconFamily.variants['fill-1'].prepare?.();
    const link = document.querySelector<HTMLLinkElement>('link[data-kiskadee-material-symbols]');

    expect(first).toBeDefined();
    expect(second).toBe(first);
    expect(link).not.toBeNull();
    const names = new URL(link!.href).searchParams.get('icon_names')?.split(',');
    expect(names).toContain('visibility');
    expect(names).toContain('visibility_off');
    expect(names).not.toContain('eye');
    expect(names).not.toContain('eye-off');
    link?.dispatchEvent(new Event('load'));
    await expect(first).resolves.toBeUndefined();
  });
});
