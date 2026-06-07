import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { generateMaterialColorArtifacts } from './generate-material-color-artifacts.ts';

function createTempDir(prefix = 'material-artifacts-'): string {
  return mkdtempSync(join(tmpdir(), prefix));
}

describe('generateMaterialColorArtifacts', () => {
  it('writes full semantic ramps and both primary/neutral versions when secondaryHex is provided', () => {
    const outDir = createTempDir();
    try {
      generateMaterialColorArtifacts({
        primaryHex: '#0f6cbd',
        secondaryHex: '#ff6f00',
        tertiaryHex: '#22c55e',
        mode: 'static',
        outDir
      });

      const files = readdirSync(join(outDir, 'colors')).sort();
      expect(files).toHaveLength(12);
      expect(files).toContain('black.v1.dark.ts');
      expect(files).toContain('black.v1.light.ts');
      expect(files).toContain('black.v2.dark.ts');
      expect(files).toContain('black.v2.light.ts');
      expect(files).toContain('red.v1.dark.ts');
      expect(files).toContain('red.v1.light.ts');

      const layerFile = readFileSync(join(outDir, 'color.layers.ts'), 'utf8');
      expect(layerFile).toMatch(
        /primary:\s*{[\s\S]*v1:\s*'primitive\.[^']+\.v1',[\s\S]*v2:\s*'primitive\.[^']+\.v2'[\s\S]*}/
      );
      expect(layerFile).toMatch(
        /neutral:\s*{[\s\S]*v1:\s*'primitive\.[^']+\.v1',[\s\S]*v2:\s*'primitive\.[^']+\.v2'[\s\S]*}/
      );
    } finally {
      rmSync(outDir, { recursive: true, force: true });
    }
  });

  it('writes single-version output by default when secondaryHex is not provided', () => {
    const outDir = createTempDir();
    try {
      generateMaterialColorArtifacts({
        primaryHex: '#0f6cbd',
        tertiaryHex: '#22c55e',
        mode: 'static',
        outDir
      });

      const files = readdirSync(join(outDir, 'colors')).sort();
      expect(files).toHaveLength(8);
      expect(files).toContain('black.v1.dark.ts');
      expect(files).toContain('black.v1.light.ts');
      expect(files).toContain('red.v1.dark.ts');
      expect(files).toContain('red.v1.light.ts');
      expect(files.every((fileName) => !fileName.includes('.v2.'))).toBe(true);

      const layerFile = readFileSync(join(outDir, 'color.layers.ts'), 'utf8');
      expect(layerFile).toContain('purpleLike');
      expect(layerFile).toContain('redLike');

      expect(layerFile).toMatch(/primary:\s*{\s*v1:\s*'primitive\.[^']+\.v1'\s*},/);
      expect(layerFile).toMatch(/neutral:\s*{\s*v1:\s*'primitive\.[^']+\.v1'\s*},/);
      expect(layerFile).not.toMatch(/primary:\s*{[\s\S]*v2:\s*'primitive\.[^']+\.v2'/);
      expect(layerFile).not.toMatch(/neutral:\s*{[\s\S]*v2:\s*'primitive\.[^']+\.v2'/);
    } finally {
      rmSync(outDir, { recursive: true, force: true });
    }
  });
});
