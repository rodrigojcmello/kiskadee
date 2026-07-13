import { deltaEOk, hexToOklch, normalizeHexColor, type OklchColor } from './color-math.ts';

export const MUNSELL_OKLCH_PROJECTION = 'munsell-oklch-v1' as const;

export const MUNSELL_OKLCH_SECTOR_ORDER = [
  'red',
  'yellow-red',
  'yellow',
  'green-yellow',
  'green',
  'blue-green',
  'blue',
  'purple-blue',
  'purple',
  'red-purple'
] as const;

export type MunsellOklchSector = (typeof MUNSELL_OKLCH_SECTOR_ORDER)[number];

export const MUNSELL_OKLCH_SECTOR_CENTERS = {
  red: 24,
  'yellow-red': 60,
  yellow: 90,
  'green-yellow': 116,
  green: 145,
  'blue-green': 198,
  blue: 250,
  'purple-blue': 276,
  purple: 322,
  'red-purple': 351
} as const satisfies Record<MunsellOklchSector, number>;

export const MUNSELL_OKLCH_SAFE_CORE = {
  start: 0.15,
  end: 0.85
} as const;

export const MUNSELL_OKLCH_SIGNATURE_TRANSFER = 0.4;

export const MUNSELL_OKLCH_PRIMARY_CHROMA = {
  minimum: 0.005,
  lowConfidenceCeiling: 0.02
} as const;

export const MUNSELL_YELLOW_RED_PROTOTYPES = {
  v1: {
    appearance: 'orange',
    hex: '#ca5010'
  },
  v2: {
    appearance: 'brown',
    hex: '#8e562e'
  }
} as const;

export type MunsellOklchSectorDefinition = {
  sector: MunsellOklchSector;
  centerHue: number;
  startHue: number;
  endHue: number;
  spanDegrees: number;
  safeStartHue: number;
  safeEndHue: number;
};

export type MunsellHueClassification = {
  projection: typeof MUNSELL_OKLCH_PROJECTION;
  sector: MunsellOklchSector;
  hue: number;
  positionInSector: number;
  isInSafeCore: boolean;
  boundarySide: 'start' | 'end' | null;
  nearestSafeHue: number;
};

export type MunsellClassificationDiagnostic = {
  severity: 'error' | 'review';
  code:
    | 'MUNSELL_PRIMARY_CHROMA_UNRELIABLE'
    | 'MUNSELL_PRIMARY_CHROMA_LOW_CONFIDENCE'
    | 'MUNSELL_HUE_NEAR_BOUNDARY';
  message: string;
};

export type MunsellColorClassification = MunsellHueClassification & {
  oklch: OklchColor;
  validForPrimary: boolean;
  diagnostics: MunsellClassificationDiagnostic[];
};

export type MunsellHexClassification = MunsellColorClassification & {
  hex: string;
};

export type MunsellHueProjection = {
  projection: typeof MUNSELL_OKLCH_PROJECTION;
  source: MunsellHueClassification;
  targetSector: MunsellOklchSector;
  rawTargetHue: number;
  projectedHue: number;
  projectedPosition: number;
  clampedToSafeCore: boolean;
};

export type YellowRedVariantSuggestion = {
  inputSector: MunsellOklchSector;
  variant: keyof typeof MUNSELL_YELLOW_RED_PROTOTYPES;
  appearance: (typeof MUNSELL_YELLOW_RED_PROTOTYPES)[keyof typeof MUNSELL_YELLOW_RED_PROTOTYPES]['appearance'];
  distances: {
    v1: number;
    v2: number;
  };
};

export const MUNSELL_OKLCH_SECTOR_DEFINITIONS = Object.freeze(
  MUNSELL_OKLCH_SECTOR_ORDER.map((sector, index): MunsellOklchSectorDefinition => {
    const centerHue = MUNSELL_OKLCH_SECTOR_CENTERS[sector];
    const previousSector =
      MUNSELL_OKLCH_SECTOR_ORDER[
        (index - 1 + MUNSELL_OKLCH_SECTOR_ORDER.length) % MUNSELL_OKLCH_SECTOR_ORDER.length
      ];
    const nextSector = MUNSELL_OKLCH_SECTOR_ORDER[(index + 1) % MUNSELL_OKLCH_SECTOR_ORDER.length];
    let previousCenter = MUNSELL_OKLCH_SECTOR_CENTERS[previousSector];
    let nextCenter = MUNSELL_OKLCH_SECTOR_CENTERS[nextSector];

    if (previousCenter > centerHue) previousCenter -= 360;
    if (nextCenter < centerHue) nextCenter += 360;

    const unwrappedStart = (previousCenter + centerHue) / 2;
    const unwrappedEnd = (centerHue + nextCenter) / 2;
    const spanDegrees = unwrappedEnd - unwrappedStart;

    return Object.freeze({
      sector,
      centerHue,
      startHue: normalizeMunsellHue(unwrappedStart),
      endHue: normalizeMunsellHue(unwrappedEnd),
      spanDegrees,
      safeStartHue: normalizeMunsellHue(
        unwrappedStart + spanDegrees * MUNSELL_OKLCH_SAFE_CORE.start
      ),
      safeEndHue: normalizeMunsellHue(unwrappedStart + spanDegrees * MUNSELL_OKLCH_SAFE_CORE.end)
    });
  })
);

