# Visual Identity And Platform Adaptations

Status: accepted.

## Preset boundary

A Kiskadee preset represents a coherent visual identity. Platform names alone do not establish
different identities. iOS, iPadOS and macOS contribute evidence to one Apple identity in Kiskadee.
The existing `ios-27-apple` identifier remains the compatibility identifier for that preset;
this decision does not create or rename registry entries.

This is a Kiskadee modeling decision, not a claim that Apple's platform interfaces are identical.
Native platforms can differ in typography, density, control geometry, input affordances, materials
and behavior. Each difference still needs source evidence and an explicit mapping.

Keeping one identity avoids duplicating palettes, fixes and component recipes across almost
equivalent presets. Applications can change density or shape without replacing their visual
identity or loading another preset. Evidence from multiple platform releases must retain its
version and provenance; a mixed-source preset must not claim exact reproduction of one release.

## Representation

- Component scales express compact, regular and spacious geometry.
- Radius choices express rounded, pill and square geometry independently of scale.
- Theme palettes and sparse state deltas express appearance and interaction feedback.
- Global typography profiles hold complete reusable metrics; components select them by scale.
- Platform behavior and accessibility remain with Headless and platform adapters. A preset does
  not infer touch, pointer or operating system from a palette or radius choice.

A new preset is justified by a separately maintained visual language whose differences cannot be
coherently represented by these contracts, not by a different device name. Shared vendor ownership
alone also does not force unrelated visual languages into one preset.

## Apple Button application

The Material Button already orders explicit `s:sm:1`, `s:md:1` and `s:lg:1` scales from compact to
spacious (36, 40 and 56 px for its first three label-button scales). It does not automatically
select a scale from the operating system or viewport. Apple follows the same ordering:

| Scale | Apple geometry | Intended use |
| --- | --- | --- |
| Small | macOS-inspired 24 px, 13/16 typography | Compact desktop actions |
| Medium | iOS 34 px, 15/20 typography | Regular density |
| Large | iOS 50 px, 17/22 typography | Spacious and touch-oriented actions |

The consumer chooses scale according to layout and input needs. A visual size is not a guarantee
of an accessible touch target. `rounded` uses the inspected macOS 6 px radius; `pill` retains the
iOS treatment. These choices can be combined; neither implicitly selects a platform.

Existing Rest colors and approved tonal assets remain the Apple base. macOS pressure evidence
informs transient feedback, with Hover and uninspected theme behavior labeled as Kiskadee
extensions. No platform-specific palette fork is required.

See [Apple Button evidence](../design-systems/ios-27-apple/components/button.md) for source nodes,
mapping decisions and limitations. Ownership follows
[project governance](../../../../docs/definitions/project-governance.md).
