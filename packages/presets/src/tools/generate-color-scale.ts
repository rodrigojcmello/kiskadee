import * as fs from 'node:fs';
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
 * @param verbose - When true, logs intermediate conversion steps.
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

  // Convert to degrees and percentages. We intentionally clamp the HSLA
  // components to two decimal places so that:
  // - generated presets remain stable and readable in git diffs
  // - downstream conversions back to HEX are still precise enough for
  //   real-world design system work.
  const hueInDegrees = Number((hue * 360).toFixed(2));
  const saturationPercent = Number((saturation * 100).toFixed(2));
  const lightnessPercent = Number((lightness * 100).toFixed(2));

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

type DarkToneShaping = {
  /**
   * Solid-track tone that must remain untouched and serve as the reference
   * for dark adjustments. For primary brand colors this is typically 60.
   */
  anchorTone: 40 | 50 | 60;

  /**
   * Total saturation drop (in percentage points) to distribute across the
   * solid tones darker than the anchor. For example, with anchorTone=40 and
   * saturationDropTotal=15 we have tones 50, 60, 70, 80, 90 (5 positions), so
   * each successive tone loses 15/5 = 3 points of saturation relative to the
   * anchor. Always applied as a decrease; pass 0 or omit to keep saturation
   * unchanged.
   */
  saturationDropTotal?: number;

  /**
   * Total hue shift (in degrees) to distribute across solid tones darker than
   * the anchor. Negative values rotate the hue in one direction, positive
   * values in the other. A value of -5 to 5 is recommended (and typical for
   * Fluent-like ramps). The shift is distributed evenly: with
   * hueShiftTotal=5 and 5 darker tones we apply +1, +2, +3, +4, +5 degrees
   * cumulativamente. Pass 0 or omit to keep hue unchanged.
   */
  hueShiftTotal?: number;

  /**
   * Target lightness step (in percentage points) between consecutive solid
   * tones in the dark track. This is applied starting from the anchor tone and
   * moving towards the darker tones (e.g. 70, 80, 90). The value is internally
   * clamped to the inclusive range [5, 20] to avoid steps that are either
   * imperceptibly small (<5) or excessively abrupt (>20). When omitted, the
   * canonical 10-point step is preserved.
   */
  lightnessStep?: number;
};

export function generateColorScale(
  hexColor: string,
  prioritizeLightnessScale = false,
  invertScale = false
): ToneTracks {
  const [hue, saturation, originalAnchorLightness, alpha] = hexToHSLA(hexColor);
  const isTooLightForAnchor = originalAnchorLightness > 70;
  const anchorLightness = isTooLightForAnchor
    ? 50
    : prioritizeLightnessScale
      ? 50
      : originalAnchorLightness; // when prioritizing the lightness scale, or when the input is too light to be an anchor, center at 50

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

  if (invertScale) {
    for (const key of Object.keys(scale)) {
      const tone = Number(key) as keyof ColorScale;
      const color = scale[tone];
      if (!color) continue;

      const [h, s, l, a] = color;
      const invertedLightness = 100 - l;
      scale[tone] = [h, s, invertedLightness, a];
    }
  }

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
  if (invertScale) {
    // In inverted mode we also invert the canonical extremes so that 0 is
    // strictly black and 100 is strictly white.
    soft[0] = [0, 0, 0, alpha];
    solid[100] = [0, 0, 100, alpha];
  } else {
    soft[0] = [0, 0, 100, alpha];
    solid[100] = [0, 0, 0, alpha];
  }

  return { soft, solid };
}

const solidToneOrder: DarkTrackTones[] = [40, 50, 60, 70, 80, 90, 100];

function applySaturationDrop(
  solid: ColorScaleDark,
  anchorTone: DarkTrackTones,
  saturationDropTotal?: number
): void {
  if (!saturationDropTotal || saturationDropTotal <= 0) return;

  // Saturation adjustments must never touch tone 100, which is reserved for
  // absolute black ([0, 0, 0, 1]). We therefore limit shaping strictly to the
  // 40–90 range, even though solidToneOrder also includes 100 for logging
  // purposes.
  const darkerTones = solidToneOrder.filter(
    (tone) => tone > anchorTone && tone <= 90 && solid[tone]
  );
  const count = darkerTones.length;
  if (count === 0) return;

  const dropPerTone = saturationDropTotal / count;
  const anchor = solid[anchorTone];
  if (!anchor) return;

  const baseSaturation = anchor[1];

  darkerTones.forEach((tone, index) => {
    const totalDrop = dropPerTone * (index + 1);
    const next = solid[tone];
    if (!next) return;

    const newSaturation = Number((baseSaturation - totalDrop).toFixed(2));
    solid[tone] = [next[0], newSaturation, next[2], next[3]];
  });
}

