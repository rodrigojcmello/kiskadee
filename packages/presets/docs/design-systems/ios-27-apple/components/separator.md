# iOS 27 Separator And Contour Evidence

## Sources And Coverage

- [Figma Colors page](https://www.figma.com/design/GeO2lMY65IAFczDmjs6oei/iOS-and-iPadOS-27--Community-?node-id=0-1746), file `GeO2lMY65IAFczDmjs6oei`, page `0:1746`.
- [Stored semantic variable mapping](../colors/figma-to-kiskadee.candidate.json),
  `Separators/Opaque` and `Separators/Non-opaque` Light/Dark.

**Official adapted:** source separator colors translated to the approved Apple Gray family.
**Kiskadee extension:** one Web pixel thickness, optional Card boundaries, and on-vivid contours.

## Color And Token Provenance

| Concept | Source Light / Dark | Lookup | Output |
| --- | --- | --- | --- |
| Opaque | #c6c6c8 / #38383a | exact Apple Gray L14 / D16 | #c2c2c5 / #38383b; Delta E 0.012279 / 0.001770 |
| Non-opaque | black12% / white17% | physical cap neutral L100@12 / D100@17 | source endpoints and alpha preserved |
| On vivid medium/low | no global upstream counterpart | physical white L0@30 / L0@17 | Kiskadee extension for dark blue canvas |

`global.contours.neutral.standard` owns this paint. `global.separators.subtle` selects its
medium/low coordinates and owns thickness 1. Separator `e1`, Dropdown `e7` and BottomSheet `e12`
consume that existing profile. Card consumes contours independently of its own surface.

Darker keeps Dark contour colors. Both surface contexts publish the same medium/low coordinate
set, so no on-vivid fallback or hidden missing separator remains. The former Light L10 was only a
legacy approximation; L14 now follows the source de-para. No interaction states are authored for
static dividing lines.

## Deferred And Validation

Vibrant/material separator paint and device-dependent native hairline rendering are **Deferred**.
Validate shared references and resolved colors across themes, horizontal/vertical lines and Card
boundary controls. See [verification ledger](../polish-verification.md).
