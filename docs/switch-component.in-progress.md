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
- `interactionLocked?: boolean` is a temporary interaction gate. It blocks activation attempts
  without applying `disabled`, `readOnly`, or their visual states.
- There is no separate public motion component export.
- There is no second-version public component export.

## Implementation Notes

- Structural namespace is `k-swt`.
- KIS-28 feature inventory lives at
  `packages/components/react/docs/definitions/switch/switch-features.md`.
- Runtime motion, `thumbShrink`, `activationFeedback`, and `controlText` remain internal modules.
- Switch activation feedback is a pointer/click visual effect. Direct click/tap on the visual track
  may start AF; Space keeps the native keyboard toggle behavior but must not start AF.
- `interactionLocked` routes through `useControlState`, `HeadlessSwitch.Root`, runtime motion, and
  activation feedback. Locked switches suppress click/change/drag activation and activation
  feedback, but must not project a disabled/read-only state class or input attribute.
- Runtime motion commits a drag intent when the thumb reaches an endpoint, matching the native iOS
  behavior. `latestDragControlStateRef` prevents repeated emissions at the same endpoint; consumers
  still own async confirmation, rollback, and any cooldown state.
- Runtime motion does not let Framer Motion's default thumb drag listener classify every thumb
  press as a potential visual drag. The thumb uses manual `dragControls` with the same click
  suppression threshold as Switch pointer intent, so thumb clicks and label clicks share the same
  toggle animation path until movement actually crosses the drag threshold.
- Switch geometry helpers shared by runtime motion and activation feedback live in
  `SwitchGeometry.utils.ts`. Keep class names, reduced-thumb epsilon, track content measurement, and
  pixel parsing centralized there. AF uses the real visual thumb box when the explicit `thumbShrink`
  marker exposes an internal `x5` visual layer; compact presets such as Fluent have a naturally
  smaller thumb and should still use the real thumb box for the AF outline.
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
- Static Switch activation feedback is a press-start one-shot visual pulse. `pointerdown` starts
  the feedback, semantic `click` keeps owning the toggle, and `pointerup`/`pointercancel`/drag do
  not extend the active feedback duration. The one-shot path ignores profile runtime duration but
  still honors profile `fade.delayToken`, so quick taps get a short full-opacity hold before fade.
- The static AF one-shot finish path intentionally has no runtime-duration option: it schedules
  fade from the configured minimum press hold plus profile `fade.delayToken`.
- Static outline activation feedback treats host geometry as a required runtime contract. The
  generated outline CSS does not provide drawable fallbacks for `--k-af-host-width`,
  `--k-af-host-height`, or `--k-af-host-radius`; Switch resolves measured thumb geometry in advance
  and uses the internal `x5` visual box for reduced/thumbShrink states.
- Static activation feedback does not start when required host geometry cannot be applied. The
  shared halo hook only resyncs geometry on host `transitionend` by default; Switch explicitly also
  accepts the internal `x5` visual layer while `thumbShrink` is active because that layer owns the
  width, height, and radius transition that changes the measured AF box.
- SSR-safe layout reads in React components should use the shared `useIsomorphicLayoutEffect`
  utility instead of local `typeof window` hook aliases.
- Switch `thumbShrink` uses a two-layer thumb structure: `e3` is the stable host for runtime motion,
  measurement, and activation feedback; internal `x5` is the painted thumb layer that receives the
  generated `thumbShrink` width/height effect.
- Runtime motion measures the stable `e3` host. `thumbShrink` must not resize that host; compact
  presets such as Fluent still follow their generated thumb geometry directly because they do not
  receive the explicit `thumbShrink` marker.
- Static unselected thumb hosts are anchored by their normal visual center through generated
  `--k-bxw`. Material `thumbShrink` centers the reduced `x5` visual inside that stable host.
- The motion thumb remounts once when runtime geometry becomes ready, so initially selected
  switches receive the measured `thumbTranslation` before the first stable render. This keeps Fluent
  selected/off state aligned after reload while preserving normal toggle/drag animations.
- Runtime motion must attach measurement observers to the current DOM elements, not only to the
  original `RefObject.current` value. The ready-state remount changes the thumb node, so the motion
  controller reattaches observers to the stable `e3` host after remount.
- The motion structural transition must not include `inset-block-start` or `inset-inline-start`.
  Runtime geometry owns those values as immediate alignment corrections; animating them in CSS
  competes with the motion `x` transform and makes Material `thumbShrink` travel crooked while
  toggling. Keep the visual animation on `transform` plus thumb `width`/`height`.
