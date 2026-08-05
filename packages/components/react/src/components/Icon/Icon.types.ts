import type { ClassNameByElementJSON, IconIntent, IconScale, SurfaceContext } from '@kiskadee/core';
import type { IconName } from '@kiskadee/icons/interface';
import type { IconProps as HeadlessIconProps } from '@kiskadee/react-headless';
import type { ReactNode } from 'react';

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

type HeadlessIconWithoutChildren<T> = T extends unknown ? Omit<T, 'children'> : never;

export type NamedIconContentProps = {
  name: IconName;
  children?: never;
  /** Explicit presentation fallback used only when the selected family cannot resolve `name`. */
  fallback?: ReactNode;
};

export type DirectIconContentProps = {
  children: ReactNode;
  name?: never;
  fallback?: never;
};

export type IconProps = HeadlessIconWithoutChildren<HeadlessIconProps> &
  IconVisualProps &
  (NamedIconContentProps | DirectIconContentProps);
