import { useState, type FormEvent } from 'react';
import { api } from '../api/client';

interface Props {
  source?: string;
}

export default function NewsletterForm({ source = 'landing' }: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await api.post('/newsletter/signup', {
        email,
        source,
        language: navigator.language.slice(0, 2),
      });
      setStatus('ok');
      setEmail('');
    } catch {
      setStatus('err');
    }
  };

  if (status === 'ok') {
    return (
      <div className="newsletter-ok">
        <span aria-hidden>✓</span> Danke! Du hörst von uns, sobald es News gibt.
      </div>
    );
  }

  return (
    <form className="newsletter-form" onSubmit={submit}>
      <div className="newsletter-copy">
        <strong>Updates zum Produkt und neuen Sprachen</strong>
        <span>Keine Werbung, kein Spam. Abmeldung jederzeit per Klick.</span>
      </div>
      <div className="newsletter-row">
        <input
          type="email"
          required
          placeholder="deine@mail.de"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="E-Mail-Adresse für Newsletter"
        />
        <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
          {status === 'sending' ? '…' : 'Anmelden'}
        </button>
      </div>
      {status === 'err' && <p className="error-text">Bitte später erneut versuchen.</p>}
    </form>
  );
}
