import { describe, expect, it } from 'vitest';
import { contrastRatio } from './contrast';
import { darkTokens, generatePalette, lightTokens } from './palette';
import { buildVisionReport, themeChecks, VISION_TYPES } from './themeChecks';

function reportFor(hex: string) {
  const palette = generatePalette(hex);
  return buildVisionReport(lightTokens(palette), darkTokens(palette));
}

describe('themeChecks', () => {
  it.each(['#2f6fde', '#e11d48', '#f59e0b', '#ffffff', '#000000'])(
    'meets each minimum with the real colors of %s',
    (hex) => {
      const palette = generatePalette(hex);
      for (const tokens of [lightTokens(palette), darkTokens(palette)]) {
        for (const { foreground, background, size } of themeChecks(tokens)) {
          const minimum = size === 'normal' ? 4.5 : 3;
          expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(minimum);
        }
      }
    },
  );
});

describe('buildVisionReport', () => {
  it('checks every pairing in both themes for every vision type', () => {
    const report = reportFor('#2f6fde');
    expect(report).toHaveLength(12);
    for (const row of report) {
      expect(row.results.map((result) => result.type)).toEqual(VISION_TYPES);
    }
  });

  it('keeps contrast almost unchanged for achromatopsia, which preserves luminance', () => {
    const palette = generatePalette('#e11d48');
    const light = lightTokens(palette);
    const report = buildVisionReport(light, darkTokens(palette));
    const row = report.find((entry) => entry.label === 'Link' && entry.theme === 'Light');
    const result = row?.results.find(({ type }) => type === 'achromatopsia');

    expect(result?.ratio).toBeCloseTo(contrastRatio(light.link, light.surface), 0);
  });

  it('flags a red button label for deuteranopia even though the real colors pass', () => {
    const row = reportFor('#e11d48').find(
      (entry) => entry.label === 'Button label' && entry.theme === 'Light',
    );
    const result = row?.results.find(({ type }) => type === 'deuteranopia');

    expect(result?.passes).toBe(false);
  });

  it('marks results against the row minimum', () => {
    for (const row of reportFor('#15803d')) {
      for (const { ratio, passes } of row.results) {
        expect(passes).toBe(ratio >= row.minimum);
      }
    }
  });
});
