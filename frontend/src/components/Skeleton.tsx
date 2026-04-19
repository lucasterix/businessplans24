interface Props {
  variant?: 'page' | 'wizard' | 'card';
}

export default function Skeleton({ variant = 'page' }: Props) {
  if (variant === 'wizard') {
    return (
      <div className="skel skel-wizard">
        <div className="skel-bar skel-bar-sm" style={{ width: '40%' }} />
        <div className="skel-bar" style={{ width: '75%' }} />
        <div className="skel-bar" style={{ width: '90%' }} />
        <div className="skel-bar skel-bar-sm" style={{ width: '30%' }} />
      </div>
    );
  }
  if (variant === 'card') {
    return (
      <div className="skel skel-card">
        <div className="skel-bar" />
        <div className="skel-bar skel-bar-sm" />
      </div>
    );
  }
  return (
    <div className="skel skel-page">
      <div className="skel-bar skel-bar-lg" style={{ width: '60%', margin: '0 auto' }} />
      <div className="skel-bar" style={{ width: '85%', margin: '1rem auto' }} />
      <div className="skel-grid">
        <div className="skel-card"><div className="skel-bar" /><div className="skel-bar skel-bar-sm" /></div>
        <div className="skel-card"><div className="skel-bar" /><div className="skel-bar skel-bar-sm" /></div>
      </div>
    </div>
  );
}