function normalizeHue(hue: number): number {
  let h = hue % 360;
  if (h < 0) h += 360;
  return Number(h.toFixed(2));
}

function applyHueShift(
  solid: ColorScaleDark,
  anchorTone: DarkTrackTones,
  hueShiftTotal?: number
): void {
  if (!hueShiftTotal || hueShiftTotal === 0) return;

  // Hue adjustments must also avoid tone 100 so that the darkest extreme
  // remains a neutral black. Limit shaping to tones 40–90.
  const darkerTones = solidToneOrder.filter(
    (tone) => tone > anchorTone && tone <= 90 && solid[tone]
  );
  const count = darkerTones.length;
  if (count === 0) return;

  const step = hueShiftTotal / count;
  const anchor = solid[anchorTone];
  if (!anchor) return;

  const baseHue = anchor[0];

  darkerTones.forEach((tone, index) => {
    const totalShift = step * (index + 1);
    const next = solid[tone];
    if (!next) return;

    const newHue = normalizeHue(baseHue + totalShift);
    solid[tone] = [newHue, next[1], next[2], next[3]];
  });
}

const MIN_LIGHTNESS_STEP = 5;
const MAX_LIGHTNESS_STEP = 20;

function applyLightnessStep(
  solid: ColorScaleDark,
  anchorTone: DarkTrackTones,
  lightnessStep?: number
): void {
  const tones = solidToneOrder.filter((tone) => tone >= 40 && tone <= 90 && solid[tone]);
  if (tones.length < 2) return;

  const anchorIndex = tones.indexOf(anchorTone);
  if (anchorIndex === -1) return;

  const anchor = solid[anchorTone];
  if (!anchor) return;

  // Clamp requested step into the guard-rail range [5, 20]. If none is
  // provided we preserve the canonical 10-point step.
  const rawStep = lightnessStep ?? 10;
  const step = Math.min(Math.max(rawStep, MIN_LIGHTNESS_STEP), MAX_LIGHTNESS_STEP);

  // Walk towards the darker tones (index > anchorIndex), applying the target
  // step cumulatively from the previous tone so that each successive tone
  // remains strictly darker than the one before while avoiding extreme jumps.
  for (let i = anchorIndex + 1; i < tones.length; i += 1) {
    const tone = tones[i];
    const prevTone = tones[i - 1];

    const prev = solid[prevTone];
    const current = solid[tone];
    if (!prev || !current) continue;

    const newLightness = Number((prev[2] - step).toFixed(2));
    solid[tone] = [current[0], current[1], newLightness, current[3]];
  }
}

/**
 * Generates a complete Kiskadee color scale and logs it in a format that's easy to copy.
 *
 * @param hexColor - Hexadecimal color string (e.g., "#6750A4")
 * @param prioritizeLightnessScale - When true, ignore the original lightness and center tone 50 at 50.
 *                                   When false (default), keep the input color's original lightness at 50.
 *
 * @param overrides
 * @param shaping
 * @param invertScale
 * @example
 * generateColorScaleWithLog("#6750A4", true);
 * // Logs the scale structure and returns the ColorScale object
 */
