# Motion Strategy

Kiskadee components should start with the lightest honest motion model that can deliver the intended
interaction. Runtime motion is useful, but it should be opt-in and justified by behavior that CSS
transitions cannot own well.

## Terms

### Static Path

The static path is the default lightweight component path.

`static` does not mean the component has no animation. It means the component does not load or run a
dedicated animation engine for that behavior. A static path may still use:

- CSS transitions,
- generated motion tokens,
- structural CSS variables,
- direct state-to-style updates,
- DOM measurement when needed for layout.

Tabs are the current example: static indicators may measure the selected tab, but they do not load
the `motion/react` enhancer.

### Motion Path

The motion path uses a runtime animation engine or gesture runtime to coordinate behavior that CSS
cannot express reliably.

Use a motion path when the component needs at least one of these:

- interruptible animation that retargets from the current visual position,
- spring or physics-based movement,
- drag or gesture-driven interaction,
- animation driven by pointer velocity or release position,
- multiple measured phases that cannot be represented as a direct CSS transition,
- runtime coordination between visual state and semantic state.

Motion paths should be lazy-loaded or otherwise isolated when possible so consumers of the static
path do not pay for runtime animation code.

## Naming

Use `static` and `motion` as the main implementation vocabulary.

Avoid adding a third public vocabulary such as `css` unless a component has a strong reason. CSS
transitions are part of the static path, not a separate engine category. The important distinction is
whether the component uses a dedicated runtime motion engine, not whether CSS transitions exist.

`motion` is Kiskadee vocabulary, not a dependency name. It means a component path that uses a
dedicated animation or gesture runtime to own movement that CSS cannot own well. The implementation
may use `motion/react` today, but public Kiskadee names should never imply that the project is
coupled to that library.

## Default Rule

New components should start with the static path when it can produce acceptable fidelity.

Add a motion path only after the static path is stable and a concrete behavior requires it. This
keeps the first implementation smaller and prevents runtime animation from becoming the default
answer for ordinary state transitions.

When both paths become public, prefer separate components over a mode prop on the lightweight
component:

- `Component` is the canonical, lightweight static-path component;
- `ComponentMotion` is the explicit runtime-motion component;
- an optional lazy orchestrator may switch between the two for demos or consumers that need dynamic
  selection, but it should be treated as a helper, not the canonical component.

This naming intentionally biases usage toward the smaller default. Consumers who need drag,
interruptible animation, spring behavior, or other runtime-owned movement can opt into the heavier
component explicitly.

## Switch Direction

The default Switch thumb movement is a static-path behavior: React measures the travel distance and
CSS transitions the thumb between off and selected positions. This remains the default because the
ordinary Switch path should stay lightweight.

Switch should expose this distinction as separate public components:

- `Switch` is the lightweight static-path component;
- `SwitchMotion` is the explicit runtime-motion component for drag, interruptible animation, and
  spring-like movement.

If a consumer or showcase needs to switch dynamically between static and motion behavior, use a
separate lazy helper that renders `Switch` first and lazy-loads `SwitchMotion` only when needed. That
helper is a convenience layer; it should not make `Switch` itself aware of the heavier motion path.

Use the Switch motion path for behavior such as:

- dragging the thumb to toggle the control,
- interrupting and reversing the thumb animation from its current position during rapid clicks,
- using spring-like motion instead of a fixed CSS transition.

That motion path does not replace the default static path. It is isolated behind an explicit
component boundary.

Static and motion may also be separate structural CSS branches when their DOM, pointer behavior, or
animation ownership would otherwise force one path to undo the other. For Switch, the intended
structural branch registry is:

```txt
Switch
    a = static
    b = motion
```

That branch split is structural only. It does not mean `static` or `motion` should become schema
variants or a `Switch` mode prop. Branch-specific selectors should carry the isolation, even if that
duplicates structural CSS between `Switch` and `SwitchMotion`.

`activationMotion`, `Switch`, and `SwitchMotion` are different layers:

- `activationMotion` is a preset/schema timing profile for activation movement and CSS visual
  transitions.
- `Switch` is the lightweight component that may still use CSS transitions.
- `SwitchMotion` is the explicit component that uses a dedicated runtime animation/gesture engine.
- In `SwitchMotion`, CSS still uses `activationMotion` for non-transform visual transitions, while
  horizontal thumb displacement maps the same `activationMotion` value to an internal runtime spring
  profile.
