import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  ColorScale,
  ColorScaleDark,
  ColorScaleLight,
  DarkTrackTones,
  HSLA,
  LightTrackTones,
  ToneTracks
} from '@kiskadee/core';
import { convertHslaToHex } from '@kiskadee/core';

/**
 * Converts a hexadecimal color to HSLA format.
 * @param hex - Hexadecimal color string (e.g., "#6750A4" or "6750A4")
 * @param verbose
 * @returns HSLA array [hue, saturation, lightness, alpha]
 */
function hexToHSLA(hex: string, verbose = false): HSLA {
  if (verbose) console.log('[hexToHSLA] input:', hex);
  // Normalize hex: remove # and expand 3-digit to 6-digit
  let cleanHex = hex.trim().replace(/^#/, '').toLowerCase();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (cleanHex.length !== 6) {
    if (verbose)
      console.warn('[hexToHSLA] Invalid hex length; defaulting to 000000. Input:', cleanHex);
    cleanHex = '000000';
  }
  if (verbose) console.log('[hexToHSLA] cleanHex:', cleanHex);

  // Parse RGB values
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  if (verbose) console.log('[hexToHSLA] r,g,b:', r, g, b);

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  if (verbose) console.log('[hexToHSLA] max,min,delta:', max, min, delta);

  // Calculate lightness
  const lightness = (max + min) / 2;
  if (verbose) console.log('[hexToHSLA] lightness:', lightness);

  // Calculate saturation
  let saturation = 0;
  if (delta !== 0) {
    saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  }
  if (verbose) console.log('[hexToHSLA] saturation:', saturation);

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
  if (verbose) console.log('[hexToHSLA] hue (0-1):', hue);

  // Convert to degrees and percentages
  const hueInDegrees = Math.round(hue * 360);
  const saturationPercent = Math.round(saturation * 100);
  const lightnessPercent = Math.round(lightness * 100);

  const out: HSLA = [hueInDegrees, saturationPercent, lightnessPercent, 1];
  if (verbose) console.log('[hexToHSLA] result HSLA:', out);

  return out;
}

/**
 * Generates a complete Kiskadee color scale (0-100) from a hex color.
 * The input color is used as the anchor at tone 50.
 *
 * Scale rules:
 * - Tone 0-10: 100% to 90% lightness (1% decrements, 11 tones total)
 * - Tone 10-50: proportional distribution from 90% to anchor lightness
 * - Tone 50-100: proportional distribution from anchor to 0% lightness
 *
 * @param hexColor - Hexadecimal color string (e.g., "#6750A4")
 * @param prioritizeLightnessScale - When true, set tone 50 to L=50 regardless of input; when false, keep the input lightness at 50.
 * @returns ColorScale object with tones 0, 1, 2...100
 *
 * @example
 * const scale = generateColorScale("#6750A4", true);
 * // Returns a ColorScale with tone 50 centered at 50 when the second argument is true.
 */
type ToneOverrides = Partial<Record<LightTrackTones | DarkTrackTones, string>>;