export function generateColorScaleWithLog(
  hexColor: string,
  prioritizeLightnessScale = false,
  overrides?: ToneOverrides,
  shaping?: DarkToneShaping,
  invertScale = false
): ToneTracks {
  const baseTracks = generateColorScale(hexColor, prioritizeLightnessScale, invertScale);

  // Clone base tracks so we can apply overrides only for logging / file
  // emission, while still knowing what was originally generated.
  const tracks: ToneTracks = {
    soft: { ...baseTracks.soft },
    solid: { ...baseTracks.solid }
  };

  if (shaping) {
    const anchorTone = shaping.anchorTone as DarkTrackTones;
    applySaturationDrop(tracks.solid, anchorTone, shaping.saturationDropTotal);
    applyHueShift(tracks.solid, anchorTone, shaping.hueShiftTotal);
    applyLightnessStep(tracks.solid, anchorTone, shaping.lightnessStep);
  }

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
        // For overrides we preserve the full HSLA precision so that the
        // resulting HEX matches the official design system values as closely
        // as possible.
        tracks.soft[key] = hexToHSLA(hex, false);
        overriddenTones.add(tone);
        continue;
      }

      if ((tone as DarkTrackTones) >= 40 && (tone as DarkTrackTones) <= 100) {
        const key = tone as DarkTrackTones;
        // For overrides we preserve the full HSLA precision so that the
        // resulting HEX matches the official design system values as closely
        // as possible.
        tracks.solid[key] = hexToHSLA(hex, false);
        overriddenTones.add(tone);
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
  const isTooLightForAnchor = originalLightness > 70;

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
  const usageAnchorTone =
    isPrioritizingScale && !isTooLightForAnchor
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
    const baseColor = baseTracks.soft[tone as keyof ColorScaleLight];
    if (!color) continue;

    const t = tone as number;
    const isOverridden = overriddenTones.has(t);

    const comment = (() => {
      // Soft track comments mirror the solid track behaviour for overrides: any
      // tone that was replaced via the overrides map should clearly document
      // which HEX was originally generated and which one replaced it.
      if (isOverridden && baseColor) {
        const generatedHex = convertHslaToHex(baseColor as HSLA);
        const finalHex = convertHslaToHex(color as HSLA);

        if (t === 0) {
          // Tone 0 has a special semantic label, so we keep it and append the
          // override information.
          const zeroLabel = invertScale
            ? '100% darkness (black/darkest)'
            : '0% darkness (white/lightest)';
          return ` // ${zeroLabel} - OVERRIDDEN: generated ${generatedHex} was replaced by ${finalHex}`;
        }

        const darknessLabel = invertScale ? 100 - t : t;
        return ` // ${darknessLabel}% darkness - OVERRIDDEN: generated ${generatedHex} was replaced by ${finalHex}`;
      }

      // Non-overridden soft tones keep the existing simple darkness label.
      if (t === 0) {
        const zeroLabel = invertScale
          ? '100% darkness (black/darkest)'
          : '0% darkness (white/lightest)';
        return ` // ${zeroLabel}`;
      }
      const darknessLabel = invertScale ? 100 - t : t;
      return ` // ${darknessLabel}% darkness`;
    })();

    softLines.push(`    ${t}: [${color.join(', ')}],${comment}`);
  }
  softLines.push('  },');

  // Solid header
  const anchor = tracks.solid[50];
  solidLines.push('  solid: {');
  if (anchor?.[2] !== undefined) {
    if (isPrioritizingScale) {
      solidLines.push(
        `    // Solid track: 40–100 every 10% darkness (40, 50, 60, 70, 80, 90, 100)`
      );
      if (!isTooLightForAnchor) {
        solidLines.push(
          `    // Original color darkness ≈ ${originalDarkness}% → usage anchor tone ${usageAnchorTone}`
        );
      }
    } else {
      solidLines.push(
        `    // Solid track: 40–100 every 10% darkness (40, 50, 60, 70, 80, 90, 100)`
      );
      if (!isTooLightForAnchor) {
        solidLines.push(`    // Tone 50 is the anchor color (exactly the input hex lightness)`);
      } else {
        solidLines.push(
          `    // Input color is very light (L=${originalLightness}%), so tone 50 was re-centered to L=50 instead of using the original lightness`
        );
      }
    }
  }
  for (const tone of [40, 50, 60, 70, 80, 90, 100] as const) {
    const color = tracks.solid[tone];
    const baseColor = baseTracks.solid[tone];
    if (!color) continue;
    const comment = (() => {
      const darknessRaw = 100 - color[2];
      const darknessLabel = `${Number(darknessRaw.toFixed(2))}% darkness`;

      const isOverridden = overriddenTones.has(tone);

      if (isPrioritizingScale) {
        // Canonical scale: index ≈ darkness%. We highlight the tone whose
        // darkness is closest to the original color as the usage anchor.
        if (isOverridden && baseColor) {
          const generatedHex = convertHslaToHex(baseColor);
          const finalHex = convertHslaToHex(color);
          return ` // ${darknessLabel} - OVERRIDDEN: generated ${generatedHex} was replaced by ${finalHex}`;
        }

        if (!isTooLightForAnchor && tone === usageAnchorTone) {
          const anchorDarkness = usageAnchorTone as number;
          const isExactDarknessMatch = Math.abs(originalDarkness - anchorDarkness) < 0.0001;

          if (isExactDarknessMatch) {
            return ` // ${darknessLabel} - original color tone (${hexColor.toUpperCase()}) - USAGE ANCHOR`;
          }

          return ` // ${darknessLabel} - closest tone to original color (${hexColor.toUpperCase()}, L=${originalLightness}%) - USAGE ANCHOR`;
        }

        if (tone === 100) {
          const extremeLabel = invertScale
            ? '0% darkness (white/lightest)'
            : '100% darkness (black/darkest)';
          return ` // ${extremeLabel}`;
        }

        return ` // ${darknessLabel}`;
      }

      // Non-canonical mode: tone 50 is normally exactly the input color; the rest
      // of the track bends around it. When the input color is too light to be an
      // anchor we silently re-center tone 50 at L=50.
      if (tone === 50) {
        if (isOverridden && baseColor) {
          const generatedHex = convertHslaToHex(baseColor);
          const finalHex = convertHslaToHex(color);
          return ` // Anchor color (input) - OVERRIDDEN: generated ${generatedHex} was replaced by ${finalHex}`;
        }
        if (isTooLightForAnchor) {
          return ` // Re-centered mid tone (L=50) because input color (${hexColor.toUpperCase()}, L=${originalLightness}%) is too light to be an anchor`;
        }
        return ` // Anchor color (input) - ${hexColor.toUpperCase()}`;
      }

      if (isOverridden && baseColor) {
        const generatedHex = convertHslaToHex(baseColor);
        const finalHex = convertHslaToHex(color);
        return ` // OVERRIDDEN: generated ${generatedHex} was replaced by ${finalHex}`;
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

  // Write the file "color.generated.ts" next to this script (overwrite on each run)
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const outFilePath = join(__dirname, 'color.generated.ts');
  // Emit a small header that captures the exact parameters used to generate
  // this file so it can be easily regenerated later. We keep backwards
  // compatibility with the previous 3-argument form when no shaping config is
  // provided so that existing tests and documentation remain valid.
  let headerLines: string[] = [];

  const hasOverrides = !!overrides && Object.keys(overrides).length > 0;

  if (!shaping) {
    // 4-argument form without shaping: generateColorScaleWithLog(hex, prioritize, overrides, invertScale)
    if (!hasOverrides) {
      headerLines.push(
        `// Generated by generateColorScaleWithLog('${hexColor}', ${prioritizeLightnessScale}, {}, ${invertScale})`
      );
    } else {
      headerLines.push(
        `// Generated by generateColorScaleWithLog('${hexColor}', ${prioritizeLightnessScale}, {`
      );

      const sortedEntries = Object.entries(overrides!).sort(([a], [b]) => Number(a) - Number(b));

      for (const [tone, hex] of sortedEntries) {
        headerLines.push(`//   ${tone}: '${hex}',`);
      }

      headerLines.push(`// }, ${invertScale})`);
    }
  } else {
    // 5-argument form with shaping: generateColorScaleWithLog(hex, prioritize, overrides, shaping, invertScale)
    if (!hasOverrides) {
      headerLines.push(
        `// Generated by generateColorScaleWithLog('${hexColor}', ${prioritizeLightnessScale}, {}, {`
      );
    } else {
      headerLines.push(
        `// Generated by generateColorScaleWithLog('${hexColor}', ${prioritizeLightnessScale}, {`
      );

      const sortedEntries = Object.entries(overrides!).sort(([a], [b]) => Number(a) - Number(b));

      for (const [tone, hex] of sortedEntries) {
        headerLines.push(`//   ${tone}: '${hex}',`);
      }

      headerLines.push('// }, {');
    }

    // Serialize shaping in a stable, explicit order so that diffs are
    // predictable and the header can be copy‑pasted back into the script.
    headerLines.push(`//   anchorTone: ${shaping.anchorTone},`);

    if (typeof shaping.hueShiftTotal === 'number') {
      headerLines.push(`//   hueShiftTotal: ${shaping.hueShiftTotal},`);
    }

    if (typeof shaping.saturationDropTotal === 'number') {
      headerLines.push(`//   saturationDropTotal: ${shaping.saturationDropTotal},`);
    }

    if (typeof shaping.lightnessStep === 'number') {
      headerLines.push(`//   lightnessStep: ${shaping.lightnessStep},`);
    }

    headerLines.push(`// }, ${invertScale})`);
  }

  const header = `${headerLines.join('\n')}\n`;
  const fileContent = `${header}\nimport type { ToneTracks } from '@kiskadee/core';\n\nexport default ${prettyBodyOnly} as ToneTracks\n`;
  fs.writeFileSync(outFilePath, fileContent, 'utf8');
  console.log(`[generateColorScaleWithLog] Wrote TS to: ${outFilePath}`);

  return tracks;
}

// macOS rest #2E7CF6
// macOS pressed #2970DE
// iOS 26 #0091FF
// iOS 18 #007AFF

// Fluent Primary - Light
// generateColorScaleWithLog('#0F6CBD', true, {
//   70: '#115EA3',
//   80: '#0F548C',
//   90: '#0C3B5E'
// });

// Fluent Primary - Dark
// generateColorScaleWithLog('#115EA3', true, {});

// // Fluent Neutral
generateColorScaleWithLog('#fff', true, {}, undefined, false);

// // Fluent 2 by Kiskadee - Primary
// generateColorScaleWithLog(
//   '#0F6CBD',
//   true,
//   {},
//   {
//     anchorTone: 60,
//     hueShiftTotal: -2.25,
//     saturationDropTotal: 7.93,
//     lightnessStep: 6.4
//   }
// );
