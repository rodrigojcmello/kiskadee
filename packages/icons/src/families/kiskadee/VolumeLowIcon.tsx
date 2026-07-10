import type { IconProps } from '../../Icon.types.ts';
import { VolumeIconBase } from '../../internal/kiskadee/VolumeIconBase.tsx';

export function VolumeLowIcon(props: IconProps) {
  return <VolumeIconBase waveCount={1} {...props} />;
}
