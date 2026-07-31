// Generated from packages/icons/assets and metadata/icons.json. Do not edit manually.
import type { IconProps } from '../../Icon.types.ts';

export type FacebookIconConstruction = 'mark';
export type FacebookIconPresentation = 'brand' | 'monochrome';

export type FacebookIconProps = IconProps & (
  | {
      construction?: 'mark';
      presentation?: 'brand' | 'monochrome';
    }
);

const DEFAULT_PRESENTATIONS: Record<FacebookIconConstruction, FacebookIconPresentation> = {"mark":"brand"};

export function FacebookIcon({
  construction = 'mark',
  presentation,
  ...props
}: FacebookIconProps) {
  const resolvedConstruction = construction as FacebookIconConstruction;
  const resolvedPresentation =
    presentation ?? DEFAULT_PRESENTATIONS[resolvedConstruction];

  if (resolvedConstruction === 'mark' && resolvedPresentation === 'brand') {
    return (
      <svg width="1em" height="1em" viewBox="-40.697674418605 -46.511627906977 581.395348837209 581.395348837209" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" {...props}>
      <circle cx="250" cy="250" r="250" fill="#0866FF">
      </circle>
      <path fill="#FFFFFF" d="M280.3 498.17V326.4h67.63l14.03-76.4H280.3v-27.02c0-40.37 15.84-55.9 56.83-55.9 12.73 0 22.98.31 28.88.93V98.76c-11.18-3.1-38.51-6.21-54.35-6.21-83.54 0-122.05 39.44-122.05 124.53V250h-51.55v76.4h51.55v166.24A250.5 250.5 0 0 0 250 500c10.25 0 20.37-.62 30.3-1.83Z">
      </path>
      </svg>
    );
  }

  if (resolvedConstruction === 'mark' && resolvedPresentation === 'monochrome') {
    return (
      <svg width="1em" height="1em" viewBox="-40.697674418605 -46.511627906977 581.395348837209 581.395348837209" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" {...props}>
      <path d="m500 250C500 111.93 388.07 0 250 0S0 111.93 0 250c0 117.24 80.72 215.62 189.61 242.64V326.4h-51.55V250h51.55v-32.92c0-85.09 38.51-124.53 122.05-124.53 15.84 0 43.17 3.11 54.35 6.21v69.25c-5.9-.62-16.15-.93-28.88-.93-40.99 0-56.83 15.53-56.83 55.9V250h81.66l-14.03 76.4h-67.63v171.77C404.07 483.22 500 377.82 500 250Z">
      </path>
      </svg>
    );
  }

  throw new Error(
    `Unsupported FacebookIcon construction/presentation: ${resolvedConstruction}.${String(resolvedPresentation)}`
  );
}
