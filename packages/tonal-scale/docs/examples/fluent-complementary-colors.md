# Fluent complementary color candidates

Candidate generator: `@kiskadee/tonal-scale@0.20.1`, format V8.
Status: experimental generator preview awaiting user visual approval; no preset integration.

The [reproducible recipe](./fluent-complementary-colors.recipe.json) uses the existing Fluent
inputs and adds contrast complementarity for Blue, Teams Purple, Red and Green. It keeps the
base `vivid-lights` profile and uses the strategy's Balanced default for complementary families.
The original families remain unchanged by these additions.

Run `pnpm --filter @kiskadee/tonal-scale dev` and open the [local generator](http://localhost:3001).
Load this recipe or use its encoded Shared Viewer link provided with the implementation handoff.
The link contains the authored recipe; it does not freeze the installed generator version.

The IDs communicate lineage: `b.blue.v1.c` belongs to Blue V1 even if its measured hue approaches
cyan. Inspect the source reference, generated seed, effective profile and measured classification
in the family details. Complementary identification does not assign a component or semantic role.

The Windows observations near `#40BEFF` and `#4DC1FF` guide the Blue calibration. They do not
define manual companion seeds for the other families or claim reproduction of a private Microsoft
algorithm. The comparison covers the whole Light/Dark range rather than only the exact anchor.

Candidate 0.20.1 limits contrast-complementary chroma growth to at most 15% above the resolved
origin's chroma. The rule applies to every family and moderates the Green candidate without
altering the existing Blue calibration or the original scales. Source validation rejects invalid
HEX and chromatically unreliable origins; very light or dark chromatic inputs remain eligible
when they satisfy that guard. The current Material formula remains unchanged for accepted sources.

During review, compare original and complementary colors on vivid surfaces, inspect the medium
and light ranges, and check content contrast as well as curve diagnostics. The exact seed is
preserved in both contrast-family tracks. Valid numerical output can still carry continuity or
other review conditions; these remain visible and are not a visual approval.

The editor can switch each association between Material complementarity and contrast
complementarity and override its profile. Material complementarity retains the previous formula;
the strategy selector does not alter the original family. See the
[canonical complementary contract](../definitions/tonal-system.md#associated-complementary-colors-0200--v8)
for the formulas, profile precedence, migration and publication boundaries.

Preset schemas, promoted assets and signed historical manifests are outside this delivery.
The candidate must be visually approved before a separate Fluent integration.
