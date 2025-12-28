import type {
  DarkTrackTones,
  EmphasisLevel,
  LightTrackTones,
  PrimitiveColorName,
  PrimitiveColorRef,
  PrimitiveRole,
  Role,
  SchemaColors,
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
  roleOrPrimitive: Role | PrimitiveRole | PrimitiveColorRef,
  tone: number,
  alpha?: number
): SolidColor;

export function color(
  schema: { colors?: SchemaColors },
  segmentName: string,
  theme: ThemeShortcut,
  roleOrPrimitive: Role | PrimitiveRole | PrimitiveColorRef,
  tone: number,
  alpha?: number
): SolidColor {
  return resolveColor(schema, segmentName, theme, roleOrPrimitive, tone, alpha);
}

/**
 * Escape hatch for direct Layer 1 usage.
 *
 * This stays intentionally tiny so call sites remain ergonomic:
 * `color(schema, 'default', 'l', primitive('blue', 'linkedin'), 50)`.
 */
export function primitive(
  hue: PrimitiveColorRef['hue'],
  name: PrimitiveColorName
): PrimitiveColorRef {
  return { hue, name };
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

function parseRole(role: Role): { component: string; intent: string } {
  const firstDot = role.indexOf('.');
  const lastDot = role.lastIndexOf('.');
  if (firstDot <= 0 || lastDot !== firstDot || firstDot === role.length - 1) {
    throw new Error(`Invalid role format. Expected "component.intent", got: ${role}`);
  }
  return { component: role.slice(0, firstDot), intent: role.slice(firstDot + 1) };
}

function parsePrimitiveRole(role: PrimitiveRole): PrimitiveColorRef {
  // Expected format: primitive.<hue>.<name>
  const parts = role.split('.');
  if (parts.length !== 3) {
    throw new Error(`Invalid primitive role format. Expected "primitive.<hue>.<name>", got: ${role}`);
  }
  const [, hue, name] = parts;
  return { hue, name } as PrimitiveColorRef;
}

function isPrimitiveColorRef(value: unknown): value is PrimitiveColorRef {
  return (
    typeof value === 'object' &&
    value !== null &&
    'hue' in value &&
    'name' in value &&
    typeof (value as { hue?: unknown }).hue === 'string' &&
    typeof (value as { name?: unknown }).name === 'string'
  );
}

/**
 * Resolves a final color using the 3-layer color architecture stored in `schema.colors`.
 *
 * Notes:
 * - This is the new pipeline (Caminho B). It does not replace the legacy `color(segment, mode, semantic, ...)` yet.
 * - Only `solid` paints are supported for now (gradient intentionally disabled).
 */
export function resolveColor(
  schema: { colors?: SchemaColors },
  segmentName: string,
  theme: ThemeShortcut,
  roleOrPrimitive: Role | PrimitiveRole | PrimitiveColorRef,
  tone: number,
  alpha?: number
): SolidColor {
  // `segmentName` is kept for per-segment overrides.
  const themeName: ThemeName = theme === 'l' ? 'light' : 'dark';

  const colors = requireSchemaColors(schema.colors);

  const primitiveRef: PrimitiveColorRef =
    typeof roleOrPrimitive === 'string'
      ? (() => {
          if (roleOrPrimitive.startsWith('primitive.')) {
            return parsePrimitiveRole(roleOrPrimitive as PrimitiveRole);
          }

          const { component, intent } = parseRole(roleOrPrimitive as Role);
          const intentValue = colors.componentIntents?.[component]?.[intent];
          if (!intentValue) {
            throw new Error(`Intent not mapped for role=${roleOrPrimitive}`);
          }

          if (typeof intentValue === 'string') {
            const bySegment = colors.globalSemanticsBySegment?.[segmentName];

            // Migration note:
            // - New shape: `{ meta, themes }`
            // - Legacy shape: `{ [themeName]: { ... } }`
            const segmentThemes =
              bySegment && typeof bySegment === 'object' && 'themes' in bySegment
                ? (bySegment as { themes?: unknown }).themes
                : bySegment;

            const paint =
              (segmentThemes as Record<string, any> | undefined)?.[themeName]?.[intentValue] ??
              colors.globalSemantics?.[themeName]?.[intentValue];
            if (!paint) {
              throw new Error(
                `Global semantic not mapped for semantic=${intentValue} theme=${theme} (role=${roleOrPrimitive})`
              );
            }
            return paint.solid;
          }

          if (!isPrimitiveColorRef(intentValue)) {
            throw new Error(`Invalid intent value for role=${roleOrPrimitive}`);
          }

          return intentValue;
        })()
      : roleOrPrimitive;

  const asset = colors.primitiveColors?.[primitiveRef.hue]?.[primitiveRef.name];
  const emphasis = asset?.solid?.[themeName];
  if (!emphasis) {
    throw new Error(
      `Primitive color asset not found for hue=${primitiveRef.hue} name=${primitiveRef.name} theme=${theme}`
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

  return typeof alpha === 'number' ? (withAlpha(value, alpha) as SolidColor) : value;
}
