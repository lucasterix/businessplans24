export default function TrustRow() {
  const items = [
    { icon: '🔒', label: 'DSGVO-konform', desc: 'Server in Frankfurt' },
    { icon: '💳', label: 'Stripe-gesichert', desc: 'PCI-DSS Level 1' },
    { icon: '↩️', label: '14 Tage Widerruf', desc: 'Vor dem Download' },
    { icon: '🇩🇪', label: 'Made in Germany', desc: 'Göttingen' },
  ];
  return (
    <div className="trust-row">
      {items.map((it) => (
        <div key={it.label} className="trust-chip">
          <span className="trust-chip-icon" aria-hidden>{it.icon}</span>
          <div>
            <strong>{it.label}</strong>
            <span>{it.desc}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
