import type { IconProps } from '../../Icon.types.ts';
import { VolumeIconBase } from '../../internal/kiskadee/VolumeIconBase.tsx';

export function VolumeHighIcon(props: IconProps) {
  return <VolumeIconBase waveCount={3} {...props} />;
}
