import type {
  Color,
  DarkTrackTones,
  EmphasisLevel,
  HueName,
  LightTrackTones,
  PrimitiveColorName,
  PrimitiveColorRef,
  PrimitiveRole,
  ResolvedGradient,
  Role,
  RoleWithPaint,
  SchemaColors,
  SemanticColor,
  SolidColor,
  ThemeName,
  ThemeShortcut
} from '../types/colors/colors.types';
import { withAlpha } from './withAlpha';

function resolveSeriesAndKey(
  tone: number
): { series: 'subtle'; key: LightTrackTones } | { series: 'vivid'; key: DarkTrackTones } {
  // Normalized grids:
  // subtle: 0–15 (step 1), then 20, 25, 30
  // vivid: 35–100 (step 5)
  const subtleKeys: LightTrackTones[] = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 20, 25, 30
  ] as const;
  const vividKeys: DarkTrackTones[] = [
    35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100
  ] as const;

  if (tone <= 30) {
    const clamped = Math.max(0, Math.min(30, Math.round(tone)));
    // snap to nearest allowed subtle key
    let best = subtleKeys[0];
    let bestDiff = Math.abs(clamped - best);
    for (const k of subtleKeys) {
      const diff = Math.abs(clamped - k);
      if (diff < bestDiff) {
        best = k;
        bestDiff = diff;
      }
    }
    return { series: 'subtle', key: best };
  }

  const clamped = Math.max(35, Math.min(100, Math.round(tone)));
  let best = vividKeys[0];
  let bestDiff = Math.abs(clamped - best);
  for (const k of vividKeys) {
    const diff = Math.abs(clamped - k);
    if (diff < bestDiff) {
      best = k;
      bestDiff = diff;
    }
  }
  return { series: 'vivid', key: best };
}

export function color(
  schema: { colors?: SchemaColors },
  segmentName: string,
  theme: ThemeShortcut,
  roleOrPrimitive: PrimitiveRole,
  tone: number,
  alpha?: number
): SolidColor;

export function color(
  schema: { colors?: SchemaColors },
  segmentName: string,
  theme: ThemeShortcut,
  roleOrPrimitive: `${string}.${string}` | `${string}.${string}.solid`,
  tone: number,
  alpha?: number
): SolidColor;

export function color(
  schema: { colors?: SchemaColors },
  segmentName: string,
  theme: ThemeShortcut,
  roleOrPrimitive: `${string}.${string}.gradient`,
  tone: number | number[],
  alpha?: number
): ResolvedGradient;

export function color(
  schema: { colors?: SchemaColors },
  segmentName: string,
  theme: ThemeShortcut,
  roleOrPrimitive: RoleWithPaint | PrimitiveRole,
  tone: number | number[],
  alpha?: number
): Color {
  return resolveColor(schema, segmentName, theme, roleOrPrimitive, tone, alpha);
}

/**
 * Escape hatch for direct Layer 1 usage.
 *
 * This stays intentionally tiny so call sites remain ergonomic:
 * `color(schema, 'default', 'l', primitive('blue', 'linkedin'), 50)`.
 */
export function primitive(hue: HueName, name: PrimitiveColorName): PrimitiveRole {
  return `primitive.${hue}.${name}` as PrimitiveRole;
}

type ResolvedBucket =
  | { series: 'subtle'; bucket: Partial<Record<LightTrackTones, SolidColor>>; key: LightTrackTones }
  | { series: 'vivid'; bucket: Partial<Record<DarkTrackTones, SolidColor>>; key: DarkTrackTones };

function resolveBucketFromEmphasis(emphasis: EmphasisLevel, tone: number): ResolvedBucket {
  const { series, key } = resolveSeriesAndKey(tone);

  if (series === 'subtle') {
    const bucket = emphasis?.subtle as Partial<Record<LightTrackTones, SolidColor>> | undefined;
    if (!bucket) {
      throw new Error('Missing subtle bucket for resolved emphasis level');
    }
    return { series, bucket, key };
  }

  const bucket = emphasis?.vivid as Partial<Record<DarkTrackTones, SolidColor>> | undefined;
  if (!bucket) {
    throw new Error('Missing vivid bucket for resolved emphasis level');
  }
  return { series, bucket, key };
}

function requireSchemaColors(colors: SchemaColors | undefined): Required<SchemaColors> {
  if (!colors) {
    throw new Error('Schema is missing `colors` configuration');
  }
  if (!colors.primitiveColors) {
    throw new Error('Schema is missing `colors.primitiveColors`');
  }
  if (!colors.globalSemantics) {
    throw new Error('Schema is missing `colors.globalSemantics`');
  }
  if (!colors.componentIntents) {
    throw new Error('Schema is missing `colors.componentIntents`');
  }
  return colors as Required<SchemaColors>;
}

type PaintKind = 'solid' | 'gradient';

function parseRole(role: RoleWithPaint): { component: string; intent: string; paint: PaintKind } {
  const parts = role.split('.');
  if (parts.length === 2) {
    const [component, intent] = parts;
    if (!component || !intent) {
      throw new Error(`Invalid role format. Expected "component.intent[.paint]", got: ${role}`);
    }
    return { component, intent, paint: 'solid' };
  }

  if (parts.length === 3) {
    const [component, intent, paintRaw] = parts;
    if (!component || !intent || !paintRaw) {
      throw new Error(`Invalid role format. Expected "component.intent[.paint]", got: ${role}`);
    }
    if (paintRaw !== 'solid' && paintRaw !== 'gradient') {
      throw new Error(
        `Invalid role paint. Expected "solid" or "gradient", got: ${paintRaw} (role=${role})`
      );
    }
    return { component, intent, paint: paintRaw };
  }

  throw new Error(`Invalid role format. Expected "component.intent[.paint]", got: ${role}`);
}

