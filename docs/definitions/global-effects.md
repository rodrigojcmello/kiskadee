# Global Effects

Status: living definition.

Use this document when adding or reviewing a cross-component effect under
`global.effects`. The key rule is that `global.effects` is not one inheritance
model. Some effects define reusable behavior defaults. Other effects define a
standardized value catalog that components must opt into with an explicit
recipe.

## Two Global Effect Shapes

### Behavioral Effects

A behavioral effect owns shared runtime behavior. Its global definition can
include defaults that a component inherits when it enables the effect.

`activationFeedback` is the current example:

```ts
global: {
  effects: {
    activationFeedback: {
      profile: 'ripple',
      origin: 'pointer',
      visual: {
        layer: 'overlay',
        paint: 'field',
        tone: { default: 'subtle' }
      },
      profiles: {
        ripple: { size: 'auto', animateSize: true },
        halo: { size: 80, animateSize: false }
      }
    }
  }
}
```

For this kind of effect:

- global schema may define the default behavior;
- component schema may select a profile or override only the parts it needs;
- merge inheritance is intentional;
- the component can be enabled by default when the effect is part of its
  ordinary interaction model;
- local runtime props normally disable or preview the effect, instead of
  choosing every visual value from scratch.

`activationFeedback` follows this model because a component that uses it needs
the same shared behavior language: profile capability, runtime mode, origin,
paint, layer, and tone resolution.

### Catalog Effects

A catalog effect owns a standardized value library. Its global definition does
not say which values are active on a component. A component must provide its own
recipe that maps the component's interaction states to one value from the
catalog.

`shadow` follows this model:

```ts
global: {
  effects: {
    shadow: {
      outer: {
        levels: {
          's:sm:1': { x: 0, y: 1, blur: 3, spread: 1, color: [0, 0, 0, 0.15] },
          's:md:1': { x: 0, y: 2, blur: 6, spread: 2, color: [0, 0, 0, 0.15] }
        }
      },
      inner: {
        levels: {
          's:sm:1': { x: 0, y: 1, blur: 2, spread: 0, color: [0, 0, 0, 0.22] }
        }
      }
    }
  }
}
```

For this kind of effect:

- global schema is a catalog, not a default application recipe;
- components must explicitly choose which level is used for each state;
- no component should activate every catalog value just because the catalog
  exists;
- catalog keys should reuse Kiskadee's canonical size scale where the effect is
  size-like;
- global shadow levels are split into `outer` and `inner` catalogs so presets can
  reuse canonical inset shadows without inventing component-local numeric values;
- local runtime props normally opt into the effect.

## Shadow Direction

`shadow` is an opt-in, stateful elevation effect for one or more explicit target
elements of a component. It is not a catch-all place for every `box-shadow` used
by a component.

Use `effects.shadow` when the shadow is activatable, dismissible, or stateful:

- Button elevation that appears only when `shadow` is enabled;
- Card elevation that can be rendered with or without shadow;
- Switch thumb shadow when it changes by interaction or control state.

Do not use `effects.shadow` for a fixed anatomical shadow that is part of a
component's construction and is not a public on/off effect. A fixed Tabs shell
shadow can still reuse shadow tokens in the future, but it should not become an
opt-in `effects.shadow` recipe only because it uses `box-shadow`.

Static shadow and `effects.shadow` are mutually exclusive for a single rendered
element. If an element's shadow is fixed anatomy, model it through the static
component styling contract. If the same element needs shadow that can appear,
disappear, or change by state, model that element with `effects.shadow` instead
of also adding a static shadow path.

Known follow-up: the current Tabs bridge projects a fixed shell shadow through
the effect bucket `e.h` and the `-e` activator. That mixes static component
anatomy with effect infrastructure and should be resolved separately from the
Switch thumb-shadow work.

## Shadow Component Recipe

A component that supports shadow must declare each target element explicitly and
map that element's states to one level from the matching catalog.

