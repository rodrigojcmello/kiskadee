import type { CoreTonalFamilyId } from './tonal-system-contract.ts';

export const FIXED_FAMILY_REFERENCE_SET = 'kiskadee-munsell-reference-v1' as const;

/**
 * Controlled source colors used to evaluate the harmony stage independently
 * from primary-derived family generation.
 */
export const FIXED_FAMILY_SEEDS_V1 = {
  'red.v1': '#d13438',
  'yellow-red.v1': '#ca5010',
  'yellow-red.v2': '#8e562e',
  'yellow.v1': '#ffb900',
  'green-yellow.v1': '#7fba00',
  'green.v1': '#107c10',
  'blue-green.v1': '#038387',
  'blue.v1': '#0f6cbd',
  'purple-blue.v1': '#4f6bed',
  'purple.v1': '#8764b8',
  'red-purple.v1': '#e3008c',
  'black.v1': '#20252b'
} as const satisfies Record<CoreTonalFamilyId, string>;
