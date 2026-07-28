import { describe, expect, it } from 'vitest';
import { auditSocialIconOptics } from './audit-optical.ts';

describe('social icon optical calibration', () => {
  it('keeps monochrome weights comparable and every presentation safely centered', async () => {
    const entries = await auditSocialIconOptics();

    expect(entries).toHaveLength(25);

    for (const { calibrated, icon, presentations, raw } of entries) {
      const maximumDimension = Math.max(calibrated.bboxWidth, calibrated.bboxHeight);
      const rawAspectRatio = Math.max(
        raw.bboxWidth / raw.bboxHeight,
        raw.bboxHeight / raw.bboxWidth
      );
      const maximumAllowedDimension = rawAspectRatio >= 1.35 ? 0.95 : 0.92;
      const monochrome = presentations.find((presentation) => presentation.name === 'monochrome');

      expect(calibrated.clipped, icon.id).toBe(false);
      expect(maximumDimension, icon.id).toBeGreaterThanOrEqual(0.72);
      // Wide marks need more horizontal occupancy to remain comparable in perceived area.
      expect(maximumDimension, icon.id).toBeLessThanOrEqual(maximumAllowedDimension);
      expect(calibrated.centerX, icon.id).toBeGreaterThanOrEqual(0.46);
      expect(calibrated.centerX, icon.id).toBeLessThanOrEqual(0.56);
      expect(calibrated.centerY, icon.id).toBeGreaterThanOrEqual(0.46);
      expect(calibrated.centerY, icon.id).toBeLessThanOrEqual(0.56);

      expect(
        presentations.map((presentation) => presentation.name),
        icon.id
      ).toEqual(Object.keys(icon.presentations));
      expect(monochrome?.raw, icon.id).toEqual(raw);
      expect(monochrome?.calibrated, icon.id).toEqual(calibrated);

      for (const presentation of presentations) {
        const presentationId = `${icon.id}.${presentation.name}`;

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
