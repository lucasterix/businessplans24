import type { ChartKind } from './MiniCharts';
import { CHART_KIND_LABELS } from './MiniCharts';

interface Props {
  value: ChartKind;
  onChange: (k: ChartKind) => void;
  allow?: ChartKind[];
  compact?: boolean;
}

const DEFAULT_ALLOW: ChartKind[] = ['bar', 'bar-stacked', 'line', 'area', 'doughnut', 'polar'];

const ICONS: Record<ChartKind, string> = {
  bar: '▬',
  'bar-stacked': '▤',
  line: '╱',
  area: '◢',
  doughnut: '◯',
  polar: '✦',
};

export default function ChartTypePicker({ value, onChange, allow = DEFAULT_ALLOW, compact = false }: Props) {
  return (
    <div className={`chart-picker ${compact ? 'chart-picker-compact' : ''}`} role="group" aria-label="Diagrammtyp wählen">
      {allow.map((k) => (
        <button
          key={k}
          type="button"
          className={`chart-picker-chip ${k === value ? 'is-active' : ''}`}
          onClick={() => onChange(k)}
          title={CHART_KIND_LABELS[k]}
          aria-pressed={k === value}
        >
          <span className="chart-picker-icon" aria-hidden>{ICONS[k]}</span>
          {!compact && <span>{CHART_KIND_LABELS[k]}</span>}
        </button>
      ))}
    </div>
  );
}
