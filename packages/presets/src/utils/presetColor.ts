import type {
  GlobalSemanticsByTheme,
  PrimitiveRole,
  ResolvedGradient,
  RoleWithPaint,
  Schema,
  SemanticColor,
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

function isSemanticColor(value: string): value is SemanticColor {
  return (semanticKeys as readonly string[]).includes(value);
}

export type PresetColorGetter<TSegmentName extends string> = {
  (
    segmentName: TSegmentName,
    theme: ThemeShortcut,
    roleOrPrimitive: PrimitiveRole | SolidRole | SemanticColor,
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
    roleOrPrimitive: RoleWithPaint | PrimitiveRole | SemanticColor,
    tone: number | number[],
    alpha?: number
  ): SolidColor | ResolvedGradient => {
    if (typeof roleOrPrimitive === 'string' && isSemanticColor(roleOrPrimitive)) {
      if (Array.isArray(tone)) {
        throw new Error(
          `Invalid tone. Expected number for semantic role, got array (role=${roleOrPrimitive})`
        );
      }

      const colors = schemaContext.colors;
      const themeName = theme === 'l' ? 'light' : 'dark';
      const fromSegment = colors.globalSemanticsBySegment?.[segmentName]?.themes?.[themeName]?.[
        roleOrPrimitive
      ];
      const fromGlobal = (colors.globalSemantics as GlobalSemanticsByTheme | undefined)?.[
        themeName
      ]?.[roleOrPrimitive];
      const primitiveRole = fromSegment ?? fromGlobal;
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
