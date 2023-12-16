/* eslint-disable @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment,no-param-reassign */
import type { StyleBySize, Size } from '@kiskadee/react';
import type {
  StyleValueKey,
  FontValue,
  FontKey,
  FontFamily,
  ColorProp,
  NumberProp,
  FontWeight,
  FontStyle,
} from '@kiskadee/react/utils/property.type';
import type { UniqueStyle } from './types';

function extracted(uniqueStyle: UniqueStyle, property: string, propertyValue: string): UniqueStyle {
  let valueList = uniqueStyle[property];

  if (valueList) {
    let total = valueList[propertyValue]?.total;
    total = total === undefined ? 1 : total + 1;

    const value = valueList[propertyValue] ?? {};
    value.total = total;

    valueList[propertyValue] = value;
  } else {
    valueList = {
      [propertyValue]: {
        total: 1,
      },
    };
  }

  uniqueStyle[property] = valueList;

  return uniqueStyle;
}

const SEPARATOR = '_';
const UNIT = 'px';
const OPACITY = '1';

function handleNumberProp(
  uniqueStyle: UniqueStyle,
  property: string,
  propertyValue: NumberProp,
): UniqueStyle {
  const value =
    typeof propertyValue === 'number'
      ? `${propertyValue}${SEPARATOR}${UNIT}`
      : `${propertyValue.value}${SEPARATOR}${propertyValue.unit}`;

  return extracted(uniqueStyle, property, value);
}

