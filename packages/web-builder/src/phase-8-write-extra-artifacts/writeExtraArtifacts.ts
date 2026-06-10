import { mkdir, readdir, unlink, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  ActivationFeedbackEffectSchema,
  ActivationFeedbackThemeTokens,
  HSLA,
  RadiusMode,
  Schema,
  SchemaFonts,
  SegmentName,
  SolidColor,
  ThemeMode
} from '@kiskadee/core';
import { convertHslaToHex } from '@kiskadee/core';
import { minifyCss } from '@kiskadee/css-build';
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
import { toShortHex } from '../phase-4-convert-style-keys-to-css-rules/utils/toShortHex.ts';
import { type FontStack, toCssFontFamily } from '../utils/fontFamily.ts';

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

  if (!palettes?.[segment]) {
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

async function cleanStaleComponentArtifacts(buildDir: string): Promise<void> {
  const componentsDir = resolve(buildDir, 'components');

  try {
    const existingFiles = await readdir(componentsDir);
    await Promise.all(
      existingFiles
        .filter((fileName) => fileName.endsWith('.kiskadee.json'))
        .map(async (fileName) => {
          try {
            await unlink(resolve(componentsDir, fileName));
          } catch (error) {
            if (hasErrnoCode(error, 'ENOENT')) return;
            throw error;
          }
        })
    );
  } catch (error) {
    if (hasErrnoCode(error, 'ENOENT')) return;
    throw error;
  }
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
    await cleanStaleComponentArtifacts(buildDir);
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
  //    any global metadata (fonts, radius, effect behavior...). It is meant as descriptive
  //    metadata capturing global design system intentions.
  const fonts = schema.global?.fonts as SchemaFonts | undefined;
  const focus = schema.global?.focus as { width?: number; offset?: number } | undefined;
  const radius = schema.global?.radius as RadiusMode | undefined;
  const activationFeedback = schema.global?.effects?.activationFeedback as
    | ActivationFeedbackEffectSchema
    | undefined;
  const switchComponentArtifact = buildSwitchComponentArtifact(schema);
  const tabsComponentArtifact = buildTabsComponentArtifact(schema);
  const textFieldComponentArtifact = buildTextFieldComponentArtifact(schema);

  function toCssFontFamilyString(value: FontStack): string | null {
    const css = toCssFontFamily(value);
    return css.trim() ? css : null;
  }

  const bodyCss = fonts ? toCssFontFamilyString(fonts.body as FontStack) : null;
  const headingCssRaw = fonts?.heading ? toCssFontFamilyString(fonts.heading as FontStack) : null;
  const headingCss = headingCssRaw ?? bodyCss;

  const hasFonts = Boolean(bodyCss);
  const hasRadius = Boolean(radius);
  const hasActivationFeedback = Boolean(
    activationFeedback && Object.keys(activationFeedback).length > 0
  );
  if (hasFonts || hasRadius || hasActivationFeedback) {
    await mkdir(buildDir, { recursive: true });
    const globalFilePath = resolve(buildDir, 'global.kiskadee.json');

    const globalPayload: {
      fonts?: { body: string; heading?: string };
      radius?: RadiusMode;
      effects?: {
        activationFeedback?: ActivationFeedbackEffectSchema;
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

    if (hasActivationFeedback && activationFeedback) {
      globalPayload.effects = {
        ...(globalPayload.effects ?? {}),
        activationFeedback
      };
    }

    await writeFile(globalFilePath, JSON.stringify(globalPayload, null, 2), 'utf8');
    // console.log(`[web-builder] Global artifact written to: ${globalFilePath}`);
  }

  const componentArtifacts = [
    { artifact: switchComponentArtifact, path: SWITCH_COMPONENT_ARTIFACT_PATH },
    { artifact: tabsComponentArtifact, path: TABS_COMPONENT_ARTIFACT_PATH },
    { artifact: textFieldComponentArtifact, path: TEXT_FIELD_COMPONENT_ARTIFACT_PATH }
  ];

  for (const { artifact, path } of componentArtifacts) {
    if (!artifact) continue;
    const componentArtifactPath = resolve(buildDir, path);
    await mkdir(dirname(componentArtifactPath), { recursive: true });
    await writeFile(componentArtifactPath, JSON.stringify(artifact, null, 2), 'utf8');
  }

  // Global design tokens consumed directly by CSS (no runtime setProperty/removeProperty).
  const globalTokensCss = buildRootTokensCss([
    { name: '--k-focus-width', value: focus?.width },
    { name: '--k-focus-offset', value: focus?.offset }
  ]);

  if (globalTokensCss) {
    await mkdir(buildDir, { recursive: true });
    const globalTokensFilePath = resolve(buildDir, 'tokens.kiskadee.css');
    await writeFile(globalTokensFilePath, await minifyCss(globalTokensCss), 'utf8');
    // console.log(`[web-builder] Global tokens CSS written to: ${globalTokensFilePath}`);
  }

  if (!schema.themeTokens?.palettes) {
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
                      activationFeedback?: ActivationFeedbackThemeTokens;
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
      const activationFeedback = themeTokens?.effects?.activationFeedback;
      const activationFeedbackSubtle = activationFeedback?.surfaceTone?.subtle;
      const activationFeedbackVivid = activationFeedback?.surfaceTone?.vivid;
      const activationFeedbackSubtleColor = activationFeedbackSubtle?.color ?? activationFeedback?.color;
      const activationFeedbackSubtleOpacity =
        activationFeedbackSubtle?.opacity ?? activationFeedback?.opacity;
      const tokensCss = buildRootTokensCss([
        { name: '--k-focus-color', value: toCssColor(color) },
        { name: '--k-af-subtle-color', value: toCssColor(activationFeedbackSubtleColor) },
        { name: '--k-af-subtle-opacity', value: activationFeedbackSubtleOpacity },
        { name: '--k-af-vivid-color', value: toCssColor(activationFeedbackVivid?.color) },
        { name: '--k-af-vivid-opacity', value: activationFeedbackVivid?.opacity },
        { name: '--k-af-token-color', value: toCssColor(activationFeedbackSubtleColor) },
        { name: '--k-af-token-opacity', value: activationFeedbackSubtleOpacity }
      ]);

      if (tokensCss) {
        const tokensFileName = `tokens.${segment}.${theme}.kiskadee.css`;
        const tokensFilePath = resolve(buildDir, tokensFileName);
        await writeFile(tokensFilePath, await minifyCss(tokensCss), 'utf8');
        // console.log(`[web-builder] Theme tokens CSS written to: ${tokensFilePath}`);
      }

      if (!background) {
        continue;
      }

      const extraData: { background?: string } = {};
      extraData.background = toCssColor(background);

      const extraFileName = `extra.${segment}.${theme}.kiskadee.json`;
      const extraFilePath = resolve(buildDir, extraFileName);
      await writeFile(extraFilePath, JSON.stringify(extraData, null, 2), 'utf8');
      // console.log(`[web-builder] Extra artifact written to: ${extraFilePath}`);
    }
  }
}
