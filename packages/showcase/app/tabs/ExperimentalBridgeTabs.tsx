'use client';

import { HeadlessTabs } from '@kiskadee/react-headless/tabs';
import { useState } from 'react';
import s from './ExperimentalBridgeTabs.module.scss';

const bridgeTabs = [
  {
    value: 'tab-one',
    label: 'Tab',
    title: 'Tab One',
    description:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Asperiores adipisci aliquam autem quisquam sit? Maiores dolorum ducimus dolorem asperiores illum eos deserunt quos officiis, quas, id non libero ipsum aliquam.'
  },
  {
    value: 'tab-two',
    label: 'Longer Tab',
    title: 'Longer Tab',
    description:
      'This version lives only in the showcase on purpose. The goal is to validate the bridge silhouette, the overlap between tabs, and the selected surface reconnecting into the content area before we model anything in schema, builder, runtime, or components.'
  },
  {
    value: 'tab-three',
    label: 'Wow Dude',
    title: 'Wow Dude',
    description:
      'The visual point of this experiment is the curved shoulder on each side of the selected tab. Once this static version is approved, we can translate the geometry into the proper Kiskadee layers.'
  }
] as const;

type BridgeTabValue = (typeof bridgeTabs)[number]['value'];

export function ExperimentalBridgeTabs() {
  const [selected, setSelected] = useState<BridgeTabValue>('tab-one');

  const handleValueChange = (value: string) => {
    if (bridgeTabs.some((tab) => tab.value === value)) {
      setSelected(value as BridgeTabValue);
    }
  };

  return (
    <section className={s.section}>
      <div className={s.demo}>
        <HeadlessTabs.Root
          value={selected}
          onValueChange={handleValueChange}
          activationMode="manual"
          idPrefix="bridge-tabs"
        >
          <nav className={s.tabs} aria-label="Experimental bridge tabs">
            <HeadlessTabs.Bar className={s.list}>
              {bridgeTabs.map((tab) => {
                const isActive = tab.value === selected;

                return (
                  <div key={tab.value} className={`${s.item} ${isActive ? s.activeItem : ''}`}>
                    <HeadlessTabs.Tab value={tab.value} className={s.tab}>
                      {tab.label}
                    </HeadlessTabs.Tab>
                  </div>
                );
              })}
            </HeadlessTabs.Bar>
          </nav>

          <div className={s.content}>
            {bridgeTabs.map((tab) => (
              <HeadlessTabs.Content key={tab.value} value={tab.value} className={s.panel}>
                <div className={s.meta}>Static showcase experiment</div>
                <h3>{tab.title}</h3>
                <p>{tab.description}</p>

                {tab.value === 'tab-three' ? (
                  <div className={s.featureCard}>
                    <span className={s.featureBadge}>Bridge</span>
                    <strong>Selected tab reconnects into the panel surface.</strong>
                    <p>
                      This card is only decorative. The important part is the shell geometry above.
                    </p>
                  </div>
                ) : null}
              </HeadlessTabs.Content>
            ))}
          </div>
        </HeadlessTabs.Root>
      </div>
    </section>
  );
}
