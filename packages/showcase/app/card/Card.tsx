'use client';

import {
  type ButtonIntent,
  type CardIntent,
  type CardRadiusMode,
  type ComponentEmphasis,
  type ElementSizeValue,
  elementSizeValues,
  type InteractionState,
  type ShadowElementEffectSchema,
  type ShadowGlobalEffectSchema,
  type ShadowKind,
  type ShadowLayer,
  type ShadowLayerValue,
  type SolidColor
} from '@kiskadee/core';
import {
  Button as KButton,
  Card as KCard,
  CardAction as KCardAction,
  Text,
  useCardArtifactConfig,
  useKiskadee,
  useShowcase
} from '@kiskadee/react-components';
import type { ManifestComponent, ManifestComponentState } from '@kiskadee/web-builder/types';
import React from 'react';
import {
  ShowcaseBooleanControl,
  ShowcaseControlGrid,
  ShowcaseControlGroup,
  ShowcaseControlPanel,
  ShowcaseControlStack,
  ShowcaseRouteControls,
  ShowcaseSelectControl
} from '@/components/ShowcaseControls';
import { useShowcaseDisplayPreferences } from '@/components/ShowcaseDisplayPreferences';
import { useShowcaseBackground } from '@/hooks/use-showcase-background';
import { getManifestComponentState } from '@/utils/manifest-surface-context';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import s from './Card.module.scss';
import { CardComposition } from './CardComposition';

const cardRadiusOptions: Array<{ value: CardRadiusMode; label: string }> = [
  { value: 'rounded', label: 'Rounded' },
  { value: 'square', label: 'Square' }
];

type CardShadowOption = 'off' | ElementSizeValue;

type CardDemoButtonProfile = {
  emphasis: ComponentEmphasis;
  intent: ButtonIntent;
  scale?: ElementSizeValue;
};

type CardSemanticSample = {
  emphasis: ComponentEmphasis;
  intent: CardIntent;
};

type ShadowLevelDocumentation = {
  cardShadow?: ElementSizeValue;
  cssValue: string;
  kind: ShadowKind;
  label: string;
  layers: readonly ShadowLayer[];
  level: string;
  usageLabels: readonly string[];
};

const shadowLevelLabels: Record<ElementSizeValue, string> = {
  's:sm:5': 'Small 5',
  's:sm:4': 'Small 4',
  's:sm:3': 'Small 3',
  's:sm:2': 'Small 2',
  's:sm:1': 'Small 1',
  's:md:1': 'Medium 1',
  's:lg:1': 'Large 1',
  's:lg:2': 'Large 2',
  's:lg:3': 'Large 3',
  's:lg:4': 'Large 4',
  's:lg:5': 'Large 5'
};

const cardIntentLabels: Record<CardIntent, string> = {
  neutral: 'Neutral',
  primary: 'Primary'
};

const cardEmphasisLabels: Record<ComponentEmphasis, string> = {
  lowest: 'Lowest',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  highest: 'Highest'
};

const cardSemanticIntentOrder: CardIntent[] = ['neutral', 'primary'];
const cardSemanticEmphasisOrder: ComponentEmphasis[] = [
  'lowest',
  'low',
  'medium',
  'high',
  'highest'
];
const shadowKindOrder: ShadowKind[] = ['outer', 'inner'];
const shadowKindLabels: Record<ShadowKind, string> = {
  outer: 'Outer',
  inner: 'Inner'
};
const cardShadowStateLabels: Partial<Record<InteractionState, string>> = {
  rest: 'Rest',
  hover: 'Hover',
  focus: 'Focus',
  pressed: 'Pressed',
  disabled: 'Disabled',
  selected: 'Selected'
};

function normalizeShadowLevelKey(key: string): ElementSizeValue | undefined {
  const normalized = key.startsWith('s:') ? key : `s:${key}`;
  return elementSizeValues.includes(normalized as ElementSizeValue)
    ? (normalized as ElementSizeValue)
    : undefined;
}

