import { readdir, stat, unlink } from 'node:fs/promises';
import path from 'node:path';
import {
  buildAllStyles,
  buildStyle,
  isBuildableScssFile,
  packageRoot,
  resolveOutputPath,
  srcDir
} from './build-styles.ts';

const args = new Set(process.argv.slice(2));
const skipInitial = args.has('--skip-initial');
const once = args.has('--once');
const intervalMs = Number(process.env.KISKADEE_STYLE_WATCH_INTERVAL_MS ?? 500);
const pendingFiles = new Set<string>();

let snapshot = new Map<string, number>();
let pendingAll = false;
let buildTimer: NodeJS.Timeout | undefined;
let pollTimer: NodeJS.Timeout | undefined;
let isBuilding = false;
let isPolling = false;

async function findWatchedScssFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = path.resolve(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await findWatchedScssFiles(entryPath)));
      continue;
    }

    if (!entry.isFile()) continue;
    if (!entry.name.endsWith('.scss')) continue;
    if (entry.name.endsWith('.module.scss')) continue;

    files.push(entryPath);
  }

  return files.sort();
}

async function readSnapshot(): Promise<Map<string, number>> {
  const files = await findWatchedScssFiles(srcDir);
  const nextSnapshot = new Map<string, number>();

  await Promise.all(
    files.map(async (file) => {
      const fileStats = await stat(file).catch(() => null);
      if (!fileStats) return;
      nextSnapshot.set(file, fileStats.mtimeMs);
    })
  );

  return nextSnapshot;
}

function enqueueAll(): void {
  pendingAll = true;
  scheduleBuild();
}

function enqueueFile(filePath: string): void {
  if (!isBuildableScssFile(filePath)) return;

  pendingFiles.add(filePath);
  scheduleBuild();
}

function scheduleBuild(): void {
  if (buildTimer) {
    clearTimeout(buildTimer);
  }

  buildTimer = setTimeout(() => {
    flushBuildQueue().catch((error) => {
      console.error('[react-components] Failed to flush style changes:', error);
    });
  }, 100);
}

async function flushBuildQueue(): Promise<void> {
  if (isBuilding) {
    scheduleBuild();
    return;
  }

  const shouldBuildAll = pendingAll;
  const files = [...pendingFiles];
  pendingAll = false;
  pendingFiles.clear();

  if (!shouldBuildAll && files.length === 0) return;

  isBuilding = true;

  try {
    if (shouldBuildAll) {
      await buildAllStyles();
      return;
    }

    await Promise.all(files.map((file) => buildStyle(file)));
  } finally {
    isBuilding = false;

    if (pendingAll || pendingFiles.size > 0) {
      scheduleBuild();
    }
  }
}

async function removeOutputForDeletedScss(filePath: string): Promise<void> {
  if (!isBuildableScssFile(filePath)) return;

  try {
    await unlink(resolveOutputPath(filePath));
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') return;
    throw error;
  }
}

async function handleDeletedScss(filePath: string): Promise<void> {
  if (path.basename(filePath).startsWith('_')) {
    enqueueAll();
    return;
  }

  await removeOutputForDeletedScss(filePath);
}

async function pollChanges(): Promise<void> {
  if (isPolling) return;

  isPolling = true;

  try {
    const nextSnapshot = await readSnapshot();

    for (const [file, mtimeMs] of nextSnapshot) {
      const previousMtimeMs = snapshot.get(file);
      if (previousMtimeMs === mtimeMs) continue;

      if (path.basename(file).startsWith('_')) {
        enqueueAll();
      } else {
        enqueueFile(file);
      }
    }

    for (const file of snapshot.keys()) {
      if (nextSnapshot.has(file)) continue;
      await handleDeletedScss(file);
    }

    snapshot = nextSnapshot;
  } catch (error) {
    console.error('[react-components] Failed to poll style changes:', error);
  } finally {
    isPolling = false;
  }
}

function stopPolling(): void {
  if (buildTimer) {
    clearTimeout(buildTimer);
  }

  if (pollTimer) {
    clearInterval(pollTimer);
  }
}

async function main(): Promise<void> {
  if (!skipInitial) {
    await buildAllStyles();
  }

  snapshot = await readSnapshot();

  if (once) return;

  pollTimer = setInterval(() => {
    pollChanges().catch((error) => {
      console.error('[react-components] Failed to watch styles:', error);
    });
  }, intervalMs);

  console.log(
    `[react-components] Watching styles in ${path.relative(packageRoot, srcDir)} ` +
      `(polling ${intervalMs}ms)`
  );
}

process.on('SIGINT', () => {
  stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopPolling();
  process.exit(0);
});

main().catch((error) => {
  console.error('[react-components] Failed to watch styles:', error);
  process.exitCode = 1;
});
