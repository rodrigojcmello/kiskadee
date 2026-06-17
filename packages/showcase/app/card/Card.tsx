'use client';

import {
  elementSizeValues,
  type ButtonIntent,
  type CardRadiusMode,
  type ComponentEmphasis,
  type ElementSizeValue
} from '@kiskadee/core';
import {
  Button as KButton,
  Card as KCard,
  CardAction as KCardAction,
  useCardArtifactConfig,
  useShowcase
} from '@kiskadee/react-components';
import type { ManifestComponent } from '@kiskadee/web-builder/types';
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

function normalizeShadowLevelKey(key: string): ElementSizeValue | undefined {
  const normalized = key.startsWith('s:') ? key : `s:${key}`;
  return elementSizeValues.includes(normalized as ElementSizeValue)
    ? (normalized as ElementSizeValue)
    : undefined;
}

type CardContentProps = {
  eyebrow: string;
  title: string;
  body: string;
  selected?: boolean;
};

function CardContent({ eyebrow, title, body, selected = false }: CardContentProps) {
  return (
    <div className={selected ? s.contentSelected : s.content}>
      <p className={s.eyebrow}>{eyebrow}</p>
      <h3 className={s.title}>{title}</h3>
      <p className={s.body}>{body}</p>
    </div>
  );
}

const demoButtonScaleOrder: ElementSizeValue[] = ['s:md:1', 's:sm:1', 's:lg:1'];
const demoButtonIntentOrder: ButtonIntent[] = ['primary', 'neutral', 'destructive', 'positive'];
const demoButtonEmphasisOrder: ComponentEmphasis[] = ['medium', 'high', 'low', 'lowest'];

function resolveDemoButtonScale(buttonManifest: ManifestComponent | undefined) {
  if (!buttonManifest?.scale) return 's:md:1';

  return (
    demoButtonScaleOrder.find((scale) => buttonManifest.scale?.[scale]) ??
    elementSizeValues.find((scale) => buttonManifest.scale?.[scale])
  );
}

function resolveDemoButtonProfile(
  buttonManifest: ManifestComponent | undefined
): CardDemoButtonProfile {
  const scale = resolveDemoButtonScale(buttonManifest);

  if (!buttonManifest?.state) {
    return { emphasis: 'medium', intent: 'primary', scale };
  }

  for (const intent of demoButtonIntentOrder) {
    for (const emphasis of demoButtonEmphasisOrder) {
      if (buttonManifest.state[intent]?.[emphasis]?.rest) {
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
  const { manifest } = useShowcase();
  const { cardClassesMap } = useCardArtifactConfig();
  const cardManifest = manifest?.components?.card;
  const buttonManifest = manifest?.components?.button;
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
    () => resolveDemoButtonProfile(buttonManifest),
    [buttonManifest]
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
        <div className={`${s.grid} k-root`}>
          <div className={s.example}>
            <p className={s.exampleLabel}>Static</p>
            <KCard
              radius={radius}
              shadow={resolvedStaticShadow}
              preserveBorderWithShadow={preserveBorderWithShadow}
            >
              <CardContent
                eyebrow="Surface"
                title="Static card"
                body="A non-interactive visual container rendered as a div."
              />
            </KCard>
            <CardDemoButton buttonProfile={demoButtonProfile} label="Learn more" />
          </div>

          <div className={s.example}>
            <p className={s.exampleLabel}>Action</p>
            <KCardAction
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
              />
            </KCardAction>
            <CardDemoButton buttonProfile={demoButtonProfile} label="Details" />
          </div>

          <div className={s.example}>
            <p className={s.exampleLabel}>Selected</p>
            <KCardAction
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
              />
            </KCardAction>
            <CardDemoButton buttonProfile={demoButtonProfile} label="Continue" />
          </div>

          <div className={s.example}>
            <p className={s.exampleLabel}>Disabled</p>
            <KCardAction
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
              />
            </KCardAction>
            <CardDemoButton buttonProfile={demoButtonProfile} disabled label="Unavailable" />
          </div>

          <div className={s.example}>
            <p className={s.exampleLabel}>Locked</p>
            <KCardAction
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
              />
            </KCardAction>
            <CardDemoButton buttonProfile={demoButtonProfile} label="Review" />
          </div>
        </div>
      ) : (
        <div className={s.unavailable}>Card is not available in the current design system.</div>
      )}
    </section>
  );
}
