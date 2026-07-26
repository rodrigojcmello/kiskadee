import type { IconProps } from '../../Icon.types.ts';
import { SocialIconBase } from '../../internal/SocialIconBase.tsx';

export function TwitchIcon(props: IconProps) {
  return (
    <SocialIconBase viewBox="0 0 2400 2800" {...props}>
      <path
        fillRule="evenodd"
        d="M500 0 0 500v1800h600v500l500-500h400l900-900V0H500Zm1700 1300-400 400h-400l-350 350v-350H600V200h1600v1100Z"
      />
      <path d="M1700 550h200v600h-200zM1150 550h200v600h-200z" />
    </SocialIconBase>
  );
}
