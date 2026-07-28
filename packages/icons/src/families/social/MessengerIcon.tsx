// Generated from packages/icons/assets and metadata/icons.json. Do not edit manually.
import type { IconProps } from '../../Icon.types.ts';

export type MessengerIconPresentation = 'brand' | 'monochrome';

export interface MessengerIconProps extends IconProps {
  presentation?: MessengerIconPresentation;
}

export function MessengerIcon({
  presentation = 'brand',
  ...props
}: MessengerIconProps) {
  if (presentation === 'brand') {
    return (
      <svg width="1em" height="1em" viewBox="-47.809523809524 -47.809523809524 597.619047619048 597.619047619048" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" {...props}>
        <path fill="url(#messenger-gradient)" d="M251 1C110.17 1 1 104.16 1 243.5c0 72.89 29.87 135.86 78.51 179.37 4.09 3.65 6.55 8.78 6.72 14.25l1.36 44.48c.43 14.18 15.09 23.41 28.06 17.68l49.62-21.91c4.21-1.85 8.92-2.2 13.35-.97 22.81 6.27 47.07 9.61 72.37 9.61 140.83 0 250-103.16 250-242.5S391.83 1 251 1Zm154.92 177.79-87.04 134.52c-4.42 6.83-13.53 8.78-20.36 4.36l-80.63-52.17c-3.12-2.02-7.16-1.96-10.22.15l-90.88 62.68c-13.26 9.14-29.47-6.59-20.72-20.11l87.05-134.52c4.42-6.83 13.53-8.78 20.35-4.36l80.65 52.18c3.12 2.02 7.16 1.96 10.22-.15l90.86-62.67c13.26-9.15 29.47 6.59 20.72 20.11Z">
        </path>
        <defs>
          <linearGradient id="messenger-gradient" x1="72" x2="430" y1="458" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#A033FF">
            </stop>
            <stop offset=".5" stopColor="#006AFF">
            </stop>
            <stop offset="1" stopColor="#00B2FF">
            </stop>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (presentation === 'monochrome') {
    return (
      <svg width="1em" height="1em" viewBox="-47.809523809524 -47.809523809524 597.619047619048 597.619047619048" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" {...props}>
        <path d="M251 1C110.17 1 1 104.16 1 243.5c0 72.89 29.87 135.86 78.51 179.37 4.09 3.65 6.55 8.78 6.72 14.25l1.36 44.48c.43 14.18 15.09 23.41 28.06 17.68l49.62-21.91c4.21-1.85 8.92-2.2 13.35-.97 22.81 6.27 47.07 9.61 72.37 9.61 140.83 0 250-103.16 250-242.5S391.83 1 251 1Zm154.92 177.79-87.04 134.52c-4.42 6.83-13.53 8.78-20.36 4.36l-80.63-52.17c-3.12-2.02-7.16-1.96-10.22.15l-90.88 62.68c-13.26 9.14-29.47-6.59-20.72-20.11l87.05-134.52c4.42-6.83 13.53-8.78 20.35-4.36l80.65 52.18c3.12 2.02 7.16 1.96 10.22-.15l90.86-62.67c13.26-9.15 29.47 6.59 20.72 20.11Z">
        </path>
      </svg>
    );
  }

  return null;
}
