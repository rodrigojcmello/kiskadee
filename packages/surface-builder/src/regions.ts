import {
  type Color,
  type ColorSchema,
  type ColorValue,
  type ColorVariant,
  type ComponentEmphasis,
  type ContentSurfaceContextMap,
  type ContentSurfaceContextStateMap,
  type ContentSurfaceContextValue,
  colorVariants,
  componentEmphasisBuckets,
  type ElementPalettes,
  type InteractionStateColorMap,
  isButtonDerivedContentSurfaceContext,
  normalizeHexColor,
  type Schema,
  type SurfaceContext,
  surfaceContexts,
  type ThemeMode
} from '@kiskadee/core';
import { contrastRatio } from '@kiskadee/tonal-scale';
import {
  collectAlternativePaletteScopes,
  type ElementPaletteSource,
  resolveElementPaletteSources
} from './palettes/resolveElementPaletteSources.ts';

import type { RegionSurface, SurfaceDiagnostic, SurfaceRegionBranch } from './region-types.ts';

type State = keyof ContentSurfaceContextStateMap;
type StableState = Exclude<State, 'rest'>;
type ConsideredStates = readonly StableState[];
type Recipe = InteractionStateColorMap;
// A fully transparent layer forwards the backing reference, so a chain of transparent
// regions never needs a canonical RGB until a nonzero partial-alpha paint uses it.
type BackdropColor = string | (() => string | undefined);
type Paint = { output: ContentSurfaceContextValue; rgb?: BackdropColor };
type Background = { surface: SurfaceContext; rgb?: BackdropColor };
type Coord = {
  segment: string;
  theme: ThemeMode;
  input: SurfaceContext;
  variant: ColorVariant;
  intent: string;
  emphasis: ComponentEmphasis;
};
type ParentSample = Coord & { state: State; background: Background };
type RegionSpec = {
  element: string;
  states?: ConsideredStates;
  parent?: string;
  /** Some physical layers select color against their shared host, others against the painted parent. */
  paintInput?: 'host' | 'subtle';
};

const statesForAction = ['selected', 'pending', 'disabled'] as const;
const statesForSelectable = ['selected', 'disabled'] as const;
const statesForDisabled = ['disabled'] as const;
const statesForSlider = ['pending', 'disabled'] as const;
const emphasisNames = Object.keys(componentEmphasisBuckets) as ComponentEmphasis[];
const themes: readonly ThemeMode[] = ['light', 'dark', 'darker'];

/** These IDs describe existing component anatomy. Their only inputs are preset paints and states. */
const anatomy: Record<string, readonly RegionSpec[]> = {
  button: [{ element: 'e1', states: statesForAction }],
  container: [{ element: 'e1' }],
  card: [{ element: 'e1', states: statesForAction }],
  chip: [
    { element: 'e2', states: statesForSelectable },
    { element: 'e5', states: statesForDisabled }
  ],
  badge: [{ element: 'e5' }],
  dropdown: [
    { element: 'e1', paintInput: 'subtle' },
    { element: 'e2', parent: 'e1', paintInput: 'subtle', states: statesForSelectable }
  ],
  bottomSheet: [
    { element: 'e2', paintInput: 'subtle' },
    { element: 'e7', parent: 'e2', paintInput: 'subtle', states: statesForSelectable }
  ],
  select: [
    { element: 'e3', states: statesForSelectable },
    { element: 'e4', parent: 'e3', paintInput: 'host', states: statesForSelectable }
  ],
  switch: [
    { element: 'e2', states: statesForAction },
    { element: 'e3', parent: 'e2', paintInput: 'host', states: statesForAction }
  ],
  slider: [
    { element: 'e10', states: statesForSlider },
    { element: 'e11', parent: 'e10', paintInput: 'host', states: statesForSlider },
    { element: 'e14', states: statesForSlider }
  ],
  textField: [
    { element: 'e3', states: statesForDisabled },
    { element: 'e8', parent: 'e3', states: statesForDisabled }
  ],
  tabs: [{ element: 'e1' }, { element: 'e2', parent: 'e1', states: ['selected'] }]
};

export const surfaceProducerNames = Object.keys(anatomy);

export function surfaceElementIds(component: string): string[] {
  return (anatomy[component] ?? []).map(({ element }) => element);
}

