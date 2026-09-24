import type {
  ClassNameByElementJSON,
  ComponentEmphasis,
  ContainerIntent,
  SurfaceContext
} from '@kiskadee/core';
import type { HTMLAttributes, ReactNode } from 'react';

export type ContainerClassesMap = {
  e1?: ClassNameByElementJSON;
};

export type ContainerProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  children?: ReactNode;
  /** Semantic surface consumed by the Container palette. */
  surfaceContext?: SurfaceContext;
  /** Surface color family. */
  intent?: ContainerIntent;
  /** Strength of the Container's own surface. */
  emphasis?: ComponentEmphasis;
};