function formatShadowLevelLabel(level: string): string {
  const normalized = normalizeShadowLevelKey(level);

  return normalized ? shadowLevelLabels[normalized] : level;
}

function getOrderedShadowLevelKeys(
  levels: Partial<Record<ElementSizeValue, ShadowLayerValue>>
): string[] {
  const availableLevels = Object.keys(levels);
  const knownLevels = elementSizeValues.filter((level) => availableLevels.includes(level));
  const customLevels = availableLevels
    .filter((level) => !normalizeShadowLevelKey(level))
    .sort((a, b) => a.localeCompare(b));

  return [...knownLevels, ...customLevels];
}

function isShadowLayerStack(value: ShadowLayerValue): value is readonly ShadowLayer[] {
  return Array.isArray(value);
}

function normalizeShadowLayers(value: ShadowLayerValue): readonly ShadowLayer[] {
  return isShadowLayerStack(value) ? value : [value];
}

function formatCssLength(value: number): string {
  return `${value}px`;
}

function formatShadowColor(color: SolidColor): string {
  return color;
}

function formatShadowLayerCss(kind: ShadowKind, layer: ShadowLayer): string {
  const inset = kind === 'inner' ? 'inset ' : '';
  const spread = layer.spread === undefined ? '' : ` ${formatCssLength(layer.spread)}`;

  return `${inset}${formatCssLength(layer.x)} ${formatCssLength(layer.y)} ${formatCssLength(
    layer.blur
  )}${spread} ${formatShadowColor(layer.color)}`;
}

function formatShadowCssValue(kind: ShadowKind, layers: readonly ShadowLayer[]): string {
  return layers.map((layer) => formatShadowLayerCss(kind, layer)).join(', ');
}

function buildCardShadowUsageByLevel(
  cardShadowEffect: ShadowElementEffectSchema | undefined
): Record<string, string[]> {
  const usageByLevel = new Map<string, string[]>();
  const appendUsage = (level: string, label: string) => {
    const current = usageByLevel.get(level) ?? [];
    if (!current.includes(label)) {
      usageByLevel.set(level, [...current, label]);
    }
  };

  for (const [state, level] of Object.entries(cardShadowEffect?.states ?? {})) {
    if (typeof level !== 'string') continue;
    appendUsage(level, cardShadowStateLabels[state as InteractionState] ?? state);
  }

  for (const level of cardShadowEffect?.fixedLevels ?? []) {
    appendUsage(level, 'Static');
  }

  return Object.fromEntries(usageByLevel);
}

function buildShadowDocumentationByKind({
  cardShadowUsageByLevel,
  cardSupportedShadowLevels,
  shadowEffect
}: {
  cardShadowUsageByLevel: Record<string, string[]>;
  cardSupportedShadowLevels: readonly ElementSizeValue[];
  shadowEffect: ShadowGlobalEffectSchema | undefined;
}): Record<ShadowKind, ShadowLevelDocumentation[]> {
  return shadowKindOrder.reduce(
    (acc, kind) => {
      const levels = shadowEffect?.[kind]?.levels;

      if (!levels) {
        acc[kind] = [];
        return acc;
      }

      acc[kind] = getOrderedShadowLevelKeys(levels).flatMap((level) => {
        const value = levels[level as ElementSizeValue];
        if (!value) return [];

        const normalizedLevel = normalizeShadowLevelKey(level);
        const layers = normalizeShadowLayers(value);
        const cardShadow =
          kind === 'outer' && normalizedLevel && cardSupportedShadowLevels.includes(normalizedLevel)
            ? normalizedLevel
            : undefined;

        return [
          {
            cardShadow,
            cssValue: formatShadowCssValue(kind, layers),
            kind,
            label: formatShadowLevelLabel(level),
            layers,
            level,
            usageLabels: cardShadowUsageByLevel[level] ?? []
          }
        ];
      });

      return acc;
    },
    { outer: [], inner: [] } as Record<ShadowKind, ShadowLevelDocumentation[]>
  );
}

