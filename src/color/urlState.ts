import { slugify } from './exportFormats';
import { normalizeHex } from './oklch';

export interface PaletteSettings {
  hex: string;
  name: string;
}

export const DEFAULT_SETTINGS: PaletteSettings = { hex: '#2f6fde', name: 'brand' };

export function parseSettings(search: string): PaletteSettings {
  const params = new URLSearchParams(search);
  const name = params.get('name');
  return {
    hex: normalizeHex(params.get('color') ?? '') ?? DEFAULT_SETTINGS.hex,
    name: name ? slugify(name) : DEFAULT_SETTINGS.name,
  };
}

export function toSearch({ hex, name }: PaletteSettings): string {
  const params = new URLSearchParams({ color: hex.slice(1), name: slugify(name) });
  return `?${params}`;
}