- `controlText` is isolated under `features/control-text`.
- KIS-7 adds optional thumb icons through `icons={{ rest, selected }}`. The icon slot is schema
  element `e6`, rendered inside thumb `e3`, and follows the Button/Tabs currentColor policy:
  schema `textColor` emits CSS `color`; SVG/icon glyphs must use `currentColor`; the builder does
  not rewrite SVG paints.
- All current first-party presets with Switch support define an `e6` icon slot. Material 3 uses
  `16 x 16`, Carbon uses `14 x 14`, Fluent uses `10 x 10`, and iOS scales the slot from `8 x 8`
  through `20 x 20` with the Switch scale.
- Future presets without `e6` should not expose icon controls in Showcase.
- The `/switch` Showcase exposes `Interaction locked` for the interactive example only, so the
  temporary lock can be validated without treating it as an official visual state tile.
- The iOS Showcase exposes a Switch preset picker backed by generated JSON fixtures under
  `packages/components/ios/Examples/KiskadeeIOSShowcase/KiskadeeIOSShowcase/Resources`. The picker
  includes first-party presets that currently define `components.switch`: Carbon IBM, Fluent 2
  Microsoft, iOS 26 Apple, Material 3 Google, and Material 3 Kiskadee. Presets without
  `components.switch` stay out of the picker until they gain a Switch schema.
- The Android Showcase mirrors the iOS Switch preset picker and uses the same first-party Switch
  fixture files copied into `packages/components/android/showcase/src/main/assets`. The old reduced
  Material-only Android fixture was removed so the showcase exercises full `themeTokens` and
  component-level `activationFeedback` data.
- The Android native Switch now supports tap, drag, edge commit, `interactionLocked`,
  `interactionCooldownMillis`, animated thumb travel/size changes, and activation-feedback outline
  rendering resolved from the same schema fields as iOS.
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
- 2026-06-20: Switch AF review follow-ups applied: cached static geometry now fails when the host
  is unavailable, geometry transition sync is host-scoped by default, and Switch explicitly includes
  the `thumbShrink` `x5` visual layer as a valid transition source.
- 2026-06-20: `pnpm --filter @kiskadee/react-components run build`
- 2026-06-20: `git diff --check`
- 2026-06-20: Browser validation on `/switch` with Material Design 3 by Google confirmed the static
  `Unselected (activation feedback)` card measures AF from the `x5` visual layer (`16 x 16`, AF
  layer `32 x 32`) and the interactive toggle keeps the same geometry after motion settles.
- 2026-06-12: `pnpm --filter @kiskadee/showcase build`
- 2026-06-12: `/switch` icon/shrink guard updated: icon modes leave the `Thumb shrink` control
  enabled; turning `Thumb shrink` on while an icon mode is selected clears `Icons` back to `None`.
- 2026-06-12: `pnpm --filter @kiskadee/showcase exec tsc --noEmit --pretty false`
- 2026-06-12: Browser validation on `/switch` confirmed `Icons: Play / pause` unchecks `Thumb
  shrink` without disabling it, and clicking `Thumb shrink` restores `Icons: None`, removes thumb
  icons, and reapplies the `thumbShrink` class.
- 2026-06-12: Fluent 2 Microsoft motion alignment fixed. Browser validation on `/switch` confirmed
  motion on and motion off both place Fluent off-state at `centerX=10/centerY=10` and selected-state
  at `centerX=30/centerY=10` on the `40x20` rail with `borderWidth: 1px`.
- 2026-06-12: Material Google `thumbShrink` off-state regression check confirmed disabling
  `Thumb shrink` expands the thumb from `16` to `24` without a leftward center jump.
- 2026-06-12: Material Google + Fluent cross-check completed after the motion observer fix.
  Material Google with motion on and `thumbShrink` on keeps selected at `centerX=36/centerY=16`,
  recalculates the interactive off state to `centerX=16/centerY=16` with `--k-swt-ti/ty: 6px`, and
  Fluent 2 Microsoft still stays at off `centerX=10/centerY=10` and selected `centerX=30/centerY=10`
  on the `40x20` rail with `borderWidth: 1px`.
- 2026-06-12: Runtime motion transition policy corrected after the Material/Fluent cross-preset
  regression. `SwitchRuntimeMotion.structural.scss` no longer transitions `inset-block-start` or
  `inset-inline-start`; those remain immediate runtime geometry corrections while `transform` and
  thumb `width`/`height` own the visual motion. Browser validation on `/switch` confirmed Material
  3 Google with motion + `thumbShrink` at off `centerX=16/centerY=16` and selected
  `centerX=36/centerY=16`, and Fluent 2 Microsoft at off `centerX=10/centerY=10` and selected
  `centerX=30/centerY=10`.
