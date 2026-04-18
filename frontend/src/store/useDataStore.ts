import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Period } from '../types';

export type ChartOverride = {
  enabled: boolean;
  startingCash: number;
  periods: Period[];
};

type DataState = {
  startingCash: number;
  periods: Period[];
  chartOverrides: Record<string, ChartOverride>;

  setStartingCash: (v: number) => void;
  setPeriods: (p: Period[]) => void;
  upsertPeriod: (index: number, patch: Partial<Period>) => void;
  addPeriod: () => void;
  removePeriod: (index: number) => void;
  reset: () => void;
  loadSample: () => void;

  enableChartOverride: (chartId: string) => void;
  disableChartOverride: (chartId: string) => void;
  setChartStartingCash: (chartId: string, v: number) => void;
  setChartPeriods: (chartId: string, periods: Period[]) => void;
  upsertChartPeriod: (chartId: string, index: number, patch: Partial<Period>) => void;
  addChartPeriod: (chartId: string) => void;
  removeChartPeriod: (chartId: string, index: number) => void;
  resetChartOverride: (chartId: string) => void;
};

const samplePeriods: Period[] = [
  { label: 'Jan', revenue: 48000, costs: 32000, cashIn: 42000, cashOut: 34000 },
  { label: 'Feb', revenue: 52000, costs: 33500, cashIn: 47000, cashOut: 35000 },
  { label: 'Mar', revenue: 61000, costs: 36000, cashIn: 54000, cashOut: 37500 },
  { label: 'Apr', revenue: 58000, costs: 35000, cashIn: 55000, cashOut: 36000 },
  { label: 'May', revenue: 67000, costs: 38500, cashIn: 60000, cashOut: 39500 },
  { label: 'Jun', revenue: 72000, costs: 41000, cashIn: 66000, cashOut: 41500 },
];

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

const withOverride = (
  state: DataState,
  chartId: string,
  fn: (o: ChartOverride) => ChartOverride
): Record<string, ChartOverride> => {
  const existing =
    state.chartOverrides[chartId] ?? {
      enabled: true,
      startingCash: state.startingCash,
      periods: clone(state.periods),
    };
  return { ...state.chartOverrides, [chartId]: fn(existing) };
};

export const useDataStore = create<DataState>()(
  persist(
    (set) => ({
      startingCash: 25000,
      periods: samplePeriods,
      chartOverrides: {},

      setStartingCash: (v) => set({ startingCash: v }),
      setPeriods: (periods) => set({ periods }),
      upsertPeriod: (index, patch) =>
        set((s) => ({
          periods: s.periods.map((p, i) => (i === index ? { ...p, ...patch } : p)),
        })),
      addPeriod: () =>
        set((s) => ({
          periods: [
            ...s.periods,
            { label: `P${s.periods.length + 1}`, revenue: 0, costs: 0, cashIn: 0, cashOut: 0 },
          ],
        })),
      removePeriod: (index) =>
        set((s) => ({ periods: s.periods.filter((_, i) => i !== index) })),
      reset: () => set({ startingCash: 25000, periods: samplePeriods, chartOverrides: {} }),
      loadSample: () => set({ startingCash: 25000, periods: samplePeriods }),

      enableChartOverride: (chartId) =>
        set((s) => ({
          chartOverrides: withOverride(s, chartId, (o) => ({ ...o, enabled: true })),
        })),
      disableChartOverride: (chartId) =>
        set((s) => {
          const existing = s.chartOverrides[chartId];
          if (!existing) return {} as Partial<DataState>;
          return {
            chartOverrides: { ...s.chartOverrides, [chartId]: { ...existing, enabled: false } },
          };
        }),
      setChartStartingCash: (chartId, v) =>
        set((s) => ({
          chartOverrides: withOverride(s, chartId, (o) => ({ ...o, startingCash: v })),
        })),
      setChartPeriods: (chartId, periods) =>
        set((s) => ({
          chartOverrides: withOverride(s, chartId, (o) => ({ ...o, periods })),
        })),
      upsertChartPeriod: (chartId, index, patch) =>
        set((s) => ({
          chartOverrides: withOverride(s, chartId, (o) => ({
            ...o,
            periods: o.periods.map((p, i) => (i === index ? { ...p, ...patch } : p)),
          })),
        })),
      addChartPeriod: (chartId) =>
        set((s) => ({
          chartOverrides: withOverride(s, chartId, (o) => ({
            ...o,
            periods: [
              ...o.periods,
              { label: `P${o.periods.length + 1}`, revenue: 0, costs: 0, cashIn: 0, cashOut: 0 },
            ],
          })),
        })),
      removeChartPeriod: (chartId, index) =>
        set((s) => ({
          chartOverrides: withOverride(s, chartId, (o) => ({
            ...o,
            periods: o.periods.filter((_, i) => i !== index),
          })),
        })),
      resetChartOverride: (chartId) =>
        set((s) => {
          const next = { ...s.chartOverrides };
          delete next[chartId];
          return { chartOverrides: next };
        }),
    }),
    { name: 'bp24-finance' }
  )
);

export function useEffectiveData(chartId: string): {
  startingCash: number;
  periods: Period[];
  isOverridden: boolean;
} {
  const globalStarting = useDataStore((s) => s.startingCash);
  const globalPeriods = useDataStore((s) => s.periods);
  const override = useDataStore((s) => s.chartOverrides[chartId]);
  if (override?.enabled) {
    return {
      startingCash: override.startingCash,
      periods: override.periods,
      isOverridden: true,
    };
  }
  return { startingCash: globalStarting, periods: globalPeriods, isOverridden: false };
}
