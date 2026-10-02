'use client';

import {
  type ClassNameByElementJSON,
  type ComponentSize,
  stateActivator as cn,
  type RadiusMode,
  type SelectElementName,
  type SelectMode,
  type SelectPresentationOptions,
  type SurfaceContext
} from '@kiskadee/core';
import {
  Select as HeadlessSelect,
  type SelectProps as HeadlessSelectProps,
  useSelectState
} from '@kiskadee/react-headless/select';
import type { SelectComponentArtifactJSON } from '@kiskadee/web-builder/types';
import { type ReactNode, useId, useState } from 'react';
import {
  joinClassNames,
  resolveRadiusClassName,
  resolveSchemaElementClassName
} from '../../shared/class-resolution/classNames.ts';
import { useComponentScale } from '../../shared/contexts/DensityContext.tsx';
import { useEssentialIcon } from '../../shared/contexts/EssentialIconContext.tsx';
import { useKiskadee } from '../../shared/contexts/KiskadeeContext.tsx';
import { useSurfaceContext } from '../../shared/contexts/SurfaceContext.tsx';
import { useComponentClassMapResolution } from '../../shared/contexts/useComponentClassMap.ts';
import { useLoadedComponentArtifact } from '../../shared/contexts/useLoadedComponentArtifact.ts';
import { Dropdown } from '../Dropdown/index.ts';
import { FamilyResolvedIcon } from '../Icon/FamilyResolvedIcon.tsx';
import { useSelectPositioning } from './useSelectPositioning.ts';
import './Select.structural.scss';

export type SelectProps = Omit<HeadlessSelectProps, 'children' | 'classNames'> &
  SelectPresentationOptions & {
    label?: ReactNode;
    message?: ReactNode;
    mode?: SelectMode;
    size?: ComponentSize;
    radius?: RadiusMode;
    surfaceContext?: SurfaceContext;
    sequential?: boolean;
    showChevron?: boolean;
    className?: string;
    classNames?: Partial<Record<SelectElementName, string>>;
    previousLabel?: string;
    nextLabel?: string;
  };
type SelectMap = Partial<
  Record<
    'standard',
    Partial<Record<SelectMode, Partial<Record<SelectElementName, ClassNameByElementJSON>>>>
  >
>;
const anyArtifact = (value: unknown): value is Record<string, unknown> => value !== undefined;

function SelectList({
  options,
  size,
  radius,
  positionerClassName
}: Pick<SelectProps, 'options' | 'size' | 'radius'> & { positionerClassName?: string }) {
  const positioning = useSelectPositioning(positionerClassName);
  const context = useKiskadee();
  const artifact = useLoadedComponentArtifact({
    componentName: 'dropdown',
    isArtifact: anyArtifact
  });
  const map = useComponentClassMapResolution('dropdown', context.classesMap.dropdown);
  const styled =
    Boolean(map.classMap) &&
    !map.pending &&
    !map.error &&
    (!context.loadComponentArtifact || artifact.status === 'ready');
  const optionsList = options.map((option) => (
    <HeadlessSelect.Option
      key={option.value}
      value={option.value}
      disabled={option.disabled}
      textValue={option.textValue ?? (typeof option.label === 'string' ? option.label : undefined)}
      {...(styled
        ? ({
            render: (props, state) => {
              const { ref, children, ...itemProps } = props;
              return (
                <Dropdown.Item
                  {...itemProps}
                  ref={ref}
                  selected={state.selected}
                  hovered={state.highlighted}
                  disabled={state.disabled}
                >
                  <Dropdown.Label>{children}</Dropdown.Label>
                  <Dropdown.Checkmark visible={state.selected} />
                </Dropdown.Item>
              );
            }
          } satisfies Partial<React.ComponentProps<typeof HeadlessSelect.Option>>)
        : {})}
    >
      {option.label}
    </HeadlessSelect.Option>
  ));
  if (artifact.error || map.error)
    return (
      <span role="alert">
        Unable to load Dropdown resources.{' '}
        <button
          type="button"
          onClick={() => {
            artifact.retry();
            map.retry();
          }}
        >
          Retry
        </button>
      </span>
    );
  if (!styled)
    return (
      <HeadlessSelect.Content
        portalled
        width="anchor"
        {...positioning}
        className={positionerClassName}
      >
        {optionsList}
      </HeadlessSelect.Content>
    );
  return (
    <Dropdown.VisualProvider size={size} radius={radius}>
      <Dropdown.Presence>
        {({ forceMount, render }) => (
          <HeadlessSelect.Content
            portalled
            width="anchor"
            {...positioning}
            className={positionerClassName}
            forceMount={forceMount}
            render={render}
          >
            <Dropdown.Surface>
              <Dropdown.ScrollArea>
                <Dropdown.Items>
                  <Dropdown.Group>{optionsList}</Dropdown.Group>
                </Dropdown.Items>
              </Dropdown.ScrollArea>
            </Dropdown.Surface>
          </HeadlessSelect.Content>
        )}
      </Dropdown.Presence>
    </Dropdown.VisualProvider>
  );
}

