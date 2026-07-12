import { access, mkdir, mkdtemp, open, rename, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, join, resolve, sep } from 'node:path';

import {
  type TonalArtifactBundle,
  TonalArtifactError,
  verifyTonalArtifactBundle
} from './tonal-artifacts.ts';

/**
 * Writes a verified bundle through a sibling temporary directory and publishes
 * it with one final rename. An exclusive sibling lock serializes package
 * writers, and an existing destination is refused before publication.
 */
export async function writeTonalArtifactBundle(
  bundle: TonalArtifactBundle,
  outputDirectory: string
): Promise<void> {
  const verification = await verifyTonalArtifactBundle(bundle.files);
  if (!verification.valid) {
    throw new TonalArtifactError(
      `Refusing to write an invalid artifact bundle: ${verification.issues[0]?.message ?? 'unknown verification error'}`
    );
  }

  const destination = resolve(outputDirectory);
  const parent = dirname(destination);
  await mkdir(parent, { recursive: true });
  const lockPath = join(parent, `.${basename(destination)}.lock`);
  const lock = await acquireWriterLock(lockPath, destination);
  let temporary: string | null = null;

  try {
    if (await pathExists(destination)) {
      throw new TonalArtifactError(`Output directory already exists: ${destination}`);
    }

    temporary = await mkdtemp(join(parent, `.${basename(destination)}.tmp-`));
    for (const [relativePath, contents] of bundle.files) {
      const target = resolve(temporary, relativePath);
      if (!target.startsWith(`${temporary}${sep}`)) {
        throw new TonalArtifactError(`Artifact path escapes the output directory: ${relativePath}`);
      }

      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, contents, 'utf8');
    }

    await rename(temporary, destination);
    temporary = null;
  } catch (error) {
    if (temporary !== null) {
      await rm(temporary, { recursive: true, force: true });
    }
    throw error;
  } finally {
    try {
      await lock.close();
    } finally {
      await rm(lockPath, { force: true });
    }
  }
}

async function acquireWriterLock(lockPath: string, destination: string) {
  try {
    return await open(lockPath, 'wx');
  } catch (error) {
    if (isNodeError(error) && error.code === 'EEXIST') {
      throw new TonalArtifactError(
        `Another artifact writer is publishing this destination: ${destination}`
      );
    }
    throw error;
  }
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') return false;
    throw error;
  }
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}
