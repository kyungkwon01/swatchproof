import { useState } from 'react';
import { toCss, toTailwind } from '../color/exportFormats';
import type { Palette } from '../color/palette';

const FORMATS = [
  { id: 'css', label: 'CSS variables', build: toCss },
  { id: 'tailwind', label: 'Tailwind v4', build: toTailwind },
] as const;

interface ExportPanelProps {
  name: string;
  palette: Palette;
  onCopy: (text: string) => void;
}

export function ExportPanel({ name, palette, onCopy }: ExportPanelProps) {
  const [formatId, setFormatId] = useState<(typeof FORMATS)[number]['id']>('css');
  const format = FORMATS.find((option) => option.id === formatId) ?? FORMATS[0];
  const code = format.build(name, palette);

  return (
    <section className="panel" aria-labelledby="export-heading">
      <div className="panel__header panel__header--split">
        <div>
          <h2 id="export-heading">Export</h2>
          <p>Paste this straight into your project.</p>
        </div>
        <div className="toggle" role="group" aria-label="Export format">
          {FORMATS.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={option.id === formatId}
              onClick={() => setFormatId(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="code">
        <button type="button" className="button code__copy" onClick={() => onCopy(code)}>
          Copy code
        </button>
        <pre tabIndex={0} aria-label={`${format.label} code`}>
          <code>{code}</code>
        </pre>
      </div>
    </section>
  );
}
