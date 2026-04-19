import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { updatePlan } from '../api/client';
import { getModelDefaults } from '../wizard/defaults';
import { useDataStore } from './useDataStore';

export type Answers = Record<string, Record<string, unknown>>;
export type Texts = Record<string, string>;

interface PlanState {
  planId: string | null;
  language: string;
  country: string | null;
  currentSectionIndex: number;
  currentStepIndex: number;
  answers: Answers;
  texts: Texts;
  finance: Record<string, unknown>;
  /** Fields whose value was supplied by applyModelDefaults (not typed by user).
   *  Keyed as "stepId.fieldId". Used to visually mark prefills as "Vorschlag". */
  prefilled: Record<string, boolean>;
  setPlanId: (id: string) => void;
  setLanguage: (lang: string) => void;
  setCountry: (c: string | null) => void;
  setAnswer: (stepId: string, fieldId: string, value: unknown) => void;
  setText: (sectionId: string, text: string) => void;
  setFinance: (data: Record<string, unknown>) => void;
  setPosition: (section: number, step: number) => void;
  /** Fill empty wizard fields + finance sample with realistic defaults for this model. */
  applyModelDefaults: (modelId: string) => void;
  reset: () => void;
  persistToServer: () => Promise<void>;
}

const initial = {
  planId: null as string | null,
  language: 'de',
  country: null as string | null,
  currentSectionIndex: 0,
  currentStepIndex: 0,
  answers: {} as Answers,
  texts: {} as Texts,
  finance: {} as Record<string, unknown>,
  prefilled: {} as Record<string, boolean>,
};

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      ...initial,
      setPlanId: (id) => set({ planId: id }),
      setLanguage: (lang) => set({ language: lang }),
      setCountry: (c) => set({ country: c }),
      setAnswer: (stepId, fieldId, value) =>
        set((state) => ({
          answers: {
            ...state.answers,
            [stepId]: { ...(state.answers[stepId] || {}), [fieldId]: value },
          },
          // user-typed answers are no longer "prefilled" — drop the flag
          prefilled: state.prefilled[`${stepId}.${fieldId}`]
            ? Object.fromEntries(Object.entries(state.prefilled).filter(([k]) => k !== `${stepId}.${fieldId}`))
            : state.prefilled,
        })),
      setText: (sectionId, text) =>
        set((state) => ({ texts: { ...state.texts, [sectionId]: text } })),
      setFinance: (data) => set({ finance: data }),
      setPosition: (section, step) =>
        set({ currentSectionIndex: section, currentStepIndex: step }),
      applyModelDefaults: (modelId) => {
        const d = getModelDefaults(modelId);
        const state = get();
        const nextAnswers: Answers = { ...state.answers };
        const nextPrefilled = { ...state.prefilled };
        // Only fill empty fields; never overwrite user input.
        Object.entries(d.stepAnswers).forEach(([stepId, fields]) => {
          const existingStep = nextAnswers[stepId] || {};
          const mergedStep = { ...existingStep };
          Object.entries(fields).forEach(([fieldId, value]) => {
            const current = existingStep[fieldId];
            const isEmpty = current === undefined || current === null || current === '' ||
              (Array.isArray(current) && current.length === 0);
            if (isEmpty) {
              mergedStep[fieldId] = value;
              nextPrefilled[`${stepId}.${fieldId}`] = true;
            }
          });
          nextAnswers[stepId] = mergedStep;
        });
        // Finance: only fill when the user hasn't edited anything yet.
        const f = state.finance as { periods?: unknown[]; startingCash?: number };
        const financeEmpty = !f.periods || (Array.isArray(f.periods) && f.periods.length === 0);
        const nextFinance = financeEmpty ? { startingCash: d.finance.startingCash, periods: d.finance.periods } : state.finance;
        set({ answers: nextAnswers, prefilled: nextPrefilled, finance: nextFinance });

        // Seed the FinancePlanner's editor store too so the Zahlen-Tabelle
        // shows realistic numbers that match this business model. We only
        // reseed when the user hasn't edited — preserve custom input.
        const ds = useDataStore.getState();
        const isDefaultSample = ds.periods.length === 6
          && ds.periods[0]?.label === 'Jan'
          && ds.periods[0]?.revenue === 48000;
        if (isDefaultSample) {
          ds.setPeriods(d.finance.periods);
          ds.setStartingCash(d.finance.startingCash);
        }
      },
      reset: () => set(initial),
      persistToServer: async () => {
        const { planId, answers, texts, finance } = get();
        if (!planId) return;
        await updatePlan(planId, { answers, texts, finance });
      },
    }),
    { name: 'bp24-plan' }
  )
);
