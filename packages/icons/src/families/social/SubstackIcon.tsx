// Generated from packages/icons/assets and metadata/icons.json. Do not edit manually.
import type { IconProps } from '../../Icon.types.ts';

export type SubstackIconPresentation = 'brand' | 'monochrome';

export interface SubstackIconProps extends IconProps {
  presentation?: SubstackIconPresentation;
}

export function SubstackIcon({
  presentation = 'brand',
  ...props
}: SubstackIconProps) {
  if (presentation === 'brand') {
    return (
      <svg width="1em" height="1em" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" {...props}>
        <path fill="#FF6719" d="M764.166 348.371H236.319V419.402H764.166V348.371Z">
        </path>
        <path fill="#FF6719" d="M236.319 483.752V813.999L500.231 666.512L764.19 813.999V483.752H236.319Z">
        </path>
        <path fill="#FF6719" d="M764.166 213H236.319V284.019H764.166V213Z">
        </path>
      </svg>
    );
  }

  if (presentation === 'monochrome') {
    return (
      <svg width="1em" height="1em" viewBox="0 0 1000 1000" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" {...props}>
        <path d="M764.166 348.371H236.319V419.402H764.166V348.371Z">
        </path>
        <path d="M236.319 483.752V813.999L500.231 666.512L764.19 813.999V483.752H236.319Z">
        </path>
        <path d="M764.166 213H236.319V284.019H764.166V213Z">
        </path>
      </svg>
    );
  }

  return null;
}
