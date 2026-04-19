import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Doughnut, PolarArea } from 'react-chartjs-2';
import type { Period } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

export type ChartKind = 'bar' | 'bar-stacked' | 'line' | 'area' | 'doughnut' | 'polar';

export const CHART_KIND_LABELS: Record<ChartKind, string> = {
  bar: 'Balken',
  'bar-stacked': 'Balken gestapelt',
  line: 'Linie',
  area: 'Fläche',
  doughnut: 'Donut',
  polar: 'Polar',
};

const ACCENT = '#0b5cff';
const GREEN = '#22c55e';
const RED = '#f87171';
const PURPLE = '#a78bfa';
const ORANGE = '#f59e0b';
const TICK = '#48484a';
const GRID = 'rgba(0, 0, 0, 0.06)';

const baseOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: TICK, boxWidth: 12, font: { size: 11 } } },
    tooltip: {
      backgroundColor: '#1d1d1f',
      titleColor: '#fff',
      bodyColor: '#e9eefb',
      padding: 10,
      cornerRadius: 8,
      borderWidth: 0,
    },
  },
  scales: {
    x: { ticks: { color: TICK, font: { size: 11 } }, grid: { color: GRID, drawBorder: false } },
    y: { ticks: { color: TICK, font: { size: 11 } }, grid: { color: GRID, drawBorder: false } },
  },
} as const;

function profitabilityData(periods: Period[]) {
  return {
    labels: periods.map((p) => p.label),
    datasets: [
      { label: 'Umsatz', data: periods.map((p) => p.revenue), backgroundColor: ACCENT + 'c0', borderColor: ACCENT, borderWidth: 1, fill: true, tension: 0.35 },
      { label: 'Kosten', data: periods.map((p) => p.costs), backgroundColor: RED + 'c0', borderColor: RED, borderWidth: 1, fill: true, tension: 0.35 },
      { label: 'Gewinn', data: periods.map((p) => p.revenue - p.costs), backgroundColor: GREEN + 'c0', borderColor: GREEN, borderWidth: 1, fill: true, tension: 0.35 },
    ],
  };
}

function liquidityData(periods: Period[], startingCash: number) {
  let cash = startingCash;
  const running = periods.map((p) => { cash = cash + p.cashIn - p.cashOut; return cash; });
  return {
    labels: periods.map((p) => p.label),
    datasets: [
      {
        label: 'Kassenstand',
        data: running,
        borderColor: ACCENT,
        backgroundColor: ACCENT + '28',
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
    ],
  };
}

function costStructureData(periods: Period[]) {
  const total = periods.reduce((sum, p) => sum + p.costs, 0);
  return {
    labels: periods.map((p) => p.label),
    datasets: [
      {
        label: 'Kostenverteilung',
        data: periods.map((p) => p.costs),
        backgroundColor: [ACCENT, GREEN, RED, PURPLE, ORANGE, '#14b8a6', '#fb923c'],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
    _total: total,
  } as unknown as ReturnType<typeof profitabilityData>;
}

interface ChartProps {
  periods: Period[];
  startingCash?: number;
  kind: ChartKind;
  dataKey: 'profitability' | 'liquidity' | 'costs';
}

function renderChart(kind: ChartKind, data: ReturnType<typeof profitabilityData>) {
  const isStacked = kind === 'bar-stacked';
  const isArea = kind === 'area';

  if (kind === 'doughnut') return <Doughnut data={data} options={{ ...baseOpts, scales: undefined }} />;
  if (kind === 'polar') return <PolarArea data={data} options={{ ...baseOpts, scales: undefined }} />;

  if (kind === 'line' || kind === 'area') {
    const lineData = {
      ...data,
      datasets: data.datasets.map((d) => ({
        ...d,
        fill: isArea,
        backgroundColor: isArea ? d.borderColor + '28' : d.borderColor,
        pointRadius: 3,
      })),
    };
    return <Line data={lineData} options={baseOpts} />;
  }

  // bar / bar-stacked
  return (
    <Bar
      data={data}
      options={{
        ...baseOpts,
        scales: {
          x: { ...baseOpts.scales.x, stacked: isStacked },
          y: { ...baseOpts.scales.y, stacked: isStacked },
        },
      }}
    />
  );
}

export function FlexChart({ periods, startingCash = 0, kind, dataKey }: ChartProps) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const data = useMemo<ReturnType<typeof profitabilityData>>(() => {
    if (dataKey === 'liquidity') return liquidityData(periods, startingCash) as unknown as ReturnType<typeof profitabilityData>;
    if (dataKey === 'costs') return costStructureData(periods);
    return profitabilityData(periods);
  }, [periods, startingCash, dataKey]);

  return renderChart(kind, data);
}

/* Backward-compatible default views */
export function ProfitabilityMini({ periods }: { periods: Period[] }) {
  return <FlexChart periods={periods} kind="bar" dataKey="profitability" />;
}

export function LiquidityMini({ periods, startingCash }: { periods: Period[]; startingCash: number }) {
  return <FlexChart periods={periods} startingCash={startingCash} kind="area" dataKey="liquidity" />;
}
