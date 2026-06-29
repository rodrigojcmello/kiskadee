'use client';

import type { ComponentEmphasis, ElementSizeValue, SliderIntent } from '@kiskadee/core';
import { Slider, useKiskadee, useShowcase } from '@kiskadee/react-components';
import { useState } from 'react';
import s from './Slider.module.scss';

const scale: ElementSizeValue = 's:md:1';
const emphasis: ComponentEmphasis = 'medium';
const intent: SliderIntent = 'primary';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <path
        fill="currentColor"
        d="M20 15.7A8.9 8.9 0 0 1 8.3 4a7.1 7.1 0 1 0 11.7 11.7M12.5 3l.8 1.7L15 5.5l-1.7.8-.8 1.7-.8-1.7-1.7-.8 1.7-.8zm5 3 1 2 2 1-2 1-1 2-1-2-2-1 2-1z"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 4V1h1v3zm0 19v-3h1v3zM4 13H1v-1h3zm19 0h-3v-1h3zM6.2 6.9 4.1 4.8l.7-.7 2.1 2.1zm13.4 13.4-2.1-2.1.7-.7 2.1 2.1zM17.5 6.2l2.1-2.1.7.7-2.1 2.1zM4.8 20.3l-.7-.7 2.1-2.1.7.7zM12.5 7a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11"
      />
    </svg>
  );
}

function SadIcon() {
  return (
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4m0 2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm2.1 5.2a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4m5.8 0a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4M8 16c.9-1.2 2.2-1.8 4-1.8s3.1.6 4 1.8l-1.4 1.1c-.6-.7-1.4-1.1-2.6-1.1s-2 .4-2.6 1.1z"
      />
    </svg>
  );
}

function SmileIcon() {
  return (
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4m0 2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm2.1 5.2a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4m5.8 0a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4M8 14.5h1.8c.5.9 1.2 1.4 2.2 1.4s1.7-.5 2.2-1.4H16c-.6 2-2 3.2-4 3.2s-3.4-1.2-4-3.2"
      />
    </svg>
  );
}

export default function SliderPage() {
  const { designSystem } = useKiskadee();
  const { manifest } = useShowcase();
  const [brightness, setBrightness] = useState(78);
  const [price, setPrice] = useState<[number, number]>([2500, 5000]);
  const [tasks, setTasks] = useState<[number, number]>([0, 43]);
  const [rating, setRating] = useState(4);
  const isSliderAvailable = Boolean(manifest?.components?.slider);

  return (
    <main className={s.page}>
      <header className={s.header}>
        <h2>Slider</h2>
        <p className={s.summary}>
          Horizontal single-value and range examples for the initial Slider contract.
        </p>
      </header>

      {!isSliderAvailable ? (
        <div className={s.emptyState}>
          Slider is not available in {String(designSystem)}. Select the Sandbox preset to test it.
        </div>
      ) : (
        <div className={s.demoGrid}>
          <section className={s.demoBlock}>
            <Slider
              label="Price Range"
              required
              valueMode="range"
              min={1000}
              max={10000}
              step={500}
              value={price}
              onValueChange={(nextValue) => {
                if (Array.isArray(nextValue)) setPrice([nextValue[0], nextValue[1]]);
              }}
              endpoints={{
                start: { label: formatCurrency(1000) },
                end: { label: formatCurrency(10000) }
              }}
              formatValue={(value) => formatCurrency(value)}
              valueDisplay="tooltip"
              scale={scale}
              intent={intent}
              emphasis={emphasis}
            />
          </section>

          <section className={s.demoBlock}>
            <Slider
              label="Brightness"
              min={0}
              max={100}
              step={1}
              value={brightness}
              onValueChange={(nextValue) => {
                if (typeof nextValue === 'number') setBrightness(nextValue);
              }}
              endpoints={{
                start: { icon: <MoonIcon /> },
                end: { icon: <SunIcon /> }
              }}
              formatValue={(value) => (value > 85 ? 'Very Bright' : `${value}%`)}
              valueDisplay="tooltip"
              scale={scale}
              intent={intent}
              emphasis={emphasis}
            />
          </section>

          <section className={s.demoBlock}>
            <Slider
              label="Tasks completed"
              valueMode="range"
              min={0}
              max={100}
              step={1}
              value={tasks}
              onValueChange={(nextValue) => {
                if (Array.isArray(nextValue)) setTasks([nextValue[0], nextValue[1]]);
              }}
              endpoints={{
                start: { label: '-' },
                end: { label: '+' }
              }}
              marks={[
                { value: 0, label: '0%' },
                { value: 25, label: '25%' },
                { value: 50, label: '50%' },
                { value: 75, label: '75%' },
                { value: 100, label: '100%' }
              ]}
              formatValue={(value) => `${value}%`}
              valueDisplay="summary"
              scale={scale}
              intent={intent}
              emphasis={emphasis}
            />
          </section>

          <section className={s.demoBlock}>
            <Slider
              label="Rating"
              min={0}
              max={10}
              step={1}
              value={rating}
              onValueChange={(nextValue) => {
                if (typeof nextValue === 'number') setRating(nextValue);
              }}
              endpoints={{
                start: { icon: <SadIcon />, label: '0' },
                end: { label: '10', icon: <SmileIcon /> }
              }}
              marks="step"
              helperText="How happy are you with the level of service?"
              valueDisplay="tooltip"
              scale={scale}
              intent={intent}
              emphasis={emphasis}
            />
          </section>
        </div>
      )}
    </main>
  );
}
