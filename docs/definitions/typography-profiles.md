# Typography profiles

Typography in Kiskadee separates six concerns that are related but have different owners.

## Family availability

`global.fonts.families` describes CSS font stacks. It does not prove that a font file is available.
The host may provide a family through installed fonts, CSS, framework tooling, or an optional
`@kiskadee/fonts` preparation descriptor.

## Semantic font roles

`global.fonts.roles` selects the family IDs used by `body`, `heading`, and `code`. Typography
profiles refer to those roles instead of naming a concrete family. Existing `--k-font-body`,
`--k-font-heading`, and `--k-font-code` variables remain the Web projection of those roles.

## Typography profiles

`global.typography.profiles` is the preset-owned catalog of complete, reusable text recipes. Each
profile declares:

- one semantic font role;
- one font weight;
- font size and line height;
- optional letter spacing.

Profiles do not inherit from one another. Semantically distinct recipes may intentionally have the
same numeric values, while the Web Builder still deduplicates their atomic CSS utilities. Stronger
representations are independent complete profiles, such as `body-medium` and
`body-medium-strong`; Kiskadee does not synthesize every possible size and weight combination.

A source-backed, complete, component-agnostic recipe may enter the global catalog with one initial
consumer when the alternative would be component-local font metrics outside the profile contract.
Its ID must describe the reusable text recipe rather than the component that first required it,
and its source or Kiskadee adaptation must be documented by the owning preset.

Letter spacing is optional. Omitting it emits no declaration, while an authored zero remains an
intentional value.

## Component scale

A textual component slot selects profiles through its `typography` map. The component's existing
`scale` remains the public visual choice: it determines the complete component geometry and the
matching text recipe together. Components do not expose a separate profile, weight, or text-size
override in the initial contract.

Responsive profile selection is allowed only for metric changes. Every profile in one responsive
sequence must preserve the same semantic font role and weight, preventing layout drift caused by a
weight change at a breakpoint. Interaction states never replace a typography profile.

## HTML semantics

A visual profile does not select an HTML element or accessible role. A profile named
`heading-large` does not create an `h1`, and a profile named `body-medium-strong` does not create a
`strong` element. Headless and consuming application markup continue to own document semantics.

## User enlargement

The Web Builder projects profile metrics proportionally:

- font size as `rem`;
- line height as a unitless ratio;
- letter spacing as `em`.

This lets browser zoom, root-font changes, and user text-spacing overrides enlarge the authored
recipe without a typography runtime. Component layout must tolerate text enlargement up to 200%
without clipping, overlap, or loss of function. Kiskadee does not use `zoom` or
`transform: scale()` as an accessibility mechanism.

## Build and runtime boundary

Profile references are resolved during Web generation into the existing atomic decoration and
scale classes. Profile IDs are not part of CSS class identity, and no typography lookup runs in the
browser. A separate `typography.kiskadee.json` inspection artifact describes profiles and their
usages; it is loaded only by consumers that need that information, such as the Showcase typography
route.

## Deferred capabilities

- A public `Text` or `Typography` component.
- Per-instance profile, weight, or text-size overrides on existing components.
- A provider-controlled global application type scale.
- Profile changes driven by interaction state.
- Canonical profile IDs shared by every preset.
- Profile inheritance, aliases, and partial composition.
- Font stretch, optical sizing, and other variable-font axes.

A future standalone text component may consume the same preset profiles. It must not become a
required wrapper for text slots inside other components.