export const countStyleProperties = (
  uniqueStyle: UniqueStyle,
  sizeList: StyleBySize = {},
): UniqueStyle => {
  for (const size of Object.keys(sizeList)) {
    const propertyList = sizeList[size as Size];

    if (propertyList) {
      for (const property of Object.keys(propertyList)) {
        let propertyValue: string;

        // Font ------------------------------------------------------------------------------------

        if ((property as StyleValueKey) === 'font') {
          const fontPropertyList: FontValue = propertyList[property as StyleValueKey];

          for (const fontProperty of Object.keys(fontPropertyList)) {
            if ((fontProperty as FontKey) === 'family') {
              const fontPropertyValue: FontFamily = fontPropertyList[fontProperty as FontKey];
              propertyValue = Array.isArray(fontPropertyValue)
                ? (fontPropertyValue as string[]).join(SEPARATOR)
                : fontPropertyValue;

              uniqueStyle = extracted(uniqueStyle, 'font-family', propertyValue);
            }

            if ((fontProperty as FontKey) === 'color') {
              const fontPropertyValue = fontPropertyList[fontProperty as FontKey] as ColorProp;
              propertyValue =
                typeof fontPropertyValue === 'string'
                  ? `${fontPropertyValue}${SEPARATOR}${OPACITY}`
                  : `${fontPropertyValue.hex}${SEPARATOR}${fontPropertyValue.alpha}`;

              uniqueStyle = extracted(uniqueStyle, 'font-color', propertyValue);
            }

            if ((fontProperty as FontKey) === 'size' || (fontProperty as FontKey) === 'height') {
              const fontPropertyValue = fontPropertyList[fontProperty as FontKey] as NumberProp;
              uniqueStyle = handleNumberProp(
                uniqueStyle,
                `font-${fontProperty}`,
                fontPropertyValue,
              );
            }

            if ((fontProperty as FontKey) === 'weight') {
              const fontPropertyValue = fontPropertyList[fontProperty as FontKey] as FontWeight;
              propertyValue = `${fontPropertyValue}`;

              uniqueStyle = extracted(uniqueStyle, 'font-weight', propertyValue);
            }

            if ((fontProperty as FontKey) === 'style') {
              const fontPropertyValue = fontPropertyList[fontProperty as FontKey] as FontStyle;

              uniqueStyle = extracted(uniqueStyle, 'font-style', fontPropertyValue);
            }
          }
        }

        // Border ----------------------------------------------------------------------------------

        if ((property as StyleValueKey) === 'border') {
          const borderPropertyList = propertyList[property as StyleValueKey];

          if (typeof borderPropertyList === 'object') {
            for (const borderProperty of Object.keys(borderPropertyList)) {
              if (borderProperty === 'width') {
                const borderPropertyValue = borderPropertyList[
                  borderProperty as StyleValueKey
                ] as NumberProp;
                uniqueStyle = handleNumberProp(uniqueStyle, 'border-width', borderPropertyValue);
              }

              if (borderProperty === 'color') {
                const borderPropertyValue = borderPropertyList[
                  borderProperty as StyleValueKey
                ] as ColorProp;
                propertyValue =
                  typeof borderPropertyValue === 'string'
                    ? `${borderPropertyValue}${SEPARATOR}${OPACITY}`
                    : `${borderPropertyValue.hex}${SEPARATOR}${borderPropertyValue.alpha}`;

                uniqueStyle = extracted(uniqueStyle, 'border-color', propertyValue);
              }

              if (borderProperty === 'style') {
                const borderPropertyValue = borderPropertyList[borderProperty as StyleValueKey];

                uniqueStyle = extracted(uniqueStyle, 'border-style', borderPropertyValue);
              }
            }
          } else if (borderPropertyList === 'none') {
            uniqueStyle = extracted(uniqueStyle, 'border', 'none');
          }
        }
        // Radius ----------------------------------------------------------------------------------

        if ((property as StyleValueKey) === 'radius') {
          const radiusPropertyList = propertyList[property as StyleValueKey];

          if (typeof radiusPropertyList === 'object') {
            for (const radiusProperty of Object.keys(radiusPropertyList)) {
              const radiusPropertyValue = radiusPropertyList[
                radiusProperty as StyleValueKey
              ] as NumberProp;
              uniqueStyle = handleNumberProp(
                uniqueStyle,
                `radius-${radiusProperty}`,
                radiusPropertyValue,
              );
            }
          } else if (radiusPropertyList === 'none') {
            uniqueStyle = extracted(uniqueStyle, 'radius', 'none');
          }
        }

        // Box -------------------------------------------------------------------------------------

        if ((property as StyleValueKey) === 'box') {
          const boxPropertyList = propertyList[property as StyleValueKey];

          for (const boxProperty of Object.keys(boxPropertyList)) {
            if (boxProperty === 'color') {
              const boxPropertyValue = boxPropertyList[boxProperty as StyleValueKey] as ColorProp;
              propertyValue =
                typeof boxPropertyValue === 'string'
                  ? `${boxPropertyValue}${SEPARATOR}${OPACITY}`
                  : `${boxPropertyValue.hex}${SEPARATOR}${boxPropertyValue.alpha}`;

              uniqueStyle = extracted(uniqueStyle, 'box-color', propertyValue);
            }

            if (boxProperty === 'height' || boxProperty === 'weight') {
              const boxPropertyValue = boxPropertyList[boxProperty as StyleValueKey] as NumberProp;
              uniqueStyle = handleNumberProp(uniqueStyle, `box-${boxProperty}`, boxPropertyValue);
            }
          }
        }

        // Position --------------------------------------------------------------------------------

        if ((property as StyleValueKey) === 'position') {
          const positionPropertyList = propertyList[property as StyleValueKey];

          for (const positionProperty of Object.keys(positionPropertyList)) {
            if (positionProperty === 'type') {
              const positionPropertyValue = positionPropertyList[positionProperty as StyleValueKey];
              uniqueStyle = extracted(uniqueStyle, 'position-type', positionPropertyValue);
            } else {
              const positionPropertyValue = positionPropertyList[
                positionProperty as StyleValueKey
              ] as NumberProp;
              uniqueStyle = handleNumberProp(
                uniqueStyle,
                `position-${positionProperty}`,
                positionPropertyValue,
              );
            }
          }
        }

        // Padding ---------------------------------------------------------------------------------

        if ((property as StyleValueKey) === 'padding') {
          const paddingPropertyList = propertyList[property as StyleValueKey];

          for (const paddingProperty of Object.keys(paddingPropertyList)) {
            const paddingPropertyValue = paddingPropertyList[
              paddingProperty as StyleValueKey
            ] as NumberProp;
            uniqueStyle = handleNumberProp(
              uniqueStyle,
              `padding-${paddingProperty}`,
              paddingPropertyValue,
            );
          }
        }

        // Margin ----------------------------------------------------------------------------------

        if ((property as StyleValueKey) === 'margin') {
          const marginPropertyList = propertyList[property as StyleValueKey];

          for (const marginProperty of Object.keys(marginPropertyList)) {
            const marginPropertyValue = marginPropertyList[
              marginProperty as StyleValueKey
            ] as NumberProp;
            uniqueStyle = handleNumberProp(
              uniqueStyle,
              `margin-${marginProperty}`,
              marginPropertyValue,
            );
          }
        }

        // Shadow ----------------------------------------------------------------------------------

        if ((property as StyleValueKey) === 'shadow') {
          const shadowPropertyList = propertyList[property as StyleValueKey];

          for (const shadowProperty of Object.keys(shadowPropertyList)) {
            if (shadowProperty === 'color') {
              const shadowPropertyValue = shadowPropertyList[
                shadowProperty as StyleValueKey
              ] as ColorProp;
              propertyValue =
                typeof shadowPropertyValue === 'string'
                  ? `${shadowPropertyValue}${SEPARATOR}${OPACITY}`
                  : `${shadowPropertyValue.hex}${SEPARATOR}${shadowPropertyValue.alpha}`;

              uniqueStyle = extracted(uniqueStyle, 'shadow-color', propertyValue);
            } else if (shadowProperty === 'inset') {
              const shadowPropertyValue = shadowPropertyList[shadowProperty as StyleValueKey];
              uniqueStyle = extracted(uniqueStyle, 'shadow-inset', shadowPropertyValue);
            } else {
              const shadowPropertyValue = shadowPropertyList[
                shadowProperty as StyleValueKey
              ] as NumberProp;
              uniqueStyle = handleNumberProp(
                uniqueStyle,
                `shadow-${shadowProperty}`,
                shadowPropertyValue,
              );
            }
          }
        }

        // Outline ---------------------------------------------------------------------------------

        if ((property as StyleValueKey) === 'outline') {
          const outlinePropertyList = propertyList[property as StyleValueKey];

          for (const outlineProperty of Object.keys(outlinePropertyList)) {
            if (outlineProperty === 'color') {
              const outlinePropertyValue = outlinePropertyList[
                outlineProperty as StyleValueKey
              ] as ColorProp;
              propertyValue =
                typeof outlinePropertyValue === 'string'
                  ? `${outlinePropertyValue}${SEPARATOR}${OPACITY}`
                  : `${outlinePropertyValue.hex}${SEPARATOR}${outlinePropertyValue.alpha}`;

              uniqueStyle = extracted(uniqueStyle, 'outline-color', propertyValue);
            } else if (outlineProperty === 'style') {
              const outlinePropertyValue = outlinePropertyList[outlineProperty as StyleValueKey];
              uniqueStyle = extracted(uniqueStyle, 'outline-style', outlinePropertyValue);
            } else {
              const outlinePropertyValue = outlinePropertyList[
                outlineProperty as StyleValueKey
              ] as NumberProp;
              uniqueStyle = handleNumberProp(
                uniqueStyle,
                `outline-${outlineProperty}`,
                outlinePropertyValue,
              );
            }
          }
        }
      }
    }
  }

  return uniqueStyle;
};
