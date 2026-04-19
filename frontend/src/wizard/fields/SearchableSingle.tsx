import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Field } from '../schema';

interface Props {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
}

/**
 * Single-choice field for long option lists (>10). Shows a compact trigger
 * with the current selection; tapping/clicking opens a bottom sheet on
 * mobile (full width, rounded top) and a centred popover on desktop.
 * Search filters labels in real time; options are grouped by Option.group.
 */
export function SearchableSingle({ field, value, onChange }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const label = t(field.labelKey);
  const help = field.helpKey ? t(field.helpKey) : undefined;
  const selectedLabel = useMemo(() => {
    const opt = field.options?.find((o) => o.value === value);
    return opt ? t(opt.labelKey) : undefined;
  }, [field.options, value, t]);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const map = new Map<string, Array<{ value: string; label: string }>>();
    (field.options || []).forEach((opt) => {
      const label = t(opt.labelKey);
      if (q && !label.toLowerCase().includes(q)) return;
      const groupKey = opt.group || 'groups.other';
      if (!map.has(groupKey)) map.set(groupKey, []);
      map.get(groupKey)!.push({ value: opt.value, label });
    });
    return Array.from(map.entries()).map(([key, items]) => ({
      title: t(key, { defaultValue: '' }),
      items,
    }));
  }, [field.options, query, t]);

  const totalMatches = grouped.reduce((n, g) => n + g.items.length, 0);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => searchRef.current?.focus(), 100);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="field">
      <span className="field-label">{label}</span>
      {help && <span className="field-help">{help}</span>}
      <button
        type="button"
        className={`searchable-trigger ${selectedLabel ? 'is-filled' : ''}`}
        onClick={() => setOpen(true)}
      >
        <span className="searchable-trigger-value">
          {selectedLabel || 'Auswählen…'}
        </span>
        <span className="searchable-trigger-caret" aria-hidden>▾</span>
      </button>

      {open && (
        <div
          className="searchable-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
          role="dialog"
          aria-modal="true"
          aria-label={label}
        >
          <div className="searchable-sheet">
            <div className="searchable-sheet-head">
              <h3>{label}</h3>
              <button
                type="button"
                className="searchable-close"
                onClick={() => setOpen(false)}
                aria-label="Schließen"
              >
                ×
              </button>
            </div>
            <div className="searchable-sheet-search">
              <input
                ref={searchRef}
                type="search"
                inputMode="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Suchen…"
                autoComplete="off"
              />
            </div>
            <div className="searchable-sheet-list">
              {totalMatches === 0 && (
                <p className="muted" style={{ padding: '1rem', margin: 0 }}>
                  Kein Treffer für „{query}".
                </p>
              )}
              {grouped.map((g) => (
                <div key={g.title || 'none'} className="searchable-group">
                  {g.title && <div className="searchable-group-title">{g.title}</div>}
                  <div className="searchable-group-items">
                    {g.items.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        className={`searchable-option ${value === o.value ? 'is-selected' : ''}`}
                        onClick={() => pick(o.value)}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
