import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type {
  ComponentClassNameMapSplitJSON,
  ComponentName,
  GlobalSemanticsBySegment,
  GlobalSemanticsByTheme,
  KiskadeeCssScale,
  KiskadeeHexScale,
  Schema,
  SchemaColors,
  SchemaFonts,
  SchemaIcons,
  SurfaceContext,
  ThemeMode
} from '@kiskadee/core';
import {
  assertKiskadeeCssScale,
  assertKiskadeeHexScale,
  assertPrimitiveFunctionalReferences,
  normalizeHexColor
} from '@kiskadee/core';
import {
  buildCardComponentArtifact,
  CARD_COMPONENT_ARTIFACT_PATH
} from '../component-artifacts/cardComponentArtifact.ts';
import {
  getComponentCoreClassMapArtifactPath,
  getComponentPaletteClassMapArtifactPath
} from '../component-artifacts/componentClassMapArtifacts.ts';
import {
  buildSliderComponentArtifact,
  SLIDER_COMPONENT_ARTIFACT_PATH
} from '../component-artifacts/sliderComponentArtifact.ts';
import {
  buildSwitchComponentArtifact,
  SWITCH_COMPONENT_ARTIFACT_PATH
} from '../component-artifacts/switchComponentArtifact.ts';
import {
  buildTabsComponentArtifact,
  TABS_COMPONENT_ARTIFACT_PATH
} from '../component-artifacts/tabsComponentArtifact.ts';
import {
  buildTextFieldComponentArtifact,
  TEXT_FIELD_COMPONENT_ARTIFACT_PATH
} from '../component-artifacts/textFieldComponentArtifact.ts';
import type {
  Manifest,
  ManifestComponent,
  ManifestComponentState,
  ManifestFonts,
  ManifestIcons
} from './manifestTypes.ts';

function majorVersionFromTuple(v: [number, number, number] | number[]): number {
  return Array.isArray(v) && v.length > 0 ? Number(v[0]) : 0;
}

function requireSegmentRegistry(colors: SchemaColors | undefined): GlobalSemanticsBySegment {
  const bySegment = colors?.globalSemanticsBySegment as GlobalSemanticsBySegment | undefined;
  if (!bySegment || typeof bySegment !== 'object') {
    throw new Error(
      '[web-builder] Schema is missing `colors.globalSemanticsBySegment` segment registry'
    );
  }
  return bySegment;
}

function requireGlobalSemantics(colors: SchemaColors | undefined): GlobalSemanticsByTheme {
  const gs = colors?.globalSemantics as GlobalSemanticsByTheme | undefined;
  if (!gs || typeof gs !== 'object') {
    throw new Error('[web-builder] Schema is missing `colors.globalSemantics`');
  }
  return gs;
}

/**
 * Build-time segment metadata artifact.
 *
 * Even though the runtime resolver supports inheritance (segment overrides fall back to
 * `colors.globalSemantics`), artifacts should be explicit. Therefore we materialize `themes`
 * for every segment (including `default`) by merging the global baseline with per-segment overrides.
 */
function materializeSegmentThemesArtifact(
  colors: SchemaColors | undefined,
  bySegment: GlobalSemanticsBySegment,
  themesBySegment: Record<string, string[]> = {}
): Record<string, unknown> {
  const globalSemantics = requireGlobalSemantics(colors);

  const out: Record<string, unknown> = {};

  for (const segmentKey of Object.keys(bySegment)) {
    const entry = bySegment[segmentKey as keyof typeof bySegment];
    if (!entry) continue;

    const themes: Record<string, unknown> = {};
    const themeNames = new Set([
      ...Object.keys(globalSemantics),
      ...Object.keys((entry as any)?.themes ?? {}),
      ...(themesBySegment[segmentKey] ?? [])
    ]);
    for (const themeName of themeNames) {
      const fallbackThemeName = themeName === 'darker' ? 'dark' : themeName;
      const base =
        (globalSemantics as any)[themeName] ?? (globalSemantics as any)[fallbackThemeName] ?? {};
      const override =
        (entry as any)?.themes?.[themeName] ?? (entry as any)?.themes?.[fallbackThemeName] ?? {};
      themes[themeName] = {
        ...base,
        ...override
      };
    }

    out[segmentKey] = {
      meta: entry.meta,
      themes
    };
  }

  return out;
}

