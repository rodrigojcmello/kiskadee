import { describe, expect, it } from 'vitest';
import { resolveIconGlyph } from './defineIconFamily.ts';

describe('canonical lock coverage', () => {
  it('resolves fixed padlock artwork in every official family variant', async () => {
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
        const lock = resolveIconGlyph(family, 'lock', variant);
        expect(lock, `${family.id}/${variant}`).toBeDefined();
        expect(lock?.direction, `${family.id}/${variant}`).toBe('fixed');
        expect(lock?.rtlGlyph, `${family.id}/${variant}`).toBeUndefined();
      }
    }
  });
});
