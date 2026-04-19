import { useState } from 'react';
import {
  usePreviewTheme,
  ACCENT_COLORS,
  FONT_FAMILIES,
  mergeSectionOrder,
  type PreviewAccent,
  type PreviewFont,
} from '../store/usePreviewTheme';

interface Props {
  sections: Array<{ key: string; title: string }>;
}

export default function PreviewCustomizer({ sections }: Props) {
  const {
    accent,
    font,
    hiddenSections,
    sectionOrder,
    setAccent,
    setFont,
    toggleSection,
    moveSection,
    setSectionOrder,
  } = usePreviewTheme();

  const knownIds = sections.map((s) => s.key);
  const orderedIds = mergeSectionOrder(sectionOrder, knownIds);
  const sectionMap = Object.fromEntries(sections.map((s) => [s.key, s.title]));

  const [dragId, setDragId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const onDragStart = (id: string) => (e: React.DragEvent) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDragOver = (id: string) => (e: React.DragEvent) => {
    if (!dragId || dragId === id) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setHoverId(id);
  };
  const onDrop = (id: string) => (e: React.DragEvent) => {
    e.preventDefault();
    if (!dragId || dragId === id) return;
    const next = [...orderedIds];
    const fromIdx = next.indexOf(dragId);
    const toIdx = next.indexOf(id);
    if (fromIdx < 0 || toIdx < 0) return;
    next.splice(fromIdx, 1);
    next.splice(toIdx, 0, dragId);
    setSectionOrder(next);
    setDragId(null);
    setHoverId(null);
  };
  const onDragEnd = () => { setDragId(null); setHoverId(null); };

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
            <div className="preview-custom-label-row">
              <span className="preview-custom-label">Sektionen &amp; Reihenfolge</span>
              <span className="preview-custom-hint">ziehen zum Umordnen</span>
            </div>
            <ul className="preview-section-list" role="list">
              {orderedIds.map((id, idx) => {
                const title = sectionMap[id];
                const hidden = hiddenSections.includes(id);
                const isDragging = dragId === id;
                const isHoverTarget = hoverId === id && dragId !== id;
                return (
                  <li
                    key={id}
                    className={`preview-section-row ${hidden ? 'is-hidden' : ''} ${isDragging ? 'is-dragging' : ''} ${isHoverTarget ? 'is-drop-target' : ''}`}
                    draggable
                    onDragStart={onDragStart(id)}
                    onDragOver={onDragOver(id)}
                    onDrop={onDrop(id)}
                    onDragEnd={onDragEnd}
                  >
                    <span className="preview-section-drag" aria-hidden>⋮⋮</span>
                    <span className="preview-section-num-mini">{idx + 1}</span>
                    <label className="preview-section-label">
                      <input
                        type="checkbox"
                        checked={!hidden}
                        onChange={() => toggleSection(id)}
                      />
                      <span>{title}</span>
                    </label>
                    <span className="preview-section-arrows">
                      <button
                        type="button"
                        className="btn-icon btn-icon-sm"
                        onClick={() => moveSection(id, 'up')}
                        disabled={idx === 0}
                        aria-label="Nach oben"
                      >↑</button>
                      <button
                        type="button"
                        className="btn-icon btn-icon-sm"
                        onClick={() => moveSection(id, 'down')}
                        disabled={idx === orderedIds.length - 1}
                        aria-label="Nach unten"
                      >↓</button>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </details>
    </div>
  );
}
