/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument */
import fs from 'node:fs';
import type { KiskadeeTheme, ComponentName } from '@kiskadee/react';

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

  const cssContent = `
    .minha-classe {
      background-color: red;
      color: white;
    }
  `;

  for (const componentName of Object.keys(schema.component ?? {})) {
    const component = schema.component?.[componentName as ComponentName] ?? {};
    const elements = component?.elements ?? {};

    for (const element of Object.keys(elements)) {
      // @ts-expect-error
      const modes = elements[element] ?? {};
      for (const modeName of Object.keys(modes)) {
        const themes = modes[modeName] ?? {};
        for (const themeName of Object.keys(themes)) {
          const types = themes[themeName] ?? {};
          for (const typeName of Object.keys(types)) {
            const variants = types[typeName].variant ?? {};
            for (const variantName of Object.keys(variants)) {
              const interactionStatuses = variants[variantName] ?? {};
              for (const interactiveStatus of Object.keys(
                interactionStatuses,
              )) {
                const sizes = interactionStatuses[interactiveStatus] ?? {};
                for (const sizeName of Object.keys(sizes)) {
                  const properties = sizes[sizeName] ?? {};
                  for (const propertyName of Object.keys(properties)) {
                    const propertyValue = properties[propertyName];
                    const x = types;
                    console.log(
                      '### HELLO64',
                      {
                        componentName,
                        modes,
                        modeName,
                        themes,
                        themeName,
                        types,
                        typeName,
                        variants,
                        variantName,
                        interactionStatuses,
                        interactiveStatus,
                        sizes,
                        sizeName,
                        properties,
                        propertyName,
                        propertyValue,
                      },
                      { x },
                    );
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  // schema.component?.button?.elements?.container?.dark?.default?.type?.contained
  //   ?.base?.md?.borderColor = 'red';

  // const cssFilePath = path.resolve(__dirname, 'kiskadee.css');

  fs.writeFileSync('kiskadee.css', cssContent);
} catch (error) {
  console.error('Erro ao ler o arquivo ou fazer o parsing do JSON:', error);
}
