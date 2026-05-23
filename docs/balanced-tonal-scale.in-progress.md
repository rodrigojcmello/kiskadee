# Balanced Tonal Scale Follow-Ups

This is the active named handoff for the current `tonal-scale-lab` demand around the `Balanced`
profile, preserved input anchors, node transitions, and chroma-shape smoothing.

## Current Improvement List

- [x] Persist the lab input color in the URL.
  The Next.js lab now reads `?color=<hex>` on load and on browser back/forward navigation. When
  the user enters a valid color, the app pushes that normalized color into the URL without the `#`
  prefix, so refreshes and history navigation preserve the selected input color. If the parameter is
  missing or invalid, the lab falls back to the default Fluent blue.

- [x] Project the planned chroma curve in the chart.
  The lab now preserves the planned chroma curve as generation diagnostics and projects it into the
  OKLCH chart as a red line. The red projection is captured after exact input preservation, contrast,
  and curve-shape continuity so it reflects the current final curve contract rather than only the
  anchorless first-pass curve. Red points render the virtual graph constraints. The blue generated
  scale points remain the final emitted colors, so the chart can still expose where emitted samples
  sit above or below the planned line.

- [x] Highlight structural graph nodes in the chart.
  Generated chart points now use `#26C6DA` for the structural chromatic nodes `K1`, `K10`, `K35`,
  `K95`, plus the dynamic preserved input anchor. `K55` is intentionally not highlighted for
  `Balanced`, because it is not a generation node in the current model. All chart point markers use
  the same `r=4` radius so node status is communicated by color, not by marker size.

- [x] Include the vivid boundary in the planned red projection.
  The generated blue chart already highlights `K35` as a structural node, but the red planned curve
  did not include `K35` unless it happened to be the chroma apex or preserved input anchor. That made
  the red line read as disconnected from the vivid boundary even though `K35` starts the
  contrast-gated vivid track. The projection now adds `vivid-boundary` from the active
  `vividContrast.startTone`; in the Kiskadee distributions this is `K35`. For `#ffc107`, the red
  projection now includes the emitted `K35` point at roughly `L 66.3 / C 0.1359` without changing the
  generated blue scale.

- [x] Round preserved-input apexes in the planned red projection.
  `#ffc107` exposed that adding `K35` to the red graph made another issue easier to see: the exact
  preserved input at `K16` became a one-point summit, with the red line dropping almost directly into
  the `K10` light-zone exit. The desired plan is a broad rounded cume, not a peak or an extra red
  point beside the anchor. The first attempt inserted projection-only shoulders from the immediate
  emitted neighbors, but that created visual noise instead of the requested arc. The projection now
  keeps the graph nodes unchanged and raises the incoming tangent from the previous graph point when
  the preserved input anchor is higher than both neighboring graph points. For `#ffc107`, the
  `dark-arc-base -> K16` samples now climb as a broad arc (`C 0.1587 -> 0.1721`) before flattening
  into the exact `K16` anchor, while the blue generated scale is unchanged.

- [x] Analyze the raw anchor-driven `Balanced` curve without curve repair rules.
  The raw pass showed that red, blue, yellow, and lime failures share one shape problem: abrupt
  tangent changes in the OKLCH chart. The old `chromaPeak` model was too narrow because it only
  reasoned about local peaks and then accumulated special guards for plateaus, vivid-start
  shoulders, and light-zone tangents. The replacement is `chromaCurveContinuity`: a generic OKLCH
  curve rule that detects turn angle in the normalized chart, smooths adjustable points by local
  relaxation, keeps the exact input anchor protected, rounds protected apex shoulders, and allows a
  protected luminous/pre-vivid anchor to keep rising into a generated forward apex before curving
  back down. Other repair passes remain disabled for now: vivid-boundary buffer,
  preserved-anchor continuity, minimum lightness step, luminous chroma ramp, and node continuity.

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
  `Balanced` now has a first transition-delta solver for gaps between adjacent lightness-rhythm
  ranges, but this is not yet the full generic node model. The remaining follow-up is to make every
  structural node, including shared-boundary nodes such as `K10`, resolve a target delta between the
  rhythm before the node and the rhythm after the node.

- [x] Add the first zone rhythm redistribution pass.
  Delta minimum rules should be final guardrails, not the main mechanism for shaping the scale.
  When one interval inside a zone collapses, adjusting a single point only moves the problem into
  the next interval. `Balanced` now has `finalLightnessRhythm`: it protects the zone endpoints and
  the exact input anchor, redistributes each affected subzone from those endpoints, and only then
  lets the final spacing guard act as an airbag. The first configured zones are `K1..K10`,
  `K10..K30`, and `K35..K95`. This changed cases like `#3f51b5`, where `K22/K24/K26` now follow a
  steadier zone rhythm instead of needing a one-off local delta fix.

