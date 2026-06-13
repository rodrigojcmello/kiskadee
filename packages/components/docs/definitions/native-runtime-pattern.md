# Native Runtime Pattern

This document defines the common pattern for native Kiskadee component runtimes. The first
implementation is `packages/components/ios`, but this is a platform-neutral rule for future native
targets such as Android.

## Source of truth

The canonical source remains the platform-agnostic Kiskadee schema from `packages/core` and
`packages/presets`.

Native platforms must not introduce independent design-system schemas such as an iOS-only or
Android-only schema that can drift from the canonical schema. A native runtime may consume either:

- the canonical `schema.json`; or
- a smaller native payload generated from the canonical schema.

A smaller payload is an artifact, not a new source of truth. For example,
`material-3-google.switch.kiskadee-ios.json` or `material-3-google.switch.kiskadee-android.json`
would be valid future artifacts if they are derived from the same canonical preset schema.

## Native runtime layers

Each native platform package should keep the same high-level layers:

- **Loader/decoder:** reads the JSON payload into platform-native models.
- **Theme resolver:** maps segment, theme mode, intent, emphasis, state, scale, and component options
  to concrete platform values.
- **Native component:** renders with native UI primitives and consumes resolved values instead of
  hardcoding design-system tokens.
- **Showcase app:** consumes the local package and renders real scenarios for visual validation.

The expected flow is:

```text
canonical schema or derived payload -> loader -> theme resolver -> native component -> showcase
```

The component layer may adapt behavior to the host platform, but token ownership stays in the schema
or derived artifact.

## Package shape

Native component packages should live under `packages/components/<platform>`.

For iOS:

```text
packages/components/ios/
  Package.swift
  Sources/KiskadeeIOS/
  Examples/KiskadeeIOSShowcase/
```

For Android, use the equivalent platform-native structure:

```text
packages/components/android/
  build.gradle.kts
  kiskadee-android/
  showcase/
```

The reusable library and showcase must stay separate. External apps should depend on the library,
not the showcase.

## Platform differences

Native runtimes should share the same architectural pattern, but they do not need identical internal
APIs.

Examples:

- iOS may use Swift Package Manager and SwiftUI.
- Android may use Gradle, Kotlin, and Jetpack Compose.
- Gestures, accessibility, focus, pointer states, animation primitives, and system color handling may
  differ by platform.

Those differences belong in the native component and platform adapter layers. They must not create a
parallel visual contract when the canonical schema already owns the value.

## MVP rule

A native MVP may support a narrow subset of the schema when proving a new platform. The subset must
be explicit in the package README and in the showcase.

For example, the iOS MVP supports Material Google Switch with a reduced fixture. That fixture is
acceptable because it is a temporary payload derived from the canonical schema. It must not be
treated as the permanent schema contract for iOS.

## Validation expectations

Each native platform should provide at least:

- package/library build validation;
- showcase app build validation;
- visual/manual validation in the platform simulator or emulator;
- README usage instructions for external app consumption.

Automated tests can be added when the implementation risk justifies them or when explicitly requested
for the task. The showcase remains required because build success alone does not prove that the
native component renders correctly.
