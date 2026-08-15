import './Dropdown.structural.scss';
import type { DropdownIntent, ElementSizeValue, RadiusMode } from '@kiskadee/core';
import { Dropdown as HeadlessDropdown } from '@kiskadee/react-headless';
import { createContext, forwardRef, useCallback, useContext, useMemo } from 'react';
import { joinClassNames } from '../../shared/class-resolution/classNames.ts';
import { useKiskadee } from '../../shared/contexts/KiskadeeContext.tsx';
import { useComponentClassMap } from '../../shared/contexts/useComponentClassMap.ts';
import { IconGlyph } from '../Icon/IconGlyph.tsx';
import {
  DEFAULT_DROPDOWN_INTENT,
  DEFAULT_DROPDOWN_RADIUS,
  DEFAULT_DROPDOWN_SCALE,
  resolveDropdownClassNames,
  resolveDropdownElementClassName,
  resolveDropdownItemClassName
} from './Dropdown.class-names.ts';
import type {
  DropdownAnchorProps,
  DropdownClassesMap,
  DropdownClassNames,
  DropdownContentProps,
  DropdownDescriptionProps,
  DropdownIconProps,
  DropdownItemProps,
  DropdownItemsProps,
  DropdownLabelProps,
  DropdownRootProps,
  DropdownSeparatorProps,
  DropdownSurfaceProps,
  DropdownTrailingProps,
  DropdownVisualProviderProps
} from './Dropdown.types.ts';

type DropdownVisualContextValue = {
  classesMap: DropdownClassesMap | undefined;
  classNames: DropdownClassNames;
  resolved: ReturnType<typeof resolveDropdownClassNames>;
  scale: ElementSizeValue;
};

const DropdownItemIntentContext = createContext<DropdownIntent>(DEFAULT_DROPDOWN_INTENT);

const DropdownVisualContext = createContext<DropdownVisualContextValue | null>(null);

function useDropdownVisualContext(componentName: string): DropdownVisualContextValue {
  const context = useContext(DropdownVisualContext);
  if (!context) {
    throw new Error(
      `${componentName} must be used within Dropdown.Root or Dropdown.VisualProvider`
    );
  }
  return context;
}

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null): void {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}

function DropdownVisualProvider({
  scale = DEFAULT_DROPDOWN_SCALE,
  radius,
  shadow = true,
  classNames = {},
  children
}: DropdownVisualProviderProps) {
  const { classesMap, global } = useKiskadee();
  const dropdownClassesMap = useComponentClassMap(
    'dropdown',
    classesMap.dropdown as DropdownClassesMap | undefined
  );
  const resolvedRadius: RadiusMode = radius ?? global?.radius ?? DEFAULT_DROPDOWN_RADIUS;
  const resolved = useMemo(
    () =>
      resolveDropdownClassNames({
        classesMap: dropdownClassesMap,
        classNames,
        scale,
        radius: resolvedRadius,
        shadow
      }),
    [classNames, dropdownClassesMap, resolvedRadius, scale, shadow]
  );
  const contextValue = useMemo<DropdownVisualContextValue>(
    () => ({ classesMap: dropdownClassesMap, classNames, resolved, scale }),
    [classNames, dropdownClassesMap, resolved, scale]
  );

  return (
    <DropdownVisualContext.Provider value={contextValue}>{children}</DropdownVisualContext.Provider>
  );
}

function DropdownRoot({
  scale,
  radius,
  shadow,
  classNames,
  children,
  ...props
}: DropdownRootProps) {
  return (
    <DropdownVisualProvider scale={scale} radius={radius} shadow={shadow} classNames={classNames}>
      <HeadlessDropdown.Root {...props}>{children}</HeadlessDropdown.Root>
    </DropdownVisualProvider>
  );
}

const DropdownAnchor = forwardRef<HTMLElement, DropdownAnchorProps>(
  function DropdownAnchor(props, ref) {
    return <HeadlessDropdown.Anchor {...props} ref={ref} />;
  }
);

const DropdownContent = forwardRef<HTMLDivElement, DropdownContentProps>(
  function DropdownContent(props, ref) {
    return <HeadlessDropdown.Content {...props} ref={ref} />;
  }
);

const DropdownSurface = forwardRef<HTMLDivElement, DropdownSurfaceProps>(function DropdownSurface(
  { className, ...props },
  ref
) {
  const { resolved } = useDropdownVisualContext('Dropdown.Surface');
  return <div {...props} ref={ref} className={`${resolved.e1} ${className ?? ''}`.trim()} />;
});

const DropdownItems = forwardRef<HTMLDivElement, DropdownItemsProps>(function DropdownItems(
  { className, ...props },
  ref
) {
  const { resolved } = useDropdownVisualContext('Dropdown.Items');
  return <div {...props} ref={ref} className={`${resolved.items} ${className ?? ''}`.trim()} />;
});

