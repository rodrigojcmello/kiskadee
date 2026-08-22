import type {
  ButtonIconLayout,
  ButtonIconPlacement,
  ElementSizeValue,
  SurfaceContext
} from '@kiskadee/core';
import {
  FamilyResolvedIcon,
  type IconName,
  Button as KButton,
  SmoothText,
  Text
} from '@kiskadee/react-components';
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

const RICH_TEXT_ACTION_GROUPS = [
  [
    { icon: 'bold', label: 'Bold' },
    { icon: 'italic', label: 'Italic' },
    { icon: 'underline', label: 'Underline' },
    { icon: 'strikethrough', label: 'Strikethrough' }
  ],
  [
    { icon: 'align-left', label: 'Align left' },
    { icon: 'align-center', label: 'Align center' },
    { icon: 'align-right', label: 'Align right' }
  ],
  [
    { icon: 'list', label: 'Bulleted list' },
    { icon: 'list-ordered', label: 'Numbered list' },
    { icon: 'link', label: 'Insert link' }
  ],
  [
    { icon: 'undo', label: 'Undo' },
    { icon: 'redo', label: 'Redo' }
  ]
] as const;

export function ButtonIconExamples({
  fontName,
  scale,
  surfaceContext
}: {
  fontName: string;
  scale: ElementSizeValue;
  surfaceContext: SurfaceContext;
}) {
  const textProfiles = useShowcaseTextProfiles();

  return (
    <section className={styles.showcaseSection} aria-labelledby="button-icon-examples-title">
      <Text as="h3" id="button-icon-examples-title" profile={textProfiles.sectionTitle}>
        Icons
      </Text>
      <Text as="p" profile={textProfiles.body} className={styles.showcaseSectionDescription}>
        Each intent is represented at high, medium, and low emphasis. Inline composes icon and label
        as one centered group, while Edge keeps the label independently centered. Icon-only buttons
        can also compose compact control groups such as an editing toolbar.
      </Text>
      <div className={`${styles.buttonExampleGrid} k-root`}>
        {EXAMPLES.map(({ icon, emphasis, iconLayout, iconPlacement, intent, label }) => (
          <KButton
            emphasis={emphasis}
            iconLayout={iconLayout}
            iconPlacement={iconPlacement}
            intent={intent}
            key={`${intent}-${emphasis}`}
            scale={scale}
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
      <article className={`${styles.richTextEditorExample} k-root`}>
        <Text as="h4" profile={textProfiles.subsectionTitle}>
          Rich text editor
        </Text>
        <fieldset className={styles.richTextToolbar}>
          <legend className={styles.richTextToolbarLegend}>Rich text formatting controls</legend>
          <div className={styles.richTextToolbarMode}>
            <Text as="span" profile={textProfiles.caption}>
              Independent buttons
            </Text>
            <div className={styles.richTextToolbarRow}>
              {RICH_TEXT_ACTION_GROUPS.map((actions) => (
                <div
                  className={`${styles.richTextToolbarGroup} ${styles.richTextToolbarLooseGroup}`}
                  key={actions[0].label}
                >
                  {actions.map(({ icon, label }) => (
                    <KButton
                      aria-label={label}
                      emphasis="medium"
                      intent="neutral"
                      key={label}
                      scale={scale}
                      surfaceContext={surfaceContext}
                      title={label}
                    >
                      <KButton.Icon>
                        <FamilyResolvedIcon name={icon} />
                      </KButton.Icon>
                    </KButton>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className={styles.richTextToolbarMode}>
            <Text as="span" profile={textProfiles.caption}>
              Connected Button groups
            </Text>
            <div className={styles.richTextToolbarRow}>
              {RICH_TEXT_ACTION_GROUPS.map((actions) => (
                <KButton.Group
                  className={styles.richTextToolbarGroup}
                  emphasis="medium"
                  intent="neutral"
                  key={actions[0].label}
                  scale={scale}
                  surfaceContext={surfaceContext}
                >
                  {actions.map(({ icon, label }) => (
                    <KButton aria-label={label} key={label} title={label}>
                      <KButton.Icon>
                        <FamilyResolvedIcon name={icon} />
                      </KButton.Icon>
                    </KButton>
                  ))}
                </KButton.Group>
              ))}
            </div>
          </div>
        </fieldset>
        <div className={styles.richTextEditorCanvas}>
          <Text as="p" profile={textProfiles.body}>
            <strong>Kiskadee composes familiar editing controls</strong> from the same Button and
            Icon primitives used throughout an interface.
          </Text>
          <Text as="p" profile={textProfiles.caption}>
            This surface is illustrative and does not edit text.
          </Text>
        </div>
      </article>
    </section>
  );
}
