import * as fs from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  ColorScaleDark,
  ColorScaleLight,
  DarkTrackTones,
  EmphasisLevel,
  HSLA,
  HueName,
  LightTrackTones
} from '@kiskadee/core';
import {
  argbFromHex,
  CorePalette,
  Hct,
  hexFromArgb,
  SchemeContent,
  SchemeExpressive,
  SchemeFidelity,
  SchemeFruitSalad,
  SchemeMonochrome,
  SchemeNeutral,
  SchemeRainbow,
  SchemeTonalSpot,
  SchemeVibrant
} from '@material/material-color-utilities';
import { resolveHueNameFromHsla } from '../utils/resolveHueName.ts';

type MaterialTonalPalette = {
  tone: (tone: number) => number;
};

type MaterialPaletteKey = 'a1' | 'a2' | 'a3' | 'n1' | 'n2' | 'error';
type PaletteVersion = 'v1' | 'v2' | 'v3' | 'v4';

type MaterialColorMode =
  | 'static'
  | 'static-content'
  | 'dynamic'
  | 'dynamic-content'
  | 'dynamic-expressive'
  | 'dynamic-vibrant'
  | 'dynamic-fidelity'
  | 'dynamic-neutral'
  | 'dynamic-monochrome'
  | 'dynamic-rainbow'
  | 'dynamic-fruit-salad';

type GenerateMaterialColorArtifactsOptions = {
  primaryHex: string;
  mode?: MaterialColorMode;
  secondaryHex?: string;
  tertiaryHex?: string;
  outDir?: string;
};

const EMITTED_SUBTLE_TONES: LightTrackTones[] = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 20, 25, 30
];

const EMITTED_VIVID_TONES: DarkTrackTones[] = [
  35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100
];

const REFERENCE_TONE = 60;

function normalizeHex(hex: string): string {
  return `#${hex.trim().replace(/^#/, '').toLowerCase()}`;
}

function hexToHSLA(hex: string): HSLA {
  let cleanHex = hex.trim().replace(/^#/, '').toLowerCase();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (cleanHex.length !== 6) {
    cleanHex = '000000';
  }

  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  const lightness = (max + min) / 2;

  let saturation = 0;
  if (delta !== 0) {
    saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  }

  let hue = 0;
  if (delta !== 0) {
    if (max === r) {
      hue = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
    } else if (max === g) {
      hue = ((b - r) / delta + 2) / 6;
    } else {
      hue = ((r - g) / delta + 4) / 6;
    }
  }

  const hueInDegrees = Number((hue * 360).toFixed(2));
  const saturationPercent = Number((saturation * 100).toFixed(2));
  const lightnessPercent = Number((lightness * 100).toFixed(2));

  return [hueInDegrees, saturationPercent, lightnessPercent, 1];
}

function materialToneFromScaleTone(tone: number, invertScale: boolean): number {
  return invertScale ? tone : 100 - tone;
}

function resolveEmphasisLevelFromPalette(params: {
  palette: MaterialTonalPalette;
  invertScale: boolean;
}): EmphasisLevel {
  const { palette, invertScale } = params;

  const subtle: ColorScaleLight = {};
  const vivid: ColorScaleDark = {};

  const resolveHslaAtTone = (tone: number): HSLA => {
    const materialTone = materialToneFromScaleTone(tone, invertScale);
    const argb = palette.tone(materialTone);
    const hex = hexFromArgb(argb);
    return hexToHSLA(hex);
  };

  for (const tone of EMITTED_SUBTLE_TONES) {
    subtle[tone] = resolveHslaAtTone(tone);
  }

  for (const tone of EMITTED_VIVID_TONES) {
    vivid[tone] = resolveHslaAtTone(tone);
  }

  subtle[0] = invertScale ? [0, 0, 0, 1] : [0, 0, 100, 1];
  vivid[100] = invertScale ? [0, 0, 100, 1] : [0, 0, 0, 1];

  return { subtle, vivid };
}