function firstSegmentLabel(bySegment: GlobalSemanticsBySegment): string | null {
  const keys = Object.keys(bySegment);
  if (!keys.length) return null;
  const first = bySegment[keys[0] as keyof typeof bySegment];
  return first?.meta?.name ?? keys[0] ?? null;
}

function computeDisplayName(schema: Schema, bySegment: GlobalSemanticsBySegment): string {
  const author = schema.author || '';
  const defaultName = bySegment.default?.meta?.name;
  const segName = schema.name || defaultName || firstSegmentLabel(bySegment) || '';
  const major = majorVersionFromTuple(schema.version || []);
  const left = [segName, major > 1 ? String(major) : ''].filter(Boolean).join(' ').trim();
  return [left, author && `by ${author}`].filter(Boolean).join(' ').trim();
}

function discoverSegmentsThemesFromPalettes(
  schema: Schema,
  segmentKeys: string[]
): {
  segments: string[];
  themes: Record<string, string[]>;
} {
  const themesBySegment: Record<string, Set<string>> = {};
  for (const seg of segmentKeys) {
    themesBySegment[seg] = new Set<string>();
  }

  const add = (seg: string, theme: string) => {
    if (!themesBySegment[seg]) themesBySegment[seg] = new Set<string>();
    themesBySegment[seg]?.add(theme);
  };

  const themeTokensPalettes = (schema.themeTokens as any)?.palettes as
    | Record<string, Record<string, unknown>>
    | undefined;
  if (themeTokensPalettes) {
    for (const seg of Object.keys(themeTokensPalettes)) {
      const byTheme = themeTokensPalettes[seg];
      for (const theme of Object.keys(byTheme ?? {})) {
        add(seg, theme);
      }
    }
  }

  const components = (schema as any).components as Record<string, any> | undefined;
  if (components) {
    const visitElements = (elements: Record<string, any> | undefined) => {
      if (!elements) return;
      for (const el of Object.values(elements)) {
        const palettes = (el as any)?.palettes as
          | Record<string, Record<string, unknown>>
          | undefined;
        if (!palettes) continue;
        for (const seg of Object.keys(palettes)) {
          const byTheme = palettes[seg];
          for (const theme of Object.keys(byTheme ?? {})) {
            add(seg, theme);
          }
        }
      }
    };

    for (const component of Object.values(components)) {
      const elements = (component as any)?.elements as Record<string, any> | undefined;
      visitElements(elements);

      const variants = (component as any)?.variants as Record<string, any> | undefined;
      if (!variants) continue;
      for (const variant of Object.values(variants)) {
        visitElements((variant as any)?.elements as Record<string, any> | undefined);
        const modes = (variant as any)?.modes as Record<string, any> | undefined;
        if (!modes) continue;
        for (const mode of Object.values(modes)) {
          visitElements((mode as any)?.elements as Record<string, any> | undefined);
        }
      }
    }
  }

  const themes: Record<string, string[]> = {};
  for (const seg of Object.keys(themesBySegment)) {
    themes[seg] = Array.from(themesBySegment[seg] ?? []).sort() as ThemeMode[] as string[];
  }

  return { segments: segmentKeys, themes };
}

function collectComponentElements(
  schema: Schema,
  componentName: ComponentName
): Record<string, any>[] {
  const components = (schema as any).components as Record<string, any> | undefined;
  const component = components?.[componentName];
  if (!component) return [];

  const componentElements: Record<string, any>[] = [];
  const addElements = (elements: Record<string, any> | undefined) => {
    if (!elements) return;
    componentElements.push(elements);
  };

  addElements(component.elements as Record<string, any> | undefined);

  const variants = component.variants as Record<string, any> | undefined;
  if (!variants) return componentElements;

  for (const variant of Object.values(variants)) {
    addElements((variant as any)?.elements as Record<string, any> | undefined);

    const modes = (variant as any)?.modes as Record<string, any> | undefined;
    if (!modes) continue;
    for (const mode of Object.values(modes)) {
      addElements((mode as any)?.elements as Record<string, any> | undefined);
    }
  }

  return componentElements;
}

