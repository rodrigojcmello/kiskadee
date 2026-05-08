2026-05-08

TextField control padding focus fix

- Decision: `TextField.Control` owns the click-to-focus behavior for the visual input shell.
- Motivation: the shell padding is visually part of the field, so clicking it must focus the real input just like clicking the input content area.
- Implementation: `packages/headless/react/src/text-field/HeadlessTextField.tsx` stores the input ref in context and focuses it from the control `onClick` when the control receives a click.
- Documentation:
  - `packages/headless/react/src/text-field/docs/definitions/text-field-visual-shell-focus-target.md`
- Repo documentation convention: prefer the nearest project-specific `docs/` root. The repository root
  `docs/` directory is reserved for cross-project or cross-package documentation, and project-local docs
  should use `docs/definitions/`, `docs/proposals/`, and `docs/rejected/`. Each project should keep only one
  `docs/in-progress.md`, always at the root of that project's `docs/` directory.
- Documentation standardization:
  - `packages/web-builder/docs/*.md` definitions moved into `packages/web-builder/docs/definitions/`
  - `packages/web-builder/docs/technical-debt/future-optimizations.md` moved into `packages/web-builder/docs/proposals/`
  - repository root `docs/future-ideas/` and `docs/discarded-ideas/` moved to `docs/proposals/` and `docs/rejected/`
- Structural affordance: TextField standard outline, underline, and borderless structural Sass now use `cursor: text` on the control shell.
- Validation:
  - `pnpm --filter @kiskadee/react-headless exec vitest run src/text-field/HeadlessTextField.test.tsx`
  - `pnpm --filter @kiskadee/react-components run build`
  - Manual showcase validation confirmed by the user on `http://localhost:3000/text-field`.
