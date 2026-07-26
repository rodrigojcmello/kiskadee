import type { IconProps } from '../../Icon.types.ts';
import { IconBase } from '../../internal/IconBase.tsx';

export function HeartIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path
        d="M20.84 5.61a5.5 5.5 0 0 0-7.78 0L12 6.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 22l8.84-8.61a5.5 5.5 0 0 0 0-7.78Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}
