import type { IconProps } from '../../Icon.types.ts';
import { IconBase } from '../../internal/IconBase.tsx';

export function DragHandleIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="9" cy="6" r="1.25" fill="currentColor" />
      <circle cx="15" cy="6" r="1.25" fill="currentColor" />
      <circle cx="9" cy="10" r="1.25" fill="currentColor" />
      <circle cx="15" cy="10" r="1.25" fill="currentColor" />
      <circle cx="9" cy="14" r="1.25" fill="currentColor" />
      <circle cx="15" cy="14" r="1.25" fill="currentColor" />
      <circle cx="9" cy="18" r="1.25" fill="currentColor" />
      <circle cx="15" cy="18" r="1.25" fill="currentColor" />
    </IconBase>
  );
}
