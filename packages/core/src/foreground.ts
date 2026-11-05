import type {
  Color,
  ColorVariant,
  ColorVariantPalette,
  HueName,
  SegmentName,
  SurfaceContext,
  ThemeMode
} from './types/colors/colors.types.ts';

export const textEmphasisValues = ['high', 'medium', 'low', 'lowest'] as const;

/** Foreground-strength levels supported by the standalone Text component. */
export type TextEmphasis = (typeof textEmphasisValues)[number];

/** Canonical chromatic foreground families. Achromatic foregrounds remain neutral. */
export type TextChromaticForeground = Exclude<HueName, 'black'>;

/** Canonical foreground families independently of their published profile. */
export type TextForegroundFamily = 'neutral' | TextChromaticForeground;

/** Public deep-profile aliases exposed by the standalone Text component. */
export type TextDeepForegroundName = `${TextChromaticForeground}-deep`;

/** Public foreground vocabulary supported by the standalone Text component contract. */
export type TextBaseForegroundName = TextForegroundFamily | TextDeepForegroundName;
export type TextForegroundName =
  | TextBaseForegroundName
  | `${Exclude<TextBaseForegroundName, 'neutral'>}-alt`;

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

export const textBaseForegroundValues: readonly TextBaseForegroundName[] = Object.freeze(
  textForegroundFamilyValues.flatMap((family) =>
    family === 'neutral' ? [family] : [family, `${family}-deep` as const]
  )
);

export const textForegroundValues: readonly TextForegroundName[] = Object.freeze(
  textBaseForegroundValues.flatMap((name) =>
    name === 'neutral' ? [name] : [name, `${name}-alt` as const]
  )
);

export function parseTextForegroundName(
  value: unknown
): { foreground: TextBaseForegroundName; colorVariant: ColorVariant } | undefined {
  if (typeof value !== 'string' || !textForegroundValues.includes(value as TextForegroundName))
    return undefined;
  const alternative = value.endsWith('-alt');
  return {
    foreground: (alternative ? value.slice(0, -4) : value) as TextBaseForegroundName,
    colorVariant: alternative ? 'alternative' : 'standard'
  };
}

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
  onSubtle: ForegroundColorVariants;
  onVivid?: ForegroundColorVariants;
};

export type ForegroundColorVariants = ColorVariantPalette<
  ForegroundEmphasisMap,
  Partial<ForegroundEmphasisMap>
>;

/** Whole emphasis leaves inherit; authored state maps never borrow Standard interaction states. */
export function resolveForegroundVariant(
  variants: ForegroundColorVariants,
  variant: ColorVariant
): ForegroundEmphasisMap {
  return variant === 'alternative'
    ? { ...variants.standard, ...variants.alternative }
    : variants.standard;
}

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
  profiles: Readonly<Record<ForegroundFamilyId, ForegroundFamilyProfiles>> & {
    readonly neutral?: { standard: ForegroundProfile; deep?: never };
  };
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
    Record<Exclude<TextBaseForegroundName, 'neutral'>, ForegroundProfileReference>
  >
>;

export type ForegroundCoordinate =
  `${ForegroundFamilyId}.${ForegroundProfileName}.${ThemeMode}.${SurfaceContext}.${'' | `${ColorVariant}.`}${TextEmphasis}${
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
  colorVariant: ColorVariant;
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
  const [family, profile, theme, surfaceContext, ...tail] = value
    .slice(FOREGROUND_REFERENCE_PREFIX.length)
    .split('.');
  const colorVariant =
    tail[0] === 'standard' || tail[0] === 'alternative'
      ? (tail.shift() as ColorVariant)
      : 'standard';
  const [emphasis, state = 'rest', ...extra] = tail;

  if (
    !family ||
    extra.length > 0 ||
    (profile !== 'standard' && profile !== 'deep') ||
    (family === 'neutral' && profile !== 'standard') ||
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
    colorVariant,
    emphasis: emphasis as TextEmphasis,
    state: state as ForegroundState
  };
}

type ValidForegroundCoordinate<TCoordinate extends ForegroundCoordinate> =
  TCoordinate extends `neutral.deep.${string}` ? never : TCoordinate;

type ForegroundAuthoring = {
  <TCoordinate extends ForegroundCoordinate>(
    coordinate: TCoordinate & ValidForegroundCoordinate<TCoordinate>
  ): ForegroundReferenceToken<TCoordinate>;
  parentState<TCoordinate extends ForegroundCoordinate>(
    coordinate: TCoordinate & ValidForegroundCoordinate<TCoordinate>
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
