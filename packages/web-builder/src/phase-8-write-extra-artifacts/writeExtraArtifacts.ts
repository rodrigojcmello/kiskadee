import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  HSLA,
  Schema,
  SchemaFonts,
  SchemaSegments,
  SegmentName,
  SolidColor,
  ThemeMode
} from '@kiskadee/core';
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
    | Partial<
        Record<
          SegmentKey,
          Partial<
            Record<
              ThemeMode,
              {
                focusColor?: HSLA;
                background?: HSLA;
              }
            >
          >
        >
      >
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

  // 1) Global fonts artifact (fonts.kiskadee.json)
  //
  //    This file is optional and only written when the schema defines
  //    global fonts. It is meant as descriptive metadata capturing the
  //    intended body/heading/code font stacks for the design system.
  //    Runtime consumers are free to ignore or override these values.
  const fonts = schema.fonts as SchemaFonts | undefined;

  if (fonts && typeof fonts.body === 'string' && fonts.body.trim() !== '') {
    const fontsFilePath = resolve(buildDir, 'fonts.kiskadee.json');
    const fontsPayload = {
      fonts: {
        body: fonts.body,
        ...(fonts.heading ? { heading: fonts.heading } : {}),
        ...(fonts.code ? { code: fonts.code } : {})
      }
    } satisfies { fonts: SchemaFonts };

    await writeFile(fontsFilePath, JSON.stringify(fontsPayload, null, 2), 'utf8');
    console.log(`[web-builder] Fonts artifact written to: ${fontsFilePath}`);
  }

  const segmentKeys = getSegmentKeys(schema);

  for (const segment of segmentKeys) {
    const themes = getThemesForSegment(schema, segment);

    for (const theme of themes) {
      const palettes = schema.themeTokens?.palettes as
        | Partial<
            Record<
              SegmentKey,
              Partial<
                Record<
                  ThemeMode,
                  {
                    focusColor?: SolidColor;
                    background?: SolidColor;
                  }
                >
              >
            >
          >
        | undefined;

      const themeTokens = palettes?.[segment]?.[theme];
      const color = themeTokens?.focusColor;
      const background = themeTokens?.background;

      if (!color) {
        continue;
      }

      let focusColorVal: string;
      if (typeof color === 'string') {
        focusColorVal = color;
      } else {
        focusColorVal = toShortHex(convertHslaToHex(color as HSLA));
      }

      const extraData: {
        focusColor: string;
        background?: string;
      } = {
        focusColor: focusColorVal
      };

      if (background) {
        if (typeof background === 'string') {
          extraData.background = background;
        } else {
          extraData.background = toShortHex(convertHslaToHex(background));
        }
      }

      const fileName = `extra.${segment}.${theme}.kiskadee.json`;
      const filePath = resolve(buildDir, fileName);

      await writeFile(filePath, JSON.stringify(extraData, null, 2), 'utf8');
      console.log(`[web-builder] Extra artifact written to: ${filePath}`);
    }
  }
}
