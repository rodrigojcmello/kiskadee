import { copyFile, cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type { Schema, SchemaSegments, ThemeMode } from '@kiskadee/core';
import type { Manifest, ManifestComponent, ManifestComponentState } from './manifestTypes';

function majorVersionFromTuple(v: [number, number, number] | number[]): number {
  return Array.isArray(v) && v.length > 0 ? Number(v[0]) : 0;
}

function firstSegmentLabel(segmentsObj: SchemaSegments): string | null {
  const keys = segmentsObj ? Object.keys(segmentsObj) : [];
  if (!keys.length) return null;
  const first = segmentsObj[keys[0] as keyof typeof segmentsObj];
  return (first && 'name' in first ? first.name : undefined) || keys[0] || null;
}

function computeDisplayName(schema: Schema, segmentsObj: SchemaSegments): string {
  const author = schema.author || '';
  const segName = schema.name || firstSegmentLabel(segmentsObj) || '';
  const major = majorVersionFromTuple(schema.version || []);
  const left = [segName, major > 1 ? String(major) : ''].filter(Boolean).join(' ').trim();
  return [left, author && `by ${author}`].filter(Boolean).join(' ').trim();
}

function discoverSegmentsThemes(segmentsObj: SchemaSegments): {
  segments: string[];
  themes: Record<string, string[]>;
} {
  const segments: string[] = [];
  const themes: Record<string, string[]> = {};
  for (const segKey of Object.keys(segmentsObj)) {
    segments.push(segKey);
    const seg = segmentsObj[segKey as keyof typeof segmentsObj];
    const themeNames = seg?.themes ? (Object.keys(seg.themes) as string[]) : [];
    // Filter to only valid ThemeMode strings if present
    themes[segKey] = themeNames as ThemeMode[] as string[];
  }
  return { segments, themes };
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

  const ensureToneSet = (semantic: string, tone: string): Set<string> => {
    const bySemantic = (stateMap[semantic] = stateMap[semantic] || {});
    const bucket = (bySemantic[tone] = bySemantic[tone] || {});
    // We use a Set during computation, but the final structure must be
    // Record<string, true>. To avoid carrying Sets inside the public
    // type, we keep a local Map from semantic/tone to Set and then
    // materialise into stateMap at the end.
    // For simplicity, we will store states temporarily in a parallel
    // map.
    return new Set<string>(Object.keys(bucket));
  };

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

        // boxColor: semantic -> tone -> { stateKey: value }
        if (boxColor) {
          for (const [semantic, byTone] of Object.entries(boxColor)) {
            for (const [tone, statesObj] of Object.entries(byTone as Record<string, any>)) {
              for (const stateKey of Object.keys(statesObj as Record<string, any>)) {
                addState(semantic, tone, stateKey);
              }
            }
          }
        }

        // textColor: semantic -> tone -> { stateKey: value }
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
  segments: SchemaSegments;
  outDirSlug: string;
  schemaPath: string;
  baseBuildDir: string;
}): Promise<void> {
  const { schema, segments, outDirSlug, schemaPath, baseBuildDir } = params;

  // Build manifest content
  const displayName = computeDisplayName(schema, segments);
  const { segments: segKeys, themes } = discoverSegmentsThemes(segments);
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

  // Derive global font capability directly from the schema. This keeps the
  // flag deterministic and independent from the order in which build phases
  // emit artifacts such as "fonts.kiskadee.json".
  const hasGlobalFonts =
    !!(schema as any).fonts &&
    typeof (schema as any).fonts.body === 'string' &&
    (schema as any).fonts.body.trim() !== '';

  if (hasGlobalFonts) {
    (manifest as any).font = true;
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
  await writeFile(resolve(buildDir, 'segments.json'), JSON.stringify(segments, null, 2), 'utf8');

  // Optional: copy original template TS for inspection.
  // In the clean model we always expose two stable entrypoints:
  // - schema.source.ts  -> a copy of the original schema, but with its
  //                        local "*.colors" import rewritten to "./colors.source".
  // - colors.source.ts  -> a copy of the original "<name>.colors.ts" file.
  //
  // No `<preset>.colors.ts` file is published to the build directory anymore;
  // consumers should always rely on these two stable entrypoints instead.
  try {
    const schemaSourcePath = resolve(buildDir, 'schema.source.ts');
    const source = await readFile(schemaPath, 'utf8');
    const match = source.match(/from ['"](\.\/[^'\"]*\.colors)['"]/);

    if (match && match[1]) {
      const importStatement = match[0];
      const rewrittenImport = "from './colors.source'";

      // Rewrite the original local "*.colors" import to the stable
      // alias entrypoint "./colors.source".
      const rewrittenSchemaSource = source.replace(importStatement, rewrittenImport);
      await writeFile(schemaSourcePath, rewrittenSchemaSource, 'utf8');

      // Locate the original colors file (for example "./fluent-2-microsoft.colors.ts")
      // next to the schema and copy it to "colors.source.ts" in the build directory.
      const colorsRelPath = match[1];
      const colorsSrcPath = resolve(dirname(schemaPath), `${colorsRelPath}.ts`);
      const colorsSourceTarget = resolve(buildDir, 'colors.source.ts');
      await copyFile(colorsSrcPath, colorsSourceTarget);

      try {
        const colorsDirSrc = resolve(dirname(schemaPath), 'colors');
        const colorsDirTarget = resolve(buildDir, 'colors');
        await cp(colorsDirSrc, colorsDirTarget, { recursive: true });
      } catch (error) {
        if ((error as any).code !== 'ENOENT') {
          console.warn('[web-builder] Warning: Failed to copy "colors" folder', error);
        }
      }
    } else {
      // If there is no local "*.colors" import, just copy the schema file as is,
      // preserving the previous behavior.
      await copyFile(schemaPath, schemaSourcePath);
    }
  } catch (e) {
    console.warn('[web-builder] Failed to copy schema.source.ts for', manifest.key, e);
  }

  console.log('[web-builder] Phase 7: metadata published to', buildDir);
}
