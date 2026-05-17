# Balanced Tonal Scale Follow-Ups

This is the active named handoff for the current `tonal-scale-lab` demand around the `Balanced`
profile, preserved input anchors, node transitions, and chroma-shape smoothing.

## Current Improvement List

- [x] Remove `K55` as the `Balanced` generation base.
  `Balanced` now fits the preserved input by OKL lightness and uses that preserved input anchor as
  the generation base. `K55` may still be useful as a default state-mapping slot for common primary
  colors, but that is a semantic/default-anchor role, not a generation-pivot role. This intentionally
  changes some fits: for example, `#dce775` now fits at `K10`, while `#0f6cbd` fits around `K45`.
  The follow-up is to judge whether the new anchor-driven placement feels better across practical
  colors, not to restore `K55` as a hidden center of gravity.

- [x] Replace case-specific node exceptions with a generic protected-anchor seam rule.
  `NodeContinuityRule` no longer has separate `preservedInputEntry` and `preservedInputExit`
  branches. Those became one generic `protectedAnchorAdjacentSeam` rule: when a node seam touches
  the preserved input anchor, the seam is judged from the anchor-side rhythm instead of borrowing
  the wider rhythm from the other side.

- [ ] Define a true generic node transition model.
  The remaining follow-up is a true transition-delta model, where every structural node gets a
  target delta between the rhythm before the node and the rhythm after the node.

- [ ] Treat every structural anchor with the same node mechanics.
  The intended structural anchor set for `Kiskadee Official (33)` is `K1`, `K10`, `K35`, `K95`, and
  the dynamic preserved input anchor. `K0` and `K100` remain absolute caps, not chromatic nodes. The
  same node model should decide transition deltas, curve flattening, and curve creation around all
  structural anchors. Special cases should be expressed as configuration, such as protected anchors,
  nearby-node clusters, minimum/maximum transition windows, or contrast-locked ranges.

- [ ] Generalize curve-shape smoothing beyond local peaks.
  The current red failure is a visible summit near `K35`, but the yellow failure is different: chroma
  rises quickly into the preserved anchor and then turns into a shallow straight line, creating a
  diagonal kink rather than a classic peak. The future rule should detect abrupt tangent changes and
  construct a curve shoulder, even when the preserved anchor is not the local chroma maximum.

- [ ] Consolidate luminous-color handling instead of removing it.
  Luminous color rules remain important because yellow, lime, cyan, and light green expose failures
  that normal blues and reds do not. Keep the idea of a light-zone chroma ramp and luminous
  constraints, but review how many separate luminous checks exist and whether they can share the same
  anchor/node/curve-shape model.

- [ ] Separate final invariants from repair passes.
  The current pipeline has several repair-like passes: vivid contrast, minimum lightness step,
  luminous chroma ramp, input preservation, node continuity, chroma shape smoothing, node continuity
  again, and contrast again. The next design should name final invariants first, then decide which
  pass owns each invariant. This should reduce "fix the fix" behavior.

- [ ] Keep absolute caps and chromatic endpoints distinct.
  `K0` and `K100` should remain absolute white and black caps. `K1` and `K95` should remain the
  first and last chromatic endpoints. Future node language should avoid treating `K0/K100` as the
  colored curve endpoints.

- [ ] Reassess rule ordering and invariants after introducing node transitions.
  The second node-continuity pass after chroma-shape smoothing fixed a real seam created by the
  chroma guard, but it also exposed that later rules can invalidate earlier assumptions. The next
  design should define which invariants are final, which rules are allowed to move lightness, and
  whether chroma-shape guards must respect a minimum lightness spacing budget around protected
  anchors.

## Deferred

- [ ] Rework the `#ff1744` `K35` transition with a real transition delta.
  This remains a known issue, but it is intentionally out of scope for the current refactor. The
  latest red scale improved the original `K35 -> K40` jump but overcorrected it: `K30 -> K35` is
  roughly `1.18` OKL lightness points, `K35 -> K40` is roughly `1.75`, and `K40 -> K45` is roughly
  `3.76`. A later pass should compute a transition delta for `K35 -> K40`, likely between the
  pre-node and post-node rhythms, then regenerate the `K40..K95` segment from that adjusted `K40`.

- [x] Preserve the input color in `Balanced`.
  The current `Balanced` scale can produce beautiful ramps, but luminous inputs may drift far enough
  from the original color that the source hue loses too much identity. `Balanced` now preserves the
  exact input hex by default instead of exposing this as a separate flag. The current experiment
  keeps `K0..K10` as the light zone, inserts the input at the nearest legal chromatic fit, prevents
  inputs that fail the vivid `3:1` white-text target from landing at `K35` or darker, and reclamps
  `K35..K95` after interpolation.

