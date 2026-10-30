import type {
  ButtonIconLayout,
  ButtonIconPlacement,
  ElementSizeValue,
  RadiusMode,
  SurfaceContext
} from '@kiskadee/core';
import { componentScaleToSize } from '@kiskadee/core';
import type { IconName } from '@kiskadee/react-components';
import { Button as KButton } from '@kiskadee/react-components/button';
import { FamilyResolvedIcon } from '@kiskadee/react-components/icon';
import { SmoothText } from '@kiskadee/react-components/smooth-text';
import { Text } from '@kiskadee/react-components/text';
import { useShowcaseDisplayPreferences } from '@/components/ShowcaseDisplayPreferences';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import styles from '../Button.module.scss';

const EXAMPLES = [
  {
    icon: 'play',
    emphasis: 'high',
    iconLayout: 'inline',
    iconPlacement: 'leading',
    intent: 'primary',
    label: 'Play'
  },
  {
    icon: 'pencil',
    emphasis: 'medium',
    iconLayout: 'inline',
    iconPlacement: 'leading',
    intent: 'primary',
    label: 'Edit'
  },
  {
    icon: 'rocket',
    emphasis: 'low',
    iconLayout: 'edge',
    iconPlacement: 'trailing',
    intent: 'primary',
    label: 'Launch'
  },
  {
    icon: 'share',
    emphasis: 'high',
    iconLayout: 'inline',
    iconPlacement: 'trailing',
    intent: 'neutral',
    label: 'Share'
  },
  {
    icon: 'settings',
    emphasis: 'medium',
    iconLayout: 'inline',
    iconPlacement: 'leading',
    intent: 'neutral',
    label: 'Configure'
  },
  {
    icon: 'heart',
    emphasis: 'low',
    iconLayout: 'edge',
    iconPlacement: 'leading',
    intent: 'neutral',
    label: 'Favorite'
  },
  {
    icon: 'circle-check',
    emphasis: 'high',
    iconLayout: 'inline',
    iconPlacement: 'leading',
    intent: 'positive',
    label: 'Approve'
  },
  {
    icon: 'check',
    emphasis: 'medium',
    iconLayout: 'inline',
    iconPlacement: 'leading',
    intent: 'positive',
    label: 'Confirm'
  },
  {
    icon: 'send',
    emphasis: 'low',
    iconLayout: 'edge',
    iconPlacement: 'trailing',
    intent: 'positive',
    label: 'Send'
  },
  {
    icon: 'trash',
    emphasis: 'high',
    iconLayout: 'inline',
    iconPlacement: 'trailing',
    intent: 'destructive',
    label: 'Delete'
  },
  {
    icon: 'ban',
    emphasis: 'medium',
    iconLayout: 'inline',
    iconPlacement: 'leading',
    intent: 'destructive',
    label: 'Block'
  },
  {
    icon: 'circle-x',
    emphasis: 'low',
    iconLayout: 'edge',
    iconPlacement: 'leading',
    intent: 'destructive',
    label: 'Reject'
  }
] satisfies ReadonlyArray<{
  icon: IconName;
  emphasis: 'high' | 'medium' | 'low';
  iconLayout: ButtonIconLayout;
  iconPlacement: ButtonIconPlacement;
  intent: 'primary' | 'neutral' | 'destructive' | 'positive';
  label: string;
}>;

export function ButtonIconExamples({
  fontName,
  radius,
  scale,
  surfaceContext
}: {
  fontName: string;
  radius: RadiusMode;
  scale?: ElementSizeValue;
  surfaceContext: SurfaceContext;
}) {
  const textProfiles = useShowcaseTextProfiles();
  const { showDescriptions } = useShowcaseDisplayPreferences();

  return (
    <section className={styles.showcaseSection} aria-labelledby="button-icon-examples-title">
      <Text as="h4" id="button-icon-examples-title" profile={textProfiles.subsectionTitle}>
        Icon actions
      </Text>
      {showDescriptions ? (
        <Text as="p" profile={textProfiles.body} className={styles.showcaseSectionDescription}>
          Each intent is represented at high, medium, and low emphasis. Inline composes icon and
          label as one centered group, while Edge keeps the label independently centered.
        </Text>
      ) : null}
      <div className={`${styles.buttonExampleGrid} k-root`}>
        {EXAMPLES.map(({ icon, emphasis, iconLayout, iconPlacement, intent, label }) => (
          <KButton
            emphasis={emphasis}
            iconLayout={iconLayout}
            iconPlacement={iconPlacement}
            intent={intent}
            key={`${intent}-${emphasis}`}
            radius={radius}
            size={componentScaleToSize(scale)}
            surfaceContext={surfaceContext}
          >
            <KButton.Icon>
              <FamilyResolvedIcon name={icon} />
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
