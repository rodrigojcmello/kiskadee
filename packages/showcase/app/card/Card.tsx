'use client';

import type { CardRadiusMode, ElementSizeValue } from '@kiskadee/core';
import {
  Button as KButton,
  Card as KCard,
  CardAction as KCardAction,
  useShowcase
} from '@kiskadee/react-components';
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

const cardShadowOptions: Array<{ value: CardShadowOption; label: string }> = [
  { value: 'off', label: 'Off (default)' },
  { value: 's:sm:1', label: 'Elevation 1 (s:sm:1)' },
  { value: 's:md:1', label: 'Elevation 2 (s:md:1)' },
  { value: 's:lg:1', label: 'Elevation 3 (s:lg:1)' },
  { value: 's:lg:2', label: 'Elevation 4 (s:lg:2)' },
  { value: 's:lg:3', label: 'Elevation 5 (s:lg:3)' }
];

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

type CardDemoButtonProps = {
  disabled?: boolean;
  label: string;
};

function CardDemoButton({ disabled = false, label }: CardDemoButtonProps) {
  return (
    <div className={s.buttonOverlay}>
      <KButton disabled={disabled} emphasis="medium" intent="primary" scale="s:sm:1">
        <KButton.Label>{label}</KButton.Label>
      </KButton>
    </div>
  );
}

export function Card() {
  const { manifest } = useShowcase();
  const cardManifest = manifest?.components?.card;
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

  const radiusSelectOptions = React.useMemo(
    () =>
      cardRadiusOptions.map((option) => ({
        ...option,
        label: option.value === defaultRadius ? `${option.label} (default)` : option.label,
        disabled: supportedScales ? !supportedScales[option.value] : false
      })),
    [supportedScales]
  );

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
            options={cardShadowOptions}
            value={staticShadow}
            onValueChange={(value) => setStaticShadow(value as CardShadowOption)}
            disabled={!isCardAvailable}
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
            <CardDemoButton label="Learn more" />
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
            <CardDemoButton label="Details" />
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
            <CardDemoButton label="Continue" />
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
            <CardDemoButton disabled label="Unavailable" />
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
            <CardDemoButton label="Review" />
          </div>
        </div>
      ) : (
        <div className={s.unavailable}>Card is not available in the current design system.</div>
      )}
    </section>
  );
}
