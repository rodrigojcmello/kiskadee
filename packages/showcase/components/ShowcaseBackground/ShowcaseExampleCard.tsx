'use client';

import type { CardIntent, ComponentEmphasis, SurfaceContext } from '@kiskadee/core';
import { Card, type CardProps, useKiskadee, useShowcase } from '@kiskadee/react-components';
import { useShowcaseBackground } from '@/hooks/use-showcase-background';
import { supportsManifestSurfaceContext } from '@/utils/manifest-surface-context';

/** Consumer composition only: the public Card still owns all painting and child context. */
export function ShowcaseExampleCard({
  context,
  ...props
}: Omit<CardProps, 'intent' | 'emphasis' | 'surfaceContext'> & { context?: SurfaceContext }) {
  const background = useShowcaseBackground();
  const { segment, theme } = useKiskadee();
  const { manifest } = useShowcase();
  const surface =
    !context || background.cardSurface?.contentSurfaceContext === context
      ? background.cardSurface
      : background.surfaces.find((item) => item.contentSurfaceContext === context);
  if (!surface) {
    const { shadow, radius, border, ...contentProps } = props;
    return <div {...contentProps} />;
  }
  const [intent, emphasis] = surface.key.split('.') as [CardIntent, ComponentEmphasis];
  const surfaceContext = supportsManifestSurfaceContext(
    manifest?.components?.card,
    segment,
    theme,
    background.surfaceContext
  )
    ? background.surfaceContext
    : 'onSubtle';
  return (
    <Card
      {...props}
      intent={intent}
      emphasis={emphasis}
      surfaceContext={surfaceContext}
      data-showcase-example-card={surface.key}
    />
  );
}
