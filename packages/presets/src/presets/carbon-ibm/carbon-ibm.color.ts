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
import type { CarbonIbmColorEvidenceId } from './carbon-ibm.color-evidence.ts';

export type CarbonIbmSegmentName = 'default';
export type CarbonIbmColorLocator = PresetColorLocator<CarbonIbmColorEvidenceId>;
export type CarbonIbmFamilyColorLocator = PresetFamilyColorLocator<CarbonIbmColorEvidenceId>;
export type CarbonIbmColorResolver = StrictPresetColorResolver<
  CarbonIbmSegmentName,
  CarbonIbmColorEvidenceId
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
  evidenceId: CarbonIbmColorEvidenceId,
  alpha?: number
): PresetExactColorLocator<CarbonIbmColorEvidenceId> & {
  role: TRole;
} {
  return { mode: 'exact', role, tone, evidenceId, alpha };
}

export function familyExactColor(
  tone: KiskadeeTone,
  evidenceId: CarbonIbmColorEvidenceId,
  alpha?: number
): PresetExactColorLocator<CarbonIbmColorEvidenceId> {
  return { mode: 'exact', tone, evidenceId, alpha };
}

export function absoluteCap(
  primitive: PrimitiveRole,
  polarity: 'light' | 'dark',
  alpha?: number
): PresetCapColorLocator {
  return { mode: 'cap', primitive, polarity, alpha };
}
