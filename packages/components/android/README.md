# Kiskadee Android

Native Jetpack Compose components for Kiskadee design-system schemas.

This package is the first Android runtime proof for Kiskadee. The current Switch showcase uses the
same first-party Switch fixture set as the iOS showcase.

## Package layout

- `kiskadee-android`: reusable Android library code.
- `showcase`: local Android app that consumes the library.
- `showcase/src/main/assets/*-switch.schema.json`: Switch fixtures copied from the iOS showcase for
  Carbon IBM, Fluent 2 Microsoft, iOS 26 Apple, Material 3 Google, and Material 3 Kiskadee.

The fixtures are not a separate Android schema contract. The canonical source remains the Kiskadee
schema in `packages/presets`.

## Usage

Add `packages/components/android/kiskadee-android` as a local Gradle module or copy the same library
module into an external Gradle build, include a Kiskadee schema JSON in the app assets, then create a
theme and render the switch.

```kotlin
import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.kiskadee.android.components.switchcontrol.KiskadeeSwitch
import com.kiskadee.android.components.switchcontrol.KiskadeeSwitchSchemaValidator
import com.kiskadee.android.schema.KiskadeeSchemaLoader
import com.kiskadee.android.theme.KiskadeeTheme

fun loadTheme(context: Context): KiskadeeTheme {
    val schema = KiskadeeSchemaLoader.loadFromAsset(
        context,
        "material-3-google-switch.schema.json"
    )
    return KiskadeeTheme(schema).also(KiskadeeSwitchSchemaValidator::validate)
}

@Composable
fun SettingsSwitch(theme: KiskadeeTheme) {
    var checked by remember { mutableStateOf(false) }

    KiskadeeSwitch(
        checked = checked,
        onCheckedChange = { checked = it },
        label = "Material switch",
        theme = theme
    )
}
```

For a multi-module Gradle project, the consumer dependency is:

```kotlin
dependencies {
    implementation(project(":kiskadee-android"))
}
```

## Supported MVP surface

- Component: `Switch`.
- Preset payloads: Carbon IBM, Fluent 2 Microsoft, iOS 26 Apple, Material 3 Google, and Material 3
  Kiskadee, `default` segment, `light` mode.
- Tokens: track, thumb, label, and icon color roles; width, height, padding, border width, radius,
  label typography, thumb shrink, and activation feedback.
- States: rest, pressed, disabled, and selected.
- Interactions: tap, drag, edge commit, interaction lock, optional cooldown, and activation
  feedback.
- Rendering: native Compose only; no WebView.

Future native builders can emit smaller per-component payloads such as
`material-3-google.switch.kiskadee-android.json` from the canonical schema.

## Android notes

The Android runtime follows the shared native pattern:

```text
canonical schema or derived payload -> loader -> theme resolver -> native component -> showcase
```

The Android implementation diverges from iOS only at platform boundaries:

- Gradle/Kotlin/Compose replace Swift Package Manager and SwiftUI.
- The loader uses Android's built-in `org.json` parser to avoid adding a serialization dependency
  to the MVP.
- Pressed state is read from Compose's `MutableInteractionSource`, while iOS uses a SwiftUI gesture.

These differences do not create a new visual contract; resolved values still come from the schema
or derived payload.

## Validation

From `packages/components/android`, run:

```bash
./gradlew :kiskadee-android:assembleDebug
./gradlew :showcase:assembleDebug
```

To install the showcase when an emulator is available:

```bash
./gradlew :showcase:installDebug
adb shell am start -n com.kiskadee.android.showcase/.MainActivity
```
