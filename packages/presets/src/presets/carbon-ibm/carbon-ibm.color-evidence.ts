import type { PresetColorEvidenceRegistry } from '../../utils/presetColor.ts';

export const carbonIbmColorEvidence = {
  'source.tokens': {
    source: 'colors/token-mapping.json',
    rationale:
      'Closest OKLab position within the source primitive family; each theme is mapped independently from inspected Carbon v11 variables.'
  },
  'component.card': {
    source: 'components/card.md',
    rationale: 'Layered Carbon surfaces and documented primary tonal extensions.'
  }
} as const satisfies PresetColorEvidenceRegistry;
export type CarbonIbmColorEvidenceId = keyof typeof carbonIbmColorEvidence;
