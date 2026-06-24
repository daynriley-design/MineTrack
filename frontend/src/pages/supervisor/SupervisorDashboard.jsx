import { useEffect, useState } from 'react';
import { dashboardAPI } from '../../api';
import { Truck, ShieldAlert, Wrench, Users, MapPin, Activity, Bell, TrendingUp, Clock } from 'lucide-react';

const MOCK_PEGS = [
  { id: '10L-XC5SS', progress: 67, remaining: '1.3m', status: 'alert', team: 'Équipe Alpha' },
  { id: '11L-FWS', progress: 100, remaining: '0m', status: 'done', team: 'Équipe Bêta' },
  { id: '11L-XC3SS', progress: 45, remaining: '2.5m', status: 'warning', team: 'Équipe Delta' },
  { id: '12L-N450', progress: 80, remaining: '0.6m', status: 'ok', team: 'Équipe Gamma' },
  { id: '09L-EXP2', progress: 32, remaining: '4.1m', status: 'ok', team: 'Équipe Sigma' },
];

const MOCK_ALERTS = [
  { id: 'ABM0011471', level: 'critical', time: '14:30', title: 'Incident grave — 10L-XC5SS', detail: 'Blessure : KUBUYA-DAVID', elapsed: '45 min' },
  { id: 'ABM0011469', level: 'warning', time: '13:15', title: 'Panne critique — S1D 05 (Haveuse)', detail: 'Hydraulique défaillant', elapsed: '2h15' },
  { id: 'ABM0011462', level: 'info', time: '11:00', title: 'Stock critique — Explosifs', detail: 'Seuil minimal atteint', elapsed: '4h30' },
];

const MOCK_SHIFTS = [
  { name: 'Poste Nuit', tonnage: 455, pct: 85 },
  { name: 'Poste Jour', tonnage: 420, pct: 78 },
  { name: 'Poste Soir', tonnage: 382, pct: 71 },
];

const MOCK_PROD_DAYS = [
  { day: 'Lun', val: 38.2, inc: 2 },
  { day: 'Mar', val: 42.0, inc: 1 },
  { day: 'Mer', val: 45.5, inc: 2 },
  { day: 'Jeu', val: 41.0, inc: 0 },
  { day: 'Ven', val: 47.2, inc: 1 },
  { day: 'Sam', val: 50.1, inc: 3 },
  { day: 'Auj', val: 43.8, inc: 2 },
];

const alertColors = { critical: 'var(--color-danger)', warning: 'var(--color-warning)', info: 'var(--color-emerald)' };
const alertBg = { critical: 'rgba(239,68,68,0.07)', warning: 'rgba(245,158,11,0.07)', info: 'rgba(16,185,129,0.07)' };
const alertBorder = { critical: 'rgba(239,68,68,0.35)', warning: 'rgba(245,158,11,0.35)', info: 'rgba(16,185,129,0.35)' };
const statusColors = { alert: 'var(--color-danger)', warning: 'var(--color-warning)', done: 'var(--color-emerald)', ok: 'var(--color-info)' };
const statusLabels = { alert: '🔴 ALERTE', warning: '⚠️ PANNE', done: '✅ TERMINÉ', ok: '🔵 EN COURS' };

function PegBar({ peg }) {
  const color = statusColors[peg.status];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 48px 140px 100px', gap: '1rem', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--color-rock-3)' }}>
      <div>
        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-chalk)', fontSize: '0.9rem' }}>{peg.id}</span>
        <span style={{ color: 'var(--color-stone)', fontSize: '0.75rem', marginLeft: '0.5rem' }}>{peg.team}</span>
      </div>
      <span style={{ fontWeight: 800, color: color, fontFamily: 'monospace', fontSize: '0.9rem', textAlign: 'right' }}>{peg.progress}%</span>
      <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
        <div style={{ width: `${peg.progress}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ fontSize: '0.75rem', color: color, fontWeight: 700, textAlign: 'right' }}>{statusLabels[peg.status]}</span>
    </div>
  );
}

function MiniBar({ val, max, color }) {
  return (
    <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '3px', height: '28px', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
      <div style={{ width: `${(val / max) * 100}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 0.6s ease', opacity: 0.85 }} />
    </div>
  );
}

