
### Reference note (Material Design 3)

The image used as a reference for the Material color roles was downloaded from:
https://m3.material.io/styles/color/roles

The colors used in this preset are based on that reference.

Date: 2026-01-19

Local reference image:
- File: `color.png`
- Preview: ![Material color roles reference](./color.png)

### Color scale

Material defines tonal palettes for both `primary` and `secondary`. However, when adapting those palettes to Kiskadee's fixed 16-position model (`subtle` + `vivid`), we observed a consistent behavior:

- The lightest tones (Kiskadee `subtle`) are very close between `primary` and `secondary`.
- The most noticeable differentiation happens in the darker tones (Kiskadee `vivid`), where the hue/chroma identity becomes clearer.

Because of that, this preset keeps a single `subtle` ramp (shared baseline) and focuses the `secondary` differentiation on the `vivid` track.

#### Why this choice (site vs Figma)

The Material website can give the impression that `secondary` affects the light tones more than it does in practice:

![Material website reference](./img-02.png)

In the Material 3 Figma ecosystem (UI kit + plugin outputs), the observed behavior is the opposite: `secondary` becomes more distinct mainly in darker tones, while light tones remain very close:

![Figma reference](./img-03.png)

This Figma behavior is also reflected in the generated scales we produce from the same source colors (and matches what is shipped in design assets). For consistency with real-world token usage and generated outputs, this preset follows the Figma behavior when deciding how to map `primary`/`secondary` into Kiskadee's `subtle`/`vivid` tracks.
