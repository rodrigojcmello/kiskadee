/* eslint-disable @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment,no-param-reassign */
import type {
  ColorProp,
  FontWeight,
  NumberProp,
  ShadowValue,
  StyleValue,
} from '@kiskadee/react/utils/property.type';
import type { UniqueStyle } from '@/types';
import type { Size, StyleBySize } from '@kiskadee/react';
import {
  addPropertyToUniqueStyle,
  defaultShadow,
  OPACITY,
  SEPARATOR,
  UNIT,
} from './count-style-properties.utils';

const propertyUtil = {
  color: (uniqueStyle: UniqueStyle, property: string, propertyValue: ColorProp): UniqueStyle => {
    const value =
      typeof propertyValue === 'string'
        ? `${propertyValue}${SEPARATOR}${OPACITY}`
        : `${propertyValue.hex}${SEPARATOR}${propertyValue.alpha}`;

    return addPropertyToUniqueStyle(uniqueStyle, property, value);
  },
  number: (uniqueStyle: UniqueStyle, property: string, propertyValue: NumberProp): UniqueStyle => {
    const value =
      typeof propertyValue === 'number'
        ? `${propertyValue}${SEPARATOR}${UNIT}`
        : `${propertyValue.value}${SEPARATOR}${propertyValue.unit}`;

    return addPropertyToUniqueStyle(uniqueStyle, property, value);
  },
  string: (uniqueStyle: UniqueStyle, property: string, propertyValue: string): UniqueStyle =>
    addPropertyToUniqueStyle(uniqueStyle, property, propertyValue),
  boolean: (uniqueStyle: UniqueStyle, property: string, propertyValue: boolean): UniqueStyle =>
    addPropertyToUniqueStyle(uniqueStyle, property, propertyValue.toString()),
  array: (uniqueStyle: UniqueStyle, property: string, propertyValue?: string[]): UniqueStyle =>
    addPropertyToUniqueStyle(
      uniqueStyle,
      property,
      propertyValue ? propertyValue.join(SEPARATOR) : undefined,
    ),
};

const fontPropertyHandlers = {
  family: propertyUtil.array,
  color: propertyUtil.color,
  size: propertyUtil.number,
  height: propertyUtil.number,
  weight: (uniqueStyle: UniqueStyle, property: string, propertyValue: FontWeight): UniqueStyle => {
    const value = `${propertyValue}`;
    return addPropertyToUniqueStyle(uniqueStyle, 'font-weight', value);
  },
  style: addPropertyToUniqueStyle,
};

const borderPropertyHandlers = {
  width: propertyUtil.number,
  color: propertyUtil.color,
  style: addPropertyToUniqueStyle,
};

const radiusPropertyHandlers = {
  topLeft: propertyUtil.number,
  topRight: propertyUtil.number,
  bottomLeft: propertyUtil.number,
  bottomRight: propertyUtil.number,
};

const boxPropertyHandlers = {
  color: propertyUtil.color,
  height: propertyUtil.number,
  weight: propertyUtil.number,
};

const positionPropertyHandlers = {
  type: addPropertyToUniqueStyle,
  top: propertyUtil.number,
  right: propertyUtil.number,
  bottom: propertyUtil.number,
  left: propertyUtil.number,
};

const paddingPropertyHandlers = {
  top: propertyUtil.number,
  right: propertyUtil.number,
  bottom: propertyUtil.number,
  left: propertyUtil.number,
};

const marginPropertyHandlers = {
  top: propertyUtil.number,
  right: propertyUtil.number,
  bottom: propertyUtil.number,
  left: propertyUtil.number,
};

const outlinePropertyHandlers = {
  color: propertyUtil.color,
  style: addPropertyToUniqueStyle,
  width: propertyUtil.number,
  offset: propertyUtil.number,
};

const shadowPropertyHandlers = {};

const styleHandlers = {
  font: createPropertyHandler(fontPropertyHandlers, 'font'),
  border: createPropertyHandler(borderPropertyHandlers, 'border'),
  radius: createPropertyHandler(radiusPropertyHandlers, 'radius'),
  box: createPropertyHandler(boxPropertyHandlers, 'box'),
  position: createPropertyHandler(positionPropertyHandlers, 'position'),
  padding: createPropertyHandler(paddingPropertyHandlers, 'padding'),
  margin: createPropertyHandler(marginPropertyHandlers, 'margin'),
  outline: createPropertyHandler(outlinePropertyHandlers, 'outline'),
  shadow: (uniqueStyle: UniqueStyle, propertyList: StyleValue): UniqueStyle => {
    const shadowPropertyList = (propertyList as ShadowValue).shadow;

    if (shadowPropertyList) {
      if (shadowPropertyList === 'none') {
        uniqueStyle = addPropertyToUniqueStyle(uniqueStyle, 'shadow', 'none');
      } else {
        const shadowKeys = [];
        for (const shadow of shadowPropertyList) {
          const completeShadow = { ...defaultShadow, ...shadow };

          const shadowValues = Object.values(completeShadow).map((value) => {
            if (typeof value === 'object' && 'value' in value) {
              return `${value.value}${'_'}${value.unit}`;
            }
            if (typeof value === 'object' && 'hex' in value) {
              return `${value.hex}${'_'}${value.alpha}`;
            }
            if (typeof value === 'boolean') {
              return value.toString();
            }
            return `${value}${'_'}${UNIT}`;
          });
          shadowKeys.push(shadowValues.join('_'));
        }
        uniqueStyle = addPropertyToUniqueStyle(uniqueStyle, 'shadow', shadowKeys.join(SEPARATOR));
      }
    }

    return uniqueStyle;
  },
};

// eslint-disable-next-line @typescript-eslint/ban-types
function createPropertyHandler(propertyHandlers: Record<string, Function>, key: string) {
  return (uniqueStyle: UniqueStyle, propertyList: Record<string, StyleValue> = {}): UniqueStyle => {
    let uniqueStyleCopy = { ...uniqueStyle };
    // @ts-expect-error
    if (propertyList[key] === 'none') {
      uniqueStyleCopy = addPropertyToUniqueStyle(uniqueStyleCopy, key, 'none');
    } else {
      for (const property of Object.keys(propertyList[key])) {
        const x = propertyHandlers[property];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (x) {
          uniqueStyleCopy = propertyHandlers[property](
            uniqueStyleCopy,
            `${key}-${property}`,
            // @ts-expect-error
            propertyList[key][property],
          );
        }
      }
    }

    return uniqueStyleCopy;
  };
}

export const countStyleProperties = (
  uniqueStyle: UniqueStyle,
  sizeList: StyleBySize = {},
): UniqueStyle => {
  for (const size of Object.keys(sizeList)) {
    const propertyList = sizeList[size as Size];

    if (propertyList) {
      for (const property of Object.keys(propertyList)) {
        const handler = styleHandlers[property as keyof typeof styleHandlers];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (handler) {
          // @ts-expect-error
          uniqueStyle = handler(uniqueStyle, propertyList);
          // console.log({ uniqueStyle });
        }
      }
    }
  }

  return uniqueStyle;
};
