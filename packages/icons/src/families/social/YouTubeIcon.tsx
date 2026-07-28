// Generated from packages/icons/assets and metadata/icons.json. Do not edit manually.
import type { IconProps } from '../../Icon.types.ts';

export type YouTubeIconPresentation = 'brand' | 'monochrome';

export interface YouTubeIconProps extends IconProps {
  presentation?: YouTubeIconPresentation;
}

export function YouTubeIcon({
  presentation = 'brand',
  ...props
}: YouTubeIconProps) {
  if (presentation === 'brand') {
    return (
      <svg width="1em" height="1em" viewBox="-12.655276595745 -8.865191489362 421.842553191489 295.506382978723" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" {...props}>
        <path fill="#FF0033" d="M388.134 43.4481c-4.636-17.0892-17.67-30.414-35.049-35.04838C322.382 0 198.121 0 198.121 0S74.1508 0 43.4481 8.39972C26.358 13.0341 13.0341 26.3589 8.10999 43.4481 0 74.1508 0 138.743 0 138.743s0 64.592 8.10999 95.585c4.92411 16.8 18.24801 30.413 35.33811 35.048 30.7027 8.4 154.6729 8.4 154.6729 8.4s124.261 0 154.964-8.4c17.379-4.635 30.413-18.248 35.049-35.048 8.398-30.993 8.398-95.585 8.398-95.585s0-64.5922-8.398-95.2949Z">
        </path>
        <path fill="#FFFFFF" d="M158.728 198.411V79.3646l102.828 59.3784-102.828 59.668Z">
        </path>
      </svg>
    );
  }

  if (presentation === 'monochrome') {
    return (
      <svg width="1em" height="1em" viewBox="-12.655276595745 -8.865191489362 421.842553191489 295.506382978723" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" {...props}>
        <path fillRule="evenodd" d="M158.728 198.411V79.3646l102.828 59.3784-102.828 59.668ZM388.134 43.4481c-4.636-17.0892-17.67-30.414-35.049-35.04838C322.382 0 198.121 0 198.121 0S74.1508 0 43.4481 8.39972C26.358 13.0341 13.0341 26.3589 8.10999 43.4481 0 74.1508 0 138.743 0 138.743s0 64.592 8.10999 95.585c4.92411 16.8 18.24801 30.413 35.33811 35.048 30.7027 8.4 154.6729 8.4 154.6729 8.4s124.261 0 154.964-8.4c17.379-4.635 30.413-18.248 35.049-35.048 8.398-30.993 8.398-95.585 8.398-95.585s0-64.5922-8.398-95.2949Z">
        </path>
      </svg>
    );
  }

  return null;
}
