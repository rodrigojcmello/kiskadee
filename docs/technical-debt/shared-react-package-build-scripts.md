# Shared React Package Build Scripts

Status: open technical debt.

## Context

`packages/components/react` and `packages/headless/react` now have very similar package build
pipelines:

- build TypeScript/TSX files to ESM JavaScript with esbuild;
- optionally emit declaration files with `tsc`;
- rewrite generated import extensions;
- clean `dist` and the package-local TypeScript build info cache;
- build structural Sass files to CSS with the Kiskadee PostCSS processor.

This duplication became more visible after `react-headless` started building Switch structural CSS.
The headless package now has a `build-styles.ts` script that intentionally mirrors the
`components/react` style build path.

## Problem

The scripts are package-local copies of the same build concepts. That is useful while the behavior is
being proven, but it creates drift risk:

- one package can receive build fixes while the other keeps the old behavior;
- Sass/PostCSS options can diverge silently;
- clean/build/dev behavior can become subtly different;
- future packages may copy the same scripts again instead of reusing a shared package build helper.

## Desired Direction

Evaluate extracting the common build pieces into a shared internal helper, likely under the existing
tooling/build area or a small package-local utility used by both React packages.

The shared helper should cover, or deliberately decline to cover:

- JavaScript build discovery and esbuild options;
- Sass file discovery and CSS output path resolution;
- Kiskadee PostCSS options for structural CSS;
- declaration build orchestration;
- clean behavior for `dist` and `node_modules/.cache/tsc/build.tsbuildinfo`;
- TS-to-JS extension rewrite orchestration;
- log labels per package.

Keep package-specific configuration explicit. The goal is not to hide package identity behind a
generic framework, but to prevent two packages from maintaining the same build mechanics by hand.

## Open Questions

- Should the shared helper live in an existing workspace package or inside a scripts/tooling folder?
- Should `components/react` and `headless/react` keep tiny package-local entrypoints that only pass
  package root, label, and feature flags?
- Should Sass build support remain available only to packages that explicitly opt in?
- Should this be solved before adding structural CSS to more headless components?
