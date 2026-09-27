import type { PresetColorEvidenceRegistry } from '../../utils/presetColor.ts';

export const fluent2MicrosoftColorEvidence = {
  'component.badge': {
    source: 'components/badge.md#color-and-token-provenance',
    rationale: 'Badge fixed stops adapt compact Fluent foreground and surface tokens.'
  },
  'component.bottom-sheet': {
    source: 'components/bottom-sheet.md#color-and-token-provenance',
    rationale: 'Bottom Sheet fixed stops adapt Fluent menu and overlay token relationships.'
  },
  'component.button': {
    source: 'components/button.md#color-and-token-provenance',
    rationale: 'Button fixed stops are part of the documented Fluent and Kiskadee state formula.'
  },
  'global.contours': {
    source: 'components/card.md#shared-neutral-contours',
    rationale:
      'Light neutral contours use black caps at 5/9.5/23%; Light Primary Card uses segment brand at 14% onSubtle; Separator uses 7/14/28% onSubtle. Dark recipes remain unchanged.'
  },
  'global.separators': {
    source: 'components/separator.md#primary-dark-line-on-vivid-2026-09-26',
    rationale:
      'Kiskadee Light onVivid Primary Separator uses approved segment Primary L85 at 8/16/32% to distinguish dark lines from Neutral light lines.'
  },
  'component.card': {
    source: 'components/card.md#color-and-token-provenance',
    rationale:
      'Card fixed stops adapt documented Fluent tokens; approved Light Primary Low/High extend Neutral positions L1/L5.'
  },
  'component.container': {
    source: 'components/container.md#color-and-token-provenance',
    rationale:
      'Container companion stops use the approved Card neutral/primary tonal assets for calibrated internal regions.'
  },
  'component.chip': {
    source: 'components/chip.md#color-and-token-provenance',
    rationale: 'Chip fixed stops adapt documented interaction-state token positions.'
  },
  'component.dropdown': {
    source: 'components/dropdown.md#color-and-token-provenance',
    rationale: 'Dropdown fixed stops adapt Fluent menu surface and content tokens.'
  },
  'component.text-field': {
    source: 'components/text-field.md#color-and-token-provenance',
    rationale:
      'Input neutral tokens map to approved achromatic stops; Orange L50 extends validation warning.'
  },
  'component.slider': {
    source: 'components/slider.md#color-and-token-provenance',
    rationale: 'Slider fixed stops adapt official track, thumb, and state colors.'
  },
  'component.switch': {
    source: 'components/switch.md#color-and-token-provenance',
    rationale: 'Switch fixed stops adapt official track, thumb, and state colors.'
  },
  'global.foreground.deep': {
    source: 'components/text.md#deep-profile-extension',
    rationale:
      'Deep foreground stops preserve the documented action-label anchors as reusable color profiles.'
  },
  'global.foreground.states': {
    source: 'components/text.md#stateful-global-coordinates',
    rationale:
      'Promoted neutral state stops preserve approved Fluent Button disabled foregrounds in the global catalog.'
  }
} as const satisfies PresetColorEvidenceRegistry;

export type Fluent2MicrosoftColorEvidenceId = keyof typeof fluent2MicrosoftColorEvidence;
