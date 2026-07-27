import type {
  ButtonIconLayout,
  ButtonIconPlacement,
  ElementSizeValue,
  SurfaceContext
} from '@kiskadee/core';
import { HeartIcon } from '@kiskadee/icons/kiskadee/HeartIcon';
import { LikeIcon } from '@kiskadee/icons/kiskadee/LikeIcon';
import { ShareIcon } from '@kiskadee/icons/kiskadee/ShareIcon';
import { Button as KButton, SmoothText } from '@kiskadee/react-components';
import styles from '../Button.module.scss';

const EXAMPLES = [
  {
    Icon: LikeIcon,
    iconLayout: 'inline',
    iconPlacement: 'leading',
    intent: 'primary',
    label: 'Like'
  },
  {
    Icon: ShareIcon,
    iconLayout: 'inline',
    iconPlacement: 'trailing',
    intent: 'neutral',
    label: 'Share'
  },
  {
    Icon: HeartIcon,
    iconLayout: 'edge',
    iconPlacement: 'leading',
    intent: 'destructive',
    label: 'Favorite'
  },
  {
    Icon: ShareIcon,
    iconLayout: 'edge',
    iconPlacement: 'trailing',
    intent: 'positive',
    label: 'Send'
  }
] satisfies ReadonlyArray<{
  Icon: typeof LikeIcon;
  iconLayout: ButtonIconLayout;
  iconPlacement: ButtonIconPlacement;
  intent: 'primary' | 'neutral' | 'destructive' | 'positive';
  label: string;
}>;

export function ButtonIconExamples({
  fontName,
  scale,
  surfaceContext
}: {
  fontName: string;
  scale: ElementSizeValue;
  surfaceContext: SurfaceContext;
}) {
  return (
    <section className={styles.showcaseSection} aria-labelledby="button-icon-examples-title">
      <h3 id="button-icon-examples-title">Icons</h3>
      <p className={styles.showcaseSectionDescription}>
        Inline composes icon and label as one centered group. Edge pins the icon to a logical side
        while keeping the label independently centered.
      </p>
      <div className={`${styles.buttonExampleGrid} k-root`}>
        {EXAMPLES.map(({ Icon, iconLayout, iconPlacement, intent, label }) => (
          <KButton
            emphasis="high"
            iconLayout={iconLayout}
            iconPlacement={iconPlacement}
            intent={intent}
            key={`${iconLayout}-${iconPlacement}`}
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
