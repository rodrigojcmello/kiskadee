import { getFontFamilyPreparationStatus } from '@kiskadee/runtime/font-family';
import { describe, expect, it } from 'vitest';
import { fontFamilyCatalog, fontFamilyCatalogById } from './catalog.ts';

describe('fontFamilyCatalog', () => {
  it('publishes every selectable family without preparing it', () => {
    expect(fontFamilyCatalog.map(({ id }) => id)).toEqual([
      'segoe-ui',
      'fira-sans',
      'ibm-plex-sans',
      'inter',
      'lora',
      'noto-sans',
      'open-sans',
      'roboto',
      'ubuntu'
    ]);

    for (const entry of fontFamilyCatalog) {
      expect(fontFamilyCatalogById.get(entry.id)).toBe(entry);
      expect(getFontFamilyPreparationStatus(entry.id)).toBe('idle');
    }
  });

  it('loads descriptors lazily, deduplicates module work and preserves catalog metadata', async () => {
    for (const entry of fontFamilyCatalog) {
      const first = entry.load();
      const second = entry.load();

      expect(second).toBe(first);
      const definition = await first;
      expect(definition.id).toBe(entry.id);
      expect(definition.stack).toEqual(entry.stack);
      expect(getFontFamilyPreparationStatus(entry.id)).toBe('idle');
    }
  });
});
