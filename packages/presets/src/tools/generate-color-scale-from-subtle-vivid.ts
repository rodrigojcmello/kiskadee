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

function hexToHSLA(hex: string): HSLA {
  // Normalize hex: remove # and expand 3-digit to 6-digit
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

  // Parse RGB values
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  // Calculate lightness
  const lightness = (max + min) / 2;

  // Calculate saturation
  let saturation = 0;
  if (delta !== 0) {
    saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  }

  // Calculate hue
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

  // Clamp to two decimals for stable diffs.
  const hueInDegrees = Number((hue * 360).toFixed(2));
  const saturationPercent = Number((saturation * 100).toFixed(2));
  const lightnessPercent = Number((lightness * 100).toFixed(2));

  return [hueInDegrees, saturationPercent, lightnessPercent, 1];
}

function normalizeHue(hue: number): number {
  let h = hue % 360;
  if (h < 0) h += 360;
  return Number(h.toFixed(2));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpHueShortestPath(fromHue: number, toHue: number, t: number): number {
  const from = normalizeHue(fromHue);
  const to = normalizeHue(toHue);

  let delta = to - from;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;

  return normalizeHue(from + delta * t);
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

function canonicalLightnessAtTone(tone: number): number {
  // Keep the subtle track stable and deterministic.
  if (tone <= 30) return 100 - tone;

  // From 30 to 100, linearly descend from L=70 to L=0.
  const ratio = (tone - 30) / (100 - 30);
  return Math.round(70 + (0 - 70) * ratio);
}

export function generateColorScaleFromSubtleVivid(
  subtleHexColor: string,
  vividHexColor: string
): EmphasisLevel {
  const subtleInput = hexToHSLA(subtleHexColor);
  const vividInput = hexToHSLA(vividHexColor);

  const subtleLightness = subtleInput[2];
  const vividLightness = vividInput[2];

  if (subtleLightness <= vividLightness) {
    throw new Error(
      `Invalid scale endpoints: subtle color must be lighter than vivid color (subtle L=${subtleLightness} <= vivid L=${vividLightness}).`
    );
  }

  const subtleDarkness = 100 - subtleLightness;
  const vividDarkness = 100 - vividLightness;

  const subtleTone = nearestEmittedSubtleTone(subtleDarkness);
  const vividTone = nearestEmittedVividTone(vividDarkness);

  const [subtleHue, subtleSaturation, , subtleAlpha] = subtleInput;
  const [vividHue, vividSaturation, , vividAlpha] = vividInput;

  const alpha = Number(lerp(subtleAlpha, vividAlpha, 0.5).toFixed(2));

  const resolveHslaAtTone = (tone: number): HSLA => {
    const lightness = canonicalLightnessAtTone(tone);

    if (tone <= subtleTone) {
      return [subtleHue, subtleSaturation, lightness, alpha];
    }

    if (tone >= vividTone) {
      return [vividHue, vividSaturation, lightness, alpha];
    }

    const t = (tone - subtleTone) / (vividTone - subtleTone);
    const hue = lerpHueShortestPath(subtleHue, vividHue, t);
    const saturation = Number(lerp(subtleSaturation, vividSaturation, t).toFixed(2));

    return [hue, saturation, lightness, alpha];
  };

  const subtle: ColorScaleLight = {};
  const vivid: ColorScaleDark = {};

  for (const tone of EMITTED_SUBTLE_TONES) {
    subtle[tone] = resolveHslaAtTone(tone);
  }

  for (const tone of EMITTED_VIVID_TONES) {
    vivid[tone] = resolveHslaAtTone(tone);
  }

  // Absolute extremes
  subtle[0] = [0, 0, 100, alpha];
  vivid[100] = [0, 0, 0, alpha];

  return { subtle, vivid };
}

export function generateColorScaleFromColors(hexColors: string[]): EmphasisLevel {
  if (!Array.isArray(hexColors) || hexColors.length === 0) {
    throw new Error('Invalid input: hexColors must be a non-empty array.');
  }

  const inputs = hexColors.map((hex) => {
    const hsla = hexToHSLA(hex);
    const lightness = hsla[2];
    const darkness = 100 - lightness;
    const tone = snapSupportedTone(darkness);
    return { hex, hsla, lightness, darkness, tone };
  });

  // Sort by brightness (lightness) descending: lighter first.
  inputs.sort((a, b) => b.lightness - a.lightness);

  // Validate strict lightness ordering with a minimum delta of 1.
  for (let i = 0; i < inputs.length - 1; i += 1) {
    const current = inputs[i];
    const next = inputs[i + 1];
    if (!current || !next) continue;

    const delta = Number((current.lightness - next.lightness).toFixed(2));
    if (delta === 0) {
      throw new Error(
        `Invalid scale stops: two colors have the same lightness (L=${current.lightness}).`
      );
    }
    if (delta < 1) {
      throw new Error(
        `Invalid scale stops: lightness difference must be at least 1 between adjacent colors (L=${current.lightness} vs L=${next.lightness}).`
      );
    }
  }

  // Validate that snapped tones are strictly increasing (lighter -> smaller darkness -> smaller tone)
  // and that no two stops collapse into the same supported tone bucket.
  const usedTones = new Map<number, { hex: string; lightness: number; tone: SupportedTone }>();
  for (const stop of inputs) {
    const key = stop.tone as number;
    const existing = usedTones.get(key);
    if (existing) {
      throw new Error(
        `Invalid scale stops: two colors map to the same supported tone ${key} (colors '${existing.hex}' L=${existing.lightness} and '${stop.hex}' L=${stop.lightness}).`
      );
    }
    usedTones.set(key, { hex: stop.hex, lightness: stop.lightness, tone: stop.tone });
  }

  for (let i = 0; i < inputs.length - 1; i += 1) {
    const a = inputs[i];
    const b = inputs[i + 1];
    if (!a || !b) continue;
    if ((a.tone as number) >= (b.tone as number)) {
      throw new Error(
        `Invalid scale stops: after snapping, tones must be strictly increasing from lighter to darker (got ${a.tone} then ${b.tone}).`
      );
    }
  }

  const resolveHslaAtTone = (tone: number): HSLA => {
    const lightness = canonicalLightnessAtTone(tone);

    // Single-stop mode: keep hue/saturation constant across the scale.
    if (inputs.length === 1) {
      const [h, s, , a] = inputs[0]!.hsla;
      return [h, s, lightness, a];
    }

    const first = inputs[0]!;
    const last = inputs[inputs.length - 1]!;

    if (tone <= (first.tone as number)) {
      const [h, s, , a] = first.hsla;
      return [h, s, lightness, a];
    }

    if (tone >= (last.tone as number)) {
      const [h, s, , a] = last.hsla;
      return [h, s, lightness, a];
    }

    // Find segment [left, right] such that left.tone <= tone <= right.tone
    let left = first;
    let right = last;
    for (let i = 0; i < inputs.length - 1; i += 1) {
      const a = inputs[i]!;
      const b = inputs[i + 1]!;
      const aTone = a.tone as number;
      const bTone = b.tone as number;
      if (tone >= aTone && tone <= bTone) {
        left = a;
        right = b;
        break;
      }
    }

    const leftTone = left.tone as number;
    const rightTone = right.tone as number;

    if (leftTone === rightTone) {
      const [h, s, , a] = left.hsla;
      return [h, s, lightness, a];
    }

    const t = (tone - leftTone) / (rightTone - leftTone);

    const [leftHue, leftSaturation, , leftAlpha] = left.hsla;
    const [rightHue, rightSaturation, , rightAlpha] = right.hsla;

    const hue = lerpHueShortestPath(leftHue, rightHue, t);
    const saturation = Number(lerp(leftSaturation, rightSaturation, t).toFixed(2));
    const alpha = Number(lerp(leftAlpha, rightAlpha, t).toFixed(2));

    return [hue, saturation, lightness, alpha];
  };

  const subtle: ColorScaleLight = {};
  const vivid: ColorScaleDark = {};

  for (const tone of EMITTED_SUBTLE_TONES) {
    subtle[tone] = resolveHslaAtTone(tone);
  }

  for (const tone of EMITTED_VIVID_TONES) {
    vivid[tone] = resolveHslaAtTone(tone);
  }

  // Absolute extremes (use alpha from the first stop for consistency)
  const alpha = inputs[0]!.hsla[3];
  subtle[0] = [0, 0, 100, alpha];
  vivid[100] = [0, 0, 0, alpha];

  return { subtle, vivid };
}

export function generateColorScaleFromSubtleVividArtifact(
  subtleHexColor: string,
  vividHexColor: string
): EmphasisLevel {
  const tracks = generateColorScaleFromSubtleVivid(subtleHexColor, vividHexColor);

  const subtleInput = hexToHSLA(subtleHexColor);
  const vividInput = hexToHSLA(vividHexColor);

  const subtleLightness = subtleInput[2];
  const vividLightness = vividInput[2];

  const subtleTone = nearestEmittedSubtleTone(100 - subtleLightness);
  const vividTone = nearestEmittedVividTone(100 - vividLightness);

  const toneToInputMeta = new Map<number, { hex: string; lightness: number }[]>([
    [subtleTone as number, [{ hex: subtleHexColor, lightness: subtleLightness }]],
    [vividTone as number, [{ hex: vividHexColor, lightness: vividLightness }]]
  ]);

  const resolveInputCommentForTone = (tone: number): string => {
    const entries = toneToInputMeta.get(tone);
    if (!entries || entries.length === 0) return '';

    const canonicalLightness = canonicalLightnessAtTone(tone);
    const isExact = entries.every(
      (e) => Math.abs(Number(e.lightness.toFixed(2)) - canonicalLightness) <= 0.01
    );
    const marker = isExact ? 'input=' : 'input≈';
    const pretty = entries.map((e) => `${e.hex} (L=${Number(e.lightness.toFixed(2))})`).join(', ');

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

  const header = `// Generated by generateColorScaleFromSubtleVividArtifact('${subtleHexColor}', '${vividHexColor}')\n`;
  const fileContent = `${header}\nimport type { EmphasisLevel } from '@kiskadee/core';\n\nexport default ${prettyBodyOnly} as EmphasisLevel\n`;
  fs.writeFileSync(outFilePath, fileContent, 'utf8');

  return tracks;
}

export function generateColorScaleFromColorsArtifact(hexColors: string[]): EmphasisLevel {
  const tracks = generateColorScaleFromColors(hexColors);

  const toneToInputMeta = new Map<number, { hex: string; lightness: number }[]>();
  for (const hex of hexColors) {
    const hsla = hexToHSLA(hex);
    const lightness = hsla[2];
    const tone = snapSupportedTone(100 - lightness) as number;
    const list = toneToInputMeta.get(tone) ?? [];
    list.push({ hex, lightness });
    toneToInputMeta.set(tone, list);
  }

  const resolveInputCommentForTone = (tone: number): string => {
    const entries = toneToInputMeta.get(tone);
    if (!entries || entries.length === 0) return '';

    const canonicalLightness = canonicalLightnessAtTone(tone);
    const isExact = entries.every(
      (e) => Math.abs(Number(e.lightness.toFixed(2)) - canonicalLightness) <= 0.01
    );
    const marker = isExact ? 'input=' : 'input≈';
    const pretty = entries.map((e) => `${e.hex} (L=${Number(e.lightness.toFixed(2))})`).join(', ');

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

  const colorsHeader = hexColors.map((c) => `'${c}'`).join(', ');
  const header = `// Generated by generateColorScaleFromColorsArtifact([${colorsHeader}])\n`;
  const fileContent = `${header}\nimport type { EmphasisLevel } from '@kiskadee/core';\n\nexport default ${prettyBodyOnly} as EmphasisLevel\n`;
  fs.writeFileSync(outFilePath, fileContent, 'utf8');

  return tracks;
}

generateColorScaleFromColorsArtifact(['#000']);