function CardContent({
  title = 'Project overview',
  body = 'Keep related information together.'
}: {
  title?: string;
  body?: string;
}) {
  const profiles = useShowcaseTextProfiles();
  return (
    <div className={s.content}>
      <Text as="span" profile={profiles.groupTitle}>
        {title}
      </Text>
      <Text as="span" profile={profiles.caption} emphasis="low">
        {body}
      </Text>
    </div>
  );
}

function SectionHeading({
  id,
  title,
  description
}: {
  id: string;
  title: string;
  description: string;
}) {
  const profiles = useShowcaseTextProfiles();
  const { showDescriptions } = useShowcaseDisplayPreferences();
  return (
    <header className={s.sectionHeader}>
      <Text as="h3" id={id} profile={profiles.sectionTitle}>
        {title}
      </Text>
      {showDescriptions ? (
        <Text as="p" profile={profiles.body} className={s.description}>
          {description}
        </Text>
      ) : null}
    </header>
  );
}

const demoButtonScaleOrder: ElementSizeValue[] = ['s:md:1', 's:sm:1', 's:lg:1'];
const demoButtonIntentOrder: ButtonIntent[] = ['primary', 'neutral', 'destructive', 'positive'];
const demoButtonEmphasisOrder: ComponentEmphasis[] = ['medium', 'high', 'low', 'lowest'];

function resolveCardSemanticSamples(
  state: ManifestComponentState | undefined
): CardSemanticSample[] {
  if (!state) return [];

  return cardSemanticIntentOrder.flatMap((intent) =>
    cardSemanticEmphasisOrder
      .filter((emphasis) => Boolean(state[intent]?.[emphasis]?.rest))
      .map((emphasis) => ({ emphasis, intent }))
  );
}

function resolveDemoButtonScale(buttonManifest: ManifestComponent | undefined) {
  if (!buttonManifest?.scale) return 's:md:1';

  return (
    demoButtonScaleOrder.find((scale) => buttonManifest.scale?.[scale]) ??
    elementSizeValues.find((scale) => buttonManifest.scale?.[scale])
  );
}

function resolveDemoButtonProfile(
  buttonManifest: ManifestComponent | undefined,
  state: ManifestComponentState | undefined
): CardDemoButtonProfile {
  const scale = resolveDemoButtonScale(buttonManifest);

  if (!state) {
    return { emphasis: 'medium', intent: 'primary', scale };
  }

  for (const intent of demoButtonIntentOrder) {
    for (const emphasis of demoButtonEmphasisOrder) {
      if (state[intent]?.[emphasis]?.rest) {
        return { emphasis, intent, scale };
      }
    }
  }

  return { emphasis: 'medium', intent: 'primary', scale };
}