- [x] Add a transition-delta solver between rhythm zones.
  `K30 -> K35` exposed the gap between `K10..K30` and `K35..K95`: each zone could be internally
  coherent while the boundary interval stayed too small. `Balanced` now measures the average
  outgoing rhythm before a boundary and the average incoming rhythm after it, resolves a target
  transition delta from those two rhythms, and widens a collapsed boundary before redistributing a
  short local window. For `#0f6cbd`, `K30 -> K35` moved from roughly `1.67` OKL lightness points to
  roughly `3.17`. The next vivid-zone intervals are larger (`K35 -> K40` roughly `4.37` and
  `K40 -> K45` roughly `4.22`) because the exact input is preserved at `K45`; the important fix is
  that the boundary no longer carries the smaller pre-vivid rhythm into the vivid zone. This is
  intentionally a zone-boundary rule, not a hardcoded `K30/K35` exception.

- [ ] Reassess local apex shoulders after zone rhythm exists.
  `curveShape.bellCurve` is the desired primary model for the chroma curve, but `protectedApexShoulder`
  and `forwardApexShoulder` still run as local protected-anchor helpers. The exact input anchor now
  becomes a graph constraint and wins duplicate-lightness collisions with other virtual points, but
  these shoulder rules may still be needed to soften the immediately adjacent generated samples.
  Reassess whether they can be folded into the graph model once lightness rhythm redistribution stops
  creating compressed or abrupt neighborhoods around the apex.

- [ ] Treat every structural anchor with the same node mechanics.
  The intended structural anchor set for `Kiskadee Official (33)` is `K1`, `K10`, `K35`, `K95`, and
  the dynamic preserved input anchor. `K0` and `K100` remain absolute caps, not chromatic nodes. The
  same node model should decide transition deltas, curve flattening, and curve creation around all
  structural anchors. Special cases should be expressed as configuration, such as protected anchors,
  nearby-node clusters, minimum/maximum transition windows, or contrast-locked ranges.

- [x] Generalize curve-shape smoothing beyond local peaks.
  Implemented as `ChromaCurveContinuityRule`. The detector works on the rendered OKLCH chart plane
  instead of checking only whether the anchor is higher than both neighbors. It uses a configurable
  turn-angle limit, local smoothing for adjustable points, a protected-apex shoulder for cases such
  as red/blue at `K35`, and a forward-apex shoulder for luminous anchors such as lime/yellow where
  the generated curve may need to keep rising after the exact input.

- [x] Replace segment polish with a five-point virtual graph model.
  Local shoulder repair can still leave longer runs that read as straight lines in the OKLCH chart,
  such as the red `K10..K28` ascent or the dark side from `K95` back toward the apex. The new
  `curveShape` model now makes the intended line explicit through five virtual graph points, not
  through existing `K<n>` nodes: graph entry, dark-side arc base, rounded chroma apex, light-side
  arc base, and graph exit. Those points are resolved in the OKLCH chart from the chromatic
  endpoints and the dynamic apex, then connected with monotone cubic Hermite interpolation so the
  apex has a rounded tangent and the tails ease into the curve. `K10`, `K20`, `K50`, and `K55` are
  only emitted samples on that line; they are not curve-shape nodes. The exact input anchor remains
  protected while generated interior points receive bounded chroma adjustments toward the virtual
  curve. A bounded lightness drop is allowed because saturated reds and yellows can already be at
  the sRGB chroma limit for their current hue/lightness; without that permission, asking for more
  chroma would produce no real movement. The bell model also has a minimum arc-lift rule: each
  virtual arc base must sit above the straight chord between its endpoint and the apex by a minimum
  bow ratio. This lets colors such as red raise the `K10..K35` side of the graph without hardcoding
  `K20`, and lets apex-centered colors such as purple keep higher `K45/K55` shoulders without
  turning those emitted slots into new nodes. The light side and dark side have separate lightness
  drop budgets so the light-side mid-arc can gain real sRGB chroma without over-darkening the dark
  shoulder. `Balanced` runs this shape twice: first as an anchorless base curve before exact input
  preservation, then again after the exact input is inserted as a protected dynamic point. If the
  exact input lands on an existing structural node, the interpolation step preserves the planned
  curve instead of redrawing the whole surrounding interval as a straight OKLCH interpolation. A
  small fairing pass then smooths generated interior points that drift into one-point subcurves,
  while preserving the chromatic endpoints, apex, and exact input anchor.