function parsePrimitiveRole(role: PrimitiveRole): PrimitiveColorRef {
  // Expected format: primitive.<hue>.<name>
  const parts = role.split('.');
  if (parts.length !== 3) {
    throw new Error(
      `Invalid primitive role format. Expected "primitive.<hue>.<name>", got: ${role}`
    );
  }
  const [, hue, name] = parts;
  return { hue, name } as PrimitiveColorRef;
}

function resolveSolidFromPrimitiveRef(
  colors: Required<SchemaColors>,
  themeName: ThemeName,
  primitiveRef: PrimitiveColorRef,
  tone: number
): SolidColor {
  const asset = colors.primitiveColors?.[primitiveRef.hue]?.[primitiveRef.name];
  const emphasis = asset?.solid?.[themeName];
  if (!emphasis) {
    throw new Error(
      `Primitive color asset not found for hue=${primitiveRef.hue} name=${primitiveRef.name} theme=${themeName}`
    );
  }

  const resolved = resolveBucketFromEmphasis(emphasis, tone);
  const value = resolved.bucket[resolved.key as never] as SolidColor | undefined;
  if (!value) {
    const available = Object.keys(resolved.bucket).join(', ');
    throw new Error(
      `Tone ${resolved.key} not available in primitive hue=${primitiveRef.hue} name=${primitiveRef.name} series=${resolved.series}. Available: ${available}`
    );
  }

  return value;
}

/**
 * Resolves a final color using the 3-layer color architecture stored in `schema.colors`.
 *
 * Notes:
 * - This is the new pipeline. It does not replace the legacy `color(segment, mode, semantic, ...)` yet.
 * - Only `solid` paints are supported for now (gradient intentionally disabled).
 */
export function resolveColor(
  schema: { colors?: SchemaColors },
  segmentName: string,
  theme: ThemeShortcut,
  roleOrPrimitive: RoleWithPaint | PrimitiveRole,
  tone: number | number[],
  alpha?: number
): Color {
  // `segmentName` is kept for per-segment overrides.
  const themeName: ThemeName = theme === 'l' ? 'light' : 'dark';

  const colors = requireSchemaColors(schema.colors);

  if (roleOrPrimitive.startsWith('primitive.')) {
    // Direct Layer 1 usage (always solid for now).
    if (Array.isArray(tone)) {
      throw new Error(
        `Invalid tone. Expected number for primitive role, got array (role=${roleOrPrimitive})`
      );
    }
    const primitiveRef = parsePrimitiveRole(roleOrPrimitive as PrimitiveRole);
    const value = resolveSolidFromPrimitiveRef(colors, themeName, primitiveRef, tone);
    return typeof alpha === 'number' ? (withAlpha(value, alpha) as SolidColor) : value;
  }

  const { component, intent, paint } = parseRole(roleOrPrimitive as RoleWithPaint);
  const intentValue = colors.componentIntents?.[component]?.[intent];
  if (!intentValue) {
    throw new Error(`Intent not mapped for role=${roleOrPrimitive}`);
  }

  const semanticEntry =
    colors.globalSemanticsBySegment?.[segmentName]?.themes?.[themeName]?.[
      intentValue as SemanticColor
    ] ?? colors.globalSemantics?.[themeName]?.[intentValue as SemanticColor];

  const primitiveRole: PrimitiveRole | undefined = intentValue.startsWith('primitive.')
    ? (intentValue as PrimitiveRole)
    : typeof semanticEntry === 'string'
      ? (semanticEntry as PrimitiveRole)
      : semanticEntry?.v1;

  if (!primitiveRole) {
    throw new Error(`Global semantic not mapped for role=${roleOrPrimitive} theme=${theme}`);
  }

  const basePrimitiveRef = parsePrimitiveRole(primitiveRole);

  if (paint === 'solid') {
    if (Array.isArray(tone)) {
      throw new Error(
        `Invalid tone. Expected number for solid role, got array (role=${roleOrPrimitive})`
      );
    }
    const value = resolveSolidFromPrimitiveRef(colors, themeName, basePrimitiveRef, tone);
    return typeof alpha === 'number' ? (withAlpha(value, alpha) as SolidColor) : value;
  }

  // paint === 'gradient'
  const asset = colors.primitiveColors?.[basePrimitiveRef.hue]?.[basePrimitiveRef.name];
  const template = asset?.gradient;
  if (!template) {
    throw new Error(
      `Gradient not defined for primitive hue=${basePrimitiveRef.hue} name=${basePrimitiveRef.name} (role=${roleOrPrimitive})`
    );
  }

  const tones: number[] = Array.isArray(tone) ? tone : template.stops.map(() => tone);
  if (Array.isArray(tone) && tone.length !== template.stops.length) {
    throw new Error(
      `Invalid gradient tones length. Expected ${template.stops.length}, got ${tone.length} (role=${roleOrPrimitive})`
    );
  }

  const resolvedStops: ResolvedGradient['stops'] = template.stops.map((stop, idx) => {
    const stopRef = parsePrimitiveRole(stop.primitive as PrimitiveRole);
    const stopColor = resolveSolidFromPrimitiveRef(colors, themeName, stopRef, tones[idx]!);
    const finalColor =
      typeof alpha === 'number' ? (withAlpha(stopColor, alpha) as SolidColor) : stopColor;
    return { color: finalColor, position: stop.position };
  });

  return {
    kind: 'linear',
    angle: template.angle,
    stops: resolvedStops
  } satisfies ResolvedGradient;
}
