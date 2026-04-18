import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Field } from '../schema';

interface Props {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
}

export function FieldRenderer({ field, value, onChange }: Props) {
  const { t } = useTranslation();
  const label = t(field.labelKey);
  const help = field.helpKey ? t(field.helpKey) : undefined;
  const placeholder = field.placeholderKey ? t(field.placeholderKey) : undefined;

  if (field.type === 'short') {
    return (
      <label className="field">
        <span className="field-label">{label}</span>
        {help && <span className="field-help">{help}</span>}
        <input
          type="text"
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </label>
    );
  }

  if (field.type === 'long') {
    return (
      <label className="field">
        <span className="field-label">{label}</span>
        {help && <span className="field-help">{help}</span>}
        <textarea
          rows={4}
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </label>
    );
  }

  if (field.type === 'number' || field.type === 'money') {
    return (
      <label className="field">
        <span className="field-label">{label}</span>
        {help && <span className="field-help">{help}</span>}
        <input
          type="number"
          inputMode="numeric"
          value={(value as number) ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          placeholder={placeholder}
        />
      </label>
    );
  }

  if (field.type === 'single') {
    return (
      <fieldset className="field field-choice">
        <legend className="field-label">{label}</legend>
        {help && <span className="field-help">{help}</span>}
        <div className="choice-grid">
          {field.options?.map((opt) => (
            <label key={opt.value} className={`choice-chip ${value === opt.value ? 'is-selected' : ''}`}>
              <input
                type="radio"
                name={field.id}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => onChange(opt.value)}
              />
              <span>{t(opt.labelKey)}</span>
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  if (field.type === 'multi') {
    return <MultiChoice field={field} value={(value as string[]) || []} onChange={onChange} />;
  }

  return null;
}

function MultiChoice({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: string[];
  onChange: (v: unknown) => void;
}) {
  const { t } = useTranslation();
  const [custom, setCustom] = useState('');
  const toggle = (v: string) => {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  };
  return (
    <fieldset className="field field-choice">
      <legend className="field-label">{t(field.labelKey)}</legend>
      {field.helpKey && <span className="field-help">{t(field.helpKey)}</span>}
      <div className="choice-grid">
        {field.options?.map((opt) => (
          <label key={opt.value} className={`choice-chip ${value.includes(opt.value) ? 'is-selected' : ''}`}>
            <input
              type="checkbox"
              checked={value.includes(opt.value)}
              onChange={() => toggle(opt.value)}
            />
            <span>{t(opt.labelKey)}</span>
          </label>
        ))}
      </div>
      {field.allowCustom && (
        <div className="custom-option">
          <input
            type="text"
            placeholder={t('wizard.add_custom')}
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-ghost"
            disabled={!custom.trim()}
            onClick={() => {
              if (!custom.trim()) return;
              onChange([...value, custom.trim()]);
              setCustom('');
            }}
          >
            +
          </button>
          {value
            .filter((v) => !field.options?.some((o) => o.value === v))
            .map((v) => (
              <span key={v} className="custom-chip">
                {v}
                <button type="button" onClick={() => toggle(v)} aria-label="remove">×</button>
              </span>
            ))}
        </div>
      )}
    </fieldset>
  );
}