- [x] Add node continuity guard to `Balanced`.
  `Balanced` now guards the structural seams at `K10` and `K35`. A seam is considered too abrupt
  when its OKL lightness delta exceeds the larger neighboring emitted-step delta by more than
  `1.25x + 0.25` OKL lightness points. When that happens, the generator redistributes the excess
  through the adjacent segment, keeps the exact input anchor fixed, and reclamps `K35..K95`.

- [x] Add chroma peak guard to `Balanced`.
  `Balanced` now checks the preserved input anchor for sharp OKL chroma summits. The guard triggers
  only when the anchor is higher than both immediate neighbors and the smaller local drop is above
  `0.012`. It keeps the exact input hex unchanged, raises nearby chroma with radius `1`, and only
  reaches radius `2` if the peak remains. Near the vivid boundary, the prominence threshold is
  lowered to `0.008`, the allowed drop becomes `max(0.004, anchorChroma * 0.025)`, and radius `2`
  can cross into `K35` while the vivid range is reclamped afterward.

- [x] Extend the `Balanced` chroma guard to narrow dominant plateaus.
  Saturated reds can preserve the exact input without forming a single-point chroma peak: `K30` and
  `K35` may instead become a short high-chroma shelf that makes the input easy to spot. The chroma
  guard now detects plateaus of at most `3` emitted slots whose plateau slots are within `0.012` OKL
  chroma of the preserved input and whose shoulders drop by more than `0.009` OKL chroma, then
  raises the shoulders toward `max(0.016, plateauChroma * 0.08)`. Radius `1` adjusts both sides;
  radius `2` only expands on the vivid side so extra light pre-vivid slots are not pulled into the
  same saturated shelf.

- [x] Add vivid boundary buffer to `Balanced`.
  `Balanced` now avoids preserving a non-vivid-safe input directly on the last pre-vivid emitted
  slot. If the nearest legal fit would be that boundary slot, the exact input is rewound by one
  emitted slot so the boundary can become a generated bridge into the contrast-safe vivid start.
  When this buffer is active, `K35` is resolved as the lightest generated vivid-start color that
  still passes `3:1` against white.

- [x] Add preserved-anchor continuity guard to `Balanced`.
  `Balanced` now treats a pre-vivid preserved input as a local OKL lightness-continuity node. It
  compares the average of `2` emitted-step deltas before the input with `2` deltas after it. If the
  post-anchor average is more than `3x + 0.25` OKL lightness points larger, the exact input rewinds
  by one emitted slot and the bridge is regenerated, up to `2` additional rewinds. When the input is
  immediately before the vivid start, the guard uses a stricter `1.75x + 0.25` limit.

- [x] Add a near-vivid preserved-anchor rhythm guard for luminous colors.
  `#00bcd4` exposed a case where the previous `Balanced` guard kept the exact input at `K28`.
  The light-to-anchor side remained technically separated, but the emitted OKL lightness deltas from
  `K10..K28` sat around `1.3..1.6`, while `K28 -> K30` and `K30 -> K35` jumped to roughly `3.6` and
  `3.4`. `Balanced` now uses a near-vivid-boundary continuity threshold when a non-vivid-safe
  preserved input is within two emitted slots before `K35`: the slope limit becomes `2.4x + 0.25`,
  so this cyan rewinds from `K28` to `K26`. The generated result keeps the exact input color at
  `K26`, gives `K28` and `K30` room to become bridge material, and leaves `K35` as the lightest
  `3:1` vivid-start color instead of making a contrast ceiling the primary fix.

- [x] Fix light-zone preserved-anchor rhythm before `K10`.
  `#dce775` exposes a different `Balanced` boundary gap: the exact input is preserved at `K9`,
  inside the light zone, while `K10` remains the structural light-zone boundary and bridge start.
  Without input preservation, `K9 -> K10` is a normal `~1.6` OKL lightness step. Preserving the input
  at `K9` raises that anchor and creates a raw `~4.6` OKL lightness drop into `K10`; the existing
  `K10` node continuity guard reduces it to `~3.16`, but still allows the visible jump because it
  compares the entry seam against the larger neighboring bridge-side delta from `K10 -> K12`. The
  problem is therefore not hue drift and not the vivid `3:1` rule. `Balanced` now gives the `K10`
  node guard a preserved-input entry rule: when the previous emitted slot is the exact preserved
  input, the entry seam is limited from the previous light-zone delta instead of the larger
  bridge-side delta. For `#dce775`, `K9 -> K10` now resolves to roughly `1.64` OKL lightness points
  while `K9` remains exact.
  Superseded by anchor-driven generation: after removing `K55` as the `Balanced` generation base,
  `#dce775` now fits directly at `K10`.

