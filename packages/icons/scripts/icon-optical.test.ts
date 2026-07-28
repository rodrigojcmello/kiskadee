import { describe, expect, it } from 'vitest';
import {
  applyOpticalTransformToSvg,
  type OpticalTransform,
  readSvgViewBox
} from './icon-optical.ts';

const SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#123456" d="M1 2h3"/><circle fill="currentColor" cx="4" cy="5" r="2"/></svg>';

describe('readSvgViewBox', () => {
  it('reads finite dimensions from the root SVG viewBox', () => {
    expect(readSvgViewBox('<svg viewBox="-2.5, 3, 40.5, 20"></svg>')).toEqual({
      x: -2.5,
      y: 3,
      width: 40.5,
      height: 20
    });
  });

  it.each([
    ['a missing root', '<path d="M0 0"/>'],
    ['a missing root viewBox', '<svg><svg viewBox="0 0 24 24"></svg></svg>'],
    ['too few values', '<svg viewBox="0 0 24"></svg>'],
    ['invalid SVG number syntax', '<svg viewBox="0 0 0x18 24"></svg>'],
    ['duplicate comma separators', '<svg viewBox="0,,0,,24,,24"></svg>'],
    ['a non-finite value', '<svg viewBox="0 0 Infinity 24"></svg>'],
    ['a zero width', '<svg viewBox="0 0 0 24"></svg>'],
    ['a negative height', '<svg viewBox="0 0 24 -1"></svg>']
  ])('rejects %s', (_case, svg) => {
    expect(() => readSvgViewBox(svg)).toThrow();
  });
});

describe('applyOpticalTransformToSvg', () => {
  it('zooms in when scale is greater than one', () => {
    const result = applyOpticalTransformToSvg(SVG, {
      scale: 1.2,
      offsetX: 0,
      offsetY: 0
    });

    expect(readSvgViewBox(result)).toEqual({ x: 2, y: 2, width: 20, height: 20 });
  });

  it('zooms out when scale is less than one', () => {
    const result = applyOpticalTransformToSvg(SVG, {
      scale: 0.8,
      offsetX: 0,
      offsetY: 0
    });

    expect(readSvgViewBox(result)).toEqual({ x: -3, y: -3, width: 30, height: 30 });
  });

  it('moves artwork right and down with positive final-box-relative offsets', () => {
    const result = applyOpticalTransformToSvg(SVG, {
      scale: 1.2,
      offsetX: 0.1,
      offsetY: 0.2
    });

    expect(readSvgViewBox(result)).toEqual({ x: 0, y: -2, width: 20, height: 20 });
  });

  it('changes only the root viewBox and preserves icon artwork', () => {
    const result = applyOpticalTransformToSvg(SVG, {
      scale: 1.2,
      offsetX: 0,
      offsetY: 0
    });

    expect(result).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="2 2 20 20"><path fill="#123456" d="M1 2h3"/><circle fill="currentColor" cx="4" cy="5" r="2"/></svg>'
    );
  });

  it('returns the original SVG byte-for-byte for an identity transform', () => {
    const svg = `<svg viewBox = '0,0,24,24'>\n  <path fill="red" d="M0 0"/>\n</svg>`;

    expect(
      applyOpticalTransformToSvg(svg, {
        scale: 1,
        offsetX: 0,
        offsetY: 0
      })
    ).toBe(svg);
  });

  it.each([
    [{ scale: Number.NaN, offsetX: 0, offsetY: 0 }, 'non-finite scale'],
    [{ scale: 0.49, offsetX: 0, offsetY: 0 }, 'scale below the minimum'],
    [{ scale: 1.51, offsetX: 0, offsetY: 0 }, 'scale above the maximum'],
    [{ scale: 1, offsetX: Number.POSITIVE_INFINITY, offsetY: 0 }, 'non-finite offset'],
    [{ scale: 1, offsetX: -0.251, offsetY: 0 }, 'X offset below the minimum'],
    [{ scale: 1, offsetX: 0, offsetY: 0.251 }, 'Y offset above the maximum']
  ] satisfies Array<[OpticalTransform, string]>)('rejects %s (%s)', (transform) => {
    expect(() => applyOpticalTransformToSvg(SVG, transform)).toThrow();
  });

  it.each([
    { scale: 0.5, offsetX: -0.25, offsetY: 0.25 },
    { scale: 1.5, offsetX: 0.25, offsetY: -0.25 }
  ] satisfies OpticalTransform[])('accepts inclusive transform boundaries: %o', (transform) => {
    expect(() => applyOpticalTransformToSvg(SVG, transform)).not.toThrow();
  });
});
