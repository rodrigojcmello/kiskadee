# Slider Showcase

The Slider route consumes the shared surface-context and background controls through
ShowcaseExampleCard. It does not maintain an independent surface palette or couple
Slider emphasis to a local background choice. The local Typography control is omitted.
Published intent choices use the example Card context. When the active preset and
theme do not publish that context, the route shows the availability note instead
of selecting onSubtle classes for an onVivid Card.

Radius starts at Preset default and omits the instance override. Explicit Square,
Rounded and Pill choices use the public radius API; size metadata is not a radius
capability map. Example A remains a simple Slider but follows the same Size,
Radius, Intent and Emphasis controls as the other examples.

The Interactive example uses the same desktop column width as the example grid and
fills the available column on mobile. Slider control-lane height and the Quick settings
volume/footer spacing remain unchanged by this route refinement.
