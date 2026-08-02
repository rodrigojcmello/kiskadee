import type {
  ButtonIconLayout,
  ButtonIconPlacement,
  ElementSizeValue,
  SurfaceContext
} from '@kiskadee/core';
import { Button as KButton, SmoothText } from '@kiskadee/react-components';
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  CircleCheckIcon,
  CircleXIcon,
  HeartIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  Redo2Icon,
  RocketIcon,
  SendIcon,
  Share2Icon,
  StrikethroughIcon,
  ThumbsUpIcon,
  Trash2Icon,
  UnderlineIcon,
  Undo2Icon
} from 'lucide-react';
import styles from '../Button.module.scss';

const EXAMPLES = [
  {
    Icon: ThumbsUpIcon,
    emphasis: 'high',
    iconLayout: 'inline',
    iconPlacement: 'leading',
    intent: 'primary',
    label: 'Like'
  },
  {
    Icon: RocketIcon,
    emphasis: 'low',
    iconLayout: 'edge',
    iconPlacement: 'trailing',
    intent: 'primary',
    label: 'Launch'
  },
  {
    Icon: Share2Icon,
    emphasis: 'high',
    iconLayout: 'inline',
    iconPlacement: 'trailing',
    intent: 'neutral',
    label: 'Share'
  },
  {
    Icon: HeartIcon,
    emphasis: 'low',
    iconLayout: 'edge',
    iconPlacement: 'leading',
    intent: 'neutral',
    label: 'Favorite'
  },
  {
    Icon: CircleCheckIcon,
    emphasis: 'high',
    iconLayout: 'inline',
    iconPlacement: 'leading',
    intent: 'positive',
    label: 'Approve'
  },
  {
    Icon: SendIcon,
    emphasis: 'low',
    iconLayout: 'edge',
    iconPlacement: 'trailing',
    intent: 'positive',
    label: 'Send'
  },
  {
    Icon: Trash2Icon,
    emphasis: 'high',
    iconLayout: 'inline',
    iconPlacement: 'trailing',
    intent: 'destructive',
    label: 'Delete'
  },
  {
    Icon: CircleXIcon,
    emphasis: 'low',
    iconLayout: 'edge',
    iconPlacement: 'leading',
    intent: 'destructive',
    label: 'Reject'
  }
] satisfies ReadonlyArray<{
  Icon: typeof ThumbsUpIcon;
  emphasis: 'high' | 'low';
  iconLayout: ButtonIconLayout;
  iconPlacement: ButtonIconPlacement;
  intent: 'primary' | 'neutral' | 'destructive' | 'positive';
  label: string;
}>;

const RICH_TEXT_ACTION_GROUPS = [
  [
    { Icon: BoldIcon, label: 'Bold' },
    { Icon: ItalicIcon, label: 'Italic' },
    { Icon: UnderlineIcon, label: 'Underline' },
    { Icon: StrikethroughIcon, label: 'Strikethrough' }
  ],
  [
    { Icon: AlignLeftIcon, label: 'Align left' },
    { Icon: AlignCenterIcon, label: 'Align center' },
    { Icon: AlignRightIcon, label: 'Align right' }
  ],
  [
    { Icon: ListIcon, label: 'Bulleted list' },
    { Icon: ListOrderedIcon, label: 'Numbered list' },
    { Icon: LinkIcon, label: 'Insert link' }
  ],
  [
    { Icon: Undo2Icon, label: 'Undo' },
    { Icon: Redo2Icon, label: 'Redo' }
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
        {EXAMPLES.map(({ Icon, emphasis, iconLayout, iconPlacement, intent, label }) => (
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
      <article className={`${styles.richTextEditorExample} k-root`}>
        <h4>Rich text editor</h4>
        <fieldset className={styles.richTextToolbar}>
          <legend className={styles.richTextToolbarLegend}>Rich text formatting controls</legend>
          {RICH_TEXT_ACTION_GROUPS.map((actions) => (
            <div className={styles.richTextToolbarGroup} key={actions[0].label}>
              {actions.map(({ Icon, label }) => (
                <KButton
                  aria-label={label}
                  emphasis="low"
                  intent="neutral"
                  key={label}
                  scale={scale}
                  surfaceContext={surfaceContext}
                  title={label}
                >
                  <KButton.Icon>
                    <Icon />
                  </KButton.Icon>
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
