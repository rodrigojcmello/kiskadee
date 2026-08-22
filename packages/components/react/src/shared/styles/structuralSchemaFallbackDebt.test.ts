import { readdirSync, readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { STRUCTURAL_SCHEMA_FALLBACK_DEBT } from './structuralSchemaFallbackDebt.ts';

const sourceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const schemaVariableFallbackPattern =
  /var\((--k-(?:bxw|bxh|pdt|pdr|pdb|pdl|mgt|mgr|mgb|mgl|bdw|bdr))\s*,/g;

function collectStructuralFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return collectStructuralFiles(path);
    return entry.name.endsWith('.structural.scss') ? [path] : [];
  });
}

function collectFallbackCounts(): Map<string, number> {
  const counts = new Map<string, number>();
  for (const file of collectStructuralFiles(sourceRoot)) {
    const source = readFileSync(file, 'utf8');
    const fileName = relative(sourceRoot, file);
    for (const match of source.matchAll(schemaVariableFallbackPattern)) {
      const key = `${fileName}|${match[1]}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return counts;
}

describe('structural schema variable fallbacks', () => {
  it('matches the explicit debt register exactly', () => {
    const actual = [...collectFallbackCounts()].sort(([left], [right]) =>
      left.localeCompare(right)
    );
    const expected = STRUCTURAL_SCHEMA_FALLBACK_DEBT.map(
      ({ file, variable, count }) => [`${file}|${variable}`, count] as const
    ).sort(([left], [right]) => left.localeCompare(right));

    expect(actual).toEqual(expected);
    expect(
      STRUCTURAL_SCHEMA_FALLBACK_DEBT.every(({ justification }) => justification.length > 0)
    ).toBe(true);
  });

  it('keeps every migrated icon slot free of CSS variable fallbacks', () => {
    const targets = [
      ['components/Button/Button.structural.scss', ['k-btn-e3', 'k-btn-e5']],
      ['components/Dropdown/Dropdown.structural.scss', ['k-ddn-e3', 'k-ddn-e6', 'k-ddn-e10']],
      [
        'components/BottomSheet/BottomSheet.structural.scss',
        ['k-bsh-e8', 'k-bsh-e11', 'k-bsh-e15']
      ],
      ['components/Switch/Switch.structural.scss', ['k-swt-e6-a']],
      ['components/Slider/Slider.structural.scss', ['k-sld-e6-a', 'k-sld-e19-a']],
      ['components/Tabs/bridge/Tabs.bridge.scss', ['k-tab-e4-a']]
    ] as const;

    for (const [file, selectors] of targets) {
      const source = readFileSync(resolve(sourceRoot, file), 'utf8');
      for (const selector of selectors) {
        const block = source.match(new RegExp(`\\.${selector}\\s*\\{([^}]*)\\}`))?.[1];
        expect(block, `${file} must define .${selector}`).toBeDefined();
        expect(block, `${file} .${selector}`).not.toMatch(/var\(--k-[^)]+,/);
      }
    }
  });
});
