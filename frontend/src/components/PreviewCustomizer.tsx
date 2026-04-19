import { usePreviewTheme, ACCENT_COLORS, FONT_FAMILIES, type PreviewAccent, type PreviewFont } from '../store/usePreviewTheme';

interface Props {
  sections: Array<{ key: string; title: string }>;
}

export default function PreviewCustomizer({ sections }: Props) {
  const { accent, font, hiddenSections, setAccent, setFont, toggleSection } = usePreviewTheme();

  return (
    <div className="preview-customizer">
      <details>
        <summary>
          <span className="preview-customizer-icon" aria-hidden>🎨</span>
          Dokument anpassen
        </summary>
        <div className="preview-customizer-content">
          <div className="preview-custom-section">
            <div className="preview-custom-label">Akzentfarbe</div>
            <div className="preview-accent-row">
              {(Object.keys(ACCENT_COLORS) as PreviewAccent[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`preview-accent-swatch ${key === accent ? 'is-active' : ''}`}
                  style={{ background: ACCENT_COLORS[key].hex }}
                  onClick={() => setAccent(key)}
                  aria-label={ACCENT_COLORS[key].name}
                  title={ACCENT_COLORS[key].name}
                />
              ))}
            </div>
          </div>

          <div className="preview-custom-section">
            <div className="preview-custom-label">Schriftart</div>
            <div className="preview-font-row">
              {(Object.keys(FONT_FAMILIES) as PreviewFont[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`preview-font-chip ${key === font ? 'is-active' : ''}`}
                  onClick={() => setFont(key)}
                  style={{ fontFamily: FONT_FAMILIES[key].stack }}
                >
                  Aa {FONT_FAMILIES[key].name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="preview-custom-section">
            <div className="preview-custom-label">Sektionen</div>
            <div className="preview-section-toggles">
              {sections.map((s) => {
                const hidden = hiddenSections.includes(s.key);
                return (
                  <label key={s.key} className={`preview-section-toggle ${hidden ? 'is-hidden' : ''}`}>
                    <input
                      type="checkbox"
                      checked={!hidden}
                      onChange={() => toggleSection(s.key)}
                    />
                    <span>{s.title}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}
