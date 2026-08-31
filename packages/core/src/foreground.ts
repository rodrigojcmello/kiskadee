import type {
  Color,
  HueName,
  InteractionState,
  SegmentName,
  ThemeMode
} from './types/colors/colors.types.ts';

export const textEmphasisValues = ['medium', 'low', 'lowest'] as const;

/** Foreground-strength levels supported by the standalone Text component. */
export type TextEmphasis = (typeof textEmphasisValues)[number];

/** Canonical chromatic foreground families. Achromatic foregrounds remain neutral. */
export type TextChromaticForeground = Exclude<HueName, 'black'>;

/** Public foreground vocabulary supported by the standalone Text component contract. */
export type TextForegroundName = 'neutral' | TextChromaticForeground;

const textForegroundValueByName = {
  neutral: 'neutral',
  red: 'red',
  orange: 'orange',
  yellow: 'yellow',
  green: 'green',
  teal: 'teal',
  cyan: 'cyan',
  blue: 'blue',
  purple: 'purple',
  pink: 'pink',
  brown: 'brown'
} as const satisfies { [TName in TextForegroundName]: TName };

export const textForegroundValues: readonly TextForegroundName[] = Object.freeze(
  Object.values(textForegroundValueByName)
);

export type ForegroundProfileId = string;

type ForegroundNonRestState = Exclude<InteractionState, 'rest'>;

export type ForegroundRestStateColorMap = {
  rest: Color;
} & Partial<Record<ForegroundNonRestState, never>>;

export type ForegroundEmphasisMap = Record<TextEmphasis, ForegroundRestStateColorMap>;

export type ForegroundSurfaceContextPalette = {
  onSubtle: ForegroundEmphasisMap;
  onVivid?: ForegroundEmphasisMap;
};

export type ForegroundProfilePalettes = Partial<
  Record<
    SegmentName | 'default' | 'dynamic',
    Partial<Record<ThemeMode, ForegroundSurfaceContextPalette>>
  >
>;

export type ForegroundProfile = {
  palettes: ForegroundProfilePalettes;
};

export type SchemaForegrounds = {
  profiles: Readonly<Record<ForegroundProfileId, ForegroundProfile>>;
};

/** Maps a component-local foreground intent to a global foreground profile. */
export type ElementForeground = Readonly<Record<string, ForegroundProfileId>>;

/** Text requires neutral and lets each preset publish any supported chromatic family. */
export type TextElementForeground = Readonly<
  { neutral: ForegroundProfileId } & Partial<Record<TextChromaticForeground, ForegroundProfileId>>
>;
