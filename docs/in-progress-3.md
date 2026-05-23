- [ ] Investigate `#616161` on the thumb.
  Check whether it maps to an existing Fluent neutral token. Prefer `c('default', 'l', ...)` when a
  palette match exists.

- [ ] Investigate all raw hex colors in the Fluent Switch.
  Current raw values include `#616161`, `#575757`, `#424242`, `#D1D1D1`, and `#242424`.

- [ ] Validate whether track `paddingTop` and `paddingBottom` are needed.
  The track already centers the thumb with structural flex alignment, but vertical padding may still
  affect the internal geometry together with border compensation.

- [ ] Confirm final thumb geometry.
  Current visual tuning changed the thumb to `14x14` and track horizontal padding to `3px`; verify
  unchecked/checked alignment against the reference after compensated border emission.

- [ ] Revalidate compensated padding emission visually.
  Confirm that `switch.standard.e2` now behaves like Button-style padding, where the schema padding
  represents the visual total and border width is subtracted by generated CSS.

- [ ] Confirm the single-size scope.
  The Fluent Switch currently keeps only `s:md:1`; decide whether this remains the right scope for
  the polishing pass.

- [ ] Review `switchDataAttributeProjections` in `HeadlessSwitch.tsx`.
  The current implementation still projects state through raw attributes. Check whether this should
  use the `stateActivator` pattern instead, so Switch follows the same state-projection model as the
  rest of the headless/styled component pipeline.
