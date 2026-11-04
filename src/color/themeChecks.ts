import { contrastRatio, type TextSize } from './contrast';
import type { ThemeTokens } from './palette';
import { simulateVision, type VisionType } from './vision';

export const VISION_TYPES: VisionType[] = [
  'protanopia',
  'deuteranopia',
  'tritanopia',
  'achromatopsia',
];

export interface ThemeCheck {
  label: string;
  foreground: string;
  background: string;
  /** `large` also covers interface parts, because WCAG 1.4.11 asks them for the same 3:1. */
  size: TextSize;
}

export interface VisionResult {
  type: VisionType;
  ratio: number;
  passes: boolean;
}

export interface VisionReportRow {
  theme: string;
  label: string;
  minimum: number;
  results: VisionResult[];
}

export function themeChecks(tokens: ThemeTokens): ThemeCheck[] {
  const { text, mutedText, link, onPrimary, primary, fieldBorder, surface } = tokens;
  return [
    { label: 'Body text', foreground: text, background: surface, size: 'normal' },
    { label: 'Muted text', foreground: mutedText, background: surface, size: 'normal' },
    { label: 'Link', foreground: link, background: surface, size: 'normal' },
    { label: 'Button label', foreground: onPrimary, background: primary, size: 'normal' },
    { label: 'Button shape', foreground: primary, background: surface, size: 'large' },
    { label: 'Field border', foreground: fieldBorder, background: surface, size: 'large' },
  ];
}

function reportRows(theme: string, tokens: ThemeTokens): VisionReportRow[] {
  return themeChecks(tokens).map(({ label, foreground, background, size }) => {
    const minimum = size === 'normal' ? 4.5 : 3;
    return {
      theme,
      label,
      minimum,
      results: VISION_TYPES.map((type) => {
        const ratio = contrastRatio(
          simulateVision(foreground, type),
          simulateVision(background, type),
        );
        return { type, ratio, passes: ratio >= minimum };
      }),
    };
  });
}

/** Rechecks each pairing as it appears to people with each type of color blindness. */
export function buildVisionReport(light: ThemeTokens, dark: ThemeTokens): VisionReportRow[] {
  return [...reportRows('Light', light), ...reportRows('Dark', dark)];
}
