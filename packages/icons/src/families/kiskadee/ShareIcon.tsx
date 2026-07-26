import type { IconProps } from '../../Icon.types.ts';
import { IconBase } from '../../internal/IconBase.tsx';

export function ShareIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="18" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="6" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="18" cy="19" r="2.5" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="m8.17 10.75 7.66-4.5M8.17 13.25l7.66 4.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}
