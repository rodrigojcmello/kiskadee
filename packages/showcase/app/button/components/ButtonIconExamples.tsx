import type { ElementSizeValue, SurfaceContext } from '@kiskadee/core';
import { HeartIcon } from '@kiskadee/icons/kiskadee/HeartIcon';
import { LikeIcon } from '@kiskadee/icons/kiskadee/LikeIcon';
import { ShareIcon } from '@kiskadee/icons/kiskadee/ShareIcon';
import { Button as KButton, SmoothText } from '@kiskadee/react-components';
import styles from '../Button.module.scss';

const EXAMPLES = [
  { Icon: LikeIcon, intent: 'primary', label: 'Like' },
  { Icon: ShareIcon, intent: 'neutral', label: 'Share' },
  { Icon: HeartIcon, intent: 'destructive', label: 'Favorite' }
] as const;

export function ButtonIconExamples({
  align,
  fontName,
  scale,
  surfaceContext
}: {
  align: 'center' | 'left';
  fontName: string;
  scale: ElementSizeValue;
  surfaceContext: SurfaceContext;
}) {
  return (
    <section className={styles.showcaseSection} aria-labelledby="button-icon-examples-title">
      <h3 id="button-icon-examples-title">Icons</h3>
      <p className={styles.showcaseSectionDescription}>
        Authorial Kiskadee icons rendered through the public Button.Icon slot.
      </p>
      <div className={`${styles.buttonExampleGrid} k-root`}>
        {EXAMPLES.map(({ Icon, intent, label }) => (
          <KButton
            emphasis="high"
            intent={intent}
            key={label}
            scale={scale}
            surfaceContext={surfaceContext}
          >
            <KButton.Icon>
              <Icon width="100%" height="100%" />
            </KButton.Icon>
            <KButton.Label>
              <SmoothText fontName={fontName} align={align}>
                {label}
              </SmoothText>
            </KButton.Label>
          </KButton>
        ))}
      </div>
    </section>
  );
}
