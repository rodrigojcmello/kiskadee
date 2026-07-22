'use client';

import type { ComponentEmphasis, SurfaceContext } from '@kiskadee/core';
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
  ShowcaseRouteControls,
  ShowcaseSelectControl
} from '@/components/ShowcaseControls';
import { type BackgroundToneKey, useBackgroundTones } from '@/hooks/use-background-tones';
import { SwatchRadioGroup } from '@/k-components';
import {
  getManifestComponentState,
  supportsManifestSurfaceContext
} from '@/utils/manifest-surface-context';
import s from './Button.module.scss';
import ButtonStateSection from './components/ButtonStateSection';
import { shouldCheckButtonStateAvailability } from './components/buttonStateAvailability';

const SURFACE_CONTEXT_OPTIONS: Array<{ value: SurfaceContext; label: string }> = [
  { value: 'default', label: 'Default' },
  { value: 'inverse', label: 'Inverse' }
];
const COMPARISON_EMPHASES: ComponentEmphasis[] = ['high', 'medium', 'low', 'lowest'];

function SurfaceContextComparison({
  defaultBackground,
  fontName,
  inverseBackground,
  inverseSupported,
  textAlign
}: {
  defaultBackground: string | undefined;
  fontName: string;
  inverseBackground: string | undefined;
  inverseSupported: boolean;
  textAlign: 'left' | 'center';
}) {
  return (
    <section className={s.contextComparison} aria-labelledby="surface-context-comparison-title">
      <h3 id="surface-context-comparison-title">Surface contexts</h3>
      <p className={s.contextComparisonDescription}>
        The same Primary Rest buttons rendered simultaneously on conventional and strong surfaces.
      </p>
      <div className={s.contextComparisonGrid}>
        <article className={s.contextCard}>
          <h4>Default</h4>
          <div
            className={`${s.contextSurface} k-root`}
            style={defaultBackground ? { backgroundColor: defaultBackground } : undefined}
          >
            {COMPARISON_EMPHASES.map((emphasis) => (
              <KButton key={emphasis} intent="primary" emphasis={emphasis} surfaceContext="default">
                <KButton.Label>
                  <SmoothText fontName={fontName} align={textAlign}>
                    {emphasis}
                  </SmoothText>
                </KButton.Label>
              </KButton>
            ))}
          </div>
        </article>
        <article className={s.contextCard}>
          <h4>Inverse</h4>
          <div
            className={`${s.contextSurface} ${s.inverseContextSurface} k-root`}
            style={inverseBackground ? { backgroundColor: inverseBackground } : undefined}
          >
            {inverseSupported ? (
              COMPARISON_EMPHASES.map((emphasis) => (
                <KButton
                  key={emphasis}
                  intent="primary"
                  emphasis={emphasis}
                  surfaceContext="inverse"
                >
                  <KButton.Label>
                    <SmoothText fontName={fontName} align={textAlign}>
                      {emphasis}
                    </SmoothText>
                  </KButton.Label>
                </KButton>
              ))
            ) : (
              <p className={s.contextUnavailable}>Inverse is not available in this palette.</p>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}

export function Button() {
  const { designSystem, segment, theme } = useKiskadee();
  const { fontName, manifest } = useShowcase();
  const backgroundTones = useBackgroundTones();

  const [isSelected, setIsSelected] = React.useState(false);
  const [isSelectedVivid, setIsSelectedVivid] = React.useState(false);
  const [isSimplified, setIsSimplified] = React.useState(false);
  const [showFocusRing, setShowFocusRing] = React.useState(true);
  const [surfaceContext, setSurfaceContext] = React.useState<SurfaceContext>('default');
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

  const buttonMeta = manifest?.components?.button;
  const inverseSupported = supportsManifestSurfaceContext(buttonMeta, segment, theme, 'inverse');
  const activeSurfaceContext =
    surfaceContext === 'inverse' && !inverseSupported ? 'default' : surfaceContext;
  const buttonState = getManifestComponentState(buttonMeta, segment, theme, activeSurfaceContext);
  const surfaceContextOptions = inverseSupported
    ? SURFACE_CONTEXT_OPTIONS
    : SURFACE_CONTEXT_OPTIONS.slice(0, 1);
  const comparisonDefaultSurface = backgroundTones.tones.find(
    (tone) => tone.key === backgroundTones.defaultToneKey
  );
  const comparisonInverseSurface = backgroundTones.tones.find((tone) => tone.key === 'primary');

  React.useEffect(() => {
    if (surfaceContext === 'inverse' && !inverseSupported) {
      setSurfaceContext('default');
    }
  }, [inverseSupported, surfaceContext]);

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
      <ShowcaseControlGroup title="Surface context">
        <ShowcaseSelectControl
          label="Context"
          options={surfaceContextOptions}
          value={activeSurfaceContext}
          onValueChange={(value) => setSurfaceContext(value as SurfaceContext)}
          disabled={!inverseSupported}
        />
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

  // Only optional interaction capabilities use the manifest to show an unavailable indicator.
  // Rest, Focus, and Disabled always render: an omitted visual state can inherit Rest, and these
  // states remain part of the expected Button contract.
  const renderState = (
    semantic: string,
    emphasis: string,
    state: string,
    children: React.ReactNode
  ) => {
    if (!shouldCheckButtonStateAvailability(state)) {
      return children;
    }

    const isSupported = (() => {
      if (!buttonState) return true;
      const group = buttonState[semantic]?.[emphasis];
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
      <SurfaceContextComparison
        defaultBackground={comparisonDefaultSurface?.resolvedColor}
        inverseBackground={comparisonInverseSurface?.resolvedColor}
        inverseSupported={inverseSupported}
        fontName={fontName}
        textAlign={alignment}
      />
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
          stateCapabilities={buttonState}
          simplified={isSimplified}
          surfaceContext={activeSurfaceContext}
        />

        <ButtonStateSection
          intent="neutral"
          title="Neutral"
          fontName={fontName}
          align={alignment}
          stateCapabilities={buttonState}
          simplified={isSimplified}
          surfaceContext={activeSurfaceContext}
        />

        <ButtonStateSection
          intent="destructive"
          title="Destructive"
          fontName={fontName}
          align={alignment}
          stateCapabilities={buttonState}
          simplified={isSimplified}
          surfaceContext={activeSurfaceContext}
        />

        <ButtonStateSection
          intent="positive"
          title="Positive"
          fontName={fontName}
          align={alignment}
          stateCapabilities={buttonState}
          simplified={isSimplified}
          surfaceContext={activeSurfaceContext}
        />

        {/* [ACTIVATION FEEDBACK] START: Showcase examples for profile/origin overrides. */}
        <div className={s['interaction-state']}>
          <h3>Activation Feedback Profiles</h3>
          <div className={`${s['example-states']} k-root`}>
            <KButton
              intent="primary"
              emphasis="high"
              surfaceContext={activeSurfaceContext}
              activationFeedback={{ profile: 'ripple' }}
            >
              <KButton.Label>
                <SmoothText fontName={fontName} align={alignment}>
                  AF Ripple
                </SmoothText>
              </KButton.Label>
            </KButton>
            <KButton
              intent="primary"
              emphasis="high"
              surfaceContext={activeSurfaceContext}
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
              surfaceContext={activeSurfaceContext}
              activationFeedback={{ profile: 'ripple-overflow' }}
            >
              <KButton.Label>
                <SmoothText fontName={fontName} align={alignment}>
                  AF Ripple Overflow
                </SmoothText>
              </KButton.Label>
            </KButton>
            <KButton
              intent="primary"
              emphasis="high"
              surfaceContext={activeSurfaceContext}
              activationFeedback={{ profile: 'halo' }}
            >
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
                surfaceContext={activeSurfaceContext}
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
                surfaceContext={activeSurfaceContext}
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
          <KButton shadow={true} surfaceContext={activeSurfaceContext}>
            <KButton.Label>
              <SmoothText fontName={fontName} align={alignment}>
                Rest
              </SmoothText>
            </KButton.Label>
          </KButton>
          <KButton shadow={true} surfaceContext={activeSurfaceContext} status={'hover'}>
            <KButton.Label>
              <SmoothText fontName={fontName} align={alignment}>
                Hover
              </SmoothText>
            </KButton.Label>
          </KButton>
          <KButton shadow={true} surfaceContext={activeSurfaceContext} status={'focus'}>
            <KButton.Label>
              <SmoothText fontName={fontName} align={alignment}>
                Focus
              </SmoothText>
            </KButton.Label>
          </KButton>
          <KButton shadow={true} surfaceContext={activeSurfaceContext} status={'pressed'}>
            <KButton.Label>
              <SmoothText fontName={fontName} align={alignment}>
                Pressed
              </SmoothText>
            </KButton.Label>
          </KButton>
          <KButton shadow={true} surfaceContext={activeSurfaceContext} status={'disabled'}>
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
              <KButton
                scale="s:sm:2"
                intent="primary"
                emphasis="high"
                surfaceContext={activeSurfaceContext}
              >
                <KButton.Label>
                  <SmoothText fontName={fontName} align={alignment}>
                    Small 2
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderScale(
              's:sm:1',
              <KButton
                scale="s:sm:1"
                intent="primary"
                emphasis="high"
                surfaceContext={activeSurfaceContext}
              >
                <KButton.Label>
                  <SmoothText fontName={fontName} align={alignment}>
                    Small
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderScale(
              's:md:1',
              <KButton
                scale="s:md:1"
                intent="primary"
                emphasis="high"
                surfaceContext={activeSurfaceContext}
              >
                <KButton.Label>
                  <SmoothText fontName={fontName} align={alignment}>
                    Medium
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderScale(
              's:lg:1',
              <KButton
                scale="s:lg:1"
                intent="primary"
                emphasis="high"
                surfaceContext={activeSurfaceContext}
              >
                <KButton.Label>
                  <SmoothText fontName={fontName} align={alignment}>
                    Large
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderScale(
              's:lg:2',
              <KButton
                scale="s:lg:2"
                intent="primary"
                emphasis="high"
                surfaceContext={activeSurfaceContext}
              >
                <KButton.Label>
                  <SmoothText fontName={fontName} align={alignment}>
                    Large 2
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderScale(
              's:lg:3',
              <KButton
                scale="s:lg:3"
                intent="primary"
                emphasis="high"
                surfaceContext={activeSurfaceContext}
              >
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
