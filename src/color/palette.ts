import { contrastRatio } from './contrast';
import { hexToOklch, oklchToHex } from './oklch';

export const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
export type Step = (typeof STEPS)[number];

export interface Swatch {
  step: Step;
  hex: string;
}

export interface Palette {
  brand: Swatch[];
  neutral: Swatch[];
  /** The step that holds the exact color that was entered. */
  anchorStep: Step;
}

export interface ThemeTokens {
  background: string;
  surface: string;
  text: string;
  mutedText: string;
  border: string;
  fieldBorder: string;
  primary: string;
  onPrimary: string;
  link: string;
}

const LIGHTNESS = [0.97, 0.93, 0.87, 0.79, 0.7, 0.61, 0.52, 0.44, 0.33, 0.23];

/** Very light and very dark colors look garish at full chroma, so it tapers at both ends. */
const CHROMA_SCALE = [0.12, 0.25, 0.5, 0.75, 0.92, 1, 1, 0.9, 0.72, 0.55];

const NEUTRAL_CHROMA = 0.012;
const AA = 4.5;

export function generatePalette(hex: string): Palette {
  const source = hexToOklch(hex);

  let anchorIndex = 0;
  LIGHTNESS.forEach((lightness, index) => {
    const best = LIGHTNESS[anchorIndex] ?? 0;
    if (Math.abs(lightness - source.l) < Math.abs(best - source.l)) anchorIndex = index;
  });

  const brand = STEPS.map((step, index) => ({
    step,
    hex:
      index === anchorIndex
        ? hex
        : oklchToHex({
            l: LIGHTNESS[index] ?? 0,
            c: source.c * (CHROMA_SCALE[index] ?? 1),
            h: source.h,
          }),
  }));

  const neutral = STEPS.map((step, index) => ({
    step,
    hex: oklchToHex({
      l: LIGHTNESS[index] ?? 0,
      c: Math.min(source.c, NEUTRAL_CHROMA),
      h: source.h,
    }),
  }));

  return { brand, neutral, anchorStep: STEPS[anchorIndex] ?? 500 };
}

function pick(swatches: Swatch[], step: Step): string {
  return swatches.find((swatch) => swatch.step === step)?.hex ?? '#000000';
}

/** Chooses the first listed step that reaches AA against `other`, or the last one if none does. */
function firstPassing(swatches: Swatch[], steps: Step[], other: string): string {
  const passing = steps.find((step) => contrastRatio(pick(swatches, step), other) >= AA);
  return pick(swatches, passing ?? steps[steps.length - 1] ?? 500);
}

export function lightTokens({ brand, neutral }: Palette): ThemeTokens {
  const surface = '#ffffff';
  const primary = firstPassing(brand, [500, 600, 700, 800, 900], surface);
  return {
    background: pick(neutral, 50),
    surface,
    text: pick(neutral, 900),
    mutedText: pick(neutral, 700),
    border: pick(neutral, 200),
    fieldBorder: pick(neutral, 500),
    primary,
    onPrimary: surface,
    link: primary,
  };
}

export function darkTokens({ brand, neutral }: Palette): ThemeTokens {
  const background = pick(neutral, 900);
  const surface = pick(neutral, 800);
  const onPrimary = pick(brand, 900);
  return {
    background,
    surface,
    text: pick(neutral, 50),
    mutedText: pick(neutral, 200),
    border: pick(neutral, 700),
    fieldBorder: pick(neutral, 400),
    primary: firstPassing(brand, [400, 300, 200, 100, 50], onPrimary),
    onPrimary,
    link: firstPassing(brand, [400, 300, 200, 100, 50], surface),
  };
}
