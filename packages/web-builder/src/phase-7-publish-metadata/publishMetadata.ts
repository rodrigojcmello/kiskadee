import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type {
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
import { toShortHex } from '../phase-4-convert-style-keys-to-css-rules/utils/toShortHex';
import type {
  Manifest,
  ManifestComponent,
  ManifestComponentState,
  ManifestFontStack,
  ManifestFonts
} from './manifestTypes';

function majorVersionFromTuple(v: [number, number, number] | number[]): number {
  return Array.isArray(v) && v.length > 0 ? Number(v[0]) : 0;
}

function requireSegmentRegistry(colors: SchemaColors | undefined): GlobalSemanticsBySegment {
  const bySegment = colors?.globalSemanticsBySegment as GlobalSemanticsBySegment | undefined;
  if (!bySegment || typeof bySegment !== 'object') {
    throw new Error('[web-builder] Schema is missing `colors.globalSemanticsBySegment` segment registry');
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
    for (const component of Object.values(components)) {
      const elements = (component as any)?.elements as Record<string, any> | undefined;
      if (!elements) continue;
      for (const el of Object.values(elements)) {
        const palettes = (el as any)?.palettes as Record<string, Record<string, unknown>> | undefined;
        if (!palettes) continue;
        for (const seg of Object.keys(palettes)) {
          const byTheme = palettes[seg];
          for (const theme of Object.keys(byTheme ?? {})) {
            add(seg, theme);
          }
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

function buildButtonScale(schema: Schema): ManifestComponent['scale'] | undefined {
  const components = (schema as any).components as Record<string, any> | undefined;
  const button = components?.button;
  const elements = button?.elements as Record<string, any> | undefined;
  if (!elements) return undefined;

  const scaleKeys = new Set<string>();

  for (const el of Object.values(elements)) {
    const scales = (el as any).scales as Record<string, Record<string, number>> | undefined;
    if (!scales) continue;

    for (const scaleMap of Object.values(scales)) {
      for (const key of Object.keys(scaleMap)) {
        scaleKeys.add(key);
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

function buildButtonState(schema: Schema): ManifestComponentState | undefined {
  const components = (schema as any).components as Record<string, any> | undefined;
  const button = components?.button;
  const elements = button?.elements as Record<string, any> | undefined;
  if (!elements) return undefined;

  const stateMap: ManifestComponentState = {};

  // Temporary accumulator so we can use Set semantics while
  // computing, then convert to the ManifestComponentState
  // structure at the end.
  const tmp: Record<string, Record<string, Set<string>>> = {};

  const addState = (semantic: string, tone: string, stateKey: string) => {
    if (!tmp[semantic]) tmp[semantic] = {};
    if (!tmp[semantic]![tone]) tmp[semantic]![tone] = new Set<string>();
    tmp[semantic]![tone]!.add(stateKey);
  };

  for (const el of Object.values(elements)) {
    const palettes = (el as any).palettes as
      | Record<string, Record<string, { boxColor?: any; textColor?: any }>>
      | undefined;
    if (!palettes) continue;

    for (const seg of Object.values(palettes)) {
      for (const theme of Object.values(seg)) {
        const boxColor = (theme as any).boxColor as Record<string, any> | undefined;
        const textColor = (theme as any).textColor as Record<string, any> | undefined;

        // boxColor: semantic -> emphasis -> { stateKey: value }
        if (boxColor) {
          for (const [semantic, byTone] of Object.entries(boxColor)) {
            for (const [tone, statesObj] of Object.entries(byTone as Record<string, any>)) {
              for (const stateKey of Object.keys(statesObj as Record<string, any>)) {
                addState(semantic, tone, stateKey);
              }
            }
          }
        }

        // textColor: semantic -> emphasis -> { stateKey: value }
        if (textColor) {
          for (const [semantic, byTone] of Object.entries(textColor)) {
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

export async function publishMetadata(params: {
  schema: Schema;
  outDirSlug: string;
  schemaPath: string;
  baseBuildDir: string;
}): Promise<void> {
  const { schema, outDirSlug, schemaPath, baseBuildDir } = params;

  const segmentRegistry = requireSegmentRegistry(schema.colors);
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
  // emit artifacts such as "fonts.kiskadee.json".
  const fonts = schema.fonts as SchemaFonts | undefined;
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
  const buttonScale = buildButtonScale(schema);
  const buttonState = buildButtonState(schema);

  if (buttonScale || buttonState) {
    manifest.components = manifest.components ?? {};
    manifest.components.button = {
      ...(manifest.components.button ?? {}),
      ...(buttonScale ? { scale: buttonScale } : {}),
      ...(buttonState ? { state: buttonState } : {})
    };
  }

  const buildDir = resolve(baseBuildDir, outDirSlug);
  await mkdir(buildDir, { recursive: true });

  // Write metadata files
  await writeFile(resolve(buildDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  await writeFile(resolve(buildDir, 'schema.json'), JSON.stringify(schema, null, 2), 'utf8');
  const segmentsArtifact = materializeSegmentThemesArtifact(schema.colors, segmentRegistry);
  await writeFile(resolve(buildDir, 'segments.json'), JSON.stringify(segmentsArtifact, null, 2), 'utf8');

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

        const convertedScale: Record<string, Record<string, string>> = {};

        for (const [trackKey, trackValues] of Object.entries(colorScale)) {
          convertedScale[trackKey] = {};
          for (const [tone, hsla] of Object.entries(trackValues)) {
            convertedScale[trackKey][tone] = toShortHex(convertHslaToHex(hsla as HSLA));
          }
        }

        await writeFile(targetFilePath, JSON.stringify(convertedScale, null, 2), 'utf8');
      }
    }
  } catch (error) {
    if ((error as any).code !== 'ENOENT') {
      console.warn('[web-builder] Warning: Failed to process "colors" folder', error);
    }
  }

  console.log('[web-builder] Phase 7: metadata published to', buildDir);
}
