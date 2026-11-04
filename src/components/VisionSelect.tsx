import { VISION_MODES, type VisionMode } from '../color/vision';

interface VisionSelectProps {
  mode: VisionMode;
  onChange: (mode: VisionMode) => void;
}

export function VisionSelect({ mode, onChange }: VisionSelectProps) {
  const selected = VISION_MODES.find((option) => option.id === mode);

  return (
    <section className="vision" aria-labelledby="vision-heading">
      <div className="vision__row">
        <h2 id="vision-heading" className="vision__title">
          View as
        </h2>
        <div className="toggle" role="group" aria-labelledby="vision-heading">
          {VISION_MODES.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={option.id === mode}
              onClick={() => onChange(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <p className="vision__description" role="status">
        {selected?.description}
        {mode === 'typical'
          ? null
          : ' This is an estimate. Hex values and contrast scores still show the real colors.'}
      </p>
    </section>
  );
}
