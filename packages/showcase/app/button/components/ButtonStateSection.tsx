'use client';

import React, { useState } from 'react';
import { Button as KButton, SmoothText } from '@kiskadee/react-components';
import s from '../Button.module.scss';

type RenderState = (
  semantic: string,
  emphasis: string,
  state: string,
  children: React.ReactNode
) => React.ReactNode;

type ButtonStateSectionProps = {
  intent: 'primary' | 'neutral' | 'positive' | 'destructive';
  title: string;
  alignment: 'left' | 'center' | 'right';
  fontName: string;
  renderState: RenderState;
};

const EMPHASIS_ORDER = ['high', 'medium', 'low', 'lowest'] as const;
const EMPHASIS_LABELS: Record<(typeof EMPHASIS_ORDER)[number], string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  lowest: 'Lowest'
};

export function ButtonStateSection({
  intent,
  title,
  alignment,
  fontName,
  renderState
}: ButtonStateSectionProps) {
  const [selectedMap, setSelectedMap] = useState<Record<string, boolean>>(() =>
    EMPHASIS_ORDER.reduce(
      (acc, emphasis) => ({ ...acc, [emphasis]: true }),
      {} as Record<string, boolean>
    )
  );

  const toggleSelected = (emphasis: (typeof EMPHASIS_ORDER)[number]) => {
    setSelectedMap((prev) => ({ ...prev, [emphasis]: !prev[emphasis] }));
  };

  return (
    <div className={s['state-section']}>
      <h3 className={s['state-title']}>{title}</h3>
      {EMPHASIS_ORDER.map((emphasis) => (
        <div key={emphasis} className={s['interaction-state']}>
          <h4 className={s['emphasis-title']}>
            <span>{EMPHASIS_LABELS[emphasis]} emphasis</span>
            <span className={s['emphasis-divider']} aria-hidden="true" />
          </h4>
          <div className={`${s['example-states']} k-root`}>
            {renderState(
              intent,
              emphasis,
              'rest',
              <KButton emphasis={emphasis} intent={intent}>
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Rest
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              intent,
              emphasis,
              'hover',
              <KButton emphasis={emphasis} intent={intent} status="hover">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Hover
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              intent,
              emphasis,
              'focus',
              <KButton emphasis={emphasis} intent={intent} status="focus">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Focus
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              intent,
              emphasis,
              'pressed',
              <KButton emphasis={emphasis} intent={intent} status="pressed">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Pressed
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              intent,
              emphasis,
              selectedMap[emphasis] ? 'selected' : 'rest',
              <KButton
                emphasis={emphasis}
                intent={intent}
                controlState={selectedMap[emphasis]}
                radiusEffect={intent === 'primary'}
                onClick={() => toggleSelected(emphasis)}
              >
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    {selectedMap[emphasis] ? 'Selected' : 'Select'}
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              intent,
              emphasis,
              'disabled',
              <KButton emphasis={emphasis} intent={intent} status="disabled">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Disabled
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
          </div>
        </div>
      ))}
      <div className={s['section-divider']} />
    </div>
  );
}

export default ButtonStateSection;
