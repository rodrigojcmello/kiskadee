import type { BreakpointValue, ElementSizeValue } from './breakpoints.ts';
import type {
  Color,
  InteractionState,
  SegmentName,
  SurfaceContextPalette,
  ThemeMode
} from './types/colors/colors.types.ts';
import type { PixelValue } from './types/scales/scales.types.ts';

export type SeparatorProfileId = string;

type SeparatorNonRestState = Exclude<InteractionState, 'rest'>;

export type SeparatorRestStateColorMap = {
  rest: Color;
} & Partial<Record<SeparatorNonRestState, never>>;

export type SeparatorColorSchema = {
  boxColor: {
    neutral: {
      medium: SeparatorRestStateColorMap;
    };
  };
  borderColor?: never;
  textColor?: never;
};

export type SeparatorProfilePalettes = Partial<
  Record<
    SegmentName | 'default' | 'dynamic',
    Partial<Record<ThemeMode, SurfaceContextPalette<SeparatorColorSchema>>>
  >
>;

export type SeparatorProfile = {
  scales: {
    boxWidth: PixelValue;
  };
  palettes: SeparatorProfilePalettes;
};

export type SchemaSeparators = {
  profiles: Readonly<Record<SeparatorProfileId, SeparatorProfile>>;
};

export type SeparatorProfileByBreakpoint = {
  'bp:all': SeparatorProfileId;
} & Partial<Record<Exclude<BreakpointValue, 'bp:all'>, SeparatorProfileId>>;

export type ElementSeparatorProfile = SeparatorProfileId | SeparatorProfileByBreakpoint;

type ElementSeparatorForAllSizes = {
  's:all': ElementSeparatorProfile;
} & Partial<Record<ElementSizeValue, never>>;

type ElementSeparatorBySize = {
  's:all'?: never;
} & Partial<Record<ElementSizeValue, ElementSeparatorProfile>>;

export type ElementSeparator = ElementSeparatorForAllSizes | ElementSeparatorBySize;
