import { normalizeHexColor } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';

import {
  BRAND_DEFINITION_BY_ID,
  BRAND_DEFINITIONS,
  BRAND_IDS,
  BRAND_PACK_DEFINITION_BY_ID,
  BRAND_PACK_DEFINITIONS,
  BRAND_PACK_IDS,
  brandIntent,
  getBrandDefinition,
  getBrandPackDefinition,
  isBrandId,
  isBrandPackId
} from './index.ts';

describe('brand definitions', () => {
  it('defines each supported brand exactly once', () => {
    expect(BRAND_DEFINITIONS.map(({ id }) => id)).toEqual(BRAND_IDS);
    expect(new Set(BRAND_IDS).size).toBe(BRAND_IDS.length);
    expect(Object.keys(BRAND_DEFINITION_BY_ID)).toEqual(BRAND_IDS);

    for (const definition of BRAND_DEFINITIONS) {
      expect(getBrandDefinition(definition.id)).toEqual(definition);
      expect(normalizeHexColor(definition.seedHex)).toBe(definition.seedHex);
      expect(definition.iconId).toBe(definition.id);
      expect(new URL(definition.provenanceUrl).protocol).toBe('https:');
    }
  });

  it('defines non-overlapping auth and social packs', () => {
    expect(BRAND_PACK_DEFINITIONS.map(({ id }) => id)).toEqual(BRAND_PACK_IDS);
    expect(Object.keys(BRAND_PACK_DEFINITION_BY_ID)).toEqual(BRAND_PACK_IDS);

    const packedBrands = BRAND_PACK_DEFINITIONS.flatMap(({ brands }) => brands);
    expect(packedBrands).toEqual(BRAND_IDS);
    expect(new Set(packedBrands).size).toBe(BRAND_IDS.length);

    for (const pack of BRAND_PACK_DEFINITIONS) {
      expect(getBrandPackDefinition(pack.id)).toEqual(pack);
      expect(pack.brands.length).toBeGreaterThan(0);
    }
  });

  it('uses Fluent Brand-80 as the Microsoft functional seed', () => {
    expect(getBrandDefinition('microsoft')).toMatchObject({
      seedHex: '#0064b4',
      seedSource: 'official-action-background',
      contentPolarity: 'light'
    });
  });

  it('creates qualified intents without widening a literal brand ID', () => {
    expect(brandIntent('google')).toBe('brand.google');
    expect(brandIntent('tik-tok')).toBe('brand.tik-tok');
    expect(brandIntent('chat-gpt')).toBe('brand.chat-gpt');
  });

  it('recognizes only catalog and pack IDs', () => {
    expect(isBrandId('instagram')).toBe(true);
    expect(isBrandId('linked-in')).toBe(true);
    expect(isBrandId('linkedin')).toBe(false);
    expect(isBrandPackId('auth')).toBe(true);
    expect(isBrandPackId('marketing')).toBe(false);
  });
});
