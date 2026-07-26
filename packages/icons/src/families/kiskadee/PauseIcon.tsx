import type { IconProps } from '../../Icon.types.ts';
import { IconBase } from '../../internal/IconBase.tsx';

export function PauseIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="6.5" y="5" width="4" height="14" rx="1" fill="currentColor" />
      <rect x="13.5" y="5" width="4" height="14" rx="1" fill="currentColor" />
    </IconBase>
  );
}
