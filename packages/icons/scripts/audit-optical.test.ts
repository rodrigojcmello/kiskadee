import { describe, expect, it } from 'vitest';
import { auditSocialIconOptics } from './audit-optical.ts';

describe('social icon optical calibration', () => {
  it('keeps every construction and presentation safely centered', async () => {
    const entries = await auditSocialIconOptics();

    expect(entries).toHaveLength(27);

    for (const { calibrated, construction, icon, presentations, raw } of entries) {
      const constructionDefinition = icon.constructions[construction];
      const maximumDimension = Math.max(calibrated.bboxWidth, calibrated.bboxHeight);
      const rawAspectRatio = Math.max(
        raw.bboxWidth / raw.bboxHeight,
        raw.bboxHeight / raw.bboxWidth
      );
      const maximumAllowedDimension = rawAspectRatio >= 1.35 ? 0.95 : 0.92;
      const baselineName =
        'monochrome' in constructionDefinition.presentations
          ? 'monochrome'
          : constructionDefinition.defaultPresentation;
      const baseline = presentations.find((presentation) => presentation.name === baselineName);
      const entryId = `${icon.id}.${construction}`;

      expect(calibrated.clipped, entryId).toBe(false);
      expect(maximumDimension, entryId).toBeGreaterThanOrEqual(0.72);
      // Wide marks need more horizontal occupancy to remain comparable in perceived area.
      expect(maximumDimension, entryId).toBeLessThanOrEqual(maximumAllowedDimension);
      expect(calibrated.centerX, entryId).toBeGreaterThanOrEqual(0.46);
      expect(calibrated.centerX, entryId).toBeLessThanOrEqual(0.56);
      expect(calibrated.centerY, entryId).toBeGreaterThanOrEqual(0.46);
      expect(calibrated.centerY, entryId).toBeLessThanOrEqual(0.56);

      expect(
        presentations.map((presentation) => presentation.name),
        entryId
      ).toEqual(Object.keys(constructionDefinition.presentations));
      expect(baseline?.raw, entryId).toEqual(raw);
      expect(baseline?.calibrated, entryId).toEqual(calibrated);

      for (const presentation of presentations) {
        const presentationId = `${entryId}.${presentation.name}`;

        if (!presentation.raw.clipped) {
          expect(presentation.calibrated.clipped, presentationId).toBe(false);
        }

        expect(presentation.calibrated.centerX, presentationId).toBeGreaterThanOrEqual(0.46);
        expect(presentation.calibrated.centerX, presentationId).toBeLessThanOrEqual(0.56);
        expect(presentation.calibrated.centerY, presentationId).toBeGreaterThanOrEqual(0.46);
        expect(presentation.calibrated.centerY, presentationId).toBeLessThanOrEqual(0.56);
      }
    }
  });
});
