import { hexToRgb, srgbToLinear } from './oklch';

export type TextSize = 'normal' | 'large';
export type WcagLevel = 'AAA' | 'AA' | 'Fail';

function relativeLuminance(hex: string): number {
  const [r = 0, g = 0, b = 0] = hexToRgb(hex).map(srgbToLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio, from 1 (identical) to 21 (black on white). */
export function contrastRatio(first: string, second: string): number {
  const a = relativeLuminance(first);
  const b = relativeLuminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export function wcagLevel(ratio: number, size: TextSize = 'normal'): WcagLevel {
  const [aa, aaa] = size === 'normal' ? [4.5, 7] : [3, 4.5];
  if (ratio >= aaa) return 'AAA';
  if (ratio >= aa) return 'AA';
  return 'Fail';
}

/** Rounds down, so 4.499 shows as 4.49 rather than a passing-looking 4.50. */
export function formatRatio(ratio: number): string {
  return (Math.floor(ratio * 100) / 100).toFixed(2);
}

export function mostReadable(background: string, candidates: string[]): string {
  return candidates.reduce((best, candidate) =>
    contrastRatio(candidate, background) > contrastRatio(best, background) ? candidate : best,
  );
}
