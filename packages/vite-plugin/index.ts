import fs from 'node:fs';
import type { PluginOption } from 'vite';

const cssFileName = 'kiskadee.css';

export default function myPlugin(): PluginOption {
  return {
    name: 'meu-plugin',
    buildStart(): void {
      const cssContent = `
        .minha-classe {
          background-color: red;
          color: white;
        }
      `;

      // const cssFilePath = path.resolve(__dirname, 'kiskadee.css');

      fs.writeFileSync(cssFileName, cssContent);
    },
    transformIndexHtml() {
      return [
        {
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: `/${cssFileName}`,
          },
        },
      ];
    },
  };
}
