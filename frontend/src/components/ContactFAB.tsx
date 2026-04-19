import { useState } from 'react';

export default function ContactFAB() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="contact-fab"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Kontakt schließen' : 'Fragen oder Hilfe?'}
      >
        {open ? '×' : '💬'}
      </button>
      {open && (
        <div className="contact-panel" role="dialog" aria-label="Kontakt">
          <header>
            <strong>Fragen? Wir helfen.</strong>
            <p>Antworten meist innerhalb weniger Stunden.</p>
          </header>
          <a className="contact-option" href="mailto:info@businessplans24.com">
            <span className="contact-icon" aria-hidden>✉️</span>
            <div>
              <strong>E-Mail</strong>
              <span>info@businessplans24.com</span>
            </div>
          </a>
          <a
            className="contact-option"
            href="https://wa.me/4917643677735?text=Hallo%2C%20ich%20habe%20eine%20Frage%20zu%20Businessplan24"
            target="_blank"
            rel="noreferrer"
          >
            <span className="contact-icon" aria-hidden>📱</span>
            <div>
              <strong>WhatsApp</strong>
              <span>Schreib uns direkt</span>
            </div>
          </a>
          <footer>
            <span>Du bekommst innerhalb von 24 Std. Antwort (Mo–Fr).</span>
          </footer>
        </div>
      )}
    </>
  );
}
