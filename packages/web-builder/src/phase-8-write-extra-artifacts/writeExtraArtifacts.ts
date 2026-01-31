import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  HSLA,
  RadiusMode,
  Schema,
  SchemaFonts,
  SegmentName,
  SolidColor,
  ThemeMode
} from '@kiskadee/core';
import { convertHslaToHex } from '@kiskadee/core';
import { toShortHex } from '../phase-4-convert-style-keys-to-css-rules/utils/toShortHex';
import { type FontStack, toCssFontFamily } from '../utils/fontFamily';

type ExtractableSchema = Schema;

type SegmentKey = SegmentName | string;

function getBuildDir(outDirSlug: string): string {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const baseBuildDir = resolve(__dirname, '..', '..', 'build');

  return resolve(baseBuildDir, outDirSlug);
}

function getSegmentKeys(schema: ExtractableSchema): SegmentKey[] {
  const bySegment = schema.colors?.globalSemanticsBySegment;
  if (bySegment && typeof bySegment === 'object') {
    const keys = Object.keys(bySegment as Record<string, unknown>);
    if (keys.length) return keys;
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

  const buildDir = getBuildDir(outDirSlug);

  // 1) Global artifact (global.kiskadee.json)
  //
  //    This file is optional and only written when the schema defines
  //    any global data (fonts, focus metrics, ...). It is meant as descriptive
  //    metadata capturing global design system intentions.
  const fonts = schema.global?.fonts as SchemaFonts | undefined;
  const focus = schema.global?.focus as { width?: number; offset?: number } | undefined;
  const radius = schema.global?.radius as RadiusMode | undefined;

  function toCssFontFamilyString(value: FontStack): string | null {
    const css = toCssFontFamily(value);
    return css.trim() ? css : null;
  }

  const bodyCss = fonts ? toCssFontFamilyString(fonts.body as FontStack) : null;
  const headingCssRaw =
    fonts && fonts.heading ? toCssFontFamilyString(fonts.heading as FontStack) : null;
  const headingCss = headingCssRaw ?? bodyCss;

  const hasFonts = Boolean(bodyCss);
  const hasFocus = Boolean(focus && (focus.width !== undefined || focus.offset !== undefined));
  const hasRadius = Boolean(radius);

  if (hasFonts || hasFocus || hasRadius) {
    await mkdir(buildDir, { recursive: true });
    const globalFilePath = resolve(buildDir, 'global.kiskadee.json');

    const globalPayload: {
      fonts?: { body: string; heading?: string };
      focus?: { width?: number; offset?: number };
      radius?: RadiusMode;
    } = {};

    if (hasFonts && bodyCss) {
      globalPayload.fonts = {
        body: bodyCss,
        ...(headingCss ? { heading: headingCss } : {})
      };
    }

    if (hasFocus && focus) {
      globalPayload.focus = {
        ...(focus.width !== undefined ? { width: focus.width } : {}),
        ...(focus.offset !== undefined ? { offset: focus.offset } : {})
      };
    }

    if (hasRadius && radius) {
      globalPayload.radius = radius;
    }

    await writeFile(globalFilePath, JSON.stringify(globalPayload, null, 2), 'utf8');
    console.log(`[web-builder] Global artifact written to: ${globalFilePath}`);
  }

  if (!schema.themeTokens || !schema.themeTokens.palettes) {
    return;
  }

  await mkdir(buildDir, { recursive: true });

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

      // Both focusColor and background are optional.
      // We only skip writing the artifact when neither is present.
      if (!color && !background) {
        continue;
      }

      const extraData: {
        focusColor?: string;
        background?: string;
      } = {};

      if (color) {
        if (typeof color === 'string') {
          extraData.focusColor = color;
        } else {
          extraData.focusColor = toShortHex(convertHslaToHex(color as HSLA));
        }
      }

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