function buildComponentScale(
  schema: Schema,
  componentName: ComponentName
): ManifestComponent['scale'] | undefined {
  const scaleKeys = new Set<string>();

  const collectPublishedScaleKeys = (value: unknown): void => {
    if (!isRecord(value)) return;

    for (const [key, child] of Object.entries(value)) {
      if (key.startsWith('s:')) {
        scaleKeys.add(key);
        continue;
      }
      collectPublishedScaleKeys(child);
    }
  };

  for (const elements of collectComponentElements(schema, componentName)) {
    for (const el of Object.values(elements)) {
      collectPublishedScaleKeys((el as any).scales);
    }
  }

  if (!scaleKeys.size) return undefined;

  const out: Record<string, true> = {};
  for (const key of scaleKeys) {
    out[key] = true;
  }
  return out;
}

export function buildComponentSurfaceContexts(
  schema: Schema,
  componentName: ComponentName
): ManifestComponent['surfaceContexts'] | undefined {
  type StateSets = Record<string, Record<string, Set<string>>>;
  type ContextSets = Partial<Record<SurfaceContext, StateSets>>;

  const tmp: Record<string, ContextSets> = {};

  const addState = (
    paletteKey: string,
    surfaceContext: SurfaceContext,
    semantic: string,
    tone: string,
    stateKey: string
  ) => {
    if (!tmp[paletteKey]) tmp[paletteKey] = {};
    const byContext = tmp[paletteKey];
    if (!byContext[surfaceContext]) byContext[surfaceContext] = {};
    const bySemantic = byContext[surfaceContext];
    if (!bySemantic[semantic]) bySemantic[semantic] = {};
    if (!bySemantic[semantic]?.[tone]) bySemantic[semantic]![tone] = new Set<string>();
    bySemantic[semantic]?.[tone]?.add(stateKey);
  };

  for (const elements of collectComponentElements(schema, componentName)) {
    for (const el of Object.values(elements)) {
      const palettes = (el as any).palettes as
        | Record<string, Record<string, Partial<Record<SurfaceContext, Record<string, any>>>>>
        | undefined;
      if (!palettes) continue;

      for (const [segmentName, themes] of Object.entries(palettes)) {
        for (const [themeName, surfaceContexts] of Object.entries(themes)) {
          const paletteKey = `${segmentName}.${themeName}`;

          for (const [surfaceContextName, colorSchema] of Object.entries(surfaceContexts)) {
            const surfaceContext = surfaceContextName as SurfaceContext;
            if (!colorSchema) continue;

            for (const colorMap of Object.values(colorSchema)) {
              if (!colorMap || typeof colorMap !== 'object') continue;
              for (const [semantic, byTone] of Object.entries(colorMap)) {
                for (const [tone, statesObj] of Object.entries(byTone as Record<string, any>)) {
                  for (const stateKey of Object.keys(statesObj as Record<string, any>)) {
                    addState(paletteKey, surfaceContext, semantic, tone, stateKey);
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  const surfaceContextsOut: NonNullable<ManifestComponent['surfaceContexts']> = {};

  for (const [paletteKey, byContext] of Object.entries(tmp)) {
    const contextsOut: NonNullable<ManifestComponent['surfaceContexts']>[string] = {};

    for (const [surfaceContextName, bySemantic] of Object.entries(byContext)) {
      const stateMap: ManifestComponentState = {};
      for (const [semantic, tones] of Object.entries(bySemantic as StateSets)) {
        stateMap[semantic] = {};
        for (const [tone, statesSet] of Object.entries(tones)) {
          const statesRecord: Record<string, true> = {};
          for (const state of statesSet) statesRecord[state] = true;
          stateMap[semantic]![tone] = statesRecord;
        }
      }

      if (Object.keys(stateMap).length > 0) {
        contextsOut[surfaceContextName as SurfaceContext] = { state: stateMap };
      }
    }

    if (Object.keys(contextsOut).length > 0) surfaceContextsOut[paletteKey] = contextsOut;
  }

  return Object.keys(surfaceContextsOut).length ? surfaceContextsOut : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function isComponentName(value: string): value is ComponentName {
  return (
    value === 'button' ||
    value === 'card' ||
    value === 'icon' ||
    value === 'progress' ||
    value === 'slider' ||
    value === 'switch' ||
    value === 'tabs' ||
    value === 'textField'
  );
}

function hasEntries(value: unknown): value is Record<string, unknown> {
  return isRecord(value) && Object.keys(value).length > 0;
}

function addComponentClassMapArtifactsToManifest(
  manifest: Manifest,
  classNamesMap: ComponentClassNameMapSplitJSON | undefined
): void {
  if (!classNamesMap) return;

  const componentNames = new Set<ComponentName>();

  for (const [componentName, componentClassMap] of Object.entries(classNamesMap.core)) {
    if (!isComponentName(componentName) || !hasEntries(componentClassMap)) continue;
    componentNames.add(componentName);
  }

  for (const paletteMap of Object.values(classNamesMap.palettes)) {
    if (!hasEntries(paletteMap)) continue;
    for (const [componentName, componentClassMap] of Object.entries(paletteMap)) {
      if (!isComponentName(componentName) || !hasEntries(componentClassMap)) continue;
      componentNames.add(componentName);
    }
  }

  for (const componentName of componentNames) {
    const coreClassMap = classNamesMap.core[componentName];
    const palettes: Record<string, string> = {};

    for (const [paletteName, paletteMap] of Object.entries(classNamesMap.palettes)) {
      const componentClassMap = paletteMap[componentName];
      if (!hasEntries(componentClassMap)) continue;
      palettes[paletteName] = getComponentPaletteClassMapArtifactPath(paletteName, componentName);
    }

    const classMaps = {
      ...(hasEntries(coreClassMap)
        ? { core: getComponentCoreClassMapArtifactPath(componentName) }
        : {}),
      ...(Object.keys(palettes).length > 0 ? { palettes } : {})
    };

    if (!Object.keys(classMaps).length) continue;

    manifest.components = manifest.components ?? {};
    manifest.components[componentName] = {
      ...(manifest.components[componentName] ?? {}),
      artifacts: {
        ...(manifest.components[componentName]?.artifacts ?? {}),
        classMaps
      }
    };
  }
}

type PublishedScale = KiskadeeHexScale | KiskadeeCssScale;

function validatePublishedPrimitiveAsset(value: unknown): boolean {
  if (!isRecord(value)) return false;
  const kind = value.kind;
  if (kind !== 'static' && kind !== 'dynamic') return false;
  if (!isRecord(value.scales)) {
    throw new Error('Invalid primitive asset module: missing scales.');
  }

  for (const [theme, scale] of Object.entries(value.scales)) {
    if (theme !== 'light' && theme !== 'dark') {
      throw new Error(`Invalid primitive asset module theme: ${theme}.`);
    }
    if (kind === 'static') {
      assertKiskadeeHexScale(scale, theme);
    } else {
      assertKiskadeeCssScale(scale);
    }
  }

  assertPrimitiveFunctionalReferences({
    scales: value.scales,
    functionalReferences: value.functionalReferences
  });

  return true;
}

function normalizeScaleToJson(scale: PublishedScale): Record<string, string> {
  return Object.fromEntries(
    Object.entries(scale).map(([tone, value]) => {
      if (typeof value !== 'string') throw new Error(`Invalid non-string color at tone ${tone}`);
      return [tone, value.startsWith('#') ? normalizeHexColor(value) : value];
    })
  );
}

function deepNormalizeHexColors(value: unknown): unknown {
  if (
    Array.isArray(value) &&
    value.length === 4 &&
    value.every((item) => typeof item === 'number')
  ) {
    throw new Error('Numeric color tuples are not supported in schema artifacts.');
  }
  if (Array.isArray(value)) {
    return value.map((v) => deepNormalizeHexColors(v));
  }

  if (isRecord(value)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = deepNormalizeHexColors(v);
    }
    return out;
  }
  if (typeof value === 'string' && value.startsWith('#')) return normalizeHexColor(value);
  return value;
}

function collectPrimitiveScales(colors: SchemaColors): Array<{
  baseColor: string;
  variant: string;
  theme: string;
  scale: PublishedScale;
}> {
  const result: Array<{
    baseColor: string;
    variant: string;
    theme: string;
    scale: PublishedScale;
  }> = [];

  const primitiveColors = (colors as any).primitiveColors as Record<string, unknown> | undefined;
  if (!primitiveColors || !isRecord(primitiveColors)) return result;

  for (const [baseColor, variantsValue] of Object.entries(primitiveColors)) {
    if (!isRecord(variantsValue)) continue;

    for (const [variant, variantValue] of Object.entries(variantsValue)) {
      if (!isRecord(variantValue)) {
        throw new Error(`Invalid primitive asset ${baseColor}.${variant}: expected an object.`);
      }
      const kind = variantValue.kind;
      if (kind !== 'static' && kind !== 'dynamic') {
        throw new Error(
          `Invalid primitive asset ${baseColor}.${variant}: expected kind "static" or "dynamic".`
        );
      }
      const scales = (variantValue as any).scales as any;
      if (!scales || typeof scales !== 'object' || Array.isArray(scales)) {
        throw new Error(`Invalid primitive asset ${baseColor}.${variant}: missing scales.`);
      }

      assertPrimitiveFunctionalReferences({
        scales,
        functionalReferences: variantValue.functionalReferences
      });

      for (const [theme, scale] of Object.entries(scales)) {
        if (theme !== 'light' && theme !== 'dark') {
          throw new Error(`Invalid primitive asset theme ${baseColor}.${variant}.${theme}.`);
        }
        if (kind === 'static') {
          assertKiskadeeHexScale(scale, theme);
        } else {
          assertKiskadeeCssScale(scale);
        }
        result.push({ baseColor, variant, theme, scale });
      }
    }
  }

  return result;
}

function buildColorsArtifact(
  colors: SchemaColors,
  scaleFileNameByRef: WeakMap<object, string>,
  themeNames: readonly string[] = []
): SchemaColors {
  const primitiveColorsSrc = (colors as any).primitiveColors as Record<string, unknown> | undefined;
  const primitiveColorsOut: Record<string, unknown> = {};

  if (primitiveColorsSrc && isRecord(primitiveColorsSrc)) {
    for (const [baseColor, variantsValue] of Object.entries(primitiveColorsSrc)) {
      if (!isRecord(variantsValue)) continue;
      const variantsOut: Record<string, unknown> = {};

      for (const [variant, variantValue] of Object.entries(variantsValue)) {
        if (!isRecord(variantValue)) continue;

        // Clone to keep any extra primitive asset config (e.g. `gradient`) intact.
        const variantOut: any = structuredClone(variantValue as any);
        const scalesSrc = (variantValue as any).scales as any;

        if (scalesSrc && typeof scalesSrc === 'object') {
          variantOut.scales = variantOut.scales ?? {};

          for (const [theme, scale] of Object.entries(scalesSrc)) {
            if (scale && typeof scale === 'object') {
              const fileName = scaleFileNameByRef.get(scale as object);
              if (fileName) {
                variantOut.scales[theme] = fileName;
              }
            }
          }
        }

        variantsOut[variant] = variantOut;
      }

      primitiveColorsOut[baseColor] = variantsOut;
    }
  }

  const globalSemanticsOut = structuredClone((colors as any).globalSemantics ?? {});
  if (
    themeNames.includes('darker') &&
    globalSemanticsOut.darker === undefined &&
    globalSemanticsOut.dark !== undefined
  ) {
    globalSemanticsOut.darker = structuredClone(globalSemanticsOut.dark);
  }

  // Keep Layers 2 and 3 as-is, but override Layer 1 with file references.
  return {
    ...(colors as any),
    primitiveColors: primitiveColorsOut,
    globalSemantics: globalSemanticsOut
  } as SchemaColors;
}

/**
 * What
 *     Builds the manifest's compact map from semantic font roles to family IDs.
 * Why
 *     The manifest advertises selections without duplicating the catalog in the global artifact.
 */
export function buildManifestFonts(fonts: SchemaFonts | undefined): ManifestFonts | undefined {
  if (!fonts) return undefined;

  return {
    body: fonts.roles.body,
    ...(fonts.roles.heading ? { heading: fonts.roles.heading } : {}),
    ...(fonts.roles.code ? { code: fonts.roles.code } : {})
  };
}

export function buildManifestIcons(icons: SchemaIcons | undefined): ManifestIcons | undefined {
  if (!icons) return undefined;
  return { family: icons.family };
}

export async function publishMetadata(params: {
  schema: Schema;
  outDirSlug: string;
  schemaPath: string;
  baseBuildDir: string;
  classNamesMap?: ComponentClassNameMapSplitJSON;
}): Promise<void> {
  const { schema, outDirSlug, schemaPath, baseBuildDir, classNamesMap } = params;

  // `Schema.colors` is required by presets, but the public type allows it to be optional.
  // At this point we already depend on it (segments, artifacts), so we assert it.
  const colors = schema.colors as SchemaColors;

  const segmentRegistry = requireSegmentRegistry(colors);
  const segmentKeys = Object.keys(segmentRegistry);

  // Build manifest content
  const displayName = computeDisplayName(schema, segmentRegistry);
  const { segments: segKeys, themes } = discoverSegmentsThemesFromPalettes(schema, segmentKeys);
  const manifest: Manifest = {
    key: outDirSlug,
    displayName,
    author: schema.author ?? null,
    schemaName: schema.name ?? null,
    version: schema.version ? schema.version.join('.') : null,
    segments: segKeys,
    themes,
    components: {}
  };

  // Publish global font metadata directly from the schema. This keeps the
  // manifest deterministic and independent from the order in which build phases
  // emit artifacts such as "global.kiskadee.json".
  const fonts = schema.global?.fonts as SchemaFonts | undefined;
  const manifestFonts = buildManifestFonts(fonts);
  if (manifestFonts) {
    manifest.fonts = manifestFonts;
  }

  const icons = schema.global?.icons as SchemaIcons | undefined;
  const manifestIcons = buildManifestIcons(icons);
  if (manifestIcons) {
    manifest.icons = manifestIcons;
  }

  // Derive component-level metadata from the schema. This keeps the
  // manifest focused on high-level capabilities instead of duplicating
  // the full schema structure. Absence of keys means the information is
  // not defined or not applicable.
  const manifestComponentNames = [
    'button',
    'card',
    'icon',
    'progress',
    'slider',
    'switch'
  ] as const satisfies readonly ComponentName[];
  for (const componentName of manifestComponentNames) {
    const componentScale = buildComponentScale(schema, componentName);
    const componentSurfaceContexts = buildComponentSurfaceContexts(schema, componentName);

    if (componentScale || componentSurfaceContexts) {
      manifest.components = manifest.components ?? {};
      manifest.components[componentName] = {
        ...(manifest.components[componentName] ?? {}),
        ...(componentScale ? { scale: componentScale } : {}),
        ...(componentSurfaceContexts ? { surfaceContexts: componentSurfaceContexts } : {})
      };
    }
  }

  if (buildSliderComponentArtifact(schema)) {
    manifest.components = manifest.components ?? {};
    manifest.components.slider = {
      ...(manifest.components.slider ?? {}),
      artifacts: {
        ...(manifest.components.slider?.artifacts ?? {}),
        metadata: SLIDER_COMPONENT_ARTIFACT_PATH
      }
    };
  }

  if (buildCardComponentArtifact(schema)) {
    manifest.components = manifest.components ?? {};
    manifest.components.card = {
      ...(manifest.components.card ?? {}),
      artifacts: {
        ...(manifest.components.card?.artifacts ?? {}),
        metadata: CARD_COMPONENT_ARTIFACT_PATH
      }
    };
  }

  if (buildSwitchComponentArtifact(schema)) {
    manifest.components = manifest.components ?? {};
    manifest.components.switch = {
      ...(manifest.components.switch ?? {}),
      artifacts: {
        ...(manifest.components.switch?.artifacts ?? {}),
        metadata: SWITCH_COMPONENT_ARTIFACT_PATH
      }
    };
  }

  if (buildTabsComponentArtifact(schema)) {
    manifest.components = manifest.components ?? {};
    manifest.components.tabs = {
      ...(manifest.components.tabs ?? {}),
      artifacts: {
        ...(manifest.components.tabs?.artifacts ?? {}),
        metadata: TABS_COMPONENT_ARTIFACT_PATH
      }
    };
  }

  if (buildTextFieldComponentArtifact(schema)) {
    manifest.components = manifest.components ?? {};
    manifest.components.textField = {
      ...(manifest.components.textField ?? {}),
      artifacts: {
        ...(manifest.components.textField?.artifacts ?? {}),
        metadata: TEXT_FIELD_COMPONENT_ARTIFACT_PATH
      }
    };
  }

  addComponentClassMapArtifactsToManifest(manifest, classNamesMap);

  const buildDir = resolve(baseBuildDir, outDirSlug);
  await mkdir(buildDir, { recursive: true });

  // Write metadata files
  await writeFile(resolve(buildDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  const segmentsArtifact = materializeSegmentThemesArtifact(colors, segmentRegistry, themes);
  await writeFile(
    resolve(buildDir, 'segments.json'),
    JSON.stringify(segmentsArtifact, null, 2),
    'utf8'
  );

  // ---------------------------------------------------------------------------
  // Colors artifacts
  // ---------------------------------------------------------------------------
  // Contract:
  // - `schema.json` must NOT embed `colors`.
  // - `colors.json` is the single source of truth for Layer 1/2/3.
  // - A source module may export one primitive scale or a complete primitive asset.
  // - Published primitive scales (Layer 1) are referenced only by file name
  //   (e.g. "purple.light.json"), implicitly living under `colors/`.

  const scaleFileNameByRef = new WeakMap<object, string>();

  // Process and convert color scales to JSON
  try {
    const colorsDirSrc = resolve(dirname(schemaPath), 'colors');
    const colorsDirTarget = resolve(buildDir, 'colors');

    const files = await readdir(colorsDirSrc);
    if (files.length > 0) {
      await mkdir(colorsDirTarget, { recursive: true });

      for (const file of files) {
        if (!file.endsWith('.ts')) continue;

        const srcFilePath = resolve(colorsDirSrc, file);
        const targetFilePath = resolve(colorsDirTarget, file.replace(/\.ts$/, '.json'));

        // Import the color scale from the source file
        const mod = (await import(srcFilePath)) as { default: PublishedScale };
        const colorScale = mod.default;

        if (!colorScale) continue;
        // Complete tonal assets are validated here and emitted per theme from the schema references
        // below, preserving the existing published `colors.json` contract.
        if (validatePublishedPrimitiveAsset(colorScale)) continue;
        const sourceTheme = file.match(/\.(light|dark)\.ts$/)?.[1] as 'light' | 'dark' | undefined;
        assertKiskadeeHexScale(colorScale, sourceTheme);

        // Make this scale discoverable for `colors.json` references.
        scaleFileNameByRef.set(colorScale as unknown as object, file.replace(/\.ts$/, '.json'));

        const convertedScale = normalizeScaleToJson(colorScale);
        await writeFile(targetFilePath, JSON.stringify(convertedScale, null, 2), 'utf8');
      }
    }
  } catch (error) {
    if ((error as any).code !== 'ENOENT') {
      throw new Error('[web-builder] Failed to process "colors" folder', { cause: error });
    }
  }

  // Ensure all primitive solid scales referenced by the schema have a file.
  // This covers cases like `dynamic.color.ts` (shared module outside `colors/`).
  const colorsDirTarget = resolve(buildDir, 'colors');
  const primitiveScales = collectPrimitiveScales(colors);
  for (const { baseColor, variant, theme, scale } of primitiveScales) {
    if (scaleFileNameByRef.has(scale as unknown as object)) continue;

    await mkdir(colorsDirTarget, { recursive: true });
    const fileName = `${baseColor}.${variant}.${theme}.json`;
    const filePath = resolve(colorsDirTarget, fileName);

    scaleFileNameByRef.set(scale as unknown as object, fileName);
    const convertedScale = normalizeScaleToJson(scale);
    await writeFile(filePath, JSON.stringify(convertedScale, null, 2), 'utf8');
  }

  const themeNames = Array.from(new Set(Object.values(themes).flat()));
  const colorsArtifact = buildColorsArtifact(colors, scaleFileNameByRef, themeNames);
  await writeFile(
    resolve(buildDir, 'colors.json'),
    JSON.stringify(colorsArtifact, null, 2),
    'utf8'
  );

  // Write schema.json without `colors`
  const schemaArtifact: any = structuredClone(schema as any);
  delete schemaArtifact.colors;
  // Rule: any explicit colors inside `components` in schema.json must be HEX.
  if (schemaArtifact.components) {
    schemaArtifact.components = deepNormalizeHexColors(schemaArtifact.components);
  }
  await writeFile(
    resolve(buildDir, 'schema.json'),
    JSON.stringify(schemaArtifact, null, 2),
    'utf8'
  );

  // console.log('[web-builder] Phase 7: metadata published to', buildDir);
}
