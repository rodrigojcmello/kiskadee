/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import fs from 'node:fs';
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

export function generateUniqueKey(key): string {
  const charCodeA = 'a'.charCodeAt(0);
  const charCodeZ = 'z'.charCodeAt(0);
  const { length } = key;
  const lastChar = key[length - 1];

  if (lastChar === 'z') {
    if (length === 1) {
      return 'aa';
    }

    let prefix = '';
    let i = length - 2;

    while (i >= 0 && key[i] === 'z') {
      prefix = `a${prefix}`;
      i--;
    }

    const newChar = String.fromCharCode(key.charCodeAt(i) + 1);

    return prefix + newChar + 'a'.repeat(length - i - 2);
  }

  const newChar = String.fromCharCode(lastChar.charCodeAt(0) + 1);
  const nextKey = key.slice(0, length - 1) + newChar;

  return nextKey;
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
