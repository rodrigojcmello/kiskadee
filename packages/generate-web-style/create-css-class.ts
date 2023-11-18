/* eslint-disable @typescript-eslint/no-unsafe-member-access,jsdoc/require-param-description */
import fs from 'node:fs';
// eslint-disable-next-line import/no-extraneous-dependencies
import prettier from 'prettier';

export const propertiesMap = {
  marginTop: 'margin-top',
  marginRight: 'margin-right',
  marginBottom: 'margin-bottom',
  marginLeft: 'margin-left',
  paddingTop: 'padding-top',
  paddingRight: 'padding-right',
  paddingBottom: 'padding-bottom',
  paddingLeft: 'padding-left',
  color: 'color',
};

export default function createCssClass(
  className: string,
  property: string,
  value: string | number,
): string | undefined {
  // @ts-expect-error
  if (propertiesMap[property] && typeof value === 'string') {
    // @ts-expect-error
    return `.${className} { ${propertiesMap[property]}: ${value}; } `;
  }
  return undefined;
}

export async function formatFileContent(
  fileContent: string,
  filePath: string,
): Promise<void> {
  const formattedContent = prettier.format(fileContent, {
    semi: false,
    parser: 'css',
  });

  fs.writeFileSync(filePath, await formattedContent, 'utf8');
}
