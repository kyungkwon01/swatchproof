import { describe, expect, it } from 'vitest';
import { contrastRatio, formatRatio, mostReadable, wcagLevel } from './contrast';
import { slugify, toCss, toTailwind } from './exportFormats';
import { hexToOklch, normalizeHex, oklchToHex } from './oklch';
import { darkTokens, generatePalette, lightTokens } from './palette';
import { DEFAULT_SETTINGS, parseSettings, toSearch } from './urlState';

/** Colors across the hue wheel, plus the difficult extremes. */
const samples = [
  '#2f6fde', '#e11d48', '#16a34a', '#f59e0b', '#7c3aed', '#0891b2', '#ffff00', '#00ffff',
  '#ff00ff', '#ff0000', '#00ff00', '#0000ff', '#ffffff', '#000000', '#808080', '#123456',
];

describe('normalizeHex', () => {
  it.each([
    ['#ABCDEF', '#abcdef'],
    ['abcdef', '#abcdef'],
    ['#abc', '#aabbcc'],
    ['  f00 ', '#ff0000'],
  ])('normalizes %s', (input, expected) => {
    expect(normalizeHex(input)).toBe(expected);
  });

  it.each(['', '#12', '#12345', 'ggg', '#1234567'])('rejects %j', (input) => {
    expect(normalizeHex(input)).toBeNull();
  });
});

describe('OKLCH conversion', () => {
  it('matches published values', () => {
    expect(hexToOklch('#ffffff').l).toBeCloseTo(1, 3);
    expect(hexToOklch('#000000').l).toBeCloseTo(0, 3);

    const red = hexToOklch('#ff0000');
    expect(red.l).toBeCloseTo(0.628, 2);
    expect(red.c).toBeCloseTo(0.258, 2);
    expect(red.h).toBeCloseTo(29.2, 0);
  });

  it.each(samples)('round-trips %s', (hex) => {
    expect(oklchToHex(hexToOklch(hex))).toBe(hex);
  });

  it('keeps the hue when reducing an out-of-gamut color', () => {
    const fitted = hexToOklch(oklchToHex({ l: 0.7, c: 0.4, h: 264 }));
    expect(fitted.h).toBeCloseTo(264, -1);
    expect(fitted.c).toBeLessThan(0.4);
  });
});

describe('contrast', () => {
  it('matches the WCAG extremes', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#777777', '#777777')).toBe(1);
  });

  it('matches a known value in either order', () => {
    expect(contrastRatio('#777777', '#ffffff')).toBeCloseTo(4.48, 2);
    expect(contrastRatio('#ffffff', '#777777')).toBeCloseTo(4.48, 2);
  });

  it.each([
    [7, 'normal', 'AAA'],
    [4.5, 'normal', 'AA'],
    [4.49, 'normal', 'Fail'],
    [4.5, 'large', 'AAA'],
    [3, 'large', 'AA'],
    [2.99, 'large', 'Fail'],
  ] as const)('rates %d for %s text as %s', (ratio, size, level) => {
    expect(wcagLevel(ratio, size)).toBe(level);
  });

  it('never rounds a failing ratio up to a passing one', () => {
    expect(formatRatio(4.499)).toBe('4.49');
  });

  it('picks the most readable candidate', () => {
    expect(mostReadable('#111111', ['#000000', '#ffffff'])).toBe('#ffffff');
  });
});

describe('generatePalette', () => {
  it.each(samples)('gets steadily darker for %s', (hex) => {
    for (const scale of [generatePalette(hex).brand, generatePalette(hex).neutral]) {
      const lightness = scale.map((swatch) => hexToOklch(swatch.hex).l);
      lightness.slice(1).forEach((value, index) => {
        expect(value).toBeLessThan(lightness[index] ?? 0);
      });
    }
  });

  it.each(samples)('keeps the exact color %s in the scale', (hex) => {
    const palette = generatePalette(hex);
    const anchor = palette.brand.find((swatch) => swatch.step === palette.anchorStep);
    expect(anchor?.hex).toBe(hex);
  });
});

describe('preview themes', () => {
  it.each(samples)('meets AA for text and buttons with %s', (hex) => {
    const palette = generatePalette(hex);
    for (const tokens of [lightTokens(palette), darkTokens(palette)]) {
      expect(contrastRatio(tokens.text, tokens.surface)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(tokens.mutedText, tokens.surface)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(tokens.fieldBorder, tokens.surface)).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(tokens.onPrimary, tokens.primary)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(tokens.link, tokens.surface)).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe('exports', () => {
  const palette = generatePalette('#2f6fde');

  it('slugifies names and falls back to brand', () => {
    expect(slugify('  My Cool Brand! ')).toBe('my-cool-brand');
    expect(slugify('***')).toBe('brand');
  });

  it('writes CSS variables', () => {
    const css = toCss('Ocean Blue', palette);
    expect(css).toMatch(/^:root \{/);
    expect(css).toContain('--ocean-blue-500:');
    expect(css).toContain('--neutral-900:');
  });

  it('writes a Tailwind theme', () => {
    const theme = toTailwind('ocean', palette);
    expect(theme).toMatch(/^@theme \{/);
    expect(theme).toContain('--color-ocean-500:');
  });
});

describe('URL state', () => {
  it('round-trips settings', () => {
    const settings = { hex: '#e11d48', name: 'rose' };
    expect(parseSettings(toSearch(settings))).toEqual(settings);
  });

  it('falls back on missing or invalid values', () => {
    expect(parseSettings('')).toEqual(DEFAULT_SETTINGS);
    expect(parseSettings('?color=nope').hex).toBe(DEFAULT_SETTINGS.hex);
  });

  it('cleans a hand-edited name', () => {
    expect(parseSettings('?name=%3Cscript%3E').name).toBe('script');
  });
});
