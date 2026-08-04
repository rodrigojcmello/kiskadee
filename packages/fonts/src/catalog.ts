import type { FontFamilyId, FontStack } from '@kiskadee/core';
import type { DefinedFontFamily } from '@kiskadee/runtime/font-family';

export type FontFamilyCatalogProvider = 'google-fonts' | 'microsoft-google-fallback';

export type FontFamilyCatalogEntry = Readonly<{
  id: FontFamilyId;
  label: string;
  provider: FontFamilyCatalogProvider;
  stack: FontStack;
  fallbackFamily?: string;
  load: () => Promise<DefinedFontFamily>;
}>;

type FontFamilyCatalogEntryInput = Omit<FontFamilyCatalogEntry, 'load' | 'stack'> & {
  stack: FontStack;
  load: () => Promise<DefinedFontFamily>;
};

function defineCatalogEntry(input: FontFamilyCatalogEntryInput): FontFamilyCatalogEntry {
  let cached: Promise<DefinedFontFamily> | undefined;

  const load = () => {
    if (cached) return cached;

    const pending = input.load().catch((error: unknown) => {
      if (cached === pending) cached = undefined;
      throw error;
    });
    cached = pending;
    return pending;
  };

  return Object.freeze({
    ...input,
    stack: Object.freeze([...input.stack]) as FontStack,
    load
  });
}

export const fontFamilyCatalog: readonly FontFamilyCatalogEntry[] = Object.freeze([
  defineCatalogEntry({
    id: 'segoe-ui',
    label: 'Segoe UI',
    provider: 'microsoft-google-fallback',
    stack: [
      'Segoe UI',
      'Segoe UI Web (West European)',
      'Open Sans',
      '-apple-system',
      'BlinkMacSystemFont',
      'Roboto',
      'Helvetica Neue',
      'sans-serif'
    ],
    fallbackFamily: 'Open Sans',
    load: () =>
      import('./presets/fluent-2-microsoft.ts').then(
        ({ fluent2MicrosoftFontFamily }) => fluent2MicrosoftFontFamily
      )
  }),
  defineCatalogEntry({
    id: 'fira-sans',
    label: 'Fira Sans',
    provider: 'google-fonts',
    stack: ['Fira Sans', 'sans-serif'],
    load: () => import('./google/fira-sans.ts').then(({ firaSansFontFamily }) => firaSansFontFamily)
  }),
  defineCatalogEntry({
    id: 'ibm-plex-sans',
    label: 'IBM Plex Sans',
    provider: 'google-fonts',
    stack: ['IBM Plex Sans', 'sans-serif'],
    load: () =>
      import('./google/ibm-plex-sans.ts').then(({ ibmPlexSansFontFamily }) => ibmPlexSansFontFamily)
  }),
  defineCatalogEntry({
    id: 'inter',
    label: 'Inter',
    provider: 'google-fonts',
    stack: ['Inter', 'sans-serif'],
    load: () => import('./google/inter.ts').then(({ interFontFamily }) => interFontFamily)
  }),
  defineCatalogEntry({
    id: 'lora',
    label: 'Lora',
    provider: 'google-fonts',
    stack: ['Lora', 'serif'],
    load: () => import('./google/lora.ts').then(({ loraFontFamily }) => loraFontFamily)
  }),
  defineCatalogEntry({
    id: 'noto-sans',
    label: 'Noto Sans',
    provider: 'google-fonts',
    stack: ['Noto Sans', 'sans-serif'],
    load: () => import('./google/noto-sans.ts').then(({ notoSansFontFamily }) => notoSansFontFamily)
  }),
  defineCatalogEntry({
    id: 'open-sans',
    label: 'Open Sans',
    provider: 'google-fonts',
    stack: ['Open Sans', 'sans-serif'],
    load: () => import('./google/open-sans.ts').then(({ openSansFontFamily }) => openSansFontFamily)
  }),
  defineCatalogEntry({
    id: 'roboto',
    label: 'Roboto',
    provider: 'google-fonts',
    stack: ['Roboto', 'sans-serif'],
    load: () => import('./google/roboto.ts').then(({ robotoFontFamily }) => robotoFontFamily)
  }),
  defineCatalogEntry({
    id: 'ubuntu',
    label: 'Ubuntu',
    provider: 'google-fonts',
    stack: ['Ubuntu', 'sans-serif'],
    load: () => import('./google/ubuntu.ts').then(({ ubuntuFontFamily }) => ubuntuFontFamily)
  })
]);

export const fontFamilyCatalogById: ReadonlyMap<FontFamilyId, FontFamilyCatalogEntry> = new Map(
  fontFamilyCatalog.map((entry) => [entry.id, entry])
);
