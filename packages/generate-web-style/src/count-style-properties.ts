/* eslint-disable @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment,no-param-reassign */
import type { StyleBySize, Size } from '@kiskadee/react';
import type { UniqueStyle } from './types';

export const countStyleProperties = (
  sizeList: StyleBySize,
  uniqueStyle: UniqueStyle,
): UniqueStyle => {
  for (const size of Object.keys(sizeList)) {
    const propertyList = sizeList[size as Size];

    if (propertyList) {
      for (const property of Object.keys(propertyList)) {
        const propertyValue = propertyList[property];
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
      }
    }
  }

  return uniqueStyle;
};
