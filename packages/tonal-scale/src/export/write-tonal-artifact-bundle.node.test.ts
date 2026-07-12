import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { generateKiskadeeTonalSystem } from '../tonal-system.ts';
import { DEFAULT_TONAL_SYSTEM_RECIPE } from '../tonal-system-contract.ts';
import { createTonalArtifactBundle } from './tonal-artifacts.ts';
import { writeTonalArtifactBundle } from './write-tonal-artifact-bundle.node.ts';

const cleanupPaths: string[] = [];

afterEach(async () => {
  await Promise.all(
    cleanupPaths.splice(0).map((path) => rm(path, { recursive: true, force: true }))
  );
});

describe('writeTonalArtifactBundle', () => {
  it('publishes the verified directory tree atomically and refuses overwrites', async () => {
    const parent = await mkdtemp(join(tmpdir(), 'kiskadee-tonal-writer-'));
    cleanupPaths.push(parent);
    const destination = join(parent, 'system');
    const system = generateKiskadeeTonalSystem(DEFAULT_TONAL_SYSTEM_RECIPE);
    expect(system.valid).toBe(true);
    if (!system.valid) return;

    const bundle = await createTonalArtifactBundle(system);
    await writeTonalArtifactBundle(bundle, destination);

    expect(await readFile(join(destination, 'tonal-system.source.json'), 'utf8')).toBe(
      bundle.files.get('tonal-system.source.json')
    );
    expect(await readFile(join(destination, 'colors/blue.v1.json'), 'utf8')).toBe(
      bundle.files.get('colors/blue.v1.json')
    );
    await expect(writeTonalArtifactBundle(bundle, destination)).rejects.toThrow(
      'Output directory already exists'
    );
  });

  it('allows only one concurrent writer to publish a destination', async () => {
    const parent = await mkdtemp(join(tmpdir(), 'kiskadee-tonal-writer-race-'));
    cleanupPaths.push(parent);
    const destination = join(parent, 'system');
    const system = generateKiskadeeTonalSystem(DEFAULT_TONAL_SYSTEM_RECIPE);
    expect(system.valid).toBe(true);
    if (!system.valid) return;

    const bundle = await createTonalArtifactBundle(system);
    const results = await Promise.allSettled([
      writeTonalArtifactBundle(bundle, destination),
      writeTonalArtifactBundle(bundle, destination)
    ]);

    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter((result) => result.status === 'rejected')).toHaveLength(1);
    expect(await readFile(join(destination, 'tonal-system.json'), 'utf8')).toBe(
      bundle.files.get('tonal-system.json')
    );
  });
});
