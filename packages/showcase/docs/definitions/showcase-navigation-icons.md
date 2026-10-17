# Showcase Navigation Icons

Status: canonical Showcase definition.

## Ownership

These icons identify the 17 component entries in the Showcase navigation. They are Showcase
application chrome, outside the route-owned `s-content` boundary defined in
[Showcase Content](./showcase-content.md). Icon retains its local glyph in Foundations;
Colors and Typography / Text do not use this icon family.

The artwork is local to Showcase. Presets, the public icon catalog, and the family selected for
component examples do not own or replace it. The existing conditional visibility of Progress
remains unchanged.

## Navigation groups

The navigation catalog contains 19 route entries: 17 component entries with local glyphs and
two entries without glyphs. The groups and their entry order are:

| Group | Entries |
| --- | --- |
| Foundations | Colors, Typography / Text, Icon |
| Composition | Layout, Card, Separator |
| Content organization | Accordion, Tabs |
| Actions | Button, Brand buttons |
| Fields and controls | TextField, Select, Slider, Switch |
| Menus and panels | Dropdown, BottomSheet |
| Labels and indicators | Badge, Chip, Progress |

Foundations reserves the same 20-pixel icon slot for every entry, leaving it empty for Colors
and Typography / Text so their labels align with Icon. The group placement does not change
Icon's artwork or ownership. Progress remains subject to its existing conditional visibility.

## Artwork source

The editable source is the **Kiskadee** OpenPencil document (`Kiskadee.fig`), on the page
`Showcase / Component icons` (ID `1792514109:6`).

Two matching boards sit side by side:

- Left: `Kiskadee / Showcase / Selected icons` (ID `1792514109:33`).
- Right: `Kiskadee / Showcase / Unselected icons` (ID `1792514109:187`).

Each board contains 17 native components, named
`Showcase / Icon / <component label> / Selected` or
`Showcase / Icon / <component label> / Unselected`. The 34 editable components form 17 pairs
with identical geometry. Each has a `Stroke / Graphite` vector and one or more `Stroke / Blue`
or `Stroke / Gray` highlight vectors, bound to the local `Showcase icons` color collection.

Accordion and Dropdown keep their chevrons on a separate `Stroke / Blue / Arrows` or
`Stroke / Gray / Arrows` vector. This separation allows a thinner arrow stroke without
thinning Accordion's text lines or Dropdown's highlighted frame. Select's highlight vector
contains only its two arrows. The native component IDs remain unchanged.

## Visual construction

- Master/export size: 48 by 48 pixels, with a 48-unit square SVG viewBox.
- Default stroke: 3 units.
- Accordion, Dropdown, and Select chevrons: 2 units in both color states.
- All strokes are centered, with round caps and joins.
- Menu display size: 20 by 20 pixels.
- Outline: `#484259` in both states.
- Selected highlight: `#3b82f6`.
- Unselected highlight: `#9ca3af`.
- No painted background or filled icon shapes.

At the 20-pixel menu size, the default stroke is 1.25 pixels wide and the chevrons are
approximately 0.83 pixels wide.

Strokes of different colors must not touch or cross. Leave a visible transparent gap between
the graphite outline and the blue or gray highlight, accounting for the stroke width and
rounded caps. The gap shows the surface beneath the SVG; do not paint a white separator.

Tabs has one exception: the base of its highlighted tab may touch the graphite body outline.
Keep a clear gap in the upper region between the highlighted tab and the second graphite tab.

- Badge leaves a 2-unit visible gap between its circular highlight and both adjacent graphite
  endpoints, measured from the painted stroke edges.
- Button has one centered highlight line.
- BottomSheet highlights its whole lower outline, including the sides and base, and stops
  the upper graphite sides before they reach it.
- Card extends its highlighted divider from `x=6` to `x=42` at `y=20`. Both graphite sides
  stop at `y=15` and resume at `y=25`, leaving clear gaps around the divider.
