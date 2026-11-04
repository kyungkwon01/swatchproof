import { useEffect, useId, useState } from 'react';
import { normalizeHex } from '../color/oklch';

const PRESETS = [
  { name: 'Blue', hex: '#2f6fde' },
  { name: 'Rose', hex: '#e11d48' },
  { name: 'Green', hex: '#15803d' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Violet', hex: '#7c3aed' },
  { name: 'Teal', hex: '#0d9488' },
];

interface ColorControlsProps {
  hex: string;
  name: string;
  onHexChange: (hex: string) => void;
  onNameChange: (name: string) => void;
  onCopyLink: () => void;
}

export function ColorControls({
  hex,
  name,
  onHexChange,
  onNameChange,
  onCopyLink,
}: ColorControlsProps) {
  const id = useId();
  const hintId = `${id}-hint`;

  // A draft lets people type a partial value without the app rejecting each keystroke.
  const [draft, setDraft] = useState(hex);
  const isValid = normalizeHex(draft) !== null;

  useEffect(() => {
    setDraft((current) => (normalizeHex(current) === hex ? current : hex));
  }, [hex]);

  const handleDraftChange = (value: string) => {
    setDraft(value);
    const normalized = normalizeHex(value);
    if (normalized) onHexChange(normalized);
  };

  return (
    <section className="controls" aria-label="Palette settings">
      <div className="field">
        <label htmlFor={`${id}-picker`}>Pick a color</label>
        <input
          id={`${id}-picker`}
          className="color-input"
          type="color"
          value={hex}
          onChange={(event) => onHexChange(event.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor={`${id}-hex`}>Hex value</label>
        <input
          id={`${id}-hex`}
          className="text-input text-input--mono"
          type="text"
          spellCheck={false}
          autoComplete="off"
          value={draft}
          aria-invalid={!isValid}
          aria-describedby={hintId}
          onChange={(event) => handleDraftChange(event.target.value)}
          onBlur={() => {
            if (!isValid) setDraft(hex);
          }}
        />
        <p id={hintId} className={isValid ? 'hint' : 'hint hint--error'}>
          {isValid ? 'For example, #2f6fde' : 'Enter 3 or 6 hex digits'}
        </p>
      </div>

      <div className="field">
        <label htmlFor={`${id}-name`}>Palette name</label>
        <input
          id={`${id}-name`}
          className="text-input"
          type="text"
          autoComplete="off"
          maxLength={32}
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
        />
        <p className="hint">Used in the exported code</p>
      </div>

      <fieldset className="presets">
        <legend>Or try one</legend>
        <div className="presets__list">
          {PRESETS.map((preset) => (
            <button
              key={preset.hex}
              type="button"
              className="preset"
              style={{ background: preset.hex }}
              aria-label={preset.name}
              aria-pressed={preset.hex === hex}
              title={preset.name}
              onClick={() => onHexChange(preset.hex)}
            />
          ))}
        </div>
      </fieldset>

      <button type="button" className="button button--primary controls__share" onClick={onCopyLink}>
        Copy share link
      </button>
    </section>
  );
}
