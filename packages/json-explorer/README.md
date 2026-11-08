# JSON Explorer

Private standalone workspace application for inspecting a TypeScript contract and an optional
JSON reference. The initial example is the Button from Fluent 2 Microsoft, including its Teams
segment. The tool is independent of Showcase, component rendering and preset artifact builds.

## Run locally

Use the repository's Node version and install workspace dependencies with PNPM, then run from the
repository root:

```sh
pnpm --filter @kiskadee/json-explorer dev
```

Open `http://127.0.0.1:3002`. The command prepares the current inspection document before starting
Next.js. Graph starts with the Button root selected and its four properties visible. Reference
JSON starts enabled; its switch shows the same contract with or without the supplied values.

After changing the inspected source or reference, regenerate the document:

```sh
pnpm --filter @kiskadee/json-explorer inspect
```

During development, the application reloads regenerated data without a request for every node. Generated inspection
files are local, ignored outputs; they do not become a second authoring source or update preset
artifacts. The example reads the authored `schema.components.button` in Node rather than a
possibly stale Web Builder debug dump.

The initial configuration is `examples/fluent-button.ts`: `fluentButtonConfig` selects the
typed `schema` export and `components` / `button` path, while `loadFluentButtonReference` supplies
the optional value. The generic extractor accepts an entry file, export name, optional property
path and `tsconfig`; the browser has no Fluent-specific extraction rules.

`inspect` writes the ignored `public/inspection/fluent-button.json` and updates a generated
revision marker. Next.js observes that marker to reload the document during development. There
is no polling server or per-node data fetching.

Failed extraction reports an error in the command and does not publish a partial contract. The
last successfully generated document remains available. Production preview uses the document
prepared by `build`; run a new build when preparing a different production snapshot.

## Explore

- **Graph:** select a card for details, use its separate `+`/`-` control to reveal children, and
  navigate the fixed-scale area with scrolling or Space + drag. Cards keep their natural height;
  connections use centered output ports.
- **Columns:** select a card to reveal its description and children. Four desktop positions show
  the current branch. The selected ancestor moves first; choosing another ancestor replaces its
  descendants. Arrows navigate levels of this branch rather than a history.
- **Reference JSON:** values supplement the type instead of determining its properties. Switching
  the reference preserves valid navigation; switching Graph/Columns starts navigation again while
  retaining loaded inputs and the reference choice.

The primary label is the property key. A secondary label prefers JSDoc `@summary`, then the
configured textual reference field (`name` in this example). An absent summary does not create
an invented label. The expanded description remains separate.

## Architecture and boundaries

The generic inspection model, Node-only extraction and browser UI have distinct ownership.
TypeScript 6.0.3 reads resolved types and JSDoc without executing the inspected source. Only the
explicit example reference adapter imports the preset value. React receives the derived model
and optional JSON, not the compiler or preset implementation. HTML/CSS render the cards, SVG
renders connections and Dagre positions measured nodes.

The [inspection contract](docs/definitions/inspection-contract.md) is the source of intended
behavior. Repository [governance](../../docs/definitions/project-governance.md) defines authority
and dependency direction. The [OpenPencil design archive](design/README.md) provides visual
references; its older PNGs predate the natural-height correction to the saved design.

This first version is a local desktop tool. It does not edit data, choose files through the UI,
publish an npm package or run upstream builds. It does not prove complete JSON validity or that a
declared property is used by a runtime.

## Checks

```sh
pnpm --filter @kiskadee/json-explorer test
pnpm --filter @kiskadee/json-explorer typecheck
pnpm --filter @kiskadee/json-explorer build
```

Use the repository's Biome and whitespace checks for changed files. Browser validation covers
both modes, the reference switch, deep navigation, keyboard behavior and measured card geometry.
The commands above describe the package workflow; actual validation results belong in the
implementation handoff.

`typecheck` prepares the local document and Next route declarations first, so it also works in a
fresh checkout without checked-in generated files.
