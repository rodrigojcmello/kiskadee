/* eslint-disable @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment,no-param-reassign */
import type { StyleBySize, Size } from '@kiskadee/react';
import type {
  StyleValueKey,
  FontValue,
  FontKey,
  FontFamily,
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
                ? (fontPropertyValue as string[]).join('')
                : fontPropertyValue;

              uniqueStyle = extracted(uniqueStyle, 'font-family', propertyValue);
            }
          }
        }

        // Border ----------------------------------------------------------------------------------
      }
    }
  }

  return uniqueStyle;
};
