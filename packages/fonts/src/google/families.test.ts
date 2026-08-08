import { describe, expect, it } from 'vitest';
import { firaSansFontFamily } from './fira-sans.ts';
import { ibmPlexSansFontFamily } from './ibm-plex-sans.ts';
import { interFontFamily } from './inter.ts';
import { loraFontFamily } from './lora.ts';
import { notoSansFontFamily } from './noto-sans.ts';
import { openSansFontFamily } from './open-sans.ts';
import { ROBOTO_GOOGLE_FAMILY_PARAMETERS, robotoFontFamily } from './roboto.ts';
import { ubuntuFontFamily } from './ubuntu.ts';

describe('Google Fonts catalog', () => {
  it('publishes inert explicit family descriptors', () => {
    expect([
      firaSansFontFamily,
      ibmPlexSansFontFamily,
      interFontFamily,
      loraFontFamily,
      notoSansFontFamily,
      openSansFontFamily,
      robotoFontFamily,
      ubuntuFontFamily
    ]).toEqual([
      {
        id: 'fira-sans',
        stack: ['Fira Sans', 'sans-serif'],
        prepare: expect.any(Function)
      },
      {
        id: 'ibm-plex-sans',
        stack: ['IBM Plex Sans', 'sans-serif'],
        prepare: expect.any(Function)
      },
      {
        id: 'inter',
        stack: ['Inter', 'sans-serif'],
        prepare: expect.any(Function)
      },
      {
        id: 'lora',
        stack: ['Lora', 'serif'],
        prepare: expect.any(Function)
      },
      {
        id: 'noto-sans',
        stack: ['Noto Sans', 'sans-serif'],
        prepare: expect.any(Function)
      },
      {
        id: 'open-sans',
        stack: ['Open Sans', 'sans-serif'],
        prepare: expect.any(Function)
      },
      {
        id: 'roboto',
        stack: ['Roboto', 'sans-serif'],
        prepare: expect.any(Function)
      },
      {
        id: 'ubuntu',
        stack: ['Ubuntu', 'sans-serif'],
        prepare: expect.any(Function)
      }
    ]);
  });

  it('requests every Roboto weight used by the Material typography profiles', () => {
    expect(ROBOTO_GOOGLE_FAMILY_PARAMETERS).toBe('Roboto:wght@400;500;700;800');
  });
});
