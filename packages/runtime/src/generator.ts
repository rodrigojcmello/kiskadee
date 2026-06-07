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

  // Soft tones: 0–15 (step 1), then 20, 25, 30
  const softTones = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 20, 25, 30];
  // Solid tones: 35–100 (step 5)
  const solidTones = [35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];

  const allTones = [...softTones, ...solidTones];

  for (const tone of allTones) {
    const l = 100 - tone;
    // Ensure 0 <= l <= 100 (though 100-emphasis is safe with these inputs)
    const safeL = Math.max(0, Math.min(100, l));

    vars[`--k-p-${tone}`] = `${h} ${s}% ${safeL}%`;
  }

  return vars;
}
