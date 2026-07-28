export interface OpticalTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export interface SvgViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ROOT_SVG_PATTERN = /<svg\b[^>]*>/i;
const VIEW_BOX_ATTRIBUTE_PATTERN = /(\bviewBox\s*=\s*)(["'])([^"']*)\2/i;
const MIN_SCALE = 0.5;
const MAX_SCALE = 1.5;
const MIN_OFFSET = -0.25;
const MAX_OFFSET = 0.25;
const SVG_NUMBER_SOURCE = String.raw`[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?`;
const VIEW_BOX_VALUE_PATTERN = new RegExp(
  `^(${SVG_NUMBER_SOURCE})(?:\\s*,\\s*|\\s+)(${SVG_NUMBER_SOURCE})(?:\\s*,\\s*|\\s+)(${SVG_NUMBER_SOURCE})(?:\\s*,\\s*|\\s+)(${SVG_NUMBER_SOURCE})$`
);

function readRootSvgTag(svg: string): RegExpMatchArray {
  const root = svg.match(ROOT_SVG_PATTERN);

  if (!root) {
    throw new Error('SVG must contain an <svg> root element.');
  }

  return root;
}

function parseViewBox(rootTag: string): SvgViewBox {
  const attribute = rootTag.match(VIEW_BOX_ATTRIBUTE_PATTERN);

  if (!attribute) {
    throw new Error('SVG root must contain a valid viewBox attribute.');
  }

  const valueMatch = attribute[3].trim().match(VIEW_BOX_VALUE_PATTERN);

  if (!valueMatch) {
    throw new Error('SVG viewBox must contain four finite numbers.');
  }

  const values = valueMatch.slice(1).map((value) => Number(value));
  const [x, y, width, height] = values;

  if (width <= 0 || height <= 0) {
    throw new Error('SVG viewBox width and height must be greater than zero.');
  }

  return { x, y, width, height };
}

export function validateOpticalTransform(transform: OpticalTransform): void {
  if (
    !Number.isFinite(transform.scale) ||
    transform.scale < MIN_SCALE ||
    transform.scale > MAX_SCALE
  ) {
    throw new Error(
      `Optical scale must be a finite number from ${MIN_SCALE} through ${MAX_SCALE}.`
    );
  }

  for (const [axis, offset] of [
    ['X', transform.offsetX],
    ['Y', transform.offsetY]
  ] as const) {
    if (!Number.isFinite(offset) || offset < MIN_OFFSET || offset > MAX_OFFSET) {
      throw new Error(
        `Optical offset${axis} must be a finite number from ${MIN_OFFSET} through ${MAX_OFFSET}.`
      );
    }
  }
}

function formatNumber(value: number): string {
  const rounded = Math.abs(value) < 1e-12 ? 0 : Number(value.toFixed(12));
  return String(rounded);
}

export function readSvgViewBox(svg: string): SvgViewBox {
  return parseViewBox(readRootSvgTag(svg)[0]);
}

export function applyOpticalTransformToSvg(svg: string, transform: OpticalTransform): string {
  validateOpticalTransform(transform);

  const root = readRootSvgTag(svg);
  const viewBox = parseViewBox(root[0]);

  if (transform.scale === 1 && transform.offsetX === 0 && transform.offsetY === 0) {
    return svg;
  }

  // What: calibrate perceived size by zooming the viewport around the artwork's center.
  // Why: canonical paths, fills, and gradients must remain byte-identical across platform adapters.
  const width = viewBox.width / transform.scale;
  const height = viewBox.height / transform.scale;
  const centeredX = viewBox.x + (viewBox.width - width) / 2;
  const centeredY = viewBox.y + (viewBox.height - height) / 2;

  // Positive offsets move the artwork right/down, expressed as a fraction of the final viewport.
  const x = centeredX - transform.offsetX * width;
  const y = centeredY - transform.offsetY * height;
  const transformedValue = [x, y, width, height].map(formatNumber).join(' ');
  const transformedRoot = root[0].replace(
    VIEW_BOX_ATTRIBUTE_PATTERN,
    (_attribute, prefix: string, quote: string) => `${prefix}${quote}${transformedValue}${quote}`
  );
  const rootStart = root.index ?? 0;

  return `${svg.slice(0, rootStart)}${transformedRoot}${svg.slice(rootStart + root[0].length)}`;
}
