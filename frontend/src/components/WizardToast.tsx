import { useEffect, useState } from 'react';

interface Props {
  show: boolean;
  message: string;
  onDone: () => void;
}

export default function WizardToast({ show, message, onDone }: Props) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!show) return;
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 250);
    }, 2300);
    return () => clearTimeout(t);
  }, [show, onDone]);
  if (!show) return null;
  return (
    <div className={`wizard-toast ${visible ? 'is-visible' : ''}`} role="status">
      <span className="wizard-toast-emoji">🎉</span>
      <span>{message}</span>
    </div>
  );
}
