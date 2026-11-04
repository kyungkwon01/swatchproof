import { formatRatio } from '../color/contrast';
import type { ThemeTokens } from '../color/palette';
import { buildVisionReport, VISION_TYPES } from '../color/themeChecks';
import { VISION_MODES } from '../color/vision';

function labelFor(type: string) {
  return VISION_MODES.find((mode) => mode.id === type)?.label ?? type;
}

export function VisionReport({ light, dark }: { light: ThemeTokens; dark: ThemeTokens }) {
  const rows = buildVisionReport(light, dark);
  const results = rows.flatMap((row) => row.results);
  const failing = results.filter((result) => !result.passes).length;

  return (
    <section className="panel" aria-labelledby="vision-report-heading">
      <div className="panel__header">
        <h2 id="vision-report-heading">Color blindness check</h2>
        <p>
          {failing === 0
            ? `All ${results.length} checks stay readable.`
            : `${failing} of ${results.length} checks drop below the minimum, even if the real colors pass.`}
        </p>
      </div>

      <div
        className="grid-scroll"
        role="region"
        aria-label="Color blindness table, scrollable"
        tabIndex={0}
      >
        <table className="report">
          <caption className="visually-hidden">
            Estimated contrast of each interface element for each type of color blindness
          </caption>
          <thead>
            <tr>
              <th scope="col">Element</th>
              <th scope="col">Minimum</th>
              {VISION_TYPES.map((type) => (
                <th key={type} scope="col">
                  {labelFor(type)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.theme}-${row.label}`}>
                <th scope="row">
                  {row.label} <span className="report__theme">{row.theme}</span>
                </th>
                <td className="report__value">{row.minimum}:1</td>
                {row.results.map(({ type, ratio, passes }) => (
                  <td key={type} className="report__value">
                    {formatRatio(ratio)}{' '}
                    <span className={passes ? 'report__status' : 'report__status report__status--low'}>
                      {passes ? 'OK' : 'Low'}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
