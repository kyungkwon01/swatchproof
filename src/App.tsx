import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { ColorControls } from './components/ColorControls';
import { ContrastGrid } from './components/ContrastGrid';
import { ExportPanel } from './components/ExportPanel';
import { PalettePanel } from './components/PalettePanel';
import { ThemePreview } from './components/ThemePreview';
import { slugify } from './color/exportFormats';
import { darkTokens, generatePalette, lightTokens } from './color/palette';
import { parseSettings, toSearch } from './color/urlState';

export function App() {
  const [settings, setSettings] = useState(() => parseSettings(window.location.search));
  const { hex, name } = settings;
  const [message, setMessage] = useState('');
  const messageTimer = useRef<number>(undefined);

  const palette = useMemo(() => generatePalette(hex), [hex]);
  const light = useMemo(() => lightTokens(palette), [palette]);
  const dark = useMemo(() => darkTokens(palette), [palette]);

  // Dragging in the color picker fires constantly, and browsers throttle replaceState.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.history.replaceState(null, '', toSearch({ hex, name }));
    }, 200);
    return () => window.clearTimeout(timer);
  }, [hex, name]);

  const copy = async (text: string, confirmation: string) => {
    window.clearTimeout(messageTimer.current);
    try {
      await navigator.clipboard.writeText(text);
      setMessage(confirmation);
    } catch {
      setMessage('Could not copy. Check your browser permissions.');
    }
    messageTimer.current = window.setTimeout(() => setMessage(''), 2500);
  };

  const accentStyle = {
    '--accent-light': light.primary,
    '--on-accent-light': light.onPrimary,
    '--accent-dark': dark.primary,
    '--on-accent-dark': dark.onPrimary,
  } as CSSProperties;

  return (
    <div className="app" style={accentStyle}>
      <div className="stripe" aria-hidden="true">
        {palette.brand.map((swatch) => (
          <span key={swatch.step} style={{ background: swatch.hex }} />
        ))}
      </div>

      <header className="header">
        <h1>Swatchproof</h1>
        <p>Turn one brand color into a full palette, and see which combinations people can read.</p>
      </header>

      <main className="main">
        <ColorControls
          hex={hex}
          name={name}
          onHexChange={(next) => setSettings((current) => ({ ...current, hex: next }))}
          onNameChange={(next) => setSettings((current) => ({ ...current, name: next }))}
          onCopyLink={() => copy(window.location.origin + window.location.pathname + toSearch(settings), 'Link copied')}
        />
        <PalettePanel
          palette={palette}
          name={slugify(name)}
          onCopy={(value) => copy(value, `Copied ${value}`)}
        />
        <ThemePreview light={light} dark={dark} />
        <ContrastGrid swatches={palette.brand} name={slugify(name)} />
        <ExportPanel
          name={name}
          palette={palette}
          onCopy={(text) => copy(text, 'Code copied')}
        />
      </main>

      <footer className="footer">
        <p>Contrast is calculated with the WCAG 2.2 formula. Nothing you enter leaves your browser.</p>
      </footer>

      <div className={message ? 'toast toast--visible' : 'toast'} role="status">
        {message}
      </div>
    </div>
  );
}
