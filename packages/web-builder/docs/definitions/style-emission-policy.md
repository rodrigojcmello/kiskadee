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

Current element-specific contracts include:

- `textField.e2.marginLeftEmission = 'mirrored'` so label geometry can expose `--k-mgl`.
- `textField.e3.textColorEmission = 'mirrored'` so TextField structural CSS can capture the
  placeholder color through `--k-txc`.
- `button.e1.boxColorGradientEmission = 'interpolated'` so button gradients can expose `--k-bg*`
  interpolation variables without making every `boxColor` class use that CSS shape.