- [x] Promote the preserved input anchor into the planned curve.
  `#34c759` exposed that the exact input could be protected in the emitted scale while still sitting
  above the red planned curve. `K26` had OKL chroma around `0.1944`, while the projected curve at the
  same OKL lightness expected roughly `0.1868`. The second `curveShape` pass now inserts the exact
  preserved input as a `preserved-input-anchor` virtual graph point, gives it priority over other
  virtual points at the same OKL lightness, then recalculates the spline and generated samples
  against that curve. For `#34c759`, the post-change projection expects roughly `0.19435` at `K26`,
  so the preserved input is part of the curve contract instead of a protected point floating above it.

- [x] Make the light-zone shoulder explicit in the planned curve projection.
  `K1..K10` is allowed to have a local light-zone shoulder because very light greens, yellows, and
  limes need more chroma than the global bell curve would otherwise give them. This shoulder is not
  a new global apex and should not force the whole `K10..apex` arc upward. The current projection
  inserts two local virtual points into the red diagnostic line: a shoulder sample inside the light
  zone and the `K10` light-zone exit. The actual scale adjustment is intentionally conservative for
  now; the new points mainly make the existing light-zone contract visible so the chart no longer
  presents the light-zone lift as an unexplained deviation from the global curve.

- [x] Remove the false `K10` red-line bend for luminous projections.
  `#34c759`, `#cddc39`, and `#ffc107` exposed a diagnostics-only issue: the generated scale and the
  local `K1..K10` shoulder could be visually coherent, but the red projection still inserted the
  global `light-arc-base` inside the local light-zone interval. That point is not the original `K10`;
  `K10` is represented by `light-zone-exit`. The projection now suppresses `light-arc-base` only
  when it overlaps the `light-zone-exit -> light-zone-shoulder` interval, removing the false red
  bend without changing the generated blue scale or the generation spline.

- [x] Keep the light-zone red projection lifted through preserved luminous anchors.
  `#fff59d` exposed that the red planned curve could still inherit too much from generated sample
  repairs. The exact input is preserved at `K4`, but the projected `light-zone-shoulder` around `K6`
  sat below the chord from the preserved input anchor into the `K10` exit, making the red line show a
  small downward belly where the desired plan should be an upward arc toward the chroma apex. The
  diagnostic projection now lifts that shoulder with a dedicated
  `lightZoneShoulder.projectionBowRatio`, capped by the higher endpoint chroma. The first conservative
  lift still read as nearly straight, so the current ratio is `0.5`; for `#fff59d`, the projected
  shoulder is now roughly `0.124` OKL chroma while generated `K6` remains roughly `0.113`. This does
  not change the generated blue scale; it makes the red line state the intended geometry first so
  future work can decide which emitted samples should follow it.

- [x] Restore the original light-side lightness-drop budget.
  The `Balanced` bell curve is back to `lightSideMaxLightnessDrop: 1.1`. Experiments with `1.35`
  and `1.75` changed the generated values but did not materially solve the `K10..K35` visual gap;
  larger values began to create local compression instead of a cleaner arc.

- [x] Add a final OKL lightness monotonicity guard.
  The `#f44336` red exposed `K7/K8` as a local inversion: `K8` could become lighter than `K7`
  after OKLCH-to-sRGB fitting. `Balanced` now applies a small final monotonicity pass after the
  last contrast guard. The pass keeps the exact input anchor protected, only darkens offending
  generated slots, and uses the neighboring slot when available so a local inversion becomes a
  real interval rather than just a barely-lower point.

- [x] Restore final lightness spacing invariants.
  `#0f6cbd` exposed that the monotonicity guard only fixed ordering; it did not replace the older
  minimum lightness-step rule. `K4/K5`, `K6/K7`, and `K8/K9` could remain around `0.7..0.8` OKL
  lightness points apart, making the generated light slots read as blended. `#f44336` then exposed
  the same failure near the vivid bridge: `K28/K30` could sit around `0.8` OKL lightness points
  apart. `Balanced` now has a final spacing guard with two conservative `1.35` OKL lightness ranges:
  `K1..K10` for the light zone and `K10..K30` for the pre-vivid bridge. The guard is iterative,
  because OKLCH-to-sRGB quantization can leave a one-pass adjustment slightly short of the requested
  spacing. It runs after input preservation, contrast, curve shaping, and the final monotonicity
  guard, so later repairs cannot silently collapse either rhythm again. The exact preserved input
  anchor remains protected, and each generated slot has a bounded total lightness-drop budget.

