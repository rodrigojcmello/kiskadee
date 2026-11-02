# Theme and Surface Context

Status: canonical cross-package decision.

## Independent recipe coordinates

Theme and Surface Context are independent inputs to a preset's visual recipes.

| Input | Meaning | Does not imply |
| --- | --- | --- |
| Theme | The selected `light`, `dark`, or `darker` recipe supported by the preset. | A particular Surface Context for every descendant. |
| Surface Context | The semantic `onSubtle` or `onVivid` surface immediately behind a component. | A theme change, a luminance measurement, or automatic color inversion. |

`onVivid` is not an alias for Dark. A strong colored region can belong to a Light composition and
publish `onVivid` without changing the theme. A Dark composition can contain both subtle and vivid
regions. The same applies to other themes a preset supports.

The palette lookup keeps both coordinates. Changing Surface Context does not select another theme;
changing the theme does not automatically change the Surface Context. Surface owners publish the
context their authored surface produces, and descendants consume it through the existing handoff.

## Preset authorship

Presets author the supported combinations rather than deriving one axis from the other. Light +
`onVivid` and Dark + `onVivid` may use different colors or formulas. They may also deliberately share
them for a particular recipe. Neither equality nor a visible difference is a universal requirement.

This independence preserves room to calibrate a vivid surface for each theme without turning all
vivid regions into Dark regions. It does not prescribe one tonal position, brightness, saturation,
foreground polarity, or emphasis treatment across presets. Matching a reference product remains a
preset authorship decision using the existing color layers and recipes.

## Mixed theme compositions and Windows references

A system shell using Dark while applications use Light demonstrates separate theme choices for
different regions or subsystems. It does not establish that every vivid surface in a Light
application must use Dark recipes. Such references are useful visual evidence, but their local
theme, accent color, transparency, and material treatment must be distinguished from Surface
Context.

A composition can intentionally request a Dark vivid region alongside Light regions. Selecting
Dark + `onVivid` expresses those two choices; reproducing an exact Windows appearance still requires
matching and validating the preset's colors and materials. The coordinate pair alone does not
guarantee a pixel match. Future calibration of that pair does not require removing the independent
Light + `onVivid` recipes.

Other design systems and products may have their own surface-relative or theme-scoped mechanisms.
Kiskadee's contract is the explicit separation and consistent publication of these two inputs; it
does not depend on claiming that contextual styling exists only here.

## Ownership and related contracts

This definition owns the relationship between the two axes. Presets own their concrete recipes and
source evidence. Builder and framework code preserve the coordinates rather than inferring them
from rendered colors.

- [Surface Context in p-react](../../packages/components/react/docs/definitions/surface-context.md)
  owns input resolution, produced context, Providers, and recursive propagation.
- [Container and Card surface ownership](./container-and-card-surfaces.md) owns passive region
  authorship and the Card handoff.
- [Composition strategies](./composition-strategies.md) explains when subtree-scoped inputs need a
  Provider.
- [Fluent 2 Theme and Surface Context decision](../../packages/presets/docs/design-systems/fluent-2-microsoft/colors/theme-surface-context-decision.md)
  records the preset-specific evidence, retained recipes, and distinction from Windows shell theming.
