import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDataStore } from '../store/useDataStore';
import { usePlanStore } from '../store/usePlanStore';
import { generateSectionStreamed } from '../api/client';
import { toast } from '../store/useToasts';
import { ProfitabilityMini, LiquidityMini } from '../components/MiniCharts';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export default function FinancePlanner({ onNext, onBack }: Props) {
  const { t, i18n } = useTranslation();
  const { startingCash, periods, setStartingCash, upsertPeriod, addPeriod, removePeriod } = useDataStore();
  const store = usePlanStore();
  const [generating, setGenerating] = useState(false);
  const [text, setText] = useState<string | undefined>(store.texts.finance);
  const abortRef = useRef<AbortController | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    abortRef.current = new AbortController();
    setText('');
    try {
      const allAnswers = Object.values(store.answers).reduce<Record<string, unknown>>(
        (acc, a) => ({ ...acc, ...a }),
        {}
      );
      const financePayload = { startingCash, periods };
      store.setFinance(financePayload);
      let streamed = '';
      await generateSectionStreamed(
        {
          section: 'finance',
          answers: { ...allAnswers, finance: financePayload },
          language: i18n.language.slice(0, 2),
        },
        (chunk) => {
          streamed += chunk;
          setText(streamed);
        },
        abortRef.current.signal
      );
      store.setText('finance', streamed.trim());
      store.persistToServer().catch(() => {});
    } catch {
      toast.error('Generierung fehlgeschlagen.', {
        action: { label: 'Erneut', onClick: () => void handleGenerate() },
      });
    } finally {
      setGenerating(false);
      abortRef.current = null;
    }
  };

  return (
    <div className="wizard-step finance-step">
      <div className="wizard-step-head">
        <div className="wizard-step-section">{t('sections.finance.title')}</div>
        <h2>{t('steps.plan.title')}</h2>
        <p className="muted">{t('steps.plan.desc')}</p>
      </div>

      <div className="finance-grid">
        <div className="finance-inputs">
          <label className="field">
            <span className="field-label">Startkapital (€)</span>
            <input
              type="number"
              value={startingCash}
              onChange={(e) => setStartingCash(Number(e.target.value) || 0)}
            />
          </label>

          {/* Desktop: compact table */}
          <table className="finance-table finance-table--desktop">
            <thead>
              <tr>
                <th>Periode</th>
                <th>Umsatz</th>
                <th>Kosten</th>
                <th>Cash in</th>
                <th>Cash out</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {periods.map((p, i) => (
                <tr key={i}>
                  <td><input type="text" value={p.label} onChange={(e) => upsertPeriod(i, { label: e.target.value })} /></td>
                  <td><input type="number" value={p.revenue} onChange={(e) => upsertPeriod(i, { revenue: Number(e.target.value) || 0 })} /></td>
                  <td><input type="number" value={p.costs} onChange={(e) => upsertPeriod(i, { costs: Number(e.target.value) || 0 })} /></td>
                  <td><input type="number" value={p.cashIn} onChange={(e) => upsertPeriod(i, { cashIn: Number(e.target.value) || 0 })} /></td>
                  <td><input type="number" value={p.cashOut} onChange={(e) => upsertPeriod(i, { cashOut: Number(e.target.value) || 0 })} /></td>
                  <td><button type="button" className="btn btn-ghost btn-sm" onClick={() => removePeriod(i)} aria-label="Entfernen">×</button></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile: card-per-period */}
          <div className="finance-cards">
            {periods.map((p, i) => (
              <div key={i} className="finance-card">
                <div className="finance-card-head">
                  <input
                    type="text"
                    value={p.label}
                    onChange={(e) => upsertPeriod(i, { label: e.target.value })}
                    className="finance-card-label"
                  />
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => removePeriod(i)} aria-label="Periode entfernen">×</button>
                </div>
                <div className="finance-card-grid">
                  <label>
                    <span>Umsatz</span>
                    <input type="number" inputMode="numeric" value={p.revenue} onChange={(e) => upsertPeriod(i, { revenue: Number(e.target.value) || 0 })} />
                  </label>
                  <label>
                    <span>Kosten</span>
                    <input type="number" inputMode="numeric" value={p.costs} onChange={(e) => upsertPeriod(i, { costs: Number(e.target.value) || 0 })} />
                  </label>
                  <label>
                    <span>Cash in</span>
                    <input type="number" inputMode="numeric" value={p.cashIn} onChange={(e) => upsertPeriod(i, { cashIn: Number(e.target.value) || 0 })} />
                  </label>
                  <label>
                    <span>Cash out</span>
                    <input type="number" inputMode="numeric" value={p.cashOut} onChange={(e) => upsertPeriod(i, { cashOut: Number(e.target.value) || 0 })} />
                  </label>
                </div>
              </div>
            ))}
          </div>

          <button type="button" className="btn btn-ghost" onClick={addPeriod}>+ Periode</button>
        </div>

        <div className="finance-charts">
          <ProfitabilityMini periods={periods} />
          <LiquidityMini periods={periods} startingCash={startingCash} />
        </div>
      </div>

      <div className="wizard-generate-block">
        {text != null && (text.length > 0 || generating) ? (
          <>
            <div className="wizard-generated-head">
              <h3>{t('sections.finance.title')}</h3>
              {!generating && (
                <button className="btn btn-ghost btn-sm" onClick={handleGenerate}>{t('wizard.regenerate')}</button>
              )}
              {generating && (
                <button className="btn btn-ghost btn-sm" onClick={() => abortRef.current?.abort()}>Abbrechen</button>
              )}
            </div>
            <textarea
              className={`generated-text ${generating ? 'is-streaming' : ''}`}
              rows={10}
              value={text}
              readOnly={generating}
              onChange={(e) => { setText(e.target.value); store.setText('finance', e.target.value); }}
            />
            {generating && <div className="streaming-bar" aria-hidden><span /><span /><span /></div>}
          </>
        ) : (
          <div className="wizard-generate-cta">
            <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
              {t('wizard.generate')}
            </button>
          </div>
        )}
      </div>

      <div className="wizard-nav">
        <button className="btn btn-ghost" onClick={onBack}>{t('wizard.back')}</button>
        <button className="btn btn-primary" onClick={onNext} disabled={!text || generating}>
          {t('wizard.next')}
        </button>
      </div>
    </div>
  );
}
