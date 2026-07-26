import type { IconProps } from '../../Icon.types.ts';
import { IconBase } from '../../internal/IconBase.tsx';

export function CloseIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path
        d="m6 6 12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </IconBase>
  );
}
