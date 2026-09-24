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
      'Light onSubtle uses physical black caps at 5/9.5/23%; Dark retains D45 and existing cap opacities.'
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
