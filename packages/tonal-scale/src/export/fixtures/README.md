# Historical tonal bundle fixtures

`yellow-material-support-0.19.0.json.gz` contains a gzipped JSON array of `[path, text]`
entries from the unmodified 0.19.0 generator at commit `1da519dd8e9fb9bbbc17c39eb9e72bf2960aec8e`.
The source uses primary `#F1C21B` and Material support `yr.orange.v2`; its derived seed
is `#683C00`, while the historical ID records Orange appearance. The old verifier
accepted these exact files before capture. Keep the bytes frozen: this fixture proves
legacy replay independently of the current generator and projection implementation.

The current generator measures the resulting seed as Brown and names the association
`y.yellow.v1.c`. Replay must retain the historical identity and canonical diagnostic
ordering without changing scale colors or measured classification.
