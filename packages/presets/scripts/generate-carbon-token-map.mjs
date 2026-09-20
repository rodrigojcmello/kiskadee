import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { deltaEOk, hexToOklch } from '../../tonal-scale/src/color-math.ts';

const evidence = new URL('../docs/design-systems/carbon-ibm/colors/', import.meta.url);
const source = JSON.parse(readFileSync(new URL('figma-theme-tokens.json', evidence), 'utf8'));
const primitives = JSON.parse(readFileSync(new URL('official-primitives.json', evidence), 'utf8'));
const families = {
  Gray: ['n.black.v1', 'black'],
  Blue: ['b.blue.v1', 'blue'],
  Red: ['r.red.v1', 'red'],
  Green: ['g.green.v1', 'green'],
  Yellow: ['y.yellow.v1', 'yellow'],
  Orange: ['yr.orange.v1', 'orange'],
  Purple: ['pb.indigo.v1', 'purple']
};
const assets = Object.fromEntries(
  Object.entries(families).map(([name, [id]]) => [
    name,
    JSON.parse(readFileSync(new URL(`generated/colors/${id}.json`, evidence), 'utf8'))
  ])
);
const records = {};
const mappings = [];
for (const [sourceName, colors] of Object.entries(source.tokens)) {
  const parts = sourceName.split('/');
  const name = (
    parts.length === 3
      ? `${parts[2].replace('-transparent', '')}-${parts[1].toLowerCase()}`
      : parts[1]
  ).replace('text--', 'text-');
  records[name] = {};
  for (const [theme, index] of [
    ['light', 0],
    ['dark', 2],
    ['darker', 3]
  ]) {
    const sourceHex = colors[index];
    const hex = sourceHex.slice(0, 7);
    const alpha = sourceHex.length === 9 ? (parseInt(sourceHex.slice(7), 16) / 255) * 100 : 100;
    const track = theme === 'light' ? 'light' : 'dark';
    if (hex === '#ffffff' || hex === '#000000' || alpha === 0) {
      const polarity = hex === '#000000' ? 'dark' : 'light';
      records[name][theme] = { mode: 'cap', primitive: 'primitive.black.v1', polarity, alpha };
      mappings.push({
        token: name,
        theme,
        sourceName,
        sourceHex,
        sourcePrimitive: primitives[hex] ?? 'Physical endpoint',
        locator: records[name][theme],
        generatedHex: sourceHex,
        deltaE: 0
      });
      continue;
    }
    const sourcePrimitive = primitives[hex];
    const family = sourcePrimitive?.split('/')[1];
    if (!families[family])
      throw new Error(`Unmapped source primitive: ${name} ${hex} ${sourcePrimitive}`);
    const sourceColor = hexToOklch(hex);
    const [tone, generatedHex] = Object.entries(assets[family].scales[track]).sort(
      (a, b) => deltaEOk(sourceColor, hexToOklch(a[1])) - deltaEOk(sourceColor, hexToOklch(b[1]))
    )[0];
    records[name][theme] = {
      mode: 'exact',
      role: `primitive.${families[family][1]}.v1`,
      tone: Number(tone),
      evidenceId: 'source.tokens',
      alpha
    };
    mappings.push({
      token: name,
      theme,
      sourceName,
      sourceHex,
      sourcePrimitive,
      familyId: families[family][0],
      locator: records[name][theme],
      generatedHex,
      deltaE: Number(deltaEOk(sourceColor, hexToOklch(generatedHex)).toFixed(4))
    });
  }
}
writeFileSync(new URL('token-mapping.json', evidence), `${JSON.stringify(mappings, null, 2)}\n`);
const destination = new URL('../src/presets/carbon-ibm/carbon-ibm.tokens.ts', import.meta.url);
writeFileSync(
  destination,
  `import type { ThemeMode } from '@kiskadee/core';
import type { PresetSolidColorRole } from '../../utils/presetColor.ts';
import type { CarbonIbmColorResolver } from './carbon-ibm.color.ts';

// Generated from inspected Carbon tokens; source and distances live in colors/token-mapping.json.
export const carbonTokenLocators = ${JSON.stringify(records, null, 2)} as const;
export type CarbonTokenName = keyof typeof carbonTokenLocators;

export function tokenColor(c: CarbonIbmColorResolver, theme: ThemeMode, token: CarbonTokenName, role?: PresetSolidColorRole) {
  const locator = carbonTokenLocators[token][theme];
  return c.resolve('default', theme === 'light' ? 'l' : 'd', locator.mode === 'cap' ? locator : { ...locator, role: role ?? locator.role });
}
`
);
console.log(`Mapped ${Object.keys(records).length} Carbon tokens to ${fileURLToPath(destination)}`);
