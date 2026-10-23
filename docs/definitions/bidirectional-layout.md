# Bidirectional Layout

Status: canonical cross-package direction contract.

## Authority and scope

The application chooses interface direction. Core preserves component contracts, presets author
visual values, and platform components implement logical placement and browser mechanics under
[Project governance](./project-governance.md). Showcase demonstrates those public contracts.

This definition establishes reusable rules for new bidirectional work. Its first implementation
covers TextField content composition; it does not claim that every existing component has already
been migrated or verified.

## Interface direction and content direction

- Use the HTML `dir` attribute on the document or an ancestor to establish interface direction.
  Components inherit that direction and allow a local override. Language and preset selection do
  not automatically select direction. No additional direction Provider is required.
- Use logical start/end terminology, properties, spacing, and alignment for direction-sensitive
  layout. Explicitly physical placement is appropriate only when its meaning is independent of
  reading direction.
- Preserve semantic DOM order and normal keyboard navigation. Do not reverse content arrays or
  introduce positive `tabIndex` values to simulate RTL layout.
- Keep the direction of editable or embedded content independent of interface direction. For
  TextField, `inputProps.dir` accepts `ltr`, `rtl`, or `auto`; omission preserves inheritance.
  `auto` follows the input's content and does not move surrounding regions while the user types.
- Use markup isolation for adjacent text with an independent or unknown base direction. Do not
  insert invisible direction-control characters into editable or submitted values.
- Direction-dependent geometry must respond to a runtime change of `dir`, including changes on
  an ancestor, without discarding the component or its current value.

The [W3C direction guidance](https://www.w3.org/International/questions/qa-html-dir.en.html)
explains HTML direction inheritance, logical CSS properties, and automatic content direction.

## TextField composition

TextField applies these rules to logical start/end regions, independently directed input values,
isolated passive text and composed actions. Its anatomy, render arguments, emphasis, Surface
Context, action clearance and connected-action relations are defined only in the package-owned
[TextField content contract](../../packages/components/react/docs/definitions/text-field/text-field-content.md).
Composed actions retain their own focus, keyboard and interaction behavior.

## Consumer examples

| Scenario | Interface and content behavior |
| --- | --- |
| Email in an RTL interface | Regions follow RTL; the example explicitly uses an LTR input. |
| Search or mixed-language text | The example uses input `dir="auto"`; surrounding actions stay in place. |
| Password reveal | Changing visibility preserves the value, selection, and declared direction. |
| Currency or unit | The consumer selects region, content direction, and accessible wording. |

Currency placement follows locale-specific conventions. Mirroring a field does not format its
value or choose where a currency symbol belongs; refer to
[Unicode CLDR currency formats](https://unicode.org/reports/tr35/tr35-numbers.html#Currency_Formats).
Visual prefixes and suffixes remain separate from the input value and form submission.

The TextField does not mirror artwork. Directional icons follow the existing icon-family
metadata and rendering contract, as defined in
[Icon families](../../packages/icons/docs/definitions/icon-families.md).

## Validation

Verify inherited and local direction, runtime ancestor changes, mixed text and punctuation,
independent input direction, isolated units, keyboard order, and field/action focus behavior.
Measure floating labels from logical inline-start and verify both label geometries with content
in either region. Test existing content-free fields alongside the new composition.
