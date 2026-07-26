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
import { getManifestComponentState } from '@/utils/manifest-surface-context';
import s from './Card.module.scss';

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

type CardContentProps = {
  eyebrow: string;
  title: string;
  body: string;
  selected?: boolean;
  tone?: 'onSubtle' | 'onVivid';
  withActionSlot?: boolean;
};

function CardContent({
  eyebrow,
  title,
  body,
  selected = false,
  tone = 'onSubtle',
  withActionSlot = false
}: CardContentProps) {
  const toneClassName = selected
    ? s.contentSelected
    : tone === 'onVivid'
      ? s.contentOnVivid
      : s.content;

  return (
    <div className={`${toneClassName} ${withActionSlot ? s.contentWithActionSlot : ''}`.trim()}>
      <p className={s.eyebrow}>{eyebrow}</p>
      <h3 className={s.title}>{title}</h3>
      <p className={s.body}>{body}</p>
    </div>
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

type CardDemoButtonProps = {
  buttonProfile: CardDemoButtonProfile;
  disabled?: boolean;
  label: string;
};

function CardDemoButton({ buttonProfile, disabled = false, label }: CardDemoButtonProps) {
  return (
    <div className={s.buttonOverlay}>
      <KButton
        disabled={disabled}
        emphasis={buttonProfile.emphasis}
        intent={buttonProfile.intent}
        scale={buttonProfile.scale}
      >
        <KButton.Label>{label}</KButton.Label>
      </KButton>
    </div>
  );
}

export function Card() {
  const { global, segment, theme } = useKiskadee();
  const { manifest } = useShowcase();
  const { cardClassesMap } = useCardArtifactConfig();
  const cardManifest = manifest?.components?.card;
  const buttonManifest = manifest?.components?.button;
  const cardState = getManifestComponentState(cardManifest, segment, theme);
  const buttonState = getManifestComponentState(buttonManifest, segment, theme);
  const isCardAvailable = Boolean(cardManifest);
  const supportedScales = cardManifest?.scale;
  const defaultRadius: CardRadiusMode = 'rounded';
  const [selected, setSelected] = React.useState(false);
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
    <section className={s.route}>
      <h2>Card</h2>
      <ShowcaseRouteControls
        id="card"
        eyebrow="Card"
        title="Controls"
        isAvailable={isCardAvailable}
      >
        {cardControls}
      </ShowcaseRouteControls>

      {isCardAvailable ? (
        <div className={s.sections}>
          {semanticSamples.length > 0 ? (
            <section className={s.exampleSection}>
              <h3 className={s.sectionTitle}>Semantic surfaces</h3>
              <div className={`${s.grid} k-root`}>
                {semanticSamples.map(({ emphasis, intent }) => {
                  const onVivid =
                    theme !== 'light' ||
                    (intent === 'primary' && emphasis === 'high') ||
                    emphasis === 'highest';

                  return (
                    <div className={s.example} key={`${intent}-${emphasis}`}>
                      <p className={s.exampleLabel}>
                        {cardIntentLabels[intent]} / {cardEmphasisLabels[emphasis]}
                      </p>
                      <KCard
                        className={s.cardSurface}
                        emphasis={emphasis}
                        intent={intent}
                        radius={radius}
                        shadow={resolvedStaticShadow}
                        preserveBorderWithShadow={preserveBorderWithShadow}
                      >
                        <CardContent
                          eyebrow={cardIntentLabels[intent]}
                          title={cardEmphasisLabels[emphasis]}
                          body={`${intent}.${emphasis}`}
                          tone={onVivid ? 'onVivid' : 'onSubtle'}
                        />
                      </KCard>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          {showShadowDocumentation ? (
            <section className={s.exampleSection}>
              <h3 className={s.sectionTitle}>Shadow effect</h3>
              <div className={s.shadowKindGrid}>
                {shadowKindOrder.map((kind) => {
                  const shadowLevels = shadowDocumentationByKind[kind];

                  return (
                    <div className={s.shadowKindGroup} key={kind}>
                      <div className={s.shadowKindHeader}>
                        <span>{shadowKindLabels[kind]}</span>
                        <span>
                          {shadowLevels.length} {shadowLevels.length === 1 ? 'level' : 'levels'}
                        </span>
                      </div>

                      {shadowLevels.length > 0 ? (
                        <div className={s.shadowCardGrid}>
                          {shadowLevels.map((shadowLevel) => (
                            <article className={s.shadowLevelItem} key={shadowLevel.level}>
                              {shadowLevel.cardShadow ? (
                                <KCard
                                  className={s.shadowPreviewCard}
                                  radius={radius}
                                  shadow={shadowLevel.cardShadow}
                                  preserveBorderWithShadow={false}
                                >
                                  <div className={s.shadowPreviewContent}>
                                    <span>{shadowKindLabels[shadowLevel.kind]}</span>
                                    <strong>{shadowLevel.label}</strong>
                                    <code>{shadowLevel.level}</code>
                                    {shadowLevel.usageLabels.length > 0 ? (
                                      <div className={s.shadowUsageList}>
                                        {shadowLevel.usageLabels.map((label) => (
                                          <span key={label}>{label}</span>
                                        ))}
                                      </div>
                                    ) : null}
                                  </div>
                                </KCard>
                              ) : (
                                <div
                                  className={s.shadowRawPreview}
                                  style={{ boxShadow: shadowLevel.cssValue }}
                                >
                                  <div className={s.shadowPreviewContent}>
                                    <span>{shadowKindLabels[shadowLevel.kind]}</span>
                                    <strong>{shadowLevel.label}</strong>
                                    <code>{shadowLevel.level}</code>
                                  </div>
                                </div>
                              )}
                              <p className={s.shadowCssValue}>{shadowLevel.cssValue}</p>
                              <p className={s.shadowLayerCount}>
                                {shadowLevel.layers.length}{' '}
                                {shadowLevel.layers.length === 1 ? 'layer' : 'layers'}
                              </p>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <div className={s.shadowEmpty}>No {kind} shadow levels in this preset.</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          <section className={s.exampleSection}>
            <h3 className={s.sectionTitle}>States</h3>
            <div className={`${s.grid} k-root`}>
              <div className={s.example}>
                <p className={s.exampleLabel}>Static</p>
                <KCard
                  className={s.cardSurface}
                  radius={radius}
                  shadow={resolvedStaticShadow}
                  preserveBorderWithShadow={preserveBorderWithShadow}
                >
                  <CardContent
                    eyebrow="Surface"
                    title="Static card"
                    body="A non-interactive visual container rendered as a div."
                    withActionSlot
                  />
                </KCard>
                <CardDemoButton buttonProfile={demoButtonProfile} label="Learn more" />
              </div>

              <div className={s.example}>
                <p className={s.exampleLabel}>Action</p>
                <KCardAction
                  className={s.cardSurface}
                  radius={radius}
                  shadow={cardActionShadow}
                  preserveBorderWithShadow={preserveBorderWithShadow}
                  controlState={selected}
                  onControlStateChange={setSelected}
                >
                  <CardContent
                    eyebrow="Button"
                    title={selected ? 'Selected' : 'Rest'}
                    body="A button-backed card that toggles the selected schema state."
                    selected={selected}
                    withActionSlot
                  />
                </KCardAction>
                <CardDemoButton buttonProfile={demoButtonProfile} label="Details" />
              </div>

              <div className={s.example}>
                <p className={s.exampleLabel}>Selected</p>
                <KCardAction
                  className={s.cardSurface}
                  radius={radius}
                  shadow={cardActionShadow}
                  preserveBorderWithShadow={preserveBorderWithShadow}
                  controlState
                >
                  <CardContent
                    eyebrow="Selected"
                    title="Strong selected"
                    body="Child contrast is adjusted manually in the consumer for v1."
                    selected
                    withActionSlot
                  />
                </KCardAction>
                <CardDemoButton buttonProfile={demoButtonProfile} label="Continue" />
              </div>

              <div className={s.example}>
                <p className={s.exampleLabel}>Disabled</p>
                <KCardAction
                  className={s.cardSurface}
                  radius={radius}
                  shadow={cardActionShadow}
                  preserveBorderWithShadow={preserveBorderWithShadow}
                  disabled
                  defaultControlState={false}
                >
                  <CardContent
                    eyebrow="Disabled"
                    title="Unavailable action"
                    body="Native disabled semantics remain separate from interactionLocked."
                    withActionSlot
                  />
                </KCardAction>
                <CardDemoButton buttonProfile={demoButtonProfile} disabled label="Unavailable" />
              </div>

              <div className={s.example}>
                <p className={s.exampleLabel}>Locked</p>
                <KCardAction
                  className={s.cardSurface}
                  radius={radius}
                  shadow={cardActionShadow}
                  preserveBorderWithShadow={preserveBorderWithShadow}
                  controlState={lockedSelected}
                  interactionLocked={interactionLocked}
                  onControlStateChange={setLockedSelected}
                >
                  <CardContent
                    eyebrow={interactionLocked ? 'Locked' : 'Unlocked'}
                    title={lockedSelected ? 'Selected' : 'Rest'}
                    body="Toggle the panel control to allow or block activation."
                    selected={lockedSelected}
                    withActionSlot
                  />
                </KCardAction>
                <CardDemoButton buttonProfile={demoButtonProfile} label="Review" />
              </div>
            </div>
          </section>
        </div>
      ) : (
        <div className={s.unavailable}>Card is not available in the current design system.</div>
      )}
    </section>
  );
}
