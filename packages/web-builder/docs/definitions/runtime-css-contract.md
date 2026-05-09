# Runtime CSS Contract

To keep behavior predictable and performance-oriented, Kiskadee follows this contract:

- Runtime decisions must come from JSON artifacts, for example `global.kiskadee.json` and
  `core.kiskadee.json`.
- CSS is the final visual layer, not the source of truth for runtime branching.

## What belongs to runtime

Runtime JSON owns interaction policy and behavior switches:

- ripple mode selection;
- ripple origin (`center` vs `pointer`);
- input feedback mode (`pressed` vs `ripple`);
- pressed visual behavior (`state` vs `overlay`).

## What belongs to CSS

CSS owns final styling values:

- colors, opacity, shadows, border radius, spacing;
- animation timing/easing values used by style rules.

## Rule of thumb

- Runtime must read behavior and runtime animation parameters from JSON artifacts.
- Runtime must not read CSS variables/custom properties to decide runtime behavior or timing.
