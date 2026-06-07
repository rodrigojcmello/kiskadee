import {
  type ChangeEvent,
  type CSSProperties,
  forwardRef,
  type InputHTMLAttributes,
  useCallback,
  useId,
  useState
} from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ColorRadioItem = {
  value: string;
  color: string;
  label?: string;
  disabled?: boolean;
};

export type ColorRadioGroupClassNames = Partial<
  Record<'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e5a', string>
>;
// e1: Root container (fieldset)
// e2: Wrapper for items (div/flex container)
// e3: Item Label (label)
// e4: Input (input[type=radio])
// e5: Visual swatch/dot (span) - Default state
// e5a: Visual swatch/dot (span) - Selected state (applied in addition or replacement?)
//      Let's say e5 is always applied, e5a is appended when selected.

export type ColorRadioGroupProps = {
  items: ColorRadioItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  'aria-label'?: string;
  classNames?: ColorRadioGroupClassNames;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'name'>;

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Headless ColorRadioGroup component.
 * - Renders a radio group specialized for selecting colors.
 * - Manages selection state (controlled or uncontrolled).
 * - Accessible (fieldset, legend/aria-label, input[type=radio]).
 */
export const ColorRadioGroup = forwardRef<HTMLFieldSetElement, ColorRadioGroupProps>(
  function ColorRadioGroup(
    {
      items,
      value,
      defaultValue,
      onValueChange,
      name,
      'aria-label': ariaLabel,
      classNames,
      className, // Allow passing className to the root fieldset if needed, distinct from classNames.e1
      ...props
    },
    ref
  ) {
    const internalId = useId();
    const groupName = name || `crg-${internalId}`;

    const isControlled = value !== undefined;
    const [uncontrolled, setUncontrolled] = useState<string | undefined>(
      defaultValue ?? items.find((i) => !i.disabled)?.value
    );
    const selected = isControlled ? value : uncontrolled;

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        if (!isControlled) {
          setUncontrolled(newValue);
        }
        onValueChange?.(newValue);
      },
      [isControlled, onValueChange]
    );

    // Merge root className
    const rootClass = classNames?.e1 ? `${classNames.e1} ${className || ''}`.trim() : className;

    return (
      <fieldset
        ref={ref}
        className={rootClass}
        aria-label={ariaLabel}
        style={{ border: 'none', padding: 0, margin: 0 }} // Minimal reset for fieldset
      >
        <div className={classNames?.e2} role="radiogroup">
          {items.map((item) => {
            const isSelected = selected === item.value;
            const itemInputId = `${groupName}-${item.value}`;

            // e5 combined with e5a if selected
            const swatchClass = isSelected
              ? classNames?.e5a
                ? `${classNames.e5 ?? ''} ${classNames.e5a}`.trim()
                : (classNames?.e5 ?? '')
              : (classNames?.e5 ?? '');

            return (
              <label
                key={item.value}
                className={classNames?.e3}
                htmlFor={itemInputId}
                title={item.label || item.color}
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
                <span
                  className={swatchClass}
                  style={{ backgroundColor: item.color } as CSSProperties}
                  aria-hidden="true"
                />
              </label>
            );
          })}
        </div>
      </fieldset>
    );
  }
);
