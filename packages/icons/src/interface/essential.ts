import type { IconName } from './canonical.ts';

/**
 * Global concepts used by Kiskadee components for their built-in affordances.
 *
 * If this catalog grows beyond 16 concepts, review subpath exports, tree-shaking,
 * and lazy loading before adding more entries.
 */
export type EssentialIconName =
  | 'check'
  | 'radio-selected'
  | 'chevron-down'
  | 'chevron-up'
  | 'chevron-left'
  | 'chevron-end'
  | 'close';

export type EssentialIconMap = Partial<Record<EssentialIconName, IconName>>;

export const DEFAULT_ESSENTIAL_ICONS = Object.freeze({
  check: 'check',
  'radio-selected': 'radio-selected',
  'chevron-down': 'chevron-down',
  'chevron-up': 'chevron-up',
  'chevron-left': 'chevron-left',
  'chevron-end': 'chevron-end',
  close: 'close'
}) satisfies Readonly<Record<EssentialIconName, IconName>>;
