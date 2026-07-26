import type { IconProps } from '../../Icon.types.ts';
import { IconBase } from '../../internal/IconBase.tsx';

export function MoonStarsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path
        d="M18.8 14.77A7.75 7.75 0 0 1 9.23 5.2a7.75 7.75 0 1 0 9.57 9.57Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m16.75 3 .43 1.07c.14.35.4.61.75.75l1.07.43-1.07.43c-.35.14-.61.4-.75.75l-.43 1.07-.43-1.07a1.27 1.27 0 0 0-.75-.75l-1.07-.43 1.07-.43c.35-.14.61-.4.75-.75L16.75 3ZM20.25 8.75l.24.59c.08.2.22.34.42.42l.59.24-.59.24c-.2.08-.34.22-.42.42l-.24.59-.24-.59a.71.71 0 0 0-.42-.42L19 10l.59-.24c.2-.08.34-.22.42-.42l.24-.59Z"
        fill="currentColor"
      />
    </IconBase>
  );
}
