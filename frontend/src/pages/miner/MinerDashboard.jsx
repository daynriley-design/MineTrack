import { Link } from 'react-router-dom';
import { MapPin, ShieldCheck, Truck, Wrench, AlertTriangle, FileText, LayoutDashboard, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function MinerDashboard() {
  const { user } = useAuth();
  const now = new Date();
  const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

  const stats = [
    { label: 'Avancement PEG', value: '71%', color: 'var(--color-info)', icon: TrendingUp, sub: '10L-XC5SS' },
    { label: 'HSE Validées', value: '3', color: 'var(--color-emerald)', icon: CheckCircle, sub: 'Ce shift' },
    { label: 'Shift en cours', value: 'Jour', color: 'var(--color-gold)', icon: Clock, sub: `Depuis 06:00` },
  ];

  const actions = [
    { to: '/miner/pegs',       label: 'Suivi PEG',         icon: MapPin,         color: 'var(--color-info)',    desc: 'Avancement & métrages' },
    { to: '/miner/hse',        label: 'Déclaration HSE',   icon: ShieldCheck,    color: 'var(--color-emerald)', desc: 'Face Safe & certification' },
    { to: '/miner/production', label: 'Saisie Production', icon: Truck,          color: 'var(--color-gold)',    desc: 'Tonnage & minage' },
    { to: '/miner/equipment',  label: 'Panne Engin',       icon: Wrench,         color: 'var(--color-warning)', desc: 'Déclarer une panne' },
    { to: '/miner/report',     label: 'Mini-Rapport',      icon: FileText,       color: 'var(--color-chalk)',   desc: 'Rapport de fin de shift' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ margin: '0 0 0.25rem 0', color: 'var(--color-white)', fontWeight: 900, fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <LayoutDashboard size={28} color="var(--color-ore)" />
            Tableau de Bord Opérateur
          </h2>
          <p style={{ margin: 0, color: 'var(--color-stone)', fontSize: '0.9rem', textTransform: 'capitalize' }}>
            {dateStr} — {timeStr} &nbsp;|&nbsp; Bienvenue, <strong style={{ color: 'var(--color-chalk)' }}>{user?.name || 'Opérateur'}</strong>
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ display: 'inline-block', background: 'rgba(16,185,129,0.15)', border: '1px solid var(--color-emerald)', color: 'var(--color-emerald)', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
            🟢 En service — Zone MPAMA North
          </span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        {stats.map(({ label, value, color, icon: Icon, sub }) => (
          <div key={label} style={{ background: 'var(--color-rock-2)', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', transition: 'transform 0.2s' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: `color-mix(in srgb, ${color} 15%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={26} color={color} />
            </div>
            <div>
              <p style={{ margin: '0 0 0.25rem 0', color: 'var(--color-stone)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{label}</p>
              <h3 style={{ margin: '0 0 0.15rem 0', color: 'var(--color-white)', fontSize: '2rem', fontWeight: 900, lineHeight: 1 }}>{value}</h3>
              <span style={{ color: color, fontSize: '0.75rem', fontWeight: 600 }}>{sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Actions Grid */}
      <div>
        <h3 style={{ color: 'var(--color-stone)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, margin: '0 0 1rem 0' }}>Actions Disponibles</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {actions.map(({ to, label, icon: Icon, color, desc }) => (
            <Link key={to} to={to} style={{ textDecoration: 'none' }}>
              <div style={{ background: 'var(--color-rock-2)', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', cursor: 'pointer', transition: 'all 0.2s ease', borderTop: `3px solid ${color}` }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = color; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--color-rock-3)'; }}
              >
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `color-mix(in srgb, ${color} 15%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={22} color={color} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.2rem 0', color: 'var(--color-white)', fontSize: '0.95rem', fontWeight: 700 }}>{label}</h4>
                  <p style={{ margin: 0, color: 'var(--color-stone)', fontSize: '0.78rem' }}>{desc}</p>
                </div>
              </div>
            </Link>
          ))}

          {/* Emergency button */}
          <Link to="/miner/incident" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid var(--color-danger)', borderTop: '3px solid var(--color-danger)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', cursor: 'pointer', transition: 'all 0.2s ease' }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={22} color="var(--color-danger)" />
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.2rem 0', color: 'var(--color-danger)', fontSize: '0.95rem', fontWeight: 800 }}>🚨 Signaler Incident</h4>
                <p style={{ margin: 0, color: 'var(--color-stone)', fontSize: '0.78rem' }}>Alerte immédiate au superviseur</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* PEG Recap */}
      <div style={{ background: 'var(--color-rock-2)', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1.25rem 0', color: 'var(--color-white)', fontSize: '1rem', fontWeight: 700 }}>📍 État de mes PEGs (Shift actuel)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { name: '10L-XC5SS', activity: 'Forage', progress: 71, color: 'var(--color-info)' },
            { name: '11L-FWS',   activity: 'Soutènement', progress: 100, color: 'var(--color-emerald)' },
          ].map(peg => (
            <div key={peg.name} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ color: 'var(--color-white)', fontWeight: 700, width: '110px', flexShrink: 0 }}>{peg.name}</span>
              <span style={{ color: 'var(--color-stone)', fontSize: '0.8rem', width: '110px', flexShrink: 0 }}>{peg.activity}</span>
              <div style={{ flex: 1, background: 'rgba(17,18,20,0.08)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: `${peg.progress}%`, height: '100%', background: peg.color, borderRadius: '5px', transition: 'width 1s ease' }} />
              </div>
              <span style={{ color: peg.color, fontWeight: 800, width: '45px', textAlign: 'right' }}>{peg.progress}%</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