```ts
components: {
  button: {
    effects: {
      shadow: {
        e1: {
          kind: 'outer',
          states: {
            rest: 's:md:1',
            hover: 's:lg:1',
            focus: 's:lg:1',
            pressed: false,
            disabled: false
          }
        }
      }
    }
  }
}
```

Rules:

- each key under `effects.shadow` is the generated element that receives that
  shadow recipe;
- `kind: 'outer'` resolves levels from `global.effects.shadow.outer.levels` and
  emits a normal `box-shadow`;
- `kind: 'inner'` resolves levels from `global.effects.shadow.inner.levels` and
  emits `box-shadow: inset ...`;
- each state value references a global shadow level in the recipe kind's catalog
  or uses `false`;
- `false` inside a state means "emit a zero shadow for this state" so it can
  override the rest shadow and transition cleanly;
- global levels contain exactly one shadow layer; multi-layer arrays are not
  supported in the global shadow catalog;
- `spread` is supported per layer and defaults to `0` when omitted;
- the absence of the runtime prop means the component does not add the shadow
  bucket or the shadow activator class;
- shadow should stay opt-in by default in React components such as `Button` and
  `Card`.

The state recipe is flat. It maps each canonical interaction or projected state
to one shadow level or to `false`; it does not define a nested selected-state
matrix. For example, a Switch thumb can use:

```ts
components: {
  switch: {
    effects: {
      shadow: {
        e2: {
          kind: 'inner',
          states: {
            rest: 's:sm:1',
            disabled: false
          }
        },
        e3: {
          kind: 'outer',
          states: {
            rest: 's:sm:1',
            hover: 's:md:1',
            disabled: false
          }
        }
      }
    }
  }
}
```

This expresses a track with an inner shadow and a thumb with a base outer shadow,
a stronger thumb shadow on hover, and no shadow when disabled. If a state should
use the same shadow as `rest`, omit it from the recipe instead of adding a
duplicate state override. This keeps combined states such as selected hover from
competing with the hover override. State-level `false` is the way to remove
shadow for states such as `disabled`, including disabled selected controls.

Components can also expose a fixed-level mode when the component is not
interactive and the consumer should choose one catalog level directly:

If a shadow target is not the same DOM element that owns the component
interaction state, the component runtime must project the relevant state
activator classes onto that target element. The shadow CSS emission expects the
shadow bucket, `-e`, and state activators to match on each rendered target; it
does not infer parent-state selectors for shadow.

```ts
components: {
  card: {
    effects: {
      shadow: {
        e1: {
          kind: 'outer',
          states: {
            rest: 's:sm:1',
            hover: 's:md:1',
            focus: 's:sm:1',
            pressed: false,
            disabled: false
          },
          fixedLevels: ['s:sm:1', 's:md:1', 's:lg:1', 's:lg:2', 's:lg:3']
        }
      }
    }
  }
}
```

For Card, the two public modes are intentionally separate:

```tsx
<Card shadow="s:lg:1" />
<CardAction shadow />
<Card shadow="s:lg:1" preserveBorderWithShadow={false} />
```

The static Card uses a fixed catalog level. CardAction uses the component's
state recipe and native/projected interaction states. A single element should
not mix a fixed level and a state recipe at runtime.

Shadow does not remove the Card border by default. Card exposes
`preserveBorderWithShadow` as a local React composition prop because border and
shadow can both act as visual separation in product UI. When this prop is
`false` and a shadow class is actually resolved, Card applies a structural class
that preserves the schema border width and makes only the border color
transparent.

## Material 3 Google Elevation Mapping

`material-3-google` maps the Material 3 Light elevation levels from the
Material 3 Design Kit Community Figma file into Kiskadee's canonical size scale:

