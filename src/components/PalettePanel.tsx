import { mostReadable } from '../color/contrast';
import type { Palette, Step, Swatch } from '../color/palette';

interface ScaleProps {
  title: string;
  swatches: Swatch[];
  anchorStep?: Step;
  onCopy: (hex: string) => void;
}

function Scale({ title, swatches, anchorStep, onCopy }: ScaleProps) {
  return (
    <div>
      <h3 className="scale__title">{title}</h3>
      <ul className="scale">
        {swatches.map(({ step, hex }) => {
          const isAnchor = step === anchorStep;
          return (
            <li key={step}>
              <button
                type="button"
                className="swatch"
                style={{ background: hex, color: mostReadable(hex, ['#000000', '#ffffff']) }}
                aria-label={`Copy ${title} ${step}, ${hex}${isAnchor ? ', your color' : ''}`}
                onClick={() => onCopy(hex)}
              >
                <span className="swatch__step">
                  {step}
                  {isAnchor ? <span className="swatch__mark"> ●</span> : null}
                </span>
                <span className="swatch__hex">{hex}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

interface PalettePanelProps {
  palette: Palette;
  name: string;
  onCopy: (hex: string) => void;
}

export function PalettePanel({ palette, name, onCopy }: PalettePanelProps) {
  return (
    <section className="panel" aria-labelledby="palette-heading">
      <div className="panel__header">
        <h2 id="palette-heading">Palette</h2>
        <p>Select a swatch to copy it. The dot marks your exact color.</p>
      </div>
      <div className="stack">
        <Scale
          title={name}
          swatches={palette.brand}
          anchorStep={palette.anchorStep}
          onCopy={onCopy}
        />
        <Scale title="neutral" swatches={palette.neutral} onCopy={onCopy} />
      </div>
    </section>
  );
}
