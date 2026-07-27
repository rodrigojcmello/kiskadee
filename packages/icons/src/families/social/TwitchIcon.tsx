// Generated from packages/icons/assets and metadata/icons.json. Do not edit manually.
import type { IconProps } from '../../Icon.types.ts';

export type TwitchIconPresentation = 'brand' | 'monochrome';

export interface TwitchIconProps extends IconProps {
  presentation?: TwitchIconPresentation;
}

export function TwitchIcon({
  presentation = 'brand',
  ...props
}: TwitchIconProps) {
  if (presentation === 'brand') {
    return (
      <svg width="1em" height="1em" viewBox="0 0 2400 2800" fill="#9146FF" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" {...props}>
        <path fillRule="evenodd" d="M500 0 0 500v1800h600v500l500-500h400l900-900V0H500Zm1700 1300-400 400h-400l-350 350v-350H600V200h1600v1100Z">
        </path>
        <path d="M1700 550h200v600h-200zM1150 550h200v600h-200z">
        </path>
      </svg>
    );
  }

  if (presentation === 'monochrome') {
    return (
      <svg width="1em" height="1em" viewBox="0 0 2400 2800" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" {...props}>
        <path fillRule="evenodd" d="M500 0 0 500v1800h600v500l500-500h400l900-900V0H500Zm1700 1300-400 400h-400l-350 350v-350H600V200h1600v1100Z">
        </path>
        <path d="M1700 550h200v600h-200zM1150 550h200v600h-200z">
        </path>
      </svg>
    );
  }

  return null;
}
