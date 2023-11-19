/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument */
import fs from 'node:fs';
import type { ComponentName, KiskadeeTheme } from '@kiskadee/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import type { UniqueStyle } from './src/types';
import { countStyleProperties } from './src/count-style-properties';

const filePath = process.argv[2];

console.log('### HELLO4', filePath);

let schema: KiskadeeTheme;

try {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  schema = JSON.parse(fileContent) as KiskadeeTheme;

  if (!schema.name && !schema.version) {
    throw new Error('File does not have the "name" and "version" properties.');
  }

  // console.log('Valor da propriedade "exemplo":', schema.name);
  // console.log('Estrutura JSON:##', schema);

  let uniqueStyle: UniqueStyle = {};

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
            uniqueStyle = countStyleProperties(sizes, uniqueStyle);
          }

          for (const typeName of Object.keys(types)) {
            const variants = types[typeName].variant ?? {};
            const variantBase = types[typeName].base ?? {};
            uniqueStyle = countStyleProperties(variantBase, uniqueStyle);

            for (const variantName of Object.keys(variants)) {
              const interactionStatuses = variants[variantName] ?? {};
              for (const interactiveStatus of Object.keys(
                interactionStatuses,
              )) {
                const sizes = interactionStatuses[interactiveStatus] ?? {};
                uniqueStyle = countStyleProperties(sizes, uniqueStyle);

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

  console.log({ uniqueStyle: JSON.stringify(uniqueStyle) });
  // console.log({ uniqueStyle });

  // let currentKey: string | undefined;
  // let cssContent = '';
  //
  // for (const propertyName of Object.keys(uniqueStyle)) {
  //   const values = uniqueStyle[propertyName];
  //   if (values) {
  //     for (const propertyValue of Object.keys(values)) {
  //       currentKey = generateUniqueKey(currentKey);
  //       if (currentKey) {
  //         const content = createCssClass(
  //           currentKey,
  //           propertyName,
  //           propertyValue,
  //         );
  //         if (content) cssContent += content;
  //       }
  //     }
  //   }
  // }
  //
  // void formatFileContent(cssContent, 'kiskadee.css');
  //
  // //----------------------------------------------------------------------------
  //
  // const schemaClone = JSON.parse(JSON.stringify(schema));
  // const schemaClone2 = JSON.parse(JSON.stringify(schema));
  //
  // for (const componentName of Object.keys(schemaClone.component ?? {})) {
  //   const component =
  //     schemaClone2.component?.[componentName as ComponentName] ?? {};
  //   const elements = component.elements ?? {};
  //
  //   for (const elementName of Object.keys(elements)) {
  //     const modes = elements[elementName] ?? {};
  //     for (const modeName of Object.keys(modes)) {
  //       const themes = modes[modeName] ?? {};
  //       for (const themeName of Object.keys(themes)) {
  //         const types = themes[themeName].type ?? {};
  //         const typeBase = themes[themeName].base ?? {};
  //         for (const typeBaseName of Object.keys(typeBase)) {
  //           const sizes = typeBase[typeBaseName] ?? {};
  //           typeBase[typeBaseName] = getClassName(sizes, uniqueStyle);
  //         }
  //
  //         // console.log({ x: typeBase });
  //
  //         for (const typeName of Object.keys(types)) {
  //           const variants = types[typeName].variant ?? {};
  //           const variantBase = types[typeName].base ?? {};
  //           types[typeName].base = getClassName(variantBase, uniqueStyle);
  //
  //           for (const variantName of Object.keys(variants)) {
  //             const interactionStatuses = variants[variantName] ?? {};
  //             for (const interactiveStatus of Object.keys(
  //               interactionStatuses,
  //             )) {
  //               const sizes = interactionStatuses[interactiveStatus] ?? {};
  //               interactionStatuses[interactiveStatus] = getClassName(
  //                 sizes,
  //                 uniqueStyle,
  //               );
  //
  //               // if (elementName === 'iconLeft') {
  //               //   console.log('### HELLO64', {
  //               //     // componentName,
  //               //     elementName,
  //               //     // modes,
  //               //     // modeName,
  //               //     // themes,
  //               //     // themeName,
  //               //     types,
  //               //     typeName,
  //               //     // variants,
  //               //     // variantName,
  //               //     // interactionStatuses,
  //               //     // interactiveStatus,
  //               //     // sizes,
  //               //     // sizeName,
  //               //     // properties,
  //               //     // propertyName,
  //               //     // propertyValue,
  //               //   });
  //               // }
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }
  // }

  // console.log({ schemaClone: JSON.stringify(schemaClone2) });
} catch (error) {
  // eslint-disable-next-line no-console
  console.error(error);
}
