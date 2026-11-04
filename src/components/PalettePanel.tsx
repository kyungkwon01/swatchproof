import { mostReadable } from '../color/contrast';
import type { Palette, Step, Swatch } from '../color/palette';
import { displayColor, type VisionMode } from '../color/vision';

interface ScaleProps {
  title: string;
  swatches: Swatch[];
  anchorStep?: Step;
  vision: VisionMode;
  onCopy: (hex: string) => void;
}

function Scale({ title, swatches, anchorStep, vision, onCopy }: ScaleProps) {
  return (
    <div>
      <h3 className="scale__title">{title}</h3>
      <ul className="scale">
        {swatches.map(({ step, hex }) => {
          const isAnchor = step === anchorStep;
          const shown = displayColor(hex, vision);
          return (
            <li key={step}>
              <button
                type="button"
                className="swatch"
                style={{ background: shown, color: mostReadable(shown, ['#000000', '#ffffff']) }}
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
  vision: VisionMode;
  onCopy: (hex: string) => void;
}

export function PalettePanel({ palette, name, vision, onCopy }: PalettePanelProps) {
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
          vision={vision}
          onCopy={onCopy}
        />
        <Scale title="neutral" swatches={palette.neutral} vision={vision} onCopy={onCopy} />
      </div>
    </section>
  );
}
