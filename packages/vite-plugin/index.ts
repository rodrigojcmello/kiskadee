/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument */
import fs from 'node:fs';
import type { KiskadeeTheme, ComponentName } from '@kiskadee/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import createCssClass, { formatFileContent } from './create-css-class';
import { generateUniqueKey } from './src/generate-unique-key';
import { getClassName } from './src/get-class-name';

const filePath = process.argv[2];

console.log('### HELLO4', filePath);

let schema: KiskadeeTheme;

export type UniqueStyle = Partial<
  Record<
    string,
    Record<string, { total?: number; className?: string } | undefined>
  >
>;

try {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  schema = JSON.parse(fileContent) as KiskadeeTheme;

  if (!schema.name && !schema.version) {
    throw new Error('Arquivo não possui as propriedades "name" e "version".');
  }

  // console.log('Valor da propriedade "exemplo":', schema.name);
  // console.log('Estrutura JSON:##', schema);

  const uniqueStyle: UniqueStyle = {};

  const getSize = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sizes: any,
  ): void => {
    for (const sizeName of Object.keys(sizes)) {
      const properties = sizes[sizeName] ?? {};
      for (const propertyName of Object.keys(properties)) {
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
        uniqueStyle[propertyName] = values;
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
          const types = themes[themeName].type ?? {};
          const typeBase = themes[themeName].base ?? {};
          for (const typeBaseName of Object.keys(typeBase)) {
            const sizes = typeBase[typeBaseName] ?? {};
            getSize(sizes);
          }

          for (const typeName of Object.keys(types)) {
            const variants = types[typeName].variant ?? {};
            const variantBase = types[typeName].base ?? {};
            getSize(variantBase);

            for (const variantName of Object.keys(variants)) {
              const interactionStatuses = variants[variantName] ?? {};
              for (const interactiveStatus of Object.keys(
                interactionStatuses,
              )) {
                const sizes = interactionStatuses[interactiveStatus] ?? {};
                getSize(sizes);

                // if (elementName === 'iconLeft') {
                //   console.log('### HELLO64', {
                //     // componentName,
                //     elementName,
                //     // modes,
                //     // modeName,
                //     // themes,
                //     // themeName,
                //     types,
                //     typeName,
                //     // variants,
                //     // variantName,
                //     // interactionStatuses,
                //     // interactiveStatus,
                //     // sizes,
                //     // sizeName,
                //     // properties,
                //     // propertyName,
                //     // propertyValue,
                //   });
                // }
              }
            }
          }
        }
      }
    }
  }

  // console.log({ uniqueStyle: JSON.stringify(uniqueStyle) });
  // console.log({ uniqueStyle });

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

  //----------------------------------------------------------------------------

  const schemaClone = JSON.parse(JSON.stringify(schema));

  for (const componentName of Object.keys(schemaClone.component ?? {})) {
    const component = schema.component?.[componentName as ComponentName] ?? {};
    const elements = component.elements ?? {};

    for (const elementName of Object.keys(elements)) {
      // @ts-expect-error
      const modes = elements[elementName] ?? {};
      for (const modeName of Object.keys(modes)) {
        const themes = modes[modeName] ?? {};
        for (const themeName of Object.keys(themes)) {
          const types = themes[themeName].type ?? {};
          const typeBase = themes[themeName].base ?? {};
          for (const typeBaseName of Object.keys(typeBase)) {
            const sizes = typeBase[typeBaseName] ?? {};
            typeBase[typeBaseName] = getClassName(sizes, uniqueStyle);
          }

          // console.log({ x: typeBase });

          for (const typeName of Object.keys(types)) {
            const variants = types[typeName].variant ?? {};
            const variantBase = types[typeName].base ?? {};
            types[typeName].base = getClassName(variantBase, uniqueStyle);

            for (const variantName of Object.keys(variants)) {
              const interactionStatuses = variants[variantName] ?? {};
              for (const interactiveStatus of Object.keys(
                interactionStatuses,
              )) {
                const sizes = interactionStatuses[interactiveStatus] ?? {};
                interactionStatuses[interactiveStatus] = getClassName(
                  sizes,
                  uniqueStyle,
                );

                // if (elementName === 'iconLeft') {
                //   console.log('### HELLO64', {
                //     // componentName,
                //     elementName,
                //     // modes,
                //     // modeName,
                //     // themes,
                //     // themeName,
                //     types,
                //     typeName,
                //     // variants,
                //     // variantName,
                //     // interactionStatuses,
                //     // interactiveStatus,
                //     // sizes,
                //     // sizeName,
                //     // properties,
                //     // propertyName,
                //     // propertyValue,
                //   });
                // }
              }
            }
          }
        }
      }
    }
  }
} catch (error) {
  // eslint-disable-next-line no-console
  console.error(error);
}
