import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  KISKADEE_TONES,
  normalizeHexColor,
  type HexColor,
  type KiskadeeHexScale
} from '@kiskadee/core';
import {
  argbFromHex,
  CorePalette,
  hexFromArgb,
  TonalPalette
} from '@material/material-color-utilities';

export type MaterialGenerationMode = 'static' | 'static-content';

export type GenerateMaterialColorArtifactsOptions = {
  primaryHex: string;
  secondaryHex?: string;
  tertiaryHex?: string;
  mode?: MaterialGenerationMode;
  outDir?: string;
};

function createCore(hex: string, mode: MaterialGenerationMode): CorePalette {
  const argb = argbFromHex(normalizeHexColor(hex));
  return mode === 'static-content' ? CorePalette.contentOf(argb) : CorePalette.of(argb);
}

function materialHex(palette: TonalPalette, tone: number): HexColor {
  return normalizeHexColor(hexFromArgb(palette.tone(tone)));
}

function createScale(palette: TonalPalette, theme: 'light' | 'dark'): KiskadeeHexScale {
  const entries = KISKADEE_TONES.map((tone) => {
    const materialTone = theme === 'light' ? 100 - tone : tone;
    return [tone, materialHex(palette, materialTone)];
  });
  entries[0]![1] = theme === 'light' ? '#ffffff' : '#000000';
  entries[entries.length - 1]![1] = theme === 'light' ? '#000000' : '#ffffff';
  return Object.fromEntries(entries) as KiskadeeHexScale;
}

function formatScale(scale: KiskadeeHexScale): string {
  const lines = KISKADEE_TONES.map((tone) => `  ${tone}: '${scale[tone]}'`).join(',\n');
  return `import type { KiskadeeHexScale } from '@kiskadee/core';\n\nexport default {\n${lines}\n} as KiskadeeHexScale;\n`;
}

function writeScalePair(
  outDir: string,
  family: string,
  version: string,
  palette: TonalPalette
): void {
  for (const theme of ['light', 'dark'] as const) {
    writeFileSync(
      join(outDir, 'colors', `${family}.${version}.${theme}.ts`),
      formatScale(createScale(palette, theme))
    );
  }
}

function formatLayers(hasV2: boolean): string {
  const imports = [
    ['black', 'v1'],
    ['blue', 'v1'],
    ['purple', 'v1'],
    ['red', 'v1'],
    ...(hasV2
      ? [
          ['black', 'v2'],
          ['blue', 'v2']
        ]
      : [])
  ]
    .flatMap(([family, version]) =>
      ['light', 'dark'].map(
        (theme) =>
          `import ${family}${version.toUpperCase()}${theme === 'light' ? 'Light' : 'Dark'} from './colors/${family}.${version}.${theme}.ts';`
      )
    )
    .join('\n');
  const asset = (family: string, version: string) => {
    const id = `${family}${version.toUpperCase()}`;
    return `${version}: { kind: 'static', scales: { light: ${id}Light, dark: ${id}Dark } }`;
  };
  return `${imports}\n\nexport const primitiveColors = {\n  black: { ${asset('black', 'v1')}${hasV2 ? `, ${asset('black', 'v2')}` : ''} },\n  blue: { ${asset('blue', 'v1')}${hasV2 ? `, ${asset('blue', 'v2')}` : ''} },\n  purple: { ${asset('purple', 'v1')} },\n  red: { ${asset('red', 'v1')} }\n} as const;\n\nexport const globalSemantics = {\n  light: {\n    primary: { v1: 'primitive.blue.v1'${hasV2 ? ", v2: 'primitive.blue.v2'" : ''} },\n    neutral: { v1: 'primitive.black.v1'${hasV2 ? ", v2: 'primitive.black.v2'" : ''} },\n    purpleLike: { v1: 'primitive.purple.v1' },\n    redLike: { v1: 'primitive.red.v1' }\n  },\n  dark: {\n    primary: { v1: 'primitive.blue.v1'${hasV2 ? ", v2: 'primitive.blue.v2'" : ''} },\n    neutral: { v1: 'primitive.black.v1'${hasV2 ? ", v2: 'primitive.black.v2'" : ''} },\n    purpleLike: { v1: 'primitive.purple.v1' },\n    redLike: { v1: 'primitive.red.v1' }\n  }\n} as const;\n`;
}

export function generateMaterialColorArtifacts(
  options: GenerateMaterialColorArtifactsOptions
): void {
  const mode = options.mode ?? 'static';
  const outDir = options.outDir ?? join(import.meta.dirname, '..', 'presets', 'material-3-google');
  mkdirSync(join(outDir, 'colors'), { recursive: true });

  const primary = createCore(options.primaryHex, mode);
  const tertiary = options.tertiaryHex ? createCore(options.tertiaryHex, mode) : primary;
  writeScalePair(outDir, 'blue', 'v1', primary.a1);
  writeScalePair(outDir, 'black', 'v1', primary.n1);
  writeScalePair(outDir, 'purple', 'v1', tertiary.a1);
  writeScalePair(outDir, 'red', 'v1', primary.error);

  if (options.secondaryHex) {
    const secondary = createCore(options.secondaryHex, mode);
    writeScalePair(outDir, 'blue', 'v2', secondary.a1);
    writeScalePair(outDir, 'black', 'v2', secondary.n1);
  }
  writeFileSync(join(outDir, 'color.layers.ts'), formatLayers(Boolean(options.secondaryHex)));
}
