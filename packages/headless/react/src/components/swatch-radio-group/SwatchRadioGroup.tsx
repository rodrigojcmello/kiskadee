import {
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
  forwardRef,
  useCallback,
  useId,
  useState
} from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type SwatchRadioItem = {
  value: string;
  label?: string;
  disabled?: boolean;
  swatch?: {
    color?: string;
  };
};

export type SwatchRadioGroupClassNames = Partial<
  Record<'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e5a' | 'e6', string>
>;
// e1: Root container (fieldset)
// e2: Wrapper for items (div/flex container)
// e3: Item wrapper (label)
// e4: Input (input[type=radio])
// e5: Swatch visual (default state)
// e5a: Swatch visual (selected state) — appended when selected
// e6: Item text label (span)

export type SwatchRadioGroupRenderSwatchArgs = {
  selected: boolean;
};

export type SwatchRadioGroupProps = {
  items: SwatchRadioItem[];
  value?: string;
  defaultValue?: string;
  onBeforeValueChange?: (nextValue: string) => void;
  onValueChange?: (value: string) => void;
  name?: string;
  'aria-label'?: string;
  classNames?: SwatchRadioGroupClassNames;
  renderSwatch?: (item: SwatchRadioItem, args: SwatchRadioGroupRenderSwatchArgs) => ReactNode;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'name'>;

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Headless SwatchRadioGroup component.
 * - Renders an accessible radio group specialized for selecting swatches.
 * - Supports controlled and uncontrolled state.
 * - Allows custom swatch rendering via `renderSwatch`.
 */
export const SwatchRadioGroup = forwardRef<HTMLFieldSetElement, SwatchRadioGroupProps>(
  function SwatchRadioGroup(
    {
      items,
      value,
      defaultValue,
      onBeforeValueChange,
      onValueChange,
      name,
      'aria-label': ariaLabel,
      classNames,
      className,
      renderSwatch,
      ...props
    },
    ref
  ) {
    const internalId = useId();
    const groupName = name || `srg-${internalId}`;

    const isControlled = value !== undefined;
    const [uncontrolled, setUncontrolled] = useState<string | undefined>(
      defaultValue ?? items.find((i) => !i.disabled)?.value
    );
    const selected = isControlled ? value : uncontrolled;

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;

        if (newValue === selected) {
          return;
        }

        onBeforeValueChange?.(newValue);

        if (!isControlled) {
          setUncontrolled(newValue);
        }

        onValueChange?.(newValue);
      },
      [isControlled, onBeforeValueChange, onValueChange, selected]
    );

    const rootClass = classNames?.e1
      ? `${classNames.e1} ${className || ''}`.trim()
      : className;

    return (
      <fieldset
        ref={ref}
        className={rootClass}
        aria-label={ariaLabel}
        style={{ border: 'none', padding: 0, margin: 0 }}
      >
        <div className={classNames?.e2} role="radiogroup">
          {items.map((item) => {
            const isSelected = selected === item.value;
            const itemInputId = `${groupName}-${item.value}`;

            const swatchClass = isSelected
              ? classNames?.e5a
                ? `${classNames.e5 ?? ''} ${classNames.e5a}`.trim()
                : classNames?.e5 ?? ''
              : classNames?.e5 ?? '';

            const swatchNode = renderSwatch ? (
              renderSwatch(item, { selected: isSelected })
            ) : (
              <span
                className={swatchClass}
                style={item.swatch?.color ? ({ backgroundColor: item.swatch.color } as const) : undefined}
                aria-hidden="true"
              />
            );

            return (
              <label
                key={item.value}
                className={classNames?.e3}
                htmlFor={itemInputId}
                title={item.label || item.value}
              >
                <input
                  id={itemInputId}
                  type="radio"
                  name={groupName}
                  value={item.value}
                  checked={isSelected}
                  onChange={handleChange}
                  disabled={item.disabled}
                  className={classNames?.e4}
                  aria-label={item.label}
                  {...props}
                />
                {swatchNode}
                {item.label ? <span className={classNames?.e6}>{item.label}</span> : null}
              </label>
            );
          })}
        </div>
      </fieldset>
    );
  }
);
