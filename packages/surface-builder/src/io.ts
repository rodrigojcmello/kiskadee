import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import {
  buildSurfaceContextsArtifact,
  type SurfaceContextsArtifact,
  validateSurfaceContextsArtifact
} from './artifact.ts';
import type { SurfacePreset } from './load-presets.ts';

type SurfaceBuildOptions = { outputDirectory?: string };

export function getSurfaceContextsPath(
  preset: SurfacePreset,
  options: SurfaceBuildOptions = {}
): string {
  if (!/^[a-z0-9-]+$/.test(preset.key))
    throw new Error(`[surface-builder] Invalid preset key "${preset.key}".`);
  const directory =
    options.outputDirectory === undefined
      ? join(dirname(preset.schemaPath), 'generated')
      : join(options.outputDirectory, preset.key);
  return join(directory, 'surface-contexts.json');
}

function serializeSurfaceContexts(preset: SurfacePreset): string {
  const artifact = buildSurfaceContextsArtifact(preset);
  validateSurfaceContextsArtifact(artifact, preset);
  return `${JSON.stringify(artifact, null, 2)}\n`;
}

function assertGeneratedContents(path: string, stored: Buffer, contents: string): void {
  if (!stored.equals(Buffer.from(contents))) {
    throw new Error(
      `[surface-builder] ${path} differs from generated output. Run pnpm --filter @kiskadee/surface-builder build.`
    );
  }
}

function prepareSurfaceFiles(presets: readonly SurfacePreset[], options: SurfaceBuildOptions) {
  const paths = new Set<string>();
  return presets.map((preset) => {
    const path = getSurfaceContextsPath(preset, options);
    if (paths.has(path)) throw new Error(`[surface-builder] Duplicate surface output "${path}".`);
    paths.add(path);
    return { path, contents: serializeSurfaceContexts(preset) };
  });
}

export async function generateSurfaceContexts(
  presets: readonly SurfacePreset[],
  options: SurfaceBuildOptions = {}
): Promise<void> {
  for (const { path, contents } of prepareSurfaceFiles(presets, options)) {
    await mkdir(dirname(path), { recursive: true });
    const temporaryPath = `${path}.${randomUUID()}.tmp`;
    try {
      await writeFile(temporaryPath, contents, { flag: 'wx' });
      await rename(temporaryPath, path);
    } finally {
      await rm(temporaryPath, { force: true });
    }
  }
}

/** Compare the versioned companions to freshly derived data without writing to disk. */
export async function checkSurfaceContexts(
  presets: readonly SurfacePreset[],
  options: SurfaceBuildOptions = {}
): Promise<void> {
  for (const { path, contents } of prepareSurfaceFiles(presets, options)) {
    assertGeneratedContents(path, await readFile(path), contents);
  }
}

export async function readSurfaceContexts(
  preset: SurfacePreset,
  options: SurfaceBuildOptions = {}
): Promise<SurfaceContextsArtifact> {
  const path = getSurfaceContextsPath(preset, options);
  let stored: Buffer;
  let artifact: SurfaceContextsArtifact;
  try {
    stored = await readFile(path);
    const value: unknown = JSON.parse(stored.toString('utf8'));
    validateSurfaceContextsArtifact(value, preset);
    artifact = value;
  } catch (cause) {
    const errorMessage = cause instanceof Error ? cause.message : String(cause);
    throw new Error(`[surface-builder] Cannot load ${path}: ${errorMessage}`, { cause });
  }
  assertGeneratedContents(path, stored, serializeSurfaceContexts(preset));
  return artifact;
}
