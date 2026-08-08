import type { BreakpointValue, ElementSizeValue } from './breakpoints.ts';
import type { TextFontValue, TextWeightValue } from './types/decorations/decorations.types.ts';
import type { PixelValue } from './types/scales/scales.types.ts';

export type TypographyProfileId = string;

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
