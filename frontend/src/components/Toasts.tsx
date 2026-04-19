import { useToasts } from '../store/useToasts';

const ICONS: Record<string, string> = {
  info: 'ℹ️',
  success: '✅',
  error: '⚠️',
  saved: '✓',
};

export default function Toasts() {
  const { toasts, remove } = useToasts();
  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="true">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.kind}`} role="status">
          <span className="toast-icon" aria-hidden>{ICONS[t.kind]}</span>
          <span className="toast-msg">{t.message}</span>
          {t.action && (
            <button type="button" className="toast-action" onClick={() => { t.action!.onClick(); remove(t.id); }}>
              {t.action.label}
            </button>
          )}
          <button type="button" className="toast-close" onClick={() => remove(t.id)} aria-label="Schließen">×</button>
        </div>
      ))}
    </div>
  );
}
