# Cursor Policy

Kiskadee does not treat "clickable" as a sufficient reason to use
`cursor: pointer`. For cross-platform consistency, command-oriented controls
such as `button`, `tab`, segmented controls, toggles, and similar interactive UI
elements should keep the platform/default cursor (`auto`, typically the arrow)
unless a platform preset explicitly chooses a different convention.

`cursor: pointer` is reserved for link-like navigation affordances and for
web-only presets that intentionally want to follow the broader web convention of
showing a hand cursor for most clickable elements.

Rationale:

- Native desktop platforms usually keep the default arrow for buttons and
  reserve the hand cursor for links.
- The web convention of using `pointer` for nearly every clickable element is a
  cultural pattern, not a platform-agnostic interaction rule.
- Kiskadee models semantics that should translate cleanly across web and future
  native targets.

Preset authoring rule:

- Buttons and tabs default to the platform cursor.
- Links default to `pointer`.
- Disabled interactive elements must not use `pointer`.
- If a preset wants all clickable controls to use `pointer`, treat that as a
  preset-level override, not a core assumption.
