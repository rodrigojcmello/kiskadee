import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';
import type { IconManifest, IconMetadata } from './generate-react.ts';
import { applyOpticalTransformToSvg } from './icon-optical.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const assetsDir = path.resolve(packageRoot, 'assets');
const manifestPath = path.resolve(packageRoot, 'metadata/icons.json');
const RASTER_SIZE = 1000;
const ALPHA_THRESHOLD = 0.01;

export interface OpticalMetrics {
  alphaArea: number;
  bboxHeight: number;
  bboxWidth: number;
  centerX: number;
  centerY: number;
  clipped: boolean;
}

export interface OpticalAuditEntry {
  calibrated: OpticalMetrics;
  icon: IconMetadata;
  presentations: OpticalPresentationAuditEntry[];
  raw: OpticalMetrics;
}

export interface OpticalPresentationAuditEntry {
  calibrated: OpticalMetrics;
  name: string;
  raw: OpticalMetrics;
}

function percentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function withRasterDimensions(svg: string): string {
  return svg.replace(/<svg\b/, `<svg width="${RASTER_SIZE}" height="${RASTER_SIZE}"`);
}

/**
 * What
 *     Measures visible bounds, alpha coverage, and center of mass for one SVG.
 * Why
 *     Geometry provides repeatable calibration evidence without pretending to replace visual review.
 */
export async function measureOpticalMetrics(svg: string): Promise<OpticalMetrics> {
  const rasterSource = withRasterDimensions(svg).replaceAll('currentColor', '#000000');
  const { data, info } = await sharp(Buffer.from(rasterSource))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let minX = info.width;
  let minY = info.height;
  let maxX = -1;
  let maxY = -1;
  let alphaSum = 0;
  let weightedX = 0;
  let weightedY = 0;

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const alpha = data[(y * info.width + x) * info.channels + 3] / 255;

      if (alpha > ALPHA_THRESHOLD) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }

      alphaSum += alpha;
      weightedX += x * alpha;
      weightedY += y * alpha;
    }
  }

  if (maxX < minX || maxY < minY || alphaSum === 0) {
    throw new Error('SVG optical audit found no visible artwork.');
  }

  const bboxWidthPixels = maxX - minX + 1;
  const bboxHeightPixels = maxY - minY + 1;

  return {
    alphaArea: alphaSum / (info.width * info.height),
    bboxHeight: bboxHeightPixels / info.height,
    bboxWidth: bboxWidthPixels / info.width,
    centerX: weightedX / alphaSum / info.width,
    centerY: weightedY / alphaSum / info.height,
    clipped: minX === 0 || minY === 0 || maxX === info.width - 1 || maxY === info.height - 1
  };
}

/**
 * What
 *     Audits raw and calibrated artwork for every presentation of every social icon.
 * Why
 *     Monochrome remains the comparable weight baseline, while every presentation needs its own
 *     centering and clipping evidence.
 */
export async function auditSocialIconOptics(): Promise<OpticalAuditEntry[]> {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as IconManifest;
  const socialIcons = manifest.icons.filter((icon) => icon.family === 'social');

  return Promise.all(
    socialIcons.map(async (icon) => {
      const monochrome = icon.presentations.monochrome;
      const opticalTransform = icon.opticalTransform;
      if (!monochrome || !opticalTransform) {
        throw new Error(`${icon.id} is missing monochrome artwork or optical calibration.`);
      }

      const presentations = await Promise.all(
        Object.entries(icon.presentations).map(
          async ([name, presentation]): Promise<OpticalPresentationAuditEntry> => {
            const sourceSvg = await readFile(path.resolve(assetsDir, presentation.source), 'utf8');
            const calibratedSvg = applyOpticalTransformToSvg(sourceSvg, opticalTransform);

            return {
              calibrated: await measureOpticalMetrics(calibratedSvg),
              name,
              raw: await measureOpticalMetrics(sourceSvg)
            };
          }
        )
      );
      const monochromeAudit = presentations.find(
        (presentation) => presentation.name === 'monochrome'
      );

      if (!monochromeAudit) {
        throw new Error(`${icon.id} is missing its monochrome optical audit.`);
      }

      return {
        calibrated: monochromeAudit.calibrated,
        icon,
        presentations,
        raw: monochromeAudit.raw
      };
    })
  );
}

function printAudit(entries: OpticalAuditEntry[]): void {
  console.log(
    '| Icon | Scale | Offset | Raw bbox | Calibrated bbox | Calibrated area | Center | Clipped |'
  );
  console.log('| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |');

  for (const { calibrated, icon, raw } of entries) {
    const transform = icon.opticalTransform;
    if (!transform) continue;

    console.log(
      `| ${icon.id} | ${transform.scale.toFixed(2)} | ` +
        `${transform.offsetX.toFixed(2)}, ${transform.offsetY.toFixed(2)} | ` +
        `${percentage(raw.bboxWidth)} × ${percentage(raw.bboxHeight)} | ` +
        `${percentage(calibrated.bboxWidth)} × ${percentage(calibrated.bboxHeight)} | ` +
        `${percentage(calibrated.alphaArea)} | ` +
        `${percentage(calibrated.centerX)}, ${percentage(calibrated.centerY)} | ` +
        `${calibrated.clipped ? 'yes' : 'no'} |`
    );
  }

  console.log('');
  console.log('| Icon | Presentation | Raw edge contact | Calibrated edge contact | Center |');
  console.log('| --- | --- | --- | --- | ---: |');

  for (const { icon, presentations } of entries) {
    for (const { calibrated, name, raw } of presentations) {
      console.log(
        `| ${icon.id} | ${name} | ${raw.clipped ? 'yes' : 'no'} | ` +
          `${calibrated.clipped ? 'yes' : 'no'} | ` +
          `${percentage(calibrated.centerX)}, ${percentage(calibrated.centerY)} |`
      );
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  auditSocialIconOptics()
    .then((entries) => {
      printAudit(entries);

      const newlyClipped = entries.flatMap(({ icon, presentations }) =>
        presentations
          .filter(({ calibrated, raw }) => !raw.clipped && calibrated.clipped)
          .map(({ name }) => `${icon.id}.${name}`)
      );
      if (newlyClipped.length > 0) {
        throw new Error(
          `Optical calibration introduces edge clipping: ${newlyClipped.join(', ')}.`
        );
      }
    })
    .catch((error) => {
      console.error('[icons] Optical audit failed:', error);
      process.exitCode = 1;
    });
}