- [x] Add protected-anchor subzone expansion for compressed pre-vivid anchors.
  `#ffc107` exposed a different failure mode from ordinary minimum spacing: the exact input anchor
  at `K16` was protected, so the final spacing guard could not open `K14 -> K16` directly. The
  previous interval fell to roughly `0.47` OKL lightness points, making `K14/K16` read like a soft
  blend. `Balanced` now has a `protectedAnchorExpansions` pass after final spacing for exact anchors
  in `K1..K30`. When the immediate pre-anchor delta is below `1.05`, the pass redistributes the
  generated `K1..anchor` subzone, keeps the exact input fixed, and bounds each generated slot's
  lightness movement. The pass now uses a slight `1.08` progress gamma toward the anchor, so the
  final pre-anchor interval gets a little more room than a purely linear subdivision. For `#ffc107`,
  `K14 -> K16` now lands near `1.37` OKL lightness points while `K16` remains exactly `#ffc107`.

- [x] Add protected-anchor exit rhythm for abrupt pre-vivid exits.
  After `K14 -> K16` improved, `#ffc107` still exposed a visible elbow on the other side of the
  exact anchor: `K16 -> K18` dropped around `2.29` OKL lightness points, much steeper than the
  incoming `K14 -> K16` rhythm. `Balanced` now has a `protectedAnchorExits` pass for exact anchors
  in `K10..K35`. The rule activates from geometry, not from hue or a hardcoded `K16`: if the first
  outgoing delta is greater than `incoming * 1.25 + 0.15`, it redistributes the generated
  `anchor..K35` subzone with a slow-start `1.22` progress gamma, `0.9` strength, and a `0.65` OKL
  lightness lift budget per slot. The exact input stays fixed. For `#ffc107`, `K16 -> K18` softens
  to roughly `1.68` OKL lightness points while `K18..K35` keeps the darker bridge role.

- [x] Add a light-zone chroma valley floor.
  `#ffe082` and `#fff59d` exposed the same light-zone shape: the exact input can be preserved at a
  very light tone while the first generated slot after it dips in OKL chroma before returning toward
  the light-zone exit. This is not a `K4`, `K9`, or hue-specific rule. `Balanced` now has
  `lightZoneChromaValleyFloor`, scoped to preserved inputs before `K14`. It keeps the exact
  input fixed and lifts only generated slots below the interpolated chroma floor from the anchor to
  `K14`, with a `0.0015` trigger and a `0.012` OKL chroma cap per slot. In the current measurement,
  `#ffe082` moves `K10/K12` from roughly `0.111/0.118` to `0.122/0.126` OKL chroma, while `#fff59d`
  moves `K5/K6` from roughly `0.105` to `0.111/0.113`.

- [x] Remove commented legacy `Balanced` rules from the active profile.
  The old commented `vividBoundaryBuffer`, preserved-anchor continuity, `minimumLightnessStep`,
  `luminousChromaRamp`, and `nodeContinuity` snippets made the profile look like it was half
  configured through disabled local repairs. They are no longer kept beside the active `Balanced`
  recipe. The concepts remain in the generator for other profiles or future reference, but
  `Balanced` should expose only the rules it actually runs. This keeps the current contract easier
  to reason about while the next architecture moves spacing responsibility into zone rhythm
  redistribution.

- [x] Constrain the luminous forward-apex hue drift.
  Some luminous yellows sit on the sRGB gamut cusp: keeping the same hue can make it physically
  impossible for darker generated slots to exceed the exact input's OKL chroma. The forward shoulder
  still has a hue-drift rescue, but it must be a real rescue rather than a chroma chase. `Balanced`
  now caps the forward drift at `8deg` and accepts a drifted candidate only when it gains at least
  `0.004` OKL chroma over the same-hue candidate. `#ffc107` was the regression case: before this
  guard, `K18` became `#d5c900` (`hsl 56.62`, OKL hue `105.28`), which created a visible greenish
  shift and let the drifted point distort the planned red curve. After the guard, `K18` stays near
  the input hue as `#f6ba02` (`hsl 45.25`, OKL hue `84.99`).

- [ ] Consolidate luminous-color handling instead of removing it.
  Luminous color rules remain important because yellow, lime, cyan, and light green expose failures
  that normal blues and reds do not. Keep the idea of a light-zone chroma ramp and luminous
  constraints, but review how many separate luminous checks exist and whether they can share the same
  anchor/node/curve-shape model.

- [ ] Separate final invariants from repair passes.
  The current pipeline has several repair-like passes: vivid contrast, minimum lightness step,
  luminous chroma ramp, input preservation, node continuity, chroma shape smoothing, node continuity
  again, and contrast again. The next design should name final invariants first, then decide which
  pass owns each invariant. The current direction is that `finalLightnessRhythm` owns normal zone
  distribution and separated zone-boundary transition deltas, while `finalLightnessSpacing` is only
  a bounded final guardrail. This should reduce "fix the fix" behavior and keep minimum deltas as
  exceptions rather than the main layout mechanism.

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
