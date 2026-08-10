import { describe, expect, it } from 'vitest';
import { resolveTypographyProfileBucket, typographyProfileBuckets } from './typography.ts';

describe('typography profile buckets', () => {
  it('keeps the normalized profile vocabulary compact and collision-free', () => {
    const buckets = Object.values(typographyProfileBuckets);

    expect(Object.keys(typographyProfileBuckets)).toHaveLength(28);
    expect(new Set(buckets).size).toBe(buckets.length);
    expect(typographyProfileBuckets).toMatchInlineSnapshot(`
      {
        "body-extra-small": "bxs",
        "body-extra-small-strong": "bxsg",
        "body-large": "bl",
        "body-large-strong": "blg",
        "body-medium": "bm",
        "body-medium-strong": "bmg",
        "body-small": "bs",
        "body-small-strong": "bsg",
        "caption-medium": "cm",
        "caption-medium-strong": "cmg",
        "caption-small": "cs",
        "caption-small-strong": "csg",
        "display-large": "dl",
        "display-small": "ds",
        "heading-large": "hl",
        "heading-medium": "hm",
        "heading-small": "hs",
        "label-display-large": "ldl",
        "label-display-small": "lds",
        "label-extra-large": "lxl",
        "label-large": "ll",
        "label-medium": "lm",
        "label-small": "ls",
        "label-small-strong": "lsg",
        "subtitle-large": "sl",
        "subtitle-small": "ss",
        "tooltip-medium": "tm",
        "tooltip-small": "ts",
      }
    `);
  });

  it('resolves normalized IDs and deterministic custom fallbacks', () => {
    expect(resolveTypographyProfileBucket('body-medium')).toBe('bm');
    expect(resolveTypographyProfileBucket('acme-invoice-label')).toBe('x-acme-invoice-label');
  });
});
