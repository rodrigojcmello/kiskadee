# Cross-Component Rules

This document records durable rules that apply across multiple component families.

Use it for decisions that are broader than one component contract or one implementation layer.

Examples of good fit:

- focus language,
- ripple ownership,
- shadow usage philosophy,
- cross-component interaction semantics,
- global visual affordance patterns.

## 1) Focus language: external ring vs component-owned surface

Context:

- Different component families communicate focus in different ways.
- `button` currently uses an external focus ring pattern that is only shown for keyboard-style
  focus (`:focus-visible` semantics).
- `textField` does not behave like `button`: in most design systems, the field itself becomes the
  focus signal.
- For text entry controls, the visible focus language is usually the field border, underline, or a
  dedicated internal indicator layer, not a second outer ring competing with the control shell.

Decision:

- `button` may use an external focus ring as its primary focus language.
- `textField` should use the component's own shell as its primary focus language.
- In `textField`, focus emphasis belongs to the control border or to a control-owned internal
  indicator layer such as `e6`, depending on the mode.
- `textField` should not rely on a second visible outer focus ring as its primary visual focus
  signal.
- For underline-style text fields, the bottom indicator/line is the canonical focus surface.

Reason:

- Buttons are discrete action targets; an external ring reads clearly without competing with text
  entry layout.
- Text fields are persistent containers for text, caret, placeholder/label choreography, and
  validation language. Adding an additional visible outer ring tends to create double emphasis and
  visual noise.
- If a text field changes border thickness directly on focus, that can push internal content and
  create layout/padding conflicts. A control-owned internal indicator layer solves this without
  changing text geometry.
- This distinction gives Kiskadee a reusable rule for future form controls: focus should be
  expressed by the control's own visual surface when that surface already defines the component.

Consequence:

- When implementing or evolving `textField`, prefer focus changes on:
  - the control border for boxed modes, or
  - the internal indicator layer for underline-like modes.
- Do not introduce a visible outer focus ring for `textField` unless a specific accessibility or
  platform requirement justifies it.
- Structural/runtime work for `textField` may add internal visual layers to carry focus emphasis
  without changing padding or text layout.
- Future input-like controls should be evaluated against this same rule before copying Button focus
  behavior by default.
