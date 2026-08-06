import { defineIconFamilyCatalogEntry, defineIconFamilyFallback } from './defineIconFamily.ts';
import type { IconFamilyCatalogEntry, IconFamilyCatalogItem } from './types.ts';

export const lucideIconFamilyEntry = defineIconFamilyCatalogEntry({
  id: 'lucide',
  label: 'Lucide',
  defaultVariant: 'regular',
  variants: [
    { id: 'thin', label: 'Thin' },
    { id: 'regular', label: 'Regular' },
    { id: 'bold', label: 'Bold' }
  ],
  load: () => import('./families/lucide.tsx').then(({ lucideIconFamily }) => lucideIconFamily)
});

export const fluentSystemIconFamilyEntry = defineIconFamilyCatalogEntry({
  id: 'fluent-system',
  label: 'Fluent UI System Icons',
  defaultVariant: 'regular',
  variants: [{ id: 'regular', label: 'Regular' }],
  load: () =>
    import('./families/fluent-system.tsx').then(
      ({ fluentSystemIconFamily }) => fluentSystemIconFamily
    )
});

export const materialSymbolsIconFamilyEntry = defineIconFamilyCatalogEntry({
  id: 'material-symbols',
  label: 'Material Symbols Outlined',
  defaultVariant: 'fill-0',
  variants: [
    { id: 'fill-0', label: 'Fill 0' },
    { id: 'fill-1', label: 'Fill 1' }
  ],
  load: () =>
    import('./families/material-symbols-outlined.tsx').then(
      ({ materialSymbolsIconFamily }) => materialSymbolsIconFamily
    )
});

export const carbonIconFamilyEntry = defineIconFamilyCatalogEntry({
  id: 'carbon',
  label: 'Carbon Icons',
  defaultVariant: 'regular',
  variants: [{ id: 'regular', label: 'Regular' }],
  load: () => import('./families/carbon.tsx').then(({ carbonIconFamily }) => carbonIconFamily)
});

export const iconoirIconFamilyEntry = defineIconFamilyCatalogEntry({
  id: 'iconoir',
  label: 'Iconoir',
  defaultVariant: 'regular',
  variants: [{ id: 'regular', label: 'Regular' }],
  load: () => import('./families/iconoir.tsx').then(({ iconoirIconFamily }) => iconoirIconFamily)
});

export const phosphorIconFamilyEntry = defineIconFamilyCatalogEntry({
  id: 'phosphor',
  label: 'Phosphor',
  defaultVariant: 'regular',
  variants: [
    { id: 'thin', label: 'Thin' },
    { id: 'regular', label: 'Regular' },
    { id: 'fill', label: 'Fill' },
    { id: 'duotone', label: 'Duotone' }
  ],
  load: () => import('./families/phosphor.tsx').then(({ phosphorIconFamily }) => phosphorIconFamily)
});

export const fontAwesomeClassicIconFamilyEntry = defineIconFamilyCatalogEntry({
  id: 'font-awesome-classic',
  label: 'Font Awesome Classic Free',
  defaultVariant: 'solid',
  variants: [{ id: 'solid', label: 'Solid' }],
  load: () =>
    import('./families/font-awesome-classic-solid.tsx').then(
      ({ fontAwesomeClassicIconFamily }) => fontAwesomeClassicIconFamily
    )
});

export const sfSymbolsWebFallback = defineIconFamilyFallback({
  id: 'sf-symbols',
  label: 'SF Symbols',
  fallbackTo: 'iconoir',
  fallbackVariant: 'regular'
});

export const interfaceIconFamilyOptions = [
  lucideIconFamilyEntry,
  fluentSystemIconFamilyEntry,
  materialSymbolsIconFamilyEntry,
  carbonIconFamilyEntry,
  iconoirIconFamilyEntry,
  phosphorIconFamilyEntry,
  fontAwesomeClassicIconFamilyEntry
] as const satisfies readonly IconFamilyCatalogEntry[];

export const interfaceIconFamilyCatalog = [
  ...interfaceIconFamilyOptions,
  sfSymbolsWebFallback
] as const satisfies readonly IconFamilyCatalogItem[];
