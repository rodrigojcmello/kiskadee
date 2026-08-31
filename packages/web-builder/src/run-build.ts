import { mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateSchemaComponentContracts } from '@kiskadee/core';
import { validateSchemaGlobalFontContract } from '@kiskadee/core/font-contract';
import { validateSchemaForegroundsContract } from '@kiskadee/core/foreground-contract';
import { validateSchemaGlobalIconContract } from '@kiskadee/core/icon-contract';
import { validateSchemaIconSizesContract } from '@kiskadee/core/icon-size-contract';
import { validateSchemaPresenceContract } from '@kiskadee/core/presence-contract';
import { validateSchemaSeparatorsContract } from '@kiskadee/core/separator-contract';
import { validateSchemaTypographyContract } from '@kiskadee/core/typography-contract';
import { buildOptionalBrandPacksForPreset } from './brand-packs/buildBrandPacks.ts';
import { convertElementSchemaToStyleKeys } from './phase-1-convert-schema-to-style-keys/convertElementSchemaToStyleKeys.ts';
import {
  mapStyleKeyUsage,
  type StyleKeyUsageMap
} from './phase-2-map-style-key-usage/mapStyleKeyUsage.ts';
import {
  type ShortenCssClassNames,
  shortenCssClassNames
} from './phase-3-shorten-css-class-names/shortenCssClassNames.ts';
import { generateCssSplit } from './phase-4-convert-style-keys-to-css-rules/generateCssSplit.ts';
import {
  type ComponentClassNameMapSplit,
  generateClassNamesMapSplit
} from './phase-5-generate-class-names-map/generateClassNamesMap.ts';
import { persistBuildArtifacts } from './phase-6-persist-build-artifacts/persistBuildArtifacts.ts';
import { publishMetadata } from './phase-7-publish-metadata/publishMetadata.ts';
import { writeExtraArtifacts } from './phase-8-write-extra-artifacts/writeExtraArtifacts.ts';
import {
  DEFAULT_WEB_STYLE_EMISSION_POLICY,
  validateSeparatorStyleEmissionPolicy
} from './style-emission/web-build-policy.ts';
import {
  buildTextTypographyClassMap,
  buildTypographyArtifact
} from './typography/compileTypography.ts';
import { loadPresetsToBuild } from './utils/loadPresetsToBuild.ts';

// Feature flag simples para controlar o uso de prefixo nos nomes de classes CSS
// Ajuste para `false` caso queira desativar o prefixo sem alterar o restante do código.
const ENABLE_CLASSNAME_PREFIX = true;

// Feature flag: quando `true`, força `boxColor` sólido a ser emitido como `linear-gradient(...)`
// com 2 stops (mesma cor), para permitir transição suave entre Design Systems que alternam
// entre sólido vs gradiente.
//
// Por padrão fica `false` para não aumentar CSS nem alterar o output atual.
const ENABLE_SOLID_BOX_COLOR_AS_GRADIENT = false;

// Feature flag: collapse raw and mirrored style-emission identities into one mirrored class
//
// When `true`, a shared direct+mirrored style key/value pair is emitted only once in mirrored form.
// Keep this enabled for production artifacts, but disabled in lower-level helpers/tests by default
// so raw builder inspection can still show the separation when needed.
const ENABLE_COLLAPSE_DIRECT_INTO_MIRRORED = false;

function slugifyName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// All build artifacts for @kiskadee/web-builder (including metadata) are
// meant to live under packages/web-builder/build. This path is the single
// source of truth and is also consumed by the sync-showcase-artifacts script.
//
// __dirname -> packages/web-builder/src
// ..        -> packages/web-builder
// build     -> packages/web-builder/build
const baseBuildDir = resolve(__dirname, '..', 'build');

