import { mkdir, readdir, unlink, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  ActivationFeedbackEffectSchema,
  ActivationFeedbackThemeTokens,
  HSLA,
  RadiusMode,
  RippleEffectSchema,
  Schema,
  SchemaFonts,
  SegmentName,
  SolidColor,
  TabsBridgeLowerCurve,
  TabsIndicatorPosition,
  TabsIndicatorShape,
  TabsIndicatorWidth,
  TabsTabWidth,
  TabsVariant,
  TextFieldFocusRingColorSource,
  TextFieldLabelOffsetByRadius,
  TextFieldMode,
  TextFieldModeByVariant,
  TextFieldVariant,
  ThemeMode
} from '@kiskadee/core';
import { convertHslaToHex } from '@kiskadee/core';
import { minifyCss } from '@kiskadee/css-build';
import {
  buildLegacySwitchGlobalConfig,
  buildSwitchComponentArtifact,
  SWITCH_COMPONENT_ARTIFACT_PATH,
  type LegacySwitchGlobalConfig
} from '../component-artifacts/switchComponentArtifact.ts';
import { toShortHex } from '../phase-4-convert-style-keys-to-css-rules/utils/toShortHex.ts';
import { type FontStack, toCssFontFamily } from '../utils/fontFamily.ts';

type ExtractableSchema = Schema;

type SegmentKey = SegmentName | string;
type TextFieldOptionsPayload = {
  variant?: TextFieldVariant;
  mode?: TextFieldMode;
  focusRingColorSource?: TextFieldFocusRingColorSource;
};
type TextFieldModeOptionsPayload = {
  labelOffset?: TextFieldLabelOffsetByRadius;
  focusRingColorSource?: TextFieldFocusRingColorSource;
};
type TextFieldModePayload<TMode extends TextFieldMode = TextFieldMode> = Partial<
  Record<TMode, { options?: TextFieldModeOptionsPayload }>
>;
type TextFieldVariantOptionsPayload = {
  focusRingColorSource?: TextFieldFocusRingColorSource;
};
type TextFieldVariantsPayload = {
  [TVariant in TextFieldVariant]?: {
    options?: TextFieldVariantOptionsPayload;
    modes?: TextFieldModePayload<TextFieldModeByVariant[TVariant]>;
  };
};

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

function pickTextFieldModeOptions(options: unknown): TextFieldModeOptionsPayload | undefined {
  const labelOffset = (options as { labelOffset?: TextFieldLabelOffsetByRadius } | undefined)
    ?.labelOffset;
  const focusRingColorSource = (
    options as { focusRingColorSource?: TextFieldFocusRingColorSource } | undefined
  )?.focusRingColorSource;
  return labelOffset || focusRingColorSource
    ? {
        ...(labelOffset ? { labelOffset } : {}),
        ...(focusRingColorSource ? { focusRingColorSource } : {})
      }
    : undefined;
}

function pickTextFieldVariantOptions(options: unknown): TextFieldVariantOptionsPayload | undefined {
  const focusRingColorSource = (
    options as { focusRingColorSource?: TextFieldFocusRingColorSource } | undefined
  )?.focusRingColorSource;
  return focusRingColorSource ? { focusRingColorSource } : undefined;
}