- [x] Strengthen vivid-side chroma shoulder smoothing for red anchors.
  `#ff1744` preserves the exact input at `K35` and still reads as a visible chroma summit. The
  strict peak guard does not activate because the smaller local chroma drop is `~0.010`, below the
  current `0.012` peak threshold. The dominant-plateau guard does activate around the `K35/K40`
  shelf, but its allowed shoulder drop is still loose enough that `K35` remains visually singled
  out: `K30` was `0.2305`, `K35` was `0.2489`, and `K40` was `0.2388` OKL chroma. `Balanced` now
  adds a preserved-vivid-start shoulder rule. When the exact input lands at `K35`, nearby shoulders
  use a stricter allowed chroma drop of `max(0.006, anchorChroma * 0.024)`. The pre-vivid shoulder
  may also lower OKL lightness by up to `0.75` to reach more available sRGB chroma. For `#ff1744`,
  this moves `K30` to roughly `0.2374` OKL chroma and `K40` to roughly `0.2412`, while `K35` remains
  the exact input at `0.2489`.
  Follow-up correction: the vivid-start shoulder runs after the node continuity guard and lowered
  `K30` enough that `K30 -> K35` became `~1.18` OKL lightness points while `K35 -> K40` stayed
  `~3.75`. The regular node guard did not catch this because `K35 -> K40` was compared against the
  larger dark-side neighbor `K40 -> K45`. `Balanced` now re-runs node continuity after chroma-shape
  guards and adds a preserved-input exit rule for `K35`: when the node itself is the exact input,
  the exit seam is limited from the entry seam instead of borrowing the dark-side rhythm. For
  `#ff1744`, `K35 -> K40` now resolves to roughly `1.75` OKL lightness points.
  This correction is now considered insufficient: it limited the seam, but it did not create the
  desired node transition delta. See the open `#ff1744` follow-up above.

- [x] Add chroma tangent continuity for light-zone luminous anchors.
  `#fff59d` preserves the exact input at `K5`, where OKL chroma climbs quickly from `K3 -> K5`
  (`+0.0193`, `+0.0194`) and then immediately reverses into a shallow decline from `K5 -> K10`
  (`-0.002` to `-0.003` per emitted step). This is not caught by the current peak guard because
  `K5 -> K6` drops by only `~0.002`, and it is not caught by the plateau guard because the following
  chroma shelf is much wider than the current max-plateau window. `Balanced` now adds light-zone
  chroma tangent continuity. When a preserved light-zone anchor is the end of a steep incoming
  chroma ramp, the following slots may rise above the preserved input and then ease back toward
  `K35`. For `#fff59d`, `K6` now reaches roughly `0.1191` OKL chroma, `K7..K14` form a shallow
  descending shoulder, and the exact input remains at `K5`.
  Superseded by anchor-driven generation: after removing `K55` as the `Balanced` generation base,
  `#fff59d` now fits directly at `K4`.

- [x] Re-align `Striking` and `Sophisticated` with the current `Balanced` behavior.
  `Balanced` is the current visual reference. `Striking` and `Sophisticated` appear to have missed
  some of the recent fixes and should be reviewed against the same OKLCH, vivid contrast, spacing,
  and light-range adjustments now used by `Balanced`. Completed by moving both profiles off the old
  near-black dark endpoint while preserving `Balanced` as the reference: `Striking` now uses a
  higher dark floor for stronger visible chroma, and `Sophisticated` now shares the healthy dark
  floor. The later `Balanced` dark-chroma experiment changes the comparison target, so
  `Sophisticated` should be recalibrated in a separate pass after `Balanced` stabilizes.

- [ ] Recalibrate `Sophisticated` after the `Balanced` dark-chroma experiment.
  `Balanced` is now testing `darkMinRatio: 0.25` to approach Fluent-like low-chroma dark tones.
  Revisit whether `Sophisticated` should become even quieter, use a different peak point, or keep a
  different relationship to `Balanced`.

- [ ] Support multiple colors in the lab UI and export flow.
  Add tabs, selects, or another multi-color workflow so the lab can define several Kiskadee color
  families at once, such as `redLike`, `yellowLike`, and `neutral`. The goal is to configure the full
  color set in the lab and download files that can be dropped into the desired preset.
