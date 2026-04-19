import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDataStore } from '../store/useDataStore';
import { usePlanStore } from '../store/usePlanStore';
import { generateSectionStreamed } from '../api/client';
import { toast } from '../store/useToasts';
import { FlexChart, type ChartKind } from '../components/MiniCharts';
import ChartTypePicker from '../components/ChartTypePicker';
import { usePreviewTheme, CURRENCIES } from '../store/usePreviewTheme';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const CHART_STORAGE = 'bp24-chart-kinds';

type ChartKinds = {
  profitability: ChartKind;
  liquidity: ChartKind;
  costs: ChartKind;
};

function loadChartKinds(): ChartKinds {
  try {
    const raw = localStorage.getItem(CHART_STORAGE);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { profitability: 'bar', liquidity: 'area', costs: 'doughnut' };
}

function saveChartKinds(kinds: ChartKinds) {
  try { localStorage.setItem(CHART_STORAGE, JSON.stringify(kinds)); } catch { /* ignore */ }
}

export default function FinancePlanner({ onNext, onBack }: Props) {
  const { t, i18n } = useTranslation();
  const { startingCash, periods, setStartingCash, upsertPeriod, addPeriod, removePeriod } = useDataStore();
  const store = usePlanStore();
  const [generating, setGenerating] = useState(false);
  const [text, setText] = useState<string | undefined>(store.texts.finance);
  const [textComplete, setTextComplete] = useState<boolean>(!!store.texts.finance);
  const abortRef = useRef<AbortController | null>(null);
  const [chartKinds, setChartKinds] = useState<ChartKinds>(loadChartKinds);
  const { currency, setCurrency } = usePreviewTheme();
  const currencyMeta = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];

  const updateKind = (which: keyof ChartKinds, kind: ChartKind) => {
    const next = { ...chartKinds, [which]: kind };
    setChartKinds(next);
    saveChartKinds(next);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setTextComplete(false);
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
      setTextComplete(true);
    } catch {
      toast.error('Generierung fehlgeschlagen.', {
        action: { label: 'Erneut', onClick: () => void handleGenerate() },
      });
    } finally {
      setGenerating(false);
      abortRef.current = null;
    }
  };

  const handleTextEdit = (v: string) => {
    setText(v);
    setTextComplete(v.trim().length > 0);
    store.setText('finance', v);
  };

  return (
    <div className="wizard-step finance-step">
      <div className="wizard-step-head">
        <div className="wizard-step-section">{t('sections.finance.title')}</div>
        <h2>{t('steps.plan.title')}</h2>
        <p className="muted">{t('steps.plan.desc')}</p>
      </div>

      <div className="wizard-prefill-banner">
        <span className="wizard-prefill-badge">Vorschlag</span>
        <span>
          Die folgenden Zahlen sind <strong>realistische Vorschlagswerte</strong> basierend auf deinem Geschäftsmodell
          (IHK- und KfW-Benchmarks). <strong>Passe sie an deine konkrete Planung an</strong> — oder klick direkt auf „Weiter",
          wenn sie zu deiner Realität passen.
        </span>
      </div>

      <div className="finance-layout">
        <section className="finance-data-panel">
          <header className="finance-panel-head">
            <h3>Zahlen pro Periode</h3>
            <div className="finance-header-controls">
              <label className="finance-currency-select">
                <span className="muted tiny">Währung</span>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.code} — {c.label}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="muted tiny">Startkapital</span>
                <div className="finance-starting-input">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={startingCash}
                    onChange={(e) => setStartingCash(Number(e.target.value) || 0)}
                  />
                  <span className="finance-currency">{currencyMeta.symbol}</span>
                </div>
              </label>
            </div>
          </header>

          {/* Desktop table */}
          <div className="finance-table-wrap">
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
                    <td><input type="number" inputMode="numeric" value={p.revenue} onChange={(e) => upsertPeriod(i, { revenue: Number(e.target.value) || 0 })} /></td>
                    <td><input type="number" inputMode="numeric" value={p.costs} onChange={(e) => upsertPeriod(i, { costs: Number(e.target.value) || 0 })} /></td>
                    <td><input type="number" inputMode="numeric" value={p.cashIn} onChange={(e) => upsertPeriod(i, { cashIn: Number(e.target.value) || 0 })} /></td>
                    <td><input type="number" inputMode="numeric" value={p.cashOut} onChange={(e) => upsertPeriod(i, { cashOut: Number(e.target.value) || 0 })} /></td>
                    <td><button type="button" className="btn-icon" onClick={() => removePeriod(i)} aria-label="Entfernen">×</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="finance-cards">
            {periods.map((p, i) => (
              <div key={i} className="finance-card">
                <div className="finance-card-head">
                  <input type="text" value={p.label} onChange={(e) => upsertPeriod(i, { label: e.target.value })} className="finance-card-label" />
                  <button type="button" className="btn-icon" onClick={() => removePeriod(i)} aria-label="Periode entfernen">×</button>
                </div>
                <div className="finance-card-grid">
                  <label><span>Umsatz</span><input type="number" inputMode="numeric" value={p.revenue} onChange={(e) => upsertPeriod(i, { revenue: Number(e.target.value) || 0 })} /></label>
                  <label><span>Kosten</span><input type="number" inputMode="numeric" value={p.costs} onChange={(e) => upsertPeriod(i, { costs: Number(e.target.value) || 0 })} /></label>
                  <label><span>Cash in</span><input type="number" inputMode="numeric" value={p.cashIn} onChange={(e) => upsertPeriod(i, { cashIn: Number(e.target.value) || 0 })} /></label>
                  <label><span>Cash out</span><input type="number" inputMode="numeric" value={p.cashOut} onChange={(e) => upsertPeriod(i, { cashOut: Number(e.target.value) || 0 })} /></label>
                </div>
              </div>
            ))}
          </div>

          <button type="button" className="btn btn-ghost btn-sm finance-add" onClick={addPeriod}>+ Periode hinzufügen</button>
        </section>

        <section className="finance-charts">
          <div className="mini-chart">
            <div className="mini-chart-head">
              <h4>Rentabilität</h4>
              <ChartTypePicker
                value={chartKinds.profitability}
                onChange={(k) => updateKind('profitability', k)}
                allow={['bar', 'bar-stacked', 'line', 'area']}
                compact
              />
            </div>
            <div className="mini-chart-canvas">
              <FlexChart periods={periods} kind={chartKinds.profitability} dataKey="profitability" />
            </div>
          </div>

          <div className="mini-chart">
            <div className="mini-chart-head">
              <h4>Liquidität (kumulierter Kassenstand)</h4>
              <ChartTypePicker
                value={chartKinds.liquidity}
                onChange={(k) => updateKind('liquidity', k)}
                allow={['area', 'line', 'bar']}
                compact
              />
            </div>
            <div className="mini-chart-canvas">
              <FlexChart periods={periods} startingCash={startingCash} kind={chartKinds.liquidity} dataKey="liquidity" />
            </div>
          </div>

          <div className="mini-chart">
            <div className="mini-chart-head">
              <h4>Kostenverteilung</h4>
              <ChartTypePicker
                value={chartKinds.costs}
                onChange={(k) => updateKind('costs', k)}
                allow={['doughnut', 'polar', 'bar']}
                compact
              />
            </div>
            <div className="mini-chart-canvas">
              <FlexChart periods={periods} kind={chartKinds.costs} dataKey="costs" />
            </div>
          </div>
        </section>
      </div>

      <div className="wizard-generate-block">
        {text != null && (text.length > 0 || generating) ? (
          <>
            <div className="wizard-generated-head">
              <h3>{t('sections.finance.title')}</h3>
              {!generating && <button className="btn btn-ghost btn-sm" onClick={handleGenerate}>{t('wizard.regenerate')}</button>}
              {generating && <button className="btn btn-ghost btn-sm" onClick={() => abortRef.current?.abort()}>Abbrechen</button>}
            </div>
            <textarea
              className={`generated-text ${generating ? 'is-streaming' : ''}`}
              rows={10}
              value={text}
              readOnly={generating}
              onChange={(e) => handleTextEdit(e.target.value)}
            />
            {generating && <div className="streaming-bar" aria-hidden><span /><span /><span /></div>}
          </>
        ) : (
          <div className="wizard-generate-cta">
            <p className="muted">Plani fasst deine Finanzplanung mit den obigen Zahlen in einen professionellen Text zusammen.</p>
            <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
              {t('wizard.generate')}
            </button>
          </div>
        )}
      </div>

      <div className="wizard-nav">
        <button className="btn btn-ghost" onClick={onBack}>{t('wizard.back')}</button>
        <button className="btn btn-primary" onClick={onNext} disabled={!textComplete || generating}>
          {t('wizard.next')}
        </button>
      </div>
    </div>
  );
}
