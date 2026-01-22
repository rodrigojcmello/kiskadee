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
        <div className={s['interaction-state']}>
          <h3>Interaction States - Primary (Vivid)</h3>
          <div className={`${s['example-states']} k-root`}>
            {renderState(
              'primary',
              'vivid',
              'rest',
              <KButton emphasis="vivid" intent="primary">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Rest
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'primary',
              'vivid',
              'hover',
              <KButton emphasis="vivid" intent="primary" status="hover">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Hover
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'primary',
              'vivid',
              'focus',
              <KButton emphasis="vivid" intent="primary" status="focus">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Focus
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'primary',
              'vivid',
              'pressed',
              <KButton emphasis="vivid" intent="primary" status="pressed">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Pressed
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'primary',
              'vivid',
              'selected',
              <KButton emphasis="vivid" intent="primary" controlState={true} radius={true}>
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Selected
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'primary',
              'vivid',
              'disabled',
              <KButton emphasis="vivid" intent="primary" status="disabled">
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
          <h3>Interaction States - Primary (Subtle)</h3>
          <div className={`${s['example-states']} k-root`}>
            {renderState(
              'primary',
              'subtle',
              'rest',
              <KButton emphasis="subtle" intent="primary">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Rest
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'primary',
              'subtle',
              'hover',
              <KButton emphasis="subtle" intent="primary" status="hover">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Hover
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'primary',
              'subtle',
              'focus',
              <KButton emphasis="subtle" intent="primary" status="focus">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Focus
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'primary',
              'subtle',
              'pressed',
              <KButton emphasis="subtle" intent="primary" status="pressed">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Pressed
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'primary',
              'subtle',
              'selected',
              <KButton emphasis="subtle" intent="primary" controlState={true} radius={true}>
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Selected
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'primary',
              'subtle',
              'disabled',
              <KButton emphasis="subtle" intent="primary" status="disabled">
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
          <h3>Interaction States - Neutral (Subtle)</h3>
          <div className={`${s['example-states']} k-root`}>
            {renderState(
              'neutral',
              'subtle',
              'rest',
              <KButton emphasis="subtle">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Rest
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'neutral',
              'subtle',
              'hover',
              <KButton emphasis="subtle" status="hover">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Hover
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'neutral',
              'subtle',
              'focus',
              <KButton emphasis="subtle" status="focus">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Focus
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'neutral',
              'subtle',
              'pressed',
              <KButton emphasis="subtle" status="pressed">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Pressed
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'neutral',
              'subtle',
              'selected',
              <KButton emphasis="subtle" controlState={true}>
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Selected
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'neutral',
              'subtle',
              'disabled',
              <KButton emphasis="subtle" status="disabled">
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
          <h3>Interaction States - Neutral (Vivid)</h3>
          <div className={`${s['example-states']} k-root`}>
            {renderState(
              'neutral',
              'vivid',
              'rest',
              <KButton emphasis="vivid">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Rest
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'neutral',
              'vivid',
              'hover',
              <KButton emphasis="vivid" status="hover">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Hover
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'neutral',
              'vivid',
              'focus',
              <KButton emphasis="vivid" status="focus">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Focus
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'neutral',
              'vivid',
              'pressed',
              <KButton emphasis="vivid" status="pressed">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Pressed
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'neutral',
              'vivid',
              'selected',
              <KButton emphasis="vivid" controlState={true}>
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Selected
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'neutral',
              'vivid',
              'disabled',
              <KButton emphasis="vivid" status="disabled">
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
          <h3>Interaction States - Destructive (Vivid)</h3>
          <div className={`${s['example-states']} k-root`}>
            {renderState(
              'destructive',
              'vivid',
              'rest',
              <KButton emphasis="vivid" intent="destructive">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Rest
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'destructive',
              'vivid',
              'hover',
              <KButton emphasis="vivid" intent="destructive" status="hover">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Hover
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'destructive',
              'vivid',
              'focus',
              <KButton emphasis="vivid" intent="destructive" status="focus">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Focus
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'destructive',
              'vivid',
              'pressed',
              <KButton emphasis="vivid" intent="destructive" status="pressed">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Pressed
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'destructive',
              'vivid',
              'selected',
              <KButton emphasis="vivid" intent="destructive" controlState={true}>
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Selected
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'destructive',
              'vivid',
              'disabled',
              <KButton emphasis="vivid" intent="destructive" status="disabled">
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
          <h3>Interaction States - Destructive (Subtle)</h3>
          <div className={`${s['example-states']} k-root`}>
            {renderState(
              'destructive',
              'subtle',
              'rest',
              <KButton emphasis="subtle" intent="destructive">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Rest
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'destructive',
              'subtle',
              'hover',
              <KButton emphasis="subtle" intent="destructive" status="hover">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Hover
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'destructive',
              'subtle',
              'focus',
              <KButton emphasis="subtle" intent="destructive" status="focus">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Focus
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'destructive',
              'subtle',
              'pressed',
              <KButton emphasis="subtle" intent="destructive" status="pressed">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Pressed
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'destructive',
              'subtle',
              'selected',
              <KButton emphasis="subtle" intent="destructive" controlState={true}>
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Selected
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'destructive',
              'subtle',
              'disabled',
              <KButton emphasis="subtle" intent="destructive" status="disabled">
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
          <h3>Selected (Primary / Subtle)</h3>
          <div className={`${s['example-states']} k-root`}>
            {renderState(
              'primary',
              'subtle',
              isSelected ? 'selected' : 'rest',
              <KButton
                emphasis="subtle"
                intent="primary"
                radius={true}
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
          <h3>Selected (Primary / Vivid)</h3>
          <div className={`${s['example-states']} k-root`}>
            {renderState(
              'primary',
              'vivid',
              isSelectedVivid ? 'selected' : 'rest',
              <KButton
                emphasis="vivid"
                intent="primary"
                radius={true}
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
              <KButton scale="s:sm:2" intent="primary" emphasis="vivid">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Small 2
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderScale(
              's:sm:1',
              <KButton scale="s:sm:1" intent="primary" emphasis="vivid">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Small
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderScale(
              's:md:1',
              <KButton scale="s:md:1" intent="primary" emphasis="vivid">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Medium
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderScale(
              's:lg:1',
              <KButton scale="s:lg:1" intent="primary" emphasis="vivid">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Large
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderScale(
              's:lg:2',
              <KButton scale="s:lg:2" intent="primary" emphasis="vivid">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Large 2
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderScale(
              's:lg:3',
              <KButton scale="s:lg:3" intent="primary" emphasis="vivid">
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