export function Card() {
  const { global, segment, theme } = useKiskadee();
  const { manifest } = useShowcase();
  const { cardClassesMap } = useCardArtifactConfig();
  const background = useShowcaseBackground();
  const profiles = useShowcaseTextProfiles();
  const { showDescriptions } = useShowcaseDisplayPreferences();
  const cardManifest = manifest?.components?.card;
  const buttonManifest = manifest?.components?.button;
  const cardState = getManifestComponentState(
    cardManifest,
    segment,
    theme,
    background.surfaceContext
  );
  const buttonState = getManifestComponentState(
    buttonManifest,
    segment,
    theme,
    background.surfaceContext
  );
  const isCardAvailable = Boolean(cardManifest);
  const supportedScales = cardManifest?.scale;
  const defaultRadius: CardRadiusMode = 'rounded';
  const [passiveActivations, setPassiveActivations] = React.useState(0);
  const [selected, setSelected] = React.useState(false);
  const [interactionIntent, setInteractionIntent] = React.useState<CardIntent>('neutral');
  const [interactionEmphasis, setInteractionEmphasis] = React.useState<ComponentEmphasis>('medium');
  const [lockedSelected, setLockedSelected] = React.useState(false);
  const [interactionLocked, setInteractionLocked] = React.useState(true);
  const [radius, setRadius] = React.useState<CardRadiusMode>(defaultRadius);
  const [staticShadow, setStaticShadow] = React.useState<CardShadowOption>('off');
  const [cardActionShadow, setCardActionShadow] = React.useState(false);
  const [preserveBorderWithShadow, setPreserveBorderWithShadow] = React.useState(true);
  const resolvedStaticShadow = staticShadow === 'off' ? undefined : staticShadow;
  const demoButtonProfile = React.useMemo(
    () => resolveDemoButtonProfile(buttonManifest, buttonState),
    [buttonManifest, buttonState]
  );
  const fixedShadowLevels = React.useMemo(() => {
    const shadowBucket = cardClassesMap?.e1?.e?.h;

    if (!shadowBucket || typeof shadowBucket === 'string') {
      return [];
    }

    return elementSizeValues.filter((size) => {
      const key = normalizeShadowLevelKey(size)?.slice(2);
      return Boolean(key && shadowBucket[key]);
    });
  }, [cardClassesMap]);
  const semanticSamples = React.useMemo(() => resolveCardSemanticSamples(cardState), [cardState]);
  const comparisonSample =
    semanticSamples.find(
      (sample) => `${sample.intent}.${sample.emphasis}` === background.surfaces[0]?.key
    ) ?? semanticSamples[0];
  const interactionSample =
    semanticSamples.find(
      (sample) => sample.intent === interactionIntent && sample.emphasis === interactionEmphasis
    ) ??
    semanticSamples.find(
      (sample) => sample.intent === interactionIntent && sample.emphasis === 'medium'
    ) ??
    semanticSamples.find((sample) => sample.intent === interactionIntent) ??
    semanticSamples[0];
  const comparisonShadow =
    resolvedStaticShadow ??
    fixedShadowLevels.find((level) => level === 's:md:1') ??
    fixedShadowLevels[0];
  const contextSurfaces = ['onSubtle', 'onVivid'].flatMap((context) => {
    const surface = background.surfaces.find((item) => item.contentSurfaceContext === context);
    return surface ? [surface] : [];
  });

  const radiusSelectOptions = React.useMemo(
    () =>
      cardRadiusOptions.map((option) => ({
        ...option,
        label: option.value === defaultRadius ? `${option.label} (default)` : option.label,
        disabled: supportedScales ? !supportedScales[option.value] : false
      })),
    [supportedScales]
  );
  const staticShadowOptions = React.useMemo(
    () => [
      { value: 'off', label: 'Off (default)' },
      ...fixedShadowLevels.map((level) => ({
        value: level,
        label: `${shadowLevelLabels[level]} (${level})`
      }))
    ],
    [fixedShadowLevels]
  );
  const cardShadowUsageByLevel = React.useMemo(
    () => buildCardShadowUsageByLevel(global?.components?.card?.effects?.shadow?.e1),
    [global?.components?.card?.effects?.shadow?.e1]
  );
  const shadowDocumentationByKind = React.useMemo(
    () =>
      buildShadowDocumentationByKind({
        cardShadowUsageByLevel,
        cardSupportedShadowLevels: fixedShadowLevels,
        shadowEffect: global?.effects?.shadow
      }),
    [cardShadowUsageByLevel, fixedShadowLevels, global?.effects?.shadow]
  );
  const showShadowDocumentation = shadowKindOrder.some(
    (kind) => shadowDocumentationByKind[kind].length > 0
  );

  React.useEffect(() => {
    if (staticShadow === 'off') return;
    if (fixedShadowLevels.includes(staticShadow)) return;
    setStaticShadow('off');
  }, [fixedShadowLevels, staticShadow]);

  const cardControls = (
    <ShowcaseControlPanel>
      <ShowcaseControlGroup title="Appearance">
        <ShowcaseControlGrid>
          <ShowcaseSelectControl
            label="Radius"
            options={radiusSelectOptions}
            value={radius}
            onValueChange={(value) => setRadius(value as CardRadiusMode)}
            disabled={!isCardAvailable || radiusSelectOptions.length <= 1}
          />
          <ShowcaseSelectControl
            label="Static shadow"
            options={staticShadowOptions}
            value={staticShadow}
            onValueChange={(value) => setStaticShadow(value as CardShadowOption)}
            disabled={!isCardAvailable || fixedShadowLevels.length === 0}
          />
        </ShowcaseControlGrid>
        <ShowcaseControlStack>
          <ShowcaseBooleanControl
            label="Preserve border with shadow"
            checked={preserveBorderWithShadow}
            onCheckedChange={setPreserveBorderWithShadow}
          />
        </ShowcaseControlStack>
      </ShowcaseControlGroup>
      <ShowcaseControlGroup title="CardAction">
        <ShowcaseControlStack>
          <ShowcaseBooleanControl
            label="Shadow"
            checked={cardActionShadow}
            onCheckedChange={setCardActionShadow}
          />
          <ShowcaseBooleanControl
            label="Interaction locked"
            checked={interactionLocked}
            onCheckedChange={setInteractionLocked}
          />
        </ShowcaseControlStack>
      </ShowcaseControlGroup>
    </ShowcaseControlPanel>
  );

  return (
    <section className={s.route} aria-labelledby="card-page-title">
      <header className={s.pageHeader}>
        <Text as="h2" id="card-page-title" profile={profiles.pageTitle}>
          Card
        </Text>
        {showDescriptions ? (
          <Text as="p" profile={profiles.body} className={s.description}>
            Compare surfaces, boundaries and elevation. Card groups content; CardAction makes the
            whole surface interactive.
          </Text>
        ) : null}
      </header>
      <ShowcaseRouteControls
        id="card"
        eyebrow="Card"
        title="Controls"
        isAvailable={isCardAvailable}
      >
        {cardControls}
      </ShowcaseRouteControls>

      {isCardAvailable && semanticSamples.length ? (
        <div className={s.sections}>
          <section className={s.exampleSection} aria-labelledby="card-surfaces">
            <SectionHeading
              id="card-surfaces"
              title="Surfaces"
              description="Read each intent from lowest to highest. The same content makes the preset's fill and border choices easier to compare. Empty positions are not published by this preset."
            />
            {cardSemanticIntentOrder.map((intent) => (
              <div className={s.intentGroup} key={intent}>
                <Text as="h4" profile={profiles.subsectionTitle}>
                  {cardIntentLabels[intent]}
                </Text>
                <div className={s.surfaceGrid}>
                  {cardSemanticEmphasisOrder.map((emphasis) => {
                    const available = Boolean(cardState?.[intent]?.[emphasis]?.rest);
                    return (
                      <article
                        className={s.example}
                        key={emphasis}
                        aria-label={`${intent} ${emphasis}`}
                      >
                        <Text as="h5" profile={profiles.bodyStrong}>
                          {cardEmphasisLabels[emphasis]}
                        </Text>
                        {available ? (
                          <KCard
                            className={s.cardSurface}
                            intent={intent}
                            emphasis={emphasis}
                            radius={radius}
                            shadow={resolvedStaticShadow}
                            preserveBorderWithShadow={preserveBorderWithShadow}
                          >
                            <CardContent />
                          </KCard>
                        ) : (
                          <div className={s.emptyPosition}>
                            <Text as="span" profile={profiles.caption} emphasis="low">
                              Not published
                            </Text>
                          </div>
                        )}
                        <Text as="code" profile={profiles.caption} emphasis="low">
                          {intent}.{emphasis}
                        </Text>
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>

          <section className={s.exampleSection} aria-labelledby="card-composition">
            <SectionHeading
              id="card-composition"
              title="Composition"
              description="Inspired by the Fluent UI Preview: base, light neutral, paired tonal surfaces and a vivid region. Real components inherit the context of each Card."
            />
            <CardComposition radius={radius} />
          </section>

          {contextSurfaces.length === 2 ? (
            <section className={s.exampleSection} aria-labelledby="card-contexts">
              <SectionHeading
                id="card-contexts"
                title="Surface contexts"
                description="The same Card recipes on two surrounding surfaces, without shadows. Compare which boundaries remain visible when the surrounding context changes."
              />
              <div className={s.contextGrid}>
                {contextSurfaces.map((surface) => {
                  const [intent, emphasis] = surface.key.split('.') as [
                    CardIntent,
                    ComponentEmphasis
                  ];
                  const state = getManifestComponentState(
                    cardManifest,
                    segment,
                    theme,
                    surface.contentSurfaceContext
                  );
                  return (
                    <article className={s.example} key={surface.key}>
                      <Text as="h4" profile={profiles.subsectionTitle}>
                        {surface.contentSurfaceContext === 'onSubtle' ? 'On subtle' : 'On vivid'}
                      </Text>
                      <KCard
                        intent={intent}
                        emphasis={emphasis}
                        radius={radius}
                        className={s.contextHost}
                      >
                        <div className={s.contextSamples}>
                          {semanticSamples
                            .filter(
                              (sample) =>
                                (sample.intent === 'neutral' &&
                                  ['lowest', 'medium'].includes(sample.emphasis)) ||
                                (sample.intent === 'primary' && sample.emphasis === 'highest')
                            )
                            .filter((sample) => state?.[sample.intent]?.[sample.emphasis]?.rest)
                            .map((sample) => (
                              <div
                                className={s.example}
                                key={`${sample.intent}.${sample.emphasis}`}
                              >
                                <Text as="code" profile={profiles.caption} emphasis="low">
                                  {sample.intent}.{sample.emphasis}
                                </Text>
                                <KCard
                                  intent={sample.intent}
                                  emphasis={sample.emphasis}
                                  radius={radius}
                                >
                                  <CardContent
                                    title="Same surface"
                                    body="Context-aware boundary."
                                  />
                                </KCard>
                              </div>
                            ))}
                        </div>
                      </KCard>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}

          {comparisonSample && comparisonShadow ? (
            <section className={s.exampleSection} aria-labelledby="card-boundaries">
              <SectionHeading
                id="card-boundaries"
                title="Border & shadow"
                description="One surface, three treatments. Preserving a border keeps the preset's existing stroke; it does not add a stroke to a recipe that has none."
              />
              <Text as="p" profile={profiles.caption} emphasis="low">
                {comparisonSample.intent}.{comparisonSample.emphasis} · Shadow {comparisonShadow}
              </Text>
              <div className={s.comparisonGrid}>
                {[
                  { title: 'Preset border', shadow: undefined, preserve: true, note: 'Shadow off' },
                  {
                    title: 'Shadow only',
                    shadow: comparisonShadow,
                    preserve: false,
                    note: 'Existing border hidden'
                  },
                  {
                    title: 'Border + shadow',
                    shadow: comparisonShadow,
                    preserve: true,
                    note: 'Existing border preserved'
                  }
                ].map((sample) => (
                  <article className={s.example} key={sample.title}>
                    <Text as="h4" profile={profiles.groupTitle}>
                      {sample.title}
                    </Text>
                    <KCard
                      className={s.cardSurface}
                      {...comparisonSample}
                      radius={radius}
                      shadow={sample.shadow}
                      preserveBorderWithShadow={sample.preserve}
                    >
                      <CardContent />
                    </KCard>
                    <Text as="p" profile={profiles.caption} emphasis="low">
                      {sample.note}
                    </Text>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {showShadowDocumentation ? (
            <section className={s.exampleSection} aria-labelledby="card-shadows">
              <SectionHeading
                id="card-shadows"
                title="Shadow scale"
                description="Compare the published elevation levels on the same Card surface. Previews hide the existing border so the shadow can be inspected on its own."
              />
              {shadowKindOrder
                .filter((kind) => shadowDocumentationByKind[kind].length)
                .map((kind) => (
                  <div className={s.intentGroup} key={kind}>
                    <Text as="h4" profile={profiles.subsectionTitle}>
                      {shadowKindLabels[kind]}
                    </Text>
                    <div className={s.shadowGrid}>
                      {shadowDocumentationByKind[kind].map((level) => (
                        <article className={s.example} key={level.level}>
                          <Text as="h5" profile={profiles.bodyStrong}>
                            {level.label}
                          </Text>
                          {level.cardShadow && comparisonSample ? (
                            <KCard
                              className={s.cardSurface}
                              {...comparisonSample}
                              radius={radius}
                              shadow={level.cardShadow}
                              preserveBorderWithShadow={false}
                            >
                              <CardContent title="Elevation" body={level.level} />
                            </KCard>
                          ) : (
                            <Text as="p" profile={profiles.caption} emphasis="low">
                              Global recipe, not exposed by Card.
                            </Text>
                          )}
                          <Text as="p" profile={profiles.caption} emphasis="low">
                            {level.layers.length} {level.layers.length === 1 ? 'layer' : 'layers'}
                            {level.usageLabels.length ? ` · ${level.usageLabels.join(' / ')}` : ''}
                          </Text>
                          <Text
                            as="code"
                            profile={profiles.caption}
                            emphasis="low"
                            className={s.recipeValue}
                          >
                            {level.cssValue}
                          </Text>
                        </article>
                      ))}
                    </div>
                  </div>
                ))}
            </section>
          ) : null}

          <section className={s.exampleSection} aria-labelledby="card-interaction">
            <SectionHeading
              id="card-interaction"
              title="Interaction"
              description="A passive Card can contain an independent action. CardAction is itself the action: activate it to inspect selection, or compare disabled and locked behavior."
            />
            {buttonManifest ? (
              <div className={s.interactionControls}>
                <section className={s.content} aria-label="Card interaction intent">
                  <Text profile={profiles.bodyStrong}>Intent</Text>
                  <div className={s.controlRow}>
                    {cardSemanticIntentOrder
                      .filter((intent) =>
                        semanticSamples.some((sample) => sample.intent === intent)
                      )
                      .map((intent) => (
                        <KButton
                          key={intent}
                          {...demoButtonProfile}
                          toggle
                          controlState={interactionSample?.intent === intent}
                          onClick={() => setInteractionIntent(intent)}
                        >
                          <KButton.Label>{cardIntentLabels[intent]}</KButton.Label>
                        </KButton>
                      ))}
                  </div>
                </section>
                <section className={s.content} aria-label="Card interaction emphasis">
                  <Text profile={profiles.bodyStrong}>Emphasis</Text>
                  <div className={s.controlRow}>
                    {semanticSamples
                      .filter((sample) => sample.intent === interactionSample?.intent)
                      .map(({ emphasis }) => (
                        <KButton
                          key={emphasis}
                          {...demoButtonProfile}
                          toggle
                          controlState={interactionSample?.emphasis === emphasis}
                          onClick={() => {
                            setInteractionIntent(interactionSample.intent);
                            setInteractionEmphasis(emphasis);
                          }}
                        >
                          <KButton.Label>{cardEmphasisLabels[emphasis]}</KButton.Label>
                        </KButton>
                      ))}
                  </div>
                </section>
              </div>
            ) : null}
            <div className={s.interactionGrid}>
              <article className={s.example}>
                <Text as="h4" profile={profiles.groupTitle}>
                  Passive Card
                </Text>
                <KCard
                  {...interactionSample}
                  className={s.cardSurface}
                  radius={radius}
                  shadow={resolvedStaticShadow}
                  preserveBorderWithShadow={preserveBorderWithShadow}
                >
                  <div className={s.passiveContent}>
                    <CardContent title="Project resources" body="Only the button is interactive." />
                    {buttonManifest ? (
                      <KButton
                        {...demoButtonProfile}
                        onClick={() => setPassiveActivations((count) => count + 1)}
                      >
                        <KButton.Label>Learn more</KButton.Label>
                      </KButton>
                    ) : null}
                  </div>
                </KCard>
                <Text as="p" profile={profiles.caption} emphasis="low" role="status">
                  {passiveActivations
                    ? `Button activated ${passiveActivations} times.`
                    : 'The surrounding surface stays passive.'}
                </Text>
              </article>
              <article className={s.example}>
                <Text as="h4" profile={profiles.groupTitle}>
                  Selectable
                </Text>
                <KCardAction
                  {...interactionSample}
                  className={s.cardSurface}
                  radius={radius}
                  shadow={cardActionShadow}
                  preserveBorderWithShadow={preserveBorderWithShadow}
                  controlState={selected}
                  onControlStateChange={setSelected}
                >
                  <CardContent
                    title="Project overview"
                    body={selected ? 'Selected. Activate to clear.' : 'Activate to select.'}
                  />
                </KCardAction>
                <Text as="p" profile={profiles.caption} emphasis="low">
                  {selected ? 'Selected' : 'Rest'} · Whole surface is interactive
                </Text>
              </article>
              <article className={s.example}>
                <Text as="h4" profile={profiles.groupTitle}>
                  Selected
                </Text>
                <KCardAction
                  {...interactionSample}
                  className={s.cardSurface}
                  radius={radius}
                  shadow={cardActionShadow}
                  preserveBorderWithShadow={preserveBorderWithShadow}
                  controlState
                >
                  <CardContent
                    title="Project overview"
                    body="A selected surface and its content."
                  />
                </KCardAction>
                <Text as="p" profile={profiles.caption} emphasis="low">
                  Selected state held for comparison
                </Text>
              </article>
              <article className={s.example}>
                <Text as="h4" profile={profiles.groupTitle}>
                  Disabled
                </Text>
                <KCardAction
                  {...interactionSample}
                  className={s.cardSurface}
                  radius={radius}
                  shadow={cardActionShadow}
                  preserveBorderWithShadow={preserveBorderWithShadow}
                  disabled
                >
                  <CardContent title="Project overview" body="This action is unavailable." />
                </KCardAction>
                <Text as="p" profile={profiles.caption} emphasis="low">
                  Native disabled behavior
                </Text>
              </article>
              <article className={s.example}>
                <Text as="h4" profile={profiles.groupTitle}>
                  Interaction locked
                </Text>
                <KCardAction
                  {...interactionSample}
                  className={s.cardSurface}
                  radius={radius}
                  shadow={cardActionShadow}
                  preserveBorderWithShadow={preserveBorderWithShadow}
                  controlState={lockedSelected}
                  interactionLocked={interactionLocked}
                  onControlStateChange={setLockedSelected}
                >
                  <CardContent
                    title="Project overview"
                    body={lockedSelected ? 'Selected.' : 'Ready to select.'}
                  />
                </KCardAction>
                <Text as="p" profile={profiles.caption} emphasis="low">
                  {interactionLocked
                    ? 'Activation blocked by the panel control'
                    : 'Unlocked · Activate to select'}
                </Text>
              </article>
            </div>
          </section>
        </div>
      ) : (
        <Text as="p" profile={profiles.body} role="status">
          Card is not available in the current preset, theme and surface context.
        </Text>
      )}
    </section>
  );
}
