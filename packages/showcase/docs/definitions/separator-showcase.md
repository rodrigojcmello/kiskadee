# Separator Showcase

The `/separator` route demonstrates the public Separator intent, emphasis and orientation
axes. The Intent control lists only Neutral and Primary recipes published for the active
preset, segment, theme and the supporting Card's produced surface context. Neutral is the
initial choice. If a requested intent becomes unavailable, the route displays the first
supported intent instead of rendering an unsupported recipe; the visible control reflects
the effective choice. No available recipe produces an explicit availability message.

Horizontal, vertical and layout examples share the selected intent. Emphasis rows list
only published Rest levels. The Intent selector uses sequential navigation with loop
enabled. Horizontal lines use Above and Below labels; vertical lines use Before and After.
The layout example prefers Medium, then the first available level.
Availability is evaluated for the surface inside the supporting Card, which may
differ from the outer canvas. Separator continues inheriting that context normally.

Intent selects the color family, emphasis selects strength and surface context selects
the contextual recipe. Neutral does not mean permanently black or white. The examples
use generated recipes without locally authored line colors. Surrounding layout owns
spacing and the axis along which a vertical line stretches.

A separate darkening treatment remains an open design question. This route introduces
no variant, profile selector or additional Separator contract.

Emphasis labels use the strong body profile and published Blue foreground when available,
otherwise Neutral. Positional labels use the smaller caption profile with Low emphasis.
Compact stages keep horizontal and vertical examples aligned without changing Separator geometry.
