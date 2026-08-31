import type {
  ClassNameByElementJSON,
  SurfaceContext,
  TextEmphasis,
  TextForegroundName,
  TypographyProfileId
} from '@kiskadee/core';
import type {
  ComponentPropsWithoutRef,
  ComponentPropsWithRef,
  ElementType,
  ReactElement
} from 'react';

export type TextElementName = 'e1';
export type TextClassesMap = Partial<Record<TextElementName, ClassNameByElementJSON>>;

export type TextForegroundProps =
  | {
      /** Preset-owned foreground family. Defaults to neutral. */
      foreground?: TextForegroundName;
      /** Foreground strength. Defaults to medium. */
      emphasis?: TextEmphasis;
      /** Explicit surface-relative branch. Inherits the nearest Provider when omitted. */
      surfaceContext?: SurfaceContext;
    }
  | {
      /** Removes only the preset foreground class and inherits CSS color from the parent. */
      foreground: 'inherit';
      emphasis?: never;
      surfaceContext?: never;
    };

type TextBaseProps<TAs extends ElementType> = {
  /** Intrinsic element or class-forwarding component. Defaults to span. */
  as?: TAs;
  /** Author-readable profile ID declared by the active design system. */
  profile: TypographyProfileId;
  className?: string;
};

type TextOwnPropKey =
  | keyof TextBaseProps<ElementType>
  | 'foreground'
  | 'emphasis'
  | 'surfaceContext';

export type TextProps<TAs extends ElementType = 'span'> = TextBaseProps<TAs> &
  TextForegroundProps &
  Omit<ComponentPropsWithoutRef<TAs>, TextOwnPropKey>;

export type TextRef<TAs extends ElementType> = ComponentPropsWithRef<TAs>['ref'];

export type TextComponent = <TAs extends ElementType = 'span'>(
  props: TextProps<TAs> & { ref?: TextRef<TAs> }
) => ReactElement | null;

export type { TextEmphasis, TextForegroundName } from '@kiskadee/core';
