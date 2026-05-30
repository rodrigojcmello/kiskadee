import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type {
  ComponentName,
  EmphasisLevel,
  GlobalSemanticsBySegment,
  GlobalSemanticsByTheme,
  HSLA,
  Schema,
  SchemaColors,
  SchemaFonts,
  ThemeMode
} from '@kiskadee/core';
import { convertHslaToHex } from '@kiskadee/core';
import {
  buildSwitchComponentArtifact,
  SWITCH_COMPONENT_ARTIFACT_PATH
} from '../component-artifacts/switchComponentArtifact.ts';
import { toShortHex } from '../phase-4-convert-style-keys-to-css-rules/utils/toShortHex.ts';
import type {
  Manifest,
  ManifestComponent,
  ManifestComponentState,
  ManifestFontStack,
  ManifestFonts
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
  bySegment: GlobalSemanticsBySegment
): Record<string, unknown> {
  const globalSemantics = requireGlobalSemantics(colors);

  const out: Record<string, unknown> = {};

  for (const segmentKey of Object.keys(bySegment)) {
    const entry = bySegment[segmentKey as keyof typeof bySegment];
    if (!entry) continue;

    const themes: Record<string, unknown> = {};
    for (const themeName of Object.keys(globalSemantics)) {
      const base = (globalSemantics as any)[themeName] ?? {};
      const override = (entry as any)?.themes?.[themeName] ?? {};
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
    themesBySegment[seg]!.add(theme);
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

  for (const elements of collectComponentElements(schema, componentName)) {
    for (const el of Object.values(elements)) {
      const scales = (el as any).scales as Record<string, Record<string, number>> | undefined;
      if (!scales) continue;

      for (const scaleMap of Object.values(scales)) {
        for (const key of Object.keys(scaleMap)) {
          scaleKeys.add(key);
        }
      }
    }
  }

  if (!scaleKeys.size) return undefined;

  const out: Record<string, true> = {};
  for (const key of scaleKeys) {
    out[key] = true;
  }
  return out;
}

function buildComponentState(
  schema: Schema,
  componentName: ComponentName
): ManifestComponentState | undefined {
  const stateMap: ManifestComponentState = {};

  // Temporary accumulator so we can use Set semantics while
  // computing, then convert to the ManifestComponentState
  // structure at the end.
  const tmp: Record<string, Record<string, Set<string>>> = {};

  const addState = (semantic: string, tone: string, stateKey: string) => {
    const emphasis = tone;
    if (!tmp[semantic]) tmp[semantic] = {};
    if (!tmp[semantic]![emphasis]) tmp[semantic]![emphasis] = new Set<string>();
    tmp[semantic]![emphasis]!.add(stateKey);
  };

  for (const elements of collectComponentElements(schema, componentName)) {
    for (const el of Object.values(elements)) {
      const palettes = (el as any).palettes as
        | Record<string, Record<string, { boxColor?: any; textColor?: any }>>
        | undefined;
      if (!palettes) continue;

      for (const seg of Object.values(palettes)) {
        for (const theme of Object.values(seg)) {
          const colorMaps = [
            (theme as any).boxColor as Record<string, any> | undefined,
            (theme as any).textColor as Record<string, any> | undefined
          ];

          for (const colorMap of colorMaps) {
            if (!colorMap) continue;
            for (const [semantic, byTone] of Object.entries(colorMap)) {
              for (const [tone, statesObj] of Object.entries(byTone as Record<string, any>)) {
                for (const stateKey of Object.keys(statesObj as Record<string, any>)) {
                  addState(semantic, tone, stateKey);
                }
              }
            }
          }
        }
      }
    }
  }

  // Materialise tmp (with Sets) into the final ManifestComponentState
  const semanticEntries = Object.entries(tmp);
  if (!semanticEntries.length) return undefined;

  for (const [semantic, tones] of semanticEntries) {
    stateMap[semantic] = stateMap[semantic] || {};
    for (const [tone, statesSet] of Object.entries(tones)) {
      const statesRecord: Record<string, true> = {};
      for (const st of statesSet) {
        statesRecord[st] = true;
      }
      stateMap[semantic]![tone] = statesRecord;
    }
  }

  return Object.keys(stateMap).length ? stateMap : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function convertEmphasisLevelToJson(scale: EmphasisLevel): Record<string, Record<string, string>> {
  const convertedScale: Record<string, Record<string, string>> = {};

  for (const [trackKey, trackValues] of Object.entries(scale as Record<string, unknown>)) {
    if (!isRecord(trackValues)) continue;
    convertedScale[trackKey] = {};
    for (const [tone, value] of Object.entries(trackValues)) {
      // Emphasis levels may contain either HSLA tuples or already-resolved strings
      // (e.g. CSS vars in `dynamic.color.ts`).
      if (typeof value === 'string') {
        convertedScale[trackKey][tone] = value;
      } else {
        convertedScale[trackKey][tone] = toShortHex(convertHslaToHex(value as HSLA));
      }
    }
  }

  return convertedScale;
}

function isHslaTuple(value: unknown): value is HSLA {
  return (
    Array.isArray(value) &&
    value.length === 4 &&
    value.every((v) => typeof v === 'number' && Number.isFinite(v))
  );
}

function deepConvertHslaTuplesToHex(value: unknown): unknown {
  if (isHslaTuple(value)) {
    return toShortHex(convertHslaToHex(value));
  }

  if (Array.isArray(value)) {
    return value.map((v) => deepConvertHslaTuplesToHex(v));
  }

  if (isRecord(value)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = deepConvertHslaTuplesToHex(v);
    }
    return out;
  }

  return value;
}

function collectPrimitiveSolidScales(colors: SchemaColors): Array<{
  baseColor: string;
  variant: string;
  theme: 'light' | 'dark';
  scale: EmphasisLevel;
}> {
  const result: Array<{
    baseColor: string;
    variant: string;
    theme: 'light' | 'dark';
    scale: EmphasisLevel;
  }> = [];

  const primitiveColors = (colors as any).primitiveColors as Record<string, unknown> | undefined;
  if (!primitiveColors || !isRecord(primitiveColors)) return result;

  for (const [baseColor, variantsValue] of Object.entries(primitiveColors)) {
    if (!isRecord(variantsValue)) continue;

    for (const [variant, variantValue] of Object.entries(variantsValue)) {
      if (!isRecord(variantValue)) continue;
      const solid = (variantValue as any).solid as any;
      if (!solid || typeof solid !== 'object') continue;

      for (const theme of ['light', 'dark'] as const) {
        const scale = solid[theme] as unknown;
        if (scale && typeof scale === 'object') {
          result.push({ baseColor, variant, theme, scale: scale as EmphasisLevel });
        }
      }
    }
  }

  return result;
}

function buildColorsArtifact(
  colors: SchemaColors,
  scaleFileNameByRef: WeakMap<object, string>
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
        const solidSrc = (variantValue as any).solid as any;

        if (solidSrc && typeof solidSrc === 'object') {
          variantOut.solid = variantOut.solid ?? {};

          for (const theme of ['light', 'dark'] as const) {
            const scale = solidSrc[theme] as unknown;
            if (scale && typeof scale === 'object') {
              const fileName = scaleFileNameByRef.get(scale as object);
              if (fileName) {
                variantOut.solid[theme] = fileName;
              }
            }
          }
        }

        variantsOut[variant] = variantOut;
      }

      primitiveColorsOut[baseColor] = variantsOut;
    }
  }

  // Keep Layers 2 and 3 as-is, but override Layer 1 with file references.
  return {
    ...(colors as any),
    primitiveColors: primitiveColorsOut
  } as SchemaColors;
}

