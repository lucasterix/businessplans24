import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PreviewAccent = 'blue' | 'green' | 'graphite' | 'terracotta' | 'aubergine';
export type PreviewFont = 'serif' | 'sans' | 'modern';
export type CoverStyle = 'classic' | 'modern' | 'minimal' | 'bold' | 'editorial';
export type CoverDecor = 'none' | 'chart' | 'wave' | 'geometric';

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

export const COVER_STYLES: Record<CoverStyle, { name: string; desc: string }> = {
  classic: { name: 'Klassisch', desc: 'Zentriert, formal — passt zu Banken' },
  modern: { name: 'Modern', desc: 'Linksbündig, kräftig — für Pitches & Investoren' },
  minimal: { name: 'Minimal', desc: 'Reduziert, viel Weißraum' },
  bold: { name: 'Bold', desc: 'Große Akzentfläche — markant für Investoren' },
  editorial: { name: 'Editorial', desc: 'Band oben, wie ein Magazin-Cover' },
};

export const COVER_DECORS: Record<CoverDecor, { name: string; desc: string }> = {
  none: { name: 'Keine', desc: 'Schlicht, ohne Grafik' },
  chart: { name: 'Wachstum', desc: 'Balken & Pfeil nach oben' },
  wave: { name: 'Welle', desc: 'Geschwungener Akzent unten' },
  geometric: { name: 'Geometrisch', desc: 'Kreise & Linien, abstrakt' },
};

// Curated preset bundles that set cover/accent/font/layout in one click.
// User can still tweak anything afterwards — presets are a starting point.
export interface DesignTheme {
  id: string;
  name: string;
  desc: string;
  accent: PreviewAccent;
  font: PreviewFont;
  coverStyle: CoverStyle;
  coverDecor: CoverDecor;
  sectionStripe: boolean;
  sectionDividers: boolean;
  appendixTwoCol: boolean;
  pageNumFormat: PageNumFormat;
  showHeader: boolean;
}

export const DESIGN_THEMES: DesignTheme[] = [
  {
    id: 'bank',
    name: 'Klassisch Bank',
    desc: 'Für Hausbank, KfW, Steuerberater — reduziert, seriös',
    accent: 'graphite', font: 'serif', coverStyle: 'classic', coverDecor: 'none',
    sectionStripe: false, sectionDividers: false, appendixTwoCol: false,
    pageNumFormat: 'xOfY', showHeader: false,
  },
  {
    id: 'modern',
    name: 'Modern Pitch',
    desc: 'Für Investoren-Pitches — kräftig, dynamisch',
    accent: 'blue', font: 'sans', coverStyle: 'modern', coverDecor: 'chart',
    sectionStripe: true, sectionDividers: true, appendixTwoCol: false,
    pageNumFormat: 'xOfY', showHeader: true,
  },
  {
    id: 'minimal',
    name: 'Minimal Editorial',
    desc: 'Viel Weißraum, zurückhaltende Typografie',
    accent: 'aubergine', font: 'modern', coverStyle: 'minimal', coverDecor: 'none',
    sectionStripe: false, sectionDividers: false, appendixTwoCol: false,
    pageNumFormat: 'simple', showHeader: false,
  },
  {
    id: 'editorial',
    name: 'Magazin',
    desc: 'Top-Band, Serif-Titel — wie ein Businessmagazin',
    accent: 'aubergine', font: 'serif', coverStyle: 'editorial', coverDecor: 'wave',
    sectionStripe: false, sectionDividers: true, appendixTwoCol: true,
    pageNumFormat: 'xOfY', showHeader: false,
  },
  {
    id: 'bold',
    name: 'Bold Startup',
    desc: 'Farbfeld + geometrisch — für Gründer:innen mit Selbstbewusstsein',
    accent: 'terracotta', font: 'sans', coverStyle: 'bold', coverDecor: 'geometric',
    sectionStripe: true, sectionDividers: true, appendixTwoCol: true,
    pageNumFormat: 'xOfY', showHeader: true,
  },
  {
    id: 'green',
    name: 'Nachhaltig',
    desc: 'Grün + Welle — für Nachhaltigkeits- & Sozialunternehmen',
    accent: 'green', font: 'sans', coverStyle: 'modern', coverDecor: 'wave',
    sectionStripe: true, sectionDividers: false, appendixTwoCol: false,
    pageNumFormat: 'xOfY', showHeader: false,
  },
];

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

