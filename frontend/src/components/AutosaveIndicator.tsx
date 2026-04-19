import { useEffect, useState } from 'react';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface Props {
  state: SaveState;
  savedAt?: number;
}

export default function AutosaveIndicator({ state, savedAt }: Props) {
  const [ago, setAgo] = useState<string>('');
  useEffect(() => {
    if (!savedAt || state !== 'saved') return;
    const tick = () => {
      const secs = Math.max(0, Math.floor((Date.now() - savedAt) / 1000));
      setAgo(secs < 5 ? 'gerade eben' : secs < 60 ? `vor ${secs}s` : `vor ${Math.floor(secs / 60)}m`);
    };
    tick();
    const i = setInterval(tick, 5000);
    return () => clearInterval(i);
  }, [savedAt, state]);

  return (
    <div className={`autosave autosave-${state}`} aria-live="polite">
      {state === 'saving' && (
        <>
          <span className="autosave-spinner" /> Speichert…
        </>
      )}
      {state === 'saved' && <>✓ Gespeichert {ago}</>}
      {state === 'error' && <>⚠ Nicht gespeichert</>}
      {state === 'idle' && <>&nbsp;</>}
    </div>
  );
}
