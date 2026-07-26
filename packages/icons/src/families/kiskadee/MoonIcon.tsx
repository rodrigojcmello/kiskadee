import type { IconProps } from '../../Icon.types.ts';
import { IconBase } from '../../internal/IconBase.tsx';

export function MoonIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path
        d="M20.5 15.18A8.5 8.5 0 0 1 8.82 3.5 8.5 8.5 0 1 0 20.5 15.18Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}
