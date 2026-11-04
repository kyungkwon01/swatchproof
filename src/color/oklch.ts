export interface Oklch {
  /** Perceived lightness, 0 to 1. */
  l: number;
  /** Colorfulness, 0 and up. */
  c: number;
  /** Hue angle in degrees. */
  h: number;
}

type Rgb = [number, number, number];

/** Accepts `#abc`, `abc`, `#aabbcc`, or `aabbcc`. Returns lowercase `#aabbcc`, or null if invalid. */
export function normalizeHex(input: string): string | null {
  const value = input.trim().replace(/^#/, '').toLowerCase();
  if (/^[0-9a-f]{6}$/.test(value)) return `#${value}`;
  if (/^[0-9a-f]{3}$/.test(value)) {
    return `#${[...value].map((digit) => digit + digit).join('')}`;
  }
  return null;
}

export function hexToRgb(hex: string): Rgb {
  const value = parseInt(hex.slice(1), 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

export function rgbToHex(rgb: Rgb): string {
  const channels = rgb.map((channel) =>
    Math.round(Math.min(1, Math.max(0, channel)) * 255)
      .toString(16)
      .padStart(2, '0'),
  );
  return `#${channels.join('')}`;
}

export function srgbToLinear(channel: number): number {
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

export function linearToSrgb(channel: number): number {
  return channel <= 0.0031308 ? channel * 12.92 : 1.055 * channel ** (1 / 2.4) - 0.055;
}

// Matrices from Björn Ottosson's OKLab definition: https://bottosson.github.io/posts/oklab/
export function hexToOklch(hex: string): Oklch {
  const [r, g, b] = hexToRgb(hex).map(srgbToLinear) as Rgb;

  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const labA = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const labB = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  const hue = (Math.atan2(labB, labA) * 180) / Math.PI;
  return { l: lightness, c: Math.hypot(labA, labB), h: (hue + 360) % 360 };
}

function oklchToLinearRgb({ l: lightness, c, h }: Oklch): Rgb {
  const radians = (h * Math.PI) / 180;
  const labA = c * Math.cos(radians);
  const labB = c * Math.sin(radians);

  const l = (lightness + 0.3963377774 * labA + 0.2158037573 * labB) ** 3;
  const m = (lightness - 0.1055613458 * labA - 0.0638541728 * labB) ** 3;
  const s = (lightness - 0.0894841775 * labA - 1.291485548 * labB) ** 3;

  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

function isInGamut(rgb: Rgb): boolean {
  return rgb.every((channel) => channel >= -0.0001 && channel <= 1.0001);
}

/**
 * Converts to hex. OKLCH can describe colors a screen cannot show, so chroma is reduced until the
 * color fits. Clipping the RGB channels instead would shift the hue.
 */
export function oklchToHex(color: Oklch): string {
  let rgb = oklchToLinearRgb(color);

  if (!isInGamut(rgb)) {
    let low = 0;
    let high = color.c;
    for (let i = 0; i < 20; i += 1) {
      const middle = (low + high) / 2;
      if (isInGamut(oklchToLinearRgb({ ...color, c: middle }))) low = middle;
      else high = middle;
    }
    rgb = oklchToLinearRgb({ ...color, c: low });
  }

  return rgbToHex(rgb.map((channel) => linearToSrgb(Math.max(0, channel))) as Rgb);
}
