# Source Structure Split

Status: deferred cleanup.

## Context

`@kiskadee/react-headless` currently keeps component folders and reusable hook/helper folders side by
side under `src`.

Current shape:

```txt
src/
  button/
  color-radio-group/
  select/
  state-projection/
  swatch-radio-group/
  tabs/
  text-field/
  index.ts
```

That shape became less clear after `useStateProjection` was introduced. The `state-projection`
folder is hook/runtime infrastructure, while the neighboring folders are headless components.

## Debt

The package does not clearly separate component ownership from reusable hook ownership.

This makes it harder to answer basic maintenance questions:

- which folders expose component primitives;
- which folders expose reusable hooks or runtime utilities;
- where new headless hooks should live;
- whether a folder should be considered part of component API surface or shared infrastructure.

## Desired Shape

Move toward an explicit source layout:

```txt
src/
  components/
    button/
    color-radio-group/
    select/
    swatch-radio-group/
    tabs/
    text-field/
  hooks/
    state-projection/
  index.ts
```

The exact folder names can still be revisited, but the important split is:

- components live under `src/components`;
- reusable hooks/runtime helpers live under `src/hooks`.

## Implementation Constraints

- Preserve public package exports.
- Preserve generated `dist` entrypoints or provide compatibility shims if entrypoint paths change.
- Update internal imports with explicit `.ts` / `.tsx` extensions.
- Update package build scripts only if the existing glob behavior stops being enough.
- Update tests and focused validation commands after the move.
- Avoid bundling this cleanup into behavior changes.

## Trigger

Do this cleanup when the headless package gets another reusable hook, or when Button/Tabs begin using
the state projection model and the distinction between component folders and hook folders becomes
more important.