function buildTextFieldVariantsPayload(schema: ExtractableSchema): TextFieldVariantsPayload {
  const textField = schema.components?.textField;
  const standardVariant = textField?.variants?.standard;
  const floatingVariant = textField?.variants?.floating;
  const standardModes = textField?.variants?.standard?.modes;
  const floatingModes = textField?.variants?.floating?.modes;
  const variants: TextFieldVariantsPayload = {};

  const standardOptions = pickTextFieldVariantOptions(standardVariant?.options);
  const standard: TextFieldModePayload<TextFieldModeByVariant['standard']> = {};
  const outlineOptions = pickTextFieldModeOptions(standardModes?.outline?.options);
  const underlineOptions = pickTextFieldModeOptions(standardModes?.underline?.options);
  const borderlessOptions = pickTextFieldModeOptions(standardModes?.borderless?.options);
  if (outlineOptions) standard.outline = { options: outlineOptions };
  if (underlineOptions) standard.underline = { options: underlineOptions };
  if (borderlessOptions) standard.borderless = { options: borderlessOptions };
  if (standardOptions || Object.keys(standard).length > 0) {
    variants.standard = {
      ...(standardOptions ? { options: standardOptions } : {}),
      ...(Object.keys(standard).length > 0 ? { modes: standard } : {})
    };
  }

  const floatingOptions = pickTextFieldVariantOptions(floatingVariant?.options);
  const floating: TextFieldModePayload<TextFieldModeByVariant['floating']> = {};
  const notchedOptions = pickTextFieldModeOptions(floatingModes?.notched?.options);
  const insideOptions = pickTextFieldModeOptions(floatingModes?.inside?.options);
  if (notchedOptions) floating.notched = { options: notchedOptions };
  if (insideOptions) floating.inside = { options: insideOptions };
  if (floatingOptions || Object.keys(floating).length > 0) {
    variants.floating = {
      ...(floatingOptions ? { options: floatingOptions } : {}),
      ...(Object.keys(floating).length > 0 ? { modes: floating } : {})
    };
  }

  return variants;
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
  const ripple = schema.global?.effects?.ripple as RippleEffectSchema | undefined;
  const tabsIndicatorPosition = schema.components?.tabs?.options?.indicatorPosition as
    | TabsIndicatorPosition
    | undefined;
  const tabsIndicatorShape = schema.components?.tabs?.options?.indicatorShape as
    | TabsIndicatorShape
    | undefined;
  const tabsIndicatorWidth = schema.components?.tabs?.options?.indicatorWidth as
    | TabsIndicatorWidth
    | undefined;
  const tabsTabWidth = schema.components?.tabs?.options?.tabWidth as TabsTabWidth | undefined;
  const tabsVariant = schema.components?.tabs?.options?.variant as TabsVariant | undefined;
  const tabsSeparator = schema.components?.tabs?.options?.separator as boolean | undefined;
  const tabsLowerCurve = schema.components?.tabs?.options?.lowerCurve as
    | TabsBridgeLowerCurve
    | undefined;
  const switchComponentArtifact = buildSwitchComponentArtifact(schema);
  const switchGlobalConfig = switchComponentArtifact
    ? buildLegacySwitchGlobalConfig(switchComponentArtifact)
    : undefined;
  const textFieldVariant = schema.components?.textField?.options?.variant as
    | TextFieldVariant
    | undefined;
  const textFieldMode = schema.components?.textField?.options?.mode as TextFieldMode | undefined;
  const textFieldFocusRingColorSource = schema.components?.textField?.options
    ?.focusRingColorSource as TextFieldFocusRingColorSource | undefined;
  const textFieldVariants = buildTextFieldVariantsPayload(schema);

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
  const hasRipple = Boolean(ripple && Object.keys(ripple).length > 0);
  const hasTabsOptions = Boolean(
    tabsIndicatorPosition ||
      tabsIndicatorShape ||
      tabsIndicatorWidth ||
      tabsTabWidth ||
      tabsVariant ||
      tabsSeparator !== undefined ||
      tabsLowerCurve
  );
  const hasSwitchOptions = Boolean(
    switchGlobalConfig && Object.keys(switchGlobalConfig).length > 0
  );
  const hasTextFieldOptions = Boolean(
    textFieldVariant ||
      textFieldMode ||
      textFieldFocusRingColorSource ||
      Object.keys(textFieldVariants).length > 0
  );

  if (
    hasFonts ||
    hasRadius ||
    hasActivationFeedback ||
    hasRipple ||
    hasTabsOptions ||
    hasSwitchOptions ||
    hasTextFieldOptions
  ) {
    await mkdir(buildDir, { recursive: true });
    const globalFilePath = resolve(buildDir, 'global.kiskadee.json');

    const globalPayload: {
      fonts?: { body: string; heading?: string };
      radius?: RadiusMode;
      effects?: {
        activationFeedback?: ActivationFeedbackEffectSchema;
        ripple?: RippleEffectSchema;
      };
      components?: {
        tabs?: {
          options?: {
            variant?: TabsVariant;
            indicatorPosition?: TabsIndicatorPosition;
            indicatorShape?: TabsIndicatorShape;
            indicatorWidth?: TabsIndicatorWidth;
            tabWidth?: TabsTabWidth;
            separator?: boolean;
            lowerCurve?: TabsBridgeLowerCurve;
          };
        };
        switch?: LegacySwitchGlobalConfig;
        textField?: {
          options?: TextFieldOptionsPayload;
          variants?: TextFieldVariantsPayload;
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

    if (hasActivationFeedback && activationFeedback) {
      globalPayload.effects = {
        ...(globalPayload.effects ?? {}),
        activationFeedback
      };
    }

    if (hasRipple && ripple) {
      globalPayload.effects = {
        ...(globalPayload.effects ?? {}),
        ripple
      };
    }

    if (hasTabsOptions || hasSwitchOptions || hasTextFieldOptions) {
      globalPayload.components = {
        ...(globalPayload.components ?? {}),
        ...(hasTabsOptions
          ? {
              tabs: {
                options: {
                  ...(tabsVariant ? { variant: tabsVariant } : {}),
                  ...(tabsIndicatorPosition ? { indicatorPosition: tabsIndicatorPosition } : {}),
                  ...(tabsIndicatorShape ? { indicatorShape: tabsIndicatorShape } : {}),
                  ...(tabsIndicatorWidth ? { indicatorWidth: tabsIndicatorWidth } : {}),
                  ...(tabsTabWidth ? { tabWidth: tabsTabWidth } : {}),
                  ...(tabsSeparator !== undefined ? { separator: tabsSeparator } : {}),
                  ...(tabsLowerCurve ? { lowerCurve: tabsLowerCurve } : {})
                }
              }
            }
          : {}),
        ...(hasSwitchOptions
          ? {
              switch: switchGlobalConfig!
            }
          : {}),
        ...(hasTextFieldOptions
          ? {
              textField: {
                options: {
                  ...(textFieldVariant ? { variant: textFieldVariant } : {}),
                  ...(textFieldMode ? { mode: textFieldMode } : {}),
                  ...(textFieldFocusRingColorSource
                    ? { focusRingColorSource: textFieldFocusRingColorSource }
                    : {})
                },
                ...(Object.keys(textFieldVariants).length > 0
                  ? { variants: textFieldVariants }
                  : {})
              }
            }
          : {})
      };
    }

    await writeFile(globalFilePath, JSON.stringify(globalPayload, null, 2), 'utf8');
    // console.log(`[web-builder] Global artifact written to: ${globalFilePath}`);
  }

  if (switchComponentArtifact) {
    const componentArtifactPath = resolve(buildDir, SWITCH_COMPONENT_ARTIFACT_PATH);
    await mkdir(dirname(componentArtifactPath), { recursive: true });
    await writeFile(componentArtifactPath, JSON.stringify(switchComponentArtifact, null, 2), 'utf8');
    // console.log(`[web-builder] Switch component artifact written to: ${componentArtifactPath}`);
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
    await writeFile(globalTokensFilePath, await minifyCss(globalTokensCss), 'utf8');
    // console.log(`[web-builder] Global tokens CSS written to: ${globalTokensFilePath}`);
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
                      activationFeedback?: ActivationFeedbackThemeTokens;
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
      const activationFeedback = themeTokens?.effects?.activationFeedback;
      const ripple = themeTokens?.effects?.ripple;
      const tokensCss = buildRootTokensCss([
        { name: '--k-focus-color', value: toCssColor(color) },
        { name: '--k-af-token-color', value: toCssColor(activationFeedback?.color) },
        { name: '--k-af-token-opacity', value: activationFeedback?.opacity },
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
