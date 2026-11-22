import type {
  CardSurfaceIntent,
  ComponentEmphasis,
  ContentSurfaceContextMap,
  ContentSurfaceContextStateMap,
  ContentSurfaceContextValue,
  ContentSurfaceContextVariants,
  SurfaceContext,
  ThemeMode
} from '@kiskadee/core';
import type { RegionSurface } from '@kiskadee/surface-builder/region-types';

export const COMPONENT_PALETTE_FORMAT_VERSION = 5;

export type { RegionSurface };
export type SurfaceRegions = Record<string, RegionSurface>;

type SurfaceSlice = Partial<Record<SurfaceContext, ContentSurfaceContextVariants>>;
type ContextCode = 's' | 'v';
type VariantCode = 's' | 'a';
type EmphasisCode = 'hh' | 'h' | 'm' | 'l' | 'll';
type OutputCode = ContextCode | 'i';
type StateCode = 'r' | 's' | 'p' | 'd';
export type CompactSurfaceMap = Partial<
  Record<
    ContextCode,
    Partial<
      Record<VariantCode, Record<string, Partial<Record<EmphasisCode, CompactSurfaceStates>>>>
    >
  >
>;
type CompactSurfaceStates = { r: OutputCode } & Partial<
  Record<Exclude<StateCode, 'r'>, OutputCode>
>;
export type CompactCanonicalSurface = readonly [
  intent: CardSurfaceIntent,
  emphasis: EmphasisCode,
  context: ContextCode,
  rest: string
];
type CompactAgainst = [
  ContextCode,
  VariantCode,
  string,
  EmphasisCode,
  StateCode,
  CompactSurfaceMap
];
type CompactRegion = CompactSurfaceMap | [CompactSurfaceMap, CompactAgainst[]];
export type CompactSurfaceMode = {
  sc?: CompactSurfaceMap | string;
  sr?: CompactSurfaceMap | string;
  g?: Record<string, CompactRegion>;
};
export type CompactPaletteConfig = CompactSurfaceMode & {
  cs?: CompactCanonicalSurface[];
  options?: Record<string, unknown>;
  variants?: Record<string, CompactSurfaceMode & { modes?: Record<string, CompactSurfaceMode> }>;
};

type CanonicalSurface = {
  intent: CardSurfaceIntent;
  emphasis: ComponentEmphasis;
  contentSurfaceContext: SurfaceContext;
  rest: string;
};
type DecodedSurfaceMode = {
  regions?: SurfaceRegions;
  contentSurfaceContext?: ContentSurfaceContextMap;
  contentRegionSurfaceContext?: ContentSurfaceContextMap;
};
type DecodedSurfaceVariant = DecodedSurfaceMode & { modes?: Record<string, DecodedSurfaceMode> };

const contexts = { s: 'onSubtle', v: 'onVivid' } as const;
const variants = { s: 'standard', a: 'alternative' } as const;
const emphases = { hh: 'highest', h: 'high', m: 'medium', l: 'low', ll: 'lowest' } as const;
const states = { r: 'rest', s: 'selected', p: 'pending', d: 'disabled' } as const;
const outputs = { ...contexts, i: 'inherit' } as const;
const intents: readonly CardSurfaceIntent[] = [
  'neutral',
  'primary',
  'support',
  'neutralComplementary',
  'primaryComplementary'
];

function codeFor<T extends Record<string, string>>(codes: T, value: string): keyof T {
  for (const key of Object.keys(codes)) {
    if (codes[key] === value) return key;
  }
  throw new Error(`Unknown surface value "${value}"`);
}

function codeValue<T extends Record<string, string>>(codes: T, value: unknown): T[keyof T] {
  if (typeof value === 'string' && Object.hasOwn(codes, value)) return codes[value] as T[keyof T];
  throw new Error(`Invalid compact surface code "${String(value)}"`);
}

function record(value: unknown): Record<string, unknown> {
  if (typeof value === 'object' && value !== null && !Array.isArray(value))
    return value as Record<string, unknown>;
  throw new Error('Invalid compact surface object');
}

