# Surface Context

Status: canonical p-react definition.

Surface Context tells a component what kind of semantic surface is immediately behind it. It lets
nested components select the correct authored palette without inspecting concrete colors,
luminance, generated classes, or DOM ancestry.

[Theme and Surface Context](../../../../../docs/definitions/theme-and-surface-context.md) are
independent recipe coordinates. `SurfaceContextProvider` changes only the consumed semantic
surface; it does not select a theme. This definition owns their React resolution and propagation,
while the cross-package decision owns the distinction between the axes.

## One Context, Two Roles

There is one React Context and it transports one value: `onSubtle` or `onVivid`. The two names below
describe input and output roles; they are not separate React Contexts and are not two fields stored
in the Provider.

- `surfaceContext` is the semantic surface a component consumes. The prop is an optional explicit
  override for that component.
- The selected component palette publishes descendant outputs. A component with multiple
  painted regions looks up the output for each element. Existing primary-surface readers use
  the corresponding `contentSurfaceContext` map.

`contentSurfaceContext` is serialized configuration, not a Provider value. At runtime the component
selects one output from that map and publishes the resulting single value through
`SurfaceContextProvider`.

## Input Resolution

`useSurfaceContext(explicitSurfaceContext)` resolves input in this order:

```text
explicit surfaceContext prop
  -> nearest SurfaceContextProvider
  -> onSubtle portability default
```

The explicit prop changes what the current component consumes. It does not mutate an ancestor and
does not automatically prescribe the surface that component creates for its children.

A local theme scope uses the existing `KiskadeeContext.Provider` with resources and generated
classes compatible with that theme. For example, a Dark vivid region can be composed among Light
regions when both theme scopes are supplied correctly. Its `SurfaceContextProvider` may publish
`onVivid`, but does not perform the theme or resource switch; changing only `theme` in the
Kiskadee context value while retaining incompatible resources is not sufficient.

## Produced Surface Resolution

A component that paints a uniform semantic surface for independent descendants resolves its
serialized map through this path:

```text
segment
  -> theme
  -> consumed surface context
  -> color variant
  -> intent
  -> emphasis
  -> state output
```

Output precedence is `disabled > pending > selected > rest`. Missing state output inherits Rest;
missing map branches and explicit `inherit` preserve the consumed context. Runtime resolution does
not invent an `onSubtle` color fallback when the active preset lacks `onVivid` classes.

Nested paint may depend on the underlying parent's actual recipe. A regional map can include
an override keyed by the parent's consumed surface, color variant, effective intent, effective
emphasis, and stable state. React selects the published override when it covers the local
coordinate and otherwise uses the ordinary region map. Only the final semantic context is
passed to independent descendants.

CardAction uses the selection state resolved by headless-react, including uncontrolled selection,
and accounts for native or projected disabled state before publishing its output. The visual layer
does not maintain a second selection state.

## Recursive Composition

Propagation is recursive because each surface-owning component repeats the same local operation:

1. consume the nearest input context;
2. use that input to style itself;
3. resolve the semantic surface it creates;
4. publish that one output to its descendants.

This is not an automatic light/dark inversion rule. A vivid surface may produce another vivid
surface, a subtle surface may produce another subtle surface, and a transparent surface normally
publishes `inherit`. Each output follows the preset's authored map or its opted-in derivation policy.

For example, this chain is valid when its active preset authors these outputs:

```text
Page                                    consumes onSubtle
└─ Primary Card                         produces onVivid
   └─ Neutral Card                      produces onSubtle
      └─ Primary Card                   produces onVivid
         └─ light Button                produces onSubtle
            └─ inline Badge             consumes onSubtle
```

The nesting depth is not special. Every Provider shadows only its own descendant branch, and an
explicit `surfaceContext` prop can override one consumer at any depth. Consumers should choose an
explicit value only when they intentionally know more than the nearest semantic surface owner.

## Component Boundaries

Button, Chip, and Card publish the descendant surface of their painted regions. Card's
`canonicalSurfaces` catalog documents recommended recipes and ordering. The runtime reads only the
published output map to propagate Surface Context.

Optional Button BrandPacks supply paint for their own `brand.*` intents. A brand intent with
no published surface output retains the surrounding context, even when a system intention
with the same emphasis provides a different result.

`Button.Badge` routes context by placement. Inline placements remain inside Button's produced
surface. External placements republish the surface consumed by Button because their Badge renders
outside that produced surface. An explicit `surfaceContext` on Badge still wins over either
Provider; the relation never detects color, luminance, or DOM paint.

The independent Dropdown.Content and BottomSheet portals start on a subtle backdrop. Each
painted panel publishes its calculated result, and each item publishes the result of its
own stable state on that panel. An inline Dropdown.Content keeps the local backdrop.
Dropdown.Surface used directly in a Select listbox or Menu resolves its regional map against
that composition's input. Transparent geometry preserves that input. The closed Select
resolves the control, then the trigger, for its rich value or placeholder.

## Custom And Mixed Surfaces

Kiskadee does not measure background color. A consumer that creates a uniform custom vivid region
must wrap that region in `SurfaceContextProvider value="onVivid"`; a uniform ordinary region uses
`onSubtle`. Images, gradients, and mixed surfaces should be divided into explicit semantic regions
when possible. If two values become insufficient for proven product cases, the vocabulary must be
extended deliberately rather than inferred from pixels.

## Ownership

- Core owns the semantic vocabulary and serialized map shape.
- Presets author the output transitions or opt in to build-time derivation for supported components.
- Surface Builder materializes the maps for platform publishers. Web Builder packs the selected
  component palette, and the consumer decodes it into the shared map shape before React uses it.
- headless-react owns resolved interaction state but has no visual surface policy.
- p-react consumes artifacts, resolves the current output, and publishes Providers.
- Consumers declare semantic context only for surfaces they create outside Kiskadee components.

See the cross-package [Badge and Chip contract](../../../../../docs/definitions/badge-chip-contract.md)
and the repository [Surface Context term](../../../../../docs/definitions/nomenclature.md#surface-context).
