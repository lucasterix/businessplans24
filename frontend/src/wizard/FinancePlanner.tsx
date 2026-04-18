import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDataStore } from '../store/useDataStore';
import { usePlanStore } from '../store/usePlanStore';
import { generateSection } from '../api/client';
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

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const allAnswers = Object.values(store.answers).reduce<Record<string, unknown>>(
        (acc, a) => ({ ...acc, ...a }),
        {}
      );
      const financePayload = { startingCash, periods };
      store.setFinance(financePayload);
      const out = await generateSection({
        section: 'finance',
        answers: { ...allAnswers, finance: financePayload },
        language: i18n.language.slice(0, 2),
      });
      setText(out);
      store.setText('finance', out);
      await store.persistToServer();
    } finally {
      setGenerating(false);
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
            <span className="field-label">Startkapital</span>
            <input
              type="number"
              value={startingCash}
              onChange={(e) => setStartingCash(Number(e.target.value) || 0)}
            />
          </label>

          <table className="finance-table">
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
                  <td>
                    <input
                      type="text"
                      value={p.label}
                      onChange={(e) => upsertPeriod(i, { label: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={p.revenue}
                      onChange={(e) => upsertPeriod(i, { revenue: Number(e.target.value) || 0 })}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={p.costs}
                      onChange={(e) => upsertPeriod(i, { costs: Number(e.target.value) || 0 })}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={p.cashIn}
                      onChange={(e) => upsertPeriod(i, { cashIn: Number(e.target.value) || 0 })}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={p.cashOut}
                      onChange={(e) => upsertPeriod(i, { cashOut: Number(e.target.value) || 0 })}
                    />
                  </td>
                  <td>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => removePeriod(i)}>×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" className="btn btn-ghost" onClick={addPeriod}>+ Periode</button>
        </div>

        <div className="finance-charts">
          <ProfitabilityMini periods={periods} />
          <LiquidityMini periods={periods} startingCash={startingCash} />
        </div>
      </div>

      <div className="wizard-generate-block">
        {text ? (
          <>
            <div className="wizard-generated-head">
              <h3>{t('sections.finance.title')}</h3>
              <button className="btn btn-ghost" onClick={handleGenerate} disabled={generating}>
                {generating ? t('wizard.generating') : t('wizard.regenerate')}
              </button>
            </div>
            <textarea
              className="generated-text"
              rows={10}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                store.setText('finance', e.target.value);
              }}
            />
          </>
        ) : (
          <div className="wizard-generate-cta">
            <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
              {generating ? t('wizard.generating') : t('wizard.generate')}
            </button>
          </div>
        )}
      </div>

      <div className="wizard-nav">
        <button className="btn btn-ghost" onClick={onBack}>{t('wizard.back')}</button>
        <button className="btn btn-primary" onClick={onNext} disabled={!text}>
          {t('wizard.next')}
        </button>
      </div>
    </div>
  );
}