| Kiskadee level | Material elevation | CSS layer |
| --- | --- | --- |
| `s:sm:1` | Elevation 1 | `0 1px 3px 1px rgba(0,0,0,.15)` |
| `s:md:1` | Elevation 2 | `0 2px 6px 2px rgba(0,0,0,.15)` |
| `s:lg:1` | Elevation 3 | `0 1px 3px 0 rgba(0,0,0,.30)` |
| `s:lg:2` | Elevation 4 | `0 2px 3px 0 rgba(0,0,0,.30)` |
| `s:lg:3` | Elevation 5 | `0 4px 4px 0 rgba(0,0,0,.30)` |

The Material source defines two-layer elevation shadows. Kiskadee currently keeps
the first layer only because the global shadow catalog is a single-layer
contract.

The current Material Button and CardAction recipe is:

```ts
{
  rest: 's:sm:1',
  hover: 's:md:1',
  focus: 's:sm:1',
  pressed: false,
  disabled: false
}
```

## Fluent 2 Microsoft Shadow Mapping

`fluent-2-microsoft` currently exposes the single shadow found in the Microsoft
Fluent 2 Web Community Figma file as the medium catalog level:

| Kiskadee level | Figma style | CSS layer |
| --- | --- | --- |
| `s:md:1` | Shadow 04 | `0 2px 4px 0 rgba(0,0,0,.14)` |

## Apple 26 Shadow Mapping

`ios-26-apple` temporarily registers every unique shadow found across the
provided iOS 26 and macOS 26 Figma nodes so the Showcase can compare them in
practice. The iOS menu material blur node is intentionally excluded because it
is material/backdrop blur, not a box-shadow layer.

| Kiskadee level | Source | CSS layer |
| --- | --- | --- |
| `s:sm:1` | iOS content area | `0 0 16px 0 rgba(0,0,0,.20)` |
| `s:md:1` | macOS utility panel | `0 5px 20px 0 rgba(0,0,0,.30)` |
| `s:lg:1` | iOS iPad popover | `0 10px 50px 0 rgba(0,0,0,.30)` |
| `s:lg:2` | macOS window | `0 16px 48px 0 rgba(0,0,0,.35)` |
| `s:lg:3` | iOS window | `0 20px 76px 0 rgba(0,0,0,.20)` |

Do not add a `none` level to the canonical shadow scale. No shadow is not a
size. Component-level opt-in turns the effect on or off, while state-level
`false` emits a zero-value override when an active effect needs to remove shadow
for a specific state.

## Default Enablement

Effect defaulting is part of the effect shape.

Behavioral effects can be default-on when the effect is part of the component's
standard interaction model. `activationFeedback` is expected to run unless the
runtime explicitly disables it.

Catalog effects should be default-off unless a separate component variant or
semantic contract says otherwise. For shadow, a plain component instance should
not become elevated only because the selected design system defines levels under
`global.effects.shadow.outer.levels` or `global.effects.shadow.inner.levels`.

```tsx
<Card />
<Card shadow />
<Card shadow="s:lg:1" />
```

The first card renders without the opt-in shadow effect. The second card uses
the component recipe when the Card surface is interactive or recipe-driven. The
third card uses a fixed catalog level for a static surface.

If a design system needs an always-elevated component, model that as a variant,
mode, or separate component decision. Do not make the global shadow catalog
implicitly enable elevation for every consumer.

## Future Effect Checklist

Before adding a new global effect, answer these questions:

- Is the global definition behavior that components can inherit, or a catalog of
  values that components must map explicitly?
- Is the effect part of the component's normal interaction model, or is it an
  opt-in visual affordance?
- Does the effect apply to one target element, several elements, or an internal
  runtime layer?
- Should missing component configuration inherit global behavior, or should it
  mean the component has no recipe?
- Does state-level `false` disable CSS generation, or does it need to emit a
  zero/reset value for transitions and overrides?
- Is the visual a public/stateful effect, or fixed component anatomy?

Do not copy the `activationFeedback` inheritance model into a future effect just
because the effect lives in `global.effects`. Choose the model that matches the
effect's semantics.