export type PageNumFormat = 'simple' | 'xOfY' | 'hidden';

interface PreviewThemeState {
  accent: PreviewAccent;
  font: PreviewFont;
  coverStyle: CoverStyle;
  coverDecor: CoverDecor;
  logoDataUrl: string | null;
  footerText: string;
  showCoverDate: boolean;
  showToc: boolean;
  // New formatting options
  showHeader: boolean;
  pageNumFormat: PageNumFormat;
  blankBetween: boolean;
  sectionDividers: boolean;
  financeCharts: boolean;
  appendixTwoCol: boolean;
  sectionStripe: boolean;
  hiddenSections: string[];
  sectionOrder: string[];
  currency: string;
  setAccent: (a: PreviewAccent) => void;
  setFont: (f: PreviewFont) => void;
  setCoverStyle: (s: CoverStyle) => void;
  setCoverDecor: (d: CoverDecor) => void;
  setLogo: (dataUrl: string | null) => void;
  setFooterText: (t: string) => void;
  setShowCoverDate: (v: boolean) => void;
  setShowToc: (v: boolean) => void;
  setShowHeader: (v: boolean) => void;
  setPageNumFormat: (f: PageNumFormat) => void;
  setBlankBetween: (v: boolean) => void;
  setSectionDividers: (v: boolean) => void;
  setFinanceCharts: (v: boolean) => void;
  setAppendixTwoCol: (v: boolean) => void;
  setSectionStripe: (v: boolean) => void;
  toggleSection: (id: string) => void;
  setSectionOrder: (order: string[]) => void;
  moveSection: (id: string, direction: 'up' | 'down') => void;
  setCurrency: (code: string) => void;
  applyDesignTheme: (id: string) => void;
  exportSettings: () => Record<string, unknown>;
  loadFromPlan: (s: Record<string, unknown>) => void;
}

export const DEFAULT_SECTION_ORDER = [
  'executive_summary',
  'business_idea',
  'customers',
  'company',
  'finance',
  'appendix',
];

export function mergeSectionOrder(stored: string[] | undefined, knownIds: string[]): string[] {
  const storedValid = (stored || []).filter((id) => knownIds.includes(id));
  const missing = knownIds.filter((id) => !storedValid.includes(id));
  return [...storedValid, ...missing];
}

