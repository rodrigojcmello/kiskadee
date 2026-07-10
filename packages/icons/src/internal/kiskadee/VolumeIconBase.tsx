import type { IconProps } from '../../Icon.types.ts';
import { IconBase } from '../IconBase.tsx';

type VolumeWaveCount = 0 | 1 | 2 | 3;

interface VolumeIconBaseProps extends IconProps {
  muted?: boolean;
  waveCount?: VolumeWaveCount;
}

export function VolumeIconBase({ muted = false, waveCount = 0, ...props }: VolumeIconBaseProps) {
  return (
    <IconBase {...props}>
      <path fill="currentColor" d="M3.75 9.5v5h3.5l4.5 3.75V5.75L7.25 9.5z" />
      {muted ? (
        <path d="m15.5 9 5 6m0-6-5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      ) : (
        <>
          {waveCount >= 1 ? (
            <path
              d="M14.25 9.4c1.5 1.4 1.5 3.8 0 5.2"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          ) : null}
          {waveCount >= 2 ? (
            <path
              d="M16.75 7.2c2.7 2.6 2.7 7 0 9.6"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          ) : null}
          {waveCount >= 3 ? (
            <path
              d="M19 5c4 3.9 4 10.1 0 14"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          ) : null}
        </>
      )}
    </IconBase>
  );
}
