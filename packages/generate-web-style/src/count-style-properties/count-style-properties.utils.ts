import type { AddPropertyToUniqueStyle } from '@/count-style-properties/count-style-properties.types';

export const SEPARATOR = '+';

export const UNIT = 'px';

export const OPACITY = '1';

export const radiusMap = {
  topLeft: 'top-left',
  topRight: 'top-right',
  bottomLeft: 'bottom-left',
  bottomRight: 'bottom-right',
};

export const defaultShadow = {
  inset: false,
  y: { value: 0, unit: UNIT },
  x: { value: 0, unit: UNIT },
  blur: { value: 0, unit: UNIT },
  spread: { value: 0, unit: UNIT },
  color: { hex: '#000000', alpha: OPACITY },
};

export const addPropertyToUniqueStyle: AddPropertyToUniqueStyle = (
  uniqueStyle,
  property,
  propertyValue,
) => {
  const uniqueStyleCopy = { ...uniqueStyle };
  let valueList = uniqueStyleCopy[property];

  if (propertyValue) {
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

    uniqueStyleCopy[property] = valueList;
  }

  return uniqueStyleCopy;
};
