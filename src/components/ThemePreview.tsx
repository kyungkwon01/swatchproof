import { useId, type CSSProperties } from 'react';
import { contrastRatio, formatRatio, wcagLevel } from '../color/contrast';
import type { ThemeTokens } from '../color/palette';
import { themeChecks } from '../color/themeChecks';
import { displayColor, type VisionMode } from '../color/vision';

interface SampleThemeProps {
  title: string;
  tokens: ThemeTokens;
  vision: VisionMode;
}

function SampleTheme({ title, tokens, vision }: SampleThemeProps) {
  const emailId = useId();
  const shown = (hex: string) => displayColor(hex, vision);
  const style = {
    '--p-background': shown(tokens.background),
    '--p-surface': shown(tokens.surface),
    '--p-text': shown(tokens.text),
    '--p-muted': shown(tokens.mutedText),
    '--p-border': shown(tokens.border),
    '--p-field-border': shown(tokens.fieldBorder),
    '--p-primary': shown(tokens.primary),
    '--p-on-primary': shown(tokens.onPrimary),
    '--p-link': shown(tokens.link),
  } as CSSProperties;

  return (
    <div className="theme">
      <h3 className="scale__title">{title}</h3>

      <div className="sample" style={style}>
        <form className="sample__card" onSubmit={(event) => event.preventDefault()}>
          <p className="sample__eyebrow">Team plan</p>
          <h4 className="sample__title">Invite your team</h4>
          <p className="sample__text">
            New members can start right away. <a href="#preview">See what they can access</a>.
          </p>
          <label className="sample__label" htmlFor={emailId}>
            Work email
          </label>
          <input
            id={emailId}
            className="sample__input"
            type="email"
            autoComplete="off"
            defaultValue="sam@example.com"
          />
          <div className="sample__actions">
            <button type="submit" className="sample__primary">
              Send invite
            </button>
            <button type="button" className="sample__secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>

      <ul className="checks">
        {themeChecks(tokens).map(({ label, foreground, background, size }) => {
          const ratio = contrastRatio(foreground, background);
          const level = wcagLevel(ratio, size);
          return (
            <li key={label} className="check">
              <span>{label}</span>
              <span className="check__ratio">{formatRatio(ratio)}:1</span>
              <span className={level === 'Fail' ? 'badge badge--fail' : 'badge'}>{level}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

interface ThemePreviewProps {
  light: ThemeTokens;
  dark: ThemeTokens;
  vision: VisionMode;
}

export function ThemePreview({ light, dark, vision }: ThemePreviewProps) {
  return (
    <section className="panel" id="preview" aria-labelledby="preview-heading">
      <div className="panel__header">
        <h2 id="preview-heading">Live preview</h2>
        <p>Swatchproof picks the steps that stay readable in each mode.</p>
      </div>
      <div className="themes">
        <SampleTheme title="Light mode" tokens={light} vision={vision} />
        <SampleTheme title="Dark mode" tokens={dark} vision={vision} />
      </div>
    </section>
  );
}
