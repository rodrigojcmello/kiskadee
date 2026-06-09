# Color Architecture

Kiskadee implements a robust 3-layer color architecture designed to provide
maximum flexibility while maintaining semantic consistency across components.
This system allows design systems to be fully customizable without sacrificing
the benefits of inheritance and cascading changes.

## Overview

```
Layer 1: Primitive Colors  ->  Layer 2: Global Semantics  ->  Layer 3: Component Intents
---------------------------------------------------------------------------------------
red                        ->  redLike                   ->  Button.destructive
                                                        ->  Badge.attention

green                      ->  greenLike                 ->  Button.positive

purple                     ->  purpleLike                ->  Badge.new

blue                       ->  primary                   ->  Button.primary

gray                       ->  neutral                   ->  Button.neutral
```

## DS Adaptation Checklist

Use this checklist when mapping any design system into Kiskadee. It clarifies
what belongs to primitives, global semantics, and component intents, and avoids
introducing redundant semantic keys.

| Question | Mapping |
|----------|---------|
| Is the color a global role (brand, neutral, status)? | Layer 2 (global semantics). |
| Is the color a component-specific role? | Layer 3 (component intents). |
| Is the color a brand support/auxiliary tone of the primary? | Use `primary.v2` (same semantic, different variant), not a new semantic. |
| Is the color a surface/background structure (surface, container, outline, on-surface context)? | Use `neutral` (`v1`/`v2`) and control emphasis via tone. |
| Is the color a state/attention role (error, success, warning, novelty)? | Map to `redLike`, `greenLike`, `yellowLike`, `purpleLike` in Layer 2. |
| Are you seeing "secondary/tertiary" in the design system? | Treat them as variants of existing semantics, usually `primary.v2` and sometimes `neutral.v2`, rather than new semantic keys. |

Short rule: semantics are global, emphasis is own-surface strength, variants
are tone families, and components interpret meaning.

## Core Mental Model

This is the conceptual baseline used to adapt any design system into Kiskadee:

- Layer 1 (Primitive): pure hues and tonal ramps. No meaning, just color
  families.
- Layer 2 (Global Semantics): meaning that is system-wide
  (`primary`/`neutral`/`redLike`/etc.).
- Layer 3 (Component Intents): component-specific meaning (`button.primary`,
  `badge.attention`, etc.).
- Emphasis: own-surface strength (`high` -> `lowest`). It is not a local theme
  mode; it describes how strong the component's own surface is within the same
  semantic family. See `component-intents.md` for the canonical Button/Card
  mapping and the unresolved `lowest` decision.
- Variants (`v1`/`v2`): alternate ramps within the same semantic family, such as
  primary support tones. Variants are not new semantics.

Interpretation rules:

- If the role is global (brand, neutral, status), it belongs to Layer 2.
- If the role is component-specific or contextual, it belongs to Layer 3.
- If the role is surface/background structure, it is neutral + emphasis, not
  primary.
- If the role is secondary/tertiary, it is usually a semantic variant, not a new
  semantic.

## How the Cascade Works

The 3-layer system uses object references, meaning changes automatically
propagate through the chain:

```
red (Layer 1)
  -> (referenced by)
redLike (Layer 2)
  -> (referenced by)
Button.destructive (Layer 3)
Badge.attention (Layer 3)
```

## Customization Scenarios

| Scenario | Action | Result |
|----------|--------|--------|
| Adjust red tone globally | Modify `red` color value | Everything using `redLike` updates automatically |
| Use orange instead of red | Set `redLike = orange` | All red-like semantics become orange |
| Purple badge, red button | Set `badge.attention = purpleLike` | Only badge changes; button stays red |
| Direct color assignment | Set `badge.attention = purple` | Badge uses purple directly, skipping `-like` layer |

## Smart Defaults

Zero configuration is required to start. Everything comes pre-configured:

```
red -> redLike -> destructive (Button)
               -> attention (Badge)

green -> greenLike -> positive (Button)

purple -> purpleLike -> new (Badge)
```

Designers and developers can use the system immediately without understanding
all three layers. The layers exist for when customization is needed, not as a
barrier to entry.

## Type Definitions

```typescript
// Layer 1: Primitive colors (for palette generation)
type BaseColor =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'teal'
  | 'cyan'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'brown'
  | 'black';

// Layer 2: Global semantics (already in @kiskadee/core)
type SemanticColor = 'primary' | 'neutral' | 'redLike' | 'greenLike' | 'yellowLike' | 'purpleLike';

// Layer 3: Component intents (defined per component)
type ButtonIntent = 'primary' | 'neutral' | 'destructive' | 'positive';
type BadgeIntent = 'primary' | 'neutral' | 'attention' | 'new';

// Intent values can reference either layer
type IntentValue = SemanticColor | BaseColor;

// Configurable mapping per preset
type IntentMapping = {
  button: Record<ButtonIntent, SemanticColor>;
  badge: Record<BadgeIntent, SemanticColor>;
};
```

## Visual Reference

```
+-----------------------------------------------------------------------------+
|  Layer 1               |  Layer 2                |  Layer 3                 |
|  (Primitive Colors)    |  (Global Semantics)     |  (Component Intents)     |
+-----------------------------------------------------------------------------+
|  red              |  redLike -----------+--> Button.destructive             |
|                   |           +---------+--> Badge.attention                |
|                   |                     |                                  |
|  green            |  greenLike ---------+--> Button.positive                |
|                   |                     |                                  |
|  purple           |  purpleLike --------+--> Badge.new                      |
|                   |                     |                                  |
|  blue             |  primary -----------+--> Button.primary                 |
|                   |                     |                                  |
|  gray             |  neutral -----------+--> Button.neutral                 |
+-----------------------------------------------------------------------------+
```

## Philosophy

> The system is progressively revealed: simple for those who want to use it,
> powerful for those who want to customize it.

This architecture solves the tension between flexibility and practicality in
design systems:

- Flexibility: any color can be swapped at any level.
- Semantic consistency: colors maintain meaning across the system.
- Context awareness: same color, different meaning per component.
- No forced symmetry: components only support intents that make sense for them.
- Cascade by default: changes propagate automatically.
- Override when needed: any level can be customized independently.
