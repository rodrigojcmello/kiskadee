import type { IconProps } from '../../Icon.types.ts';
import { SocialIconBase } from '../../internal/SocialIconBase.tsx';

export function SubstackIcon(props: IconProps) {
  return (
    <SocialIconBase viewBox="0 0 64 64" {...props}>
      <path d="M15.93 12.25h32.14v5.15H15.93zM15.93 21.553h32.14v5.152H15.93zM15.93 30.857v22.044L32 42.27 48.07 52.9V30.857z" />
    </SocialIconBase>
  );
}
