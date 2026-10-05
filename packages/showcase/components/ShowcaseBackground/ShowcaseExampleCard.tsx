'use client';

import type { CardIntent, ComponentEmphasis, SurfaceContext } from '@kiskadee/core';
import type { CardProps } from '@kiskadee/react-components';
import { Card } from '@kiskadee/react-components/card';
import { Layout, type LayoutProps } from '@kiskadee/react-components/layout';
import { useKiskadee } from '@kiskadee/react-components/resources';
import { useShowcaseBackground } from '@/hooks/use-showcase-background';
import { useShowcaseMetadata } from '@/hooks/use-showcase-metadata';
import { supportsManifestSurfaceContext } from '@/utils/manifest-surface-context';
import styles from './ShowcaseExampleCard.module.scss';

/** Consumer composition only: the public Card still owns all painting and child context. */
export function ShowcaseExampleCard({
  context,
  children,
  contentClassName,
  padding = 'md',
  ...props
}: Omit<CardProps, 'intent' | 'emphasis' | 'surfaceContext'> & {
  context?: SurfaceContext;
  contentClassName?: string;
  padding?: LayoutProps['padding'];
}) {
  const background = useShowcaseBackground();
  const { segment, theme } = useKiskadee();
  const { manifest } = useShowcaseMetadata(['card']);
  const surface =
    !context || background.cardSurface?.contentSurfaceContext === context
      ? background.cardSurface
      : background.surfaces.find((item) => item.contentSurfaceContext === context);
  const content =
    padding === false ? (
      children
    ) : (
      <Layout
        padding={padding}
        classNames={{
          e1: styles.frame,
          e2: `${contentClassName ?? styles.flow} s-example-card-content`
        }}
      >
        {children}
      </Layout>
    );
  if (!surface) {
    const { shadow, radius, border, clipContent, ...contentProps } = props;
    return <div {...contentProps}>{content}</div>;
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
      border={props.border ?? 'adaptive'}
      intent={intent}
      emphasis={emphasis}
      surfaceContext={surfaceContext}
      data-showcase-example-card={surface.key}
    >
      {content}
    </Card>
  );
}
