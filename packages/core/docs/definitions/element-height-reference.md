# Element Height Reference

`scales._boxHeight` is optional inspection metadata authored alongside an element's visual scales.
It records the nominal expected outer height in CSS pixels, including content, padding and borders.
It does not constrain layout or include shadows and focus outlines.

## Schema contract

The initial supported location is `components.button.elements.e1.scales._boxHeight`. The value is
either one finite positive number or a map from the element's existing fixed size keys to finite
positive numbers. Breakpoint maps and adaptive selections are not accepted. A missing map entry
means that size has no declared reference; consumers must not infer a value from another size.

```ts
scales: {
  _boxHeight: {
    's:sm:1': 24,
    's:md:1': 32
  }
}
```

`ElementHeightReference` is a descriptive contract, separate from `ScaleProperty` and
`SCALE_PROPERTIES`. Only `_boxHeight` is recognized; an underscore is not a general escape hatch
for unvalidated schema keys. Other elements do not gain this capability implicitly.

## Ownership and publication

Presets author the reference from their approved source evidence. The authored expectation remains
independent of the measured result. Existing evidence documents keep source identity and rationale;
no additional hand-authored measurement catalog is required.

Web Builder excludes the reference before visual scale conversion, border compensation, style-key
generation and size-support discovery. It produces no CSS, CSS custom property or class-map entry.
It publishes the original value under
`inspection.elements.e1.scales._boxHeight` in the existing component metadata artifact. Missing
references remain absent, and existing artifacts without inspection metadata remain valid.

Platform components retain their current geometry and do not apply this reference. Inspection
consumers may display a ruler and compare the expected height with the actual rendered border box.
They select the reference for the effective fixed size and never update it from the measurement.
The reference describes a nominal scenario rather than a maximum height; font and content changes
may legitimately change the rendered dimensions.

This contract adds neither automated visual validation nor an agent workflow. The Showcase ruler
is an inspection aid for the user. Width references are outside this contract.