export function encodeSurfaceContextSlice(slice: SurfaceSlice): CompactSurfaceMap {
  return Object.fromEntries(
    Object.entries(slice).map(([context, variantsForContext]) => [
      codeFor(contexts, context),
      Object.fromEntries(
        Object.entries(variantsForContext).map(([variant, intentsForVariant]) => [
          codeFor(variants, variant),
          Object.fromEntries(
            Object.entries(intentsForVariant).map(([intent, emphasesForIntent]) => [
              intent,
              Object.fromEntries(
                Object.entries(emphasesForIntent ?? {}).map(([emphasis, stateMap]) => [
                  codeFor(emphases, emphasis),
                  Object.fromEntries(
                    Object.entries(stateMap ?? {}).map(([state, output]) => [
                      codeFor(states, state),
                      codeFor(outputs, output)
                    ])
                  )
                ])
              )
            ])
          )
        ])
      )
    ])
  );
}

export function encodeCanonicalSurfaces(
  entries: readonly CanonicalSurface[]
): CompactCanonicalSurface[] {
  return entries.map(({ intent, emphasis, contentSurfaceContext, rest }) => [
    intent,
    codeFor(emphases, emphasis),
    codeFor(contexts, contentSurfaceContext),
    rest
  ]);
}

function decodeSurfaceContextSlice(value: unknown): SurfaceSlice {
  return Object.fromEntries(
    Object.entries(record(value)).map(([context, variantsForContext]) => {
      const variantRecord = record(variantsForContext);
      if (!Object.hasOwn(variantRecord, 's')) throw new Error('Missing Standard surface map');
      return [
        codeValue(contexts, context),
        Object.fromEntries(
          Object.entries(variantRecord).map(([variant, intentsForVariant]) => [
            codeValue(variants, variant),
            Object.fromEntries(
              Object.entries(record(intentsForVariant)).map(([intent, emphasesForIntent]) => [
                intent,
                Object.fromEntries(
                  Object.entries(record(emphasesForIntent)).map(([emphasis, stateMap]) => [
                    codeValue(emphases, emphasis),
                    decodeSurfaceStates(stateMap)
                  ])
                )
              ])
            )
          ])
        )
      ];
    })
  );
}

function decodeSurfaceStates(value: unknown): ContentSurfaceContextStateMap {
  const compact = record(value);
  return {
    ...Object.fromEntries(
      Object.entries(compact).map(([state, output]) => [
        codeValue(states, state),
        codeValue(outputs, output)
      ])
    ),
    rest: codeValue(outputs, compact.r) satisfies ContentSurfaceContextValue
  };
}

function decodeCanonicalSurfaces(value: unknown): CanonicalSurface[] {
  if (!Array.isArray(value)) throw new Error('Invalid compact canonical surfaces');
  return value.map((entry: unknown) => {
    if (
      !Array.isArray(entry) ||
      entry.length !== 4 ||
      !intents.some((intent) => intent === entry[0]) ||
      typeof entry[3] !== 'string' ||
      !entry[3].trim()
    ) {
      throw new Error('Invalid compact canonical surface');
    }
    const [intent, emphasis, context, rest] = entry;
    return {
      intent,
      emphasis: codeValue(emphases, emphasis),
      contentSurfaceContext: codeValue(contexts, context),
      rest
    };
  });
}

/** Encode only the current palette, including parent coordinates that affect its output. */
export function encodeRegionSlice(
  regions: SurfaceRegions | undefined,
  segment: string,
  theme: ThemeMode
): CompactSurfaceMode['g'] {
  const encoded: Record<string, CompactRegion> = {};
  for (const [element, region] of Object.entries(regions ?? {})) {
    const slice = region.output[segment]?.[theme];
    if (!slice) continue;
    const output = encodeSurfaceContextSlice(slice);
    const overrides: CompactAgainst[] = [];
    for (const [parentKey, map] of Object.entries(region.against ?? {})) {
      const override = map[segment]?.[theme];
      if (!override) continue;
      const [context, variant, intent, emphasis, state] = JSON.parse(parentKey);
      overrides.push([
        codeFor(contexts, context),
        codeFor(variants, variant),
        intent,
        codeFor(emphases, emphasis),
        codeFor(states, state),
        encodeSurfaceContextSlice(override)
      ]);
    }
    encoded[element] = overrides.length ? [output, overrides] : output;
  }
  return Object.keys(encoded).length ? encoded : undefined;
}

