'use client';

import { Button as KButton, SmoothText, useKiskadee, useShowcase } from '@kiskadee/react-components';
import { Icon } from '@/components/Icon/Icon';
import s from './Button.module.scss';

export function Button() {
  const { designSystem, manifest } = useKiskadee();
  const { fontName } = useShowcase();

  const isCarbon = designSystem === 'carbon-1-ibm';
  const alignment = isCarbon ? 'left' : 'center';

  // Manifest-driven capabilities for the current design system.
  // If the manifest is missing, we fall back to rendering all states
  // (current behavior), preserving compatibility with older builds or
  // environments without metadata.
  const buttonMeta = manifest?.components?.button;

  const renderState = (
    semantic: string,
    tone: string,
    state: string,
    children: React.ReactNode
  ) => {
    const isSupported = (() => {
      if (!buttonMeta?.state) return true;
      const group = buttonMeta.state[semantic]?.[tone];
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
          <h3>Interaction States - Primary (Solid)</h3>
          <div className={s['example-states']}>
            {renderState(
              'primary',
              'solid',
              'rest',
              <KButton tone="solid" semantic="primary">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Rest
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'primary',
              'solid',
              'hover',
              <KButton tone="solid" semantic="primary" status="hover">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Hover
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'primary',
              'solid',
              'focus',
              <KButton tone="solid" semantic="primary" status="focus">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Focus
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'primary',
              'solid',
              'pressed',
              <KButton tone="solid" semantic="primary" status="pressed">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Pressed
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'primary',
              'solid',
              'selected',
              <KButton tone="solid" semantic="primary" controlState={true}>
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Selected
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'primary',
              'solid',
              'disabled',
              <KButton tone="solid" semantic="primary" status="disabled">
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
          <h3>Interaction States - Primary (Soft)</h3>
          <div className={s['example-states']}>
            {renderState(
              'primary',
              'soft',
              'rest',
              <KButton tone="soft" semantic="primary">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Rest
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'primary',
              'soft',
              'hover',
              <KButton tone="soft" semantic="primary" status="hover">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Hover
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'primary',
              'soft',
              'focus',
              <KButton tone="soft" semantic="primary" status="focus">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Focus
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'primary',
              'soft',
              'pressed',
              <KButton tone="soft" semantic="primary" status="pressed">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Pressed
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'primary',
              'soft',
              'selected',
              <KButton tone="soft" semantic="primary" controlState={true}>
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Selected
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'primary',
              'soft',
              'disabled',
              <KButton tone="soft" semantic="primary" status="disabled">
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
          <h3>Interaction States - Neutral (Soft)</h3>
          <div className={s['example-states']}>
            {renderState(
              'neutral',
              'soft',
              'rest',
              <KButton tone="soft">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Rest
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'neutral',
              'soft',
              'hover',
              <KButton tone="soft" status="hover">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Hover
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'neutral',
              'soft',
              'focus',
              <KButton tone="soft" status="focus">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Focus
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'neutral',
              'soft',
              'pressed',
              <KButton tone="soft" status="pressed">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Pressed
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'neutral',
              'soft',
              'selected',
              <KButton tone="soft" controlState={true}>
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Selected
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'neutral',
              'soft',
              'disabled',
              <KButton tone="soft" status="disabled">
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
          <h3>Interaction States - Destructive (Solid)</h3>
          <div className={s['example-states']}>
            {renderState(
              'redLike',
              'solid',
              'rest',
              <KButton tone="solid" semantic="redLike">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Rest
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'redLike',
              'solid',
              'hover',
              <KButton tone="solid" semantic="redLike" status="hover">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Hover
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'redLike',
              'solid',
              'focus',
              <KButton tone="solid" semantic="redLike" status="focus">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Focus
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'redLike',
              'solid',
              'pressed',
              <KButton tone="solid" semantic="redLike" status="pressed">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Pressed
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'redLike',
              'solid',
              'selected',
              <KButton tone="solid" semantic="redLike" controlState={true}>
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Selected
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'redLike',
              'solid',
              'disabled',
              <KButton tone="solid" semantic="redLike" status="disabled">
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
          <h3>Interaction States - Destructive (Soft)</h3>
          <div className={s['example-states']}>
            {renderState(
              'redLike',
              'soft',
              'rest',
              <KButton tone="soft" semantic="redLike">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Rest
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'redLike',
              'soft',
              'hover',
              <KButton tone="soft" semantic="redLike" status="hover">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Hover
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'redLike',
              'soft',
              'focus',
              <KButton tone="soft" semantic="redLike" status="focus">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Focus
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'redLike',
              'soft',
              'pressed',
              <KButton tone="soft" semantic="redLike" status="pressed">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Pressed
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'redLike',
              'soft',
              'selected',
              <KButton tone="soft" semantic="redLike" controlState={true}>
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Selected
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderState(
              'redLike',
              'soft',
              'disabled',
              <KButton tone="soft" semantic="redLike" status="disabled">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Disabled
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
          </div>
        </div>
        <div>
          <h3>Selected</h3>
          {renderState(
            'neutral',
            'soft',
            'selected',
            <KButton controlState={true}>
              <KButton.Label>
                <SmoothText triggerKey={fontName} align={alignment}>
                  Rest
                </SmoothText>
              </KButton.Label>
            </KButton>
          )}
          {renderState(
            'neutral',
            'soft',
            'selected',
            <KButton status="hover" controlState={true}>
              <KButton.Label>
                <SmoothText triggerKey={fontName} align={alignment}>
                  Hover
                </SmoothText>
              </KButton.Label>
            </KButton>
          )}
          {renderState(
            'neutral',
            'soft',
            'selected',
            <KButton status="focus" controlState={true}>
              <KButton.Label>
                <SmoothText triggerKey={fontName} align={alignment}>
                  Focus
                </SmoothText>
              </KButton.Label>
            </KButton>
          )}
          {renderState(
            'neutral',
            'soft',
            'selected',
            <KButton status="pressed" controlState={true}>
              <KButton.Label>
                <SmoothText triggerKey={fontName} align={alignment}>
                  Pressed
                </SmoothText>
              </KButton.Label>
            </KButton>
          )}
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
          <div className={s['example-states']}>
            {renderScale(
              's:sm:2',
              <KButton scale="s:sm:2" semantic="primary" tone="solid">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Small 2
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderScale(
              's:sm:1',
              <KButton scale="s:sm:1" semantic="primary" tone="solid">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Small
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderScale(
              's:md:1',
              <KButton scale="s:md:1" semantic="primary" tone="solid">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Medium
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderScale(
              's:lg:1',
              <KButton scale="s:lg:1" semantic="primary" tone="solid">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Large
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderScale(
              's:lg:2',
              <KButton scale="s:lg:2" semantic="primary" tone="solid">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Large 2
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderScale(
              's:lg:3',
              <KButton scale="s:lg:3" semantic="primary" tone="solid">
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