- 2026-06-12: `pnpm --filter @kiskadee/react-components run build`
- 2026-06-12: `pnpm --filter @kiskadee/showcase exec tsc --noEmit --pretty false`
- 2026-06-12: `git diff --check`
- 2026-06-12: `thumbShrink` size-toggle alignment refined. Switch `e3` now mirrors `boxWidth` as
  `--k-bxw` so the static path can anchor the unselected thumb by its normal center, and runtime
  motion keeps the shrink alignment box while the measured thumb width is still reduced after the
  class is removed. Browser validation on `/switch` confirmed Material static and motion
  `Unselected (rest)` stayed at `centerX=16/centerY=16` while toggling `Thumb shrink`.
- 2026-06-12: `pnpm --filter @kiskadee/web-builder run build-sync-generate`
- 2026-06-12: Fluent motion alignment regression fixed by scoping the reduced-thumb alignment box to
  active/same-track `thumbShrink` transitions only. Browser validation on `/switch` confirmed Fluent
  2 Microsoft motion-on off state at `centerX=10` and selected state at `centerX=30` on the `40x20`
  rail, including after switching from Material 3 Google with motion + `thumbShrink` active.
- 2026-06-12: Material 3 Google regression check confirmed motion + `thumbShrink` still keeps the
  off-state thumb centered near `centerX=16` throughout the shrink transition and selected at
  `centerX=36`.
- 2026-06-12: `pnpm --filter @kiskadee/react-components run build:dev:self`
- 2026-06-12: `pnpm --filter @kiskadee/react-components run build`
- 2026-06-12: `pnpm --filter @kiskadee/showcase exec tsc --noEmit --pretty false`
- 2026-06-12: `switch-motion-thumbshrink-code-review.md` follow-ups applied. The redundant
  `hasTransitioningThumbShrinkRef` was removed in favor of the single same-track shrink marker,
  `SwitchRuntimeMotionThumbProps` no longer advertises the unused `thumbRef` prop,
  `calculateSwitchRuntimeMotionGeometry` now exposes `isReducedThumb` to avoid duplicate
  `getComputedStyle` reads in one sync, and `SwitchRuntimeMotion.geometry.test.ts` now covers
  compact thumbs with and without reduced-thumb alignment.
- 2026-06-12: `pnpm --filter @kiskadee/react-components exec vitest run
  src/components/Switch/effects/motion/SwitchRuntimeMotion.geometry.test.ts`
- 2026-06-12: `pnpm --filter @kiskadee/web-builder exec vitest run
  src/web-style-key-identity.test.ts src/phase-2-map-style-key-usage/mapStyleKeyUsage.test.ts
  src/phase-5-generate-class-names-map/generateClassNamesMap.test.ts`
- 2026-06-12: `pnpm --filter @kiskadee/react-components run build`
- 2026-06-12: `pnpm --filter @kiskadee/showcase exec tsc --noEmit --pretty false`
- 2026-06-12: Browser validation on `/switch` checked the ResizeObserver risk from the review:
  Material 3 Google with motion + `Thumb shrink` active produced no `ResizeObserver` warnings after
  repeated `Thumb shrink` and `Motion` toggles, and still measured off `centerX=16/centerY=16` and
  selected `centerX=36/centerY=16`.
- 2026-06-12: Browser validation after the geometry refactor reconfirmed Material 3 Google at off
  `centerX=16/centerY=16` and selected `centerX=36/centerY=16`, then Fluent 2 Microsoft at off
  `centerX=10/centerY=10` and selected `centerX=30/centerY=10` with `--k-swt-ti: 2px` and
  `--k-swt-tx: 20px`; no `ResizeObserver` warnings were logged.
- 2026-06-12: `git diff --check`
- 2026-06-13: iOS Showcase Switch preset picker added with generated fixtures for Carbon IBM,
  Fluent 2 Microsoft, iOS 26 Apple, Material 3 Google, and Material 3 Kiskadee.
- 2026-06-13: `plutil -lint
  packages/components/ios/Examples/KiskadeeIOSShowcase/KiskadeeIOSShowcase.xcodeproj/project.pbxproj`
- 2026-06-13: JSON fixture smoke check confirmed each iOS Switch fixture has `components.switch`,
  track/thumb elements, `default.light` palettes, and `neutral.medium` colors.
