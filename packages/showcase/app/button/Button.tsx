'use client';

import {
  Button as KButton,
  SmoothText,
  useKiskadee,
  useShowcase
} from '@kiskadee/react-components';
import React from 'react';
import { Icon } from '@/components/Icon/Icon';
import s from './Button.module.scss';
import ButtonStateSection from './components/ButtonStateSection';

export function Button() {
  const { designSystem } = useKiskadee();
  const { fontName, manifest } = useShowcase();

  const [isSelected, setIsSelected] = React.useState(false);
  const [isSelectedVivid, setIsSelectedVivid] = React.useState(false);

  const isCarbon = designSystem === 'carbon-1-ibm';
  const alignment = isCarbon ? 'left' : 'center';

  // Manifest-driven capabilities for the current design system.
  // If the manifest is missing, we fall back to rendering all states
  // (current behavior), preserving compatibility with older builds or
  // environments without metadata.
  const buttonMeta = manifest?.components?.button;

  const renderState = (
    semantic: string,
    emphasis: string,
    state: string,
    children: React.ReactNode
  ) => {
    const isSupported = (() => {
      if (!buttonMeta?.state) return true;
      const group = buttonMeta.state[semantic]?.[emphasis];
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

  const renderScale = (scale: string, children: React.ReactNode) => {
    const isSupported = (() => {
      if (!buttonMeta?.scale) return true;
      return Boolean(buttonMeta.scale[scale]);
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
    <section>
      <h2>Button</h2>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        {/*<KiskadeeButton label="Button" onClick={() => alert('Button clicado!')} />*/}
        {/*<KiskadeeButton*/}
        {/*  label="Com ícone"*/}
        {/*  icon={<span aria-hidden>⭐</span>}*/}
        {/*  onClick={() => alert('Com ícone')}*/}
        {/*/>*/}
        {/*<KiskadeeButton*/}
        {/*  aria-label="Icon only"*/}
        {/*  icon={<span aria-hidden>🔔</span>}*/}
        {/*  onClick={() => alert('Somente ícone')}*/}
        {/*/>*/}
        <ButtonStateSection
          intent="primary"
          title="Primary"
          alignment={alignment}
          fontName={fontName}
          renderState={renderState}
        />

        <ButtonStateSection
          intent="neutral"
          title="Neutral"
          alignment={alignment}
          fontName={fontName}
          renderState={renderState}
        />

        {/* Neutral */}
        <div className={s['interaction-state']}>
          <h3>Interaction States - Neutral (High)</h3>
          <div className={`${s['example-states']} k-root`}>
            {renderState(
              'neutral',
              'high',
              'rest',
              <KButton emphasis="high" intent="neutral">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Rest
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'neutral',
              'high',
              'hover',
              <KButton emphasis="high" intent="neutral" status="hover">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Hover
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'neutral',
              'high',
              'focus',
              <KButton emphasis="high" intent="neutral" status="focus">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Focus
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'neutral',
              'high',
              'pressed',
              <KButton emphasis="high" intent="neutral" status="pressed">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Pressed
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'neutral',
              'high',
              'selected',
              <KButton emphasis="high" intent="neutral" controlState={true}>
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Selected
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'neutral',
              'high',
              'disabled',
              <KButton emphasis="high" intent="neutral" status="disabled">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Disabled
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
          </div>
        </div>
        <div className={s['interaction-state']}>
          <h3>Interaction States - Neutral (Medium)</h3>
          <div className={`${s['example-states']} k-root`}>
            {renderState(
              'neutral',
              'medium',
              'rest',
              <KButton emphasis="medium">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Rest
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'neutral',
              'medium',
              'hover',
              <KButton emphasis="medium" status="hover">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Hover
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'neutral',
              'medium',
              'focus',
              <KButton emphasis="medium" status="focus">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Focus
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'neutral',
              'medium',
              'pressed',
              <KButton emphasis="medium" status="pressed">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Pressed
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'neutral',
              'medium',
              'selected',
              <KButton emphasis="medium" controlState={true}>
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Selected
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'neutral',
              'medium',
              'disabled',
              <KButton emphasis="medium" status="disabled">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Disabled
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
          </div>
        </div>
        <div className={s['interaction-state']}>
          <h3>Interaction States - Neutral (Low)</h3>
          <div className={`${s['example-states']} k-root`}>
            {renderState(
              'neutral',
              'low',
              'rest',
              <KButton emphasis="low" intent="neutral">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Rest
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'neutral',
              'low',
              'hover',
              <KButton emphasis="low" intent="neutral" status="hover">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Hover
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'neutral',
              'low',
              'focus',
              <KButton emphasis="low" intent="neutral" status="focus">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Focus
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'neutral',
              'low',
              'pressed',
              <KButton emphasis="low" intent="neutral" status="pressed">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Pressed
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'neutral',
              'low',
              'selected',
              <KButton emphasis="low" intent="neutral" controlState={true}>
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Selected
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'neutral',
              'low',
              'disabled',
              <KButton emphasis="low" intent="neutral" status="disabled">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Disabled
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
          </div>
        </div>
        <div className={s['interaction-state']}>
          <h3>Interaction States - Neutral (Lowest)</h3>
          <div className={`${s['example-states']} k-root`}>
            {renderState(
              'neutral',
              'lowest',
              'rest',
              <KButton emphasis="lowest" intent="neutral">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Rest
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'neutral',
              'lowest',
              'hover',
              <KButton emphasis="lowest" intent="neutral" status="hover">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Hover
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'neutral',
              'lowest',
              'focus',
              <KButton emphasis="lowest" intent="neutral" status="focus">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Focus
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'neutral',
              'lowest',
              'pressed',
              <KButton emphasis="lowest" intent="neutral" status="pressed">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Pressed
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'neutral',
              'lowest',
              'selected',
              <KButton emphasis="lowest" intent="neutral" controlState={true}>
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Selected
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'neutral',
              'lowest',
              'disabled',
              <KButton emphasis="lowest" intent="neutral" status="disabled">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Disabled
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
          </div>
        </div>

        {/* Destructive */}
        <div className={s['interaction-state']}>
          <h3>Interaction States - Destructive (High)</h3>
          <div className={`${s['example-states']} k-root`}>
            {renderState(
              'destructive',
              'high',
              'rest',
              <KButton emphasis="high" intent="destructive">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Rest
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'destructive',
              'high',
              'hover',
              <KButton emphasis="high" intent="destructive" status="hover">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Hover
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'destructive',
              'high',
              'focus',
              <KButton emphasis="high" intent="destructive" status="focus">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Focus
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'destructive',
              'high',
              'pressed',
              <KButton emphasis="high" intent="destructive" status="pressed">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Pressed
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'destructive',
              'high',
              'selected',
              <KButton emphasis="high" intent="destructive" controlState={true}>
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Selected
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'destructive',
              'high',
              'disabled',
              <KButton emphasis="high" intent="destructive" status="disabled">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Disabled
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
          </div>
        </div>
        <div className={s['interaction-state']}>
          <h3>Interaction States - Destructive (Medium)</h3>
          <div className={`${s['example-states']} k-root`}>
            {renderState(
              'destructive',
              'medium',
              'rest',
              <KButton emphasis="medium" intent="destructive">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Rest
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'destructive',
              'medium',
              'hover',
              <KButton emphasis="medium" intent="destructive" status="hover">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Hover
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'destructive',
              'medium',
              'focus',
              <KButton emphasis="medium" intent="destructive" status="focus">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Focus
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'destructive',
              'medium',
              'pressed',
              <KButton emphasis="medium" intent="destructive" status="pressed">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Pressed
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'destructive',
              'medium',
              'selected',
              <KButton emphasis="medium" intent="destructive" controlState={true}>
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Selected
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'destructive',
              'medium',
              'disabled',
              <KButton emphasis="medium" intent="destructive" status="disabled">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Disabled
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
          </div>
        </div>
        <div className={s['interaction-state']}>
          <h3>Interaction States - Destructive (Low)</h3>
          <div className={`${s['example-states']} k-root`}>
            {renderState(
              'destructive',
              'low',
              'rest',
              <KButton emphasis="low" intent="destructive">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Rest
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'destructive',
              'low',
              'hover',
              <KButton emphasis="low" intent="destructive" status="hover">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Hover
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'destructive',
              'low',
              'focus',
              <KButton emphasis="low" intent="destructive" status="focus">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Focus
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'destructive',
              'low',
              'pressed',
              <KButton emphasis="low" intent="destructive" status="pressed">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Pressed
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'destructive',
              'low',
              'selected',
              <KButton emphasis="low" intent="destructive" controlState={true}>
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Selected
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'destructive',
              'low',
              'disabled',
              <KButton emphasis="low" intent="destructive" status="disabled">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Disabled
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
          </div>
        </div>
        <div className={s['interaction-state']}>
          <h3>Interaction States - Destructive (Lowest)</h3>
          <div className={`${s['example-states']} k-root`}>
            {renderState(
              'destructive',
              'lowest',
              'rest',
              <KButton emphasis="lowest" intent="destructive">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Rest
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'destructive',
              'lowest',
              'hover',
              <KButton emphasis="lowest" intent="destructive" status="hover">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Hover
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'destructive',
              'lowest',
              'focus',
              <KButton emphasis="lowest" intent="destructive" status="focus">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Focus
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'destructive',
              'lowest',
              'pressed',
              <KButton emphasis="lowest" intent="destructive" status="pressed">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Pressed
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'destructive',
              'lowest',
              'selected',
              <KButton emphasis="lowest" intent="destructive" controlState={true}>
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Selected
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'destructive',
              'lowest',
              'disabled',
              <KButton emphasis="lowest" intent="destructive" status="disabled">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Disabled
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
          </div>
        </div>

        {/* Positive */}
        <div className={s['interaction-state']}>
          <h3>Interaction States - Positive (High)</h3>
          <div className={`${s['example-states']} k-root`}>
            {renderState(
              'positive',
              'high',
              'rest',
              <KButton emphasis="high" intent="positive">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Rest
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'positive',
              'high',
              'hover',
              <KButton emphasis="high" intent="positive" status="hover">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Hover
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'positive',
              'high',
              'focus',
              <KButton emphasis="high" intent="positive" status="focus">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Focus
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'positive',
              'high',
              'pressed',
              <KButton emphasis="high" intent="positive" status="pressed">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Pressed
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'positive',
              'high',
              'selected',
              <KButton emphasis="high" intent="positive" controlState={true}>
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Selected
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'positive',
              'high',
              'disabled',
              <KButton emphasis="high" intent="positive" status="disabled">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Disabled
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
          </div>
        </div>
        <div className={s['interaction-state']}>
          <h3>Interaction States - Positive (Medium)</h3>
          <div className={`${s['example-states']} k-root`}>
            {renderState(
              'positive',
              'medium',
              'rest',
              <KButton emphasis="medium" intent="positive">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Rest
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'positive',
              'medium',
              'hover',
              <KButton emphasis="medium" intent="positive" status="hover">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Hover
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'positive',
              'medium',
              'focus',
              <KButton emphasis="medium" intent="positive" status="focus">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Focus
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'positive',
              'medium',
              'pressed',
              <KButton emphasis="medium" intent="positive" status="pressed">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Pressed
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'positive',
              'medium',
              'selected',
              <KButton emphasis="medium" intent="positive" controlState={true}>
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Selected
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'positive',
              'medium',
              'disabled',
              <KButton emphasis="medium" intent="positive" status="disabled">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Disabled
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
          </div>
        </div>
        <div className={s['interaction-state']}>
          <h3>Interaction States - Positive (Low)</h3>
          <div className={`${s['example-states']} k-root`}>
            {renderState(
              'positive',
              'low',
              'rest',
              <KButton emphasis="low" intent="positive">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Rest
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'positive',
              'low',
              'hover',
              <KButton emphasis="low" intent="positive" status="hover">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Hover
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'positive',
              'low',
              'focus',
              <KButton emphasis="low" intent="positive" status="focus">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Focus
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'positive',
              'low',
              'pressed',
              <KButton emphasis="low" intent="positive" status="pressed">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Pressed
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'positive',
              'low',
              'selected',
              <KButton emphasis="low" intent="positive" controlState={true}>
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Selected
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'positive',
              'low',
              'disabled',
              <KButton emphasis="low" intent="positive" status="disabled">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Disabled
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
          </div>
        </div>
        <div className={s['interaction-state']}>
          <h3>Interaction States - Positive (Lowest)</h3>
          <div className={`${s['example-states']} k-root`}>
            {renderState(
              'positive',
              'lowest',
              'rest',
              <KButton emphasis="lowest" intent="positive">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Rest
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'positive',
              'lowest',
              'hover',
              <KButton emphasis="lowest" intent="positive" status="hover">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Hover
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'positive',
              'lowest',
              'focus',
              <KButton emphasis="lowest" intent="positive" status="focus">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Focus
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'positive',
              'lowest',
              'pressed',
              <KButton emphasis="lowest" intent="positive" status="pressed">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Pressed
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'positive',
              'lowest',
              'selected',
              <KButton emphasis="lowest" intent="positive" controlState={true}>
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Selected
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'positive',
              'lowest',
              'disabled',
              <KButton emphasis="lowest" intent="positive" status="disabled">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Disabled
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
          </div>
        </div>
        <div className={s['interaction-state']}>
          <h3>Selected (Primary / Medium)</h3>
          <div className={`${s['example-states']} k-root`}>
            {renderState(
              'primary',
              'medium',
              isSelected ? 'selected' : 'rest',
              <KButton
                emphasis="medium"
                intent="primary"
                radius="rounded"
                radiusEffect={true}
                controlState={isSelected}
                onClick={() => setIsSelected((prev) => !prev)}
              >
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    {isSelected ? 'Followed' : 'Follow'}
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
          </div>
        </div>

        <div className={s['interaction-state']}>
          <h3>Selected (Primary / High)</h3>
          <div className={`${s['example-states']} k-root`}>
            {renderState(
              'primary',
              'high',
              isSelectedVivid ? 'selected' : 'rest',
              <KButton
                emphasis="high"
                intent="primary"
                radius="rounded"
                radiusEffect={true}
                controlState={isSelectedVivid}
                onClick={() => setIsSelectedVivid((prev) => !prev)}
              >
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    {isSelectedVivid ? 'Followed' : 'Follow'}
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
          </div>
        </div>

        <div>
          <h3>Shadow</h3>
          <KButton shadow={true}>
            <KButton.Label>
              <SmoothText triggerKey={fontName} align={alignment}>
                Rest
              </SmoothText>
            </KButton.Label>
          </KButton>
          <KButton shadow={true} status={'hover'}>
            <KButton.Label>
              <SmoothText triggerKey={fontName} align={alignment}>
                Hover
              </SmoothText>
            </KButton.Label>
          </KButton>
          <KButton shadow={true} status={'focus'}>
            <KButton.Label>
              <SmoothText triggerKey={fontName} align={alignment}>
                Focus
              </SmoothText>
            </KButton.Label>
          </KButton>
          <KButton shadow={true} status={'pressed'}>
            <KButton.Label>
              <SmoothText triggerKey={fontName} align={alignment}>
                Pressed
              </SmoothText>
            </KButton.Label>
          </KButton>
          <KButton shadow={true} status={'disabled'}>
            <KButton.Label>
              <SmoothText triggerKey={fontName} align={alignment}>
                Disabled
              </SmoothText>
            </KButton.Label>
          </KButton>
        </div>

        <div className={s['interaction-state']}>
          <h3>Size / Scale</h3>
          <div className={`${s['example-states']} k-root`}>
            {renderScale(
              's:sm:2',
              <KButton scale="s:sm:2" intent="primary" emphasis="high">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Small 2
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderScale(
              's:sm:1',
              <KButton scale="s:sm:1" intent="primary" emphasis="high">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Small
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderScale(
              's:md:1',
              <KButton scale="s:md:1" intent="primary" emphasis="high">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Medium
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderScale(
              's:lg:1',
              <KButton scale="s:lg:1" intent="primary" emphasis="high">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Large
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderScale(
              's:lg:2',
              <KButton scale="s:lg:2" intent="primary" emphasis="high">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Large 2
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderScale(
              's:lg:3',
              <KButton scale="s:lg:3" intent="primary" emphasis="high">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Large 3
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Button;
