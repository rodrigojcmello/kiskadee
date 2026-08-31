'use client';

import type {
  ButtonIntent,
  ElementSizeValue,
  InteractionState,
  SurfaceContext
} from '@kiskadee/core';
import { Card, Button as KButton, SmoothText, Text } from '@kiskadee/react-components';
import type { ManifestComponentState } from '@kiskadee/web-builder/types';
import { Fragment, type ReactNode, useState } from 'react';
import { ShowcaseFamilyResolvedIcon } from '@/components/ShowcaseIconFamily/ShowcaseIconFamily';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import s from '../Button.module.scss';
import { shouldCheckButtonStateAvailability } from './buttonStateAvailability';

type ButtonStateSectionProps = {
  intent: ButtonIntent;
  title: string;
  description?: string;
  fontName: string;
  align?: 'left' | 'center';
  stateCapabilities?: ManifestComponentState;
  simplified?: boolean;
  grouped?: boolean;
  scale: ElementSizeValue;
  surfaceContext: SurfaceContext;
};

const EMPHASIS_ORDER = ['high', 'medium', 'low', 'lowest'] as const;
type Emphasis = (typeof EMPHASIS_ORDER)[number];
const EMPHASIS_LABELS: Record<Emphasis, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  lowest: 'Lowest'
};

export function ButtonStateSection({
  intent,
  title,
  description,
  fontName,
  align,
  stateCapabilities,
  simplified = false,
  grouped = false,
  scale,
  surfaceContext
}: ButtonStateSectionProps) {
  const textProfiles = useShowcaseTextProfiles();
  const headingId = `button-intent-${intent}-title`;
  const [selectedMap, setSelectedMap] = useState<Record<Emphasis, boolean>>(() => {
    const initial = {} as Record<Emphasis, boolean>;
    for (const emphasis of EMPHASIS_ORDER) {
      initial[emphasis] = true;
    }
    return initial;
  });

  const toggleSelected = (emphasis: Emphasis) => {
    setSelectedMap((prev) => ({ ...prev, [emphasis]: !prev[emphasis] }));
  };

  const renderState = (emphasis: Emphasis, state: InteractionState, children: ReactNode) => {
    if (!shouldCheckButtonStateAvailability(state)) {
      return children;
    }

    const isSupported = (() => {
      if (!stateCapabilities) return true;
      const group = stateCapabilities[intent]?.[emphasis];
      if (!group) return false;
      return Boolean(group[state]);
    })();

    if (isSupported) {
      return children;
    }

    return (
      <div className={s.missingState}>
        <ShowcaseFamilyResolvedIcon name="ban" style={{ width: 24, height: 24 }} />
      </div>
    );
  };

  const renderButtonState = (emphasis: Emphasis, state: InteractionState, button: ReactNode) =>
    renderState(
      emphasis,
      state,
      grouped ? (
        <KButton.Group
          className={s.stateButtonGroup}
          emphasis={emphasis}
          intent={intent}
          scale={scale}
        >
          {button}
          <KButton
            aria-label={`${title} ${EMPHASIS_LABELS[emphasis]} emphasis ${state} additional action`}
          >
            <KButton.Disclosure />
          </KButton>
        </KButton.Group>
      ) : (
        button
      )
    );

  return (
    <Card
      className={`${s['state-section']} k-root`}
      aria-labelledby={headingId}
      role="group"
      intent={surfaceContext === 'onVivid' ? 'primary' : 'neutral'}
      emphasis={surfaceContext === 'onVivid' ? 'highest' : 'low'}
      surfaceContext={surfaceContext}
    >
      <div className={s['state-content']}>
        <header className={s['state-header']}>
          <Text
            as="h4"
            id={headingId}
            profile={textProfiles.subsectionTitle}
            className={s['state-title']}
          >
            {title}
          </Text>
          {description ? (
            <Text
              as="p"
              emphasis="low"
              profile={textProfiles.caption}
              className={s['state-description']}
            >
              {description}
            </Text>
          ) : null}
        </header>
        {simplified ? (
          <div className={`${s['simplified-states']} k-root`}>
            {EMPHASIS_ORDER.map((emphasis) => (
              <Fragment key={emphasis}>
                {renderButtonState(
                  emphasis,
                  'rest',
                  <KButton
                    emphasis={emphasis}
                    intent={intent}
                    scale={scale}
                    aria-label={`${title} ${EMPHASIS_LABELS[emphasis]} emphasis Rest`}
                  >
                    <KButton.Label>
                      <SmoothText fontName={fontName} align={align}>
                        {EMPHASIS_LABELS[emphasis]}
                      </SmoothText>
                    </KButton.Label>
                  </KButton>
                )}
              </Fragment>
            ))}
          </div>
        ) : (
          EMPHASIS_ORDER.map((emphasis) => (
            <div key={emphasis} className={s['interaction-state']}>
              <Text
                as="h4"
                emphasis="low"
                profile={textProfiles.groupTitle}
                className={s['emphasis-title']}
              >
                <span>{EMPHASIS_LABELS[emphasis]} emphasis</span>
              </Text>
              <div className={`${s['example-states']} k-root`}>
                {renderButtonState(
                  emphasis,
                  'rest',
                  <KButton emphasis={emphasis} intent={intent} scale={scale}>
                    <KButton.Label>
                      <SmoothText fontName={fontName} align={align}>
                        Rest
                      </SmoothText>
                    </KButton.Label>
                  </KButton>
                )}
                {renderButtonState(
                  emphasis,
                  'hover',
                  <KButton emphasis={emphasis} intent={intent} scale={scale} status="hover">
                    <KButton.Label>
                      <SmoothText fontName={fontName} align={align}>
                        Hover
                      </SmoothText>
                    </KButton.Label>
                  </KButton>
                )}
                {renderButtonState(
                  emphasis,
                  'focus',
                  <KButton emphasis={emphasis} intent={intent} scale={scale} status="focus">
                    <KButton.Label>
                      <SmoothText fontName={fontName} align={align}>
                        Focus
                      </SmoothText>
                    </KButton.Label>
                  </KButton>
                )}
                {renderButtonState(
                  emphasis,
                  'pressed',
                  <KButton emphasis={emphasis} intent={intent} scale={scale} status="pressed">
                    <KButton.Label>
                      <SmoothText fontName={fontName} align={align}>
                        Pressed
                      </SmoothText>
                    </KButton.Label>
                  </KButton>
                )}
                {renderButtonState(
                  emphasis,
                  selectedMap[emphasis] ? 'selected' : 'rest',
                  <KButton
                    emphasis={emphasis}
                    intent={intent}
                    scale={scale}
                    controlState={selectedMap[emphasis]}
                    radiusEffect={!grouped && intent === 'primary'}
                    onClick={() => toggleSelected(emphasis)}
                  >
                    <KButton.Label>
                      <SmoothText fontName={fontName} speed="fast" align={align}>
                        {selectedMap[emphasis] ? 'Selected' : 'Select'}
                      </SmoothText>
                    </KButton.Label>
                  </KButton>
                )}
                {renderButtonState(
                  emphasis,
                  'disabled',
                  <KButton emphasis={emphasis} intent={intent} scale={scale} status="disabled">
                    <KButton.Label>
                      <SmoothText fontName={fontName} align={align}>
                        Disabled
                      </SmoothText>
                    </KButton.Label>
                  </KButton>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

export default ButtonStateSection;
