import {
  ButtonIntentKeys,
  type ColorSchema,
  type ColorValue,
  type ComponentEmphasis,
  type ContainerIntent,
  ContainerIntentKeys,
  type ContentSurfaceContextIntentMap,
  type ContentSurfaceContextMap,
  type ContentSurfaceContextStateMap,
  type ContentSurfaceContextValue,
  type ContentSurfaceContextVariants,
  componentEmphasisBuckets,
  isButtonDerivedContentSurfaceContext,
  normalizeHexColor,
  resolveContentSurfaceContextVariant,
  type Schema,
  type SurfaceContext,
  type SystemButtonIntent,
  surfaceContexts,
  type ThemeMode
} from '@kiskadee/core';
import { contrastRatio } from '@kiskadee/tonal-scale';
import {
  collectAlternativePaletteScopes,
  type ElementPaletteSource,
  resolveElementPaletteSources
} from './palettes/resolveElementPaletteSources.ts';

const buttonIntents = Object.keys(ButtonIntentKeys) as SystemButtonIntent[];
const containerIntents = Object.keys(ContainerIntentKeys) as ContainerIntent[];
const emphases = Object.keys(componentEmphasisBuckets) as ComponentEmphasis[];
const contrastReferenceByTheme = {
  light: '#ffffff',
  dark: '#000000',
  darker: '#000000'
} satisfies Record<ThemeMode, string>;
const themeModes = Object.keys(contrastReferenceByTheme) as ThemeMode[];

type SurfaceOwner = 'button' | 'container' | 'card';
type SurfaceIntent = ContainerIntent | SystemButtonIntent;

export function requireHex(value: unknown, path: string): string {
  if (typeof value === 'string') {
    try {
      return normalizeHexColor(value);
    } catch {
      // The diagnostic below identifies the recipe address.
    }
  }
  throw new Error(`[surface-builder] ${path}: expected a resolved HEX surface color.`);
}

function alphaOf(hex: string): number {
  return hex.length === 9 ? Number.parseInt(hex.slice(7), 16) / 255 : 1;
}

function composite(hex: string, backdrop: string, alpha: number): string {
  return `#${[1, 3, 5]
    .map((offset) => {
      const source = Number.parseInt(hex.slice(offset, offset + 2), 16);
      const background = Number.parseInt(backdrop.slice(offset, offset + 2), 16);
      return Math.round(source * alpha + background * (1 - alpha))
        .toString(16)
        .padStart(2, '0');
    })
    .join('')}`;
}

function resolvePaint(value: ColorValue | undefined): ColorValue | undefined {
  return value && typeof value === 'object' && 'ref' in value ? value.ref : value;
}

function classifyPaint(
  value: ColorValue | undefined,
  backdrop: string,
  contrastReference: string,
  path: string
): ContentSurfaceContextValue {
  if (value === undefined || (typeof value === 'string' && /^transparent$/i.test(value.trim()))) {
    return 'inherit';
  }
  const hex = requireHex(value, path);
  const alpha = alphaOf(hex);
  if (alpha === 0) return 'inherit';
  const opaque = alpha === 1 ? hex.slice(0, 7) : composite(hex, backdrop, alpha);
  return contrastRatio(opaque, contrastReference) >= 3 ? 'onVivid' : 'onSubtle';
}

function deriveVariant<TIntent extends SurfaceIntent>({
  palette,
  backdrop,
  contrastReference,
  path,
  owner,
  intents,
  inheritedRest
}: {
  palette: ColorSchema;
  backdrop: string;
  contrastReference: string;
  path: string;
  owner: SurfaceOwner;
  intents: readonly TIntent[];
  inheritedRest?: ContentSurfaceContextIntentMap<TIntent>;
}): ContentSurfaceContextIntentMap<TIntent> {
  const output: ContentSurfaceContextIntentMap<TIntent> = {};
  for (const intent of intents) {
    for (const emphasis of emphases) {
      const recipe = palette.boxColor?.[intent]?.[emphasis];
      if (
        !recipe &&
        (owner !== 'button' || !Object.values(palette).some((p) => p?.[intent]?.[emphasis]))
      ) {
        continue;
      }
      const recipePath = `${path}.boxColor.${intent}.${emphasis}`;
      const inherited = inheritedRest?.[intent]?.[emphasis]?.rest;
      if (owner === 'card' && inherited === undefined) {
        throw new Error(
          `[surface-builder] ${recipePath}.rest: inherited Container context is missing.`
        );
      }
      const rest =
        inherited ?? classifyPaint(recipe?.rest, backdrop, contrastReference, `${recipePath}.rest`);
      const states: ContentSurfaceContextStateMap = { rest };
      if (owner !== 'container') {
        for (const [state, paint] of [
          ['selected', recipe?.selected?.rest],
          ['pending', recipe?.pending],
          ['disabled', recipe?.disabled]
        ] as const) {
          const value = resolvePaint(paint);
          if (value === undefined) continue;
          const statePath = state === 'selected' ? 'selected.rest' : state;
          const context = classifyPaint(
            value,
            backdrop,
            contrastReference,
            `${recipePath}.${statePath}`
          );
          if (context !== rest) states[state] = context;
        }
      }
      output[intent] ??= {};
      output[intent][emphasis] = states;
    }
  }
  return output;
}

