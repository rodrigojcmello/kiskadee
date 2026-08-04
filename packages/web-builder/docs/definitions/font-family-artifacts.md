# Font Family Artifacts

## Ownership

The schema describes recommended families as a catalog plus semantic role selections:

```ts
global: {
  fonts: {
    families: {
      inter: { stack: ["Inter", "Arial", "sans-serif"] }
    },
    roles: {
      body: "inter"
    }
  }
}
```

The schema does not describe URLs, files, `@font-face`, package imports, or runtime preparation.
Those concerns belong to the host application and optional runtime resources.

## Generated outputs

When `global.fonts` exists, the Builder publishes the authored catalog and roles unchanged under
`fonts` in `global.kiskadee.json`.

`manifest.json` publishes only the explicitly selected family IDs:

```json
{
  "fonts": {
    "body": "inter"
  }
}
```

The manifest intentionally does not duplicate family stacks. Consumers that need the catalog load
`global.kiskadee.json`.

`tokens.kiskadee.css` resolves the selected stacks into the Web contract:

```css
:root {
  --k-font-body: Inter, Arial, sans-serif;
  --k-font-heading: var(--k-font-body);
  --k-font-code: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
}
```

- An omitted `heading` role reuses `--k-font-body`.
- An omitted `code` role uses the canonical system monospace stack without creating a catalog ID.
- An explicit `heading` or `code` role resolves the corresponding catalog stack.
- An absent `global.fonts` emits no font custom properties, preserving host inheritance.

## CSS serialization

`toCssFontFamily` accepts any non-empty `FontStack`. Generic family keywords and safe CSS
identifiers stay unquoted. CSS-wide keywords, punctuation, quotes, backslashes, and control
characters are quoted or escaped so an arbitrary valid schema name cannot break the declaration.
The platform-agnostic schema therefore remains free of Web-specific quoting requirements.
