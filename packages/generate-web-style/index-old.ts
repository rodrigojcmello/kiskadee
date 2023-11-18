import type { PluginOption } from 'vite';

const cssFileName = 'kiskadee';

export default function myPlugin(): PluginOption {
  return {
    name: 'meu-plugin',
    // buildStart(): void {
    //   const cssContent = `
    //     .minha-classe {
    //       background-color: red;
    //       color: white;
    //     }
    //   `;
    //
    //   // const cssFilePath = path.resolve(__dirname, 'kiskadee.css');
    //
    //   fs.writeFileSync(cssFileName, cssContent);
    // },
    resolveId(id) {
      if (id === `/${cssFileName}`) {
        return `virtual:${cssFileName}`;
      }
    },
    load(id) {
      if (id === `virtual:${cssFileName}`) {
        return `body { background: red; }`; // Conteúdo CSS virtual
      }
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
