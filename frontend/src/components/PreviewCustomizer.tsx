import { useRef, useState, type ChangeEvent } from 'react';
import {
  usePreviewTheme,
  ACCENT_COLORS,
  FONT_FAMILIES,
  COVER_STYLES,
  COVER_DECORS,
  mergeSectionOrder,
  type PreviewAccent,
  type PreviewFont,
  type CoverStyle,
  type CoverDecor,
  type PageNumFormat,
} from '../store/usePreviewTheme';
import { toast } from '../store/useToasts';

interface Props {
  sections: Array<{ key: string; title: string }>;
}

const MAX_LOGO_BYTES = 500 * 1024;

export default function PreviewCustomizer({ sections }: Props) {
  const {
    accent,
    font,
    coverStyle,
    coverDecor,
    logoDataUrl,
    footerText,
    showCoverDate,
    showToc,
    hiddenSections,
    sectionOrder,
    setAccent,
    setFont,
    setCoverStyle,
    setCoverDecor,
    setLogo,
    setFooterText,
    setShowCoverDate,
    setShowToc,
    toggleSection,
    moveSection,
    setSectionOrder,
    showHeader,
    pageNumFormat,
    blankBetween,
    appendixTwoCol,
    sectionStripe,
    sectionDividers,
    financeCharts,
    setShowHeader,
    setPageNumFormat,
    setBlankBetween,
    setAppendixTwoCol,
    setSectionStripe,
    setSectionDividers,
    setFinanceCharts,
  } = usePreviewTheme();

  const knownIds = sections.map((s) => s.key);
  const orderedIds = mergeSectionOrder(sectionOrder, knownIds);
  const sectionMap = Object.fromEntries(sections.map((s) => [s.key, s.title]));

  const [dragId, setDragId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_LOGO_BYTES) {
      toast.error('Logo zu groß — max. 500 KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setLogo(result);
        toast.success('Logo übernommen.');
      }
    };
    reader.readAsDataURL(file);
  };

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
      <details open>
        <summary>
          <span className="preview-customizer-icon" aria-hidden>🎨</span>
          Dokument anpassen
        </summary>
        <div className="preview-customizer-content">

          <div className="preview-custom-section">
            <div className="preview-custom-label">Logo</div>
            {logoDataUrl ? (
              <div className="preview-logo-preview">
                <img src={logoDataUrl} alt="Logo" />
                <div className="preview-logo-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileInputRef.current?.click()}>
                    Ersetzen
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setLogo(null)}>
                    Entfernen
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="preview-logo-upload"
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="preview-logo-upload-icon" aria-hidden>⬆</span>
                <span>Logo hochladen (PNG, JPG, SVG · max. 500 KB)</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              style={{ display: 'none' }}
              onChange={onLogoUpload}
            />
          </div>

          <div className="preview-custom-section">
            <div className="preview-custom-label">Deckblatt-Stil</div>
            <div className="preview-cover-styles">
              {(Object.keys(COVER_STYLES) as CoverStyle[]).map((key) => {
                const s = COVER_STYLES[key];
                return (
                  <button
                    key={key}
                    type="button"
                    className={`preview-cover-style-card ${key === coverStyle ? 'is-active' : ''}`}
                    onClick={() => setCoverStyle(key)}
                  >
                    <strong>{s.name}</strong>
                    <span>{s.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="preview-custom-section">
            <div className="preview-custom-label">Deckblatt-Grafik</div>
            <div className="preview-cover-styles">
              {(Object.keys(COVER_DECORS) as CoverDecor[]).map((key) => {
                const d = COVER_DECORS[key];
                return (
                  <button
                    key={key}
                    type="button"
                    className={`preview-cover-style-card ${key === coverDecor ? 'is-active' : ''}`}
                    onClick={() => setCoverDecor(key)}
                  >
                    <strong>{d.name}</strong>
                    <span>{d.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

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
            <div className="preview-custom-label">Schriftart (Preview)</div>
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
            <div className="preview-custom-label">Fußzeile (auf jeder Seite)</div>
            <input
              type="text"
              className="preview-footer-input"
              placeholder="z.B. Vertraulich · Entwurf · Ihr Name"
              maxLength={80}
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
            />
          </div>

          <div className="preview-custom-section">
            <div className="preview-custom-label">Deckblatt-Optionen</div>
            <label className="preview-toggle-row">
              <input type="checkbox" checked={showCoverDate} onChange={(e) => setShowCoverDate(e.target.checked)} />
              <span>Datum auf dem Deckblatt anzeigen</span>
            </label>
            <label className="preview-toggle-row">
              <input type="checkbox" checked={showToc} onChange={(e) => setShowToc(e.target.checked)} />
              <span>Eigene Seite fürs Inhaltsverzeichnis</span>
            </label>
          </div>

          <div className="preview-custom-section">
            <div className="preview-custom-label">Seiten-Layout</div>
            <label className="preview-toggle-row">
              <input type="checkbox" checked={showHeader} onChange={(e) => setShowHeader(e.target.checked)} />
              <span>Kopfzeile mit Logo + Firmenname</span>
            </label>
            <label className="preview-toggle-row">
              <input type="checkbox" checked={sectionStripe} onChange={(e) => setSectionStripe(e.target.checked)} />
              <span>Akzent-Streifen links am Rand</span>
            </label>
            <label className="preview-toggle-row">
              <input
                type="checkbox"
                checked={sectionDividers}
                onChange={(e) => {
                  setSectionDividers(e.target.checked);
                  if (e.target.checked) setBlankBetween(false);
                }}
              />
              <span>Kapitel-Trennseiten mit großer Nummer</span>
            </label>
            <label className="preview-toggle-row">
              <input
                type="checkbox"
                checked={blankBetween}
                disabled={sectionDividers}
                onChange={(e) => setBlankBetween(e.target.checked)}
              />
              <span>Leere Trennseite zwischen Sektionen</span>
            </label>
            <label className="preview-toggle-row">
              <input type="checkbox" checked={financeCharts} onChange={(e) => setFinanceCharts(e.target.checked)} />
              <span>Finanz-Charts im PDF (Umsatz & Liquidität)</span>
            </label>
            <label className="preview-toggle-row">
              <input type="checkbox" checked={appendixTwoCol} onChange={(e) => setAppendixTwoCol(e.target.checked)} />
              <span>Anhang zweispaltig</span>
            </label>
          </div>

          <div className="preview-custom-section">
            <div className="preview-custom-label">Seitenzahl</div>
            <div className="preview-cover-styles">
              {(['xOfY', 'simple', 'hidden'] as PageNumFormat[]).map((key) => {
                const labels: Record<PageNumFormat, { name: string; desc: string }> = {
                  xOfY: { name: 'Seite X von Y', desc: 'Empfohlen' },
                  simple: { name: 'Nur Nummer', desc: 'Minimalistisch' },
                  hidden: { name: 'Ausblenden', desc: 'Ohne Zählung' },
                };
                return (
                  <button
                    key={key}
                    type="button"
                    className={`preview-cover-style-card ${key === pageNumFormat ? 'is-active' : ''}`}
                    onClick={() => setPageNumFormat(key)}
                  >
                    <strong>{labels[key].name}</strong>
                    <span>{labels[key].desc}</span>
                  </button>
                );
              })}
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
                      <input type="checkbox" checked={!hidden} onChange={() => toggleSection(id)} />
                      <span>{title}</span>
                    </label>
                    <span className="preview-section-arrows">
                      <button type="button" className="btn-icon btn-icon-sm" onClick={() => moveSection(id, 'up')} disabled={idx === 0} aria-label="Nach oben">↑</button>
                      <button type="button" className="btn-icon btn-icon-sm" onClick={() => moveSection(id, 'down')} disabled={idx === orderedIds.length - 1} aria-label="Nach unten">↓</button>
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
