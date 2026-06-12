# Switch Component In-Progress

## Current Direction

`Switch` is now the single public styled React component for the Switch family.

The previous public v1 implementation and separate public motion boundary were removed. The
optimized single-component implementation was promoted into
`packages/components/react/src/components/Switch`.

## Public Contract

- Public component: `Switch`.
- Public hook: `useSwitchArtifactConfig`.
- Public props type: `SwitchProps`.
- Runtime motion is controlled by `motion?: false` on `Switch`.
- There is no separate public motion component export.
- There is no second-version public component export.

## Implementation Notes

- Structural namespace is `k-swt`.
- KIS-28 feature inventory lives at
  `packages/components/react/docs/definitions/switch/switch-features.md`.
- Runtime motion, `thumbShrink`, `activationFeedback`, and `controlText` remain internal modules.
- Switch activation feedback is a pointer/click visual effect. Direct click/tap on the visual track
  may start AF; Space keeps the native keyboard toggle behavior but must not start AF.
- Switch activation feedback defaults now come from
  `components.switch.effects.activationFeedback`. Switch presets use `profile: 'halo'`,
  `origin: 'center'`, and `visual.tone.byEmphasis.low = 'vivid'`; this is schema-owned, not a
  structural CSS hardcode.
- Activation feedback now uses the modern shared contract only: profile-local `size`,
  `visual.layer`, `visual.paint`, and `visual.tone`. The old `thickness`, top-level motion tokens,
  `pressedVisual`, `inputFeedback`, profile `border`, and theme `surfaceTone` paths are not part of
  the runtime/schema contract.
- iOS 26 Apple Switch uses `visual.paint: 'outline'` with `profiles.halo.size: 8`, so the rectangular
  thumb gets an outline feedback instead of a filled halo.
- Switch thumb rendering is now a single-layer model: `e3` is the visual thumb, runtime-motion
  measurement target, `thumbShrink` target, and activation-feedback host. Do not reintroduce an
  internal thumb visual layer for `thumbShrink`.
- Runtime motion keeps a square alignment box for thumbs smaller than the track content height, so
  thumbShrink preserves the large-thumb visual inset while still rendering only one `e3` thumb.
  This alignment follows the measured thumb size during transitions, not the `thumbShrink` class
  marker, so disabling the effect while the off-state thumb is still reduced does not move the
  visual center.
- `controlText` is isolated under `features/control-text`.
- KIS-7 adds optional thumb icons through `icons={{ rest, selected }}`. The icon slot is schema
  element `e6`, rendered inside thumb `e3`, and follows the Button/Tabs currentColor policy:
  schema `textColor` emits CSS `color`; SVG/icon glyphs must use `currentColor`; the builder does
  not rewrite SVG paints.
- All current first-party presets with Switch support define an `e6` icon slot. Material 3 uses
  `16 x 16`, Carbon uses `14 x 14`, Fluent uses `10 x 10`, and iOS scales the slot from `8 x 8`
  through `20 x 20` with the Switch scale.
- Future presets without `e6` should not expose icon controls in Showcase.
- The component intentionally allows `icons` and `thumbShrink` together. The `/switch` Showcase
  applies a local presentation-only guard: choosing an icon mode unchecks `Thumb shrink`, choosing
  `Icons: None` restores artifact-default `thumbShrink` behavior, and turning `Thumb shrink` back
  on clears the icon mode to `None`.
- Pending KIS-7 follow-ups: decide if small scales should hide icons and decide whether any preset
  should opt out of icons at specific scales.
- The Showcase uses only `/switch`.
- The second-version Showcase route was removed.
- `radius="rounded"` is resolved from generated track variables, not from a runtime radius
  measurement. The track keeps the generated radius class, computes `--k-swt-tr` from `--k-bdr`,
  `--k-bdw`, and compensated padding vars, and the thumb consumes that structural value through
  `k-swt-e3a-a`.
