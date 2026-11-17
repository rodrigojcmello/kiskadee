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

export const COMPONENT_PALETTE_FORMAT_VERSION = 4;

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
export type CompactSurfaceMode = { sc?: CompactSurfaceMap; sr?: CompactSurfaceMap };
export type CompactPaletteConfig = {
  sc?: CompactSurfaceMap;
  cs?: CompactCanonicalSurface[];
  options?: Record<string, unknown>;
  variants?: Record<string, { modes: Record<string, CompactSurfaceMode> }>;
};

type CanonicalSurface = {
  intent: CardSurfaceIntent;
  emphasis: ComponentEmphasis;
  contentSurfaceContext: SurfaceContext;
  rest: string;
};
type DecodedSurfaceMode = {
  contentSurfaceContext?: ContentSurfaceContextMap;
  contentRegionSurfaceContext?: ContentSurfaceContextMap;
};

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

/** Decode the selected palette once, retaining the framework's existing full-address map. */
export function decodePaletteSurfaceConfig(
  value: unknown,
  segment: string,
  theme: string
): { options?: Record<string, unknown> } & DecodedSurfaceMode & {
    variants?: Record<string, { modes: Record<string, DecodedSurfaceMode> }>;
  } {
  if (value === undefined) return {};
  if (theme !== 'light' && theme !== 'dark' && theme !== 'darker')
    throw new Error(`Invalid palette theme "${theme}"`);
  const themeMode: ThemeMode = theme;
  const config = record(value);
  const wrap = (slice: unknown): ContentSurfaceContextMap => ({
    [segment]: { [themeMode]: decodeSurfaceContextSlice(slice) }
  });
  const options = config.options === undefined ? undefined : record(config.options);
  if (
    Object.keys(config).some((key) => !['sc', 'cs', 'variants', 'options'].includes(key)) ||
    (options && Object.hasOwn(options, 'canonicalSurfaces'))
  ) {
    throw new Error('Invalid palette surface configuration');
  }
  return {
    ...(config.sc === undefined ? {} : { contentSurfaceContext: wrap(config.sc) }),
    ...(options || config.cs !== undefined
      ? {
          options: {
            ...options,
            ...(config.cs !== undefined
              ? {
                  canonicalSurfaces: {
                    [segment]: { [themeMode]: decodeCanonicalSurfaces(config.cs) }
                  }
                }
              : {})
          }
        }
      : {}),
    ...(config.variants === undefined
      ? {}
      : {
          variants: Object.fromEntries(
            Object.entries(record(config.variants)).map(([variant, branch]) => [
              variant,
              {
                modes: Object.fromEntries(
                  Object.entries(record(record(branch).modes)).map(([mode, fields]) => {
                    const data = record(fields);
                    if (Object.keys(data).some((key) => key !== 'sc' && key !== 'sr'))
                      throw new Error('Invalid palette surface mode');
                    return [
                      mode,
                      {
                        ...(data.sc === undefined ? {} : { contentSurfaceContext: wrap(data.sc) }),
                        ...(data.sr === undefined
                          ? {}
                          : { contentRegionSurfaceContext: wrap(data.sr) })
                      }
                    ];
                  })
                )
              }
            ])
          )
        })
  };
}
