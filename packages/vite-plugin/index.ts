/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument */
import fs from 'node:fs';
import type { KiskadeeTheme, ComponentName } from '@kiskadee/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import createCssClass, { formatFileContent } from './create-css-class';
import { generateUniqueKey } from './src/generate-unique-key/generate-unique-key';

const filePath = process.argv[2];

console.log('### HELLO4', filePath);

let schema: KiskadeeTheme;

try {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  schema = JSON.parse(fileContent) as KiskadeeTheme;

  if (!schema.name && !schema.version) {
    throw new Error('Arquivo não possui as propriedades "name" e "version".');
  }

  console.log('Valor da propriedade "exemplo":', schema.name);
  console.log('Estrutura JSON:##', schema);

  const uniqueStyle: Partial<Record<string, Record<string, number>>> = {};

  const getSize = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sizes: any,
  ): void => {
    console.log({ sizes });

    for (const sizeName of Object.keys(sizes)) {
      const properties = sizes[sizeName] ?? {};
      for (const propertyName of Object.keys(properties)) {
        const propertyValue = properties[propertyName] as string;

        let property = uniqueStyle[propertyName];
        if (property) {
          if (property[propertyValue]) {
            property[propertyValue] += 1;
          } else {
            property[propertyValue] = 1;
          }
        } else {
          property = {
            [propertyValue]: 1,
          };
        }

        // TODO: remove this after fix types
        uniqueStyle[propertyName] = property;
      }
    }
  };

  for (const componentName of Object.keys(schema.component ?? {})) {
    const component = schema.component?.[componentName as ComponentName] ?? {};
    const elements = component.elements ?? {};

    for (const elementName of Object.keys(elements)) {
      // @ts-expect-error
      const modes = elements[elementName] ?? {};
      for (const modeName of Object.keys(modes)) {
        const themes = modes[modeName] ?? {};
        for (const themeName of Object.keys(themes)) {
          const types = themes[themeName] ?? {};
          for (const typeName of Object.keys(types)) {
            const variants = types[typeName].variant ?? {};
            const base = types[typeName].base ?? {};
            getSize(base);

            for (const variantName of Object.keys(variants)) {
              const interactionStatuses = variants[variantName] ?? {};
              for (const interactiveStatus of Object.keys(
                interactionStatuses,
              )) {
                const sizes = interactionStatuses[interactiveStatus] ?? {};
                getSize(sizes);

                if (elementName === 'iconLeft') {
                  console.log('### HELLO64', {
                    // componentName,
                    elementName,
                    // modes,
                    // modeName,
                    // themes,
                    // themeName,
                    types,
                    typeName,
                    // variants,
                    // variantName,
                    // interactionStatuses,
                    // interactiveStatus,
                    // sizes,
                    // sizeName,
                    // properties,
                    // propertyName,
                    // propertyValue,
                  });
                }
              }
            }
          }
        }
      }
    }
  }

  console.log({ uniqueStyle });
  let currentKey: string | undefined;
  let cssContent = '';

  for (const propertyName of Object.keys(uniqueStyle)) {
    const values = uniqueStyle[propertyName];
    if (values) {
      for (const propertyValue of Object.keys(values)) {
        currentKey = generateUniqueKey(currentKey);
        if (currentKey) {
          const content = createCssClass(
            currentKey,
            propertyName,
            propertyValue,
          );
          if (content) cssContent += content;
        }
      }
    }
  }

  void formatFileContent(cssContent, 'kiskadee.css');
} catch (error) {
  // eslint-disable-next-line no-console
  console.error(error);
}
