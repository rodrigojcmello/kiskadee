import type { ReactNode } from 'react';
import type { IconProps } from '../Icon.types.ts';

interface IconBaseProps extends IconProps {
  children: ReactNode;
}

export function IconBase({ children, ...props }: IconBaseProps) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}
