# Icon Consumption

Status: canonical cross-package definition.

Kiskadee separates icon purpose, source, and family resolution. These axes must not be collapsed
into a component-specific name API.

## Essential Icon (E-I)

An Essential Icon is one of the small set of internal affordances required by Kiskadee components.
The `EssentialIconProvider` maps concepts to `IconName`; `FamilyResolvedIcon` then resolves that name
through the effective Icon Family Provider.

The catalog is global and currently limited to `check`, `radio-selected`, `chevron-down`,
`chevron-left`, `chevron-end`, and `close`. Components omit the complete affordance wrapper when an
E-I is absent or cannot be resolved. They do not select another family, draw substitute geometry,
or create an internal glyph fallback.

## Consumer-provided Icon (CP-I)

A Consumer-provided Icon is arbitrary content deliberately supplied by an application. React slots
accept it through `children`:

```tsx
<Button.Icon>
  <ProductLogo />
</Button.Icon>
```

The slot owns layout, schema size, and component-relative paint. The child owns its artwork. A
component does not interpret CP-I strings or require an IFP.

Generic headless data remains renderer-agnostic. React menu adapters require `renderIcon` whenever
a menu node contains `icon` or `trailingIcon`; a `null` renderer result omits the wrapper and gap.

## Family-resolved Icon and IFP

`FamilyResolvedIcon` is an optional CP-I implementation and the resolver used after an E-I concept
has been selected:

```tsx
<Button.Icon>
  <FamilyResolvedIcon name="settings" />
</Button.Icon>
```

The optional Icon Family Provider (IFP) is the only authority over family and variant. The component
slot never receives or infers either value. `FamilyResolvedIcon` may receive an explicit glyph
`fallback`, but this is not a styling fallback and never authorizes mixing families implicitly.

`Icon` remains independent of the IFP and owns only standalone icon semantics and its schema-owned
visual viewport:

```tsx
<Icon label="Settings">
  <SettingsIcon />
</Icon>

<Icon decorative>
  <FamilyResolvedIcon name="settings" />
</Icon>
```

## Size ownership

Every schema-owned icon slot maps component sizes to `global.iconSizes` through `iconSize`. The Web
Builder emits the square viewport. Structural CSS consumes the required variables without visual
fallbacks; a missing reference is a contract error rather than permission to invent a local size.

The preset keeps `global.icons.family/variant` as its family recommendation and keeps
`global.iconSizes` as its numeric profile. Neither field stores glyph imports or the E-I map.
