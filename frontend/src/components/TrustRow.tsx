const items = [
  {
    svg: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5l8-3z" />
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: 'DSGVO-konform',
    desc: 'Server in Frankfurt',
  },
  {
    svg: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 21V10a2 2 0 0 1 1-1.7l7-4a2 2 0 0 1 2 0l7 4A2 2 0 0 1 22 10v11" />
        <path d="M4 21h18M10 21v-7h4v7" strokeLinecap="round" />
      </svg>
    ),
    label: 'IHK-Gliederung',
    desc: 'Empfehlung der Kammern',
  },
  {
    svg: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 20h18" strokeLinecap="round" />
        <path d="M6 20V12m5 8V8m5 12v-6m5 6V4" strokeLinecap="round" />
      </svg>
    ),
    label: 'Zertifizierte Finanzcharts',
    desc: 'Nach Standards, die Banken sehen wollen',
  },
  {
    svg: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 12a9 9 0 1 0 3-6.7" />
        <polyline points="3 4 3 10 9 10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: '14 Tage Widerruf',
    desc: 'Vor dem Download',
  },
];

export default function TrustRow() {
  return (
    <div className="trust-row">
      {items.map((it) => (
        <div key={it.label} className="trust-chip">
          <span className="trust-chip-icon" aria-hidden>{it.svg}</span>
          <div>
            <strong>{it.label}</strong>
            <span>{it.desc}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
