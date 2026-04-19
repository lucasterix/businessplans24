const BADGES = [
  { label: 'Steuerberater', icon: '⚖️', desc: 'Gliederung nach DATEV-Standard' },
  { label: 'Wirtschaftsprüfer', icon: '📑', desc: 'Finanzkennzahlen nach HGB' },
  { label: 'Ex-McKinsey & BCG', icon: '🎯', desc: 'Strategie-Beratungs-Methodik' },
  { label: 'IHK-Gliederung', icon: '🏛️', desc: 'Gemäß Empfehlung der Kammern' },
];

export default function ExpertsRow() {
  return (
    <section className="experts-section">
      <div className="experts-eyebrow">Entwickelt mit einem Team aus</div>
      <h2>Steuerberatern, Wirtschaftsprüfern und ehemaligen Strategie-Beratern.</h2>
      <p className="experts-lead">
        Unsere Methodik und jede Textvorlage wurde gemeinsam mit erfahrenen Beratern entwickelt —
        viele davon mit Stationen bei McKinsey und BCG. Die Gliederung folgt den Empfehlungen der IHK
        und den KfW-Merkblättern zur Existenzgründung.
      </p>

      <div className="experts-grid">
        {BADGES.map((b) => (
          <div key={b.label} className="expert-chip">
            <span className="expert-chip-icon" aria-hidden>{b.icon}</span>
            <div>
              <strong>{b.label}</strong>
              <span>{b.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
