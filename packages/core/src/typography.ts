import type { BreakpointValue, ElementSizeValue } from './breakpoints.ts';
import type { TextFontValue, TextWeightValue } from './types/decorations/decorations.types.ts';
import type { PixelValue } from './types/scales/scales.types.ts';

export type TypographyProfileId = string;

export const typographyProfileBuckets = {
  'body-extra-small': 'bxs',
  'body-extra-small-strong': 'bxsg',
  'body-small': 'bs',
  'body-small-strong': 'bsg',
  'body-medium': 'bm',
  'body-medium-strong': 'bmg',
  'body-large': 'bl',
  'body-large-strong': 'blg',
  'caption-small': 'cs',
  'caption-small-strong': 'csg',
  'caption-medium': 'cm',
  'caption-medium-strong': 'cmg',
  'display-small': 'ds',
  'display-large': 'dl',
  'heading-small': 'hs',
  'heading-medium': 'hm',
  'heading-large': 'hl',
  'label-small': 'ls',
  'label-small-strong': 'lsg',
  'label-medium': 'lm',
  'label-large': 'll',
  'label-extra-large': 'lxl',
  'label-display-small': 'lds',
  'label-display-large': 'ldl',
  'subtitle-small': 'ss',
  'subtitle-large': 'sl',
  'tooltip-small': 'ts',
  'tooltip-medium': 'tm'
} as const;

export type NormalizedTypographyProfileId = keyof typeof typographyProfileBuckets;

/**
 * What
 *     Resolves an author-readable typography profile ID to its compact artifact bucket.
 * Why
 *     Builders and artifact consumers must share one stable mapping without repeating it per preset.
 */
export function resolveTypographyProfileBucket(profileId: TypographyProfileId): string {
  return typographyProfileBuckets[profileId as NormalizedTypographyProfileId] ?? `x-${profileId}`;
}

export type TypographyProfile = {
  decorations: {
    textFont: TextFontValue;
    textWeight: TextWeightValue;
  };
  scales: {
    textSize: PixelValue;
    textHeight: PixelValue;
    textLetterSpacing?: PixelValue;
  };
};

export type SchemaTypography = {
  profiles: Readonly<Record<TypographyProfileId, TypographyProfile>>;
};

export type TypographyProfileByBreakpoint = {
  'bp:all': TypographyProfileId;
} & Partial<Record<Exclude<BreakpointValue, 'bp:all'>, TypographyProfileId>>;

export type ElementTypographyProfile = TypographyProfileId | TypographyProfileByBreakpoint;

type ElementTypographyForAllSizes = {
  's:all': ElementTypographyProfile;
} & Partial<Record<ElementSizeValue, never>>;

type ElementTypographyBySize = {
  's:all'?: never;
} & Partial<Record<ElementSizeValue, ElementTypographyProfile>>;

export type ElementTypography = ElementTypographyForAllSizes | ElementTypographyBySize;
