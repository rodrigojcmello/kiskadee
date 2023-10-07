/* eslint-disable @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-argument */
// eslint-disable-next-line typescript-paths/absolute-parent-import
import type { UniqueStyle } from '..';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getClassName(sizes: any, uniqueStyle: UniqueStyle) {
  for (const sizeName of Object.keys(sizes)) {
    const properties = sizes[sizeName] ?? {};
    for (const propertyName of Object.keys(properties)) {
      const propertyValue = properties[propertyName] as string;

      let values = uniqueStyle[propertyName];
      if (values) {
        let total = values[propertyValue]?.total;
        total = total === undefined ? 1 : total + 1;

        const value = values[propertyValue];
        if (value) {
          value.total = total;
        }

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
}