export const usePreviewTheme = create<PreviewThemeState>()(
  persist(
    (set, get) => ({
      accent: 'blue',
      font: 'serif',
      coverStyle: 'classic',
      coverDecor: 'chart',
      logoDataUrl: null,
      footerText: '',
      showCoverDate: true,
      showToc: true,
      showHeader: false,
      pageNumFormat: 'xOfY',
      blankBetween: false,
      sectionDividers: false,
      financeCharts: true,
      appendixTwoCol: false,
      sectionStripe: true,
      hiddenSections: [],
      sectionOrder: DEFAULT_SECTION_ORDER,
      currency: 'EUR',
      setAccent: (a) => set({ accent: a }),
      setFont: (f) => set({ font: f }),
      setCoverStyle: (s) => set({ coverStyle: s }),
      setCoverDecor: (d) => set({ coverDecor: d }),
      setLogo: (dataUrl) => set({ logoDataUrl: dataUrl }),
      setFooterText: (t) => set({ footerText: t }),
      setShowCoverDate: (v) => set({ showCoverDate: v }),
      setShowToc: (v) => set({ showToc: v }),
      setShowHeader: (v) => set({ showHeader: v }),
      setPageNumFormat: (f) => set({ pageNumFormat: f }),
      setBlankBetween: (v) => set({ blankBetween: v }),
      setSectionDividers: (v) => set({ sectionDividers: v }),
      setFinanceCharts: (v) => set({ financeCharts: v }),
      setAppendixTwoCol: (v) => set({ appendixTwoCol: v }),
      setSectionStripe: (v) => set({ sectionStripe: v }),
      toggleSection: (id) => {
        const cur = get().hiddenSections;
        set({ hiddenSections: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] });
      },
      setSectionOrder: (order) => set({ sectionOrder: order }),
      moveSection: (id, direction) => {
        const order = [...get().sectionOrder];
        const idx = order.indexOf(id);
        if (idx < 0) return;
        const target = direction === 'up' ? idx - 1 : idx + 1;
        if (target < 0 || target >= order.length) return;
        [order[idx], order[target]] = [order[target], order[idx]];
        set({ sectionOrder: order });
      },
      setCurrency: (code) => set({ currency: code }),
      applyDesignTheme: (id) => {
        const theme = DESIGN_THEMES.find((t) => t.id === id);
        if (!theme) return;
        set({
          accent: theme.accent,
          font: theme.font,
          coverStyle: theme.coverStyle,
          coverDecor: theme.coverDecor,
          sectionStripe: theme.sectionStripe,
          sectionDividers: theme.sectionDividers,
          appendixTwoCol: theme.appendixTwoCol,
          pageNumFormat: theme.pageNumFormat,
          showHeader: theme.showHeader,
          // Dividers and blankBetween are mutually exclusive; keep invariant.
          blankBetween: theme.sectionDividers ? false : get().blankBetween,
        });
      },
      exportSettings: () => {
        const s = get();
        return {
          accentHex: ACCENT_COLORS[s.accent].hex,
          coverStyle: s.coverStyle,
          coverDecor: s.coverDecor,
          logoDataUrl: s.logoDataUrl,
          footerText: s.footerText,
          showCoverDate: s.showCoverDate,
          showToc: s.showToc,
          showHeader: s.showHeader,
          pageNumFormat: s.pageNumFormat,
          blankBetween: s.blankBetween,
          appendixTwoCol: s.appendixTwoCol,
          sectionStripe: s.sectionStripe,
          sectionDividers: s.sectionDividers,
          financeCharts: s.financeCharts,
          currency: s.currency,
          sectionOrder: s.sectionOrder,
          hiddenSections: s.hiddenSections,
        };
      },
      loadFromPlan: (s) => {
        const next: Partial<PreviewThemeState> = {};
        if (typeof s.coverStyle === 'string' && s.coverStyle in COVER_STYLES) {
          next.coverStyle = s.coverStyle as CoverStyle;
        }
        if (typeof s.coverDecor === 'string' && s.coverDecor in COVER_DECORS) {
          next.coverDecor = s.coverDecor as CoverDecor;
        }
        if (typeof s.logoDataUrl === 'string' || s.logoDataUrl === null) {
          next.logoDataUrl = s.logoDataUrl as string | null;
        }
        if (typeof s.footerText === 'string') next.footerText = s.footerText;
        if (typeof s.showCoverDate === 'boolean') next.showCoverDate = s.showCoverDate;
        if (typeof s.showToc === 'boolean') next.showToc = s.showToc;
        if (typeof s.showHeader === 'boolean') next.showHeader = s.showHeader;
        if (typeof s.pageNumFormat === 'string' && ['simple', 'xOfY', 'hidden'].includes(s.pageNumFormat)) {
          next.pageNumFormat = s.pageNumFormat as PageNumFormat;
        }
        if (typeof s.blankBetween === 'boolean') next.blankBetween = s.blankBetween;
        if (typeof s.appendixTwoCol === 'boolean') next.appendixTwoCol = s.appendixTwoCol;
        if (typeof s.sectionStripe === 'boolean') next.sectionStripe = s.sectionStripe;
        if (typeof s.sectionDividers === 'boolean') next.sectionDividers = s.sectionDividers;
        if (typeof s.financeCharts === 'boolean') next.financeCharts = s.financeCharts;
        if (Array.isArray(s.sectionOrder)) next.sectionOrder = s.sectionOrder as string[];
        if (Array.isArray(s.hiddenSections)) next.hiddenSections = s.hiddenSections as string[];
        if (Object.keys(next).length > 0) set(next);
      },
    }),
    { name: 'bp24-preview-theme' }
  )
);
