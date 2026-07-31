# Rejected: silhouette brand icons

## Decision

Kiskadee does not publish silhouette-only brand constructions.

## Why

- A silhouette usually removes internal details that carry brand recognition.
- It duplicates a true monochrome construction without improving ordinary component use.
- It creates another public asset and selection decision while solving no approved size or surface
  requirement.
- Naming it as a compact or small-size alternative would imply automatic optical behavior that the
  icon contract intentionally does not provide.

Reddit's official one-color silhouette is therefore retained only as part of the upstream source
review and is not represented in `metadata/icons.json`, generated React exports, or published SVGs.
The supported `mark.monochrome` construction keeps the recognizable internal eyes, mouth, and
negative spaces while rendering through one `currentColor`.

If a future component demonstrates a concrete need that cannot be met by the existing contained or
mark constructions, that use case requires a new contract decision. It must not be added as an
unstructured `alt`, inferred from size, or selected responsively.
