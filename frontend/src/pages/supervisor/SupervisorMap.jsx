import { useState } from 'react';
import { MapPin, Layers, RotateCcw, ZoomIn, ZoomOut, Download, Search, X } from 'lucide-react';

const PEGS = [
  { id: 'PEG-10L-XC5SS', pct: 67, x: 28, y: 22, status: 'alert', shape: '▲' },
  { id: 'PEG-11L-FWS', pct: 100, x: 58, y: 48, status: 'done', shape: '●' },
  { id: 'PEG-11L-XC3SS', pct: 45, x: 72, y: 68, status: 'warning', shape: '■' },
  { id: 'PEG-12L-N450', pct: 80, x: 42, y: 72, status: 'ok', shape: '▲' },
  { id: 'ECH-045', pct: null, x: 55, y: 30, status: 'sample', shape: '⬡' },
];

const statusStyle = {
  alert: { color: '#ef4444', label: '🔴 Alerte' },
  done: { color: '#10b981', label: '✅ Terminé' },
  warning: { color: '#f59e0b', label: '⚠️ Panne' },
  ok: { color: '#3b82f6', label: '🔵 En cours' },
  sample: { color: '#a78bfa', label: '⬡ Échantillon' },
};

const LEGEND = [
  { shape: '▲', label: 'PEG actif', color: '#3b82f6' },
  { shape: '●', label: 'PEG terminé', color: '#10b981' },
  { shape: '⬡', label: 'Échantillon', color: '#a78bfa' },
  { shape: '🔴', label: 'Alerte', color: '#ef4444' },
  { shape: '⚠️', label: 'Panne', color: '#f59e0b' },
  { shape: '📍', label: 'Ma position', color: '#EE9B5F' },
];

