import { describe, expect, it } from 'vitest';
import { hexToOklch } from './oklch';
import { simulateVision, type VisionType } from './vision';

const types: VisionType[] = ['protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia'];

function toLab(hex: string) {
  const { l, c, h } = hexToOklch(hex);
  const radians = (h * Math.PI) / 180;
  return [l, c * Math.cos(radians), c * Math.sin(radians)] as const;
}

/** Straight-line distance in OKLab, where a larger number means a more visible difference. */
function perceivedDistance(first: string, second: string): number {
  const [l1, a1, b1] = toLab(first);
  const [l2, a2, b2] = toLab(second);
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
}

/** The same distance with lightness ignored, so it measures only the difference in hue. */
function hueDistance(first: string, second: string): number {
  const [, a1, b1] = toLab(first);
  const [, a2, b2] = toLab(second);
  return Math.hypot(a1 - a2, b1 - b2);
}

describe('simulateVision', () => {
  it.each(types)('leaves black, white, and gray unchanged for %s', (type) => {
    for (const hex of ['#000000', '#ffffff', '#808080']) {
      const distance = perceivedDistance(simulateVision(hex, type), hex);
      expect(distance).toBeLessThan(0.01);
    }
  });

  it.each(types)('always returns a valid hex color for %s', (type) => {
    for (const hex of ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff']) {
      expect(simulateVision(hex, type)).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it.each(['protanopia', 'deuteranopia'] as const)('merges red and green hues for %s', (type) => {
    const normal = hueDistance('#d62828', '#2a9d3f');
    const simulated = hueDistance(
      simulateVision('#d62828', type),
      simulateVision('#2a9d3f', type),
    );
    expect(simulated).toBeLessThan(normal / 2);
  });

  it('brings blue and green closer for tritanopia', () => {
    const normal = perceivedDistance('#2563eb', '#10b981');
    const simulated = perceivedDistance(
      simulateVision('#2563eb', 'tritanopia'),
      simulateVision('#10b981', 'tritanopia'),
    );
    expect(simulated).toBeLessThan(normal);
  });

  it('removes all color for achromatopsia', () => {
    const simulated = simulateVision('#e11d48', 'achromatopsia');
    expect(simulated.slice(1, 3)).toBe(simulated.slice(3, 5));
    expect(simulated.slice(3, 5)).toBe(simulated.slice(5, 7));
  });
});
