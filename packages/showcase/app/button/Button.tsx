'use client';

import { Button as KButton, SmoothText, useKiskadee } from '@kiskadee/react-components';
import s from './Button.module.scss';

export function Button() {
  const { fontName, designSystem, designSystemMeta } = useKiskadee();

  const isCarbon = designSystem === 'carbon-1-ibm';
  const alignment = isCarbon ? 'left' : 'center';

  // Manifest-driven capabilities for the current design system.
  // Se o metadata estiver ausente, caímos no fallback que exibe todos
  // os estados (comportamento atual), mantendo compatibilidade com
  // builds antigos.
  const manifestForDS = designSystemMeta[designSystem];
  const buttonMeta = manifestForDS?.components?.button;
  const primarySolidState = buttonMeta?.state?.['primary']?.['solid'];

  const hasPrimarySolidState = (state: string) => {
    if (!primarySolidState) return true;
    return Boolean(primarySolidState[state]);
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
            {hasPrimarySolidState('rest') && (
              <KButton tone="solid" semantic="primary">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Rest
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {hasPrimarySolidState('hover') && (
              <KButton tone="solid" semantic="primary" status="hover">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Hover
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {hasPrimarySolidState('focus') && (
              <KButton tone="solid" semantic="primary" status="focus">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Focus
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {hasPrimarySolidState('pressed') && (
              <KButton tone="solid" semantic="primary" status="pressed">
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Pressed
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {hasPrimarySolidState('selected') && (
              <KButton tone="solid" semantic="primary" controlState={true}>
                <KButton.Label>
                  <SmoothText triggerKey={fontName} align={alignment}>
                    Selected
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {hasPrimarySolidState('disabled') && (
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
            <KButton tone="soft" semantic="primary">
              <KButton.Label>
                <SmoothText triggerKey={fontName} align={alignment}>
                  Rest
                </SmoothText>
              </KButton.Label>
            </KButton>
            <KButton tone="soft" semantic="primary" status="hover">
              <KButton.Label>
                <SmoothText triggerKey={fontName} align={alignment}>
                  Hover
                </SmoothText>
              </KButton.Label>
            </KButton>
            <KButton tone="soft" semantic="primary" status="focus">
              <KButton.Label>
                <SmoothText triggerKey={fontName} align={alignment}>
                  Focus
                </SmoothText>
              </KButton.Label>
            </KButton>
            <KButton tone="soft" semantic="primary" status="pressed">
              <KButton.Label>
                <SmoothText triggerKey={fontName} align={alignment}>
                  Pressed
                </SmoothText>
              </KButton.Label>
            </KButton>
            <KButton tone="soft" semantic="primary" controlState={true}>
              <KButton.Label>
                <SmoothText triggerKey={fontName} align={alignment}>
                  Selected
                </SmoothText>
              </KButton.Label>
            </KButton>
            <KButton tone="soft" semantic="primary" status="disabled">
              <KButton.Label>
                <SmoothText triggerKey={fontName} align={alignment}>
                  Disabled
                </SmoothText>
              </KButton.Label>
            </KButton>
          </div>
        </div>
        <div className={s['interaction-state']}>
          <h3>Interaction States - Neutral (Soft)</h3>
          <div className={s['example-states']}>
            <KButton tone="soft">
              <KButton.Label>
                <SmoothText triggerKey={fontName} align={alignment}>
                  Rest
                </SmoothText>
              </KButton.Label>
            </KButton>
            <KButton tone="soft" status="hover">
              <KButton.Label>
                <SmoothText triggerKey={fontName} align={alignment}>
                  Hover
                </SmoothText>
              </KButton.Label>
            </KButton>
            <KButton tone="soft" status="focus">
              <KButton.Label>
                <SmoothText triggerKey={fontName} align={alignment}>
                  Focus
                </SmoothText>
              </KButton.Label>
            </KButton>
            <KButton tone="soft" status="pressed">
              <KButton.Label>
                <SmoothText triggerKey={fontName} align={alignment}>
                  Pressed
                </SmoothText>
              </KButton.Label>
            </KButton>
            <KButton tone="soft" controlState={true}>
              <KButton.Label>
                <SmoothText triggerKey={fontName} align={alignment}>
                  Selected
                </SmoothText>
              </KButton.Label>
            </KButton>
            <KButton tone="soft" status="disabled">
              <KButton.Label>
                <SmoothText triggerKey={fontName} align={alignment}>
                  Disabled
                </SmoothText>
              </KButton.Label>
            </KButton>
          </div>
        </div>
        <div className={s['interaction-state']}>
          <h3>Interaction States - Destructive (Solid)</h3>
          <div className={s['example-states']}>
            <KButton tone="solid" semantic="redLike">
              <KButton.Label>
                <SmoothText triggerKey={fontName} align={alignment}>
                  Rest
                </SmoothText>
              </KButton.Label>
            </KButton>
            <KButton tone="solid" semantic="redLike" status="hover">
              <KButton.Label>
                <SmoothText triggerKey={fontName} align={alignment}>
                  Hover
                </SmoothText>
              </KButton.Label>
            </KButton>
            <KButton tone="solid" semantic="redLike" status="focus">
              <KButton.Label>
                <SmoothText triggerKey={fontName} align={alignment}>
                  Focus
                </SmoothText>
              </KButton.Label>
            </KButton>
            <KButton tone="solid" semantic="redLike" status="pressed">
              <KButton.Label>
                <SmoothText triggerKey={fontName} align={alignment}>
                  Pressed
                </SmoothText>
              </KButton.Label>
            </KButton>
            <KButton tone="solid" semantic="redLike" controlState={true}>
              <KButton.Label>
                <SmoothText triggerKey={fontName} align={alignment}>
                  Selected
                </SmoothText>
              </KButton.Label>
            </KButton>
            <KButton tone="solid" semantic="redLike" status="disabled">
              <KButton.Label>
                <SmoothText triggerKey={fontName} align={alignment}>
                  Disabled
                </SmoothText>
              </KButton.Label>
            </KButton>
          </div>
        </div>
        <div className={s['interaction-state']}>
          <h3>Interaction States - Destructive (Soft)</h3>
          <div className={s['example-states']}>
            <KButton tone="soft" semantic="redLike">
              <KButton.Label>
                <SmoothText triggerKey={fontName} align={alignment}>
                  Rest
                </SmoothText>
              </KButton.Label>
            </KButton>
            <KButton tone="soft" semantic="redLike" status="hover">
              <KButton.Label>
                <SmoothText triggerKey={fontName} align={alignment}>
                  Hover
                </SmoothText>
              </KButton.Label>
            </KButton>
            <KButton tone="soft" semantic="redLike" status="focus">
              <KButton.Label>
                <SmoothText triggerKey={fontName} align={alignment}>
                  Focus
                </SmoothText>
              </KButton.Label>
            </KButton>
            <KButton tone="soft" semantic="redLike" status="pressed">
              <KButton.Label>
                <SmoothText triggerKey={fontName} align={alignment}>
                  Pressed
                </SmoothText>
              </KButton.Label>
            </KButton>
            <KButton tone="soft" semantic="redLike" controlState={true}>
              <KButton.Label>
                <SmoothText triggerKey={fontName} align={alignment}>
                  Selected
                </SmoothText>
              </KButton.Label>
            </KButton>
            <KButton tone="soft" semantic="redLike" status="disabled">
              <KButton.Label>
                <SmoothText triggerKey={fontName} align={alignment}>
                  Disabled
                </SmoothText>
              </KButton.Label>
            </KButton>
          </div>
        </div>

        <div>
          <h3>Selected</h3>
          <KButton controlState={true}>
            <KButton.Label>
              <SmoothText triggerKey={fontName} align={alignment}>
                Rest
              </SmoothText>
            </KButton.Label>
          </KButton>
          <KButton status="hover" controlState={true}>
            <KButton.Label>
              <SmoothText triggerKey={fontName} align={alignment}>
                Hover
              </SmoothText>
            </KButton.Label>
          </KButton>
          <KButton status="focus" controlState={true}>
            <KButton.Label>
              <SmoothText triggerKey={fontName} align={alignment}>
                Focus
              </SmoothText>
            </KButton.Label>
          </KButton>
          <KButton status="pressed" controlState={true}>
            <KButton.Label>
              <SmoothText triggerKey={fontName} align={alignment}>
                Pressed
              </SmoothText>
            </KButton.Label>
          </KButton>
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
            <KButton scale="s:sm:2" semantic="primary" tone="solid">
              <KButton.Label>
                <SmoothText triggerKey={fontName} align={alignment}>
                  Small 2
                </SmoothText>
              </KButton.Label>
            </KButton>
            <KButton scale="s:sm:1" semantic="primary" tone="solid">
              <KButton.Label>
                <SmoothText triggerKey={fontName} align={alignment}>
                  Small
                </SmoothText>
              </KButton.Label>
            </KButton>
            <KButton scale="s:md:1" semantic="primary" tone="solid">
              <KButton.Label>
                <SmoothText triggerKey={fontName} align={alignment}>
                  Medium
                </SmoothText>
              </KButton.Label>
            </KButton>
            <KButton scale="s:lg:1" semantic="primary" tone="solid">
              <KButton.Label>
                <SmoothText triggerKey={fontName} align={alignment}>
                  Large
                </SmoothText>
              </KButton.Label>
            </KButton>
            <KButton scale="s:lg:2" semantic="primary" tone="solid">
              <KButton.Label>
                <SmoothText triggerKey={fontName} align={alignment}>
                  Large 2
                </SmoothText>
              </KButton.Label>
            </KButton>
            <KButton scale="s:lg:3" semantic="primary" tone="solid">
              <KButton.Label>
                <SmoothText triggerKey={fontName} align={alignment}>
                  Large 3
                </SmoothText>
              </KButton.Label>
            </KButton>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Button;
