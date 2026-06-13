# KiskadeeIOS

Native SwiftUI components for Kiskadee design-system schemas.

This package is the first native runtime proof for Kiskadee. The current MVP supports the
Material Google Switch subset only.

## Package layout

- `Sources/KiskadeeIOS`: reusable library code.
- `Examples/KiskadeeIOSShowcase`: local iOS app that consumes the package.
- `Examples/KiskadeeIOSShowcase/KiskadeeIOSShowcase/Resources/material-3-google-switch.schema.json`:
  reduced fixture derived from the canonical Material Google schema.

The fixture is not a separate iOS schema contract. It is a small runtime payload for the MVP. The
canonical source remains the Kiskadee schema in `packages/presets`.

## Usage

Add `packages/components/ios` as a local Swift Package dependency, include a Kiskadee schema JSON in
the app bundle, then create a theme and render the switch.

```swift
import KiskadeeIOS
import SwiftUI

struct SettingsView: View {
    @State private var isEnabled = false
    let theme: KiskadeeTheme

    var body: some View {
        KiskadeeSwitch(
            isOn: $isEnabled,
            label: "Material switch",
            theme: theme
        )
    }
}

func loadTheme() throws -> KiskadeeTheme {
    let url = Bundle.main.url(
        forResource: "material-3-google-switch.schema",
        withExtension: "json"
    )!
    let schema = try KiskadeeSchemaLoader.load(from: url)
    let theme = KiskadeeTheme(schema: schema)
    try KiskadeeSwitchSchemaValidator.validate(theme: theme)
    return theme
}
```

## Supported MVP surface

- Component: `Switch`.
- Preset payload: Material Google, `default` segment, `light` mode.
- Tokens: track, thumb, label, and icon color roles; width, height, padding, border width, radius,
  label typography, and thumb shrink.
- States: rest, pressed, disabled, and selected.

Future native builders can emit smaller per-component payloads such as
`material-3-google.switch.kiskadee-ios.json` from the canonical schema.
