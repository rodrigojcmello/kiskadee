import { generateKiskadeeScale } from '@kiskadee/tonal-scale/generator';

export function generatePrimaryScale(seedHex: string): Record<string, string> {
  const variables: Record<string, string> = {};
  for (const theme of ['light', 'dark'] as const) {
    const result = generateKiskadeeScale({ seedHex, theme, profile: 'balanced' });
    if (!result.diagnostics.valid) {
      throw new Error(result.diagnostics.error?.message ?? `Unable to generate ${theme} scale`);
    }
    for (const color of result.colors) {
      variables[`--k-p-${theme}-${color.tone}`] = color.hex.toLowerCase();
    }
  }
  return variables;
}