export function normalizeMunsellHue(hue: number): number {
  if (!Number.isFinite(hue)) throw new TypeError('Munsell projection hue must be finite.');

  const normalized = ((hue % 360) + 360) % 360;
  return Object.is(normalized, -0) ? 0 : normalized;
}

export function getMunsellOklchSectorDefinition(
  sector: MunsellOklchSector
): MunsellOklchSectorDefinition {
  const definition = MUNSELL_OKLCH_SECTOR_DEFINITIONS.find(
    (candidate) => candidate.sector === sector
  );

  if (!definition) throw new RangeError(`Unsupported Munsell sector: ${sector}`);
  return definition;
}

export function getMunsellOklchSectorCenterPosition(sector: MunsellOklchSector): number {
  return positionAtCenter(getMunsellOklchSectorDefinition(sector));
}

export function classifyMunsellHue(hue: number): MunsellHueClassification {
  const normalizedHue = normalizeMunsellHue(hue);
  const definition = MUNSELL_OKLCH_SECTOR_DEFINITIONS.find(
    (candidate) => circularDistance(candidate.startHue, normalizedHue) < candidate.spanDegrees
  );

  if (!definition) {
    throw new Error(`Munsell projection does not cover hue ${normalizedHue}.`);
  }

  const positionInSector =
    circularDistance(definition.startHue, normalizedHue) / definition.spanDegrees;
  const isInSafeCore =
    positionInSector >= MUNSELL_OKLCH_SAFE_CORE.start &&
    positionInSector <= MUNSELL_OKLCH_SAFE_CORE.end;
  const safePosition = clamp(
    positionInSector,
    MUNSELL_OKLCH_SAFE_CORE.start,
    MUNSELL_OKLCH_SAFE_CORE.end
  );

  return {
    projection: MUNSELL_OKLCH_PROJECTION,
    sector: definition.sector,
    hue: normalizedHue,
    positionInSector,
    isInSafeCore,
    boundarySide: isInSafeCore ? null : positionInSector < 0.5 ? 'start' : 'end',
    nearestSafeHue: hueAtPosition(definition, safePosition)
  };
}

export function classifyMunsellOklch(oklch: OklchColor): MunsellColorClassification {
  assertOklch(oklch);

  const normalizedOklch = { ...oklch, h: normalizeMunsellHue(oklch.h) };
  const hueClassification = classifyMunsellHue(normalizedOklch.h);
  const diagnostics: MunsellClassificationDiagnostic[] = [];

  if (normalizedOklch.c < MUNSELL_OKLCH_PRIMARY_CHROMA.minimum) {
    diagnostics.push({
      severity: 'error',
      code: 'MUNSELL_PRIMARY_CHROMA_UNRELIABLE',
      message: `Chroma ${normalizedOklch.c} is below the ${MUNSELL_OKLCH_PRIMARY_CHROMA.minimum} minimum for a chromatic primary.`
    });
  } else if (normalizedOklch.c < MUNSELL_OKLCH_PRIMARY_CHROMA.lowConfidenceCeiling) {
    diagnostics.push({
      severity: 'review',
      code: 'MUNSELL_PRIMARY_CHROMA_LOW_CONFIDENCE',
      message: `Chroma ${normalizedOklch.c} is below the ${MUNSELL_OKLCH_PRIMARY_CHROMA.lowConfidenceCeiling} confidence threshold.`
    });
  }

  if (!hueClassification.isInSafeCore) {
    diagnostics.push({
      severity: 'review',
      code: 'MUNSELL_HUE_NEAR_BOUNDARY',
      message: `Hue ${hueClassification.hue} is in the outer 15% of the ${hueClassification.sector} sector.`
    });
  }

  return {
    ...hueClassification,
    oklch: normalizedOklch,
    validForPrimary: diagnostics.every((diagnostic) => diagnostic.severity !== 'error'),
    diagnostics
  };
}

