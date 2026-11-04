import type { Palette, Swatch } from './palette';

export function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'brand';
}

function variables(prefix: string, swatches: Swatch[]): string[] {
  return swatches.map(({ step, hex }) => `  --${prefix}-${step}: ${hex};`);
}

export function toCss(name: string, palette: Palette): string {
  const brand = variables(slugify(name), palette.brand);
  const neutral = variables('neutral', palette.neutral);
  return [':root {', ...brand, '', ...neutral, '}'].join('\n');
}

export function toTailwind(name: string, palette: Palette): string {
  const brand = variables(`color-${slugify(name)}`, palette.brand);
  const neutral = variables('color-neutral', palette.neutral);
  return ['@theme {', ...brand, '', ...neutral, '}'].join('\n');
}
