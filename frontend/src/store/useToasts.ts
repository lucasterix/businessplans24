import { create } from 'zustand';

export type ToastKind = 'info' | 'success' | 'error' | 'saved';

export interface Toast {
  id: string;
  kind: ToastKind;
  message: string;
  action?: { label: string; onClick: () => void };
  durationMs?: number;
}

interface ToastState {
  toasts: Toast[];
  push: (t: Omit<Toast, 'id'>) => string;
  remove: (id: string) => void;
}

let nextId = 1;

export const useToasts = create<ToastState>((set, get) => ({
  toasts: [],
  push: (t) => {
    const id = `toast-${nextId++}`;
    const duration = t.durationMs ?? (t.kind === 'error' ? 6000 : 2800);
    set((state) => ({ toasts: [...state.toasts, { ...t, id }] }));
    if (duration > 0) {
      setTimeout(() => get().remove(id), duration);
    }
    return id;
  },
  remove: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  info: (message: string, opts?: Partial<Toast>) => useToasts.getState().push({ kind: 'info', message, ...opts }),
  success: (message: string, opts?: Partial<Toast>) => useToasts.getState().push({ kind: 'success', message, ...opts }),
  error: (message: string, opts?: Partial<Toast>) => useToasts.getState().push({ kind: 'error', message, ...opts }),
  saved: (message = 'Gespeichert', opts?: Partial<Toast>) =>
    useToasts.getState().push({ kind: 'saved', message, durationMs: 1400, ...opts }),
};
