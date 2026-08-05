import type {
  ButtonIconLayout,
  ButtonIconPlacement,
  ElementSizeValue,
  SurfaceContext
} from '@kiskadee/core';
import { type IconName, Button as KButton, SmoothText } from '@kiskadee/react-components';
import styles from '../Button.module.scss';

const EXAMPLES = [
  {
    icon: 'thumbs-up',
    emphasis: 'high',
    iconLayout: 'inline',
    iconPlacement: 'leading',
    intent: 'primary',
    label: 'Like'
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
    icon: 'circle-x',
    emphasis: 'low',
    iconLayout: 'edge',
    iconPlacement: 'leading',
    intent: 'destructive',
    label: 'Reject'
  }
] satisfies ReadonlyArray<{
  icon: IconName;
  emphasis: 'high' | 'low';
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
  return (
    <section className={styles.showcaseSection} aria-labelledby="button-icon-examples-title">
      <h3 id="button-icon-examples-title">Icons</h3>
      <p className={styles.showcaseSectionDescription}>
        Each intent is represented at high and low emphasis. Inline composes icon and label as one
        centered group, while Edge keeps the label independently centered. Icon-only buttons can
        also compose compact control groups such as an editing toolbar.
      </p>
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
            <KButton.Icon name={icon} />
            <KButton.Label>
              <SmoothText fontName={fontName} align="center">
                {label}
              </SmoothText>
            </KButton.Label>
          </KButton>
        ))}
      </div>
      <article className={`${styles.richTextEditorExample} k-root`}>
        <h4>Rich text editor</h4>
        <fieldset className={styles.richTextToolbar}>
          <legend className={styles.richTextToolbarLegend}>Rich text formatting controls</legend>
          {RICH_TEXT_ACTION_GROUPS.map((actions) => (
            <div className={styles.richTextToolbarGroup} key={actions[0].label}>
              {actions.map(({ icon, label }) => (
                <KButton
                  aria-label={label}
                  emphasis="low"
                  intent="neutral"
                  key={label}
                  scale={scale}
                  surfaceContext={surfaceContext}
                  title={label}
                >
                  <KButton.Icon name={icon} />
                </KButton>
              ))}
            </div>
          ))}
        </fieldset>
        <div className={styles.richTextEditorCanvas}>
          <p>
            <strong>Kiskadee composes familiar editing controls</strong> from the same Button and
            Icon primitives used throughout an interface.
          </p>
          <p>This surface is illustrative and does not edit text.</p>
        </div>
      </article>
    </section>
  );
}
