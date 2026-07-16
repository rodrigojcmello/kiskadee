'use client';

import {
  Button as KButton,
  SmoothText,
  useKiskadee,
  useShowcase
} from '@kiskadee/react-components';
import React from 'react';
import { Icon } from '@/components/Icon/Icon';
import {
  ShowcaseBooleanControl,
  ShowcaseControlField,
  ShowcaseControlGroup,
  ShowcaseControlPanel,
  ShowcaseControlStack,
  ShowcaseRouteControls
} from '@/components/ShowcaseControls';
import { type BackgroundToneKey, useBackgroundTones } from '@/hooks/use-background-tones';
import { SwatchRadioGroup } from '@/k-components';
import s from './Button.module.scss';
import ButtonStateSection from './components/ButtonStateSection';

export function Button() {
  const { designSystem } = useKiskadee();
  const { fontName, manifest } = useShowcase();
  const backgroundTones = useBackgroundTones();

  const [isSelected, setIsSelected] = React.useState(false);
  const [isSelectedVivid, setIsSelectedVivid] = React.useState(false);
  const [isSimplified, setIsSimplified] = React.useState(false);
  const [showFocusRing, setShowFocusRing] = React.useState(true);
  const [surface, setSurface] = React.useState<BackgroundToneKey>(backgroundTones.defaultToneKey);

  React.useEffect(() => {
    setSurface(backgroundTones.defaultToneKey);
  }, [backgroundTones.defaultToneKey]);

  const selectedSurface = React.useMemo(
    () => backgroundTones.tones.find((tone) => tone.key === surface),
    [backgroundTones.tones, surface]
  );

  React.useEffect(() => {
    const root = document.documentElement;
    const previousRouteBackground = root.style.getPropertyValue('--showcase-route-background');

    if (selectedSurface?.resolvedColor) {
      root.style.setProperty('--showcase-route-background', selectedSurface.resolvedColor);
    } else {
      root.style.removeProperty('--showcase-route-background');
    }

    return () => {
      if (previousRouteBackground) {
        root.style.setProperty('--showcase-route-background', previousRouteBackground);
        return;
      }

      root.style.removeProperty('--showcase-route-background');
    };
  }, [selectedSurface?.resolvedColor]);

  const isDarkSurface =
    surface === 'primary' ||
    surface === 'dark-gray' ||
    surface === 'dark-primary' ||
    surface === 'very-dark-primary' ||
    surface === 'black';

  const isCarbon = designSystem === 'carbon-1-ibm';
  const alignment = isCarbon ? 'left' : 'center';
  const routeClassName = [
    isDarkSurface ? s.darkSurface : undefined,
    showFocusRing ? undefined : s.focusRingHidden
  ]
    .filter(Boolean)
    .join(' ');
  const buttonControls = (
    <ShowcaseControlPanel>
      <ShowcaseControlGroup title="Visualização">
        <ShowcaseControlStack>
          <ShowcaseBooleanControl
            label="Simplificada"
            checked={isSimplified}
            onCheckedChange={setIsSimplified}
          />
          <ShowcaseBooleanControl
            label="Focus ring"
            checked={showFocusRing}
            onCheckedChange={setShowFocusRing}
          />
        </ShowcaseControlStack>
      </ShowcaseControlGroup>
      <ShowcaseControlGroup title="Surface">
        <ShowcaseControlField fullWidth>
          <SwatchRadioGroup
            groupLabel="Background"
            value={surface}
            onValueChange={(value) => setSurface(value as BackgroundToneKey)}
            items={backgroundTones.items}
            aria-label="Button example background"
          />
        </ShowcaseControlField>
      </ShowcaseControlGroup>
    </ShowcaseControlPanel>
  );

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
    <section className={routeClassName || undefined}>
      <h2>Button</h2>
      <ShowcaseRouteControls id="button" eyebrow="Button" title="Controls">
        {buttonControls}
      </ShowcaseRouteControls>
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
          fontName={fontName}
          align={alignment}
          buttonMeta={buttonMeta}
          simplified={isSimplified}
        />

        <ButtonStateSection
          intent="neutral"
          title="Neutral"
          fontName={fontName}
          align={alignment}
          buttonMeta={buttonMeta}
          simplified={isSimplified}
        />

        <ButtonStateSection
          intent="destructive"
          title="Destructive"
          fontName={fontName}
          align={alignment}
          buttonMeta={buttonMeta}
          simplified={isSimplified}
        />

        <ButtonStateSection
          intent="positive"
          title="Positive"
          fontName={fontName}
          align={alignment}
          buttonMeta={buttonMeta}
          simplified={isSimplified}
        />

        {/* [ACTIVATION FEEDBACK] START: Showcase examples for profile/origin overrides. */}
        <div className={s['interaction-state']}>
          <h3>Activation Feedback Profiles</h3>
          <div className={`${s['example-states']} k-root`}>
            <KButton intent="primary" emphasis="high" activationFeedback={{ profile: 'ripple' }}>
              <KButton.Label>
                <SmoothText fontName={fontName} align={alignment}>
                  AF Ripple
                </SmoothText>
              </KButton.Label>
            </KButton>
            <KButton
              intent="primary"
              emphasis="high"
              activationFeedback={{ profile: 'ripple', origin: 'center' }}
            >
              <KButton.Label>
                <SmoothText fontName={fontName} align={alignment}>
                  AF Ripple Center
                </SmoothText>
              </KButton.Label>
            </KButton>
            <KButton
              intent="primary"
              emphasis="high"
              activationFeedback={{ profile: 'ripple-overflow' }}
            >
              <KButton.Label>
                <SmoothText fontName={fontName} align={alignment}>
                  AF Ripple Overflow
                </SmoothText>
              </KButton.Label>
            </KButton>
            <KButton intent="primary" emphasis="high" activationFeedback={{ profile: 'halo' }}>
              <KButton.Label>
                <SmoothText fontName={fontName} align={alignment}>
                  AF Halo
                </SmoothText>
              </KButton.Label>
            </KButton>
          </div>
        </div>
        {/* [ACTIVATION FEEDBACK] END: Showcase examples for profile/origin overrides. */}

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
                  <SmoothText fontName={fontName} align={alignment}>
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
                  <SmoothText fontName={fontName} align={alignment}>
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
              <SmoothText fontName={fontName} align={alignment}>
                Rest
              </SmoothText>
            </KButton.Label>
          </KButton>
          <KButton shadow={true} status={'hover'}>
            <KButton.Label>
              <SmoothText fontName={fontName} align={alignment}>
                Hover
              </SmoothText>
            </KButton.Label>
          </KButton>
          <KButton shadow={true} status={'focus'}>
            <KButton.Label>
              <SmoothText fontName={fontName} align={alignment}>
                Focus
              </SmoothText>
            </KButton.Label>
          </KButton>
          <KButton shadow={true} status={'pressed'}>
            <KButton.Label>
              <SmoothText fontName={fontName} align={alignment}>
                Pressed
              </SmoothText>
            </KButton.Label>
          </KButton>
          <KButton shadow={true} status={'disabled'}>
            <KButton.Label>
              <SmoothText fontName={fontName} align={alignment}>
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
                  <SmoothText fontName={fontName} align={alignment}>
                    Small 2
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderScale(
              's:sm:1',
              <KButton scale="s:sm:1" intent="primary" emphasis="high">
                <KButton.Label>
                  <SmoothText fontName={fontName} align={alignment}>
                    Small
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderScale(
              's:md:1',
              <KButton scale="s:md:1" intent="primary" emphasis="high">
                <KButton.Label>
                  <SmoothText fontName={fontName} align={alignment}>
                    Medium
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderScale(
              's:lg:1',
              <KButton scale="s:lg:1" intent="primary" emphasis="high">
                <KButton.Label>
                  <SmoothText fontName={fontName} align={alignment}>
                    Large
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderScale(
              's:lg:2',
              <KButton scale="s:lg:2" intent="primary" emphasis="high">
                <KButton.Label>
                  <SmoothText fontName={fontName} align={alignment}>
                    Large 2
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderScale(
              's:lg:3',
              <KButton scale="s:lg:3" intent="primary" emphasis="high">
                <KButton.Label>
                  <SmoothText fontName={fontName} align={alignment}>
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
