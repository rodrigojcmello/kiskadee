# Button emphasis fallback

**Decision (2026-11-23).** Deferred. The Fluent Dark Button can express its current
priorities with four authored levels and two color variants. That use case alone does
not justify extra resolution logic, memory or artifact data for every consumer.

## Current behavior

Omitting Button emphasis selects Medium. An explicit Lowest with no matching paint
class yields an empty color-class contribution for that part. The Button still renders
its structure and sizing. Ordinary Button paint does not search other emphasis levels.
The internal divider has a local Neutral Medium fallback. Selection and Alternative
have separate recipe-availability rules. None defines inheritance between emphasis levels.
See the [Button class resolver](../../packages/components/react/src/components/Button/Button.class-names.ts)
and [shared lookup](../../packages/components/react/src/shared/class-resolution/classNames.ts).

## Candidate if a concrete use case emerges

Resolve emphasis once for the whole Button, within the same semantic intent, theme and
surface. The proposed search orders are Highest → High → Medium and Lowest → Low → Medium.
High and Low would each try Medium directly. All parts and the context supplied to children
would use the effective emphasis together. Parts may intentionally omit paint for a level.
Defaulting an omitted prop to Medium does not guarantee that every published intent has
a usable Medium recipe. Define that guarantee or the behavior at the end of the search first.

## Artifact and runtime trade-off

The [metadata builder](../../packages/web-builder/src/phase-7-publish-metadata/publishMetadata.ts)
already aggregates Standard states by segment, theme, surface, intent and emphasis across
elements. A label alone can contribute a level to that union. The class map separately
records actual paint classes per element, and Alternative coverage is published separately.
Decide what counts as a publicly supported Button emphasis before using any of those as
the fallback criterion.

Options discussed were a component-level lookup using already-loaded metadata, a compact
build-time alias to an existing recipe, or a dedicated per-component capability artifact.
A standalone list of intents would also need emphasis coverage to answer this question.
A separate resource adds transfer and loading costs if fetched independently. Scanning
every slot for every render also has a cost. Revisit with a real cross-theme or cross-preset
composition, then measure payload and render cost before choosing a representation.
