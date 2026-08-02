import type {
  ClassNameByElementJSON,
  ProgressIntent,
  ProgressScale,
  SurfaceContext
} from '@kiskadee/core';
import type {
  ProgressDecorativeRootProps as HeadlessProgressDecorativeRootProps,
  ProgressDeterminateDecorativeRootProps as HeadlessProgressDeterminateDecorativeRootProps,
  ProgressDeterminateSemanticRootProps as HeadlessProgressDeterminateSemanticRootProps,
  ProgressIndeterminateSemanticRootProps as HeadlessProgressIndeterminateSemanticRootProps,
  ProgressSemanticRootProps as HeadlessProgressSemanticRootProps
} from '@kiskadee/react-headless';

export type { ProgressMode } from '@kiskadee/react-headless';

export type ProgressElementName = 'e1' | 'e2' | 'e3';

export type ProgressClassesMap = Partial<Record<ProgressElementName, ClassNameByElementJSON>>;

export type ProgressClassNames = Partial<Record<ProgressElementName, string>>;

export type ProgressVisualProps = {
  /** Root class merged after generated and structural classes. */
  className?: string;
  /** Per-element class overrides for root, track, and indicator. */
  classNames?: ProgressClassNames;
  /** Semantic color family. Defaults to neutral. */
  intent?: ProgressIntent;
  /** Explicit surrounding surface relationship. Defaults to onSubtle. */
  surfaceContext?: SurfaceContext;
  /** Published Progress scale. Defaults to the medium 2px track. */
  scale?: ProgressScale;
};

type DistributiveOmit<T, TKey extends PropertyKey> = T extends unknown
  ? Omit<T, TKey & keyof T>
  : never;

export type ProgressProps = DistributiveOmit<
  HeadlessProgressSemanticRootProps,
  'children' | 'classNames' | 'decorative'
> &
  ProgressVisualProps;

export type DeterminateProgressProps = DistributiveOmit<
  HeadlessProgressDeterminateSemanticRootProps,
  'children' | 'classNames' | 'decorative'
> &
  ProgressVisualProps;

export type IndeterminateProgressProps = DistributiveOmit<
  HeadlessProgressIndeterminateSemanticRootProps,
  'children' | 'classNames' | 'decorative'
> &
  ProgressVisualProps;

export type DecorativeProgressProps = DistributiveOmit<
  HeadlessProgressDecorativeRootProps,
  'children' | 'classNames'
> &
  ProgressVisualProps;

export type DeterminateDecorativeProgressProps = Omit<
  HeadlessProgressDeterminateDecorativeRootProps,
  'children' | 'classNames'
> &
  ProgressVisualProps;