export default function SupervisorMap() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const filteredPegs = PEGS.filter(p => {
    if (filter === 'alerts' && p.status !== 'alert') return false;
    if (filter === 'done' && p.status !== 'done') return false;
    if (query.trim() && !p.id.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.5rem', background: 'rgba(59,130,246,0.1)', borderRadius: 'var(--radius-md)', color: 'var(--color-info)' }}>
            <MapPin size={24} />
          </div>
          <div>
            <h2 style={{ margin: 0, color: 'var(--color-white)', fontWeight: 800 }}>Carte des Opérations</h2>
            <p style={{ margin: 0, color: 'var(--color-stone)', fontSize: '0.85rem' }}>MPAMA North — Vue temps réel</p>
          </div>
        </div>

        {/* Recherche rapide */}
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: '280px' }}>
          <Search size={15} color="var(--color-stone)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un PEG..."
            className="premium-input"
            style={{ width: '100%', paddingLeft: '2.2rem' }}
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-stone)', cursor: 'pointer' }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'Tous les PEG' },
            { key: 'alerts', label: '🔴 Alertes' },
            { key: 'done', label: '✅ Terminés' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{ padding: '0.4rem 0.85rem', background: filter === f.key ? 'var(--color-ore)' : 'rgba(17,18,20,0.05)', color: filter === f.key ? 'white' : 'var(--color-ash)', border: `1px solid ${filter === f.key ? 'var(--color-ore)' : 'var(--color-rock-4)'}`, borderRadius: 'var(--radius-md)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem' }}>
        
        {/* MAP */}
        <div style={{ position: 'relative', background: 'rgba(15, 12, 10, 0.95)', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', aspectRatio: '16/9', minHeight: '420px' }}>
          
          {/* Grid lines */}
          <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.12 }}>
            {[...Array(12)].map((_, i) => (
              <line key={`v${i}`} x1={`${(i + 1) * 8.33}%`} y1="0" x2={`${(i + 1) * 8.33}%`} y2="100%" stroke="#EE9B5F" strokeWidth="0.5" />
            ))}
            {[...Array(8)].map((_, i) => (
              <line key={`h${i}`} x1="0" y1={`${(i + 1) * 12.5}%`} x2="100%" y2={`${(i + 1) * 12.5}%`} stroke="#EE9B5F" strokeWidth="0.5" />
            ))}
            <circle cx="50%" cy="50%" r="30%" fill="none" stroke="#EE9B5F" strokeWidth="0.5" />
            <circle cx="50%" cy="50%" r="20%" fill="none" stroke="#EE9B5F" strokeWidth="0.5" />
            <circle cx="50%" cy="50%" r="10%" fill="none" stroke="#EE9B5F" strokeWidth="0.5" />
          </svg>

          {/* Elevation contours */}
          <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.08 }}>
            <ellipse cx="45%" cy="35%" rx="18%" ry="12%" fill="none" stroke="#78716c" strokeWidth="1" />
            <ellipse cx="45%" cy="35%" rx="28%" ry="20%" fill="none" stroke="#78716c" strokeWidth="1" />
            <ellipse cx="60%" cy="60%" rx="15%" ry="10%" fill="none" stroke="#78716c" strokeWidth="1" />
          </svg>

          {/* Corner label */}
          <div style={{ position: 'absolute', top: '1rem', left: '1rem', fontFamily: 'monospace', fontSize: '0.7rem', color: 'rgba(238, 155, 95,0.5)', letterSpacing: '0.1em' }}>
            MPAMA NORTH · UTM 35S · SECTEUR A
          </div>
          <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', fontFamily: 'monospace', fontSize: '0.65rem', color: 'rgba(238, 155, 95,0.4)' }}>
            ÉCHELLE 1:5000
          </div>

          {/* PEG Markers */}
          {filteredPegs.map(peg => {
            const st = statusStyle[peg.status];
            const isSelected = selected === peg.id;
            return (
              <div key={peg.id} onClick={() => setSelected(isSelected ? null : peg.id)} title={peg.id} style={{
                position: 'absolute', left: `${peg.x}%`, top: `${peg.y}%`,
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer', zIndex: 10,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px'
              }}>
                {/* Pulse ring for alerts */}
                {peg.status === 'alert' && (
                  <div style={{
                    position: 'absolute', width: '40px', height: '40px',
                    borderRadius: '50%', border: `2px solid ${st.color}`,
                    animation: 'pulse 2s infinite', opacity: 0.5
                  }} />
                )}
                <div style={{
                  fontSize: '1.1rem', color: st.color,
                  textShadow: `0 0 8px ${st.color}`,
                  fontWeight: 900,
                  filter: isSelected ? `drop-shadow(0 0 6px ${st.color})` : 'none',
                  transform: isSelected ? 'scale(1.4)' : 'scale(1)',
                  transition: 'transform 0.2s ease'
                }}>{peg.shape}</div>
                <div style={{
                  background: 'rgba(0,0,0,0.85)', color: st.color, borderRadius: '4px',
                  padding: '1px 5px', fontSize: '0.6rem', fontFamily: 'monospace',
                  fontWeight: 700, whiteSpace: 'nowrap', border: `1px solid ${st.color}30`
                }}>
                  {peg.pct !== null ? `${peg.pct}%` : peg.id.split('-')[0]}
                </div>
              </div>
            );
          })}

          {/* My position */}
          <div style={{ position: 'absolute', left: '50%', top: '15%', transform: 'translate(-50%, -50%)', fontSize: '1.2rem', filter: 'drop-shadow(0 0 6px #EE9B5F)' }}>
            📍
          </div>

          {/* Controls */}
          <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {[
              { icon: <ZoomIn size={16} />, title: 'Zoom +' },
              { icon: <ZoomOut size={16} />, title: 'Zoom -' },
              { icon: <RotateCcw size={16} />, title: 'Centrer' },
              { icon: <Download size={16} />, title: 'Exporter' },
            ].map((btn, i) => (
              <button key={i} title={btn.title} style={{ width: '32px', height: '32px', background: '#FFFFFF', border: '1px solid var(--color-rock-4)', borderRadius: '6px', color: 'var(--color-chalk)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                {btn.icon}
              </button>
            ))}
          </div>

          {/* Selected Panel */}
          {selected && (() => {
            const peg = PEGS.find(p => p.id === selected);
            const st = statusStyle[peg.status];
            return (
              <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', background: '#F7F8FA', border: `1px solid ${st.color}50`, borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', minWidth: '220px', backdropFilter: 'blur(10px)' }}>
                <div style={{ color: st.color, fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.35rem' }}>{peg.id}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--color-chalk)' }}>
                  {peg.pct !== null && <><span style={{ color: 'var(--color-stone)' }}>Avancement</span><span style={{ fontFamily: 'monospace', fontWeight: 700, color: st.color }}>{peg.pct}%</span></>}
                  <span style={{ color: 'var(--color-stone)' }}>Statut</span><span style={{ color: st.color, fontWeight: 700 }}>{st.label}</span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Side Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Legend */}
          <div style={{ background: '#FFFFFF', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <Layers size={14} color="var(--color-stone)" />
              <h4 style={{ margin: 0, color: 'var(--color-chalk)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Légende</h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {LEGEND.map((l, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem' }}>
                  <span style={{ color: l.color, fontSize: '0.9rem', minWidth: '18px', textAlign: 'center' }}>{l.shape}</span>
                  <span style={{ color: 'var(--color-chalk)' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* PEG List */}
          <div style={{ background: '#FFFFFF', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', flex: 1 }}>
            <h4 style={{ margin: '0 0 0.85rem 0', color: 'var(--color-chalk)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>PEG Actifs</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {PEGS.filter(p => p.pct !== null).map(peg => {
                const st = statusStyle[peg.status];
                return (
                  <div key={peg.id} onClick={() => setSelected(peg.id === selected ? null : peg.id)} style={{ cursor: 'pointer', padding: '0.6rem 0.75rem', background: selected === peg.id ? `${st.color}15` : 'rgba(17,18,20,0.06)', borderRadius: 'var(--radius-md)', border: `1px solid ${selected === peg.id ? st.color + '50' : 'transparent'}`, transition: 'all 0.2s ease' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 700, color: st.color }}>{peg.id}</span>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: st.color, fontWeight: 700 }}>{peg.pct}%</span>
                    </div>
                    <div style={{ background: 'rgba(17,18,20,0.06)', borderRadius: '3px', height: '5px', overflow: 'hidden' }}>
                      <div style={{ width: `${peg.pct}%`, height: '100%', background: st.color, borderRadius: '3px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
