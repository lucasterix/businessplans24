import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { updatePlan } from '../api/client';

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
  setPlanId: (id: string) => void;
  setLanguage: (lang: string) => void;
  setCountry: (c: string | null) => void;
  setAnswer: (stepId: string, fieldId: string, value: unknown) => void;
  setText: (sectionId: string, text: string) => void;
  setFinance: (data: Record<string, unknown>) => void;
  setPosition: (section: number, step: number) => void;
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
        })),
      setText: (sectionId, text) =>
        set((state) => ({ texts: { ...state.texts, [sectionId]: text } })),
      setFinance: (data) => set({ finance: data }),
      setPosition: (section, step) =>
        set({ currentSectionIndex: section, currentStepIndex: step }),
      reset: () => set(initial),
      persistToServer: async () => {
        const { planId, answers, texts, finance } = get();
        if (!planId) return;
        await updatePlan(planId, { answers, texts, finance }).catch((err) => {
          console.warn('[plan.persist] failed, keeping local state', err);
        });
      },
    }),
    { name: 'bp24-plan' }
  )
);
