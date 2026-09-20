import type { Schema } from '@kiskadee/core';
import type { CarbonIbmColorResolver } from '../carbon-ibm.color.ts';
import { tokenColor } from '../carbon-ibm.tokens.ts';
import { createCarbonMenuPalettes } from './dropdown.schema.ts';

type BottomSheetComponent = NonNullable<Schema<never>['components']['bottomSheet']>;
type Theme = 'light' | 'dark' | 'darker';

export function createCarbonIbmBottomSheetSchema({
  c
}: {
  c: CarbonIbmColorResolver;
}): BottomSheetComponent {
  const menu = {
    light: createCarbonMenuPalettes(c, 'light', 'bottomSheet'),
    dark: createCarbonMenuPalettes(c, 'dark', 'bottomSheet'),
    darker: createCarbonMenuPalettes(c, 'darker', 'bottomSheet')
  };
  const palettes = <K extends keyof typeof menu.light>(key: K) => ({
    default: { light: menu.light[key], dark: menu.dark[key], darker: menu.darker[key] }
  });
  const fixed = (
    token: 'overlay' | 'icon-secondary' | 'text-primary',
    property: 'boxColor' | 'textColor' = 'boxColor'
  ) => {
    const theme = (theme: Theme) => {
      const palette = {
        [property]: {
          neutral: { medium: { rest: tokenColor(c, theme, token, 'bottomSheet.neutral') } }
        }
      };
      return { onSubtle: palette, onVivid: palette };
    };
    return { default: { light: theme('light'), dark: theme('dark'), darker: theme('darker') } };
  };
  return {
    options: {
      density: { regular: 's:md:1' },
      initialHeight: 'standard',
      swipeBehavior: 'expand-dismiss',
      pageTransition: 'slide',
      itemLayout: 'structured',
      centeredIcons: 'hide',
      groupSeparators: true
    },
    effects: {
      shadow: { e2: { kind: 'outer', states: { rest: 's:md:1' }, fixedLevels: ['s:md:1'] } }
    },
    elements: {
      e1: { name: 'bottom-sheet-scrim', palettes: fixed('overlay') },
      e2: {
        name: 'bottom-sheet-surface',
        scales: { borderRadius: { rounded: 0, square: 0, pill: 0 } },
        palettes: palettes('surface')
      },
      e3: {
        name: 'bottom-sheet-handle',
        scales: {
          boxWidth: 32,
          boxHeight: 4,
          marginTop: 8,
          marginBottom: 8,
          borderRadius: { rounded: 0, square: 0, pill: 0 }
        },
        palettes: fixed('icon-secondary')
      },
      e4: {
        name: 'bottom-sheet-header',
        scales: { paddingTop: 16, paddingBottom: 16, paddingLeft: 16, paddingRight: 16 }
      },
      e5: {
        name: 'bottom-sheet-title',
        typography: { 's:all': 'heading-small' },
        palettes: fixed('text-primary', 'textColor')
      },
      e6: {
        name: 'bottom-sheet-body',
        scales: { paddingTop: 4, paddingBottom: 16, paddingLeft: 0, paddingRight: 0 }
      },
      e7: {
        name: 'bottom-sheet-item',
        scales: {
          paddingTop: 15,
          paddingBottom: 15,
          paddingLeft: 16,
          paddingRight: 16,
          marginBottom: 0,
          borderRadius: { rounded: 0, square: 0, pill: 0 }
        },
        palettes: palettes('item')
      },
      e8: {
        name: 'bottom-sheet-icon',
        iconSize: { 's:all': 's:sm:1' },
        scales: { paddingRight: 8 },
        palettes: palettes('icon')
      },
      e9: {
        name: 'bottom-sheet-label',
        typography: { 's:all': 'body-medium' },
        scales: { paddingRight: 8, paddingLeft: 0 },
        palettes: palettes('text')
      },
      e10: {
        name: 'bottom-sheet-description',
        typography: { 's:all': 'label-small' },
        scales: { paddingRight: 8, paddingLeft: 0 },
        palettes: palettes('auxiliary')
      },
      e11: {
        name: 'bottom-sheet-trailing-icon',
        iconSize: { 's:all': 's:sm:1' },
        scales: { paddingLeft: 8 },
        palettes: palettes('icon')
      },
      e12: { name: 'bottom-sheet-separator', separator: { 's:all': 'subtle' } },
      e13: {
        name: 'bottom-sheet-end-text',
        typography: { 's:all': 'label-small' },
        scales: { paddingLeft: 16, paddingRight: 0 },
        palettes: palettes('auxiliary')
      },
      e14: {
        name: 'bottom-sheet-group-label',
        typography: { 's:all': 'label-small' },
        scales: { paddingTop: 8, paddingBottom: 8, paddingLeft: 16, paddingRight: 16 },
        palettes: palettes('auxiliary')
      },
      e15: {
        name: 'bottom-sheet-checkmark',
        iconSize: { 's:all': 's:sm:1' },
        scales: { paddingRight: 8 },
        palettes: palettes('icon')
      }
    }
  };
}
