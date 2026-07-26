import type { ReactNode } from 'react';
import type { IconProps } from '../Icon.types.ts';

interface SocialIconBaseProps extends IconProps {
  children: ReactNode;
  viewBox: string;
}

/**
 * Keeps third-party marks on their official coordinate systems.
 *
 * Social marks do not use the authorial Kiskadee 24 × 24 drawing grid. Only
 * the React wrapper, external size, and decorative accessibility defaults are
 * normalized here.
 */
export function SocialIconBase({ children, viewBox, ...props }: SocialIconBaseProps) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox={viewBox}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}
