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
import { resolveHueNameFromHsla } from '../utils/resolveHueName';

type MaterialTonalPalette = {
  tone: (tone: number) => number;
};

type MaterialPaletteKey = 'a1' | 'a2' | 'a3' | 'n1' | 'n2' | 'error';

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

function nextVersionForHue(
  hue: HueName,
  usedVersions: Map<HueName, number>
): 'v1' | 'v2' | 'v3' | 'v4' {
  const nextIndex = (usedVersions.get(hue) ?? 0) + 1;
  if (nextIndex > 4) {
    throw new Error(`Too many variants for hue=${hue}. Supports up to v4.`);
  }
  usedVersions.set(hue, nextIndex);
  return `v${nextIndex}` as 'v1' | 'v2' | 'v3' | 'v4';
}

function resolveColorsDir(baseDir: string): string {
  return join(baseDir, 'colors');
}

type MaterialPaletteSet = Record<MaterialPaletteKey, MaterialTonalPalette>;

type MaterialLayerMapping = {
  a1: { hue: HueName; version: 'v1' | 'v2' | 'v3' | 'v4' };
  a2: { hue: HueName; version: 'v1' | 'v2' | 'v3' | 'v4' };
  a3: { hue: HueName; version: 'v1' | 'v2' | 'v3' | 'v4' };
  n1: { hue: 'black'; version: 'v1' };
  n2: { hue: 'black'; version: 'v2' };
  error: { hue: 'red'; version: 'v1' };
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
}): void {
  const { outFilePath, mapping } = params;

  const hueBuckets = new Map<HueName, Set<'v1' | 'v2' | 'v3' | 'v4'>>();
  const register = (hue: HueName, version: 'v1' | 'v2' | 'v3' | 'v4') => {
    const bucket = hueBuckets.get(hue) ?? new Set();
    bucket.add(version);
    hueBuckets.set(hue, bucket);
  };

  register(mapping.a1.hue, mapping.a1.version);
  register(mapping.a2.hue, mapping.a2.version);
  register(mapping.a3.hue, mapping.a3.version);
  register(mapping.n1.hue, mapping.n1.version);
  register(mapping.n2.hue, mapping.n2.version);
  register(mapping.error.hue, mapping.error.version);

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
      importLines.push(`import ${lightImportName} from './colors/${hue}.${version}.light';`);
      importLines.push(`import ${darkImportName} from './colors/${hue}.${version}.dark';`);

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

  const { a1, a2, a3, error } = mapping;
  const globalSemantics = [
    'export const globalSemantics = {',
    '  light: {',
    `    primary: 'primitive.${a1.hue}.${a1.version}',`,
    `    neutral: 'primitive.${a2.hue}.${a2.version}',`,
    `    purpleLike: 'primitive.${a3.hue}.${a3.version}',`,
    `    redLike: 'primitive.${error.hue}.${error.version}'`,
    '  },',
    '  dark: {',
    `    primary: 'primitive.${a1.hue}.${a1.version}',`,
    `    neutral: 'primitive.${a2.hue}.${a2.version}',`,
    `    purpleLike: 'primitive.${a3.hue}.${a3.version}',`,
    `    redLike: 'primitive.${error.hue}.${error.version}'`,
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
  sourceHex: string;
  paletteKey: MaterialPaletteKey;
  mode: MaterialColorMode;
  invertScale: boolean;
}): void {
  const { outFilePath, emphasis, sourceHex, paletteKey, mode, invertScale } = params;
  const header = `// Generated by generateMaterialColorArtifacts('${sourceHex}', { palette: '${paletteKey}', mode: '${mode}', invertScale: ${invertScale} })\n`;
  const body = formatEmphasisLevel(emphasis);
  const fileContent = `${header}\nimport type { EmphasisLevel } from '@kiskadee/core';\n\nexport default ${body} as EmphasisLevel;\n`;
  fs.writeFileSync(outFilePath, fileContent, 'utf8');
  console.log(`[generateMaterialColorArtifacts] Wrote TS to: ${outFilePath}`);
}

function writePaletteArtifacts(params: {
  palette: MaterialTonalPalette;
  hue: HueName;
  version: 'v1' | 'v2' | 'v3' | 'v4';
  paletteKey: MaterialPaletteKey;
  sourceHex: string;
  colorsDir: string;
  mode: MaterialColorMode;
}): void {
  const { palette, hue, version, paletteKey, sourceHex, colorsDir, mode } = params;

  const lightEmphasis = resolveEmphasisLevelFromPalette({ palette, invertScale: false });
  const lightPath = join(colorsDir, `${hue}.${version}.light.ts`);
  writeEmphasisLevelFile({
    outFilePath: lightPath,
    emphasis: lightEmphasis,
    sourceHex,
    paletteKey,
    mode,
    invertScale: false
  });

  const darkEmphasis = resolveEmphasisLevelFromPalette({ palette, invertScale: true });
  const darkPath = join(colorsDir, `${hue}.${version}.dark.ts`);
  writeEmphasisLevelFile({
    outFilePath: darkPath,
    emphasis: darkEmphasis,
    sourceHex,
    paletteKey,
    mode,
    invertScale: true
  });
}

export function generateMaterialColorArtifacts(
  options: GenerateMaterialColorArtifactsOptions
): void {
  const sourceHex = normalizeHex(options.primaryHex);
  const mode = options.mode ?? 'static';
  const paletteSet = resolvePaletteSet({
    primaryHex: sourceHex,
    mode,
    secondaryHex: options.secondaryHex ? normalizeHex(options.secondaryHex) : undefined,
    tertiaryHex: options.tertiaryHex ? normalizeHex(options.tertiaryHex) : undefined
  });

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const colorsDir = resolveColorsDir(__dirname);
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
    { key: 'a2', palette: paletteSet.a2 },
    { key: 'a3', palette: paletteSet.a3 }
  ];

  for (const entry of accentPalettes) {
    const hue = resolveHueNameFromPalette(entry.palette);
    const version = nextVersionForHue(hue, usedVersions);
    if (entry.key === 'a1') {
      layerMapping.a1 = { hue, version };
    } else if (entry.key === 'a2') {
      layerMapping.a2 = { hue, version };
    } else {
      layerMapping.a3 = { hue, version };
    }
    writePaletteArtifacts({
      palette: entry.palette,
      hue,
      version,
      paletteKey: entry.key,
      sourceHex,
      colorsDir,
      mode
    });
  }

  writePaletteArtifacts({
    palette: paletteSet.n1,
    hue: 'black',
    version: 'v1',
    paletteKey: 'n1',
    sourceHex,
    colorsDir,
    mode
  });

  writePaletteArtifacts({
    palette: paletteSet.n2,
    hue: 'black',
    version: 'v2',
    paletteKey: 'n2',
    sourceHex,
    colorsDir,
    mode
  });

  writePaletteArtifacts({
    palette: paletteSet.error,
    hue: 'red',
    version: 'v1',
    paletteKey: 'error',
    sourceHex,
    colorsDir,
    mode
  });

  const layersPath = join(__dirname, 'color.layers.ts');
  writeColorLayersFile({ outFilePath: layersPath, mapping: layerMapping });
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
generateMaterialColorArtifacts({
  primaryHex: '#6442d6',
  secondaryHex: '#575E71',
  mode: 'dynamic'
});

// Google Dynamic (Samsung)
// generateMaterialColorArtifacts({
//   primaryHex: '#0481FF',
//   mode: 'dynamic'
// });
