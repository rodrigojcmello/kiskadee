import { generateKiskadeeScale, type KiskadeeTheme } from '../src/kiskadee-tonal-scale.ts';

const usage = 'Usage: pnpm generate <hex> [light|dark]';
const [seedHex, themeArgument = 'light', ...unexpectedArguments] = process.argv.slice(2);

if (!seedHex || unexpectedArguments.length > 0) {
  console.error(usage);
  process.exitCode = 1;
} else if (themeArgument !== 'light' && themeArgument !== 'dark') {
  console.error(`Invalid theme: ${themeArgument}`);
  console.error(usage);
  process.exitCode = 1;
} else {
  printScale(seedHex, themeArgument);
}

function printScale(seedHex: string, theme: KiskadeeTheme): void {
  const result = generateKiskadeeScale({
    seedHex,
    theme,
    variant: 'standard'
  });

  if (!result.diagnostics.valid) {
    console.error(result.diagnostics.error?.message ?? `Invalid hex color: ${seedHex}`);
    process.exitCode = 1;
    return;
  }

  const normalizedSeed = result.colors.find((color) => color.tone === result.anchorTone)?.hex;

  console.log(`Kiskadee v1 | ${theme} | seed ${normalizedSeed} | anchor K${result.anchorTone}`);

  for (const color of result.colors) {
    const anchor = color.tone === result.anchorTone ? ' [anchor]' : '';
    const lightness = color.oklch.l.toFixed(2);
    const chroma = color.oklch.c.toFixed(4);
    const hue = color.oklch.h.toFixed(2);

    console.log(
      `K${color.tone.toString().padEnd(3)} ${color.hex}  oklch(${lightness}% ${chroma} ${hue})${anchor}`
    );
  }
}
