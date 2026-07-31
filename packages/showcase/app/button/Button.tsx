'use client';

import type { ComponentEmphasis, ElementSizeValue, SurfaceContext } from '@kiskadee/core';
import {
  Button as KButton,
  SmoothText,
  useKiskadee,
  useShowcase
} from '@kiskadee/react-components';
import { BanIcon } from 'lucide-react';
import React from 'react';
import {
  ShowcaseGlobalSemanticControls,
  ShowcaseTypographyControls
} from '@/components/DesignSystemControls/ShowcaseGlobalControls';
import {
  ShowcaseBooleanControl,
  ShowcaseControlField,
  ShowcaseControlGroup,
  ShowcaseControlPanel,
  ShowcaseControlStack,
  ShowcaseRouteControls,
  ShowcaseSegmentedControl,
  ShowcaseSelectControl
} from '@/components/ShowcaseControls';
import {
  type ButtonStressTestBackgroundToneKey,
  useButtonStressTestBackgroundTones
} from '@/hooks/use-background-tones';
import { useCanonicalCardSurfaces } from '@/hooks/use-canonical-card-surfaces';
import { SwatchRadioGroup } from '@/k-components';
import {
  getAvailableButtonStressTestBackgrounds,
  getPreferredButtonStressTestBackground,
  resolveBackgroundSurfaceContext
} from '@/utils/button-stress-test-backgrounds';
import { type CanonicalCardSurfaceKey, isDarkSurfaceColor } from '@/utils/canonical-card-surfaces';
import {
  getManifestComponentState,
  supportsManifestSurfaceContext
} from '@/utils/manifest-surface-context';
import s from './Button.module.scss';
import { ButtonIconExamples } from './components/ButtonIconExamples';
import ButtonStateSection from './components/ButtonStateSection';
import { shouldCheckButtonStateAvailability } from './components/buttonStateAvailability';
import { SocialButtonExamples } from './components/SocialButtonExamples';

const SURFACE_CONTEXT_OPTIONS: Array<{ value: SurfaceContext; label: string }> = [
  { value: 'onSubtle', label: 'On subtle' },
  { value: 'onVivid', label: 'On vivid' }
];
const BACKGROUND_MODE_OPTIONS = [
  { value: 'canonical', label: 'Canonical' },
  { value: 'stress-test', label: 'Stress test' }
] as const;
type BackgroundMode = (typeof BACKGROUND_MODE_OPTIONS)[number]['value'];
const BUTTON_SCALE_OPTIONS: Array<{ value: ElementSizeValue; label: string }> = [
  { value: 's:sm:2', label: 'Small 2' },
  { value: 's:sm:1', label: 'Small' },
  { value: 's:md:1', label: 'Medium' },
  { value: 's:lg:1', label: 'Large' },
  { value: 's:lg:2', label: 'Large 2' },
  { value: 's:lg:3', label: 'Large 3' }
];
const COMPARISON_EMPHASES: ComponentEmphasis[] = ['high', 'medium', 'low', 'lowest'];

