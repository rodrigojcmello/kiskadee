// Generated from packages/icons/assets and metadata/icons.json. Do not edit manually.
import type { IconProps } from '../../Icon.types.ts';

export type MicrosoftIconPresentation = 'brand' | 'monochrome';

export interface MicrosoftIconProps extends IconProps {
  presentation?: MicrosoftIconPresentation;
}

export function MicrosoftIcon({
  presentation = 'brand',
  ...props
}: MicrosoftIconProps) {
  if (presentation === 'brand') {
    return (
      <svg width="1em" height="1em" viewBox="0 0 21 21" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" {...props}>
        <rect x="1" y="1" width="9" height="9" fill="#f25022">
        </rect>
        <rect x="1" y="11" width="9" height="9" fill="#00a4ef">
        </rect>
        <rect x="11" y="1" width="9" height="9" fill="#7fba00">
        </rect>
        <rect x="11" y="11" width="9" height="9" fill="#ffb900">
        </rect>
      </svg>
    );
  }

  if (presentation === 'monochrome') {
    return (
      <svg width="1em" height="1em" viewBox="0 0 21 21" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" {...props}>
        <rect x="1" y="1" width="9" height="9"/>
        <rect x="1" y="11" width="9" height="9"/>
        <rect x="11" y="1" width="9" height="9"/>
        <rect x="11" y="11" width="9" height="9"/>
      </svg>
    );
  }

  return null;
}
