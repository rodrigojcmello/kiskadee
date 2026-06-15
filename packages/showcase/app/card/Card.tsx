'use client';

import { Card as KCard, CardAction as KCardAction, useShowcase } from '@kiskadee/react-components';
import React from 'react';
import {
  ShowcaseBooleanControl,
  ShowcaseControlGroup,
  ShowcaseControlPanel,
  ShowcaseControlStack,
  ShowcaseRouteControls
} from '@/components/ShowcaseControls';
import s from './Card.module.scss';

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

export function Card() {
  const { manifest } = useShowcase();
  const isCardAvailable = Boolean(manifest?.components?.card);
  const [selected, setSelected] = React.useState(false);
  const [lockedSelected, setLockedSelected] = React.useState(false);
  const [interactionLocked, setInteractionLocked] = React.useState(true);

  const cardControls = (
    <ShowcaseControlPanel>
      <ShowcaseControlGroup title="CardAction">
        <ShowcaseControlStack>
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
            <KCard>
              <CardContent
                eyebrow="Surface"
                title="Static card"
                body="A non-interactive visual container rendered as a div."
              />
            </KCard>
          </div>

          <div className={s.example}>
            <p className={s.exampleLabel}>Action</p>
            <KCardAction controlState={selected} onControlStateChange={setSelected}>
              <CardContent
                eyebrow="Button"
                title={selected ? 'Selected' : 'Rest'}
                body="A button-backed card that toggles the selected schema state."
                selected={selected}
              />
            </KCardAction>
          </div>

          <div className={s.example}>
            <p className={s.exampleLabel}>Selected</p>
            <KCardAction controlState>
              <CardContent
                eyebrow="Selected"
                title="Strong selected"
                body="Child contrast is adjusted manually in the consumer for v1."
                selected
              />
            </KCardAction>
          </div>

          <div className={s.example}>
            <p className={s.exampleLabel}>Disabled</p>
            <KCardAction disabled defaultControlState={false}>
              <CardContent
                eyebrow="Disabled"
                title="Unavailable action"
                body="Native disabled semantics remain separate from interactionLocked."
              />
            </KCardAction>
          </div>

          <div className={s.example}>
            <p className={s.exampleLabel}>Locked</p>
            <KCardAction
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
          </div>

          <div className={s.example}>
            <p className={s.exampleLabel}>Rounded</p>
            <KCard radius="rounded">
              <CardContent
                eyebrow="Radius"
                title="Rounded"
                body="The rounded radius uses the generated Card radius bucket."
              />
            </KCard>
          </div>

          <div className={s.example}>
            <p className={s.exampleLabel}>Square</p>
            <KCard radius="square">
              <CardContent
                eyebrow="Radius"
                title="Square"
                body="The square radius is explicit; pill is not part of the Card contract."
              />
            </KCard>
          </div>
        </div>
      ) : (
        <div className={s.unavailable}>Card is not available in the current design system.</div>
      )}
    </section>
  );
}
