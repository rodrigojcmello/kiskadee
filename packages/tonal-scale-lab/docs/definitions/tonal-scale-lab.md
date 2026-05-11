# Tonal Scale Lab

`@kiskadee/tonal-scale-lab` is an internal exploration project for color-ramp generation.

The current lab focuses on a 16-position tonal scale shaped after the official Fluent 2 brand blue
scale:

- base color: `#0f6cbd`;
- base tone: `80`;
- emitted tones: `10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160`.

The algorithm is intentionally local and explicit. It derives a reusable HSL curve from the Fluent
blue reference:

- lightness follows the reference dark/base/light progression;
- saturation follows the reference ratio relative to the base tone;
- hue follows the reference hue drift relative to the base tone.

The Next.js UI is the primary feedback surface for this project. It shows the generated scale, the
Fluent reference scale, and a saturation/lightness chart so curve changes are visible immediately.
The app uses port `3001` by default so it can run alongside `@kiskadee/showcase` on port `3000`.

Future work should decide how the algorithm adapts when the input color is too light, too dark, or
has low contrast potential.