function formatEmphasisLevel(emphasis: EmphasisLevel): string {
  const subtleLines: string[] = [];
  const vividLines: string[] = [];

  subtleLines.push('  subtle: {');
  for (const tone of EMITTED_SUBTLE_TONES) {
    const color = emphasis.subtle[tone];
    if (!color) continue;
    subtleLines.push(`    ${tone}: [${(color as HSLA).join(', ')}],`);
  }
  subtleLines.push('  },');

  vividLines.push('  vivid: {');
  for (const tone of EMITTED_VIVID_TONES) {
    const color = emphasis.vivid[tone];
    if (!color) continue;
    vividLines.push(`    ${tone}: [${(color as HSLA).join(', ')}],`);
  }
  vividLines.push('  }');

  return ['{', ...subtleLines, ...vividLines, '}'].join('\n');
}

function resolveHueNameFromPalette(palette: MaterialTonalPalette): HueName {
  const argb = palette.tone(REFERENCE_TONE);
  const hex = normalizeHex(hexFromArgb(argb));
  const hsla = hexToHSLA(hex);
  return resolveHueNameFromHsla(hsla);
}

function nextVersionForHue(hue: HueName, usedVersions: Map<HueName, number>): PaletteVersion {
  const nextIndex = (usedVersions.get(hue) ?? 0) + 1;
  if (nextIndex > 4) {
    throw new Error(`Too many variants for hue=${hue}. Supports up to v4.`);
  }
  usedVersions.set(hue, nextIndex);
  return `v${nextIndex}` as PaletteVersion;
}

function resolvePaletteVersionFromHue(params: {
  hue: HueName;
  usedVersions: Map<HueName, number>;
  isSingleVersionOutput: boolean;
}): PaletteVersion {
  if (params.isSingleVersionOutput) {
    return 'v1';
  }

  return nextVersionForHue(params.hue, params.usedVersions);
}

function resolveColorsDir(baseDir: string): string {
  return join(baseDir, 'colors');
}

type MaterialPaletteSet = Record<MaterialPaletteKey, MaterialTonalPalette>;

type MaterialLayerMapping = {
  a1: { hue: HueName; version: PaletteVersion };
  a2: { hue: HueName; version: PaletteVersion };
  a3: { hue: HueName; version: PaletteVersion };
  n1: { hue: 'black'; version: 'v1' };
  n2: { hue: 'black'; version: PaletteVersion };
  error: { hue: 'red'; version: 'v1' };
};

type GeneratedArtifactsInvocation = {
  primaryHex: string;
  mode: MaterialColorMode;
  isSingleVersionOutput: boolean;
  secondaryHex?: string;
  tertiaryHex?: string;
};

function resolvePaletteSet(params: {
  primaryHex: string;
  mode: MaterialColorMode;
  secondaryHex?: string;
  tertiaryHex?: string;
}): MaterialPaletteSet {
  const { primaryHex, mode, secondaryHex, tertiaryHex } = params;
  const primaryArgb = argbFromHex(primaryHex);

  const resolveCorePalette = (hex: string) =>
    mode === 'static' ? CorePalette.of(argbFromHex(hex)) : CorePalette.contentOf(argbFromHex(hex));

  const resolveDynamicScheme = (hex: string) => {
    const source = Hct.fromInt(argbFromHex(hex));
    const contrastLevel = 0;
    const isDark = false;

    return mode === 'dynamic'
      ? new SchemeTonalSpot(source, isDark, contrastLevel)
      : mode === 'dynamic-content'
        ? new SchemeContent(source, isDark, contrastLevel)
        : mode === 'dynamic-expressive'
          ? new SchemeExpressive(source, isDark, contrastLevel)
          : mode === 'dynamic-vibrant'
            ? new SchemeVibrant(source, isDark, contrastLevel)
            : mode === 'dynamic-fidelity'
              ? new SchemeFidelity(source, isDark, contrastLevel)
              : mode === 'dynamic-neutral'
                ? new SchemeNeutral(source, isDark, contrastLevel)
                : mode === 'dynamic-monochrome'
                  ? new SchemeMonochrome(source, isDark, contrastLevel)
                  : mode === 'dynamic-rainbow'
                    ? new SchemeRainbow(source, isDark, contrastLevel)
                    : new SchemeFruitSalad(source, isDark, contrastLevel);
  };

  if (mode === 'static' || mode === 'static-content') {
    const core = resolveCorePalette(primaryHex);
    const secondaryCore = secondaryHex ? resolveCorePalette(secondaryHex) : core;
    const tertiaryCore = tertiaryHex ? resolveCorePalette(tertiaryHex) : core;

    return {
      a1: core.a1,
      a2: secondaryHex ? secondaryCore.a1 : core.a2,
      a3: tertiaryHex ? tertiaryCore.a1 : core.a3,
      n1: core.n1,
      n2: core.n2,
      error: core.error
    };
  }

  const scheme = resolveDynamicScheme(primaryHex);
  const secondaryScheme = secondaryHex ? resolveDynamicScheme(secondaryHex) : scheme;
  const tertiaryScheme = tertiaryHex ? resolveDynamicScheme(tertiaryHex) : scheme;

  return {
    a1: scheme.primaryPalette,
    a2: secondaryHex ? secondaryScheme.primaryPalette : scheme.secondaryPalette,
    a3: tertiaryHex ? tertiaryScheme.primaryPalette : scheme.tertiaryPalette,
    n1: scheme.neutralPalette,
    n2: scheme.neutralVariantPalette,
    error: scheme.errorPalette
  };
}

