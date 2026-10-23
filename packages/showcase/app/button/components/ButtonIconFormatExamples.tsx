import {
  componentScaleToSize,
  type ElementSizeValue,
  type RadiusMode,
  type SurfaceContext
} from '@kiskadee/core';
import { resolveIconGlyph } from '@kiskadee/icons/interface';
import { materialSymbolsIconFamily } from '@kiskadee/icons/interface/material-symbols';
import { GoogleIcon } from '@kiskadee/icons/social/GoogleIcon';
import { Button } from '@kiskadee/react-components/button';
import { Text } from '@kiskadee/react-components/text';
import { useEffect, useState } from 'react';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import styles from './ButtonIconFormatExamples.module.scss';

const fontIcon = resolveIconGlyph(materialSymbolsIconFamily, 'plus');
const FontGlyph = fontIcon?.glyph;
const formats = ['SVG', 'PNG', 'JPEG', 'WebP', 'Icon font'] as const;

export function ButtonIconFormatExamples({
  radius,
  scale,
  surfaceContext
}: {
  radius: RadiusMode;
  scale?: ElementSizeValue;
  surfaceContext: SurfaceContext;
}) {
  const profiles = useShowcaseTextProfiles();
  const [fontStatus, setFontStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  useEffect(() => {
    let active = true;
    Promise.resolve(materialSymbolsIconFamily.variants['fill-0']?.prepare?.()).then(
      () => {
        if (active) setFontStatus('ready');
      },
      () => {
        if (active) setFontStatus('error');
      }
    );
    return () => {
      active = false;
    };
  }, []);

  return (
    <section aria-labelledby="button-icon-formats-title">
      <Text as="h3" id="button-icon-formats-title" profile={profiles.sectionTitle}>
        Icon formats
      </Text>
      <Text as="p" profile={profiles.body}>
        The same Google artwork is supplied as SVG and 128 px raster images. Button owns the
        viewport; the image keeps its proportions. The font example supplies its own font family.
      </Text>
      <div className={`${styles.examples} k-root`}>
        {formats.map((format) => (
          <div className={styles.example} key={format} data-button-icon-format={format}>
            <Text as="p" profile={profiles.body}>
              {format}
            </Text>
            <Button
              radius={radius}
              size={componentScaleToSize(scale)}
              surfaceContext={surfaceContext}
              intent="neutral"
              emphasis="medium"
            >
              <Button.Icon>
                {format === 'SVG' ? (
                  <GoogleIcon width={128} height={128} />
                ) : format === 'Icon font' ? (
                  fontStatus === 'ready' && FontGlyph ? (
                    <FontGlyph {...fontIcon?.rendererProps} />
                  ) : null
                ) : (
                  // biome-ignore lint/performance/noImgElement: This fixture verifies native image sizing inside Button.Icon.
                  <img
                    src={`/fixtures/button/icon-formats/google.${format.toLowerCase()}`}
                    alt=""
                    width={128}
                    height={128}
                  />
                )}
              </Button.Icon>
              <Button.Label>{format === 'Icon font' ? 'Add' : 'Google'}</Button.Label>
            </Button>
            {format === 'Icon font' && fontStatus !== 'ready' ? (
              <Text as="p" profile={profiles.body} role="status">
                {fontStatus === 'error' ? 'Icon font unavailable.' : 'Loading icon font...'}
              </Text>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
