import type { IconProps } from '../../Icon.types.ts';
import { IconBase } from '../../internal/IconBase.tsx';

export function PlayIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m8 5 11 7-11 7V5Z" fill="currentColor" />
    </IconBase>
  );
}
