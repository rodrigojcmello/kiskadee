import type { Schema } from '@kiskadee/core';
import primary from '../colors/b.blue.v1.ts';
import neutral from '../colors/n.black.v1.ts';

export function createSandboxDropdownSchema(): NonNullable<Schema['components']['dropdown']> {
  const themed = (theme: 'light' | 'dark') => {
    const n = neutral.scales[theme];
    const p = primary.scales[theme];
    const both = <T>(value: T) => ({ onSubtle: value, onVivid: value });
    const text = both({
      textColor: { neutral: { medium: { rest: n[85], disabled: { ref: n[30] } } } }
    });
    return {
      surface: both({ boxColor: { neutral: { medium: { rest: n[2] } } } }),
      item: both({
        boxColor: {
          neutral: {
            medium: {
              rest: n[2],
              hover: n[8],
              selected: { rest: p[primary.functionalReferences[theme].subtle], hover: p[12] },
              disabled: n[2]
            }
          }
        }
      }),
      text,
      icon: text,
      auxiliary: text,
      scroll: both({ boxColor: { neutral: { medium: { rest: n[2] } } }, ...text.onSubtle })
    };
  };
  const values = { light: themed('light'), dark: themed('dark') };
  const palettes = <K extends keyof typeof values.light>(key: K) => ({
    default: { light: values.light[key], dark: values.dark[key] }
  });
  return {
    effects: {
      shadow: { e1: { kind: 'outer', states: { rest: 's:md:1' }, fixedLevels: ['s:md:1'] } }
    },
    options: {
      density: { compact: 's:sm:1', regular: 's:md:1', spacious: 's:lg:1' },
      leadingIconComposition: 'item-and-selection',
      selectedItemBackground: true
    },
    elements: {
      e1: {
        name: 'dropdown-surface',
        scales: {
          paddingTop: 4,
          paddingBottom: 4,
          paddingLeft: 6,
          paddingRight: 6,
          borderRadius: { rounded: 10, square: 0, pill: 16 }
        },
        palettes: palettes('surface')
      },
      e2: {
        name: 'dropdown-item',
        scales: {
          paddingTop: { 's:sm:1': 7, 's:md:1': 11, 's:lg:1': 15 },
          paddingBottom: { 's:sm:1': 7, 's:md:1': 11, 's:lg:1': 15 },
          paddingLeft: 16,
          paddingRight: 16,
          marginBottom: 0,
          borderRadius: { rounded: 10, square: 0, pill: 16 }
        },
        palettes: palettes('item')
      },
      e3: {
        name: 'dropdown-icon',
        iconSize: { 's:all': 's:sm:1' },
        scales: { paddingRight: 8 },
        palettes: palettes('icon')
      },
      e4: {
        name: 'dropdown-label',
        typography: { 's:all': 'body-medium' },
        scales: { paddingLeft: 0, paddingRight: 8 },
        palettes: palettes('text')
      },
      e5: {
        name: 'dropdown-description',
        typography: { 's:all': 'body-small' },
        scales: { paddingLeft: 0, paddingRight: 8 },
        palettes: palettes('auxiliary')
      },
      e6: {
        name: 'dropdown-trailing-icon',
        iconSize: { 's:all': 's:sm:1' },
        scales: { paddingLeft: 8 },
        palettes: palettes('icon')
      },
      e7: { name: 'dropdown-separator', separator: { 's:all': 'subtle' } },
      e8: {
        name: 'dropdown-end-text',
        typography: { 's:all': 'body-small' },
        scales: { paddingLeft: 16, paddingRight: 0 },
        palettes: palettes('auxiliary')
      },
      e9: {
        name: 'dropdown-group-label',
        typography: { 's:all': 'body-small' },
        scales: {
          paddingTop: 8,
          paddingBottom: 8,
          paddingLeft: 16,
          paddingRight: 16,
          marginLeft: 0
        },
        palettes: palettes('auxiliary')
      },
      e10: {
        name: 'dropdown-selection-indicator',
        iconSize: { 's:all': 's:sm:1' },
        scales: { paddingRight: 8 },
        palettes: palettes('icon')
      },
      e11: {
        name: 'dropdown-scroll-affordance',
        iconSize: { 's:all': 's:sm:1' },
        palettes: palettes('scroll')
      }
    }
  };
}
