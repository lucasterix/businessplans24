import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CurrencyCode =
  | 'EUR'
  | 'USD'
  | 'GBP'
  | 'CHF'
  | 'JPY'
  | 'CNY'
  | 'SEK'
  | 'NOK'
  | 'DKK'
  | 'PLN'
  | 'CZK'
  | 'CAD'
  | 'AUD';

export type CurrencyMeta = {
  code: CurrencyCode;
  label: string;
  symbol: string;
  locale: string;
  decimals: number;
};

export const currencies: Record<CurrencyCode, CurrencyMeta> = {
  EUR: { code: 'EUR', label: 'Euro', symbol: '€', locale: 'de-DE', decimals: 0 },
  USD: { code: 'USD', label: 'US Dollar', symbol: '$', locale: 'en-US', decimals: 0 },
  GBP: { code: 'GBP', label: 'British Pound', symbol: '£', locale: 'en-GB', decimals: 0 },
  CHF: { code: 'CHF', label: 'Swiss Franc', symbol: 'Fr.', locale: 'de-CH', decimals: 0 },
  JPY: { code: 'JPY', label: 'Japanese Yen', symbol: '¥', locale: 'ja-JP', decimals: 0 },
  CNY: { code: 'CNY', label: 'Chinese Yuan', symbol: '¥', locale: 'zh-CN', decimals: 0 },
  SEK: { code: 'SEK', label: 'Swedish Krona', symbol: 'kr', locale: 'sv-SE', decimals: 0 },
  NOK: { code: 'NOK', label: 'Norwegian Krone', symbol: 'kr', locale: 'nb-NO', decimals: 0 },
  DKK: { code: 'DKK', label: 'Danish Krone', symbol: 'kr', locale: 'da-DK', decimals: 0 },
  PLN: { code: 'PLN', label: 'Polish Zloty', symbol: 'zł', locale: 'pl-PL', decimals: 0 },
  CZK: { code: 'CZK', label: 'Czech Koruna', symbol: 'Kč', locale: 'cs-CZ', decimals: 0 },
  CAD: { code: 'CAD', label: 'Canadian Dollar', symbol: '$', locale: 'en-CA', decimals: 0 },
  AUD: { code: 'AUD', label: 'Australian Dollar', symbol: '$', locale: 'en-AU', decimals: 0 },
};

export const currencyList = Object.values(currencies);

type CurrencyState = {
  code: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
};

export const useCurrency = create<CurrencyState>()(
  persist(
    (set) => ({
      code: 'EUR',
      setCurrency: (code) => set({ code }),
    }),
    { name: 'liquidhub-currency' }
  )
);

export function formatMoney(value: number, code: CurrencyCode): string {
  const meta = currencies[code] ?? currencies.EUR;
  try {
    return new Intl.NumberFormat(meta.locale, {
      style: 'currency',
      currency: meta.code,
      maximumFractionDigits: meta.decimals,
    }).format(value);
  } catch {
    return `${meta.symbol}${value.toLocaleString(meta.locale)}`;
  }
}