- 2026-06-13: `swift build --package-path packages/components/ios --scratch-path
  /tmp/kiskadee-ios-swift-build`
- 2026-06-13: `DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer xcodebuild -project
  packages/components/ios/Examples/KiskadeeIOSShowcase/KiskadeeIOSShowcase.xcodeproj -scheme
  KiskadeeIOSShowcase -destination 'generic/platform=iOS Simulator' -derivedDataPath
  /tmp/kiskadee-ios-derived build`
- 2026-06-13: Built app bundle check confirmed all five `*switch.schema.json` fixtures are copied
  into `KiskadeeIOSShowcase.app`.
- 2026-06-14: KIS-44 React Switch `interactionLocked` implemented across headless state,
  styled Switch, runtime motion drag, and activation feedback without disabled/readOnly visual
  projection.
- 2026-06-14: `pnpm --filter @kiskadee/react-components run build`
- 2026-06-14: `pnpm --filter @kiskadee/react-headless exec vitest run
  src/components/switch/HeadlessSwitch.test.tsx`
- 2026-06-14: `pnpm --filter @kiskadee/react-components exec vitest run
  src/components/Switch/Switch.test.tsx`
- 2026-06-14: Temporary local Vitest check confirmed `interactionLocked` blocks click activation
  without setting `disabled`, `readonly`, or `aria-readonly`; the temporary file was removed.
- 2026-06-14: `/switch` Showcase exposes an `Interaction locked` toggle for the interactive
  example.
- 2026-06-14: `pnpm --filter @kiskadee/showcase exec tsc --noEmit --pretty false`
- 2026-06-14: `pnpm --filter @kiskadee/showcase build`
- 2026-06-14: Browser validation on `/switch` confirmed `Interaction locked` is visible; with
  motion on and motion off, locked clicks leave the interactive Switch checked state unchanged and
  do not apply `disabled`, `readonly`, or `aria-readonly`; unlocked clicks still toggle; motion-on
  drag to the selected endpoint changes the Switch to checked.
- 2026-06-14: `git diff --check`
- 2026-06-19: Switch static activation feedback now caches stable host/carrier geometry before
  interaction, starts the visual pulse on `pointerdown`, and runs as a one-shot independent of
  drag/pointer release. The generated outline CSS no longer falls back to a drawable host geometry.
- 2026-06-19: `pnpm --filter @kiskadee/react-components run build`
- 2026-06-19: `pnpm --filter @kiskadee/web-builder run build`
- 2026-06-19: `git diff --check`
- 2026-06-19: Browser validation on `/switch` with iOS 26 Apple and motion enabled confirmed rapid
  clicks do not collapse AF into a `12x12` thumb-centered circle. Drag from the thumb starts AF on
  press and the active class is gone by the one-shot timeout instead of being held by drag.
- 2026-06-19: Switch static activation feedback one-shot timing refined to honor profile
  `fade.delayToken` while still ignoring profile runtime duration, preserving drag independence and
  making light taps less visually abrupt.
- 2026-06-19: Switch runtime motion thumb drag now starts through manual Motion drag controls with
  the existing `5px` intent threshold, preventing plain thumb clicks from entering the drag visual
  path earlier than label clicks.
- 2026-06-20: Switch AF/motion code review cleanup restored after rollback: web-builder outline CSS
  tests assert required host geometry vars, Switch reduced-thumb geometry helpers are shared by AF
  and motion, static AF one-shot finish no longer carries runtime-duration options, pointer handler
  selection is centralized, and SSR-safe layout effects use `useIsomorphicLayoutEffect`.
- 2026-06-20: Fluent compact Switch AF regression fix restored by limiting AF carrier geometry to
  the explicit `thumbShrink` marker. Natural compact thumbs keep thumb-sized AF geometry, while
  Material `thumbShrink` uses the internal `x5` visual layer for AF geometry.
- 2026-06-20: Switch `thumbShrink` restored a component-owned visual layer: stable `e3` hosts
  runtime motion and activation feedback, while internal `x5` carries the generated visual thumb
  classes and reduced width/height. This keeps activation feedback component-agnostic.
- 2026-06-20: Static Switch AF for `thumbShrink` now resolves outline geometry from the internal
  `x5` visual box instead of the stable `e3` carrier. Browser validation on `/switch` confirmed the
  Material `Unselected (activation feedback)` card changed from `40x40` carrier geometry to `32x32`
  visual-thumb geometry.
