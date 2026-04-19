import { create } from 'zustand';

interface ExitIntentState {
  armed: boolean;
  arm: () => void;
  disarm: () => void;
}

/**
 * Global flag for the ExitIntent popup. PriceAnchor (or any other
 * conversion-relevant component) calls arm() once it becomes visible.
 * The popup only listens for mouseleave while armed.
 */
export const useExitIntent = create<ExitIntentState>((set) => ({
  armed: false,
  arm: () => set({ armed: true }),
  disarm: () => set({ armed: false }),
}));
