import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { afterEach, describe, expect, it } from 'vitest';

import { generateKiskadeeTonalSystem } from '../tonal-system.ts';
import { DEFAULT_TONAL_SYSTEM_RECIPE } from '../tonal-system-contract.ts';
import {
  createTonalArtifactBundle,
  TONAL_SOURCE_PATH,
  verifyTonalArtifactBundle
} from './tonal-artifacts.ts';

const execFileAsync = promisify(execFile);
const packageRoot = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const cliPath = join(packageRoot, 'scripts', 'export-tonal-system.ts');
const cleanupPaths: string[] = [];

afterEach(async () => {
  await Promise.all(
    cleanupPaths.splice(0).map((path) => rm(path, { recursive: true, force: true }))
  );
});

describe('export-tonal-system CLI', () => {
  it('writes and verifies the complete canonical tree, then refuses an overwrite', async () => {
    const parent = await mkdtemp(join(tmpdir(), 'kiskadee-tonal-cli-'));
    cleanupPaths.push(parent);
    const sourcePath = join(parent, TONAL_SOURCE_PATH);
    const destination = join(parent, 'bundle');
    const system = generateKiskadeeTonalSystem(DEFAULT_TONAL_SYSTEM_RECIPE);
    expect(system.valid, JSON.stringify(system.issues, null, 2)).toBe(true);
    if (!system.valid) return;

    const expected = await createTonalArtifactBundle(system);
    await writeFile(sourcePath, expected.files.get(TONAL_SOURCE_PATH) ?? '', 'utf8');

    const firstRun = await execFileAsync(process.execPath, [cliPath, sourcePath, destination], {
      cwd: packageRoot
    });
    expect(firstRun.stdout).toContain(`Wrote ${expected.files.size} canonical tonal artifacts`);

    const emitted = new Map<string, string>();
    for (const path of expected.files.keys()) {
      emitted.set(path, await readFile(join(destination, path), 'utf8'));
    }
    expect([...emitted]).toEqual([...expected.files]);
    const verification = await verifyTonalArtifactBundle(emitted);
    expect(verification.valid, JSON.stringify(verification.issues, null, 2)).toBe(true);

    await expect(
      execFileAsync(process.execPath, [cliPath, sourcePath, destination], { cwd: packageRoot })
    ).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining('Output directory already exists')
    });
  }, 120_000);

  it('exits with usage guidance when required arguments are missing', async () => {
    await expect(
      execFileAsync(process.execPath, [cliPath], { cwd: packageRoot })
    ).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining('Usage: pnpm export')
    });
  });
});
