/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument */
import type {
  ComponentName,
  Mode,
  Status,
  KiskadeeTheme,
  ElementType,
  ElementVariant,
} from '@kiskadee/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { sandbox } from './sandbox/sandbox.original';
import type { UniqueStyle } from './types';
import { countStyleProperties } from './count-style-properties';

const filePath = process.argv[2];

console.log('### HELLO4', filePath);

let schema: KiskadeeTheme;

try {
  // const fileContent = fs.readFileSync(filePath, "utf8");
  // schema = JSON.parse(fileContent) as KiskadeeTheme;
  schema = sandbox;

  if (!schema.name && !schema.version) {
    throw new Error('File does not have the "name" and "version" properties.');
  }

  // console.log('Valor da propriedade "exemplo":', schema.name);
  // console.log('Estrutura JSON:##', schema);

  // Count the style properties ---------------------------------------------------------------------------------------

  let uniqueStyle: UniqueStyle = {};

  for (const componentName of Object.keys(schema.components ?? {})) {
    const component = schema.components?.[componentName as ComponentName] ?? {};
    const elementList = component.elements;

    if (elementList) {
      for (const element of Object.keys(elementList)) {
        const modeList = elementList[element];

        if (modeList) {
          for (const mode of Object.keys(modeList)) {
            const themeList = modeList[mode as Mode];

            if (themeList) {
              for (const theme of Object.keys(themeList)) {
                const typeBase = themeList[theme]?.base;

                if (typeBase) {
                  for (const baseStatus of Object.keys(typeBase)) {
                    const sizes = typeBase[baseStatus as Status];
                    uniqueStyle = countStyleProperties(uniqueStyle, sizes);
                  }
                }

                const typeList = themeList[theme]?.type;

                if (typeList) {
                  for (const type of Object.keys(typeList)) {
                    const variantBase = typeList[type as ElementType]?.base;
                    const variantList = typeList[type as ElementType]?.variant;

                    if (variantBase) {
                      uniqueStyle = countStyleProperties(uniqueStyle, variantBase);
                    }

                    if (variantList) {
                      for (const variant of Object.keys(variantList)) {
                        const interactionStatusList = variantList[variant as ElementVariant];

                        if (interactionStatusList) {
                          for (const interactiveStatus of Object.keys(interactionStatusList)) {
                            const sizes = interactionStatusList[interactiveStatus as Status];

                            uniqueStyle = countStyleProperties(uniqueStyle, sizes);

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
            }
          }
        }
      }
    }
  }

  function sortObjectKeys(obj: UniqueStyle): UniqueStyle {
    return Object.keys(obj)
      .sort()
      .reduce<UniqueStyle>((result, key) => {
        result[key] = obj[key];
        return result;
      }, {});
  }

  const sortedUniqueStyle = sortObjectKeys(uniqueStyle);
  console.log(JSON.stringify(sortedUniqueStyle, null, 2));
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
