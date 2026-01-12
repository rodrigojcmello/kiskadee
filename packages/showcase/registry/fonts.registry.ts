import type { FontStack } from '@kiskadee/web-builder/types';

export interface FontDef {
  key: string;
  label: string;
  /**
   * Structured font stack as `[primary, fallback]`.
   *
   * NOTE: this is intentionally NOT a CSS string. Convert with
   * `toCssFontFamily(family)` at the point of usage.
   */
  family: FontStack;
  googleFontParams?: string;
}

export const FONTS: FontDef[] = [
  {
    key: 'system',
    label: 'System UI',
    family: ['system-ui', 'sans-serif']
  },
  {
    key: 'inter',
    label: 'Inter',
    family: ['Inter', 'sans-serif'],
    googleFontParams: 'Inter:wght@400;500;700'
  },
  {
    key: 'roboto',
    label: 'Roboto',
    family: ['Roboto', 'sans-serif'],
    googleFontParams: 'Roboto:wght@400;500;700'
  },
  {
    key: 'open-sans',
    label: 'Open Sans',
    family: ['Open Sans', 'sans-serif'],
    googleFontParams: 'Open+Sans:wght@400;500;700'
  },
  {
    key: 'lora',
    label: 'Lora',
    family: ['Lora', 'serif'],
    googleFontParams: 'Lora:wght@400;500;700'
  },
  {
    key: 'noto-sans',
    label: 'Noto Sans',
    family: ['Noto Sans', 'sans-serif'],
    googleFontParams: 'Noto+Sans:wght@400;500;700'
  },
  {
    key: 'fira-sans',
    label: 'Fira Sans',
    family: ['Fira Sans', 'sans-serif'],
    googleFontParams: 'Fira+Sans:wght@400;500;700'
  },
  {
    key: 'ubuntu',
    label: 'Ubuntu',
    family: ['Ubuntu', 'sans-serif'],
    googleFontParams: 'Ubuntu:wght@400;500;700'
  },
  {
    key: 'ibm-plex-sans',
    label: 'IBM Plex Sans',
    family: ['IBM Plex Sans', 'sans-serif'],
    googleFontParams: 'IBM+Plex+Sans:wght@400;500;700'
  }
];
