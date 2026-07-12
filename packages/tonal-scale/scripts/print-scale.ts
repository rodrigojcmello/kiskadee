import {
  generateKiskadeeScale,
  isKiskadeeTonalProfile,
  type KiskadeeTonalProfile
} from '../src/kiskadee-tonal-scale.ts';

type ThemeArgument = 'light' | 'dark' | 'both';

const usage = 'Usage: pnpm generate <hex> [light|dark|both] [balanced|muted-darks]';
const [seedHex, themeArgument = 'both', profileArgument = 'balanced', ...unexpectedArguments] =
  process.argv.slice(2);

if (!seedHex || unexpectedArguments.length > 0) {
  console.error(usage);
  process.exitCode = 1;
} else if (!isThemeArgument(themeArgument)) {
  console.error(`Invalid theme: ${themeArgument}`);
  console.error(usage);
  process.exitCode = 1;
} else if (!isKiskadeeTonalProfile(profileArgument)) {
  console.error(`Invalid tonal profile: ${profileArgument}`);
  console.error(usage);
  process.exitCode = 1;
} else {
  const themes = themeArgument === 'both' ? (['light', 'dark'] as const) : [themeArgument];
  for (const [index, theme] of themes.entries()) {
    if (index > 0) console.log('');
    if (!printScale(seedHex, theme, profileArgument)) break;
  }
}

function isThemeArgument(value: string): value is ThemeArgument {
  return value === 'light' || value === 'dark' || value === 'both';
}

function printScale(
  seedHex: string,
  theme: 'light' | 'dark',
  profile: KiskadeeTonalProfile
): boolean {
  const result = generateKiskadeeScale({
    seedHex,
    theme,
    profile
  });

  if (!result.diagnostics.valid) {
    console.error(result.diagnostics.error?.message ?? `Invalid hex color: ${seedHex}`);
    process.exitCode = 1;
    return false;
  }

  const normalizedSeed = result.colors.find((color) => color.tone === result.anchorTone)?.hex;
  const prefix = theme === 'light' ? 'L' : 'D';

  console.log(
    `Kiskadee v1 | ${theme} scale | profile ${profile} | seed ${normalizedSeed} | anchor ${prefix}${result.anchorTone}`
  );

  for (const color of result.colors) {
    const anchor = color.tone === result.anchorTone ? ' [anchor]' : '';
    const lightness = color.oklch.l.toFixed(2);
    const chroma = color.oklch.c.toFixed(4);
    const hue = color.oklch.h.toFixed(2);

    console.log(
      `${prefix}${color.tone.toString().padEnd(3)} ${color.hex}  oklch(${lightness}% ${chroma} ${hue})${anchor}`
    );
  }

  return true;
}
