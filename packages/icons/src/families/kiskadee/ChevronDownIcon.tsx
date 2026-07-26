import type { IconProps } from '../../Icon.types.ts';
import { IconBase } from '../../internal/IconBase.tsx';

export function ChevronDownIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path
        d="m6.5 9.25 5.5 5.5 5.5-5.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}
