import './RollingNumber.css';
import type { CSSProperties, HTMLAttributes } from 'react';

export type RollingNumberFormatValue = (value: number) => number | string;

export type RollingNumberProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
  value: number;
  formatValue?: RollingNumberFormatValue;
};

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

function isDigit(character: string): boolean {
  return character >= '0' && character <= '9';
}

function mergeClassNames(...parts: Array<string | undefined | null | false>): string | undefined {
  const joined = parts.filter(Boolean).join(' ').trim();
  return joined.length > 0 ? joined : undefined;
}

export function RollingNumber({ value, formatValue, className, ...props }: RollingNumberProps) {
  const formattedValue = String(formatValue ? formatValue(value) : value);
  const characters = Array.from(formattedValue.matchAll(/./gu), (match) => ({
    character: match[0],
    key: `${match.index}:${match[0]}`
  }));

  return (
    <span {...props} className={mergeClassNames('k-rolling-number', className)}>
      <span className="k-rolling-number-visual" aria-hidden="true">
        {characters.map(({ character, key }) => {
          if (!isDigit(character)) {
            return (
              <span key={key} className="k-rolling-number-static">
                {character}
              </span>
            );
          }

          return (
            <span
              key={key}
              className="k-rolling-number-digit"
              style={{ '--k-rn-digit': Number(character) } as CSSProperties}
            >
              <span className="k-rolling-number-digit-stack">
                {DIGITS.map((digit) => (
                  <span key={digit} className="k-rolling-number-digit-glyph">
                    {digit}
                  </span>
                ))}
              </span>
            </span>
          );
        })}
      </span>
      <span className="k-rolling-number-accessible">{formattedValue}</span>
    </span>
  );
}
