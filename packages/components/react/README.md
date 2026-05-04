# @kiskadee/react-components

Styled React components for the Kiskadee design-system framework. Ships compiled JavaScript
(`dist/**/*.js`), TypeScript declarations (`dist/**/*.d.ts`) and a single CSS bundle
(`dist/style.kiskadee.css`).

## Build scripts

The package exposes one **official build script** plus a few **granular helpers** for debugging
specific stages. In normal use you only need `build` (or `build:dev` for fast iteration).

### Official entrypoint

| Script      | Command                                                | What it does                                                                  |
|-------------|--------------------------------------------------------|-------------------------------------------------------------------------------|
| `build` ⭐   | `node ./scripts/build.ts`   | Full production build: clean → JS + styles + types in parallel → rewrite ext. |
| `build:dev` | `node ./scripts/build.ts --skip-types` | Same as `build` but skips `tsc` (much faster; no `.d.ts` emitted).  |

Run with:

```bash
pnpm --filter @kiskadee/react-components build
pnpm --filter @kiskadee/react-components build:dev
```

`build` is the script consumed by CI and by other packages of the monorepo. It is the only one
that produces a complete, publishable `dist/`.

### What `build` does, step by step

Implemented in `scripts/build.ts`:

1. `cleanDist()` — wipes `dist/`.
2. `Promise.all([...])` in parallel:
   - `buildAllJavaScript()` — esbuild transpiles `src/**/*.{ts,tsx}` to ESM `.js` (no bundling, preserves tree-shaking).
   - `buildAllStyles()` — Sass compiles `src/styles/style.kiskadee.scss` to `dist/style.kiskadee.css`.
   - `buildTypes()` — `tsc -p tsconfig.build.json --emitDeclarationOnly` emits `.d.ts` files (skipped when `--skip-types`).
3. `rewriteDistExtensions()` — post-processes `dist/**/*.{js,d.ts}` rewriting relative `.ts/.tsx` specifiers to `.js`. Required because:
   - esbuild with `bundle: false` keeps import specifiers literal.
   - TypeScript's `rewriteRelativeImportExtensions` rewrites only `.js` outputs, not `.d.ts` (TS issue #61037).

   See `ESM-MIGRATION-RULES.md` at the repo root for the full rationale.

### Granular helpers (debug / dev only)

These exist to isolate a single stage when investigating a problem. They are **not** a substitute
for `build` — running them individually does not produce a complete `dist/`.

| Script         | Command                                                            | Purpose                                             |
|----------------|--------------------------------------------------------------------|-----------------------------------------------------|
| `clean`        | `node ./scripts/clean-dist.ts`          | Wipe `dist` only.                                   |
| `build:js`     | `node ./scripts/build-js.ts`            | Run esbuild only (no styles, no types, no rewrite). |
| `build:types`  | `tsc -p tsconfig.build.json --emitDeclarationOnly`                 | Emit `.d.ts` only.                                  |
| `build:styles` | `node ./scripts/build-styles.ts`        | Compile Sass only.                                  |
| `dev:styles`   | `node ./scripts/watch-styles.ts`        | Watch Sass during visual development.               |

### Quick decision guide

- **CI / publish / consumed by another package?** `pnpm --filter @kiskadee/react-components build`.
- **Iterating locally and don't need `.d.ts`?** `pnpm --filter @kiskadee/react-components build:dev`.
- **Working on Sass only?** `dev:styles` (watch mode).
- **Debugging a single stage?** the matching `build:*` helper.

## Runtime / toolchain

- ESM-only (`"type": "module"`), Node 24+ with native type stripping for scripts.
- Imports use explicit `.ts` / `.tsx` extensions (see `ESM-MIGRATION-RULES.md`).
- esbuild for JS, `tsc` for `.d.ts`, Sass for CSS.
