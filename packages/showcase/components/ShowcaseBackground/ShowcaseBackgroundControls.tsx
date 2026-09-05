'use client';

import type { SurfaceContext } from '@kiskadee/core';
import { useKiskadee } from '@kiskadee/react-components';
import { ShowcaseSegmentedControl } from '@/components/ShowcaseControls';
import { useShowcaseBackground } from '@/hooks/use-showcase-background';
import type { BackgroundMode } from '@/hooks/use-showcase-background-state';
import { SwatchRadioGroup } from '@/k-components';
import styles from './ShowcaseBackgroundControls.module.scss';

export function ShowcaseBackgroundControls() {
  const background = useShowcaseBackground();
  const { theme } = useKiskadee();
  const canonical = background.mode === 'canonical';
  const items = canonical
    ? background.scenarios.map((scenario) => ({
        value: scenario.key,
        label: scenario.label,
        swatch: { color: scenario.canvas.resolvedColor }
      }))
    : background.stressTones.map((tone) => ({
        value: tone.key,
        label: tone.aria,
        swatch: { color: tone.displayColor }
      }));

  return (
    <div className={styles.controls}>
      <ShowcaseSegmentedControl
        label="Surface context"
        options={[
          { value: 'onSubtle', label: 'On subtle' },
          { value: 'onVivid', label: 'On vivid' }
        ]}
        value={background.surfaceContext}
        onValueChange={(value) => background.selectContext(value as SurfaceContext)}
        disabled={
          !background.surfaces.some((surface) => surface.contentSurfaceContext === 'onVivid')
        }
      />
      <fieldset className={styles.background}>
        <legend>Background</legend>
        <div className={styles.frame}>
          <ShowcaseSegmentedControl
            embedded
            className={styles.mode}
            label="Background mode"
            options={[
              { value: 'canonical', label: 'Canonical' },
              { value: 'stress-test', label: 'Stress test' }
            ]}
            value={background.mode}
            onValueChange={(value) => background.selectMode(value as BackgroundMode)}
          />
          <hr className={styles.divider} />
          <div className={styles.options}>
            {items.length ? (
              <SwatchRadioGroup
                className={`${styles.swatches} ${canonical ? '' : `${styles.stress} ${theme === 'light' ? styles.light : styles.dark}`}`}
                groupLabel={canonical ? 'Canonical surfaces' : 'Stress-test surfaces'}
                aria-label="Showcase background"
                items={items}
                value={background.key}
                onValueChange={background.selectBackground}
                renderSwatch={(item) => {
                  const scenario = canonical
                    ? background.scenarios.find((entry) => entry.key === item.value)
                    : undefined;
                  return scenario?.splitSwatch ? (
                    <span
                      className={styles.split}
                      style={{
                        background: `linear-gradient(90deg, ${scenario.canvas.resolvedColor} 50%, ${scenario.card.resolvedColor} 50%)`
                      }}
                    />
                  ) : null;
                }}
              />
            ) : (
              <p role="status">No surfaces are available for this preset, segment and theme.</p>
            )}
          </div>
        </div>
        <p className={styles.description}>
          {canonical
            ? 'Canvas and example Card surfaces from the active preset. Split swatches show both surfaces.'
            : 'Adversarial color combinations for diagnosis; not a preset support guarantee.'}
        </p>
      </fieldset>
    </div>
  );
}