export function generateColorScale(hexColor: string, prioritizeLightnessScale = false): ToneTracks {
  const [hue, saturation, originalAnchorLightness, alpha] = hexToHSLA(hexColor);
  const anchorLightness = prioritizeLightnessScale ? 50 : originalAnchorLightness; // when prioritizing the lightness scale, center at 50

  const scale: ColorScale = {};

  // Range 0-10: 100% to 90% lightness (1% decrements)
  for (let tone = 0; tone <= 10; tone += 1) {
    const lightness = 100 - tone;
    scale[tone as keyof ColorScale] = [hue, saturation, lightness, alpha];
  }

  // Range 10-50: distribute from 90% to anchor lightness
  const rangeBeforeAnchor = 90 - anchorLightness;
  const stepsBeforeAnchor = 4; // 20, 30, 40, 50
  const stepSizeBeforeAnchor = rangeBeforeAnchor / stepsBeforeAnchor;

  scale[20] = [hue, saturation, Math.round(90 - stepSizeBeforeAnchor), alpha];
  scale[30] = [hue, saturation, Math.round(90 - stepSizeBeforeAnchor * 2), alpha];
  scale[40] = [hue, saturation, Math.round(90 - stepSizeBeforeAnchor * 3), alpha];
  scale[50] = [hue, saturation, anchorLightness, alpha]; // Anchor (either original or centered at 50)

  // Range 50-100: distribute from anchor to 0% lightness
  const rangeAfterAnchor = anchorLightness;
  const stepsAfterAnchor = 5; // 60, 70, 80, 90, 100
  const stepSizeAfterAnchor = rangeAfterAnchor / stepsAfterAnchor;

  scale[60] = [hue, saturation, Math.round(anchorLightness - stepSizeAfterAnchor), alpha];
  scale[70] = [hue, saturation, Math.round(anchorLightness - stepSizeAfterAnchor * 2), alpha];
  scale[80] = [hue, saturation, Math.round(anchorLightness - stepSizeAfterAnchor * 3), alpha];
  scale[90] = [hue, saturation, Math.round(anchorLightness - stepSizeAfterAnchor * 4), alpha];
  scale[100] = [hue, saturation, 0, alpha];

  // Split into tone tracks
  const soft: ColorScaleLight = {};
  const solid: ColorScaleDark = {};

  // Soft: 0–10 (step 1), then 15, 20, 25, 30
  // Copy 0..10 directly
  for (let t = 0; t <= 10; t += 1) {
    const c = scale[t as keyof ColorScale] as HSLA | undefined;
    if (c) soft[t as keyof ColorScaleLight] = c;
  }
  // Interpolate 15 between 10 and 20
  if (scale[10] && scale[20]) {
    const L15 = Math.round(((scale[10] as HSLA)[2] + (scale[20] as HSLA)[2]) / 2);
    soft[15 as keyof ColorScaleLight] = [hue, saturation, L15, alpha];
  }
  // 20 from base scale
  if (scale[20]) {
    soft[20 as keyof ColorScaleLight] = scale[20] as HSLA;
  }
  // Interpolate 25 between 20 and 30
  if (scale[20] && scale[30]) {
    const L25 = Math.round(((scale[20] as HSLA)[2] + (scale[30] as HSLA)[2]) / 2);
    soft[25 as keyof ColorScaleLight] = [hue, saturation, L25, alpha];
  }
  // 30 from base scale
  if (scale[30]) {
    soft[30 as keyof ColorScaleLight] = scale[30] as HSLA;
  }

  // Solid: 40–100 every 10%
  for (const tone of [40, 50, 60, 70, 80, 90, 100] as const) {
    const c = scale[tone];
    if (c) solid[tone] = c;
  }

  // Force absolute extremes so that tone 0 and 100 are truly neutral white/black.
  // This keeps intermediate tones tinted by the original hue/saturation while
  // making the scale endpoints consistent across semantics.
  soft[0] = [0, 0, 100, alpha];
  solid[100] = [0, 0, 0, alpha];

  return { soft, solid };
}

/**
 * Generates a complete Kiskadee color scale and logs it in a format that's easy to copy.
 *
 * @param hexColor - Hexadecimal color string (e.g., "#6750A4")
 * @param prioritizeLightnessScale - When true, ignore the original lightness and center tone 50 at 50.
 *                                   When false (default), keep the input color's original lightness at 50.
 *
 * @example
 * generateColorScaleWithLog("#6750A4", true);
 * // Logs the scale structure and returns the ColorScale object
 */
