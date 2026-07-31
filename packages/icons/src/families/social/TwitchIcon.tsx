// Generated from packages/icons/assets and metadata/icons.json. Do not edit manually.
import type { IconProps } from '../../Icon.types.ts';

export type TwitchIconConstruction = 'mark';
export type TwitchIconPresentation = 'brand' | 'monochrome';

export type TwitchIconProps = IconProps & (
  | {
      construction?: 'mark';
      presentation?: 'brand' | 'monochrome';
    }
);

const DEFAULT_PRESENTATIONS: Record<TwitchIconConstruction, TwitchIconPresentation> = {"mark":"brand"};

export function TwitchIcon({
  construction = 'mark',
  presentation,
  ...props
}: TwitchIconProps) {
  const resolvedConstruction = construction as TwitchIconConstruction;
  const resolvedPresentation =
    presentation ?? DEFAULT_PRESENTATIONS[resolvedConstruction];

  if (resolvedConstruction === 'mark' && resolvedPresentation === 'brand') {
    return (
      <svg width="1em" height="1em" viewBox="-272.727272727273 -286.363636363636 2727.272727272727 3181.818181818182" fill="#9146FF" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" {...props}>
      <path fillRule="evenodd" d="M500 0 0 500v1800h600v500l500-500h400l900-900V0H500Zm1700 1300-400 400h-400l-350 350v-350H600V200h1600v1100Z">
      </path>
      <path d="M1700 550h200v600h-200zM1150 550h200v600h-200z">
      </path>
      </svg>
    );
  }

  if (resolvedConstruction === 'mark' && resolvedPresentation === 'monochrome') {
    return (
      <svg width="1em" height="1em" viewBox="-272.727272727273 -286.363636363636 2727.272727272727 3181.818181818182" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" {...props}>
      <path fillRule="evenodd" d="M500 0 0 500v1800h600v500l500-500h400l900-900V0H500Zm1700 1300-400 400h-400l-350 350v-350H600V200h1600v1100Z">
      </path>
      <path d="M1700 550h200v600h-200zM1150 550h200v600h-200z">
      </path>
      </svg>
    );
  }

  throw new Error(
    `Unsupported TwitchIcon construction/presentation: ${resolvedConstruction}.${String(resolvedPresentation)}`
  );
}
