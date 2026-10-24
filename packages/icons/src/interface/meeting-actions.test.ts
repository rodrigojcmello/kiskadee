import { describe, expect, it } from 'vitest';
import type { CanonicalIconName } from './canonical.ts';
import { resolveIconGlyph } from './defineIconFamily.ts';

const ACTION_ICON_NAMES = [
  'record',
  'chat',
  'users',
  'hand',
  'smile',
  'grid',
  'ellipsis',
  'video',
  'mic',
  'screen-share',
  'phone-hangup'
] as const satisfies readonly CanonicalIconName[];

describe('canonical meeting action icons', () => {
  it('resolves individual fixed artwork across every official family variant', async () => {
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
        const glyphs = ACTION_ICON_NAMES.map((name) => {
          const action = resolveIconGlyph(family, name, variant);
          const context = `${family.id}/${variant}/${name}`;
          expect(action, context).toBeDefined();
          expect(action?.direction, context).toBe('fixed');
          expect(action?.rtlGlyph, context).toBeUndefined();
          expect(action?.glyph, context).not.toBe(resolveIconGlyph(family, 'plus', variant)?.glyph);
          return action?.glyph;
        });
        expect(new Set(glyphs).size, `${family.id}/${variant}`).toBe(ACTION_ICON_NAMES.length);
      }
    }

    const recording = resolveIconGlyph(fluent.fluentSystemIconFamily, 'record');
    const radio = resolveIconGlyph(fluent.fluentSystemIconFamily, 'radio-selected');
    expect(recording?.glyph).not.toBe(radio?.glyph);
  });
});
