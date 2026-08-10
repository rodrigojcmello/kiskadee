import type { TypographyProfileId } from '@kiskadee/core';
import type {
  ComponentPropsWithoutRef,
  ComponentPropsWithRef,
  ElementType,
  ReactElement
} from 'react';

type TextOwnProps<TAs extends ElementType> = {
  /** Intrinsic element or class-forwarding component. Defaults to span. */
  as?: TAs;
  /** Author-readable profile ID declared by the active design system. */
  profile: TypographyProfileId;
  className?: string;
};

export type TextProps<TAs extends ElementType = 'span'> = TextOwnProps<TAs> &
  Omit<ComponentPropsWithoutRef<TAs>, keyof TextOwnProps<TAs>>;

export type TextRef<TAs extends ElementType> = ComponentPropsWithRef<TAs>['ref'];

export type TextComponent = <TAs extends ElementType = 'span'>(
  props: TextProps<TAs> & { ref?: TextRef<TAs> }
) => ReactElement | null;
