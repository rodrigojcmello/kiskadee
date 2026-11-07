'use client';

import type {
  ButtonIntentValue,
  ButtonSelectionEmphasis,
  ColorVariant,
  ElementSizeValue,
  InteractionState,
  RadiusMode,
  SurfaceContext
} from '@kiskadee/core';
import { componentScaleToSize, parseButtonIntentValue } from '@kiskadee/core';
import { Button as KButton } from '@kiskadee/react-components/button';
import { useKiskadee, useSurfaceContext } from '@kiskadee/react-components/resources';
import { SmoothText } from '@kiskadee/react-components/smooth-text';
import { Switch } from '@kiskadee/react-components/switch';
import { Text } from '@kiskadee/react-components/text';
import type { ManifestComponentState } from '@kiskadee/web-builder/types';
import { Fragment, type ReactNode, useState } from 'react';
import { ShowcaseExampleCard } from '@/components/ShowcaseBackground/ShowcaseExampleCard';
import { useButtonColorVariants } from '@/hooks/use-button-color-variants';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import s from '../Button.module.scss';
import { getButtonColorVariantSupport, qualifyButtonIntent } from './ButtonColorVariantControls';
import { ButtonUnavailableExample } from './ButtonUnavailableExample';
import { shouldCheckButtonStateAvailability } from './buttonStateAvailability';

type ButtonStateSectionProps = {
  intent: ButtonIntentValue;
  title: string;
  description?: string;
  fontName: string;
  align?: 'left' | 'center';
  stateCapabilities?: ManifestComponentState;
  simplified?: boolean;
  showFocusRing?: boolean;
  selectionEmphasis?: ButtonSelectionEmphasis;
  grouped?: boolean;
  radius: RadiusMode;
  scale?: ElementSizeValue;
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

export function ButtonStateSection(props: ButtonStateSectionProps) {
  const [colorVariant, setColorVariant] = useState<ColorVariant>('standard');
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

  return (
    <ShowcaseExampleCard
      className={`${s['state-section']} k-root`}
      aria-labelledby={`button-intent-${props.intent}-title`}
      role="group"
    >
      <ButtonStateSectionContent
        {...props}
        colorVariant={colorVariant}
        onVariantChange={setColorVariant}
        selectedMap={selectedMap}
        onToggleSelected={toggleSelected}
      />
    </ShowcaseExampleCard>
  );
}

function ButtonStateSectionContent({
  intent,
  title,
  description,
  fontName,
  align,
  stateCapabilities,
  simplified = false,
  showFocusRing = false,
  selectionEmphasis = 'lowest',
  grouped = false,
  radius,
  scale,
  colorVariant,
  onVariantChange,
  selectedMap,
  onToggleSelected: toggleSelected
}: ButtonStateSectionProps & {
  colorVariant: ColorVariant;
  onVariantChange: (variant: ColorVariant) => void;
  selectedMap: Record<Emphasis, boolean>;
  onToggleSelected: (emphasis: Emphasis) => void;
}) {
  const textProfiles = useShowcaseTextProfiles();
  const headingId = `button-intent-${intent}-title`;
  const { segment, theme } = useKiskadee();
  const context = useSurfaceContext();
  const colorVariants = useButtonColorVariants();
  const semanticIntent = parseButtonIntentValue(intent)?.intent ?? intent;
  const supportsAlternative = (emphases: readonly Emphasis[]) =>
    getButtonColorVariantSupport({
      colorVariants,
      segment,
      theme,
      contexts: [context],
      intents: [semanticIntent],
      emphases
    });
  const alternativeAvailable = supportsAlternative(EMPHASIS_ORDER);
  const anyAlternativeAvailable = getButtonColorVariantSupport({
    colorVariants,
    segment,
    theme,
    contexts: [context],
    intents: [
      'primary',
      'neutral',
      'destructive',
      'positive',
      ...(stateCapabilities?.support ? ['support'] : [])
    ],
    emphases: EMPHASIS_ORDER
  });
  const resolveIntent = (emphasis: Emphasis) =>
    qualifyButtonIntent(intent, supportsAlternative([emphasis]) ? colorVariant : 'standard');

  const renderState = (emphasis: Emphasis, state: InteractionState, children: ReactNode) => {
    if (!shouldCheckButtonStateAvailability(state)) {
      return children;
    }

    const isSupported = (() => {
      if (!stateCapabilities) return true;
      const group = stateCapabilities[parseButtonIntentValue(intent)?.intent ?? intent]?.[emphasis];
      if (!group) return false;
      return Boolean(group[state]);
    })();

    if (isSupported) {
      return children;
    }

    return (
      <ButtonUnavailableExample
        description={`${title} Button, ${EMPHASIS_LABELS[emphasis]} emphasis, ${state} state is not published in the active design system.`}
      />
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
          intent={resolveIntent(emphasis)}
          radius={radius}
          size={componentScaleToSize(scale)}
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
    <div className={s['state-content']}>
      <header className={s.contextSurfaceHeader}>
        <div className={s['state-header']}>
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
              emphasis="medium"
              profile={textProfiles.caption}
              className={s['state-description']}
            >
              {description}
            </Text>
          ) : null}
        </div>
        {anyAlternativeAvailable ? (
          <Switch
            label="Alt"
            size="sm"
            emphasis="medium"
            disabled={!alternativeAvailable}
            controlState={alternativeAvailable && colorVariant === 'alternative'}
            onControlStateChange={(checked) =>
              onVariantChange(checked ? 'alternative' : 'standard')
            }
          />
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
                  intent={resolveIntent(emphasis)}
                  radius={radius}
                  size={componentScaleToSize(scale)}
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
              emphasis="medium"
              profile={textProfiles.groupTitle}
              className={s['emphasis-title']}
            >
              {EMPHASIS_LABELS[emphasis]} emphasis
            </Text>
            <div className={`${s['example-states']} k-root`}>
              {renderButtonState(
                emphasis,
                'rest',
                <KButton
                  emphasis={emphasis}
                  intent={resolveIntent(emphasis)}
                  radius={radius}
                  size={componentScaleToSize(scale)}
                >
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
                <KButton
                  emphasis={emphasis}
                  intent={resolveIntent(emphasis)}
                  radius={radius}
                  size={componentScaleToSize(scale)}
                  status="hover"
                >
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
                <KButton
                  emphasis={emphasis}
                  intent={resolveIntent(emphasis)}
                  radius={radius}
                  size={componentScaleToSize(scale)}
                  status={showFocusRing ? 'focus' : undefined}
                >
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
                <KButton
                  emphasis={emphasis}
                  intent={resolveIntent(emphasis)}
                  radius={radius}
                  size={componentScaleToSize(scale)}
                  status="pressed"
                >
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
                  intent={resolveIntent(emphasis)}
                  radius={radius}
                  size={componentScaleToSize(scale)}
                  controlState={selectedMap[emphasis]}
                  selectionEmphasis={selectionEmphasis}
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
                <KButton
                  emphasis={emphasis}
                  intent={resolveIntent(emphasis)}
                  radius={radius}
                  size={componentScaleToSize(scale)}
                  status="disabled"
                >
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
  );
}

export default ButtonStateSection;
