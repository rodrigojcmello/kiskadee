/**
 * Official build script for @kiskadee/web-builder.
 *
 * Bundles each entrypoint with esbuild and emits the result NEXT TO the
 * source file (as `*.bundled.js`). This is required because every entrypoint
 * (and code reachable from it, like `loadPresetsToBuild` or
 * `persistBuildArtifacts`) resolves sibling packages (`packages/presets`,
 * `packages/web-builder/build`) via `__dirname` derived from
 * `import.meta.url`. Keeping the bundle at the SAME directory depth as the
 * original source preserves all relative path resolutions unchanged.
 *
 * Externalize all `node_modules` dependencies: CJS deps with dynamic `require`
 * (autoprefixer/browserslist/postcss plugins) cannot be safely bundled into ESM.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');

type Entry = { in: string; out: string };

// `out` is relative to `packageRoot`. Each entry emits next to its source.
const entries: Entry[] = [
  // Standalone entrypoints (preserve `pnpm run build/sync/generate`)
  {
    in: path.resolve(packageRoot, 'scripts/run-build.entry.ts'),
    out: 'scripts/run-build.entry.bundled'
  },
  {
    in: path.resolve(packageRoot, 'scripts/sync-showcase-artifacts.entry.ts'),
    out: 'scripts/sync-showcase-artifacts.entry.bundled'
  },
  {
    in: path.resolve(packageRoot, 'scripts/generate-showcase-registry.entry.ts'),
    out: 'scripts/generate-showcase-registry.entry.bundled'
  },
  // Single-process orchestrator (replaces 3x `pnpm run`)
  {
    in: path.resolve(packageRoot, 'scripts/build-sync-generate.ts'),
    out: 'scripts/build-sync-generate.bundled'
  }
];

await build({
  entryPoints: entries.map((e) => ({ in: e.in, out: e.out })),
  outdir: packageRoot,
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node22',
  packages: 'external',
  logLevel: 'info',
  sourcemap: false,
  minify: false,
  legalComments: 'none'
});
