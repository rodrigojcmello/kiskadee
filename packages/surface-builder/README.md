# Surface Builder

Generate the portable Surface Context data with:

```sh
pnpm --filter @kiskadee/surface-builder build
```

The Node pre-build writes `generated/surface-contexts.json` in the directory of each authored
preset. For example, the [Fluent companion](../presets/src/presets/fluent-2-microsoft/generated/surface-contexts.json)
is checked in alongside the Fluent schema and distributed with it. After updating a preset or
its derivation, run the command above and include the generated changes in the same commit.
To compare all companions byte for byte with fresh derivations without rewriting them, run:

```sh
pnpm --filter @kiskadee/surface-builder check
```

Each file keeps readable field names,
including all authored and derived Surface Context maps and canonical surface catalogs. It carries
`formatVersion: 1` and the preset key, version and deterministic SHA-256 revision of its authored
Schema. The build-time reader validates that identity and compares the stored bytes with a fresh
derivation before returning the map. The authored Schema remains a separate input.

## Derivation

The preset can opt in to derivation from `e1.boxColor`. Resolve effective paint, including
Standard/Alternative inheritance, for each available segment and theme. Resolve exactly one
opaque Container Rest backdrop from `onSubtle.standard` for each of the catalog's
`referenceFor: 'onSubtle'` and `referenceFor: 'onVivid'` markers.

- An absent or fully transparent effective fill produces `inherit`.
- Composite partial alpha over the backdrop marked for the consumed Surface Context.
- Classify the resulting fill against absolute white in Light or absolute black in Dark and
  Darker. A ratio of at least 3:1 produces `onVivid`. A lower ratio produces `onSubtle`.
- Preserve the existing Rest fallback for missing state fills. Button and CardAction classify
  Selected, Pending and Disabled paint in addition to Rest, using the existing state precedence.
- A derived Container classifies Rest and supplies that result to its catalog and to its linked
  Card. CardAction classifies state-specific paint after the Card inherits Rest.

The contrast threshold selects a semantic surface for descendants. Text and icon contrast need
separate checks. A translucent fill's classification represents its canonical backdrop. A custom
background can produce another painted color under the same semantic context.

The [Web resource publisher](../web-builder/docs/definitions/component-resources.md#palette-surface-configuration)
reads this file with the preset and emits the selected portions in compact palette descriptors.
Native exporters can use the same portable data. The file is a build input for platform publishers.
