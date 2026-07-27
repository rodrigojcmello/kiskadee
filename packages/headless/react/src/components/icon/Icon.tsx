import type { HTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';

export type IconClassNames = Partial<Record<'e1', string>>;

type IconDataAttributes = {
  [key: `data-${string}`]: string | number | boolean | undefined;
};

type IconUnsafeAttributes = Record<string, string | number | boolean | undefined>;

type IconBaseProps = {
  /** The SVG or other glyph rendered inside the semantic span. */
  children: ReactNode;
  classNames?: IconClassNames;
  unsafeAttrs?: IconUnsafeAttributes;
} & Omit<
  HTMLAttributes<HTMLSpanElement>,
  'aria-hidden' | 'aria-label' | 'children' | 'className' | 'role'
> &
  IconDataAttributes;

export type IconProps =
  | (IconBaseProps & {
      /** Decorative glyphs are removed from the accessibility tree. */
      decorative: true;
      label?: never;
      className?: string;
    })
  | (IconBaseProps & {
      /** Non-decorative glyphs expose an image role and require an accessible label. */
      decorative?: false;
      label: string;
      className?: string;
    });

function join(...parts: Array<string | undefined | null | false>): string | undefined {
  const joined = parts.filter(Boolean).join(' ').trim();
  return joined.length > 0 ? joined : undefined;
}

/**
 * Semantic Icon primitive.
 *
 * The wrapper owns accessible-image versus decorative semantics. Glyph SVGs stay
 * presentation-only so their asset-specific paths and fills remain untouched.
 */
export const Icon = forwardRef<HTMLSpanElement, IconProps>(function Icon(
  { children, classNames = {}, className, decorative = false, label, unsafeAttrs, ...rest },
  ref
) {
  if (decorative) {
    return (
      <span
        {...rest}
        {...unsafeAttrs}
        ref={ref}
        className={join(classNames.e1, className)}
        aria-hidden={true}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      {...rest}
      {...unsafeAttrs}
      ref={ref}
      className={join(classNames.e1, className)}
      role="img"
      aria-label={label}
    >
      {children}
    </span>
  );
});

export default Icon;
