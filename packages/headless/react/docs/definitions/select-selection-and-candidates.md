# Select selection and candidates

Headless Select owns selection, list candidates, confirmation, keyboard flow, pointer takeover,
and accessibility. Visual adapters consume this state without redefining its meaning.

## Values and suggestions

`value` and `defaultValue` represent real selection. `value={null}` is a controlled absence of
selection; an omitted or undefined `value` is uncontrolled. `defaultValue` retains its existing
meaning as initial selection and must not be used for an unconfirmed suggestion.

`suggestedValue` affects the list only. Omission suggests the first enabled option, null opens
without an initial candidate, and a string targets that enabled option. An unavailable or disabled
explicit suggestion produces no initial candidate. An enabled selected option takes precedence
over the suggestion. Suggestions never replace the trigger placeholder or create selection.

Opening, hovering, navigating within the list, Escape, Tab, and outside dismissal do not confirm
a value. Clicking an option, confirming the active option with Enter/Space, closed-trigger
typeahead, and Previous/Next do confirm. Confirmation is reported even when the value is unchanged.

## Explicit absence option

An option with `kind: 'none'` retains a unique string collection key and its accessible label, but
confirmation clears the selected value to null. Its text or position has no special meaning.
The collection accepts at most one such option and diagnoses duplicates during development.
No list item is marked selected while the canonical value is null, including the none option.

Previous/Next skip none options and disabled options. With no real selection, Next confirms the
first enabled real value and Previous the last. A single enabled real option can be confirmed
from empty; after confirmation both controls are disabled because no different destination exists.
When the current value becomes disabled, steps retain its position and search in the requested
direction rather than treating it as an empty selection.
Loop changes only the boundary behavior of these controls, not list keyboard navigation.

Previous/Next accept a `render` adapter with native button props and read-only `disabled` state.
Adapters preserve the supplied props and may project the derived disabled state to their visual
classes without recalculating selection limits. Headless keeps ownership of the click behavior,
accessible label, direction, global disabling, and native disabled attribute.

## Candidate and presentation state

`useSelectState()` is a read-only hook inside `Select.Root`. It exposes `selectedValue`,
`hasSelection`, `isOpen`, `activeValue`, `highlightedValue`, and `activeSource`.
`hasSelection` means a real value exists in the current options; it does not record interaction
history. Selection of a disabled value remains readable, but the disabled option cannot be
activated or newly confirmed.

The active candidate owns `aria-activedescendant`. The highlighted candidate is a presentation
hook that adapters may map to their existing Hover appearance. Initial, keyboard, and pointer
candidates share this hook without creating new schema interaction states. Option render state
preserves `active` for the accessibility candidate and adds `highlighted` for visual presentation.

A non-touch pointer entering or moving over an enabled option takes over the highlight. Pointer
leave clears that visual highlight, retains the active candidate, and does not restore the initial
suggestion. Subsequent keyboard navigation resumes the highlight. Closing clears candidate state;
opening again starts a new initial-candidate cycle. Touch does not create a sticky hover projection.
Equivalent option-array rerenders preserve the current candidate, highlight, and source. Removing
or disabling the active candidate clears it without restoring an initial suggestion during the
same opening cycle.

## Callback migration

`onValueChange` now receives `string | null` and a second argument with `reason` and an optional
native `event`. Reasons are `option`, `keyboard`, `previous`, `next`, and `typeahead`.
Existing consumers must accept null in their state and callback types. Callbacks that ignore the
second argument remain valid. Use a none option for explicit clearing rather than a fake domain
value; controlled consumers apply the nullable request themselves.

```tsx
const [value, setValue] = useState<string | null>(null);

<Select.Root
  options={[
    { value: 'none', label: 'Choose an option', kind: 'none' },
    { value: 'first', label: 'First option' }
  ]}
  value={value}
  suggestedValue="first"
  onValueChange={setValue}
>
  <Select.Trigger />
  <Select.Content />
</Select.Root>;
```

## Portal direction and supplied geometry

Content inherits the effective direction of its trigger unless its own `dir` is supplied, including
local RTL subtrees whose lists portal into an LTR document. Direction travels on the floating node.

`offset` and `collisionPadding` accept explicit geometry from the visual adapter. Collision padding
may be a number or per-side object. Omission/null adds no gap or clearance in Select; it does not
activate the shared overlay helper's legacy numeric defaults. Styled adapters must supply their
Schema-generated geometry. This changes direct Headless consumers that relied on the former 8px
values: they must explicitly supply their owning visual contract's geometry to retain that spacing.
