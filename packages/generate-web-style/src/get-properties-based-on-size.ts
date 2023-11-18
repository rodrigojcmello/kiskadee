import type { UniqueStyle } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getPropertiesBasedOnSize = (
  sizes: any,
  uniqueStyle: UniqueStyle,
): UniqueStyle => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-argument
  for (const sizeName of Object.keys(sizes)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const properties = sizes[sizeName] ?? {};

    // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-argument
    for (const propertyName of Object.keys(properties)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const propertyValue = properties[propertyName] as string;

      let values = uniqueStyle[propertyName];
      if (values) {
        let total = values[propertyValue]?.total;
        total = total === undefined ? 1 : total + 1;

        const value = values[propertyValue] ?? {};
        value.total = total;

        values[propertyValue] = value;
      } else {
        values = {
          [propertyValue]: {
            total: 1,
          },
        };
      }

      // TODO: remove this after fix types
      // eslint-disable-next-line no-param-reassign
      uniqueStyle[propertyName] = values;
    }
  }

  return uniqueStyle;
};
