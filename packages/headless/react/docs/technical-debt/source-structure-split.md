# Source Structure Split

Status: completed.

## Context

`@kiskadee/react-headless` used to keep component folders and reusable hook/helper folders side by
side under `src`.

Old shape:

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

## Resolved Debt

The package now separates component ownership from reusable hook ownership.

That keeps these maintenance questions explicit:

- which folders expose component primitives;
- which folders expose reusable hooks or runtime utilities;
- where new headless hooks should live;
- whether a folder should be considered part of component API surface or shared infrastructure.

## Current Shape

The source layout is:

```txt
src/
  components/
    button/
    color-radio-group/
    select/
    swatch-radio-group/
    switch/
    tabs/
    text-field/
  hooks/
    checked-state/
    state-projection/
  index.ts
```

- components live under `src/components`;
- reusable hooks/runtime helpers live under `src/hooks`.

## Implementation Notes

- Public package subpaths are preserved through `package.json` exports, for example
  `@kiskadee/react-headless/switch` now points to `dist/components/switch/HeadlessSwitch.js`.
- The root `src/index.ts` remains the package aggregation entrypoint.
- Internal imports keep explicit `.ts` / `.tsx` extensions.
- Existing build globs still work because they traverse `src/**/*` and mirror the new folder shape
  into `dist/`.

## Trigger

This cleanup was triggered when the Switch migration made the boundary between semantic headless
state and reusable projection hooks more visible.
