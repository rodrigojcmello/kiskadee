import { defineIconFamilyCatalogEntry, defineIconFamilyFallback } from './defineIconFamily.ts';
import type { IconFamilyCatalogEntry, IconFamilyCatalogItem } from './types.ts';

export const lucideIconFamilyEntry = defineIconFamilyCatalogEntry({
  id: 'lucide',
  label: 'Lucide',
  load: () => import('./families/lucide.tsx').then(({ lucideIconFamily }) => lucideIconFamily)
});

export const fluentSystemIconFamilyEntry = defineIconFamilyCatalogEntry({
  id: 'fluent-system',
  label: 'Fluent UI System Icons',
  load: () =>
    import('./families/fluent-system.tsx').then(
      ({ fluentSystemIconFamily }) => fluentSystemIconFamily
    )
});

export const materialSymbolsOutlinedIconFamilyEntry = defineIconFamilyCatalogEntry({
  id: 'material-symbols-outlined',
  label: 'Material Symbols Outlined',
  load: () =>
    import('./families/material-symbols-outlined.tsx').then(
      ({ materialSymbolsOutlinedIconFamily }) => materialSymbolsOutlinedIconFamily
    )
});

export const carbonIconFamilyEntry = defineIconFamilyCatalogEntry({
  id: 'carbon',
  label: 'Carbon Icons',
  load: () => import('./families/carbon.tsx').then(({ carbonIconFamily }) => carbonIconFamily)
});

export const iconoirIconFamilyEntry = defineIconFamilyCatalogEntry({
  id: 'iconoir',
  label: 'Iconoir',
  load: () => import('./families/iconoir.tsx').then(({ iconoirIconFamily }) => iconoirIconFamily)
});

export const phosphorIconFamilyEntry = defineIconFamilyCatalogEntry({
  id: 'phosphor',
  label: 'Phosphor',
  load: () => import('./families/phosphor.tsx').then(({ phosphorIconFamily }) => phosphorIconFamily)
});

export const fontAwesomeClassicSolidIconFamilyEntry = defineIconFamilyCatalogEntry({
  id: 'font-awesome-classic-solid',
  label: 'Font Awesome Classic Solid',
  load: () =>
    import('./families/font-awesome-classic-solid.tsx').then(
      ({ fontAwesomeClassicSolidIconFamily }) => fontAwesomeClassicSolidIconFamily
    )
});

export const sfSymbolsWebFallback = defineIconFamilyFallback({
  id: 'sf-symbols',
  label: 'SF Symbols',
  fallbackTo: 'iconoir'
});

export const interfaceIconFamilyOptions = [
  lucideIconFamilyEntry,
  fluentSystemIconFamilyEntry,
  materialSymbolsOutlinedIconFamilyEntry,
  carbonIconFamilyEntry,
  iconoirIconFamilyEntry,
  phosphorIconFamilyEntry,
  fontAwesomeClassicSolidIconFamilyEntry
] as const satisfies readonly IconFamilyCatalogEntry[];

export const interfaceIconFamilyCatalog = [
  ...interfaceIconFamilyOptions,
  sfSymbolsWebFallback
] as const satisfies readonly IconFamilyCatalogItem[];
