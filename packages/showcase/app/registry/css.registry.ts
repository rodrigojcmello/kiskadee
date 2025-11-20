// Static CSS registry for serving styles from Next public/ directory
// Each entry maps a template to optional core/effects CSS and a palette map by "segment|theme".
// The URLs here are served directly from packages/showcase/public/build/**
//
// NOTE: The actual data is now generated automatically by
// scripts/generate-showcase-registry.cjs into css.registry.generated.ts.
// This file simply re-exports those definitions so that existing imports
// keep working.

export * from './css.registry.generated';
