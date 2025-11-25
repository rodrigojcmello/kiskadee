import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { HSLA, Schema, SchemaSegments, SegmentName, ThemeMode } from '@kiskadee/core';
import { convertHslaToHex } from '@kiskadee/core';
import { toShortHex } from '../phase-4-convert-style-keys-to-css-rules/utils/toShortHex';

type ExtractableSchema = Schema & {
  segments?: SchemaSegments;
};

type SegmentKey = SegmentName | string;

function getBuildDir(outDirSlug: string): string {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const baseBuildDir = resolve(__dirname, '..', '..', 'build');

  return resolve(baseBuildDir, outDirSlug);
}

function getSegmentKeys(schema: ExtractableSchema): SegmentKey[] {
  if (schema.segments) {
    return Object.keys(schema.segments);
  }

  const palettes = schema.themeTokens?.palettes;
  if (!palettes) {
    return [];
  }

  return Object.keys(palettes as Record<string, unknown>);
}

function getThemesForSegment(schema: ExtractableSchema, segment: SegmentKey): ThemeMode[] {
  const palettes = schema.themeTokens?.palettes as
    | Partial<Record<SegmentKey, Partial<Record<ThemeMode, { focusColor?: HSLA }>>>>
    | undefined;

  if (!palettes || !palettes[segment]) {
    return [];
  }

  return Object.keys(palettes[segment] as Record<ThemeMode, unknown>) as ThemeMode[];
}

export async function writeExtraArtifacts(params: {
  schema: Schema;
  outDirSlug: string;
}): Promise<void> {
  const { schema, outDirSlug } = params as {
    schema: ExtractableSchema;
    outDirSlug: string;
  };

  if (!schema.themeTokens || !schema.themeTokens.palettes) {
    return;
  }

  const buildDir = getBuildDir(outDirSlug);
  await mkdir(buildDir, { recursive: true });

  const segmentKeys = getSegmentKeys(schema);

  for (const segment of segmentKeys) {
    const themes = getThemesForSegment(schema, segment);

    for (const theme of themes) {
      const palettes = schema.themeTokens?.palettes as
        | Partial<Record<SegmentKey, Partial<Record<ThemeMode, { focusColor?: HSLA }>>>>
        | undefined;

      const color = palettes?.[segment]?.[theme]?.focusColor;

      if (!color) {
        continue;
      }

      const fullHex = convertHslaToHex(color as HSLA);
      const shortHex = toShortHex(fullHex);

      const extraData = {
        focusColor: shortHex
      } as const;

      const fileName = `extra.${segment}.${theme}.kiskadee.json`;
      const filePath = resolve(buildDir, fileName);

      await writeFile(filePath, JSON.stringify(extraData, null, 2), 'utf8');
      console.log(`[web-builder] Extra artifact written to: ${filePath}`);
    }
  }
}