type SelectControlProps = {
  cls: (key: SelectElementName) => string | undefined;
  styled: boolean;
  elements: Partial<Record<SelectElementName, ClassNameByElementJSON>> | undefined;
  presentation: Required<SelectPresentationOptions>;
  sequential: boolean;
  showChevron: boolean;
  previousLabel: string;
  nextLabel: string;
  options: SelectProps['options'];
  disabled?: boolean;
  placeholder: ReactNode;
  messageId?: string;
};

function SelectControl({
  cls,
  styled,
  elements,
  presentation,
  sequential,
  showChevron,
  previousLabel,
  nextLabel,
  options,
  disabled,
  placeholder,
  messageId
}: SelectControlProps) {
  const state = useSelectState();
  const [focused, setFocused] = useState(false);
  const [focusVisible, setFocusVisible] = useState(false);
  const previousIcon = useEssentialIcon('chevron-left');
  const nextIcon = useEssentialIcon('chevron-end');
  const chevron = useEssentialIcon('chevron-down');
  const interactive = joinClassNames(cn.activator, cn.interactive, cn.nativeInteraction);
  const projectedFocus = focused && (presentation.focusIndicator === 'underline' || focusVisible);
  const selectionClass = styled && state.hasSelection ? cn.selected : '';
  const dividers = styled && sequential && presentation.showDividers && Boolean(elements?.e12);
  const divider = dividers ? <span className={cls('e12')} aria-hidden="true" /> : null;
  return (
    <div
      className={joinClassNames(
        cls('e3'),
        styled ? interactive : '',
        selectionClass,
        styled
          ? `k-sel-e3${presentation.focusIndicator === 'underline' ? 'a' : presentation.focusIndicator === 'inner' ? 'b' : 'c'}`
          : '',
        styled && presentation.focusRingColorSource === 'component' ? 'k-sel-e3d' : '',
        styled && projectedFocus && presentation.focusIndicator === 'outer' ? cn.focus : '',
        styled && focusVisible && focused && presentation.focusIndicator === 'outer'
          ? cn.focusVisible
          : '',
        styled && disabled ? cn.disabled : ''
      )}
    >
      <div className={styled ? 'k-sel-x1' : undefined}>
        {sequential ? (
          <HeadlessSelect.Previous
            className={joinClassNames(cls('e8'), styled ? interactive : '')}
            aria-label={previousLabel}
            render={(buttonProps, stepState) => (
              <button
                {...buttonProps}
                className={joinClassNames(
                  buttonProps.className,
                  styled && stepState.disabled ? cn.disabled : ''
                )}
              />
            )}
          >
            {styled && previousIcon ? <FamilyResolvedIcon name={previousIcon} /> : previousLabel}
          </HeadlessSelect.Previous>
        ) : null}
        {divider}
        <HeadlessSelect.Trigger
          aria-describedby={messageId}
          onFocus={(event) => {
            setFocused(true);
            setFocusVisible(event.currentTarget.matches(':focus-visible'));
          }}
          onBlur={() => {
            setFocused(false);
            setFocusVisible(false);
          }}
          onKeyDown={() => setFocusVisible(true)}
          onPointerDown={() => setFocusVisible(false)}
          className={joinClassNames(
            cls('e4'),
            styled ? interactive : '',
            selectionClass,
            styled && projectedFocus ? cn.focus : '',
            styled && focused && focusVisible ? cn.focusVisible : '',
            styled && disabled ? cn.disabled : ''
          )}
          render={(triggerProps, triggerState) => {
            const selected = triggerState.hasSelection
              ? options.find(
                  (option) => option.value === triggerState.selectedValue && option.kind !== 'none'
                )
              : undefined;
            return (
              <button {...triggerProps} type="button">
                <span className={cls(selected ? 'e5' : 'e11')}>
                  {selected?.label ?? placeholder}
                </span>
                {showChevron ? (
                  <span className={cls('e6')} aria-hidden="true">
                    {styled && chevron ? <FamilyResolvedIcon name={chevron} /> : '▾'}
                  </span>
                ) : null}
              </button>
            );
          }}
        />
        {divider}
        {sequential ? (
          <HeadlessSelect.Next
            className={joinClassNames(cls('e9'), styled ? interactive : '')}
            aria-label={nextLabel}
            render={(buttonProps, stepState) => (
              <button
                {...buttonProps}
                className={joinClassNames(
                  buttonProps.className,
                  styled && stepState.disabled ? cn.disabled : ''
                )}
              />
            )}
          >
            {styled && nextIcon ? <FamilyResolvedIcon name={nextIcon} /> : nextLabel}
          </HeadlessSelect.Next>
        ) : null}
      </div>
      {styled && elements?.e7 ? (
        <span
          className={joinClassNames(
            'k-sel-x2',
            cn.activator,
            projectedFocus && presentation.focusIndicator === 'underline' ? cn.focus : '',
            disabled ? cn.disabled : ''
          )}
          aria-hidden="true"
        >
          <span className={cls('e7')} />
        </span>
      ) : null}
    </div>
  );
}

