'use client';

import type { ElementSizeValue, RadiusMode, SurfaceContext } from '@kiskadee/core';
import { componentScaleToSize } from '@kiskadee/core';
import { Button as KButton, useButtonArtifactConfig } from '@kiskadee/react-components/button';
import { FamilyResolvedIcon } from '@kiskadee/react-components/icon';
import { Layout } from '@kiskadee/react-components/layout';
import { Separator } from '@kiskadee/react-components/separator';
import { Text } from '@kiskadee/react-components/text';
import { Fragment, useState } from 'react';
import { ShowcaseExampleCard } from '@/components/ShowcaseBackground/ShowcaseExampleCard';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import styles from '../Button.module.scss';
import {
  ButtonCompositionControls,
  useButtonCompositionControls
} from './ButtonCompositionControls';

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

const EXCLUSIVE_ACTION_GROUPS = [
  ['Align left', 'Align center', 'Align right'],
  ['Bulleted list', 'Numbered list']
] as const;

type ToolbarLayout = 'independent' | 'connected';

export function ButtonRichTextEditorExample({
  radius,
  scale,
  surfaceContext
}: {
  radius: RadiusMode;
  scale?: ElementSizeValue;
  surfaceContext: SurfaceContext;
}) {
  const [selectedActions, setSelectedActions] = useState<Record<ToolbarLayout, string[]>>({
    independent: ['Italic', 'Align left', 'Numbered list'],
    connected: ['Italic', 'Align left', 'Numbered list']
  });
  const textProfiles = useShowcaseTextProfiles();
  const { buttonClassesMap } = useButtonArtifactConfig();
  const presentation = useButtonCompositionControls(buttonClassesMap);
  const {
    intent: editorIntent,
    emphasis: editorEmphasis,
    selectionIntent,
    selectionEmphasis
  } = presentation.buttonProps();

  function toggleAction(layout: ToolbarLayout, label: string) {
    const exclusiveGroup = EXCLUSIVE_ACTION_GROUPS.find((group) =>
      group.some((action) => action === label)
    );
    setSelectedActions((current) => ({
      ...current,
      [layout]: current[layout].includes(label)
        ? current[layout].filter((action) => action !== label)
        : [
            ...current[layout].filter((action) => !exclusiveGroup?.some((peer) => peer === action)),
            label
          ]
    }));
  }

  return (
    <section
      className={`${styles.richTextEditorExample} k-root`}
      aria-labelledby="button-rich-text-editor-title"
    >
      <Text as="h4" id="button-rich-text-editor-title" profile={textProfiles.subsectionTitle}>
        Rich text editor
      </Text>
      <ShowcaseExampleCard context={surfaceContext} padding={false} clipContent>
        <ButtonCompositionControls {...presentation.controls} />
        <Layout padding="md">
          <fieldset className={styles.richTextToolbar}>
            <Text
              as="legend"
              profile={textProfiles.caption}
              className={styles.richTextToolbarLegend}
            >
              Rich text formatting controls
            </Text>
            <div className={styles.richTextToolbarMode} data-rich-text-layout="independent">
              <Text as="span" emphasis="medium" profile={textProfiles.caption}>
                Independent buttons
              </Text>
              <div className={styles.richTextToolbarRow}>
                {RICH_TEXT_ACTION_GROUPS.map((actions, index) => (
                  <Fragment key={actions[0].label}>
                    {index > 0 ? (
                      <Separator orientation="vertical" intent="neutral" emphasis="low" />
                    ) : null}
                    <div
                      className={`${styles.richTextToolbarGroup} ${styles.richTextToolbarLooseGroup}`}
                    >
                      {actions.map(({ icon, label }) => (
                        <KButton
                          aria-label={label}
                          emphasis={editorEmphasis}
                          intent={editorIntent}
                          key={label}
                          radius={radius}
                          size={componentScaleToSize(scale)}
                          title={label}
                          type="button"
                          toggle
                          controlState={selectedActions.independent.includes(label)}
                          selectionEmphasis={selectionEmphasis}
                          selectionIntent={selectionIntent}
                          onClick={() => toggleAction('independent', label)}
                        >
                          <KButton.Icon>
                            <FamilyResolvedIcon name={icon} />
                          </KButton.Icon>
                        </KButton>
                      ))}
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>
            <div className={styles.richTextToolbarMode} data-rich-text-layout="connected">
              <Text as="span" emphasis="medium" profile={textProfiles.caption}>
                Connected Button groups
              </Text>
              <div className={styles.richTextToolbarRow}>
                {RICH_TEXT_ACTION_GROUPS.map((actions, index) => (
                  <Fragment key={actions[0].label}>
                    {index > 0 ? (
                      <Separator orientation="vertical" intent="neutral" emphasis="low" />
                    ) : null}
                    <KButton.Group
                      className={styles.richTextToolbarGroup}
                      emphasis={editorEmphasis}
                      intent={editorIntent}
                      radius={radius}
                      size={componentScaleToSize(scale)}
                    >
                      {actions.map(({ icon, label }) => (
                        <KButton
                          aria-label={label}
                          key={label}
                          title={label}
                          type="button"
                          toggle
                          controlState={selectedActions.connected.includes(label)}
                          selectionEmphasis={selectionEmphasis}
                          selectionIntent={selectionIntent}
                          onClick={() => toggleAction('connected', label)}
                        >
                          <KButton.Icon>
                            <FamilyResolvedIcon name={icon} />
                          </KButton.Icon>
                        </KButton>
                      ))}
                    </KButton.Group>
                  </Fragment>
                ))}
              </div>
            </div>
          </fieldset>
        </Layout>
      </ShowcaseExampleCard>
    </section>
  );
}
