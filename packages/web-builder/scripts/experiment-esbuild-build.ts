// Experimental script: bundle web-builder entrypoints with esbuild for
// performance comparison vs `node --experimental-strip-types`.
//
// This is NOT part of the production build pipeline. It exists only to
// produce `dist-experiment/*.js` so we can measure cold-start time of the
// pre-built variant.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');

// Emit bundles next to the originals so `import.meta.url` / `__dirname`
// resolve to the SAME directory as the unbundled source. This keeps
// relative path resolution to sibling packages (e.g. `packages/presets`)
// working without any code changes.
const entries: Array<{ in: string; out: string }> = [
  {
    in: path.resolve(packageRoot, 'src/run-build.ts'),
    out: path.resolve(packageRoot, 'src/run-build.bundled')
  },
  {
    in: path.resolve(packageRoot, 'scripts/sync-showcase-artifacts.ts'),
    out: path.resolve(packageRoot, 'scripts/sync-showcase-artifacts.bundled')
  },
  {
    in: path.resolve(packageRoot, 'scripts/generate-showcase-registry.ts'),
    out: path.resolve(packageRoot, 'scripts/generate-showcase-registry.bundled')
  }
];

await build({
  entryPoints: entries.map((e) => ({ in: e.in, out: path.relative(packageRoot, e.out) })),
  outdir: packageRoot,
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node22',
  // Keep external: node built-ins are auto-external for platform:'node'.
  // CJS deps with dynamic require (autoprefixer/browserslist/postcss plugins)
  // must remain external; bundling them produces broken `Dynamic require` shims.
  packages: 'external',
  logLevel: 'info',
  sourcemap: false,
  minify: false,
  legalComments: 'none'
});

console.log('[experiment-esbuild-build] bundles written next to sources (.bundled.js)');
