import type { RadiusMode } from '@kiskadee/core';
import { useHeadlessTextFieldActions } from '@kiskadee/react-headless';
import type { HTMLInputTypeAttribute, ReactNode, RefObject } from 'react';
import { Fragment, useEffect, useRef, useState } from 'react';
import { Button } from '../Button/Button.tsx';
import { TextFieldAction } from './TextField.content.tsx';
import { bindTextFieldContentLayout } from './TextField.content-layout.runtime.ts';
import type { TextFieldClearAction, TextFieldVisibilityToggle } from './TextField.types.ts';

export function hasTextFieldContent(content: ReactNode): boolean {
  return content !== undefined && content !== null && content !== false && content !== '';
}

/** Resolves native actions under the Headless Root so uncontrolled values keep one owner. */
export function TextFieldManagedActions({
  clearAction,
  visibilityToggle,
  inputType,
  startContent,
  endContent,
  radius,
  branch,
  controlRef,
  inputRef,
  children
}: {
  clearAction?: TextFieldClearAction;
  visibilityToggle?: TextFieldVisibilityToggle;
  inputType?: HTMLInputTypeAttribute;
  startContent: ReactNode;
  endContent: ReactNode;
  radius: RadiusMode;
  branch: string;
  controlRef: RefObject<HTMLDivElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
  children: (content: { end: ReactNode; inputType?: HTMLInputTypeAttribute }) => ReactNode;
}) {
  const actions = useHeadlessTextFieldActions({
    inputType,
    visibilityEnabled: visibilityToggle !== undefined
  });
  const [clearRequest, setClearRequest] = useState(0);
  const processedRequest = useRef(0);
  const [announcement, setAnnouncement] = useState<{ request: number; text: string } | null>(null);
  const canClear =
    clearAction && actions.value.length > 0 && !actions.disabled && !actions.readOnly;
  const canReveal = visibilityToggle && inputType === 'password';
  const hasCustomEnd = hasTextFieldContent(endContent);
  const hasEnd = hasCustomEnd || canClear || canReveal;
  const hasContent = hasTextFieldContent(startContent) || Boolean(hasEnd);

  useEffect(() => {
    if (processedRequest.current === clearRequest) return;
    processedRequest.current = clearRequest;
    setAnnouncement(
      actions.value === '' && clearAction
        ? { request: clearRequest, text: clearAction.clearedAnnouncement }
        : null
    );
  }, [actions.value, clearAction, clearRequest]);

  useEffect(() => {
    const controlElement = controlRef.current;
    const inputElement = inputRef.current;
    if (!hasContent || !controlElement || !inputElement) return;
    return bindTextFieldContentLayout({ controlElement, inputElement });
  }, [controlRef, hasContent, inputRef]);

  const end = hasEnd ? (
    <>
      {hasCustomEnd ? <Fragment key="custom-content">{endContent}</Fragment> : null}
      {canClear ? (
        <TextFieldAction key="clear">
          <Button
            type="button"
            size={clearAction.size ?? 'sm'}
            radius={radius}
            emphasis="lowest"
            intent="neutral"
            aria-label={clearAction.label}
            aria-controls={actions.inputId}
            onClick={() => {
              setClearRequest((request) => request + 1);
              actions.clear();
            }}
          >
            <Button.Icon>{clearAction.icon}</Button.Icon>
          </Button>
        </TextFieldAction>
      ) : null}
      {canReveal ? (
        <TextFieldAction key="visibility">
          <Button
            type="button"
            size={visibilityToggle.size ?? 'sm'}
            radius={radius}
            emphasis="lowest"
            intent="neutral"
            disabled={actions.disabled}
            aria-label={actions.visible ? visibilityToggle.hideLabel : visibilityToggle.showLabel}
            aria-controls={actions.inputId}
            onClick={actions.toggleVisibility}
          >
            {visibilityToggle.presentation === 'icon' ? (
              <Button.Icon>
                {actions.visible ? visibilityToggle.hideIcon : visibilityToggle.showIcon}
              </Button.Icon>
            ) : (
              <Button.Label>
                {actions.visible ? visibilityToggle.hideText : visibilityToggle.showText}
              </Button.Label>
            )}
          </Button>
        </TextFieldAction>
      ) : null}
    </>
  ) : null;

  return (
    <>
      {children({ end, inputType: actions.inputType })}
      {clearAction ? (
        <span role="status" aria-live="polite" aria-atomic="true" className={`k-txf-x4-${branch}`}>
          {announcement ? <span key={announcement.request}>{announcement.text}</span> : null}
        </span>
      ) : null}
    </>
  );
}
