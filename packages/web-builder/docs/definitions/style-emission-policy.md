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
artifact rules. The Registry currently projects the token-emitted `Button.e6.boxWidth` utility to
`Button.e1.p.gd`; the Style Emission Policy remains responsible only for producing `--k-bxw`.

Current element-specific contracts include:

- `textField.e2.marginLeftEmission = 'mirrored'` so label geometry can expose `--k-mgl`.
- `textField.e3.textColorEmission = 'mirrored'` so TextField structural CSS can capture the
  placeholder color through `--k-txc`.
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