- Do not apply the generated rounded radius value from `e3` directly as-is; that reintroduces the raw
  track-radius bug. `pill` and `square` still use generated thumb radius classes directly.
- KIS-33 keeps Switch-on-primary-surface inside the existing `emphasis="low"` contract. It does not
  add a `ComponentEmphasis` value, does not reinterpret `intent="primary"`, and does not model this
  as dark mode.
- KIS-33 adds Switch `low` palettes to the Material 3 Google, iOS 26 Apple, and Fluent 2 Microsoft
  presets. The low treatment is for strong local surfaces such as a primary example card surface.
- The `/switch` Showcase owns a local `Surface` control. It keeps the previous visual-test
  backgrounds as card-local surfaces: default, gray, light primary, primary, dark gray, dark
  primary, and black. The Surface and Emphasis controls are intentionally tied: default, gray, and
  light primary select `emphasis="medium"`; primary, dark gray, dark primary, and black select
  `emphasis="low"` when supported. If the current preset/intent does not expose the required
  emphasis, the matching Surface options are omitted. Changing Emphasis also moves the Surface
  back to the matching pedagogical surface.
- Showcase background tone resolution is reusable through `use-background-tones`; the Switch flow no
  longer paints `document.body` or `document.documentElement`.

## Validation

- `pnpm --filter @kiskadee/react-components run build`
- `pnpm --filter @kiskadee/showcase build`
- `pnpm --filter @kiskadee/showcase run build:components`
- `pnpm --filter @kiskadee/showcase run build:artifacts`
- `pnpm --filter @kiskadee/web-builder run build-sync-generate`

## Latest Validation

- 2026-06-05: KIS-28 docs-only feature inventory added; link/name review passed.
- 2026-06-05: `pnpm --filter @kiskadee/react-components run build:styles`
- 2026-06-05: `pnpm --filter @kiskadee/react-components run build`
- 2026-06-06: KIS-36 `thumbSize -> thumbShrink` naming migration completed.
- 2026-06-06: `pnpm --filter @kiskadee/react-components build`
- 2026-06-06: `pnpm --filter @kiskadee/showcase run build:components`
- 2026-06-06: `pnpm --filter @kiskadee/showcase run build:artifacts`
- 2026-06-07: KIS-33 Switch `low` on primary local surfaces implemented for Material 3 Google, iOS
  26 Apple, and Fluent 2 Microsoft.
- 2026-06-07: `pnpm --filter @kiskadee/web-builder run build-sync-generate`
- 2026-06-07: `pnpm --filter @kiskadee/react-components build`
- 2026-06-07: `pnpm --filter @kiskadee/showcase build`
- 2026-06-07: `git diff --check`
- 2026-06-07: Visual validation on `/switch` passed for Material 3 Google, iOS 26 Apple, and Fluent
  2 Microsoft by toggling `Surface: Default/Primary`; card surfaces changed locally, `body/html`
  stayed unpainted, and emphasis followed `Medium`/`Low`.
- 2026-06-07: KIS-33 Showcase surface control restored the historical contrast backgrounds as local
  card surfaces without restoring the global `body/html` background side effect.
- 2026-06-07: `pnpm --filter @kiskadee/showcase build`
- 2026-06-07: `git diff --check`
- 2026-06-07: Browser validation on `/switch` confirmed seven local Surface swatches, black and
  primary card surfaces, no `body/html` background paint, and `Primary`/`Default` emphasis sync.
- 2026-06-07: KIS-33 Showcase Surface and Emphasis controls were tied together so dark/strong
  surfaces cannot leave the Switch on an incoherent emphasis.
- 2026-06-07: `pnpm --filter @kiskadee/showcase build`
- 2026-06-07: Carbon by IBM validation confirmed dark/strong Surface options are omitted because
  Carbon only exposes `emphasis="medium"` for Switch.