function resolveBackdrop(
  schema: Schema<string>,
  segment: string,
  theme: ThemeMode,
  context: SurfaceContext
): string {
  const container = schema.components.container;
  const path = `components.container.options.canonicalSurfaces.${segment}.${theme}`;
  const references = container?.options?.canonicalSurfaces?.[segment]?.[theme]?.filter(
    (entry) => entry.referenceFor === context
  );
  if (references?.length !== 1) {
    throw new Error(`[surface-builder] ${path}: expected exactly one referenceFor "${context}".`);
  }
  const { intent, emphasis } = references[0]!;
  const paintPath = `components.container.elements.e1.palettes.${segment}.${theme}.onSubtle.standard.boxColor.${intent}.${emphasis}.rest`;
  const hex = requireHex(
    container?.elements.e1.palettes?.[segment]?.[theme]?.onSubtle.standard.boxColor[intent]?.[
      emphasis
    ]?.rest,
    paintPath
  );
  if (alphaOf(hex) !== 1) {
    throw new Error(`[surface-builder] ${paintPath}: canonical surface reference must be opaque.`);
  }
  return hex.slice(0, 7);
}

function deriveSurfaceContext<TIntent extends SurfaceIntent>(
  schema: Schema<string>,
  owner: SurfaceOwner,
  intents: readonly TIntent[],
  inheritedRest?: ContentSurfaceContextMap<TIntent>
): ContentSurfaceContextMap<TIntent> {
  const component = schema.components[owner];
  const source = component?.elements.e1;
  if (!component || !source?.palettes) {
    throw new Error(
      `[surface-builder] components.${owner}.elements.e1.palettes: missing surface source.`
    );
  }
  const catalogs = {
    foregrounds: schema.global?.foregrounds,
    contours: schema.global?.contours,
    separators: schema.global?.separators
  };
  const alternativePaletteScopes = collectAlternativePaletteScopes(
    component.elements as Record<string, ElementPaletteSource | undefined>,
    catalogs,
    owner === 'button' ? ['e11', 'e12'] : []
  );
  const palettes = resolveElementPaletteSources(source, catalogs, {
    alternativePaletteScopes
  }).palettes;
  const result: ContentSurfaceContextMap<TIntent> = {};
  for (const [segment, themes] of Object.entries(palettes ?? {})) {
    for (const theme of themeModes) {
      const contexts = themes?.[theme];
      if (!contexts) continue;
      const contrastReference = contrastReferenceByTheme[theme];
      const backdrops = {
        onSubtle: resolveBackdrop(schema, segment, theme, 'onSubtle'),
        onVivid: resolveBackdrop(schema, segment, theme, 'onVivid')
      };
      const outputs: Partial<Record<SurfaceContext, ContentSurfaceContextVariants<TIntent>>> = {};
      for (const context of surfaceContexts) {
        const variants = contexts[context];
        if (!variants) continue;
        const restVariants = inheritedRest?.[segment]?.[theme]?.[context];
        const derive = (variant: 'standard' | 'alternative', palette: ColorSchema) =>
          deriveVariant({
            owner,
            intents,
            palette,
            backdrop: backdrops[context],
            contrastReference,
            path: `components.${owner}.elements.e1.palettes.${segment}.${theme}.${context}.${variant}`,
            inheritedRest:
              restVariants && resolveContentSurfaceContextVariant(restVariants, variant)
          });
        outputs[context] = {
          standard: derive('standard', variants.standard),
          ...(variants.alternative && { alternative: derive('alternative', variants.alternative) })
        };
      }
      result[segment] ??= {};
      result[segment][theme] = outputs;
    }
  }
  return result;
}

export function resolveButtonContentSurfaceContext(
  schema: Schema<string>
): ContentSurfaceContextMap<SystemButtonIntent> | undefined {
  const declared = schema.components?.button?.contentSurfaceContext;
  return isButtonDerivedContentSurfaceContext(declared)
    ? deriveSurfaceContext(schema, 'button', buttonIntents)
    : declared;
}

export function deriveContainerSurfaceContext(
  schema: Schema<string>
): ContentSurfaceContextMap<ContainerIntent> {
  return deriveSurfaceContext(schema, 'container', containerIntents);
}

export function deriveCardSurfaceContext(
  schema: Schema<string>,
  restMap: ContentSurfaceContextMap<ContainerIntent>
): ContentSurfaceContextMap<ContainerIntent> {
  return deriveSurfaceContext(schema, 'card', containerIntents, restMap);
}
