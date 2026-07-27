// Generated from packages/icons/assets and metadata/icons.json. Do not edit manually.
import type { IconProps } from '../../Icon.types.ts';

export type GoogleIconPresentation = 'brand' | 'monochrome';

export interface GoogleIconProps extends IconProps {
  presentation?: GoogleIconPresentation;
}

export function GoogleIcon({
  presentation = 'brand',
  ...props
}: GoogleIconProps) {
  if (presentation === 'brand') {
    return (
      <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" {...props}>
        <path fill="#4285f4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.13 2.73-2.37 3.58v3h3.86c2.26-2.09 3.53-5.16 3.53-8.82Z">
        </path>
        <path fill="#34a853" d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.86-3c-1.07.72-2.44 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A12 12 0 0 0 12 24Z">
        </path>
        <path fill="#fbbc05" d="M5.27 14.27A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.55.37-2.27V6.64H1.29A12 12 0 0 0 0 12c0 1.94.46 3.77 1.29 5.36l3.98-3.09Z">
        </path>
        <path fill="#ea4335" d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.43-3.43A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.29 6.64l3.98 3.09C6.22 6.88 8.87 4.77 12 4.77Z">
        </path>
      </svg>
    );
  }

  if (presentation === 'monochrome') {
    return (
      <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" {...props}>
        <path d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.13 2.73-2.37 3.58v3h3.86c2.26-2.09 3.53-5.16 3.53-8.82Z"/>
        <path d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.86-3c-1.07.72-2.44 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A12 12 0 0 0 12 24Z"/>
        <path d="M5.27 14.27A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.55.37-2.27V6.64H1.29A12 12 0 0 0 0 12c0 1.94.46 3.77 1.29 5.36l3.98-3.09Z"/>
        <path d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.43-3.43A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.29 6.64l3.98 3.09C6.22 6.88 8.87 4.77 12 4.77Z"/>
      </svg>
    );
  }

  return null;
}