export function parentSurfaceElement(component: string, element: string): string | undefined {
  return anatomy[component]?.find((region) => region.element === element)?.parent;
}

export function usesSubtlePaint(component: string, element: string): boolean {
  return (
    anatomy[component]?.some(
      (region) => region.element === element && region.paintInput === 'subtle'
    ) ?? false
  );
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isLegacyMap(value: unknown): value is ContentSurfaceContextMap {
  return record(value) && !isButtonDerivedContentSurfaceContext(value);
}

const alphaOf = (hex: string) => (hex.length === 9 ? Number.parseInt(hex.slice(7), 16) / 255 : 1);

function mix(foreground: string, background: string, alpha: number): string {
  let result = '#';
  for (const offset of [1, 3, 5]) {
    const fg = Number.parseInt(foreground.slice(offset, offset + 2), 16);
    const bg = Number.parseInt(background.slice(offset, offset + 2), 16);
    result += Math.round(fg * alpha + bg * (1 - alpha))
      .toString(16)
      .padStart(2, '0');
  }
  return result;
}

function knownHex(value: string): string | undefined {
  if (value.trim().toLowerCase() === 'transparent') return '#00000000';
  if (/^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.test(value.trim()))
    return normalizeHexColor(value);
  return undefined;
}

function colorAt(value: ColorValue | undefined): Color | undefined {
  if (value && typeof value === 'object' && 'parentState' in value) return value.parentState;
  if (value && typeof value === 'object' && !('kind' in value)) return value.ref;
  return value;
}

function contrastContext(rgb: string, theme: ThemeMode): SurfaceContext {
  return contrastRatio(rgb, theme === 'light' ? '#ffffff' : '#000000') >= 3
    ? 'onVivid'
    : 'onSubtle';
}

function classify(
  value: Color | undefined,
  backing: Background,
  theme: ThemeMode,
  fallback: ContentSurfaceContextValue,
  diagnostic: (reason: string) => void
): Paint {
  if (value === undefined) return { output: 'inherit', rgb: backing.rgb };
  let hex: string | undefined;
  if (typeof value === 'string') hex = knownHex(value);
  else {
    // A uniform gradient has one identifiable background; differing stops need a spatial policy.
    const stops = value.stops.map((stop) => knownHex(stop.color));
    if (stops.length && stops.every((stop) => stop && alphaOf(stop) === 0)) {
      return { output: 'inherit', rgb: backing.rgb };
    }
    if (stops.length && stops.every((stop) => stop === stops[0])) hex = stops[0];
    else if (
      stops.length &&
      stops.every((stop): stop is string =>
        Boolean(
          stop &&
            alphaOf(stop) === 1 &&
            stop.slice(1, 3) === stop.slice(3, 5) &&
            stop.slice(3, 5) === stop.slice(5, 7)
        )
      )
    ) {
      // On the opaque neutral axis every interpolated color lies between the darkest and
      // lightest stops. We know the semantic result, but cannot provide a single RGB to a child.
      const outputs = stops.map((stop) => contrastContext(stop, theme));
      if (outputs.every((output) => output === outputs[0])) return { output: outputs[0]! };
    }
  }
  if (!hex) {
    diagnostic(typeof value === 'string' ? 'runtime-color' : 'mixed-gradient');
    return { output: fallback };
  }
  const alpha = alphaOf(hex);
  if (alpha === 0) return { output: 'inherit', rgb: backing.rgb };
  if (alpha === 1) {
    const rgb = hex.slice(0, 7);
    return { output: contrastContext(rgb, theme), rgb };
  }
  const backdropRgb = typeof backing.rgb === 'function' ? backing.rgb() : backing.rgb;
  if (!backdropRgb) {
    diagnostic('missing-opaque-background');
    return { output: fallback };
  }
  const rgb = mix(hex, backdropRgb, alpha);
  return { output: contrastContext(rgb, theme), rgb };
}

function backdrop(
  schema: Schema<string>,
  segment: string,
  theme: ThemeMode,
  input: SurfaceContext
): string | undefined {
  const container = schema.components.container;
  if (!container && input === 'onSubtle') {
    const canvas = schema.themeTokens?.palettes?.[segment]?.[theme]?.background;
    const hex = canvas && knownHex(canvas);
    return hex && alphaOf(hex) === 1 ? hex.slice(0, 7) : undefined;
  }
  const catalog = container?.options?.canonicalSurfaces?.[segment]?.[theme];
  const entries = catalog?.filter((entry) => entry.referenceFor === input);
  if (entries?.length !== 1) return undefined;
  const entry = entries[0]!;
  const value =
    container?.elements.e1.palettes?.[segment]?.[theme]?.onSubtle.standard.boxColor[entry.intent]?.[
      entry.emphasis
    ]?.rest;
  const hex = typeof value === 'string' ? knownHex(value) : undefined;
  return hex && alphaOf(hex) === 1 ? hex.slice(0, 7) : undefined;
}

function getLeaf(
  map: ContentSurfaceContextMap | undefined,
  coord: Coord
): ContentSurfaceContextStateMap | undefined {
  return map?.[coord.segment]?.[coord.theme]?.[coord.input]?.[coord.variant]?.[coord.intent]?.[
    coord.emphasis
  ];
}

function setLeaf(map: ContentSurfaceContextMap, coord: Coord, leaf: ContentSurfaceContextStateMap) {
  map[coord.segment] ??= {};
  const segment = map[coord.segment]!;
  segment[coord.theme] ??= {};
  const theme = segment[coord.theme]!;
  theme[coord.input] ??= { standard: {} };
  const context = theme[coord.input]!;
  context[coord.variant] ??= {};
  const variant = context[coord.variant]!;
  variant[coord.intent] ??= {};
  variant[coord.intent]![coord.emphasis] = leaf;
}

function addUnpaintedLegacyCoordinates(
  output: ContentSurfaceContextMap,
  legacy: ContentSurfaceContextMap | undefined
) {
  for (const [segment, modes] of Object.entries(legacy ?? {}))
    for (const theme of themes)
      for (const input of surfaceContexts)
        for (const variant of colorVariants)
          for (const [intent, levels] of Object.entries(modes?.[theme]?.[input]?.[variant] ?? {}))
            for (const emphasis of emphasisNames) {
              const coord = { segment, theme, input, variant, intent, emphasis };
              if (levels?.[emphasis] && !getLeaf(output, coord))
                setLeaf(output, coord, { rest: 'inherit' });
            }
}

function coordinatePairs(
  palettes: readonly (ColorSchema | undefined)[]
): Map<string, Set<ComponentEmphasis>> {
  const pairs = new Map<string, Set<ComponentEmphasis>>();
  for (const palette of palettes)
    for (const property of Object.values(palette ?? {})) {
      for (const [intent, levels] of Object.entries(property ?? {})) {
        if (!record(levels)) continue;
        for (const emphasis of emphasisNames) {
          if (!record(levels[emphasis])) continue;
          if (!pairs.has(intent)) pairs.set(intent, new Set());
          pairs.get(intent)!.add(emphasis);
        }
      }
    }
  return pairs;
}

function recipeAt(
  palette: ColorSchema | undefined,
  intent: string,
  emphasis: ComponentEmphasis,
  property: keyof ColorSchema = 'boxColor'
): Recipe | undefined {
  const boxes = palette?.[property] as
    | Record<string, Partial<Record<ComponentEmphasis, Recipe>>>
    | undefined;
  return boxes?.[intent]?.[emphasis];
}

function effectivePaint(recipe: Recipe | undefined, state: State) {
  const rest = colorAt(recipe?.rest);
  if (state === 'rest') return rest;
  return colorAt(state === 'selected' ? recipe?.selected?.rest : recipe?.[state]) ?? rest;
}

function parentKey(parent: ParentSample) {
  return JSON.stringify([
    parent.input,
    parent.variant,
    parent.intent,
    parent.emphasis,
    parent.state
  ]);
}

function resolvedBackground(paint: Paint, input: SurfaceContext): Background {
  return { surface: paint.output === 'inherit' ? input : paint.output, rgb: paint.rgb };
}

function sameLeaf(a: ContentSurfaceContextStateMap, b: ContentSurfaceContextStateMap) {
  return (
    a.rest === b.rest &&
    a.selected === b.selected &&
    a.pending === b.pending &&
    a.disabled === b.disabled
  );
}

type CompilerBranch = {
  elements?: Record<string, ElementPaletteSource | undefined>;
  contentSurfaceContext?: unknown;
  contentRegionSurfaceContext?: unknown;
  variants?: Record<string, CompilerBranch>;
  modes?: Record<string, CompilerBranch>;
};

type CompileEnvironment = {
  component: string;
  background: (segment: string, theme: ThemeMode, input: SurfaceContext) => Background;
  register: (path: string, reason: string) => void;
};
type Layer = {
  spec: RegionSpec;
  path: string;
  colors: ElementPalettes<string>;
  legacy?: ContentSurfaceContextMap;
  overlay?: ElementPalettes<string>;
  replaceWithOverlay: boolean;
  property: keyof ColorSchema;
  hasChildren: boolean;
};

function* coordinates(
  palettes: readonly (ColorSchema | undefined)[],
  segment: string,
  theme: ThemeMode,
  input: SurfaceContext,
  variant: ColorVariant
) {
  for (const [intent, levels] of coordinatePairs(palettes))
    for (const emphasis of levels) yield { segment, theme, input, variant, intent, emphasis };
}

function classifyLeaf(
  env: CompileEnvironment,
  layer: Layer,
  coord: Coord,
  paintInput: SurfaceContext,
  bg: Background,
  palette: ColorSchema,
  samples: ParentSample[],
  parent?: ParentSample
): ContentSurfaceContextStateMap {
  const { segment, theme, input, variant, intent, emphasis } = coord;
  const recipe = recipeAt(palette, intent, emphasis, layer.property);
  const legacyLeaf = getLeaf(layer.legacy, coord);
  const states: ContentSurfaceContextStateMap = { rest: 'inherit' };
  const changes =
    env.component === 'card' && intent.endsWith('Complementary') ? [] : (layer.spec.states ?? []);
  for (const state of ['rest', ...changes] as State[]) {
    const location = [
      layer.path,
      'palettes',
      segment,
      theme,
      paintInput,
      variant,
      layer.property,
      intent,
      emphasis,
      state
    ].join('.');
    const diagnostic = (reason: string) =>
      env.register(parent ? `${location}.over.${parentKey(parent)}` : location, reason);
    const fallback = legacyLeaf?.[state] ?? legacyLeaf?.rest ?? 'inherit';
    const base = effectivePaint(recipe, state);
    let classified: Paint;
    if (state === 'selected' && layer.overlay) {
      const overlay = recipeAt(
        layer.overlay[segment]?.[theme]?.[paintInput]?.[variant],
        intent,
        emphasis
      );
      const shell = classify(effectivePaint(overlay, 'rest'), bg, theme, fallback, diagnostic);
      const tab = layer.replaceWithOverlay
        ? shell
        : classify(base, resolvedBackground(shell, input), theme, fallback, diagnostic);
      classified = tab.output === 'inherit' ? shell : tab;
    } else classified = classify(base, bg, theme, fallback, diagnostic);
    if (state === 'rest' || classified.output !== states.rest) states[state] = classified.output;
    if (layer.hasChildren)
      samples.push({ ...coord, state, background: resolvedBackground(classified, input) });
  }
  return states;
}

function compileLayer(env: CompileEnvironment, layer: Layer, parents: readonly ParentSample[]) {
  const surface: RegionSurface = { output: {} };
  const samples: ParentSample[] = [];
  for (const [segment, palettes] of Object.entries(layer.colors)) {
    for (const theme of themes) {
      if (!palettes?.[theme]) continue;
      for (const input of surfaceContexts) {
        const backingSamples = parents.filter(
          (p) => p.segment === segment && p.theme === theme && p.background.surface === input
        );
        for (const parent of [undefined, ...backingSamples]) {
          const bg = parent?.background ?? env.background(segment, theme, input);
          const paintInput =
            layer.spec.paintInput === 'subtle'
              ? 'onSubtle'
              : layer.spec.paintInput === 'host' && parent
                ? parent.input
                : input;
          for (const variant of colorVariants) {
            const palette = palettes[theme][paintInput]?.[variant];
            // The default is always the canonical host (also covers an unpainted/missing
            // parent recipe). Exceptions are keyed only by observed parent coordinates.
            const baselinePalette =
              layer.spec.paintInput === 'subtle'
                ? palettes[theme].onSubtle[variant]
                : palettes[theme][input]?.[variant];
            const sources =
              parent && baselinePalette !== palette ? [palette, baselinePalette] : [palette];
            for (const coord of coordinates(sources, segment, theme, input, variant)) {
              const leaf = classifyLeaf(
                env,
                layer,
                coord,
                paintInput,
                bg,
                palette ?? {},
                samples,
                parent
              );
              if (!parent) {
                setLeaf(surface.output, coord, leaf);
                continue;
              }
              const baseline = getLeaf(surface.output, coord) ?? { rest: 'inherit' };
              if (!sameLeaf(baseline, leaf)) {
                if (!getLeaf(surface.output, coord)) setLeaf(surface.output, coord, baseline);
                surface.against ??= {};
                const key = parentKey(parent);
                surface.against[key] ??= {};
                setLeaf(surface.against[key], coord, leaf);
              }
            }
          }
        }
      }
    }
  }
  return { surface, samples };
}

export function compileSurfaceRegions(
  schema: Schema<string>,
  component: string,
  diagnostics: SurfaceDiagnostic[]
): SurfaceRegionBranch {
  const root = schema.components[component as keyof Schema['components']] as
    | CompilerBranch
    | undefined;
  const seen = new Set<string>();
  const cache = new Map<string, string | undefined>();
  const env: CompileEnvironment = {
    component,
    register(path, reason) {
      if (seen.has(path)) return;
      seen.add(path);
      diagnostics.push({ path, reason });
    },
    background(segment, theme, input) {
      return {
        surface: input,
        rgb: () => {
          const key = JSON.stringify([segment, theme, input]);
          if (!cache.has(key)) cache.set(key, backdrop(schema, segment, theme, input));
          return cache.get(key);
        }
      };
    }
  };
  function compile(
    branch: CompilerBranch,
    path: string,
    variantName?: string
  ): SurfaceRegionBranch {
    const result: SurfaceRegionBranch = {};
    for (const kind of ['variants', 'modes'] as const) {
      for (const [name, child] of Object.entries(branch[kind] ?? {})) {
        const output = compile(
          child,
          `${path}.${kind}.${name}`,
          kind === 'variants' ? name : variantName
        );
        if (Object.keys(output).length) {
          result[kind] ??= {};
          result[kind][name] = output;
        }
      }
    }
    if (!branch.elements) return result;
    const catalogs = {
      contours: schema.global?.contours,
      foregrounds: schema.global?.foregrounds,
      separators: schema.global?.separators
    };
    const scopes = collectAlternativePaletteScopes(
      branch.elements,
      catalogs,
      component === 'button' ? ['e11', 'e12'] : []
    );
    const palettes = (element: string) => {
      const source = branch.elements?.[element];
      return (
        source &&
        resolveElementPaletteSources(source, catalogs, { alternativePaletteScopes: scopes })
          .palettes
      );
    };
    const samples = new Map<string, ParentSample[]>();
    const regions = anatomy[component] ?? [];
    for (const spec of regions) {
      if (!branch.elements[spec.element]) continue;
      const colors = palettes(spec.element);
      const hasOverlay =
        component === 'tabs' &&
        spec.element === 'e2' &&
        ['box', 'segmented', 'bridge'].includes(variantName ?? '');
      const prior = spec.parent ? branch.contentRegionSurfaceContext : branch.contentSurfaceContext;
      const layer: Layer = {
        spec,
        colors: colors ?? {},
        path: `${path}.elements.${spec.element}`,
        hasChildren: regions.some((child) => child.parent === spec.element),
        legacy:
          isLegacyMap(prior) && !(component === 'chip' && spec.element === 'e5')
            ? prior
            : undefined,
        overlay: hasOverlay ? palettes('e5') : undefined,
        property:
          component === 'tabs' && variantName === 'segmented' && spec.element === 'e1'
            ? 'borderColor'
            : 'boxColor',
        replaceWithOverlay: variantName === 'bridge'
      };
      const built = compileLayer(env, layer, spec.parent ? (samples.get(spec.parent) ?? []) : []);
      // Manual input may include coordinates with only geometry. Such a region has no
      // effective background, so it now passes its input on to its children.
      addUnpaintedLegacyCoordinates(built.surface.output, layer.legacy);
      if (Object.keys(built.surface.output).length) {
        result.regions ??= {};
        result.regions[spec.element] = built.surface;
      }
      samples.set(spec.element, built.samples);
    }
    return result;
  }
  return root ? compile(root, `components.${component}`) : {};
}