function writeColorLayersFile(params: {
  outFilePath: string;
  mapping: MaterialLayerMapping;
  isSingleVersionOutput: boolean;
}): void {
  const { outFilePath, mapping, isSingleVersionOutput } = params;

  const hueBuckets = new Map<HueName, Set<'v1' | 'v2' | 'v3' | 'v4'>>();
  const register = (hue: HueName, version: 'v1' | 'v2' | 'v3' | 'v4') => {
    const bucket = hueBuckets.get(hue) ?? new Set();
    bucket.add(version);
    hueBuckets.set(hue, bucket);
  };

  const layerKeysToInclude = isSingleVersionOutput
    ? (['a1', 'a3', 'n1', 'error'] as const)
    : (['a1', 'a2', 'a3', 'n1', 'n2', 'error'] as const);

  for (const key of layerKeysToInclude) {
    const slot = mapping[key];
    register(slot.hue, slot.version);
  }

  const importLines: string[] = [];
  const primitiveLines: string[] = [];

  const sortedHues = Array.from(hueBuckets.keys()).sort((a, b) => a.localeCompare(b));

  const formatVersionToken = (version: 'v1' | 'v2' | 'v3' | 'v4') => `V${version.slice(1)}`;

  for (const hue of sortedHues) {
    const versions = Array.from(hueBuckets.get(hue) ?? []).sort();
    primitiveLines.push(`  ${hue}: {`);

    for (const version of versions) {
      const versionToken = formatVersionToken(version);
      const lightImportName = `${hue}${versionToken}Light`;
      const darkImportName = `${hue}${versionToken}Dark`;
      importLines.push(`import ${lightImportName} from './colors/${hue}.${version}.light.ts';`);
      importLines.push(`import ${darkImportName} from './colors/${hue}.${version}.dark.ts';`);

      primitiveLines.push(`    ${version}: {`);
      primitiveLines.push('      solid: {');
      primitiveLines.push(`        light: ${lightImportName},`);
      primitiveLines.push(`        dark: ${darkImportName}`);
      primitiveLines.push('      }');
      primitiveLines.push('    },');
    }

    primitiveLines.push('  },');
  }

  const primitiveColors = ['export const primitiveColors = {', ...primitiveLines, '} as const;'];

  const { a1, a2, a3, n1, n2, error } = mapping;
  const primaryLines = isSingleVersionOutput
    ? [
        `    primary: { v1: 'primitive.${a1.hue}.${a1.version}' },`,
        `    neutral: { v1: 'primitive.${n1.hue}.${n1.version}' },`
      ]
    : [
        `    primary: { v1: 'primitive.${a1.hue}.${a1.version}', v2: 'primitive.${a2.hue}.${a2.version}' },`,
        `    neutral: { v1: 'primitive.${n1.hue}.${n1.version}', v2: 'primitive.${n2.hue}.${n2.version}' },`
      ];
  const globalSemantics = [
    'export const globalSemantics = {',
    '  light: {',
    ...primaryLines,
    `    purpleLike: { v1: 'primitive.${a3.hue}.${a3.version}' },`,
    `    redLike: { v1: 'primitive.${error.hue}.${error.version}' }`,
    '  },',
    '  dark: {',
    ...primaryLines,
    `    purpleLike: { v1: 'primitive.${a3.hue}.${a3.version}' },`,
    `    redLike: { v1: 'primitive.${error.hue}.${error.version}' }`,
    '  }',
    '} as const;'
  ];

  const fileContent = [...importLines, '', ...primitiveColors, '', ...globalSemantics, ''].join(
    '\n'
  );

  fs.writeFileSync(outFilePath, fileContent, 'utf8');
  console.log(`[generateMaterialColorArtifacts] Wrote TS to: ${outFilePath}`);
}

