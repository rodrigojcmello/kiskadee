import type {
  Color,
  HueName,
  IntentValue,
  KiskadeeTone,
  PrimitiveColorName,
  PrimitiveColorRef,
  PrimitiveRole,
  ResolvedGradient,
  RoleWithPaint,
  SchemaColors,
  SemanticColor,
  SolidColor,
  ThemeName,
  ThemeShortcut,
  TonalFunctionalReferenceName
} from '../types/colors/colors.types.ts';
import { assertKiskadeeCssScale, assertKiskadeeHexScale, isKiskadeeTone } from './hexColor.ts';
import { resolvePrimitiveFunctionalTone } from './tonalReference.ts';
import { withAlpha } from './withAlpha.ts';

export function color(
  schema: { colors?: SchemaColors },
  segmentName: string,
  theme: ThemeShortcut,
  roleOrPrimitive: PrimitiveRole,
  tone: KiskadeeTone,
  alpha?: number
): SolidColor;

export function color(
  schema: { colors?: SchemaColors },
  segmentName: string,
  theme: ThemeShortcut,
  roleOrPrimitive: `${string}.${string}` | `${string}.${string}.solid`,
  tone: KiskadeeTone,
  alpha?: number
): SolidColor;

export function color(
  schema: { colors?: SchemaColors },
  segmentName: string,
  theme: ThemeShortcut,
  roleOrPrimitive: `${string}.${string}.gradient`,
  tone: KiskadeeTone | KiskadeeTone[],
  alpha?: number
): ResolvedGradient;

export function color(
  schema: { colors?: SchemaColors },
  segmentName: string,
  theme: ThemeShortcut,
  roleOrPrimitive: RoleWithPaint | PrimitiveRole,
  tone: KiskadeeTone | KiskadeeTone[],
  alpha?: number
): Color {
  return resolveColor(schema, segmentName, theme, roleOrPrimitive, tone, alpha);
}

/**
 * Escape hatch for direct Layer 1 usage.
 *
 * This stays intentionally tiny so call sites remain ergonomic:
 * `color(schema, 'default', 'l', primitive('blue', 'v1'), 50)`.
 */
export function primitive(hue: HueName, name: PrimitiveColorName): PrimitiveRole {
  return `primitive.${hue}.${name}` as PrimitiveRole;
}

export function colorByReference(
  schema: { colors?: SchemaColors },
  segmentName: string,
  theme: ThemeShortcut,
  roleOrPrimitive: PrimitiveRole | `${string}.${string}` | `${string}.${string}.solid`,
  reference: TonalFunctionalReferenceName,
  offset = 0,
  alpha?: number
): SolidColor {
  const themeName: ThemeName = theme === 'l' ? 'light' : 'dark';
  const colors = requireSchemaColors(schema.colors);
  const primitiveRole = resolveSolidPrimitiveRole(colors, segmentName, themeName, roleOrPrimitive);
  const primitiveRef = parsePrimitiveRole(primitiveRole);
  const asset = colors.primitiveColors?.[primitiveRef.hue]?.[primitiveRef.name];
  if (!asset) {
    throw new Error(
      `Primitive color asset not found for hue=${primitiveRef.hue} name=${primitiveRef.name}`
    );
  }

  const tone = resolvePrimitiveFunctionalTone(asset, themeName, reference, offset);
  const value = resolveSolidFromPrimitiveRef(colors, themeName, primitiveRef, tone);
  return typeof alpha === 'number' ? (withAlpha(value, alpha) as SolidColor) : value;
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

function resolveComponentIntent(
  colors: Required<SchemaColors>,
  component: string,
  intent: string
): IntentValue | undefined {
  const componentIntents = colors.componentIntents as Partial<
    Record<string, Partial<Record<string, IntentValue>>>
  >;
  return componentIntents[component]?.[intent];
}

type PaintKind = 'solid' | 'gradient';

function parseRole(role: RoleWithPaint): { component: string; intent: string; paint: PaintKind } {
  const parts = role.split('.');
  if (parts.length < 2 || parts.some((part) => part.length === 0)) {
    throw new Error(
      `Invalid role format. Expected "component.intent[.intent...][.paint]", got: ${role}`
    );
  }

  const component = parts[0] as string;
  const possiblePaint = parts.at(-1);
  const hasExplicitPaint = possiblePaint === 'solid' || possiblePaint === 'gradient';
  const intentParts = parts.slice(1, hasExplicitPaint ? -1 : undefined);

  if (intentParts.length === 0) {
    throw new Error(
      `Invalid role format. Expected "component.intent[.intent...][.paint]", got: ${role}`
    );
  }

  return {
    component,
    intent: intentParts.join('.'),
    paint: hasExplicitPaint ? possiblePaint : 'solid'
  };
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
  tone: KiskadeeTone
): SolidColor {
  const asset = colors.primitiveColors?.[primitiveRef.hue]?.[primitiveRef.name];
  const scale = asset?.scales?.[themeName];
  if (!scale) {
    throw new Error(
      `Primitive color asset not found for hue=${primitiveRef.hue} name=${primitiveRef.name} theme=${themeName}`
    );
  }

  if (!isKiskadeeTone(tone)) {
    throw new Error(`Unknown Kiskadee tone: ${tone}`);
  }
  if (asset.kind === 'static') {
    assertKiskadeeHexScale(scale, themeName);
  } else if (asset.kind === 'dynamic') {
    assertKiskadeeCssScale(scale);
  } else {
    throw new Error('Invalid primitive color asset kind');
  }

  const value = scale[tone] as SolidColor | undefined;
  if (!value) {
    const available = Object.keys(scale).join(', ');
    throw new Error(
      `Tone ${tone} not available in primitive hue=${primitiveRef.hue} name=${primitiveRef.name}. Available: ${available}`
    );
  }

  return value;
}

function resolveSolidPrimitiveRole(
  colors: Required<SchemaColors>,
  segmentName: string,
  themeName: ThemeName,
  roleOrPrimitive: PrimitiveRole | `${string}.${string}` | `${string}.${string}.solid`
): PrimitiveRole {
  if (roleOrPrimitive.startsWith('primitive.')) {
    return roleOrPrimitive as PrimitiveRole;
  }

  const { component, intent, paint } = parseRole(roleOrPrimitive as RoleWithPaint);
  if (paint !== 'solid') {
    throw new Error(`Functional tonal references support only solid roles: ${roleOrPrimitive}`);
  }

  const intentValue = resolveComponentIntent(colors, component, intent);
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
    throw new Error(
      `Global semantic not mapped for role=${roleOrPrimitive} theme=${themeName} segment=${segmentName}`
    );
  }
  return primitiveRole;
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
  tone: KiskadeeTone | KiskadeeTone[],
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
  const intentValue = resolveComponentIntent(colors, component, intent);
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

  const tones: KiskadeeTone[] = Array.isArray(tone) ? tone : template.stops.map(() => tone);
  if (Array.isArray(tone) && tone.length !== template.stops.length) {
    throw new Error(
      `Invalid gradient tones length. Expected ${template.stops.length}, got ${tone.length} (role=${roleOrPrimitive})`
    );
  }

  const resolvedStops: ResolvedGradient['stops'] = template.stops.map((stop, idx) => {
    const stopRef = parsePrimitiveRole(stop.primitive as PrimitiveRole);
    const stopTone = tones[idx];
    if (typeof stopTone !== 'number') {
      throw new Error(
        `Invalid gradient tone at index ${idx}. Expected number (role=${roleOrPrimitive})`
      );
    }
    const stopColor = resolveSolidFromPrimitiveRef(colors, themeName, stopRef, stopTone);
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