function checkKeys(fields: Record<string, unknown>, allowed: readonly string[]) {
  if (Object.keys(fields).some((key) => !allowed.includes(key)))
    throw new Error('Invalid palette surface configuration');
}

function decodeBranch(
  fields: Record<string, unknown>,
  wrap: (slice: unknown) => ContentSurfaceContextMap
): DecodedSurfaceMode {
  let regions: SurfaceRegions | undefined;
  if (fields.g !== undefined) {
    regions = Object.fromEntries(
      Object.entries(record(fields.g)).map(([element, entry]) => {
        if (!/^e[1-9]\d*$/.test(element)) throw new Error('Invalid surface region element');
        if (!Array.isArray(entry)) return [element, { output: wrap(entry) }];
        if (entry.length !== 2 || !Array.isArray(entry[1]) || !entry[1].length)
          throw new Error('Invalid parent surface overrides');
        const against: Record<string, ContentSurfaceContextMap> = {};
        for (const row of entry[1]) {
          if (!Array.isArray(row) || row.length !== 6 || typeof row[2] !== 'string' || !row[2])
            throw new Error('Invalid parent surface coordinate');
          const key = JSON.stringify([
            codeValue(contexts, row[0]),
            codeValue(variants, row[1]),
            row[2],
            codeValue(emphases, row[3]),
            codeValue(states, row[4])
          ]);
          if (Object.hasOwn(against, key)) throw new Error('Duplicate parent surface coordinate');
          against[key] = wrap(row[5]);
        }
        return [element, { output: wrap(entry[0]), against }];
      })
    );
  }
  const resolve = (value: unknown): ContentSurfaceContextMap => {
    if (typeof value !== 'string') return wrap(value);
    if (!regions || !Object.hasOwn(regions, value)) throw new Error('Unknown surface region alias');
    return regions[value].output;
  };
  return {
    ...(regions && { regions }),
    ...(fields.sc !== undefined && { contentSurfaceContext: resolve(fields.sc) }),
    ...(fields.sr !== undefined && { contentRegionSurfaceContext: resolve(fields.sr) })
  };
}

/** Decode the selected palette once, retaining the framework's existing full-address map. */
export function decodePaletteSurfaceConfig(
  value: unknown,
  segment: string,
  theme: string
): { options?: Record<string, unknown> } & DecodedSurfaceMode & {
    variants?: Record<string, DecodedSurfaceVariant>;
  } {
  if (value === undefined) return {};
  if (theme !== 'light' && theme !== 'dark' && theme !== 'darker')
    throw new Error(`Invalid palette theme "${theme}"`);
  const config = record(value);
  const wrap = (slice: unknown): ContentSurfaceContextMap => ({
    [segment]: { [theme]: decodeSurfaceContextSlice(slice) }
  });
  checkKeys(config, ['sc', 'sr', 'g', 'cs', 'variants', 'options']);
  const options = config.options === undefined ? undefined : record(config.options);
  if (options && Object.hasOwn(options, 'canonicalSurfaces'))
    throw new Error('Invalid palette surface configuration');
  const result: ReturnType<typeof decodePaletteSurfaceConfig> = decodeBranch(config, wrap);
  if (options || config.cs !== undefined) {
    result.options = {
      ...options,
      ...(config.cs !== undefined && {
        canonicalSurfaces: { [segment]: { [theme]: decodeCanonicalSurfaces(config.cs) } }
      })
    };
  }
  if (config.variants !== undefined) {
    result.variants = Object.fromEntries(
      Object.entries(record(config.variants)).map(([name, branch]) => {
        const fields = record(branch);
        checkKeys(fields, ['sc', 'sr', 'g', 'modes']);
        const variant: DecodedSurfaceVariant = decodeBranch(fields, wrap);
        if (fields.modes !== undefined) {
          variant.modes = Object.fromEntries(
            Object.entries(record(fields.modes)).map(([mode, entry]) => {
              const data = record(entry);
              checkKeys(data, ['sc', 'sr', 'g']);
              return [mode, decodeBranch(data, wrap)];
            })
          );
        }
        return [name, variant];
      })
    );
  }
  return result;
}
