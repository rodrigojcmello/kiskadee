# Button selection presentation

Status: canonical Schema contract.

`ButtonSelectionEmphasis` is `lowest | low | medium | high`. It describes how the Button presents
its semantic selected state; it does not extend the global `ComponentEmphasis` scale or add an
axis to ordinary palette state maps.

| Selection emphasis | Selected control paint | Indicator |
| --- | --- | --- |
| `lowest` | Selected recipe of the base Button emphasis and effective selection intent | No |
| `low` | Selected recipe of the base Button emphasis and effective selection intent | Yes, when published |
| `medium` | Ordinary High recipe of the effective selection intent, starting at Rest | No |
| `high` | Ordinary High recipe of the effective selection intent, starting at Rest | Yes, when published |

`components.button.options.selectionEmphasis` sets the preset default. An explicit platform prop
overrides it; omission falls back to `lowest` for every layout. Fluent and Material publish this
same default. The removed `indicatorScope` option is invalid. Independent indicator activation
is not part of the Button contract; `indicatorPlacement` still selects inside or outside geometry.

`selectionIntent` complements this scale without creating another selection state. The platform
prop accepts `ButtonIntent`; `components.button.options.selectionIntent` accepts only
`SystemButtonIntent`. Precedence is the explicit prop, the preset option, then the Button's base
intent. Fluent and Material leave this option omitted, preserving existing consumers. Without
semantic selection, only the base intent participates in paint resolution.

All combinations of published intentions are allowed. There is no automatic Neutral-to-Primary
swap, preferred pair list, or ordinal relation between intentions. External `brand.*` selections
retain the existing compatible BrandPack requirements; the preset option cannot author an external
intent. Missing or incompatible brand resources fail visibly and never fall back to a system
intent. No new brand recipe is introduced by this contract.

All levels preserve the base Button presentation when it is not selected. A selected control
remains semantically selected at every level, including when its paint uses ordinary High states.
High is literal even if the base Button uses Highest. Ordinary High
Hover, Focus and Pressed remain active, while High Selected deltas are excluded. The platform
must retain selected accessibility, indicator activation and connected-group state ownership.
Surface, text, icon, disclosure, indicator, effects and the context produced for descendants follow
the same effective paint intent and emphasis. Parts with their own authored color domain retain
that domain. Geometry and base intent do not change. Terminal states retain their precedence and
suppress the indicator without clearing semantic selection.

The existing palettes and `e11/e12` indicator anatomy remain authoritative. No four-way palette
duplication or indicator Rest paint is required. A Builder publishes the required projected classes
and coverage; a consumer never filters CSS identities or invents missing colors. If a system
selection intent lacks the required published part coverage, the platform resolves the whole
selected appearance against the base intent and emits a development warning rather than mixing
intentions across parts. Within the resolved intent, an unavailable ordinary High recipe retains
Selected at the base emphasis, including a compatible brand recipe's own Selected fallback. An
indicator independently needs complete coverage for its effective appearance and placement,
otherwise it stays absent. Sparse state maps without a Selected delta remain valid; absence of
that delta is not absence of the underlying recipe.

See [Button state indicator](./button-indicator.md) for the optional anatomy and
[composition strategies](../../../../docs/definitions/composition-strategies.md) for the shared
Schema/build/runtime ownership.
