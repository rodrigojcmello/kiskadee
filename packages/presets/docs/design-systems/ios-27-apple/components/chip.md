# iOS 27 Chip Coverage Boundary

## Sources And Coverage

- [Apple HIG: Search fields](https://developer.apple.com/design/human-interface-guidelines/search-fields)
  describes tokens as part of an editable search field for refining a query.
- [UIKit: UISearchToken](https://developer.apple.com/documentation/uikit/uisearchtoken)
  defines the search-token object and its relationship with search-field content.
- [UIKit: UISearchTextField](https://developer.apple.com/documentation/uikit/uisearchtextfield)
  assigns text positions to tokens so selection and keyboard editing include them.

These sources establish a token inside an editable field. They do not establish visual or
interaction equivalence with Kiskadee's independently rendered Action/Toggle Chip. That
equivalence remains **Not inspected**; this is not a claim that Apple has no token-like UI.

## Preset Decision

The Fluent preset publishes Chip. The iOS preset leaves it unavailable because an official
standalone equivalent has not been established. Search-token integration remains **Deferred**:
implementing its source semantics requires field/editor composition beyond this preset-only
task. No Apple-labelled Chip geometry or behavior is invented to close a numerical coverage gap.

The distinction from Badge follows the existing
[Badge and Chip contract](../../../../../../docs/definitions/badge-chip-contract.md).
Badge is a passive indicator and is independently configured in the iOS preset.

Tabs and TextField are also absent from the current Fluent/iOS preset coverage; their generic
Showcase routes do not imply that either preset publishes them. They are outside this polish's
existing-component baseline. See the [verification ledger](../polish-verification.md).
