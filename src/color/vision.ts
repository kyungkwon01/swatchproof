import { hexToRgb, linearToSrgb, rgbToHex, srgbToLinear } from './oklch';

export type VisionType = 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';
export type VisionMode = 'typical' | VisionType;

export const VISION_MODES: { id: VisionMode; label: string; description: string }[] = [
  { id: 'typical', label: 'Typical', description: 'Colors as entered.' },
  { id: 'protanopia', label: 'Protanopia', description: 'No red cones. Reds look darker and merge with greens.' },
  { id: 'deuteranopia', label: 'Deuteranopia', description: 'No green cones. Reds and greens are hard to tell apart.' },
  { id: 'tritanopia', label: 'Tritanopia', description: 'No blue cones. Blues and greens are hard to tell apart.' },
  { id: 'achromatopsia', label: 'Achromatopsia', description: 'No color vision. Only lightness differences remain.' },
];

type Row = [number, number, number];
type Matrix = [Row, Row, Row];

/**
 * Severity 1.0 matrices from Machado, Oliveira, and Fernandes (2009), "A Physiologically-based
 * Model for Simulation of Color Vision Deficiency". They apply to linear RGB, not sRGB values.
 */
const MATRICES: Record<Exclude<VisionType, 'achromatopsia'>, Matrix> = {
  protanopia: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deuteranopia: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  tritanopia: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
};

/** Rec. 709 luminance weights, the same ones WCAG uses. */
const LUMINANCE: Row = [0.2126, 0.7152, 0.0722];

const ACHROMATOPSIA: Matrix = [LUMINANCE, LUMINANCE, LUMINANCE];

/** Estimates how a color appears with a given color vision deficiency. */
export function simulateVision(hex: string, type: VisionType): string {
  const matrix = type === 'achromatopsia' ? ACHROMATOPSIA : MATRICES[type];
  const [r, g, b] = hexToRgb(hex).map(srgbToLinear) as Row;

  const simulated = matrix.map(([red, green, blue]) => {
    const channel = red * r + green * g + blue * b;
    return linearToSrgb(Math.min(1, Math.max(0, channel)));
  }) as Row;

  return rgbToHex(simulated);
}

/** Returns the color to paint on screen for a mode. */
export function displayColor(hex: string, mode: VisionMode): string {
  return mode === 'typical' ? hex : simulateVision(hex, mode);
}
