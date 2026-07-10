import type { IconProps } from '../../Icon.types.ts';
import { VolumeIconBase } from '../../internal/kiskadee/VolumeIconBase.tsx';

export function VolumeMediumIcon(props: IconProps) {
  return <VolumeIconBase waveCount={2} {...props} />;
}