function SurfaceContextComparison({
  onSubtleBackground,
  fontName,
  onVividBackground,
  onVividSupported,
  scale,
  textAlign
}: {
  onSubtleBackground: string | undefined;
  fontName: string;
  onVividBackground: string | undefined;
  onVividSupported: boolean;
  scale: ElementSizeValue;
  textAlign: 'left' | 'center';
}) {
  return (
    <section className={s.contextComparison} aria-labelledby="surface-context-comparison-title">
      <h3 id="surface-context-comparison-title">Surface contexts</h3>
      <p className={s.contextComparisonDescription}>
        The same Primary Rest buttons rendered simultaneously on subtle and vivid surfaces.
      </p>
      <div className={s.contextComparisonGrid}>
        <article className={s.contextCard}>
          <h4>On subtle</h4>
          <div
            className={`${s.contextSurface} k-root`}
            style={onSubtleBackground ? { backgroundColor: onSubtleBackground } : undefined}
          >
            {COMPARISON_EMPHASES.map((emphasis) => (
              <KButton
                key={emphasis}
                intent="primary"
                emphasis={emphasis}
                scale={scale}
                surfaceContext="onSubtle"
              >
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
          <h4>On vivid</h4>
          <div
            className={`${s.contextSurface} ${s.onVividContextSurface} k-root`}
            style={onVividBackground ? { backgroundColor: onVividBackground } : undefined}
          >
            {onVividSupported ? (
              COMPARISON_EMPHASES.map((emphasis) => (
                <KButton
                  key={emphasis}
                  intent="primary"
                  emphasis={emphasis}
                  scale={scale}
                  surfaceContext="onVivid"
                >
                  <KButton.Label>
                    <SmoothText fontName={fontName} align={textAlign}>
                      {emphasis}
                    </SmoothText>
                  </KButton.Label>
                </KButton>
              ))
            ) : (
              <p className={s.contextUnavailable}>On vivid is not available in this palette.</p>
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
  const canonicalBackgrounds = useCanonicalCardSurfaces();

  const [isSelected, setIsSelected] = React.useState(false);
  const [isSelectedVivid, setIsSelectedVivid] = React.useState(false);
  const [isSimplified, setIsSimplified] = React.useState(false);
  const [showFocusRing, setShowFocusRing] = React.useState(true);
  const [buttonScale, setButtonScale] = React.useState<ElementSizeValue>('s:md:1');
  const [surfaceContext, setSurfaceContext] = React.useState<SurfaceContext>('onSubtle');
  const [backgroundMode, setBackgroundMode] = React.useState<BackgroundMode>('canonical');
  const [canonicalSurface, setCanonicalSurface] =
    React.useState<CanonicalCardSurfaceKey>('neutral.low');
  const [stressTestSurface, setStressTestSurface] =
    React.useState<ButtonStressTestBackgroundToneKey>('white');
  const stressTestBackgrounds = useButtonStressTestBackgroundTones();
  const availableStressTestTones = React.useMemo(
    () => getAvailableButtonStressTestBackgrounds(stressTestBackgrounds.tones, theme),
    [stressTestBackgrounds.tones, theme]
  );
  const stressTestBackgroundItems = React.useMemo(
    () =>
      availableStressTestTones.map((tone) => ({
        value: tone.key,
        label: tone.aria,
        swatch: {
          color: tone.displayColor
        }
      })),
    [availableStressTestTones]
  );

  const activeCanonicalSurfaceKey = React.useMemo(
    () =>
      canonicalBackgrounds.tones.some((tone) => tone.key === canonicalSurface)
        ? canonicalSurface
        : canonicalBackgrounds.defaultToneKey,
    [canonicalBackgrounds.defaultToneKey, canonicalBackgrounds.tones, canonicalSurface]
  );
  const activeStressTestSurfaceKey = React.useMemo(
    () =>
      availableStressTestTones.some((tone) => tone.key === stressTestSurface)
        ? stressTestSurface
        : (availableStressTestTones[0]?.key ?? stressTestBackgrounds.defaultToneKey),
    [availableStressTestTones, stressTestBackgrounds.defaultToneKey, stressTestSurface]
  );
  const backgroundItems =
    backgroundMode === 'canonical' ? canonicalBackgrounds.items : stressTestBackgroundItems;
  const activeBackgroundKey =
    backgroundMode === 'canonical' ? activeCanonicalSurfaceKey : activeStressTestSurfaceKey;
  const selectedSurface = React.useMemo(
    () =>
      backgroundMode === 'canonical'
        ? canonicalBackgrounds.tones.find((tone) => tone.key === activeCanonicalSurfaceKey)
        : availableStressTestTones.find((tone) => tone.key === activeStressTestSurfaceKey),
    [
      activeCanonicalSurfaceKey,
      activeStressTestSurfaceKey,
      backgroundMode,
      canonicalBackgrounds.tones,
      availableStressTestTones
    ]
  );

  const selectBackgroundForSurfaceContext = React.useCallback(
    (nextSurfaceContext: SurfaceContext, nextBackgroundMode: BackgroundMode) => {
      if (nextBackgroundMode === 'canonical') {
        const nextCanonicalSurface = canonicalBackgrounds.tones.find(
          (tone) => tone.contentSurfaceContext === nextSurfaceContext
        );
        if (nextCanonicalSurface) setCanonicalSurface(nextCanonicalSurface.key);
        return;
      }

      const nextStressTestSurface = getPreferredButtonStressTestBackground(
        stressTestBackgrounds.tones,
        theme,
        nextSurfaceContext
      );
      if (nextStressTestSurface) setStressTestSurface(nextStressTestSurface.key);
    },
    [canonicalBackgrounds.tones, stressTestBackgrounds.tones, theme]
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

  const activeSurfaceContext = surfaceContext;
  const isDarkSurface = selectedSurface ? isDarkSurfaceColor(selectedSurface.resolvedColor) : false;

  const isCarbon = designSystem === 'carbon-1-ibm';
  const alignment = isCarbon ? 'left' : 'center';
  const routeClassName = [
    isDarkSurface ? s.darkSurface : undefined,
    showFocusRing ? undefined : s.focusRingHidden
  ]
    .filter(Boolean)
    .join(' ');

  const buttonMeta = manifest?.components?.button;
  const onVividSupported = supportsManifestSurfaceContext(buttonMeta, segment, theme, 'onVivid');
  const availableButtonScaleOptions = BUTTON_SCALE_OPTIONS.filter(
    (option) => !buttonMeta?.scale || Boolean(buttonMeta.scale[option.value])
  );
  const activeButtonScale =
    availableButtonScaleOptions.find((option) => option.value === buttonScale)?.value ??
    availableButtonScaleOptions.find((option) => option.value === 's:md:1')?.value ??
    availableButtonScaleOptions[0]?.value ??
    's:md:1';
  const buttonState = getManifestComponentState(buttonMeta, segment, theme, activeSurfaceContext);
  const comparisonOnSubtleSurface = canonicalBackgrounds.tones.find(
    (tone) => tone.contentSurfaceContext === 'onSubtle'
  );
  const comparisonOnVividSurface = canonicalBackgrounds.tones.find(
    (tone) => tone.contentSurfaceContext === 'onVivid'
  );

  const buttonControls = (
    <ShowcaseControlPanel>
      <ShowcaseControlGroup title="Ambiente">
        <ShowcaseGlobalSemanticControls />
        <ShowcaseSegmentedControl
          label="Surface context"
          options={SURFACE_CONTEXT_OPTIONS}
          value={activeSurfaceContext}
          onValueChange={(value) => {
            const nextSurfaceContext = value as SurfaceContext;
            setSurfaceContext(nextSurfaceContext);
            setBackgroundMode('canonical');
            selectBackgroundForSurfaceContext(nextSurfaceContext, 'canonical');
          }}
          disabled={!onVividSupported}
        />
        <ShowcaseControlField className={s.backgroundControl} fullWidth>
          <ShowcaseSegmentedControl
            label="Background"
            options={BACKGROUND_MODE_OPTIONS}
            value={backgroundMode}
            onValueChange={(value) => {
              const nextBackgroundMode = value as BackgroundMode;
              setBackgroundMode(nextBackgroundMode);
              selectBackgroundForSurfaceContext(surfaceContext, nextBackgroundMode);
            }}
          />
          {backgroundItems.length > 0 ? (
            <SwatchRadioGroup
              className={`${s.backgroundToneGrid} ${
                backgroundMode === 'canonical'
                  ? s.canonicalBackgroundToneGrid
                  : `${s.stressTestBackgroundToneGrid} ${
                      theme === 'light' ? s.stressTestLightToneGrid : s.stressTestDarkToneGrid
                    }`
              }`}
              groupLabel={
                backgroundMode === 'canonical'
                  ? 'Canonical Card surfaces'
                  : 'Adversarial stress-test surfaces'
              }
              value={activeBackgroundKey}
              onValueChange={(value) => {
                if (backgroundMode === 'canonical') {
                  const nextCanonicalSurfaceKey = value as CanonicalCardSurfaceKey;
                  const nextCanonicalSurface = canonicalBackgrounds.tones.find(
                    (tone) => tone.key === nextCanonicalSurfaceKey
                  );

                  setCanonicalSurface(nextCanonicalSurfaceKey);
                  if (nextCanonicalSurface) {
                    setSurfaceContext(nextCanonicalSurface.contentSurfaceContext);
                  }
                  return;
                }

                const nextStressTestSurfaceKey = value as ButtonStressTestBackgroundToneKey;
                const nextStressTestSurface = stressTestBackgrounds.tones.find(
                  (tone) => tone.key === nextStressTestSurfaceKey
                );

                setStressTestSurface(nextStressTestSurfaceKey);
                if (nextStressTestSurface) {
                  setSurfaceContext(resolveBackgroundSurfaceContext(nextStressTestSurface.row));
                }
              }}
              items={backgroundItems}
              aria-label="Button example background"
            />
          ) : (
            <p className={s.backgroundEmptyState} role="status">
              This preset does not publish canonical Card surfaces for the active palette.
            </p>
          )}
          <p className={s.backgroundModeDescription}>
            {backgroundMode === 'canonical'
              ? 'Approved Card surfaces from the active preset, segment, and theme.'
              : 'Adversarial color combinations for diagnosis; not a preset support guarantee.'}
          </p>
        </ShowcaseControlField>
      </ShowcaseControlGroup>
      <ShowcaseControlGroup title="Tipografia">
        <ShowcaseTypographyControls />
      </ShowcaseControlGroup>
      <ShowcaseControlGroup title="Visualização">
        <ShowcaseControlStack>
          <ShowcaseSelectControl
            label="Button size"
            options={availableButtonScaleOptions}
            value={activeButtonScale}
            onValueChange={(value) => setButtonScale(value as ElementSizeValue)}
          />
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
        <BanIcon width={24} height={24} />
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
        <BanIcon width={24} height={24} />
      </div>
    );
  };

  return (
    <section className={routeClassName || undefined}>
      <h2>Button</h2>
      <ShowcaseRouteControls
        id="button"
        eyebrow="Button"
        title="Controls"
        showGlobalControls={false}
      >
        {buttonControls}
      </ShowcaseRouteControls>
      <SurfaceContextComparison
        onSubtleBackground={comparisonOnSubtleSurface?.resolvedColor}
        onVividBackground={comparisonOnVividSurface?.resolvedColor}
        onVividSupported={onVividSupported}
        fontName={fontName}
        scale={activeButtonScale}
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
          scale={activeButtonScale}
          surfaceContext={activeSurfaceContext}
        />

        <ButtonStateSection
          intent="neutral"
          title="Neutral"
          fontName={fontName}
          align={alignment}
          stateCapabilities={buttonState}
          simplified={isSimplified}
          scale={activeButtonScale}
          surfaceContext={activeSurfaceContext}
        />

        <ButtonStateSection
          intent="destructive"
          title="Destructive"
          fontName={fontName}
          align={alignment}
          stateCapabilities={buttonState}
          simplified={isSimplified}
          scale={activeButtonScale}
          surfaceContext={activeSurfaceContext}
        />

        <ButtonStateSection
          intent="positive"
          title="Positive"
          fontName={fontName}
          align={alignment}
          stateCapabilities={buttonState}
          simplified={isSimplified}
          scale={activeButtonScale}
          surfaceContext={activeSurfaceContext}
        />

        {/* [ACTIVATION FEEDBACK] START: Showcase examples for profile/origin overrides. */}
        <div className={s['interaction-state']}>
          <h3>Activation Feedback Profiles</h3>
          <div className={`${s['example-states']} k-root`}>
            <KButton
              intent="primary"
              emphasis="high"
              scale={activeButtonScale}
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
              scale={activeButtonScale}
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
              scale={activeButtonScale}
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
              scale={activeButtonScale}
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
                scale={activeButtonScale}
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
                scale={activeButtonScale}
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
          <KButton scale={activeButtonScale} shadow={true} surfaceContext={activeSurfaceContext}>
            <KButton.Label>
              <SmoothText fontName={fontName} align={alignment}>
                Rest
              </SmoothText>
            </KButton.Label>
          </KButton>
          <KButton
            scale={activeButtonScale}
            shadow={true}
            surfaceContext={activeSurfaceContext}
            status={'hover'}
          >
            <KButton.Label>
              <SmoothText fontName={fontName} align={alignment}>
                Hover
              </SmoothText>
            </KButton.Label>
          </KButton>
          <KButton
            scale={activeButtonScale}
            shadow={true}
            surfaceContext={activeSurfaceContext}
            status={'focus'}
          >
            <KButton.Label>
              <SmoothText fontName={fontName} align={alignment}>
                Focus
              </SmoothText>
            </KButton.Label>
          </KButton>
          <KButton
            scale={activeButtonScale}
            shadow={true}
            surfaceContext={activeSurfaceContext}
            status={'pressed'}
          >
            <KButton.Label>
              <SmoothText fontName={fontName} align={alignment}>
                Pressed
              </SmoothText>
            </KButton.Label>
          </KButton>
          <KButton
            scale={activeButtonScale}
            shadow={true}
            surfaceContext={activeSurfaceContext}
            status={'disabled'}
          >
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
        <ButtonIconExamples
          fontName={fontName}
          scale={activeButtonScale}
          surfaceContext={activeSurfaceContext}
        />
        {designSystem === 'fluent-2-microsoft' ? (
          <SocialButtonExamples
            fontName={fontName}
            scale={activeButtonScale}
            onSubtleBackground={comparisonOnSubtleSurface?.resolvedColor}
            onVividBackground={comparisonOnVividSurface?.resolvedColor}
          />
        ) : null}
      </div>
    </section>
  );
}

export default Button;
