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

## Default Rule

New components should start with the static path when it can produce acceptable fidelity.

Add a motion path only after the static path is stable and a concrete behavior requires it. This
keeps the first implementation smaller and prevents runtime animation from becoming the default
answer for ordinary state transitions.

## Switch Direction

The current Switch thumb movement is a static-path behavior: React measures the travel distance and
CSS transitions the thumb between off and selected positions.

A future Switch motion path is justified if it adds behavior such as:

- dragging the thumb to toggle the control,
- interrupting and reversing the thumb animation from its current position during rapid clicks,
- using spring-like motion instead of a fixed CSS transition.

That motion path should not replace the default static path. It should be isolated behind an
explicit implementation branch, and the structural CSS should use a root motion gate such as
`k-swt-m` only when the runtime motion path is active.
