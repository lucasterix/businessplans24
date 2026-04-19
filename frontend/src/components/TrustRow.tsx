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
        <rect x="2" y="6" width="20" height="13" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
    label: 'Stripe-gesichert',
    desc: 'PCI-DSS Level 1',
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
  {
    svg: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 4h16v16H4z" />
        <line x1="4" y1="10" x2="20" y2="10" />
        <line x1="4" y1="14" x2="20" y2="14" />
      </svg>
    ),
    label: 'Made in Germany',
    desc: 'Göttingen',
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
