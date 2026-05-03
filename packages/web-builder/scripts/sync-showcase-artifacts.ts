import { copyFile, mkdir, readdir, rm, stat, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const webBuilderRoot = path.resolve(__dirname, '..');
const srcDir = path.resolve(webBuilderRoot, 'build');
const repoRoot = path.resolve(webBuilderRoot, '..', '..');
const dstDir = path.resolve(repoRoot, 'packages', 'showcase', 'public', 'build');

async function existsDir(dir: string): Promise<boolean> {
  try {
    const dirStats = await stat(dir);
    return dirStats.isDirectory();
  } catch {
    return false;
  }
}

async function removeDirContents(dir: string): Promise<void> {
  if (!(await existsDir(dir))) return;

  const entries = await readdir(dir, { withFileTypes: true });
  await Promise.all(
    entries.map(async (entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await rm(full, { recursive: true, force: true });
      } else {
        await unlink(full);
      }
    })
  );
}

async function copyRecursive(src: string, dst: string): Promise<void> {
  const entries = await readdir(src, { withFileTypes: true });

  await mkdir(dst, { recursive: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);

    if (entry.isDirectory()) {
      await copyRecursive(srcPath, dstPath);
    } else if (entry.isFile()) {
      await copyFile(srcPath, dstPath);
    }
  }
}

export async function syncShowcaseArtifacts(): Promise<void> {
  if (!(await existsDir(srcDir))) {
    const err = new Error(
      `[sync-showcase-artifacts] Source directory not found: ${srcDir}. ` +
        'Make sure you have run the @kiskadee/web-builder build beforehand.'
    );
    throw err;
  }

  await mkdir(dstDir, { recursive: true });
  await removeDirContents(dstDir);
  await copyRecursive(srcDir, dstDir);
}