function writeEmphasisLevelFile(params: {
  outFilePath: string;
  emphasis: EmphasisLevel;
  paletteKey: MaterialPaletteKey;
  mode: MaterialColorMode;
  invertScale: boolean;
  invocation: GeneratedArtifactsInvocation;
}): void {
  const { outFilePath, emphasis, paletteKey, mode, invertScale, invocation } = params;
  const { primaryHex, secondaryHex, tertiaryHex } = invocation;

  const header = [
    '// Generated by generateMaterialColorArtifacts({',
    `//   primaryHex: '${primaryHex}',`
  ];

  if (secondaryHex) {
    header.push(`//   secondaryHex: '${secondaryHex}',`);
  }

  if (tertiaryHex) {
    header.push(`//   tertiaryHex: '${tertiaryHex}',`);
  }

  header.push(
    `//   mode: '${mode}',`,
    '// });',
    '//',
    '// Generation details:',
    `//   palette: '${paletteKey}',`,
    `//   invertScale: ${invertScale}`,
    '//'
  );

  const body = formatEmphasisLevel(emphasis);
  const fileContent = `${header.join('\n')}\n\nimport type { EmphasisLevel } from '@kiskadee/core';\n\nexport default ${body} as EmphasisLevel;\n`;
  fs.writeFileSync(outFilePath, fileContent, 'utf8');
  console.log(`[generateMaterialColorArtifacts] Wrote TS to: ${outFilePath}`);
}

function writePaletteArtifacts(params: {
  palette: MaterialTonalPalette;
  hue: HueName;
  version: PaletteVersion;
  paletteKey: MaterialPaletteKey;
  colorsDir: string;
  mode: MaterialColorMode;
  invocation: GeneratedArtifactsInvocation;
}): void {
  const { palette, hue, version, paletteKey, colorsDir, mode, invocation } = params;

  const lightEmphasis = resolveEmphasisLevelFromPalette({ palette, invertScale: false });
  const lightPath = join(colorsDir, `${hue}.${version}.light.ts`);
  writeEmphasisLevelFile({
    outFilePath: lightPath,
    emphasis: lightEmphasis,
    paletteKey,
    mode,
    invertScale: false,
    invocation
  });

  const darkEmphasis = resolveEmphasisLevelFromPalette({ palette, invertScale: true });
  const darkPath = join(colorsDir, `${hue}.${version}.dark.ts`);
  writeEmphasisLevelFile({
    outFilePath: darkPath,
    emphasis: darkEmphasis,
    paletteKey,
    mode,
    invertScale: true,
    invocation
  });
}