export function generateColorScaleWithLog(
  hexColor: string,
  prioritizeLightnessScale = false,
  overrides?: ToneOverrides
): ToneTracks {
  const baseTracks = generateColorScale(hexColor, prioritizeLightnessScale);

  // Clone base tracks so we can apply overrides only for logging / file
  // emission, while still knowing what was originally generated.
  const tracks: ToneTracks = {
    soft: { ...baseTracks.soft },
    solid: { ...baseTracks.solid }
  };

  const overriddenTones = new Set<number>();

  // Apply optional overrides without ever changing absolute extremes 0/100.
  if (overrides) {
    for (const [toneKey, hex] of Object.entries(overrides)) {
      if (!hex) continue;
      const tone = Number(toneKey);

      if (tone === 0 || tone === 100) {
        // Do not override absolute white/black.
        continue;
      }

      if ((tone as LightTrackTones) >= 0 && (tone as LightTrackTones) <= 30) {
        const key = tone as LightTrackTones;
        tracks.soft[key] = hexToHSLA(hex);
        overriddenTones.add(tone);
        continue;
      }

      if ((tone as DarkTrackTones) >= 40 && (tone as DarkTrackTones) <= 100) {
        const key = tone as DarkTrackTones;
        tracks.solid[key] = hexToHSLA(hex);
        overriddenTones.add(tone);
        continue;
      }
    }
  }

  const isPrioritizingScale = prioritizeLightnessScale;

  // Recompute original lightness to derive an approximate darkness label.
  // For prioritizeLightnessScale=false this is used only to document the
  // anchor color (tone 50). For prioritizeLightnessScale=true we also use it
  // to pick the closest DarkTrackTone in the canonical scale for usage
  // guidance. This does not affect the generated scale itself.
  const [, , originalLightness] = hexToHSLA(hexColor);
  const originalDarkness = 100 - originalLightness;

  const darkTones: (keyof ColorScaleDark)[] = [40, 50, 60, 70, 80, 90, 100];

  function getNearestDarkTone(darkness: number): keyof ColorScaleDark {
    let bestTone = darkTones[0];
    let bestDiff = Math.abs(darkness - (bestTone as number));

    for (const tone of darkTones) {
      const diff = Math.abs(darkness - (tone as number));
      if (diff < bestDiff) {
        bestTone = tone;
        bestDiff = diff;
      }
    }

    return bestTone;
  }

  // When we prioritize the lightness scale, we keep the canonical
  // "index ≈ darkness%" relationship and use the nearest dark tone to the
  // original color as the usage anchor. When we do NOT prioritize the
  // lightness scale, tone 50 is always the semantic anchor (exact input
  // color), so we do not use the nearest tone concept there.
  const usageAnchorTone = isPrioritizingScale
    ? (getNearestDarkTone(originalDarkness) as 40 | 50 | 60 | 70 | 80 | 90 | 100)
    : 50;

  // Build pretty lines for soft and solid
  const softLines: string[] = [];
  const solidLines: string[] = [];

  // Soft header
  softLines.push('  soft: {');
  softLines.push('    // Soft track: 0–10 (every 1%), then 15, 20, 25, 30');
  const softKeysForLog = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30] as const;
  for (const tone of softKeysForLog) {
    const color = tracks.soft[tone as keyof ColorScaleLight];
    if (color) {
      const t = tone as number;
      const comment = t === 0 ? ' // 0% darkness (white/lightest)' : ` // ${t}% darkness`;
      softLines.push(`    ${t}: [${color.join(', ')}],${comment}`);
    }
  }
  softLines.push('  },');

  // Solid header
  const anchor = tracks.solid[50];
  solidLines.push('  solid: {');
  if (anchor?.[2] !== undefined) {
    if (isPrioritizingScale) {
      solidLines.push(
        `    // Solid track: 40–100 every 10% darkness (40, 50, 60, 70, 80, 90, 100); 50 is the scale mid-point (L=50)`
      );
      solidLines.push(
        `    // Original color darkness ≈ ${originalDarkness}% → usage anchor tone ${usageAnchorTone}`
      );
    } else {
      solidLines.push(
        `    // Solid track: 40–100 every 10% darkness (40, 50, 60, 70, 80, 90, 100)`
      );
      solidLines.push(`    // Tone 50 is the anchor color (exactly the input hex lightness)`);
    }
  }
  for (const tone of [40, 50, 60, 70, 80, 90, 100] as const) {
    const color = tracks.solid[tone];
    const baseColor = baseTracks.solid[tone];
    if (!color) continue;
    const comment = (() => {
      const darknessLabel = `${100 - color[2]}% darkness`;

      const isOverridden = overriddenTones.has(tone);

      if (isPrioritizingScale) {
        // Canonical scale: index ≈ darkness%. We highlight the tone whose
        // darkness is closest to the original color as the usage anchor.
        if (isOverridden && baseColor) {
          const generatedHex = convertHslaToHex(baseColor);
          const finalHex = convertHslaToHex(color);
          return ` // ${darknessLabel} - OVERRIDDEN (generated ${generatedHex} -> ${finalHex})`;
        }

        if (tone === usageAnchorTone) {
          return ` // ${darknessLabel} - closest tone to original color (${hexColor.toUpperCase()}, L=${originalLightness}%) - USAGE ANCHOR`;
        }

        if (tone === 50) {
          return ' // 50% darkness - scale mid-point (L=50)';
        }

        if (tone === 100) {
          return ' // 100% darkness (black/darkest)';
        }

        return ` // ${darknessLabel}`;
      }

      // Non-canonical mode: tone 50 is exactly the input color; the rest of the
      // track bends around it. We keep comments minimal here.
      if (tone === 50) {
        if (isOverridden && baseColor) {
          const generatedHex = convertHslaToHex(baseColor);
          const finalHex = convertHslaToHex(color);
          return ` // Anchor color (input) - OVERRIDDEN (generated ${generatedHex} -> ${finalHex})`;
        }
        return ` // Anchor color (input) - ${hexColor.toUpperCase()}`;
      }

      if (isOverridden && baseColor) {
        const generatedHex = convertHslaToHex(baseColor);
        const finalHex = convertHslaToHex(color);
        return ` // OVERRIDDEN (generated ${generatedHex} -> ${finalHex})`;
      }

      return '';
    })();
    solidLines.push(`    ${tone}: [${color.join(', ')}],${comment}`);
  }
  solidLines.push('  }');

  const prettyBodyOnly = ['{', ...softLines, ...solidLines, '}'].join('\n');

  // Console output
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Color Scale (${hexColor})`);
  console.log('='.repeat(80));
  console.log('\n// Copy the structure below and paste inside your palette object (ToneTracks):\n');
  console.log(prettyBodyOnly);
  console.log(`\n${'='.repeat(80)}\n`);

  // Write the file "color-tones.ts" next to this script (overwrite on each run)
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const outFilePath = join(__dirname, 'color-tones.ts');
  const fileContent = `export default ${prettyBodyOnly}\n`;
  writeFileSync(outFilePath, fileContent, 'utf8');
  console.log(`[generateColorScaleWithLog] Wrote TS to: ${outFilePath}`);

  return tracks;
}

// macOS rest #2E7CF6
// macOS pressed #2970DE
// iOS 26 #0091FF
// iOS 18 #007AFF

generateColorScaleWithLog('#0F6CBD', true, {
  70: '#115EA3'
});