const DropdownItem = forwardRef<HTMLElement, DropdownItemProps>(function DropdownItem(
  {
    children,
    intent = DEFAULT_DROPDOWN_INTENT,
    selected = false,
    disabled = false,
    interactive = true,
    render,
    className,
    ...props
  },
  forwardedRef
) {
  const { classesMap, resolved, scale } = useDropdownVisualContext('Dropdown.Item');
  const itemClassName = resolveDropdownItemClassName({
    baseClassName: resolved.e2,
    element: classesMap?.e2,
    scale,
    intent: intent as DropdownIntent,
    selected,
    disabled,
    interactive,
    className
  });
  const ref = useCallback(
    (node: HTMLElement | null) => assignRef(forwardedRef, node),
    [forwardedRef]
  );
  const renderProps = {
    ...props,
    ref,
    className: itemClassName,
    'aria-disabled': disabled || undefined,
    'data-selected': selected || undefined,
    'data-disabled': disabled || undefined
  } as const;

  if (render) {
    return (
      <DropdownItemIntentContext.Provider value={intent}>
        {render(renderProps, { selected, disabled })}
      </DropdownItemIntentContext.Provider>
    );
  }
  const { ref: nativeRef, ...nativeProps } = renderProps;
  return (
    <DropdownItemIntentContext.Provider value={intent}>
      <div {...nativeProps} ref={nativeRef as React.Ref<HTMLDivElement>}>
        {children}
      </div>
    </DropdownItemIntentContext.Provider>
  );
});

function useDropdownSlotClassName(
  elementName: 'e3' | 'e4' | 'e5' | 'e6',
  structuralClassName: string,
  consumerClassName?: string
): string {
  const { classesMap, classNames, scale } = useDropdownVisualContext(`Dropdown.${elementName}`);
  const intent = useContext(DropdownItemIntentContext);
  return (
    joinClassNames(
      resolveDropdownElementClassName(classesMap?.[elementName], scale, intent),
      classNames[elementName],
      structuralClassName,
      consumerClassName
    ) ?? ''
  );
}

const DropdownIcon = forwardRef<HTMLSpanElement, DropdownIconProps>(function DropdownIcon(
  { name, className, children, ...props },
  ref
) {
  const resolvedClassName = useDropdownSlotClassName('e3', 'k-ddn-e3', className);
  return (
    <span {...props} ref={ref} aria-hidden="true" className={resolvedClassName}>
      {name ? <IconGlyph name={name} /> : children}
    </span>
  );
});

const DropdownLabel = forwardRef<HTMLSpanElement, DropdownLabelProps>(function DropdownLabel(
  { className, ...props },
  ref
) {
  const resolvedClassName = useDropdownSlotClassName('e4', 'k-ddn-e4', className);
  return <span {...props} ref={ref} className={resolvedClassName} />;
});

const DropdownDescription = forwardRef<HTMLSpanElement, DropdownDescriptionProps>(
  function DropdownDescription({ className, ...props }, ref) {
    const resolvedClassName = useDropdownSlotClassName('e5', 'k-ddn-e5', className);
    return <span {...props} ref={ref} className={resolvedClassName} />;
  }
);

const DropdownTrailing = forwardRef<HTMLSpanElement, DropdownTrailingProps>(
  function DropdownTrailing({ name, className, children, ...props }, ref) {
    const resolvedClassName = useDropdownSlotClassName('e6', 'k-ddn-e6', className);
    return (
      <span {...props} ref={ref} aria-hidden="true" className={resolvedClassName}>
        {name ? <IconGlyph name={name} /> : children}
      </span>
    );
  }
);

const DropdownSeparator = forwardRef<HTMLDivElement, DropdownSeparatorProps>(
  function DropdownSeparator({ className, role = 'separator', ...props }, ref) {
    const { resolved } = useDropdownVisualContext('Dropdown.Separator');
    return (
      <div
        {...props}
        ref={ref}
        role={role}
        className={`${resolved.e7} ${className ?? ''}`.trim()}
      />
    );
  }
);

export const Dropdown: {
  Root: typeof DropdownRoot;
  VisualProvider: typeof DropdownVisualProvider;
  Anchor: typeof DropdownAnchor;
  Content: typeof DropdownContent;
  Surface: typeof DropdownSurface;
  Items: typeof DropdownItems;
  Item: typeof DropdownItem;
  Icon: typeof DropdownIcon;
  Label: typeof DropdownLabel;
  Description: typeof DropdownDescription;
  Trailing: typeof DropdownTrailing;
  Separator: typeof DropdownSeparator;
} = {
  Root: DropdownRoot,
  VisualProvider: DropdownVisualProvider,
  Anchor: DropdownAnchor,
  Content: DropdownContent,
  Surface: DropdownSurface,
  Items: DropdownItems,
  Item: DropdownItem,
  Icon: DropdownIcon,
  Label: DropdownLabel,
  Description: DropdownDescription,
  Trailing: DropdownTrailing,
  Separator: DropdownSeparator
};

export type { DropdownClassNames };
