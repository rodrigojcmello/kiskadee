# Style Emission Policy

Style emission is an element-level decision.

When a schema style key can produce more than one CSS shape, the choice must be represented in
`src/style-emission/web-build-policy.ts` and resolved for the concrete component element before
CSS is generated.

Examples of CSS shape changes:

- direct: `color: #000`
- mirrored: `--k-txc: #000; color: #000`
- token: `--k-bdc: #000`
- interpolated: `--k-bg0: #000; --k-bg1: #111; background: linear-gradient(...)`
- compensated: `--k-pdt: 12px; padding-top: max(0px, calc(var(--k-pdt) - var(--k-bdw, 0px)))`

Do not add property-only checks inside CSS transformers to emit structural CSS variables. A check
such as `propertyName === 'textColor'` or `scaleProperty === 'marginLeft'` is not enough, because
the same style property can appear in different components and elements with different structural
contracts.

Required pipeline work for a new emission mode:

1. Add the emission option to `ElementStyleEmissionPolicy`.
2. Add its default to `DEFAULT_ELEMENT_STYLE_EMISSION_POLICY`.
3. Enable it only for the component elements that own the structural contract in
   `DEFAULT_WEB_STYLE_EMISSION_POLICY`.
4. Add the property family to `web-style-key-identity.ts` so direct and mirrored/token classes do
   not collapse into the same identity.
5. Use the resolved element policy inside the CSS transformer.

The CSS transformer may still branch by property to choose the CSS property name, parse values, or
format valid CSS. It must not branch by property alone to decide whether to emit a custom property.

## Style Emission Policy versus Structural Utility Projection Registry

Style Emission Policy decides how one authored style key becomes CSS. It does not decide which DOM
owner conditionally receives the resulting utility.

A structural utility projection instead publishes another reference to an already emitted
token-only scale class under `element.p[artifactKey][scaleKey]`. It must not:

- change direct, mirrored, token, interpolated, or compensated emission;
- contain the raw style value or CSS declaration;
- cause a second utility rule to be generated; or
- infer ownership from the style property alone.

The source property's Style Emission Policy must resolve to `token`. Direct, mirrored,
interpolated, and compensated source utilities are not eligible projection sources. The Registry
cannot override this requirement.

If structural Sass needs a CSS variable, first configure the source element's Style Emission
Policy. If a different structural node then needs that existing utility independently, evaluate the
separate Structural Utility Projection Registry contract. Do not use projection to compensate for
an incorrect emission shape, and do not use Style Emission Policy to redirect a utility to another
DOM owner.

See
[`structural-utility-projections.md`](./structural-utility-projections.md) for the Registry and
artifact rules. Active examples include Button's plain-icon line-height metric at `e2.p.lh` and
Dropdown leading-track width/gap utilities under `e3.p.iw/ig` and `e10.p.sw/sg`. Connected Button
groups apply the `Button.e6.boxWidth` projection at `Button.e1.p.gd` to member roots for seam
overlap and to frame pieces for shared-strip clipping, without another Registry entry.
Their logical Rest frame and border-free member paint use separate palette-aware class-map
projections; structural grid segments locally omit the frame over a member using High selection
paint. Style Emission Policy remains responsible only for producing the required CSS shape;
neither projection re-authors the preset's colors or dimensions.

Current element-specific contracts include:

- `button.e2.textHeightEmission = 'token'` publishes `--k-txh`. Phase 1 receives the same policy
  as later phases and exposes the original `textHeight` metric when lowering a typography profile,
  alongside its existing unitless line-height utility. Global profile classes are unchanged.
  Legacy authored `scales.textHeight` uses the same token emission. The label consumes the token;
  the registered `e2.p.lh` projection allows plain icon fitting without publishing raw metrics or
  copying typography classes. The token identity stays distinct from direct line-height emission.

- `layout.e1` padding and margin and `layout.e2` padding use token-only emission. Layout's
  independent spacing selectors and responsive column catalog are described in
  [`layout-artifacts.md`](./layout-artifacts.md).
- `textField.e2` marginLeft and inline padding emit token-only `--k-mgl`, `--k-pdl` and `--k-pdr`;
  `textField.e7.paddingRight` emits token-only `--k-pdr`. Structural CSS consumes their logical
  label offset and notch/inline-label spacing without additional physical CSS declarations.
- `textField.e3.textColorEmission = 'mirrored'` so TextField structural CSS can capture the
  placeholder color through `--k-txc`.
- `textField.e3.paddingEmission = 'token'`, with explicit direct Left/Right overrides, publishes
  only the authored block spacing as `--k-pdt` and `--k-pdb`. The classes remain on e3; its
  structural editing lane consumes the inherited tokens as block padding. The shell therefore
  does not add that spacing around lateral Buttons. Every branch renders this lane around the
  Input and any Floating clearance, while the Floating label remains a child of the control.
  Inline shell padding and e4's own Inside `paddingTop` remain direct and independent. This is
  ordinary token inheritance within the control, not a Structural Utility Projection: no class
  reference is copied to another owner, no `p` bucket is added, and no new scale is authored.
- `textField.e8.paddingLeftEmission = 'token'` publishes the content-region child gap as
  `--k-pdl`; `marginRightEmission = 'token'` publishes the independent region-to-input gap as
  `--k-mgr`. Structural CSS consumes these tokens as logical gaps on either start/end region,
  without physical padding or right margin. Both classes stay on their authored e8 owner.
- `textField.e8` boxColor, borderColor and borderWidth emit token-only `--k-bgc`, `--k-bdc`
  and `--k-bdw` for lateral region paint. The full-height surface and inner separator do not add
  layout padding, border width or an independent radius. Lowest and Medium share the same content
  geometry; structural paint is located against the existing shell bounds. The editing lane
  consumes e3's block spacing once; lateral regions receive no copy of that layout padding.
- `textField.e9` emits icon width/height as tokens for structural logical sizing, resolved from
  `global.iconSizes` rather than local pixel values.
- `button.e1.boxColorGradientEmission = 'interpolated'` so button gradients can expose `--k-bg*`
  interpolation variables without making every `boxColor` class use that CSS shape.
- `button.e6.boxWidthEmission = 'token'` and `button.e6.boxHeightEmission = 'token'` so Button
  structural CSS can consume divider thickness and extent through logical dimensions without
  generating physical width or height declarations.
- `switch.standard.e2.borderWidthEmission = 'mirrored'` and
  `switch.standard.e2.paddingEmission = 'compensated'` so the web track can preserve
  cross-platform visual geometry when a border is present.
- `slider.standard.e8.boxHeightEmission = 'mirrored'` and
  `slider.standard.e12.boxWidthEmission = 'mirrored'` so Slider structural CSS can keep edge marks
  inside the rendered track geometry.

For component-by-component notes, see
[`component-style-emission-overrides.md`](./component-style-emission-overrides.md).
