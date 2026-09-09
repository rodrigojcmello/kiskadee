# Cursor Policy

## Decision

Control cursor is a cross-platform presentation preference, not an interaction detector.
The default is pointer on Web and the platform cursor on native targets. All current presets
explicitly declare this policy. Older presets that omit it adopt the new default; this is an
intentional Web appearance change from the former arrow-only convention.

```ts
global: {
  interaction: {
    controlCursor: { value: 'pointer', scope: 'web' }
  }
}
```

`value` is `default` or `pointer`; `scope` is `web` or `all`. The complete object is optional;
when supplied, both fields are mandatory. Scope `web` means the rendering target, including DOM
inside Electron or a WebView, not browser/OS detection. Outside that scope, the native adapter
keeps its platform cursor. Scope `all` requests the chosen cursor on every capable adapter.
Targets without a cursor have no visible effect. Native adapters are not implemented here.

## Ownership and precedence

Core owns the contract and default. Presets own their explicit preference. Web Builder publishes
it in `global.kiskadee.json` and emits the effective Web value as `--k-cc` in the existing global
tokens stylesheet. See [CSS artifact naming](css-artifact-naming.md).

Applications may set `controlCursor` on the existing `KiskadeeContext.Provider` value using the
same complete object. Precedence is application preference, preset policy, then the Core default.
React projects an explicit override as `--k-cc` on control owners and portalled surfaces through
`useControlCursorStyle`. Without an override, consumers inherit generated CSS. The framework's
low-specificity root default supports hosts without generated tokens; generated tokens win
regardless of stylesheet order. Runtime does not read CSS to infer semantics.

## Rule

- Button, Switch, Tabs triggers, CardAction, Dropdown and BottomSheet action items consume
  `cursor: var(--k-cc)`. The current Showcase Select uses the same contract, including its portal.
- No universal clickable selector or `-n` selector applies the cursor. Components identify their
  action owners; static containers must not acquire an action cursor.
- Links retain link semantics; editable text retains `text`; Slider and BottomSheet drag handles
  retain `grab`/`grabbing`. Resize affordances likewise retain their specialized cursor.
- Disabled and read-only state rules take precedence over the action cursor. Existing unavailable
  cursor treatment is preserved; pending does not imply an actionable pointer.
- Hover, pressed, focus, selected and activation feedback remain independent. A cursor is never
  the only interaction affordance, and forced visual states do not make a static node interactive.
- Future Checkbox/Radio styled adapters must adopt this contract on their action owners. No new
  component is introduced by this policy.

## Showcase

Every affected component route exposes Control cursor in its side panel: Preset default (with
the resolved value and scope), Default (arrow), and Pointer (hand). Overrides are local to the
route, survive preset selection within that route, and are not persisted across page reloads.
Returning to Preset default removes the override. The administrative panel retains its original
context; menus belonging to the demonstrated content inherit that content's preference through
React context even when portalled outside its DOM subtree.

## Interaction State Scope

Generated native interaction selectors must be scoped by `-n`, exposed in code as
`stateActivator.nativeInteraction`.

```css
/* Native interaction state: requires native interaction scope. */
.token.-n:hover { ... }

/* Projected interaction state: requires explicit activator. */
.token.-h.-a { ... }
```

- `-n` means the element or state owner is allowed to react to native pseudo states such as `:hover`,
  `:active`, and `:focus-visible`.
- `-a` means a projected state is being explicitly activated by runtime classes.
- `-i` keeps its existing interaction/ref meaning and must not be reused as the native-state scope.
- Interactive components should add `-n` to the state owner that receives native pseudo states.
- Static components must not receive `-n`; carrying generated state classes in the visual bucket must
  not make them hoverable, pressable, focusable, or selectable by accident.
- `disabled` and `readOnly` remain projected unavailable states. They do not depend on `-n`.

## Component Work

When creating or reviewing a component, treat cursor behavior as part of the component contract:

- decide whether the component is static, interactive, editable, link-like, disabled, or read-only;
- consume the control cursor preference on generic action owners; retain specialized cursors for links, text and manipulation;
- avoid using cursor changes as the only signal that an element can be activated;
- use hover styling only when the component or element owns an interaction affordance;
- add `-n` only when the component or element owns native interaction states;
- document any component-specific cursor inheritance guard in the component's definition.
