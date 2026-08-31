import type { KiskadeeTone, PrimitiveRole, TonalFunctionalReferenceName } from '@kiskadee/core';
import type {
  PresetCapColorLocator,
  PresetColorLocator,
  PresetExactColorLocator,
  PresetFamilyColorLocator,
  PresetReferenceColorLocator,
  PresetSolidColorRole,
  StrictPresetColorResolver
} from '../../utils/presetColor.ts';
import type { Fluent2MicrosoftColorEvidenceId } from './fluent-2-microsoft.color-evidence.ts';

export type Fluent2MicrosoftSegmentName = 'default';
export type Fluent2MicrosoftColorLocator = PresetColorLocator<Fluent2MicrosoftColorEvidenceId>;
export type Fluent2MicrosoftFamilyColorLocator =
  PresetFamilyColorLocator<Fluent2MicrosoftColorEvidenceId>;
export type Fluent2MicrosoftColorResolver = StrictPresetColorResolver<
  Fluent2MicrosoftSegmentName,
  Fluent2MicrosoftColorEvidenceId
>;

type NonGradientRole<TRole extends PresetSolidColorRole> = TRole extends `${string}.gradient`
  ? never
  : TRole;

export function referenceColor<const TRole extends PresetSolidColorRole>(
  role: NonGradientRole<TRole>,
  reference: TonalFunctionalReferenceName,
  offset = 0,
  alpha?: number
): PresetReferenceColorLocator & { role: TRole } {
  return { mode: 'reference', role, reference, offset, alpha };
}

export function familyReferenceColor(
  reference: TonalFunctionalReferenceName,
  offset = 0,
  alpha?: number
): PresetReferenceColorLocator {
  return { mode: 'reference', reference, offset, alpha };
}

export function exactColor<const TRole extends PresetSolidColorRole>(
  role: NonGradientRole<TRole>,
  tone: KiskadeeTone,
  evidenceId: Fluent2MicrosoftColorEvidenceId,
  alpha?: number
): PresetExactColorLocator<Fluent2MicrosoftColorEvidenceId> & {
  role: TRole;
} {
  return { mode: 'exact', role, tone, evidenceId, alpha };
}

export function familyExactColor(
  tone: KiskadeeTone,
  evidenceId: Fluent2MicrosoftColorEvidenceId,
  alpha?: number
): PresetExactColorLocator<Fluent2MicrosoftColorEvidenceId> {
  return { mode: 'exact', tone, evidenceId, alpha };
}

export function absoluteCap(
  primitive: PrimitiveRole,
  polarity: 'light' | 'dark',
  alpha?: number
): PresetCapColorLocator {
  return { mode: 'cap', primitive, polarity, alpha };
}
