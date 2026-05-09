# TextField Focus Transition Class Split

Status: deferred, not rejected.

## Context

Kiskadee previously used `k-state` as the shared class for interactive transitions. While tuning
TextField focus behavior, `k-state` was renamed to `k-trn` to better match the compact class naming
style used by newer structural classes.

During that change, we considered splitting focus-ring transition behavior into a dedicated class,
such as `k-trn-foc`. The idea was to keep regular interactive transitions and focus-ring transitions
separate.

## Considered Shape

```txt
k-trn
k-trn-foc
```

The intended meaning was:

- `k-trn`: regular interactive transitions.
- `k-trn-foc`: interactive transitions plus outline/focus-ring transitions.

## Why It Was Deferred

CSS `transition` declarations do not compose across classes. If an element used both `k-trn` and
`k-trn-foc`, the more specific focus selector would overwrite the base transition declaration.
That made the pair feel redundant when both classes were statically present on the same node.

The current need is also broad enough that a single transition class is simpler: `k-trn` can include
the focus-ring transition properties, and elements that do not use outline simply do not exercise
that part of the transition list.

This keeps the contract small for now:

```txt
k-trn
```

Focus-ring timing still uses the existing global motion values, especially `--k-dur-int-xfast` and
`--k-ease-out`. No new duration or easing token is introduced for this deferred idea.

## When To Revisit

Revisit a dedicated focus transition class if:

- focus-ring transitions need to be independently enabled or disabled per slot;
- many components need regular transitions but explicitly must not carry outline transition entries;
- a future motion contract needs different focus-ring timing per component family;
- static class presence becomes misleading enough that the extra class earns its cost.

Until then, `k-trn` remains the single shared interactive transition class.
