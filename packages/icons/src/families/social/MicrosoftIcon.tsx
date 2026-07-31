// Generated from packages/icons/assets and metadata/icons.json. Do not edit manually.
import type { IconProps } from '../../Icon.types.ts';

export type MicrosoftIconConstruction = 'mark';
export type MicrosoftIconPresentation = 'brand' | 'monochrome';

export type MicrosoftIconProps = IconProps & (
  | {
      construction?: 'mark';
      presentation?: 'brand' | 'monochrome';
    }
);

const DEFAULT_PRESENTATIONS: Record<MicrosoftIconConstruction, MicrosoftIconPresentation> = {"mark":"brand"};

export function MicrosoftIcon({
  construction = 'mark',
  presentation,
  ...props
}: MicrosoftIconProps) {
  const resolvedConstruction = construction as MicrosoftIconConstruction;
  const resolvedPresentation =
    presentation ?? DEFAULT_PRESENTATIONS[resolvedConstruction];

  if (resolvedConstruction === 'mark' && resolvedPresentation === 'brand') {
    return (
      <svg width="1em" height="1em" viewBox="-1.166666666667 -1.166666666667 23.333333333333 23.333333333333" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" {...props}>
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

  if (resolvedConstruction === 'mark' && resolvedPresentation === 'monochrome') {
    return (
      <svg width="1em" height="1em" viewBox="-1.166666666667 -1.166666666667 23.333333333333 23.333333333333" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" {...props}>
      <rect x="1" y="1" width="9" height="9"/>
      <rect x="1" y="11" width="9" height="9"/>
      <rect x="11" y="1" width="9" height="9"/>
      <rect x="11" y="11" width="9" height="9"/>
      </svg>
    );
  }

  throw new Error(
    `Unsupported MicrosoftIcon construction/presentation: ${resolvedConstruction}.${String(resolvedPresentation)}`
  );
}