export function generateMaterialColorArtifacts(
  options: GenerateMaterialColorArtifactsOptions
): void {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const sourceHex = normalizeHex(options.primaryHex);
  const mode = options.mode ?? 'static';
  const hasSecondary = !!options.secondaryHex;
  const isSingleVersionOutput = !hasSecondary;
  const outDir = options.outDir ?? __dirname;
  const secondaryHex = options.secondaryHex ? normalizeHex(options.secondaryHex) : undefined;
  const tertiaryHex = options.tertiaryHex ? normalizeHex(options.tertiaryHex) : undefined;
  const paletteSet = resolvePaletteSet({
    primaryHex: sourceHex,
    mode,
    secondaryHex,
    tertiaryHex
  });

  const colorsDir = resolveColorsDir(outDir);
  fs.rmSync(colorsDir, { recursive: true, force: true });
  fs.mkdirSync(colorsDir, { recursive: true });

  const usedVersions = new Map<HueName, number>([
    ['black', 2],
    ['red', 1]
  ]);

  const layerMapping: MaterialLayerMapping = {
    a1: { hue: 'blue', version: 'v1' },
    a2: { hue: 'blue', version: 'v2' },
    a3: { hue: 'purple', version: 'v1' },
    n1: { hue: 'black', version: 'v1' },
    n2: { hue: 'black', version: 'v2' },
    error: { hue: 'red', version: 'v1' }
  };

  const accentPalettes: Array<{ key: MaterialPaletteKey; palette: MaterialTonalPalette }> = [
    { key: 'a1', palette: paletteSet.a1 },
    ...(isSingleVersionOutput ? [] : ([{ key: 'a2', palette: paletteSet.a2 }] as const)),
    { key: 'a3', palette: paletteSet.a3 }
  ];
  const writtenPaletteVersions = new Set<string>();

  for (const entry of accentPalettes) {
    const hue = resolveHueNameFromPalette(entry.palette);
    const version = resolvePaletteVersionFromHue({
      hue,
      usedVersions,
      isSingleVersionOutput
    });
    const paletteSlot = `${hue}.${version}`;
    if (entry.key === 'a1') {
      layerMapping.a1 = { hue, version };
    } else if (entry.key === 'a2') {
      layerMapping.a2 = { hue, version };
    } else {
      layerMapping.a3 = { hue, version };
    }
    if (isSingleVersionOutput && writtenPaletteVersions.has(paletteSlot)) {
      continue;
    }
    writePaletteArtifacts({
      palette: entry.palette,
      hue,
      version,
      paletteKey: entry.key,
      colorsDir,
      mode,
      invocation: {
        primaryHex: sourceHex,
        mode,
        isSingleVersionOutput,
        secondaryHex,
        tertiaryHex
      }
    });
    writtenPaletteVersions.add(paletteSlot);
  }

  writePaletteArtifacts({
    palette: paletteSet.n1,
    hue: 'black',
    version: 'v1',
    paletteKey: 'n1',
    colorsDir,
    mode,
    invocation: {
      primaryHex: sourceHex,
      mode,
      isSingleVersionOutput,
      secondaryHex,
      tertiaryHex
    }
  });

  if (!isSingleVersionOutput) {
    writePaletteArtifacts({
      palette: paletteSet.n2,
      hue: 'black',
      version: 'v2',
      paletteKey: 'n2',
      colorsDir,
      mode,
      invocation: {
        primaryHex: sourceHex,
        mode,
        isSingleVersionOutput,
        secondaryHex,
        tertiaryHex
      }
    });
  } else {
    layerMapping.n2 = { hue: 'black', version: 'v1' };
  }

  writePaletteArtifacts({
    palette: paletteSet.error,
    hue: 'red',
    version: 'v1',
    paletteKey: 'error',
    colorsDir,
    mode,
    invocation: {
      primaryHex: sourceHex,
      mode,
      isSingleVersionOutput,
      secondaryHex,
      tertiaryHex
    }
  });

  const layersPath = join(outDir, 'color.layers.ts');
  writeColorLayersFile({ outFilePath: layersPath, mapping: layerMapping, isSingleVersionOutput });
}

// mode:
// - static: CorePalette.of (brand/static, more vivid)
// - static-content: CorePalette.contentOf (preserves chroma for content)
// - dynamic: SchemeTonalSpot (Material You default, softer)
// - dynamic-content: SchemeContent (dynamic variant preserving source identity)
// - dynamic-expressive: SchemeExpressive (bolder hue rotations)
// - dynamic-vibrant: SchemeVibrant (max chroma)
// - dynamic-fidelity: SchemeFidelity (keeps source color closer)
// - dynamic-neutral: SchemeNeutral (near grayscale)
// - dynamic-monochrome: SchemeMonochrome (true grayscale)
// - dynamic-rainbow: SchemeRainbow (playful, detached hues)
// - dynamic-fruit-salad: SchemeFruitSalad (playful, shifted greens)

// Google Static (2 seeds)
// generateMaterialColorArtifacts({
//   primaryHex: '#0B57CF',
//   secondaryHex: '#00639b',
//   mode: 'static'
// });

// Google Dynamic (Figma)
// generateMaterialColorArtifacts({
//   primaryHex: '#6442d6',
//   secondaryHex: '#575E71',
//   mode: 'dynamic'
// });

// Google Dynamic (Samsung)
// generateMaterialColorArtifacts({
//   primaryHex: '#0481FF',
//   mode: 'dynamic'
// });

// Fluent 2
generateMaterialColorArtifacts({
  primaryHex: '#0f6cbd'
  // mode: 'dynamic-content'
  // mode: 'dynamic-fidelity'
});
