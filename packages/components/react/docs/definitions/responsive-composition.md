# Responsive Composition

Responsive behavior is not always a styling concern. Some responsive changes are pure visual
adaptations, while others change component composition, semantics, focus management, or interaction
models. Kiskadee should avoid treating every viewport decision as either "CSS only" or "React
runtime only".

This document is the starting point for future responsive composition decisions. When a new
component needs viewport-dependent rendering, use this document as the shared technical reference so
the codebase does not accumulate unrelated one-off solutions.

## Decision Layers

### Visual Responsiveness

Use schema-emitted artifacts and structural CSS when the same component DOM remains valid and only
visual properties change.

Examples:

- size,
- spacing,
- typography,
- radius,
- layout direction,
- width constraints.

In this layer, React runtime should not subscribe to viewport changes just to choose styles.

### Auxiliary Slot Visibility

Some slots are optional visual helpers. They do not own focus, do not change the accessible name,
and do not change the component's interaction model.

Examples:

- Switch `controlText` when it is `aria-hidden`,
- optional decorative state text,
- responsive helper text that is not part of form semantics.

For this layer, CSS-driven visibility is often preferable because the DOM shape can remain stable.
However, a local React runtime bridge can be acceptable when Kiskadee does not yet have a canonical
schema/artifact mechanism for responsive slot visibility.

If a second or third component needs the same kind of viewport-gated auxiliary slot, revisit this
document before adding another bespoke implementation. At that point, prefer a shared policy or
builder-supported mechanism instead of duplicating `matchMedia` logic across components.

### Adaptive Composition

Some responsive changes produce a different user experience rather than a smaller version of the
same component.

Example: a desktop navigation bar may show all items horizontally, while a mobile experience may use
a compact bar, overflow menu, bottom navigation, or hamburger menu.

This is not only a visual transformation. It can change:

- semantic structure,
- focus order,
- keyboard interaction,
- open/closed state,
- `aria-expanded` / `aria-controls`,
- popover or portal behavior,
- item visibility,
- screen-reader exposure.

For this layer, CSS-only hiding is usually not enough. Prefer an explicit runtime composition, a
higher-level adaptive component, or separate composed components that share state intentionally.

## Shared `isLikelyTouch` Environment

Some component choices are ergonomic rather than purely visual. A component may need to know whether
it should assume touch interaction even when the DOM stays the same.

The shared React web signal for this is `isLikelyTouch`. It means "prefer touch ergonomics", not
"the device definitely has a touchscreen".

Initial web resolution:

- iOS, iPadOS, and Android resolve to touch.
- Windows, Linux, macOS, and unknown desktop-like platforms resolve from viewport width.
- Viewports below `bp:lg:1` resolve to touch.
- Viewports at or above `bp:lg:1` resolve to non-touch.
- `KiskadeeContext.interactionEnvironment.isLikelyTouch` may override detection when an app has
  stronger environment knowledge.

Native platform runtimes should not copy the web viewport heuristic directly. iOS and Android
native components should resolve this signal as touch by platform default unless a future platform
adapter has stronger input-mode data.

## Shared `isCompactViewport` Environment

Some component choices are about available space rather than input ergonomics. A component may need
to move supporting content out of a crowded inline layout while keeping the same interaction model.

The shared React web signal for this is `isCompactViewport`. It means "prefer compact layout
composition", not "the device is a phone".

Initial web resolution:

- Viewports below `bp:md:2` resolve to compact.
- Viewports at or above `bp:md:2` resolve to non-compact.
- `KiskadeeContext.layoutEnvironment.isCompactViewport` may override detection when an app has
  stronger layout knowledge.

Keep this separate from `isLikelyTouch`. A large touch surface may not be compact, and a narrow
desktop window may be compact without being touch-oriented.

## Switch `controlTextVisibility`

The current styled React Switch supports the generated Switch component artifact option
`controlTextVisibility` with `none`, `largeOnly`, and `always`.

The `largeOnly` implementation uses `matchMedia` through `useSyncExternalStore` so the React
component can decide whether to render `controlText` at large viewports. This is acceptable as the
current local bridge because Kiskadee does not yet have a canonical responsive slot-visibility
mechanism in schema artifacts or structural CSS.

This implementation is not a blanket precedent for responsive composition. It should stay documented
as a local solution for an auxiliary, non-interactive, `aria-hidden` slot. If similar cases appear,
the team should use this document to decide whether to:

- keep the behavior local and justify it,
- move auxiliary slot visibility into CSS/schema artifacts,
- introduce a shared responsive slot policy,
- or model the behavior as adaptive runtime composition.

Different cases may require different solutions. That is acceptable when each solution is documented
and justified by its semantics, accessibility, and runtime cost.
