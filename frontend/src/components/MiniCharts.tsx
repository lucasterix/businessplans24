import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import type { Period } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

const baseOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { color: '#cbd5e1', boxWidth: 12 } } },
  scales: {
    x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.12)' } },
    y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.12)' } },
  },
};

export function ProfitabilityMini({ periods }: { periods: Period[] }) {
  const data = useMemo(
    () => ({
      labels: periods.map((p) => p.label),
      datasets: [
        {
          label: 'Umsatz',
          data: periods.map((p) => p.revenue),
          backgroundColor: 'rgba(56,189,248,0.75)',
        },
        {
          label: 'Kosten',
          data: periods.map((p) => p.costs),
          backgroundColor: 'rgba(244,114,182,0.75)',
        },
        {
          label: 'Gewinn',
          data: periods.map((p) => p.revenue - p.costs),
          backgroundColor: 'rgba(34,197,94,0.75)',
        },
      ],
    }),
    [periods]
  );
  return (
    <div className="mini-chart">
      <h4>Rentabilität</h4>
      <div className="mini-chart-canvas">
        <Bar data={data} options={baseOpts} />
      </div>
    </div>
  );
}

export function LiquidityMini({
  periods,
  startingCash,
}: {
  periods: Period[];
  startingCash: number;
}) {
  const data = useMemo(() => {
    let cash = startingCash;
    const running = periods.map((p) => {
      cash = cash + p.cashIn - p.cashOut;
      return cash;
    });
    return {
      labels: periods.map((p) => p.label),
      datasets: [
        {
          label: 'Kassenstand',
          data: running,
          borderColor: 'rgba(56,189,248,1)',
          backgroundColor: 'rgba(56,189,248,0.2)',
          fill: true,
          tension: 0.25,
        },
      ],
    };
  }, [periods, startingCash]);
  return (
    <div className="mini-chart">
      <h4>Liquidität</h4>
      <div className="mini-chart-canvas">
        <Line data={data} options={baseOpts} />
      </div>
    </div>
  );
}