export function Select({
  label,
  message,
  mode: modeProp,
  size,
  radius: radiusProp,
  surfaceContext: surfaceProp,
  sequential = false,
  showChevron = true,
  showDividers: showDividersProp,
  focusIndicator: focusIndicatorProp,
  focusRingColorSource: focusRingColorSourceProp,
  className,
  classNames = {},
  previousLabel = 'Previous option',
  nextLabel = 'Next option',
  options,
  disabled,
  placeholder = 'Select an option',
  ...props
}: SelectProps) {
  const context = useKiskadee();
  const inheritedSurface = useSurfaceContext();
  const artifact = useLoadedComponentArtifact({ componentName: 'select', isArtifact: anyArtifact });
  const map = useComponentClassMapResolution<SelectMap>(
    'select',
    context.classesMap.select as SelectMap | undefined
  );
  const config = artifact.currentArtifact as SelectComponentArtifactJSON | undefined;
  const mode = modeProp ?? config?.options?.mode ?? 'outline';
  const scale = useComponentScale('select', size, { variant: 'standard', mode });
  const radius = radiusProp ?? context.global?.radius ?? 'rounded';
  const surfaceContext = surfaceProp ?? inheritedSurface;
  const elements = map.classMap?.standard?.[mode];
  const styled =
    Boolean(elements) &&
    !map.pending &&
    !map.error &&
    (!context.loadComponentArtifact || config?.component === 'select');
  const modeOptions = config?.modeOptions?.[mode];
  const presentation: Required<SelectPresentationOptions> = {
    focusIndicator:
      focusIndicatorProp ??
      modeOptions?.focusIndicator ??
      config?.options?.focusIndicator ??
      'underline',
    focusRingColorSource:
      focusRingColorSourceProp ??
      modeOptions?.focusRingColorSource ??
      config?.options?.focusRingColorSource ??
      'global',
    showDividers:
      showDividersProp ?? modeOptions?.showDividers ?? config?.options?.showDividers ?? false
  };
  const messageId = useId();
  const cls = (key: SelectElementName) =>
    joinClassNames(
      styled ? `k-sel-${key}` : '',
      styled
        ? resolveSchemaElementClassName(elements?.[key], {
            scale,
            surfaceContext,
            intent: 'neutral',
            emphasis: 'medium'
          })
        : '',
      styled ? resolveRadiusClassName(elements?.[key], scale, radius) : '',
      classNames[key]
    );
  const malformed = artifact.status === 'ready' && config?.component !== 'select';
  const failure = artifact.error || map.error || malformed;
  return (
    <HeadlessSelect.Root
      {...props}
      options={options}
      disabled={disabled}
      placeholder={placeholder}
      classNames={{
        e1: joinClassNames(
          cls('e1'),
          className,
          styled && disabled ? `${cn.activator} ${cn.disabled}` : ''
        )
      }}
    >
      {failure ? (
        <span role="alert">
          Unable to load Select resources.{' '}
          <button
            type="button"
            onClick={() => {
              artifact.retry();
              map.retry();
            }}
          >
            Retry
          </button>
        </span>
      ) : null}
      {label != null ? (
        <HeadlessSelect.Label className={cls('e2')}>{label}</HeadlessSelect.Label>
      ) : null}
      <SelectControl
        cls={cls}
        styled={styled}
        elements={elements}
        presentation={presentation}
        sequential={sequential}
        showChevron={showChevron}
        options={options}
        disabled={disabled}
        placeholder={placeholder}
        messageId={message != null ? messageId : undefined}
        previousLabel={previousLabel}
        nextLabel={nextLabel}
      />
      {message != null ? (
        <span id={messageId} className={cls('e10')}>
          {message}
        </span>
      ) : null}
      {styled ? (
        <SelectList
          options={options}
          size={size}
          radius={radius}
          positionerClassName={elements?.e13 ? cls('e13') : undefined}
        />
      ) : (
        <HeadlessSelect.Content portalled width="anchor">
          {options.map((option) => (
            <HeadlessSelect.Option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              textValue={
                option.textValue ?? (typeof option.label === 'string' ? option.label : undefined)
              }
            >
              {option.label}
            </HeadlessSelect.Option>
          ))}
        </HeadlessSelect.Content>
      )}
    </HeadlessSelect.Root>
  );
}
