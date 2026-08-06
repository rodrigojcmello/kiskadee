# Interface Icon Provenance

The first Web adapter set is pinned through package manifests and the workspace lockfile.
Kiskadee maps a curated semantic subset; it does not copy or claim ownership of the upstream
catalogs.

| Family ID | Upstream package or service | Version/variants | License |
| --- | --- | --- | --- |
| `lucide` | `lucide-react` | `1.27.0`; Kiskadee `thin`, `regular`, `bold` stroke profiles | ISC |
| `fluent-system` | `@fluentui/react-icons` | `2.0.334`, Regular | MIT |
| `material-symbols` | Google Fonts Material Symbols | Outlined, FILL 0/1, weight 400, grade 0, optical size 24 | Apache-2.0 |
| `carbon` | `@carbon/icons-react` | `11.85.0`, standard | Apache-2.0 |
| `iconoir` | `iconoir-react` | `7.11.1`, Regular | MIT |
| `phosphor` | `@phosphor-icons/react` | `2.1.10`; Thin, Regular, Fill, Duotone | MIT |
| `font-awesome-classic` | `@fortawesome/free-solid-svg-icons` | `7.3.1`, Classic Free Solid | CC-BY-4.0 and MIT |

Primary sources:

- [Lucide](https://lucide.dev)
- [Fluent UI System Icons](https://github.com/microsoft/fluentui-system-icons)
- [Material Symbols](https://developers.google.com/fonts/docs/material_symbols)
- [Carbon Icons](https://carbondesignsystem.com/elements/icons/code/)
- [Iconoir](https://iconoir.com)
- [Phosphor](https://phosphoricons.com)
- [Font Awesome SVG icons](https://docs.fontawesome.com/web/add-icons/)
- [SF Symbols](https://developer.apple.com/sf-symbols/)

The libraries are optional peers of `@kiskadee/icons`. The package's build environment installs
all of them to validate adapters; a consumer installs only the selected static family, or all
families when opting into the broad lazy catalog.

Fluent, Phosphor, and Font Awesome adapters import the documented per-glyph subpaths exposed by
their packages. Font Awesome definitions are rendered by Kiskadee's small presentation-only SVG
adapter, so selecting that family does not add Font Awesome's React runtime or global library.

Iconoir Solid currently covers 15 of the 47 canonical names, and Font Awesome Classic Free Regular
covers 14 of 47. Kiskadee requires complete canonical coverage for every exposed official variant,
so both remain deferred. No visual fallback fills their missing concepts.
