import { useState } from 'react';
import { contrastRatio, formatRatio, wcagLevel, type TextSize } from '../color/contrast';
import type { Swatch } from '../color/palette';

interface ContrastGridProps {
  swatches: Swatch[];
  name: string;
}

export function ContrastGrid({ swatches, name }: ContrastGridProps) {
  const [size, setSize] = useState<TextSize>('normal');

  const pairs = swatches.flatMap((text) =>
    swatches.filter((background) => background !== text).map((background) => [text, background]),
  );
  const passing = pairs.filter(
    ([text, background]) =>
      wcagLevel(contrastRatio(text?.hex ?? '', background?.hex ?? ''), size) !== 'Fail',
  ).length;

  return (
    <section className="panel" aria-labelledby="contrast-heading">
      <div className="panel__header panel__header--split">
        <div>
          <h2 id="contrast-heading">Contrast check</h2>
          <p>
            {passing} of {pairs.length} combinations pass AA for {size} text.
          </p>
        </div>
        <div className="toggle" role="group" aria-label="Text size">
          {(['normal', 'large'] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={size === option}
              onClick={() => setSize(option)}
            >
              {option === 'normal' ? 'Normal text' : 'Large text'}
            </button>
          ))}
        </div>
      </div>

      <div
        className="grid-scroll"
        role="region"
        aria-label="Contrast table, scrollable"
        tabIndex={0}
      >
        <table className="grid">
          <caption className="visually-hidden">
            Contrast of {name} text steps, in rows, on {name} background steps, in columns
          </caption>
          <thead>
            <tr>
              <th scope="col" className="grid__corner">
                Text ↓ / Background →
              </th>
              {swatches.map((swatch) => (
                <th key={swatch.step} scope="col">
                  {swatch.step}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {swatches.map((text) => (
              <tr key={text.step}>
                <th scope="row">{text.step}</th>
                {swatches.map((background) => {
                  if (background === text) {
                    return (
                      <td key={background.step} className="grid__same">
                        <span className="visually-hidden">Same color</span>
                      </td>
                    );
                  }
                  const ratio = contrastRatio(text.hex, background.hex);
                  const level = wcagLevel(ratio, size);
                  return (
                    <td
                      key={background.step}
                      className="grid__cell"
                      style={{ background: background.hex, color: text.hex }}
                    >
                      <span className="grid__sample" aria-hidden="true">
                        Aa
                      </span>
                      <span className={level === 'Fail' ? 'grid__result grid__result--fail' : 'grid__result'}>
                        {formatRatio(ratio)} {level}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
