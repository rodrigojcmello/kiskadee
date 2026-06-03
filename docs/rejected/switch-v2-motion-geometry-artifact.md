# Switch V2 Motion Geometry Artifact

Status: deferred, not rejected.

## Context

`SwitchV2` motion needs operational geometry values to animate and drag the thumb:

- thumb travel distance;
- inline start offset;
- block start offset;
- compensated thumb radius.

Today these values are measured in the browser from the rendered DOM. The schema defines the
component dimensions, padding, border, and radius. The builder turns those values into CSS/classes.
The runtime then reads the rendered result when motion is active.

## Considered Shape

We considered emitting derived geometry in the Switch component artifact, for example:

```json
{
  "geometry": {
    "standard": {
      "base": {
        "scales": {
          "s:md:1": {
            "translation": 20,
            "inlineStart": 2,
            "blockStart": 2,
            "thumbRadius": {
              "rounded": 2,
              "pill": 12,
              "square": 0
            }
          }
        }
      }
    }
  }
}
```

The intended benefit was to let motion skip some runtime DOM measurement for known schema-driven
Switch branches.

## Current Decision

Do not add Switch motion geometry to schema or component artifacts now.

Keep the current ownership boundary:

```text
schema  -> visual intent and numeric design values
builder -> generated CSS/classes and metadata
runtime -> rendered physical geometry needed by motion/drag
```

The runtime remains responsible for measuring the final rendered geometry when `SwitchV2` motion
needs physical pixel values.

## Why It Was Deferred

The idea is plausible, but it would materially expand the builder/schema contract. Emitting geometry
means the build pipeline owns derived operational layout, not just design values and generated CSS.

That creates tighter coupling between:

- preset schema values;
- structural CSS implementation details;
- generated class behavior;
- runtime motion and drag constraints.

If structural CSS changes, a build-time geometry formula can become stale even when the rendered DOM
is still correct. Runtime measurement is slower, but it follows the final browser layout.

For now, there is no validated evidence that the current measurement path is expensive enough to
justify moving this responsibility into generated artifacts.

## When To Revisit

Revisit derived geometry artifacts if:

- many `SwitchV2` instances with motion show measurable runtime cost from DOM measurement;
- `ResizeObserver`, `getComputedStyle`, or geometry sync becomes a real performance bottleneck;
- the motion geometry formula stabilizes enough to be safely mirrored in the builder;
- the artifact can be clearly documented as a derived cache with runtime measurement fallback;
- validation proves artifact geometry matches rendered DOM across scale, radius, variant, mode,
  `thumbSize`, and RTL cases.

Until then, keep geometry out of schema/artifacts and let `SwitchV2` motion measure the rendered DOM.
