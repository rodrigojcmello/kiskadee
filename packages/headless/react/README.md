# @kiskadee/react-headless

Headless React primitives for the Kiskadee design-system framework. Ships compiled JavaScript
(`dist/**/*.js`), TypeScript declarations (`dist/**/*.d.ts`), and structural CSS
(`dist/**/*.css`) for primitives that need internal browser-control styling.

## Source Layout

- `src/components/`: headless React primitives.
- `src/hooks/`: reusable hooks and runtime helpers shared by primitives or styled consumers.
- `src/index.ts`: package aggregation entrypoint.

## Docs

- [Interaction state projection hook](docs/concepts/interaction-state-projection-hook.md) - state
  projection ownership and TextField pilot rules.
- [Technical debt](docs/technical-debt/README.md) - deferred cleanup and follow-up work.

## Build Scripts

The package exposes one official build script plus a faster development variant. In normal use you
only need `build`; use `build:dev` only when iterating locally and declarations are not needed.

### Official Entrypoints

| Script      | Command                             | What it does                                                |
|-------------|-------------------------------------|-------------------------------------------------------------|
| `build`     | `node ./scripts/build.ts`           | Full production build: clean -> JS + types in parallel -> rewrite ext. |
| `build:dev` | `node ./scripts/build.ts --skip-types` | Same as `build` but skips `tsc` (much faster; no `.d.ts` emitted). |

Run with:

```bash
pnpm --filter @kiskadee/react-headless build
pnpm --filter @kiskadee/react-headless build:dev
```

`build` is the complete `dist/` contract consumed by `@kiskadee/react-components` and any other
package importing `@kiskadee/react-headless`. `build:dev` still runs the JS emission and extension
rewrite, but it skips declaration output.

### What `build` does, step by step

Implemented in `scripts/build.ts`:

1. `cleanDist()` wipes `dist/` and the incremental `tsc` build info.
2. `Promise.all([...])` in parallel:
   - `buildAllJavaScript()` uses esbuild to transpile `src/**/*.{ts,tsx}` to ESM `.js`
     (no bundling, test files excluded).
   - `buildAllStyles()` compiles buildable structural Sass files under `src/` to mirrored
     `dist/**/*.css`.
   - `buildTypes()` runs `tsc -p tsconfig.build.json --emitDeclarationOnly` to emit `.d.ts` files
     (skipped when `--skip-types`).
3. `rewriteDistExtensions()` post-processes `dist/**/*.{js,d.ts}` rewriting relative `.ts/.tsx` specifiers to `.js`.

See `ESM-MIGRATION-RULES.md` at the repo root for the full ESM/import-extension rationale.

### Helper Scripts

These exist to isolate cleanup or type generation when investigating a problem. They are not a
substitute for `build`.

| Script        | Command                                            | Purpose                                             |
|---------------|----------------------------------------------------|-----------------------------------------------------|
| `clean`       | `node ./scripts/clean-dist.ts`                     | Wipe `dist/` and the incremental `tsc` build info.  |
| `build:types` | `tsc -p tsconfig.build.json --emitDeclarationOnly` | Emit `.d.ts` only.                                  |

### Quick decision guide

- CI, package consumption, or before building `@kiskadee/react-components`: `pnpm --filter @kiskadee/react-headless build`.
- Local iteration that only needs runtime JS: `pnpm --filter @kiskadee/react-headless build:dev`.
- Debugging cleanup or declarations: the matching helper script.

## Runtime / toolchain

- ESM-only (`"type": "module"`), Node 24+ with native type stripping for scripts.
- Imports use explicit `.ts` / `.tsx` extensions (see `ESM-MIGRATION-RULES.md`).
- esbuild emits JS, Sass/PostCSS emits structural CSS, and `tsc` emits `.d.ts`.
