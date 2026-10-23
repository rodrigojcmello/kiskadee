'use client';

import type { ElementHeightReference, ElementSizeValue, TypographyProfileId } from '@kiskadee/core';
import { Text } from '@kiskadee/react-components/text';
import type { ReactNode, RefCallback } from 'react';
import { useCallback, useEffect, useId, useState } from 'react';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import styles from './ButtonSizeScaleExample.module.scss';

const HEIGHT_TOLERANCE = 0.25;
const pixelFormat = new Intl.NumberFormat('en', { maximumFractionDigits: 2 });

export function resolveButtonExpectedHeight(
  reference: ElementHeightReference | undefined,
  scale: ElementSizeValue
): number | undefined {
  const height = typeof reference === 'number' ? reference : reference?.[scale];
  return typeof height === 'number' && Number.isFinite(height) && height > 0 ? height : undefined;
}

export function formatButtonHeight(height: number): string {
  return pixelFormat.format(height);
}

export function hasButtonHeightMismatch(
  expected: number | undefined,
  measured: number | undefined
) {
  return (
    expected !== undefined &&
    measured !== undefined &&
    Math.abs(measured - expected) > HEIGHT_TOLERANCE
  );
}

type DocumentMeasurements = {
  listeners: Set<() => void>;
  stop: () => void;
};

const documentMeasurements = new WeakMap<Document, DocumentMeasurements>();

function subscribeFontAndViewport(document: Document, listener: () => void): () => void {
  let subscription = documentMeasurements.get(document);
  if (!subscription) {
    const listeners = new Set<() => void>();
    const view = document.defaultView;
    const fonts = document.fonts;
    let active = true;
    const notify = () => {
      if (!active) return;
      for (const onChange of listeners) onChange();
    };
    view?.addEventListener('resize', notify);
    fonts?.addEventListener('loadingdone', notify);
    void fonts?.ready.then(notify);
    subscription = {
      listeners,
      stop: () => {
        active = false;
        view?.removeEventListener('resize', notify);
        fonts?.removeEventListener('loadingdone', notify);
      }
    };
    documentMeasurements.set(document, subscription);
  }
  const currentSubscription = subscription;
  currentSubscription.listeners.add(listener);
  return () => {
    currentSubscription.listeners.delete(listener);
    if (currentSubscription.listeners.size > 0) return;
    currentSubscription.stop();
    documentMeasurements.delete(document);
  };
}

export function observeButtonBorderBoxHeight(
  button: HTMLButtonElement,
  onChange: (height: number) => void
): () => void {
  const view = button.ownerDocument.defaultView;
  if (!view) return () => {};
  let disposed = false;
  let frame = 0;
  const measure = () => {
    const height = button.getBoundingClientRect().height;
    if (Number.isFinite(height) && height >= 0) onChange(height);
  };
  const schedule = () => {
    if (disposed || frame !== 0) return;
    frame = view.requestAnimationFrame(() => {
      frame = 0;
      measure();
    });
  };
  const resizeObserver = view.ResizeObserver ? new view.ResizeObserver(schedule) : undefined;
  resizeObserver?.observe(button, { box: 'border-box' });
  const stopDocumentMeasurements = subscribeFontAndViewport(button.ownerDocument, schedule);
  measure();
  return () => {
    if (disposed) return;
    disposed = true;
    if (frame !== 0) view.cancelAnimationFrame(frame);
    resizeObserver?.disconnect();
    stopDocumentMeasurements();
  };
}

type ButtonSizeScaleExampleProps = {
  scale: ElementSizeValue;
  heightReference: ElementHeightReference | undefined;
  compact?: boolean;
  referenceProfile?: TypographyProfileId;
  children: (props: {
    buttonRef: RefCallback<HTMLButtonElement>;
    descriptionId: string;
  }) => ReactNode;
};

export function ButtonSizeScaleExample({
  scale,
  heightReference,
  compact = false,
  referenceProfile,
  children
}: ButtonSizeScaleExampleProps) {
  const textProfiles = useShowcaseTextProfiles();
  const descriptionId = useId();
  const [button, setButton] = useState<HTMLButtonElement | null>(null);
  const [measured, setMeasured] = useState<number>();
  const buttonRef = useCallback<RefCallback<HTMLButtonElement>>((node) => setButton(node), []);
  const expected = resolveButtonExpectedHeight(heightReference, scale);
  const mismatch = hasButtonHeightMismatch(expected, measured);
  const difference =
    expected !== undefined && measured !== undefined ? measured - expected : undefined;
  const expectedText =
    expected === undefined ? 'No reference.' : `Expected ${formatButtonHeight(expected)}px.`;
  const measuredText =
    measured === undefined ? 'Measuring height' : `Real ${formatButtonHeight(measured)}px`;
  const differenceText =
    difference === undefined
      ? ''
      : ` / Delta ${difference > 0 ? '+' : ''}${formatButtonHeight(difference)}px`;

  useEffect(() => {
    if (!button) return;
    return observeButtonBorderBoxHeight(button, setMeasured);
  }, [button]);

  return (
    <div
      className={styles.example}
      data-button-size-scale={scale}
      data-button-expected-height={expected}
      data-button-real-height={measured}
      data-button-height-difference={difference}
      data-details-persistent={mismatch || expected === undefined ? '' : undefined}
    >
      <div className={`${styles.stage}${compact ? ` ${styles.compact}` : ''}`}>
        <div className={styles.buttonSlot}>{children({ buttonRef, descriptionId })}</div>
        <Text
          as="span"
          profile={referenceProfile ?? textProfiles.caption}
          foreground="neutral"
          emphasis="lowest"
          className={styles.reference}
          aria-hidden="true"
        >
          {expected === undefined ? (
            <span>No reference</span>
          ) : (
            <>
              <span
                className={styles.ruler}
                style={{ blockSize: expected }}
                data-button-height-ruler
              />
              <span>{formatButtonHeight(expected)}px</span>
            </>
          )}
        </Text>
      </div>
      <Text
        as="p"
        profile={textProfiles.caption}
        foreground="neutral"
        emphasis="medium"
        id={descriptionId}
        className={styles.details}
      >
        <span className={styles.accessibleReference}>{expectedText} </span>
        {measuredText}
        {differenceText}
      </Text>
    </div>
  );
}
