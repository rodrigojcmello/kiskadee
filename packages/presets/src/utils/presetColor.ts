import type {
  PrimitiveRole,
  ResolvedGradient,
  RoleWithPaint,
  Schema,
  SolidColor
} from '@kiskadee/core';
import { color } from '@kiskadee/core';

type ThemeShortcut = 'l' | 'd';

type GradientRole = `${string}.${string}.gradient`;
type SolidRole = Exclude<RoleWithPaint, GradientRole>;

export type PresetColorGetter<TSegmentName extends string> = {
  (
    segmentName: TSegmentName,
    theme: ThemeShortcut,
    roleOrPrimitive: PrimitiveRole | SolidRole,
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
    roleOrPrimitive: RoleWithPaint | PrimitiveRole,
    tone: number | number[],
    alpha?: number
  ): SolidColor | ResolvedGradient => {
    return color(schemaContext, segmentName, theme, roleOrPrimitive as never, tone as never, alpha);
  };

  return c as PresetColorGetter<TSegmentName>;
}
