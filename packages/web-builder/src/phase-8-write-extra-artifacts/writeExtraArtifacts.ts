import { mkdir, readdir, unlink, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  HSLA,
  RadiusMode,
  RippleEffectSchema,
  Schema,
  SchemaFonts,
  SegmentName,
  SolidColor,
  TabsBridgeLowerCurveMode,
  TabsIndicatorVariant,
  TabsIndicatorPosition,
  TabsIndicatorWidthMode,
  TabsTabWidthMode,
  TabsType,
  ThemeMode
} from '@kiskadee/core';
import { convertHslaToHex } from '@kiskadee/core';
import { toShortHex } from '../phase-4-convert-style-keys-to-css-rules/utils/toShortHex';
import { type FontStack, toCssFontFamily } from '../utils/fontFamily';

type ExtractableSchema = Schema;

type SegmentKey = SegmentName | string;

function hasErrnoCode(error: unknown, code: string): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === code
  );
}

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

function toCssColor(value: SolidColor | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'string') return value;
  return toShortHex(convertHslaToHex(value as HSLA));
}

function buildRootTokensCss(
  vars: ReadonlyArray<{
    name: string;
    value: string | number | undefined;
  }>
): string | null {
  const declared = vars.filter((entry) => entry.value !== undefined);
  if (!declared.length) return null;

  const lines = declared.map((entry) => `  ${entry.name}: ${String(entry.value)};`);
  return `:root {\n${lines.join('\n')}\n}\n`;
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

  // Clean stale global/extra/token artifacts from previous builds so the output
  // always reflects the current schema and doesn't keep dead files around.
  try {
    const existingFiles = await readdir(buildDir);
    const isExtraArtifact = (fileName: string): boolean =>
      fileName === 'global.kiskadee.json' ||
      (fileName.startsWith('extra.') && fileName.endsWith('.kiskadee.json')) ||
      fileName === 'tokens.kiskadee.css' ||
      (fileName.startsWith('tokens.') && fileName.endsWith('.kiskadee.css'));

    await Promise.all(
      existingFiles
        .filter((fileName) => isExtraArtifact(fileName))
        .map(async (fileName) => {
          try {
            await unlink(resolve(buildDir, fileName));
          } catch (error) {
            if (hasErrnoCode(error, 'ENOENT')) return;
            throw error;
          }
        })
    );
  } catch (error) {
    // Ignore only missing build directory; files are recreated below.
    if (hasErrnoCode(error, 'ENOENT')) {
      // no-op
    } else {
      throw error;
    }
  }

  // 1) Global artifact (global.kiskadee.json)
  //
  //    This file is optional and only written when the schema defines
  //    any global metadata (fonts, radius, ripple behavior...). It is meant as descriptive
  //    metadata capturing global design system intentions.
  const fonts = schema.global?.fonts as SchemaFonts | undefined;
  const focus = schema.global?.focus as { width?: number; offset?: number } | undefined;
  const radius = schema.global?.radius as RadiusMode | undefined;
  const ripple = schema.global?.effects?.ripple as RippleEffectSchema | undefined;
  const tabsIndicatorPosition = schema.components?.tabs?.options
    ?.indicatorPosition as TabsIndicatorPosition | undefined;
  const tabsIndicatorVariant = schema.components?.tabs?.options
    ?.indicatorVariant as TabsIndicatorVariant | undefined;
  const tabsIndicatorWidthMode = schema.components?.tabs?.options
    ?.indicatorWidthMode as TabsIndicatorWidthMode | undefined;
  const tabsTabWidthMode = schema.components?.tabs?.options?.tabWidthMode as
    | TabsTabWidthMode
    | undefined;
  const tabsType = schema.components?.tabs?.options?.type as TabsType | undefined;
  const tabsSeparator = schema.components?.tabs?.options?.separator as boolean | undefined;
  const tabsLowerCurveMode = schema.components?.tabs?.options
    ?.lowerCurveMode as TabsBridgeLowerCurveMode | undefined;

  function toCssFontFamilyString(value: FontStack): string | null {
    const css = toCssFontFamily(value);
    return css.trim() ? css : null;
  }

  const bodyCss = fonts ? toCssFontFamilyString(fonts.body as FontStack) : null;
  const headingCssRaw =
    fonts && fonts.heading ? toCssFontFamilyString(fonts.heading as FontStack) : null;
  const headingCss = headingCssRaw ?? bodyCss;

  const hasFonts = Boolean(bodyCss);
  const hasRadius = Boolean(radius);
  const hasRipple = Boolean(ripple && Object.keys(ripple).length > 0);
  const hasTabsOptions = Boolean(
      tabsIndicatorPosition ||
      tabsIndicatorVariant ||
      tabsIndicatorWidthMode ||
      tabsTabWidthMode ||
      tabsType ||
      tabsSeparator !== undefined ||
      tabsLowerCurveMode
  );

  if (hasFonts || hasRadius || hasRipple || hasTabsOptions) {
    await mkdir(buildDir, { recursive: true });
    const globalFilePath = resolve(buildDir, 'global.kiskadee.json');

    const globalPayload: {
      fonts?: { body: string; heading?: string };
      radius?: RadiusMode;
      effects?: { ripple?: RippleEffectSchema };
      components?: {
        tabs?: {
          options?: {
            type?: TabsType;
            indicatorPosition?: TabsIndicatorPosition;
            indicatorVariant?: TabsIndicatorVariant;
            indicatorWidthMode?: TabsIndicatorWidthMode;
            tabWidthMode?: TabsTabWidthMode;
            separator?: boolean;
            lowerCurveMode?: TabsBridgeLowerCurveMode;
          };
        };
      };
    } = {};

    if (hasFonts && bodyCss) {
      globalPayload.fonts = {
        body: bodyCss,
        ...(headingCss ? { heading: headingCss } : {})
      };
    }

    if (hasRadius && radius) {
      globalPayload.radius = radius;
    }

    if (hasRipple && ripple) {
      globalPayload.effects = {
        ripple
      };
    }

    if (hasTabsOptions) {
      globalPayload.components = {
        ...(globalPayload.components ?? {}),
        tabs: {
          options: {
            ...(tabsType ? { type: tabsType } : {}),
            ...(tabsIndicatorPosition ? { indicatorPosition: tabsIndicatorPosition } : {}),
            ...(tabsIndicatorVariant ? { indicatorVariant: tabsIndicatorVariant } : {}),
            ...(tabsIndicatorWidthMode ? { indicatorWidthMode: tabsIndicatorWidthMode } : {}),
            ...(tabsTabWidthMode ? { tabWidthMode: tabsTabWidthMode } : {}),
            ...(tabsSeparator !== undefined ? { separator: tabsSeparator } : {}),
            ...(tabsLowerCurveMode ? { lowerCurveMode: tabsLowerCurveMode } : {})
          }
        }
      };
    }

    await writeFile(globalFilePath, JSON.stringify(globalPayload, null, 2), 'utf8');
    console.log(`[web-builder] Global artifact written to: ${globalFilePath}`);
  }

  // Global design tokens consumed directly by CSS (no runtime setProperty/removeProperty).
  const globalTokensCss = buildRootTokensCss([
    { name: '--k-focus-width', value: focus?.width },
    { name: '--k-focus-offset', value: focus?.offset },
    { name: '--k-ripple-alpha-h', value: ripple?.overlayAlphaByEmphasis?.high },
    { name: '--k-ripple-alpha-m', value: ripple?.overlayAlphaByEmphasis?.medium },
    { name: '--k-ripple-alpha-l', value: ripple?.overlayAlphaByEmphasis?.low },
    { name: '--k-ripple-alpha-ll', value: ripple?.overlayAlphaByEmphasis?.lowest }
  ]);

  if (globalTokensCss) {
    await mkdir(buildDir, { recursive: true });
    const globalTokensFilePath = resolve(buildDir, 'tokens.kiskadee.css');
    await writeFile(globalTokensFilePath, globalTokensCss, 'utf8');
    console.log(`[web-builder] Global tokens CSS written to: ${globalTokensFilePath}`);
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
                    effects?: {
                      ripple?: {
                        surface?: {
                          color?: SolidColor;
                          opacity?: number;
                        };
                        overflow?: {
                          color?: SolidColor;
                          opacity?: number;
                        };
                        overflowStatic?: {
                          color?: SolidColor;
                          opacity?: number;
                        };
                        overflowStaticBorder?: {
                          color?: SolidColor;
                          opacity?: number;
                        };
                      };
                    };
                  }
                >
              >
            >
          >
        | undefined;

      const themeTokens = palettes?.[segment]?.[theme];
      const color = themeTokens?.focusColor;
      const background = themeTokens?.background;
      const ripple = themeTokens?.effects?.ripple;
      const tokensCss = buildRootTokensCss([
        { name: '--k-focus-color', value: toCssColor(color) },
        { name: '--k-ripple-surface-color', value: toCssColor(ripple?.surface?.color) },
        { name: '--k-ripple-surface-opacity', value: ripple?.surface?.opacity },
        { name: '--k-ripple-overflow-color', value: toCssColor(ripple?.overflow?.color) },
        { name: '--k-ripple-overflow-opacity', value: ripple?.overflow?.opacity },
        {
          name: '--k-ripple-overflow-static-color',
          value: toCssColor(ripple?.overflowStatic?.color)
        },
        { name: '--k-ripple-overflow-static-opacity', value: ripple?.overflowStatic?.opacity },
        {
          name: '--k-ripple-overflow-static-border-color',
          value: toCssColor(ripple?.overflowStaticBorder?.color)
        },
        {
          name: '--k-ripple-overflow-static-border-opacity',
          value: ripple?.overflowStaticBorder?.opacity
        }
      ]);

      if (tokensCss) {
        const tokensFileName = `tokens.${segment}.${theme}.kiskadee.css`;
        const tokensFilePath = resolve(buildDir, tokensFileName);
        await writeFile(tokensFilePath, tokensCss, 'utf8');
        console.log(`[web-builder] Theme tokens CSS written to: ${tokensFilePath}`);
      }

      if (!background) {
        continue;
      }

      const extraData: { background?: string } = {};
      extraData.background = toCssColor(background);

      const extraFileName = `extra.${segment}.${theme}.kiskadee.json`;
      const extraFilePath = resolve(buildDir, extraFileName);
      await writeFile(extraFilePath, JSON.stringify(extraData, null, 2), 'utf8');
      console.log(`[web-builder] Extra artifact written to: ${extraFilePath}`);
    }
  }
}
