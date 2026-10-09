# Visual transition helpers

Crossfade and Rotate are public p-react presentation helpers. They do not own
semantic state, colors, geometry tokens, Headless behavior, or preset schemas.
Their consumer supplies authored `durationMs` and `easing` (`ease-in`/`ease-out`).
Accordion supplies these from its own resolved global grow-height profile.

Both helpers accept `children`, native attributes, classes, refs, `as` (span by
default, div for block content), and `motion` (true by default). Their shared
Motion module is lazy-loaded; only that module imports the animation engine.
Initial rendering, disabled/reduced motion and loading/failure fallback apply the
current visual state immediately. Loading the module does not replay changes.
Unmounting or changing the target cancels the previous animation.

## Crossfade

`transitionKey` is required and explicitly identifies an intended content swap.
Updating children with the same key updates the current rendering without a fade.
On key change, the previous snapshot and new snapshot overlap in one grid cell;
the previous layer is inert and aria-hidden. Completion removes the old layer.
Rapid changes retain at most the latest two snapshots and ignore outdated finishes.
The grid occupies the intrinsic size of both snapshots during the transition;
Crossfade does not animate height or guarantee a fixed footprint.

This is a visual replacement helper, not a focus manager or a persistent content
host. Use it for icons, labels, illustrations, or other presentation. Callers must
manage focus when replacing interactive content and avoid duplicate DOM IDs across
snapshots. A changed key replaces the child identity; it is not a guarantee that
stateful children survive after their outgoing snapshot is removed.

## Rotate

`angle` is the target angle in degrees, including values such as 45 or 180.
Rotate keeps the same child identity and owns its wrapper transform. Consumer
styles must not independently animate or overwrite that transform. Retargeting
uses Motion's current animated value, so rapid reversal stays interruptible.
There is no competing CSS transform transition.

## Accordion integration

`options.indicatorTransition` declares the preset default (Fluent: `rotate`).
The instance prop overrides it with `rotate`, `crossfade` or `none`; none swaps
the down/up glyphs immediately without a visual helper.
This is a presentation option on the React consumer, not a new visual palette.
Indicator modes are independent of Accordion's `motion` switch, which controls
only panel height. Animated indicator modes use the current enter/exit timing
and respect reduced motion through their helpers.
Height animation is independent; changing indicator mode does not change panel
semantics, focus, or retained child state. SmoothText remains unchanged.

The Accordion Showcase exposes both indicator modes and an independent helper
example. Imports are available through the package root and crossfade/rotate
subpaths. The standalone helpers do not require a Kiskadee provider.