export async function publishMetadata(params: {
  schema: Schema;
  outDirSlug: string;
  schemaPath: string;
  baseBuildDir: string;
}): Promise<void> {
  const { schema, outDirSlug, schemaPath, baseBuildDir } = params;

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
  if (fonts?.body) {
    const body = fonts.body as ManifestFontStack;
    const heading = (fonts.heading ?? fonts.body) as ManifestFontStack;
    const font: ManifestFonts = { body, heading };
    manifest.font = font;
  }

  // Derive component-level metadata from the schema. This keeps the
  // manifest focused on high-level capabilities instead of duplicating
  // the full schema structure. Absence of keys means the information is
  // not defined or not applicable.
  const manifestComponentNames = ['button', 'switch'] as const satisfies readonly ComponentName[];
  for (const componentName of manifestComponentNames) {
    const componentScale = buildComponentScale(schema, componentName);
    const componentState = buildComponentState(schema, componentName);

    if (componentScale || componentState) {
      manifest.components = manifest.components ?? {};
      manifest.components[componentName] = {
        ...(manifest.components[componentName] ?? {}),
        ...(componentScale ? { scale: componentScale } : {}),
        ...(componentState ? { state: componentState } : {})
      };
    }
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

  const buildDir = resolve(baseBuildDir, outDirSlug);
  await mkdir(buildDir, { recursive: true });

  // Write metadata files
  await writeFile(resolve(buildDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  const segmentsArtifact = materializeSegmentThemesArtifact(colors, segmentRegistry);
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
  // - Primitive solid scales (Layer 1) are referenced only by file name
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
        const mod = (await import(srcFilePath)) as { default: EmphasisLevel };
        const colorScale = mod.default;

        if (!colorScale) continue;

        // Make this scale discoverable for `colors.json` references.
        scaleFileNameByRef.set(colorScale as unknown as object, file.replace(/\.ts$/, '.json'));

        const convertedScale = convertEmphasisLevelToJson(colorScale);
        await writeFile(targetFilePath, JSON.stringify(convertedScale, null, 2), 'utf8');
      }
    }
  } catch (error) {
    if ((error as any).code !== 'ENOENT') {
      console.warn('[web-builder] Warning: Failed to process "colors" folder', error);
    }
  }

  // Ensure all primitive solid scales referenced by the schema have a file.
  // This covers cases like `dynamic.color.ts` (shared module outside `colors/`).
  const colorsDirTarget = resolve(buildDir, 'colors');
  const primitiveScales = collectPrimitiveSolidScales(colors);
  for (const { baseColor, variant, theme, scale } of primitiveScales) {
    if (scaleFileNameByRef.has(scale as unknown as object)) continue;

    await mkdir(colorsDirTarget, { recursive: true });
    const fileName = `${baseColor}.${variant}.${theme}.json`;
    const filePath = resolve(colorsDirTarget, fileName);

    scaleFileNameByRef.set(scale as unknown as object, fileName);
    const convertedScale = convertEmphasisLevelToJson(scale);
    await writeFile(filePath, JSON.stringify(convertedScale, null, 2), 'utf8');
  }

  const colorsArtifact = buildColorsArtifact(colors, scaleFileNameByRef);
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
    schemaArtifact.components = deepConvertHslaTuplesToHex(schemaArtifact.components);
  }
  await writeFile(
    resolve(buildDir, 'schema.json'),
    JSON.stringify(schemaArtifact, null, 2),
    'utf8'
  );

  // console.log('[web-builder] Phase 7: metadata published to', buildDir);
}
