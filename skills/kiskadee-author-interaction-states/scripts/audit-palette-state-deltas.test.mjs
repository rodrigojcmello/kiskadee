import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

const script = fileURLToPath(new URL('./audit-palette-state-deltas.mjs', import.meta.url));
function audit(rest, hover) {
  const directory = mkdtempSync(join(tmpdir(), 'palette-audit-'));
  try {
    const path = join(directory, 'schema.json');
    writeFileSync(
      path,
      JSON.stringify({
        components: {
          slider: {
            elements: { thumb: { palettes: { rest, hover } } }
          }
        }
      })
    );
    return spawnSync(process.execPath, [script, path, 'slider', 'hover'], { encoding: 'utf8' });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

it.each([
  ['#ffffff', { ref: '#ffffff' }],
  [{ ref: '#ffffff' }, '#ffffff'],
  [{ ref: '#ffffff' }, { ref: '#ffffff' }],
  ['#ffffff', '#ffffff'],
  ['#00000000', { ref: '#00000000' }]
])('detects equal direct and scope-referenced paint: %j / %j', (rest, hover) => {
  const result = audit(rest, hover);
  expect(result.status).toBe(1);
  expect(result.stderr).toContain('components.slider.elements.thumb.palettes');
});

it('retains actual deltas and distinguishes opaque from transparent black', () => {
  expect(audit('#ffffff', { ref: '#eeeeee' }).status).toBe(0);
  expect(audit('#000000', { ref: '#00000000' }).status).toBe(0);
});
