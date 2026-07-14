import type { CoreTonalFamilyId } from './tonal-system-contract.ts';

export const FIXED_FAMILY_REFERENCE_SET = 'kiskadee-munsell-reference-v1' as const;

/**
 * Controlled source colors used to evaluate the harmony stage independently
 * from primary-derived family generation.
 */
export const FIXED_FAMILY_SEEDS_V1 = {
  'r.red.v1': '#d13438',
  'yr.orange.v1': '#ca5010',
  'yr.brown.v1': '#8e562e',
  'y.yellow.v1': '#ffb900',
  'gy.lime.v1': '#7fba00',
  'g.green.v1': '#107c10',
  'bg.teal.v1': '#038387',
  'b.blue.v1': '#0f6cbd',
  'pb.indigo.v1': '#4f6bed',
  'p.purple.v1': '#8764b8',
  'rp.magenta.v1': '#e3008c',
  'n.black.v1': '#20252b'
} as const satisfies Record<CoreTonalFamilyId, string>;
