import type { ClassNameByElementJSON, IconIntent, IconScale, SurfaceContext } from '@kiskadee/core';
import type { IconProps as HeadlessIconProps } from '@kiskadee/react-headless';

export type IconElementName = 'e1';

export type IconClassesMap = Partial<Record<IconElementName, ClassNameByElementJSON>>;

export type IconVisualProps = {
  /** Fixed Kiskadee glyph size. Defaults to s:md:1 (20px). */
  scale?: IconScale;
  /** Foreground semantic family. Defaults to neutral. */
  intent?: IconIntent;
  /** Surface-relative foreground branch. Defaults to onSubtle. */
  surfaceContext?: SurfaceContext;
};

export type IconProps = HeadlessIconProps & IconVisualProps;
