---
name: kiskadee-sync-tonal-scale-preset-docs
description: Keep Kiskadee preset tonal evidence synchronized with the current @kiskadee/tonal-scale generator version. Use whenever changing the tonal-scale package or generator version, changing multifamily output that affects a preset Shared Viewer, regenerating or promoting preset tonal assets, or editing preset documentation that records tonal-scale candidate and approved versions.
---

# Sync Tonal Scale Preset Docs

Keep the current Shared Viewer candidate distinct from previously approved preset artifacts.

## Required Workflow

1. Read `../kiskadee-preset-evidence/SKILL.md` completely before editing official preset evidence.
2. Read the version from `packages/tonal-scale/package.json` and confirm that the exported generator version in `packages/tonal-scale/src/export/tonal-artifacts.ts` matches it.
3. Run the audit before editing:

```sh
node skills/kiskadee-sync-tonal-scale-preset-docs/scripts/audit-preset-doc-versions.mjs
```

4. Update every preset evidence document reported by the audit.
   - Label its local Shared Viewer as `candidate generator <current-version>`.
   - Update statements that describe what the current local recipe resolves.
   - Keep the encoded recipe URL when the recipe itself has not changed; the URL does not encode the installed generator version.
   - Record the behavioral reason for the new candidate when generator output changed.
5. Preserve historical provenance.
   - Do not replace an `Approved generator` version unless those assets were actually regenerated, visually approved, and promoted in the same task.
   - Do not relabel stored asset manifests, exported JSON, before/after metrics, or prior decisions as current merely because the package version changed.
6. When assets are regenerated and promoted, update their generator version, relevant de-para data, diagnostics, and approval text together.
7. Run the audit again and require it to pass. Then run `git diff --check` and the narrowest validation required by the tonal-scale and preset changes.

## Decision Rule

Treat versions as two separate facts:

- **Candidate version:** the current local generator used when opening the Shared Viewer link.
- **Approved version:** the generator that produced the stored, visually approved preset assets.

These versions may differ. Make that difference explicit instead of performing a global version replacement.

## Completion Report

Report:

- current package and generator version;
- preset evidence documents updated;
- candidate version shown by each Shared Viewer;
- approved asset version retained or promoted;
- audit and validation commands executed.
