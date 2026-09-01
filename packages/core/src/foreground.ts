import type {
  Color,
  HueName,
  SegmentName,
  SurfaceContext,
  ThemeMode
} from './types/colors/colors.types.ts';

export const textEmphasisValues = ['medium', 'low', 'lowest'] as const;

/** Foreground-strength levels supported by the standalone Text component. */
export type TextEmphasis = (typeof textEmphasisValues)[number];

/** Canonical chromatic foreground families. Achromatic foregrounds remain neutral. */
export type TextChromaticForeground = Exclude<HueName, 'black'>;

/** Canonical foreground families independently of their published profile. */
export type TextForegroundFamily = 'neutral' | TextChromaticForeground;

/** Public deep-profile aliases exposed by the standalone Text component. */
export type TextDeepForegroundName = `${TextForegroundFamily}-deep`;

/** Public foreground vocabulary supported by the standalone Text component contract. */
export type TextForegroundName = TextForegroundFamily | TextDeepForegroundName;

const textForegroundFamilyValueByName = {
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
} as const satisfies { [TName in TextForegroundFamily]: TName };

export const textForegroundFamilyValues: readonly TextForegroundFamily[] = Object.freeze(
  Object.values(textForegroundFamilyValueByName)
);

export const textForegroundValues: readonly TextForegroundName[] = Object.freeze(
  textForegroundFamilyValues.flatMap((family) => [family, `${family}-deep` as const])
);

export type ForegroundFamilyId = string;
export type ForegroundProfileName = 'standard' | 'deep';

export const foregroundStateValues = ['rest', 'hover', 'pressed', 'pending', 'disabled'] as const;

/** States that a reusable foreground coordinate may publish. */
export type ForegroundState = (typeof foregroundStateValues)[number];

type ForegroundNonRestState = Exclude<ForegroundState, 'rest'>;

export type ForegroundStateColorMap = {
  rest: Color;
} & Partial<Record<ForegroundNonRestState, Color>>;

export type ForegroundEmphasisMap = Record<TextEmphasis, ForegroundStateColorMap>;

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

export type ForegroundFamilyProfiles = {
  standard: ForegroundProfile;
  deep?: ForegroundProfile;
};

export type SchemaForegrounds = {
  profiles: Readonly<Record<ForegroundFamilyId, ForegroundFamilyProfiles>>;
};

export type ForegroundProfileReference = {
  family: ForegroundFamilyId;
  profile: ForegroundProfileName;
};

/** Maps a component-local foreground name to a family-owned global profile. */
export type ElementForeground = Readonly<Record<string, ForegroundProfileReference>>;

/** Text requires neutral and lets each preset publish any supported chromatic family. */
export type TextElementForeground = Readonly<
  { neutral: ForegroundProfileReference } & Partial<
    Record<Exclude<TextForegroundName, 'neutral'>, ForegroundProfileReference>
  >
>;

export type ForegroundCoordinate =
  `${ForegroundFamilyId}.${ForegroundProfileName}.${ThemeMode}.${SurfaceContext}.${TextEmphasis}${
    | ''
    | `.${ForegroundState}`}`;

export type ForegroundReferenceToken<TCoordinate extends string = ForegroundCoordinate> =
  `fg:${TCoordinate}`;

export type ParentStateForegroundReference<TCoordinate extends string = ForegroundCoordinate> = {
  parentState: ForegroundReferenceToken<TCoordinate>;
};

export type ParsedForegroundReference = {
  family: ForegroundFamilyId;
  profile: ForegroundProfileName;
  theme: ThemeMode;
  surfaceContext: SurfaceContext;
  emphasis: TextEmphasis;
  state: ForegroundState;
};

const FOREGROUND_REFERENCE_PREFIX = 'fg:';

export function isForegroundReferenceCandidate(value: unknown): value is `fg:${string}` {
  return typeof value === 'string' && value.startsWith(FOREGROUND_REFERENCE_PREFIX);
}

export function parseForegroundReferenceToken(
  value: string
): ParsedForegroundReference | undefined {
  if (!isForegroundReferenceCandidate(value)) return undefined;
  const [family, profile, theme, surfaceContext, emphasis, state = 'rest', ...extra] = value
    .slice(FOREGROUND_REFERENCE_PREFIX.length)
    .split('.');

  if (
    !family ||
    extra.length > 0 ||
    (profile !== 'standard' && profile !== 'deep') ||
    (theme !== 'light' && theme !== 'dark' && theme !== 'darker') ||
    (surfaceContext !== 'onSubtle' && surfaceContext !== 'onVivid') ||
    !textEmphasisValues.includes(emphasis as TextEmphasis) ||
    !foregroundStateValues.includes(state as ForegroundState)
  ) {
    return undefined;
  }

  return {
    family,
    profile,
    theme,
    surfaceContext,
    emphasis: emphasis as TextEmphasis,
    state: state as ForegroundState
  };
}

type ForegroundAuthoring = {
  <TCoordinate extends ForegroundCoordinate>(
    coordinate: TCoordinate
  ): ForegroundReferenceToken<TCoordinate>;
  parentState<TCoordinate extends ForegroundCoordinate>(
    coordinate: TCoordinate
  ): ParentStateForegroundReference<TCoordinate>;
};

/** Authors a build-time reference to one atomic coordinate in global.foregrounds. */
export const fg: ForegroundAuthoring = Object.assign(
  <TCoordinate extends ForegroundCoordinate>(coordinate: TCoordinate) =>
    `${FOREGROUND_REFERENCE_PREFIX}${coordinate}` as ForegroundReferenceToken<TCoordinate>,
  {
    parentState: <TCoordinate extends ForegroundCoordinate>(coordinate: TCoordinate) => ({
      parentState:
        `${FOREGROUND_REFERENCE_PREFIX}${coordinate}` as ForegroundReferenceToken<TCoordinate>
    })
  }
);
