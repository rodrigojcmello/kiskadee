/* eslint-disable @typescript-eslint/no-unsafe-member-access */
export const propertiesMap = {
  marginTop: ['mt', 'margin-top'],
  marginRight: ['mr', 'margin-right'],
  marginBottom: ['mb', 'margin-bottom'],
  marginLeft: ['mr', 'margin-left'],
  paddingTop: ['pt', 'padding-top'],
  paddingRight: ['pr', 'padding-right'],
  paddingBottom: ['pb', 'padding-bottom'],
  paddingLeft: ['pr', 'padding-left'],
  color: ['c', 'color'],
};

export default function createCssClass(
  property: string,
  value: string,
): string | undefined {
  // @ts-expect-error
  if (propertiesMap[property]) {
    // @ts-expect-error
    return `.${propertiesMap[property][0]}-${value} { ${propertiesMap[property][1]}: ${value}; }`;
  }
  return undefined;
}
