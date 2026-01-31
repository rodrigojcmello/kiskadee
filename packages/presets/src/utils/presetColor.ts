import type {
  GlobalSemanticsByTheme,
  PrimitiveRole,
  ResolvedGradient,
  RoleWithPaint,
  Schema,
  SemanticColor,
  SemanticVariant,
  SolidColor
} from '@kiskadee/core';
import { color } from '@kiskadee/core';

type ThemeShortcut = 'l' | 'd';

type GradientRole = `${string}.${string}.gradient`;
type SolidRole = Exclude<RoleWithPaint, GradientRole>;
const semanticKeys = [
  'primary',
  'secondary',
  'redLike',
  'yellowLike',
  'greenLike',
  'neutral'
] as const satisfies SemanticColor[];

type SemanticRole = SemanticColor | `${SemanticColor}.${SemanticVariant}`;

function parseSemanticRole(value: string): { semantic: SemanticColor; variant: SemanticVariant } | null {
  const [semanticRaw, variantRaw] = value.split('.');
  if (!semanticRaw) return null;
  if (!(semanticKeys as readonly string[]).includes(semanticRaw)) return null;

  if (!variantRaw) {
    return { semantic: semanticRaw as SemanticColor, variant: 'v1' };
  }

  if (variantRaw === 'v1' || variantRaw === 'v2') {
    return { semantic: semanticRaw as SemanticColor, variant: variantRaw };
  }

  return null;
}

export type PresetColorGetter<TSegmentName extends string> = {
  (
    segmentName: TSegmentName,
    theme: ThemeShortcut,
    roleOrPrimitive: PrimitiveRole | SolidRole | SemanticRole,
    tone: number,
    alpha?: number
  ): SolidColor;

  (
    segmentName: TSegmentName,
    theme: ThemeShortcut,
    roleOrPrimitive: GradientRole,
    tone: number | number[],
    alpha?: number
  ): ResolvedGradient;
};

/**
 * Small preset-level wrapper around `@kiskadee/core` `color()`.
 *
 * Why this exists:
 * - Presets frequently need a compact helper when authoring palettes.
 * - We keep the `.solid` (default) vs `.gradient` typing at the call site.
 */
export function createPresetColorGetter<TSegmentName extends string>(schemaContext: {
  colors: NonNullable<Schema['colors']>;
}): PresetColorGetter<TSegmentName> {
  const c = (
    segmentName: TSegmentName,
    theme: ThemeShortcut,
    roleOrPrimitive: RoleWithPaint | PrimitiveRole | SemanticRole,
    tone: number | number[],
    alpha?: number
  ): SolidColor | ResolvedGradient => {
    const semanticRole =
      typeof roleOrPrimitive === 'string' ? parseSemanticRole(roleOrPrimitive) : null;

    if (semanticRole) {
      if (Array.isArray(tone)) {
        throw new Error(
          `Invalid tone. Expected number for semantic role, got array (role=${roleOrPrimitive})`
        );
      }

      const colors = schemaContext.colors;
      const themeName = theme === 'l' ? 'light' : 'dark';
      const fromSegment = colors.globalSemanticsBySegment?.[segmentName]?.themes?.[themeName]?.[
        semanticRole.semantic
      ];
      const fromGlobal = (colors.globalSemantics as GlobalSemanticsByTheme | undefined)?.[
        themeName
      ]?.[semanticRole.semantic];
      const entry = fromSegment ?? fromGlobal;
      const primitiveRole =
        typeof entry === 'string' ? entry : entry?.[semanticRole.variant] ?? entry?.v1;
      if (!primitiveRole) {
        throw new Error(
          `Global semantic not mapped for role=${roleOrPrimitive} theme=${theme} segment=${String(segmentName)}`
        );
      }

      return color(
        schemaContext,
        segmentName,
        theme,
        primitiveRole as never,
        tone as never,
        alpha
      );
    }

    return color(schemaContext, segmentName, theme, roleOrPrimitive as never, tone as never, alpha);
  };

  return c as PresetColorGetter<TSegmentName>;
}
