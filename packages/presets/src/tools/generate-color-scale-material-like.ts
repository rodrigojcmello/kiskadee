import * as fs from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  ColorScaleDark,
  ColorScaleLight,
  DarkTrackTones,
  EmphasisLevel,
  HSLA,
  LightTrackTones
} from '@kiskadee/core';
import { argbFromHex, CorePalette, hexFromArgb } from '@material/material-color-utilities';

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

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

const EMITTED_SUBTLE_TONES: LightTrackTones[] = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 20, 25, 30
];

const EMITTED_VIVID_TONES: DarkTrackTones[] = [
  35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100
];

function snapToNearestEmittedTone<T extends number>(tone: number, emitted: readonly T[]): T {
  if (emitted.length === 0) {
    throw new Error('Invalid configuration: emitted tones list must not be empty.');
  }

  const first = emitted[0];
  if (first === undefined) {
    throw new Error('Invalid configuration: emitted tones list must not be empty.');
  }

  let best = first;
  let bestDistance = Math.abs(tone - best);

  for (let i = 1; i < emitted.length; i += 1) {
    const candidate = emitted[i];
    if (candidate === undefined) continue;
    const distance = Math.abs(tone - candidate);
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }

  return best;
}

function nearestEmittedSubtleTone(darkness: number): LightTrackTones {
  const clamped = clamp(darkness, 0, 30);
  return snapToNearestEmittedTone(clamped, EMITTED_SUBTLE_TONES);
}

function nearestEmittedVividTone(darkness: number): DarkTrackTones {
  const clamped = clamp(darkness, 35, 100);
  return snapToNearestEmittedTone(clamped, EMITTED_VIVID_TONES);
}

type SupportedTone = LightTrackTones | DarkTrackTones;

function snapSupportedTone(darkness: number): SupportedTone {
  if (darkness <= 30) return nearestEmittedSubtleTone(darkness);
  return nearestEmittedVividTone(darkness);
}

function materialToneFromScaleTone(tone: number, invertScale: boolean): number {
  return invertScale ? tone : 100 - tone;
}

type GenerateMaterialLikeOptions = {
  /**
   * When true, preserves the input color chroma by using Material's `content` palette generation.
   *
   * This is useful for gray-ish colors (low chroma), e.g. Material secondary colors,
   * which would otherwise be boosted to a higher chroma by `CorePalette.of(...).a1`.
   */
  preserveChroma?: boolean;
  /**
   * When true, inverts the scale so tone 0 is the darkest and 100 is the lightest.
   * This is useful for dark-mode palettes while keeping the same tone keys.
   */
  invertScale?: boolean;
};

function resolveMaterialPalette(params: { hexColor: string; preserveChroma?: boolean }) {
  const { hexColor, preserveChroma } = params;
  const argb = argbFromHex(hexColor);
  const core = preserveChroma ? CorePalette.contentOf(argb) : CorePalette.of(argb);
  return core.a1;
}

export function generateColorScaleMaterialLike(
  hexColor: string,
  options?: GenerateMaterialLikeOptions
): EmphasisLevel {
  const palette = resolveMaterialPalette({ hexColor, preserveChroma: options?.preserveChroma });
  const invertScale = Boolean(options?.invertScale);

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

  // Absolute extremes
  subtle[0] = invertScale ? [0, 0, 0, 1] : [0, 0, 100, 1];
  vivid[100] = invertScale ? [0, 0, 100, 1] : [0, 0, 0, 1];

  return { subtle, vivid };
}

export function generateColorScaleMaterialLikeArtifact(
  hexColor: string,
  options?: GenerateMaterialLikeOptions
): EmphasisLevel {
  const tracks = generateColorScaleMaterialLike(hexColor, options);

  const input = hexToHSLA(hexColor);
  const inputLightness = input[2];

  const inputHex = normalizeHex(hexColor);

  const palette = resolveMaterialPalette({ hexColor, preserveChroma: options?.preserveChroma });
  const invertScale = Boolean(options?.invertScale);

  const resolveHexAtTone = (tone: number): string => {
    const materialTone = materialToneFromScaleTone(tone, invertScale);
    const argb = palette.tone(materialTone);
    return normalizeHex(hexFromArgb(argb));
  };

  const allEmittedTones: number[] = [...EMITTED_SUBTLE_TONES, ...EMITTED_VIVID_TONES];
  const exactTone = allEmittedTones.find((t) => resolveHexAtTone(t) === inputHex);

  const fallbackToneValue = invertScale ? inputLightness : 100 - inputLightness;
  const fallbackTone = snapSupportedTone(fallbackToneValue) as number;

  const commentTone = exactTone ?? fallbackTone;
  const marker = exactTone !== undefined ? 'input=' : 'input≈';

  const resolveInputCommentForTone = (tone: number): string => {
    if (tone !== commentTone) return '';
    const pretty = `${inputHex} (L=${Number(inputLightness.toFixed(2))})`;
    return ` // ${marker}: ${pretty}`;
  };

  const subtleLines: string[] = [];
  const vividLines: string[] = [];

  subtleLines.push('  subtle: {');
  for (const tone of EMITTED_SUBTLE_TONES) {
    const color = tracks.subtle[tone];
    if (!color) continue;
    subtleLines.push(
      `    ${tone}: [${(color as HSLA).join(', ')}],${resolveInputCommentForTone(tone)}`
    );
  }
  subtleLines.push('  },');

  vividLines.push('  vivid: {');
  for (const tone of EMITTED_VIVID_TONES) {
    const color = tracks.vivid[tone];
    if (!color) continue;
    vividLines.push(
      `    ${tone}: [${(color as HSLA).join(', ')}],${resolveInputCommentForTone(tone)}`
    );
  }
  vividLines.push('  }');

  const prettyBodyOnly = ['{', ...subtleLines, ...vividLines, '}'].join('\n');

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const outFilePath = join(__dirname, 'color.generated.ts');

  const preserveChroma = Boolean(options?.preserveChroma);
  const header = `// Generated by generateColorScaleMaterialLikeArtifact('${hexColor}', { preserveChroma: ${preserveChroma}, invertScale: ${invertScale} })\n`;
  const fileContent = `${header}\nimport type { EmphasisLevel } from '@kiskadee/core';\n\nexport default ${prettyBodyOnly} as EmphasisLevel\n`;
  fs.writeFileSync(outFilePath, fileContent, 'utf8');

  return tracks;
}

generateColorScaleMaterialLikeArtifact('#575E71', {
  preserveChroma: true
  // invertScale: true
});
