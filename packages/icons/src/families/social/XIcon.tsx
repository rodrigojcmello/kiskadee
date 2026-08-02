// Generated from packages/icons/assets and metadata/icons.json. Do not edit manually.
import type { IconProps } from '../../Icon.types.ts';

export type XIconConstruction = 'mark';
export type XIconPresentation = 'brand' | 'monochrome';

export type XIconProps = IconProps & (
  | {
      construction?: 'mark';
      presentation?: 'brand' | 'monochrome';
    }
);

const DEFAULT_PRESENTATIONS: Record<XIconConstruction, XIconPresentation> = {"mark":"brand"};

export function XIcon({
  construction = 'mark',
  presentation,
  ...props
}: XIconProps) {
  const resolvedConstruction = construction as XIconConstruction;
  const resolvedPresentation =
    presentation ?? DEFAULT_PRESENTATIONS[resolvedConstruction];

  if (resolvedConstruction === 'mark' && resolvedPresentation === 'brand') {
    return (
      <svg width="1em" height="1em" viewBox="-150 -153.375 1500 1533.75" fill="#000000" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" {...props}>
      <path d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894L144.011 79.6944h162.604l304.797 435.9906 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z">
      </path>
      </svg>
    );
  }

  if (resolvedConstruction === 'mark' && resolvedPresentation === 'monochrome') {
    return (
      <svg width="1em" height="1em" viewBox="-150 -153.375 1500 1533.75" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" {...props}>
      <path d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894L144.011 79.6944h162.604l304.797 435.9906 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z">
      </path>
      </svg>
    );
  }

  throw new Error(
    `Unsupported XIcon construction/presentation: ${resolvedConstruction}.${String(resolvedPresentation)}`
  );
}