export async function runBuild(): Promise<void> {
  const presetsToBuild = await loadPresetsToBuild(__dirname);

  for (const t of presetsToBuild) {
    const { schema, schemaPath } = t;

    try {
      validateSchemaForegroundsContract(schema);
    } catch (error) {
      throw new Error(`[web-builder] Invalid foreground contract in ${schemaPath}`, {
        cause: error
      });
    }

    try {
      validateSchemaGlobalFontContract(schema);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Schema global font contract validation failed for "${schema.name}" (${schemaPath}).\n${message}`
      );
    }

    try {
      validateSchemaGlobalIconContract(schema);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Schema global icon contract validation failed for "${schema.name}" (${schemaPath}).\n${message}`
      );
    }

    try {
      validateSchemaIconSizesContract(schema);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Schema icon size contract validation failed for "${schema.name}" (${schemaPath}).\n${message}`
      );
    }

    try {
      validateSchemaTypographyContract(schema);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Schema typography contract validation failed for "${schema.name}" (${schemaPath}).\n${message}`
      );
    }

    try {
      validateSchemaSeparatorsContract(schema);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Schema separator contract validation failed for "${schema.name}" (${schemaPath}).\n${message}`
      );
    }

    try {
      validateSchemaPresenceContract(schema);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Schema presence effect contract validation failed for "${schema.name}" (${schemaPath}).\n${message}`
      );
    }

    try {
      validateSchemaComponentContracts(schema);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Schema component contract validation failed for "${schema.name}" (${schemaPath}).\n${message}`
      );
    }

    try {
      validateSeparatorStyleEmissionPolicy(schema, DEFAULT_WEB_STYLE_EMISSION_POLICY);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Separator style-emission policy validation failed for "${schema.name}" (${schemaPath}).\n${message}`
      );
    }
  }

  await rm(baseBuildDir, { recursive: true, force: true });
  await mkdir(baseBuildDir, { recursive: true });

  for (const t of presetsToBuild) {
    const { schema, schemaPath, buildExtensions } = t;

    // One concise log per preset, e.g. "[web-builder] Material Design 3.0.0 by Google"
    const presetVersion = Array.isArray(schema.version) ? schema.version.join('.') : '';
    const presetAuthor = schema.author ? ` by ${schema.author}` : '';
    console.log(`[web-builder] ${schema.name} ${presetVersion}${presetAuthor}`);

    // Phase 1 - Convert Element Schema to Style Keys
    const { styleKeys, toneMetadataByPalette, typographyBuild } =
      convertElementSchemaToStyleKeys(schema);
    // console.log('phase 1', { name: schema.name, styleKeys: JSON.stringify(styleKeys, null, 2) });

    // Phase 2 - Map style key usage
    const styleKeyUsage: StyleKeyUsageMap = mapStyleKeyUsage(styleKeys, {
      webStyleEmissionPolicy: DEFAULT_WEB_STYLE_EMISSION_POLICY,
      collapseDirectIntoMirrored: ENABLE_COLLAPSE_DIRECT_INTO_MIRRORED,
      additionalStyleKeys: typographyBuild?.additionalCoreStyleKeys
    });
    // console.log('phase  2', { name: schema.name, styleKeyUsage });

    // Phase 3 - Shorten class names
    // Optionally prefixes classes using the schema's configured prefix
    // (SchemaMetadata.prefix). When no explicit prefix is provided, falls back
    // to the previous behavior using lowercase schema name to maintain
    // compatibility and isolation per template/design system.
    const rawPrefix = ENABLE_CLASSNAME_PREFIX
      ? (schema.prefix ?? slugifyName(schema.name))
      : undefined;
    const classNamePrefix = rawPrefix ? slugifyName(rawPrefix) : undefined;

    const shortenCssClassNameMap: ShortenCssClassNames = shortenCssClassNames(styleKeyUsage, {
      prefix: classNamePrefix ? `${classNamePrefix}-` : undefined
    });
    // console.log('phase 3', { name: schema.name, shortenCssClassNameMap });

    // Phase 4 - Generate CSS split
    const cssGenerated = await generateCssSplit(styleKeys, shortenCssClassNameMap, {
      // Projected state selectors are production runtime selectors, not showcase-only output.
      forceState: true,
      enableSolidBoxColorAsGradient: ENABLE_SOLID_BOX_COLOR_AS_GRADIENT,
      webStyleEmissionPolicy: DEFAULT_WEB_STYLE_EMISSION_POLICY,
      collapseDirectIntoMirrored: ENABLE_COLLAPSE_DIRECT_INTO_MIRRORED,
      breakpoints: schema.breakpoints,
      additionalCoreStyleKeys: typographyBuild?.additionalCoreStyleKeys
    });
    // console.log('phase 4', { name: schema.name, cssGenerated });

    // Phase 5 - Generate class names map split
    const classNamesMapSplit: ComponentClassNameMapSplit = generateClassNamesMapSplit(
      styleKeys,
      shortenCssClassNameMap,
      toneMetadataByPalette,
      {
        webStyleEmissionPolicy: DEFAULT_WEB_STYLE_EMISSION_POLICY,
        collapseDirectIntoMirrored: ENABLE_COLLAPSE_DIRECT_INTO_MIRRORED
      }
    );
    // console.log('phrase 5', { name: schema.name, classNamesMapSplit });

    // Compute out dir
    const major = schema.version[0];
    const outDirSlug = `${slugifyName(schema.name)}-${major}-${slugifyName(schema.author || '')}`;

    // Phase 6 - Persist CSS & maps
    await persistBuildArtifacts(cssGenerated, classNamesMapSplit, outDirSlug);

    const typographyArtifact = typographyBuild
      ? buildTypographyArtifact(typographyBuild, shortenCssClassNameMap)
      : undefined;

    // Phase 7 - Publish manifest + raw schema/segments
    await publishMetadata({
      schema,
      outDirSlug,
      schemaPath: schemaPath,
      baseBuildDir,
      classNamesMap: classNamesMapSplit,
      brandPacks: buildExtensions?.brandPacks?.packs
    });

    // Phase 8 - Write extra artifacts
    await writeExtraArtifacts({
      schema,
      outDirSlug,
      typographyArtifact,
      textTypographyClassMap: typographyArtifact
        ? buildTextTypographyClassMap(typographyArtifact)
        : undefined
    });

    // Optional brand packs are deliberately published outside the preset's
    // global CSS, colors catalog, and normal component class maps.
    await buildOptionalBrandPacksForPreset({
      schema,
      extension: buildExtensions?.brandPacks,
      outDirSlug,
      baseBuildDir
    });
  }
}

// Standalone execution: `node ./src/run-build.ts`
if (import.meta.url === `file://${process.argv[1]}`) {
  await runBuild();
}