export default function SupervisorDashboard() {
  const [stats, setStats] = useState(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    dashboardAPI.stats().then(res => setStats(res.data)).catch(() => {});
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  const total = stats?.production?.total_tonnage || 1250;
  const incidents = stats?.safety?.critical || 3;
  const equipment = stats?.equipment?.breakdown || 1;
  const personnel = stats?.labor?.total || 8;

  const dateStr = now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ color: 'var(--color-white)', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
            MINETRACK · Supervision
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
            <MapPin size={14} color="var(--color-stone)" />
            <span style={{ color: 'var(--color-stone)', fontSize: '0.85rem' }}>Reliant Congo — MPAMA North</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--color-white)', fontSize: '1.3rem', letterSpacing: '0.05em' }}>{timeStr}</div>
          <div style={{ color: 'var(--color-stone)', fontSize: '0.8rem' }}>{dateStr}</div>
        </div>
      </div>

      {/* Status Strip */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={14} color="var(--color-danger)" />
          <span style={{ color: 'var(--color-danger)', fontWeight: 700, fontSize: '0.85rem' }}>ALERTES : 2 non traitées</span>
        </div>
        <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 'var(--radius-md)', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={14} color="var(--color-info)" />
          <span style={{ color: 'var(--color-info)', fontWeight: 700, fontSize: '0.85rem' }}>12 PEG actifs</span>
        </div>
        <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius-md)', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={14} color="var(--color-emerald)" />
          <span style={{ color: 'var(--color-emerald)', fontWeight: 700, fontSize: '0.85rem' }}>8 équipes en poste</span>
        </div>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
        {[
          { label: 'PEG ACTIFS', value: '12', icon: <MapPin size={18} />, color: 'var(--color-info)' },
          { label: 'AVANCE MOY.', value: '67%', icon: <TrendingUp size={18} />, color: 'var(--color-gold)' },
          { label: 'TONNAGE', value: `${total}t`, icon: <Truck size={18} />, color: 'var(--color-emerald)' },
          { label: 'INCIDENTS HSE', value: `${incidents}`, icon: <ShieldAlert size={18} />, color: 'var(--color-danger)' },
          { label: 'PERFORMANCE', value: '⭐⭐⭐⭐', icon: <Activity size={18} />, color: 'var(--color-ore)' },
        ].map((kpi, i) => (
          <div key={i} style={{ background: 'rgba(41,37,36,0.6)', border: '1px solid var(--color-rock-3)', borderTop: `3px solid ${kpi.color}`, borderRadius: 'var(--radius-lg)', padding: '1.25rem 1rem', textAlign: 'center' }}>
            <div style={{ color: kpi.color, marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>{kpi.icon}</div>
            <div style={{ fontFamily: 'monospace', fontSize: i === 4 ? '1rem' : '1.8rem', fontWeight: 900, color: kpi.color, lineHeight: 1 }}>{kpi.value}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--color-stone)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.5rem' }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* Production par jour */}
        <div style={{ background: 'rgba(41,37,36,0.5)', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <h4 style={{ margin: '0 0 1rem 0', color: 'var(--color-chalk)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>📈 Production par jour (t)</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {MOCK_PROD_DAYS.map((d, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 40px', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-stone)', fontFamily: 'monospace' }}>{d.day}</span>
                <MiniBar val={d.val} max={55} color={d.day === 'Auj' ? 'var(--color-ore)' : 'var(--color-info)'} />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-chalk)', fontFamily: 'monospace', textAlign: 'right' }}>{d.val}t</span>
              </div>
            ))}
          </div>
        </div>

        {/* Incidents par jour */}
        <div style={{ background: 'rgba(41,37,36,0.5)', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <h4 style={{ margin: '0 0 1rem 0', color: 'var(--color-chalk)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>⚠️ Incidents par jour</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {MOCK_PROD_DAYS.map((d, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 20px', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-stone)', fontFamily: 'monospace' }}>{d.day}</span>
                <MiniBar val={d.inc} max={4} color={d.inc >= 3 ? 'var(--color-danger)' : d.inc >= 2 ? 'var(--color-warning)' : 'var(--color-emerald)'} />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-chalk)', fontFamily: 'monospace', textAlign: 'right' }}>{d.inc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Avancement par PEG */}
        <div style={{ background: 'rgba(41,37,36,0.5)', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <h4 style={{ margin: '0 0 1rem 0', color: 'var(--color-chalk)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>📍 Avancement par PEG</h4>
          {MOCK_PEGS.slice(0, 5).map(p => <PegBar key={p.id} peg={p} />)}
        </div>

        {/* Performance par équipe */}
        <div style={{ background: 'rgba(41,37,36,0.5)', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <h4 style={{ margin: '0 0 1rem 0', color: 'var(--color-chalk)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>👷 Performance par équipe</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {MOCK_SHIFTS.map((s, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-chalk)', fontWeight: 600 }}>{s.name}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--color-gold)', fontWeight: 700 }}>{s.tonnage}t</span>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '4px', height: '10px', overflow: 'hidden' }}>
                  <div style={{ width: `${s.pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-ore), var(--color-gold))', borderRadius: '4px' }} />
                </div>
              </div>
            ))}

            {/* Équipement */}
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-rock-3)', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-warning)' }}>{equipment}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-stone)', textTransform: 'uppercase' }}>Engins en Panne</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-info)' }}>{personnel}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-stone)', textTransform: 'uppercase' }}>Personnel Actif</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Alerts */}
      <div style={{ background: 'rgba(41,37,36,0.5)', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
        <h4 style={{ margin: '0 0 1.25rem 0', color: 'var(--color-chalk)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>⚠️ Dernières Alertes</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {MOCK_ALERTS.map(a => (
            <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center', padding: '0.85rem 1rem', background: alertBg[a.level], border: `1px solid ${alertBorder[a.level]}`, borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Clock size={14} color={alertColors[a.level]} />
                <span style={{ fontFamily: 'monospace', color: 'var(--color-stone)', fontSize: '0.8rem' }}>{a.time}</span>
                <div>
                  <span style={{ color: alertColors[a.level], fontWeight: 700, fontSize: '0.9rem' }}>{a.title}</span>
                  <span style={{ color: 'var(--color-stone)', fontSize: '0.8rem', marginLeft: '0.75rem' }}>{a.detail}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-stone)' }}>⏱ {a.elapsed}</span>
                <button style={{ padding: '0.25rem 0.75rem', background: alertColors[a.level], color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>DÉTAIL</button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
