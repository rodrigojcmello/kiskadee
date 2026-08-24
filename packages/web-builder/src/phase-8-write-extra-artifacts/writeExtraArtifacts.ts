import { mkdir, readdir, unlink, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  ActivationFeedbackEffectSchema,
  ActivationFeedbackSetting,
  ActivationFeedbackThemeTokens,
  BottomSheetOptions,
  ButtonOptions,
  ContentSurfaceContextMap,
  DropdownOptions,
  FontStack,
  GlobalClassNameMapJSON,
  RadiusMode,
  ResolvedDropdownPresenceEffect,
  Schema,
  SchemaFonts,
  SchemaIconSizes,
  SchemaIcons,
  SegmentName,
  ShadowEffectSchema,
  ShadowGlobalEffectSchema,
  SolidColor,
  ThemeMode
} from '@kiskadee/core';
import { minifyCss } from '@kiskadee/css-build';
import {
  buildCardComponentArtifact,
  CARD_COMPONENT_ARTIFACT_PATH
} from '../component-artifacts/cardComponentArtifact.ts';
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
import {
  TYPOGRAPHY_ARTIFACT_PATH,
  type TypographyArtifact
} from '../typography/typographyArtifact.ts';
import { SYSTEM_MONOSPACE_FONT_STACK, toCssFontFamily } from '../utils/fontFamily.ts';

type ExtractableSchema = Schema;

type SegmentKey = SegmentName | string;
type ComponentEffectArtifact = {
  contentSurfaceContext?: ContentSurfaceContextMap;
  effects?: {
    activationFeedback?: ActivationFeedbackSetting;
    presence?: ResolvedDropdownPresenceEffect;
    shadow?: ShadowEffectSchema;
  };
  options?: BottomSheetOptions | ButtonOptions | DropdownOptions;
};
type ComponentEffectArtifactName =
  | 'bottomSheet'
  | 'badge'
  | 'button'
  | 'card'
  | 'chip'
  | 'dropdown'
  | 'slider'
  | 'switch';

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

