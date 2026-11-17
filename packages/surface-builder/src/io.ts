import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildSurfaceContextsArtifact,
  type SurfaceContextsArtifact,
  validateSurfaceContextsArtifact
} from './artifact.ts';
import type { SurfacePreset } from './load-presets.ts';

const defaultOutputDirectory = fileURLToPath(new URL('../build/', import.meta.url));

type SurfaceBuildOptions = { outputDirectory?: string };

export function getSurfaceContextsPath(
  preset: SurfacePreset,
  options: SurfaceBuildOptions = {}
): string {
  if (!/^[a-z0-9-]+$/.test(preset.key))
    throw new Error(`[surface-builder] Invalid preset key "${preset.key}".`);
  return join(
    options.outputDirectory ?? defaultOutputDirectory,
    preset.key,
    'surface-contexts.json'
  );
}

export async function generateSurfaceContexts(
  presets: readonly SurfacePreset[],
  options: SurfaceBuildOptions = {}
): Promise<void> {
  const entries = presets.map((preset) => ({
    path: getSurfaceContextsPath(preset, options),
    artifact: buildSurfaceContextsArtifact(preset),
    preset
  }));
  const paths = new Set<string>();
  for (const { path, artifact, preset } of entries) {
    if (paths.has(path)) throw new Error(`[surface-builder] Duplicate surface output "${path}".`);
    paths.add(path);
    validateSurfaceContextsArtifact(artifact, preset);
  }
  for (const { path, artifact } of entries) {
    await mkdir(dirname(path), { recursive: true });
    const temporaryPath = `${path}.${randomUUID()}.tmp`;
    try {
      await writeFile(temporaryPath, `${JSON.stringify(artifact, null, 2)}\n`, { flag: 'wx' });
      await rename(temporaryPath, path);
    } finally {
      await rm(temporaryPath, { force: true });
    }
  }
}

export async function readSurfaceContexts(
  preset: SurfacePreset,
  options: SurfaceBuildOptions = {}
): Promise<SurfaceContextsArtifact> {
  const path = getSurfaceContextsPath(preset, options);
  try {
    const value: unknown = JSON.parse(await readFile(path, 'utf8'));
    validateSurfaceContextsArtifact(value, preset);
    return value;
  } catch (cause) {
    const errorMessage = cause instanceof Error ? cause.message : String(cause);
    throw new Error(`[surface-builder] Cannot load ${path}: ${errorMessage}`, { cause });
  }
}
