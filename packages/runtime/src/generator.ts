/**
 * Generates the CSS variable values for the primary color scale
 * based on the Hue and Saturation of a source color.
 *
 * Logic:
 * - Maintains H and S from input.
 * - Calculates Lightness as (100 - Tone).
 * - Output format: "H S% L%" (space separated).
 */
export function generatePrimaryScale(h: number, s: number): Record<string, string> {
  const vars: Record<string, string> = {};

  // Soft tones: 0-30
  const softTones = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30];
  // Solid tones: 40-100
  const solidTones = [40, 50, 60, 70, 80, 90, 100];

  const allTones = [...softTones, ...solidTones];

  for (const tone of allTones) {
    const l = 100 - tone;
    // Ensure 0 <= l <= 100 (though 100-tone is safe with these inputs)
    const safeL = Math.max(0, Math.min(100, l));

    vars[`--k-p-${tone}`] = `${h} ${s}% ${safeL}%`;
  }

  return vars;
}