function buildDropdownPresenceEffect(
  schema: ExtractableSchema
): ResolvedDropdownPresenceEffect | undefined {
  const presence = schema.global?.effects?.presence;
  const dropdownPresence = schema.components?.dropdown?.effects?.presence;
  if (!presence || !dropdownPresence) return undefined;

  return {
    profile: dropdownPresence.profile,
    profiles: presence.profiles
  };
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
                focusColor?: SolidColor;
                background?: SolidColor;
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
  return value;
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

function requireFontFamilyStack(
  fonts: SchemaFonts,
  familyId: string,
  role: keyof SchemaFonts['roles']
): FontStack {
  const family = fonts.families[familyId];
  if (!Object.hasOwn(fonts.families, familyId) || !family) {
    throw new Error(`[web-builder] Font role "${role}" references unknown family "${familyId}".`);
  }

  return family.stack;
}

/**
 * What
 *     Resolves schema font roles into global CSS custom-property declarations.
 * Why
 *     CSS consumers need deterministic heading and code fallbacks without synthetic catalog IDs.
 */
export function buildFontTokenVariables(
  fonts: SchemaFonts | undefined
): ReadonlyArray<{ name: string; value: string }> {
  if (!fonts) return [];

  const bodyStack = requireFontFamilyStack(fonts, fonts.roles.body, 'body');
  const headingStack = fonts.roles.heading
    ? requireFontFamilyStack(fonts, fonts.roles.heading, 'heading')
    : undefined;
  const codeStack = fonts.roles.code
    ? requireFontFamilyStack(fonts, fonts.roles.code, 'code')
    : SYSTEM_MONOSPACE_FONT_STACK;

  return [
    { name: '--k-font-body', value: toCssFontFamily(bodyStack) },
    {
      name: '--k-font-heading',
      value: headingStack ? toCssFontFamily(headingStack) : 'var(--k-font-body)'
    },
    { name: '--k-font-code', value: toCssFontFamily(codeStack) }
  ];
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
  typographyArtifact?: TypographyArtifact;
  textTypographyClassMap?: NonNullable<GlobalClassNameMapJSON['text']>;
}): Promise<void> {
  const { schema, outDirSlug, textTypographyClassMap, typographyArtifact } = params as {
    schema: ExtractableSchema;
    outDirSlug: string;
    typographyArtifact?: TypographyArtifact;
    textTypographyClassMap?: NonNullable<GlobalClassNameMapJSON['text']>;
  };

  const buildDir = getBuildDir(outDirSlug);

  // Clean stale global/extra/token artifacts from previous builds so the output
  // always reflects the current schema and doesn't keep dead files around.
  try {
    const existingFiles = await readdir(buildDir);
    const isExtraArtifact = (fileName: string): boolean =>
      fileName === 'global.kiskadee.json' ||
      fileName === TYPOGRAPHY_ARTIFACT_PATH ||
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
  const icons = schema.global?.icons as SchemaIcons | undefined;
  const iconSizes = schema.global?.iconSizes as SchemaIconSizes | undefined;
  const focus = schema.global?.focus as { width?: number; offset?: number } | undefined;
  const radius = schema.global?.radius as RadiusMode | undefined;
  const activationFeedback = schema.global?.effects?.activationFeedback as
    | ActivationFeedbackEffectSchema
    | undefined;
  const shadow = schema.global?.effects?.shadow as ShadowGlobalEffectSchema | undefined;
  const componentEffectOverrides: Partial<
    Record<ComponentEffectArtifactName, ComponentEffectArtifact>
  > = {};
  const getComponentEffects = (
    componentName: ComponentEffectArtifactName
  ): NonNullable<ComponentEffectArtifact['effects']> => {
    const current = componentEffectOverrides[componentName] ?? {};
    current.effects ??= {};
    componentEffectOverrides[componentName] = current;
    return current.effects;
  };

  if (schema.components?.button?.effects?.activationFeedback !== undefined) {
    getComponentEffects('button').activationFeedback =
      schema.components.button.effects.activationFeedback;
  }

  if (schema.components?.button?.contentSurfaceContext !== undefined) {
    const buttonArtifact = componentEffectOverrides.button ?? {};
    buttonArtifact.contentSurfaceContext = schema.components.button.contentSurfaceContext;
    componentEffectOverrides.button = buttonArtifact;
  }

  if (schema.components?.bottomSheet?.effects?.shadow !== undefined) {
    getComponentEffects('bottomSheet').shadow = schema.components.bottomSheet.effects.shadow;
  }

  if (schema.components?.bottomSheet?.options !== undefined) {
    const bottomSheetArtifact = componentEffectOverrides.bottomSheet ?? {};
    bottomSheetArtifact.options = schema.components.bottomSheet.options;
    componentEffectOverrides.bottomSheet = bottomSheetArtifact;
  }

  if (schema.components?.button?.effects?.shadow !== undefined) {
    getComponentEffects('button').shadow = schema.components.button.effects.shadow;
  }

  if (schema.components?.button?.options !== undefined) {
    const buttonArtifact = componentEffectOverrides.button ?? {};
    buttonArtifact.options = schema.components.button.options;
    componentEffectOverrides.button = buttonArtifact;
  }

  if (schema.components?.card?.effects?.shadow !== undefined) {
    getComponentEffects('card').shadow = schema.components.card.effects.shadow;
  }

  if (schema.components?.card?.contentSurfaceContext !== undefined) {
    const cardArtifact = componentEffectOverrides.card ?? {};
    cardArtifact.contentSurfaceContext = schema.components.card.contentSurfaceContext;
    componentEffectOverrides.card = cardArtifact;
  }

  if (schema.components?.chip?.contentSurfaceContext !== undefined) {
    const chipArtifact = componentEffectOverrides.chip ?? {};
    chipArtifact.contentSurfaceContext = schema.components.chip.contentSurfaceContext;
    componentEffectOverrides.chip = chipArtifact;
  }

  const dropdownPresence = buildDropdownPresenceEffect(schema);
  if (dropdownPresence) {
    getComponentEffects('dropdown').presence = dropdownPresence;
  }
  if (schema.components?.dropdown?.options !== undefined) {
    const dropdownArtifact = componentEffectOverrides.dropdown ?? {};
    dropdownArtifact.options = schema.components.dropdown.options;
    componentEffectOverrides.dropdown = dropdownArtifact;
  }

  if (schema.components?.slider?.effects?.activationFeedback !== undefined) {
    getComponentEffects('slider').activationFeedback =
      schema.components.slider.effects.activationFeedback;
  }

  if (schema.components?.switch?.effects?.activationFeedback !== undefined) {
    getComponentEffects('switch').activationFeedback =
      schema.components.switch.effects.activationFeedback;
  }

  if (schema.components?.switch?.effects?.shadow !== undefined) {
    getComponentEffects('switch').shadow = schema.components.switch.effects.shadow;
  }

  const sliderComponentArtifact = buildSliderComponentArtifact(schema);
  const cardComponentArtifact = buildCardComponentArtifact(schema);
  const switchComponentArtifact = buildSwitchComponentArtifact(schema);
  const tabsComponentArtifact = buildTabsComponentArtifact(schema);
  const textFieldComponentArtifact = buildTextFieldComponentArtifact(schema);

  const hasFonts = Boolean(fonts);
  const hasIcons = Boolean(icons);
  const hasIconSizes = Boolean(iconSizes);
  const hasRadius = Boolean(radius);
  const hasActivationFeedback = Boolean(
    activationFeedback && Object.keys(activationFeedback).length > 0
  );
  const hasShadow = Boolean(
    shadow &&
      (Object.keys(shadow.outer?.levels ?? {}).length > 0 ||
        Object.keys(shadow.inner?.levels ?? {}).length > 0)
  );
  const hasComponentEffectOverrides = Object.keys(componentEffectOverrides).length > 0;
  const hasTextTypographyClassMap = Boolean(textTypographyClassMap);
  if (
    hasFonts ||
    hasIcons ||
    hasIconSizes ||
    hasRadius ||
    hasActivationFeedback ||
    hasShadow ||
    hasComponentEffectOverrides ||
    hasTextTypographyClassMap
  ) {
    await mkdir(buildDir, { recursive: true });
    const globalFilePath = resolve(buildDir, 'global.kiskadee.json');

    const globalPayload: {
      fonts?: SchemaFonts;
      iconSizes?: SchemaIconSizes;
      icons?: SchemaIcons;
      radius?: RadiusMode;
      effects?: {
        activationFeedback?: ActivationFeedbackEffectSchema;
        shadow?: ShadowGlobalEffectSchema;
      };
      components?: Partial<Record<ComponentEffectArtifactName, ComponentEffectArtifact>>;
      classMap?: GlobalClassNameMapJSON;
    } = {};

    if (fonts) {
      globalPayload.fonts = fonts;
    }

    if (icons) {
      globalPayload.icons = icons;
    }

    if (iconSizes) {
      globalPayload.iconSizes = iconSizes;
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

    if (hasShadow && shadow) {
      globalPayload.effects = {
        ...(globalPayload.effects ?? {}),
        shadow
      };
    }

    if (hasComponentEffectOverrides) {
      globalPayload.components = componentEffectOverrides;
    }

    if (textTypographyClassMap) {
      globalPayload.classMap = { text: textTypographyClassMap };
    }

    await writeFile(globalFilePath, JSON.stringify(globalPayload, null, 2), 'utf8');
    // console.log(`[web-builder] Global artifact written to: ${globalFilePath}`);
  }

  const componentArtifacts = [
    { artifact: cardComponentArtifact, path: CARD_COMPONENT_ARTIFACT_PATH },
    { artifact: sliderComponentArtifact, path: SLIDER_COMPONENT_ARTIFACT_PATH },
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

  if (typographyArtifact) {
    await mkdir(buildDir, { recursive: true });
    await writeFile(
      resolve(buildDir, TYPOGRAPHY_ARTIFACT_PATH),
      JSON.stringify(typographyArtifact, null, 2),
      'utf8'
    );
  }

  // Global design tokens consumed directly by CSS (no runtime setProperty/removeProperty).
  const globalTokensCss = buildRootTokensCss([
    ...buildFontTokenVariables(fonts),
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
      const activationFeedbackSubtle = activationFeedback?.tone?.subtle;
      const activationFeedbackVivid = activationFeedback?.tone?.vivid;
      const tokensCss = buildRootTokensCss([
        { name: '--k-focus-color', value: toCssColor(color) },
        { name: '--k-af-subtle-color', value: toCssColor(activationFeedbackSubtle?.color) },
        { name: '--k-af-subtle-opacity', value: activationFeedbackSubtle?.opacity },
        { name: '--k-af-vivid-color', value: toCssColor(activationFeedbackVivid?.color) },
        { name: '--k-af-vivid-opacity', value: activationFeedbackVivid?.opacity }
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
