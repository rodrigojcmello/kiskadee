import type { ClassNameByElementJSON, IconIntent, IconScale, SurfaceContext } from '@kiskadee/core';
import type { IconProps as HeadlessIconProps } from '@kiskadee/react-headless';

export type IconElementName = 'e1';

export type IconClassesMap = Partial<Record<IconElementName, ClassNameByElementJSON>>;

export type IconVisualProps = {
  /** Preset-owned glyph size reference. Defaults to s:md:1. */
  scale?: IconScale;
} & (
  | {
      foreground?: never;
      /** Foreground semantic family. Defaults to neutral. */
      intent?: IconIntent;
      /** Surface-relative foreground branch. Defaults to onSubtle. */
      surfaceContext?: SurfaceContext;
    }
  | {
      /** Omits preset color and inherits CSS color, like Text. Artwork keeps its own paint rules. */
      foreground: 'inherit';
      intent?: never;
      surfaceContext?: never;
    }
);

export type IconProps = HeadlessIconProps & IconVisualProps;
