'use client';

import type { SurfaceContext } from '@kiskadee/core';
import { ShowcaseSegmentedControl } from '@/components/ShowcaseControls';
import { useShowcaseBackground } from '@/hooks/use-showcase-background';
import { SwatchRadioGroup } from '@/k-components';
import styles from './ShowcaseBackgroundControls.module.scss';

export function ShowcaseBackgroundControls() {
  const background = useShowcaseBackground();
  const items = background.scenarios.map((scenario) => ({
    value: scenario.key,
    label: scenario.label,
    swatch: { color: scenario.canvas.resolvedColor }
  }));

  return (
    <fieldset className={styles.background}>
      <legend>Surface context</legend>
      <div className={styles.frame}>
        <ShowcaseSegmentedControl
          embedded
          className={styles.mode}
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
        <hr className={styles.divider} />
        <div className={styles.options}>
          {items.length ? (
            <SwatchRadioGroup
              className={styles.swatches}
              aria-label="Showcase background"
              items={items}
              value={background.key}
              onValueChange={background.selectBackground}
              renderSwatch={(item) => {
                const scenario = background.scenarios.find((entry) => entry.key === item.value);
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
    </fieldset>
  );
}
