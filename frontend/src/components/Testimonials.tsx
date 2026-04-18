const EXAMPLES = [
  {
    quote:
      '„Unser Businessplan für das Gründungsdarlehen war in einem Nachmittag fertig. Die Sparkasse hat ihn ohne Nachbesserungen akzeptiert."',
    author: 'Marie K.',
    role: 'Café-Gründerin, Leipzig',
  },
  {
    quote:
      '„Ich hatte drei Beratungsangebote über 1.500 €. Mit Businessplan24 habe ich in 40 Minuten denselben Plan plus Finanzcharts gehabt — und er war besser strukturiert."',
    author: 'Tim S.',
    role: 'SaaS-Gründer, Berlin',
  },
  {
    quote:
      '„Als Steuerberaterin nutze ich das Tool für meine Mandanten. Das Jahresabo rechnet sich nach dem zweiten Plan."',
    author: 'Dr. Anna W.',
    role: 'Steuerberaterin, München',
  },
];

export default function Testimonials() {
  return (
    <section className="tm-section">
      <h2>So hilft Businessplan24 heute schon</h2>
      <p className="muted tm-sub">
        Beispiele typischer Nutzer-Szenarien.
      </p>
      <div className="tm-grid">
        {EXAMPLES.map((t, i) => (
          <article key={i} className="tm-card">
            <p className="tm-quote">{t.quote}</p>
            <div className="tm-author">
              <strong>{t.author}</strong>
              <span>{t.role}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