- Chip contains an outlined highlight circle with a 5-unit radius, centered at `(17, 24)`
  toward the left of its capsule. A graphite line from `(29, 24)` to `(34, 24)` represents text
  on the right; there is no checkmark.
- Layout extends its highlighted dividers to the frame edges and interrupts the graphite
  frame at all three junctions to preserve clear gaps.
- Progress separates the two arcs at both junctions.
- Select centers both highlighted arrows at `x=33`, keeping their vertical alignment.
- Slider leaves visible gaps between its highlighted circles and graphite tracks.
- Tabs uses two matching 16-by-10-unit tab footprints at `y=7..17`: the highlighted front
  tab spans `x=7..23`, and the graphite rear tab spans `x=23..39`. The front tab occludes
  the rear tab's left side. The visible rear top starts at `(27.5, 7)`, leaving a clear gap
  above the tabs while retaining their shared size.
- Switch contains the highlighted circular thumb without a minus sign.
- TextField contains only the highlighted cursor inside its graphite outline.

## Selection behavior

The sidebar derives selection from the current route: the exact component path and its subroutes
select that entry. The selected component always uses its blue icon. Unselected component entries
use their gray icons, switching to blue while hovered. Both states retain the same graphite outline.

When hover ends, the icon returns to gray unless its entry is selected.
Gray indicates an unselected, navigable entry without hover.
Existing link styling and `aria-current="page"` continue to communicate the current page,
and existing focus behavior remains available.

These colors and the selection rule are independent of preset, theme, and the icon family
chosen for component examples.

## Export and consumption

Export the named native components with OpenPencil's SVG export into
[`public/showcase-icons/`](../../public/showcase-icons/):

- Selected: `<slug>.svg`.
- Unselected: `<slug>-inactive.svg`.

Export the component itself rather than its specimen tile or the whole board to preserve the
transparent square bounds. Both exports of a pair must match except for the highlight color.

[`ShowcaseSidebarIcon.tsx`](../../components/ShowcaseSidebar/ShowcaseSidebarIcon.tsx)
receives the entry's selection state and displays the matching SVG as a decorative image with
empty alternative text. The link label supplies the accessible name.

To revise a drawing, edit both native states in OpenPencil, save `Kiskadee.fig`, and re-export
the two components. Set the actual vector paint as well as its color-variable binding: changing
a variable alone can leave stale paint in an SVG export. Check both states at the 20-pixel menu
size and preserve matching geometry.

| Navigation label | SVG slug | Selected component ID | Unselected component ID |
| --- | --- | --- | --- |
| Accordion | `accordion` | `1792514109:47` | `1792514109:201` |
| Badge | `badge` | `1792514109:54` | `1792514109:208` |
| Button | `button` | `1792514109:61` | `1792514109:215` |
| Brand buttons | `brand-buttons` | `1792514109:68` | `1792514109:222` |
| BottomSheet | `bottom-sheet` | `1792514109:75` | `1792514109:229` |
| Card | `card` | `1792514109:82` | `1792514109:236` |
| Chip | `chip` | `1792514109:89` | `1792514109:243` |
| Dropdown | `dropdown` | `1792514109:96` | `1792514109:250` |
| Icon | `icons` | `1792514109:103` | `1792514109:257` |
| Layout | `layout` | `1792514109:110` | `1792514109:264` |
| Progress | `progress` | `1792514109:117` | `1792514109:271` |
| Select | `select` | `1792514109:124` | `1792514109:278` |
| Separator | `separator` | `1792514109:131` | `1792514109:285` |
| Slider | `slider` | `1792514109:138` | `1792514109:292` |
| Tabs | `tabs` | `1792514109:145` | `1792514109:299` |
| Switch | `switch` | `1792514109:152` | `1792514109:306` |
| TextField | `text-field` | `1792514109:159` | `1792514109:313` |
