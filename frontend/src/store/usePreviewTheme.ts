import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PreviewAccent = 'blue' | 'green' | 'graphite' | 'terracotta' | 'aubergine';
export type PreviewFont = 'serif' | 'sans' | 'modern';

export const ACCENT_COLORS: Record<PreviewAccent, { name: string; hex: string; soft: string }> = {
  blue: { name: 'Klassisch', hex: '#0b5cff', soft: 'rgba(11, 92, 255, 0.1)' },
  green: { name: 'Nachhaltig', hex: '#1f9254', soft: 'rgba(31, 146, 84, 0.1)' },
  graphite: { name: 'Graphit', hex: '#1d1d1f', soft: 'rgba(29, 29, 31, 0.08)' },
  terracotta: { name: 'Terracotta', hex: '#c2410c', soft: 'rgba(194, 65, 12, 0.1)' },
  aubergine: { name: 'Aubergine', hex: '#701a75', soft: 'rgba(112, 26, 117, 0.1)' },
};

export const FONT_FAMILIES: Record<PreviewFont, { name: string; stack: string }> = {
  serif: { name: 'Serif (klassisch)', stack: "'Charter', 'Iowan Old Style', Georgia, 'Times New Roman', serif" },
  sans: { name: 'Sans (modern)', stack: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  modern: { name: 'Display (minimal)', stack: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
};

export interface Currency {
  code: string;
  symbol: string;
  label: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'GBP', symbol: '£', label: 'Britisches Pfund' },
  { code: 'CHF', symbol: 'CHF', label: 'Schweizer Franken' },
  { code: 'PLN', symbol: 'zł', label: 'Złoty' },
  { code: 'CZK', symbol: 'Kč', label: 'Tschechische Krone' },
  { code: 'SEK', symbol: 'kr', label: 'Schwedische Krone' },
];

interface PreviewThemeState {
  accent: PreviewAccent;
  font: PreviewFont;
  hiddenSections: string[];
  currency: string;
  setAccent: (a: PreviewAccent) => void;
  setFont: (f: PreviewFont) => void;
  toggleSection: (id: string) => void;
  setCurrency: (code: string) => void;
}

export const usePreviewTheme = create<PreviewThemeState>()(
  persist(
    (set, get) => ({
      accent: 'blue',
      font: 'serif',
      hiddenSections: [],
      currency: 'EUR',
      setAccent: (a) => set({ accent: a }),
      setFont: (f) => set({ font: f }),
      toggleSection: (id) => {
        const cur = get().hiddenSections;
        set({ hiddenSections: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] });
      },
      setCurrency: (code) => set({ currency: code }),
    }),
    { name: 'bp24-preview-theme' }
  )
);
