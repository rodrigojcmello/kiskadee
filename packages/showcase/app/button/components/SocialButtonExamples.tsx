import type { ElementSizeValue, SurfaceContext } from '@kiskadee/core';
import { AppleIcon } from '@kiskadee/icons/social/AppleIcon';
import { ChatGPTIcon } from '@kiskadee/icons/social/ChatGPTIcon';
import { ClaudeIcon } from '@kiskadee/icons/social/ClaudeIcon';
import { DiscordIcon } from '@kiskadee/icons/social/DiscordIcon';
import { FacebookIcon } from '@kiskadee/icons/social/FacebookIcon';
import { GeminiIcon } from '@kiskadee/icons/social/GeminiIcon';
import { GitHubIcon } from '@kiskadee/icons/social/GitHubIcon';
import { GoogleIcon } from '@kiskadee/icons/social/GoogleIcon';
import { InstagramIcon } from '@kiskadee/icons/social/InstagramIcon';
import { LinkedInIcon } from '@kiskadee/icons/social/LinkedInIcon';
import { MastodonIcon } from '@kiskadee/icons/social/MastodonIcon';
import { MessengerIcon } from '@kiskadee/icons/social/MessengerIcon';
import { MicrosoftIcon } from '@kiskadee/icons/social/MicrosoftIcon';
import { PinterestIcon } from '@kiskadee/icons/social/PinterestIcon';
import { RedditIcon } from '@kiskadee/icons/social/RedditIcon';
import { SnapchatIcon } from '@kiskadee/icons/social/SnapchatIcon';
import { SubstackIcon } from '@kiskadee/icons/social/SubstackIcon';
import { TelegramIcon } from '@kiskadee/icons/social/TelegramIcon';
import { ThreadsIcon } from '@kiskadee/icons/social/ThreadsIcon';
import { TikTokIcon } from '@kiskadee/icons/social/TikTokIcon';
import { TwitchIcon } from '@kiskadee/icons/social/TwitchIcon';
import { VimeoIcon } from '@kiskadee/icons/social/VimeoIcon';
import { WhatsAppIcon } from '@kiskadee/icons/social/WhatsAppIcon';
import { XIcon } from '@kiskadee/icons/social/XIcon';
import { YouTubeIcon } from '@kiskadee/icons/social/YouTubeIcon';
import { Button as KButton, SmoothText } from '@kiskadee/react-components';
import styles from '../Button.module.scss';

const THIRD_PARTY_BRANDS = [
  { Icon: AppleIcon, label: 'Apple' },
  { Icon: GoogleIcon, label: 'Google' },
  { Icon: MicrosoftIcon, label: 'Microsoft' },
  { Icon: ChatGPTIcon, label: 'ChatGPT' },
  { Icon: ClaudeIcon, label: 'Claude' },
  { Icon: GeminiIcon, label: 'Gemini' },
  { Icon: FacebookIcon, label: 'Facebook' },
  { Icon: YouTubeIcon, label: 'YouTube' },
  { Icon: WhatsAppIcon, label: 'WhatsApp' },
  { Icon: InstagramIcon, label: 'Instagram' },
  { Icon: TikTokIcon, label: 'TikTok' },
  { Icon: MessengerIcon, label: 'Messenger' },
  { Icon: TelegramIcon, label: 'Telegram' },
  { Icon: SnapchatIcon, label: 'Snapchat' },
  { Icon: XIcon, label: 'X' },
  { Icon: PinterestIcon, label: 'Pinterest' },
  { Icon: RedditIcon, label: 'Reddit' },
  { Icon: LinkedInIcon, label: 'LinkedIn' },
  { Icon: DiscordIcon, label: 'Discord' },
  { Icon: TwitchIcon, label: 'Twitch' },
  { Icon: ThreadsIcon, label: 'Threads' },
  { Icon: MastodonIcon, label: 'Mastodon' },
  { Icon: GitHubIcon, label: 'GitHub' },
  { Icon: VimeoIcon, label: 'Vimeo' },
  { Icon: SubstackIcon, label: 'Substack' }
] as const;

export function SocialButtonExamples({
  fontName,
  scale,
  surfaceContext
}: {
  fontName: string;
  scale: ElementSizeValue;
  surfaceContext: SurfaceContext;
}) {
  return (
    <section className={styles.showcaseSection} aria-labelledby="social-button-examples-title">
      <h3 id="social-button-examples-title">Brands and platforms</h3>
      <p className={styles.showcaseSectionDescription}>
        Twenty-five third-party marks rendered through the public Button.Icon slot.
      </p>
      <div className={`${styles.buttonExampleGrid} k-root`}>
        {THIRD_PARTY_BRANDS.map(({ Icon, label }) => (
          <KButton
            emphasis="high"
            iconLayout="edge"
            iconPlacement="leading"
            intent="neutral"
            key={label}
            scale={scale}
            surfaceContext={surfaceContext}
          >
            <KButton.Icon>
              <Icon width="100%" height="100%" />
            </KButton.Icon>
            <KButton.Label>
              <SmoothText fontName={fontName} align="center">
                {label}
              </SmoothText>
            </KButton.Label>
          </KButton>
        ))}
      </div>
    </section>
  );
}
