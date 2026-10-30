'use client';

import {
  componentScaleToSize,
  type ElementSizeValue,
  type RadiusMode,
  type SurfaceContext
} from '@kiskadee/core';
import { Button, useButtonArtifactConfig } from '@kiskadee/react-components/button';
import { FamilyResolvedIcon } from '@kiskadee/react-components/icon';
import { Layout } from '@kiskadee/react-components/layout';
import { Separator } from '@kiskadee/react-components/separator';
import { Text } from '@kiskadee/react-components/text';
import { Fragment, useState } from 'react';
import { ShowcaseExampleCard } from '@/components/ShowcaseBackground/ShowcaseExampleCard';
import { useShowcaseDisplayPreferences } from '@/components/ShowcaseDisplayPreferences';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import {
  ButtonCompositionControls,
  useButtonCompositionControls
} from './ButtonCompositionControls';
import styles from './ButtonPaginationExamples.module.scss';

const EXAMPLES = [
  { id: 'numbered', title: 'Numbered', total: 5 },
  { id: 'connected', title: 'Connected', total: 5 },
  { id: 'window', title: 'Page window', total: 20 },
  { id: 'compact', title: 'Compact', total: 12 }
] as const;

type ExampleId = (typeof EXAMPLES)[number]['id'];

function windowPages(current: number, total: number) {
  const pages = [1];
  for (let page = Math.max(2, current - 1); page <= Math.min(total - 1, current + 1); page++) {
    pages.push(page);
  }
  pages.push(total);
  return pages;
}

export function ButtonPaginationExamples({
  radius,
  scale,
  surfaceContext
}: {
  radius: RadiusMode;
  scale?: ElementSizeValue;
  surfaceContext: SurfaceContext;
}) {
  const profiles = useShowcaseTextProfiles();
  const { showDescriptions } = useShowcaseDisplayPreferences();
  const { buttonClassesMap } = useButtonArtifactConfig();
  const presentation = useButtonCompositionControls(buttonClassesMap);
  const painting = presentation.buttonProps();
  const [radiusOverride, setRadiusOverride] = useState<RadiusMode>();
  const effectiveRadius = radiusOverride ?? radius;
  const [pages, setPages] = useState<Record<ExampleId, number>>({
    numbered: 3,
    connected: 3,
    window: 6,
    compact: 3
  });
  const size = componentScaleToSize(scale);

  function changePage(id: ExampleId, page: number) {
    setPages((current) => ({ ...current, [id]: page }));
  }

  function stepPage(id: ExampleId, step: number, total: number) {
    setPages((current) => ({
      ...current,
      [id]: Math.min(total, Math.max(1, current[id] + step))
    }));
  }

  function pageButton(id: ExampleId, page: number) {
    return (
      <Button
        {...painting}
        key={page}
        type="button"
        radius={effectiveRadius}
        size={size}
        aria-label={`Page ${page}`}
        aria-current={pages[id] === page ? 'page' : undefined}
        controlState={pages[id] === page}
        onClick={() => changePage(id, page)}
      >
        <Button.Label>{page}</Button.Label>
      </Button>
    );
  }

  function directionButton(id: ExampleId, direction: 'previous' | 'next', total: number) {
    const previous = direction === 'previous';
    const label = previous ? 'Previous' : 'Next';
    return (
      <Button
        {...painting}
        type="button"
        radius={effectiveRadius}
        size={size}
        aria-label={`${label} page`}
        disabled={previous ? pages[id] === 1 : pages[id] === total}
        onClick={() => stepPage(id, previous ? -1 : 1, total)}
      >
        {id === 'connected' ? (
          <Button.Label>{label}</Button.Label>
        ) : (
          <Button.Icon>
            <FamilyResolvedIcon name={previous ? 'chevron-left' : 'chevron-end'} />
          </Button.Icon>
        )}
      </Button>
    );
  }

  return (
    <section className={styles.section} aria-labelledby="button-pagination-title">
      <Text as="h4" id="button-pagination-title" profile={profiles.subsectionTitle}>
        Pagination
      </Text>
      {showDescriptions ? (
        <Text as="p" profile={profiles.body}>
          Page navigation with separate, connected and compact Buttons. Each example keeps its own
          current page; the controls adjust their shared appearance.
        </Text>
      ) : null}
      <ShowcaseExampleCard context={surfaceContext} padding={false} clipContent>
        <ButtonCompositionControls
          {...presentation.controls}
          radiusControl={{ value: effectiveRadius, onValueChange: setRadiusOverride }}
        />
        {EXAMPLES.map(({ id, title, total }, index) => {
          const visiblePages =
            id === 'compact'
              ? [pages[id]]
              : id === 'window'
                ? windowPages(pages[id], total)
                : [1, 2, 3, 4, 5];
          const numbers = visiblePages.map((page, pageIndex) => (
            <Fragment key={page}>
              {pageIndex > 0 && page - visiblePages[pageIndex - 1] > 1 ? (
                <Text as="span" profile={profiles.caption} emphasis="medium" aria-hidden="true">
                  &hellip;
                </Text>
              ) : null}
              {pageButton(id, page)}
            </Fragment>
          ));
          return (
            <Fragment key={id}>
              {index > 0 ? <Separator intent="neutral" emphasis="low" /> : null}
              <Layout padding="md">
                <div className={styles.example}>
                  <Text as="h5" id={`button-pagination-${id}-title`} profile={profiles.bodyStrong}>
                    {title}
                  </Text>
                  <nav
                    aria-labelledby={`button-pagination-${id}-title`}
                    data-button-pagination-example={id}
                    className={styles.viewport}
                  >
                    {id === 'connected' ? (
                      <Button.Group
                        intent={painting.intent}
                        emphasis={painting.emphasis}
                        radius={effectiveRadius}
                        size={size}
                      >
                        {directionButton(id, 'previous', total)}
                        {numbers}
                        {directionButton(id, 'next', total)}
                      </Button.Group>
                    ) : (
                      <div className={styles.row}>
                        {directionButton(id, 'previous', total)}
                        {numbers}
                        {directionButton(id, 'next', total)}
                      </div>
                    )}
                  </nav>
                  {id === 'compact' ? (
                    <Text as="span" profile={profiles.caption} emphasis="medium" aria-live="polite">
                      Page {pages[id]} of {total}
                    </Text>
                  ) : null}
                </div>
              </Layout>
            </Fragment>
          );
        })}
      </ShowcaseExampleCard>
    </section>
  );
}
