import type { SchemaFonts } from '@kiskadee/core';
import { fontFamilyCatalog } from '@kiskadee/fonts/catalog';
import { describe, expect, it } from 'vitest';
import {
  createFontSelectionOptions,
  FOLLOW_PRESET_FONT_KEY,
  getRecommendedFontLabel
} from './font-family-selection';

const FLUENT_FONTS: SchemaFonts = {
  families: {
    'segoe-ui': {
      stack: ['Segoe UI', 'Open Sans', 'sans-serif']
    }
  },
  roles: {
    body: 'segoe-ui'
  }
};

describe('font family selection', () => {
  it('uses the active artifact for the recommendation and Fonts for every alternative', () => {
    const options = createFontSelectionOptions('body', FLUENT_FONTS, {});

    expect(options[0]).toEqual({
      value: FOLLOW_PRESET_FONT_KEY,
      label: 'Segoe UI → Open Sans'
    });
    expect(options.map(({ value }) => value)).toEqual([
      FOLLOW_PRESET_FONT_KEY,
      ...fontFamilyCatalog.filter(({ id }) => id !== 'segoe-ui').map(({ id }) => id)
    ]);
    expect(options.some(({ label }) => label === 'Preset')).toBe(false);
  });

  it('replaces the policy label with the preparation outcome', () => {
    expect(
      getRecommendedFontLabel('body', FLUENT_FONTS, {
        'segoe-ui': {
          family: 'Open Sans',
          source: 'online',
          fallbackFor: 'Segoe UI'
        }
      })
    ).toBe('Open Sans (fallback for Segoe UI)');
  });

  it('names a missing recommendation without exposing the internal sentinel', () => {
    expect(createFontSelectionOptions('body', undefined, {})[0]).toEqual({
      value: FOLLOW_PRESET_FONT_KEY,
      label: 'Application default'
    });
  });
});