- 2026-06-10: Switch activation feedback click/tap contract tightened. The `halo`
  profile no longer exposes keyboard activation for Switch, Space continues to toggle the native
  input without displaying AF, static Showcase previews use `activationFeedback="active"`, and
  `activationFeedback.inputFeedback` was removed from the modern schema.
- 2026-06-10: `pnpm --filter @kiskadee/react-components run build`
- 2026-06-10: `pnpm --filter @kiskadee/showcase build`
- 2026-06-10: `git diff --check`
- 2026-06-10: Activation feedback contract migration completed across core types, builder CSS
  generation, React runtimes, presets, and docs.
- 2026-06-10: `pnpm --filter @kiskadee/web-builder build`
- 2026-06-10: `pnpm --filter @kiskadee/react-components run build`
- 2026-06-10: `pnpm --filter @kiskadee/showcase build`
- 2026-06-10: Browser validation on `/switch` confirmed Material Google click AF in both
  checked/unchecked directions, Material `low` using vivid white AF, iOS Apple outline AF with
  `size: 8`, and static Activation Feedback cards staying active.
- 2026-06-10: All Switch presets now map `low` emphasis to `vivid` activation feedback, matching
  strong Showcase surfaces with a white halo/outline.
- 2026-06-10: PR #8 review follow-ups resolved for activation feedback: profile capabilities now
  drive runtime/bucket choices, unknown profile buckets fail loudly, web-builder AF tests were
  restored, and shared pointer-capture/lazy-loader helpers removed duplicated runtime plumbing.
- 2026-06-12: KIS-7 Switch thumb icons implemented with `e6` and `currentColor` policy. Material 3
  Google emits the first icon slot and `/switch` exposes None, On/off, and Play/pause options only
  when the active preset supports `e6`.
- 2026-06-12: Switch thumb icon support extended to Carbon IBM, Fluent 2 Microsoft, and iOS 26
  Apple, so every current first-party preset with Switch has an `e6` slot.
- 2026-06-12: `pnpm --filter @kiskadee/web-builder run build-sync-generate`
- 2026-06-12: `pnpm --filter @kiskadee/web-builder build`
- 2026-06-12: `pnpm --filter @kiskadee/showcase build`
- 2026-06-12: Browser validation on `/switch` confirmed the `Icons` control and `currentColor`
  glyphs for Carbon IBM, Fluent 2 Microsoft, iOS 26 Apple, Material 3 Google, and Material 3
  Kiskadee.
- 2026-06-12: `/switch` Showcase now keeps icons and `Thumb shrink` mutually exclusive at the
  presentation layer, while keeping component-level `icons` + `thumbShrink` support unrestricted.
- 2026-06-12: `pnpm --filter @kiskadee/showcase exec tsc --noEmit --pretty false`
- 2026-06-12: `pnpm --filter @kiskadee/showcase build`
- 2026-06-12: Browser validation on `/switch` confirmed `Icons: Play / pause` unchecks `Thumb
  shrink`, removes the `thumbShrink` class patch from the demo thumb, and `Icons: None` restores
  artifact-default `thumbShrink`.
- 2026-06-12: Material Google `thumbShrink` disable bug fixed in runtime motion geometry.
  Browser validation on `/switch` confirmed the off-state thumb center stays near `635px` during
  `Thumb shrink` on -> off instead of jumping left to `631px`.
- 2026-06-12: `pnpm --filter @kiskadee/react-components run build`
- 2026-06-12: `pnpm --filter @kiskadee/showcase build`
- 2026-06-12: `/switch` icon/shrink guard updated: icon modes leave the `Thumb shrink` control
  enabled; turning `Thumb shrink` on while an icon mode is selected clears `Icons` back to `None`.
- 2026-06-12: `pnpm --filter @kiskadee/showcase exec tsc --noEmit --pretty false`
- 2026-06-12: Browser validation on `/switch` confirmed `Icons: Play / pause` unchecks `Thumb
  shrink` without disabling it, and clicking `Thumb shrink` restores `Icons: None`, removes thumb
  icons, and reapplies the `thumbShrink` class.