export function classifyMunsellHex(seedHex: string): MunsellHexClassification {
  const hex = normalizeHexColor(seedHex);
  if (!hex) throw new Error(`Invalid sRGB hex color: ${seedHex}`);

  return {
    ...classifyMunsellOklch(hexToOklch(hex)),
    hex
  };
}

export function projectMunsellHue(
  sourceHue: number,
  targetSector: MunsellOklchSector
): MunsellHueProjection {
  const source = classifyMunsellHue(sourceHue);
  const sourceDefinition = getMunsellOklchSectorDefinition(source.sector);
  const targetDefinition = getMunsellOklchSectorDefinition(targetSector);
  const centeredCoordinate = positionToCenteredCoordinate(
    sourceDefinition,
    source.positionInSector
  );
  const transferredCoordinate = centeredCoordinate * MUNSELL_OKLCH_SIGNATURE_TRANSFER;
  const rawTargetPosition = centeredCoordinateToPosition(targetDefinition, transferredCoordinate);
  const projectedPosition = clamp(
    rawTargetPosition,
    MUNSELL_OKLCH_SAFE_CORE.start,
    MUNSELL_OKLCH_SAFE_CORE.end
  );

  return {
    projection: MUNSELL_OKLCH_PROJECTION,
    source,
    targetSector,
    rawTargetHue: hueAtPosition(targetDefinition, rawTargetPosition),
    projectedHue: hueAtPosition(targetDefinition, projectedPosition),
    projectedPosition,
    clampedToSafeCore: projectedPosition !== rawTargetPosition
  };
}

export function suggestYellowRedVariant(input: string | OklchColor): YellowRedVariantSuggestion {
  const oklch = typeof input === 'string' ? resolveHexOklch(input) : normalizeOklch(input);
  const classification = classifyMunsellHue(oklch.h);
  const distances = {
    v1: deltaEOk(oklch, hexToOklch(MUNSELL_YELLOW_RED_PROTOTYPES.v1.hex)),
    v2: deltaEOk(oklch, hexToOklch(MUNSELL_YELLOW_RED_PROTOTYPES.v2.hex))
  };
  const variant = distances.v1 <= distances.v2 ? 'v1' : 'v2';

  return {
    inputSector: classification.sector,
    variant,
    appearance: MUNSELL_YELLOW_RED_PROTOTYPES[variant].appearance,
    distances
  };
}

function hueAtPosition(definition: MunsellOklchSectorDefinition, position: number): number {
  return normalizeMunsellHue(definition.startHue + definition.spanDegrees * position);
}

function positionAtCenter(definition: MunsellOklchSectorDefinition): number {
  return circularDistance(definition.startHue, definition.centerHue) / definition.spanDegrees;
}

function positionToCenteredCoordinate(
  definition: MunsellOklchSectorDefinition,
  position: number
): number {
  const centerPosition = positionAtCenter(definition);

  return position <= centerPosition
    ? (position - centerPosition) / centerPosition
    : (position - centerPosition) / (1 - centerPosition);
}

function centeredCoordinateToPosition(
  definition: MunsellOklchSectorDefinition,
  coordinate: number
): number {
  const centerPosition = positionAtCenter(definition);

  return coordinate <= 0
    ? centerPosition + coordinate * centerPosition
    : centerPosition + coordinate * (1 - centerPosition);
}

function circularDistance(startHue: number, endHue: number): number {
  return normalizeMunsellHue(endHue - startHue);
}

function normalizeOklch(oklch: OklchColor): OklchColor {
  assertOklch(oklch);
  return { ...oklch, h: normalizeMunsellHue(oklch.h) };
}

function resolveHexOklch(seedHex: string): OklchColor {
  const hex = normalizeHexColor(seedHex);
  if (!hex) throw new Error(`Invalid sRGB hex color: ${seedHex}`);
  return hexToOklch(hex);
}

function assertOklch(oklch: OklchColor): void {
  if (
    !Number.isFinite(oklch.l) ||
    !Number.isFinite(oklch.c) ||
    !Number.isFinite(oklch.h) ||
    oklch.l < 0 ||
    oklch.l > 100 ||
    oklch.c < 0
  ) {
    throw new RangeError('OKLCH color must use finite L 0-100, non-negative C, and finite H.');
  }
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
