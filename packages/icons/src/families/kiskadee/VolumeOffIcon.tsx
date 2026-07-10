import type { IconProps } from '../../Icon.types.ts';
import { VolumeIconBase } from '../../internal/kiskadee/VolumeIconBase.tsx';

export function VolumeOffIcon(props: IconProps) {
  return <VolumeIconBase muted {...props} />;
}
