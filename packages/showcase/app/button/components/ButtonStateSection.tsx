'use client';

import type { ButtonIntent, InteractionState, SurfaceContext } from '@kiskadee/core';
import { Button as KButton, SmoothText } from '@kiskadee/react-components';
import type { ManifestComponentState } from '@kiskadee/web-builder/types';
import { Fragment, type ReactNode, useState } from 'react';
import { Icon } from '@/components/Icon/Icon';
import s from '../Button.module.scss';
import { shouldCheckButtonStateAvailability } from './buttonStateAvailability';

type ButtonStateSectionProps = {
  intent: ButtonIntent;
  title: string;
  fontName: string;
  align?: 'left' | 'center';
  stateCapabilities?: ManifestComponentState;
  simplified?: boolean;
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
  fontName,
  align,
  stateCapabilities,
  simplified = false,
  surfaceContext
}: ButtonStateSectionProps) {
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
        <Icon name="NoSign" width={24} height={24} />
      </div>
    );
  };

  return (
    <div className={s['state-section']}>
      <h3 className={s['state-title']}>{title}</h3>
      {simplified ? (
        <div className={`${s['simplified-states']} k-root`}>
          {EMPHASIS_ORDER.map((emphasis) => (
            <Fragment key={emphasis}>
              {renderState(
                emphasis,
                'rest',
                <KButton
                  emphasis={emphasis}
                  intent={intent}
                  surfaceContext={surfaceContext}
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
            <h4 className={s['emphasis-title']}>
              <span>{EMPHASIS_LABELS[emphasis]} emphasis</span>
              <span className={s['emphasis-divider']} aria-hidden="true" />
            </h4>
            <div className={`${s['example-states']} k-root`}>
              {renderState(
                emphasis,
                'rest',
                <KButton emphasis={emphasis} intent={intent} surfaceContext={surfaceContext}>
                  <KButton.Label>
                    <SmoothText fontName={fontName} align={align}>
                      Rest
                    </SmoothText>
                  </KButton.Label>
                </KButton>
              )}
              {renderState(
                emphasis,
                'hover',
                <KButton
                  emphasis={emphasis}
                  intent={intent}
                  surfaceContext={surfaceContext}
                  status="hover"
                >
                  <KButton.Label>
                    <SmoothText fontName={fontName} align={align}>
                      Hover
                    </SmoothText>
                  </KButton.Label>
                </KButton>
              )}
              {renderState(
                emphasis,
                'focus',
                <KButton
                  emphasis={emphasis}
                  intent={intent}
                  surfaceContext={surfaceContext}
                  status="focus"
                >
                  <KButton.Label>
                    <SmoothText fontName={fontName} align={align}>
                      Focus
                    </SmoothText>
                  </KButton.Label>
                </KButton>
              )}
              {renderState(
                emphasis,
                'pressed',
                <KButton
                  emphasis={emphasis}
                  intent={intent}
                  surfaceContext={surfaceContext}
                  status="pressed"
                >
                  <KButton.Label>
                    <SmoothText fontName={fontName} align={align}>
                      Pressed
                    </SmoothText>
                  </KButton.Label>
                </KButton>
              )}
              {renderState(
                emphasis,
                selectedMap[emphasis] ? 'selected' : 'rest',
                <KButton
                  emphasis={emphasis}
                  intent={intent}
                  surfaceContext={surfaceContext}
                  controlState={selectedMap[emphasis]}
                  radiusEffect={intent === 'primary'}
                  onClick={() => toggleSelected(emphasis)}
                >
                  <KButton.Label>
                    <SmoothText fontName={fontName} speed="fast" align={align}>
                      {selectedMap[emphasis] ? 'Selected' : 'Select'}
                    </SmoothText>
                  </KButton.Label>
                </KButton>
              )}
              {renderState(
                emphasis,
                'disabled',
                <KButton
                  emphasis={emphasis}
                  intent={intent}
                  surfaceContext={surfaceContext}
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
      <div className={s['section-divider']} />
    </div>
  );
}

export default ButtonStateSection;
