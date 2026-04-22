import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import postcss, {
  type AcceptedPlugin,
  type LazyResult,
  type ProcessOptions,
  type Processor
} from 'postcss';
import combineMediaQueries from 'postcss-combine-media-query';

export type KiskadeePostcssOptions = {
  autoprefix?: boolean;
  combineMediaQueries?: boolean;
  minify?: boolean;
};

type CssnanoOptions = NonNullable<Parameters<typeof cssnano>[0]>;

export const cssnanoOptions = {
  preset: [
    'default',
    {
      discardComments: {
        removeAll: true
      }
    }
  ]
} satisfies CssnanoOptions;

export function createKiskadeePostcssPlugins(
  options: KiskadeePostcssOptions = {}
): AcceptedPlugin[] {
  const plugins: AcceptedPlugin[] = [];

  if (options.autoprefix) {
    plugins.push(autoprefixer());
  }

  if (options.combineMediaQueries) {
    plugins.push(combineMediaQueries());
  }

  if (options.minify) {
    plugins.push(cssnano(cssnanoOptions));
  }

  return plugins;
}

export function createKiskadeePostcssProcessor(options: KiskadeePostcssOptions = {}): Processor {
  return postcss(createKiskadeePostcssPlugins(options));
}

export function processKiskadeeCss(
  css: string,
  options: KiskadeePostcssOptions = {},
  processOptions: ProcessOptions = {}
): LazyResult {
  return createKiskadeePostcssProcessor(options).process(css, {
    from: undefined,
    map: false,
    ...processOptions
  });
}

export async function minifyCss(css: string, processOptions: ProcessOptions = {}): Promise<string> {
  const result = await processKiskadeeCss(
    css,
    {
      autoprefix: true,
      minify: true
    },
    processOptions
  );

  return result.css.trim();
}
