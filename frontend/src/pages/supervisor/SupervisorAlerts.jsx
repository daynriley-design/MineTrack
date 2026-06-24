import { useEffect, useState } from 'react';
import { supervisorAPI } from '../../api';
import { Bell, CheckCircle, Phone, Wrench, AlertTriangle, ShieldAlert, PackageOpen, Clock, TrendingDown, Filter } from 'lucide-react';

const MOCK_ALERTS = [
  {
    id: 'ABM0011471',
    level: 'critical',
    time: '14:30',
    title: 'Incident grave — 10L-XC5SS',
    location: '10L-XC5SS — MPAMA North',
    person: 'KUBUYA-DAVID (Driver Explosifs)',
    detail: 'Hémorragie suite à perçage par véhicule LV 42. Transporté à l\'hôpital.',
    elapsed: '45 min',
    escalade: 'Niveau 2/3',
    gps: '-13.2456, 28.1234',
    sound: 'Continu',
    timeline: [
      { t: '14:30', msg: 'Alerte déclenchée par mineur' },
      { t: '14:32', msg: 'Notification Shift Boss' },
      { t: '14:35', msg: 'Relance 1 (5 min)' },
      { t: '14:45', msg: 'Relance 2 (15 min) — Escalade en cours' },
    ]
  },
  {
    id: 'ABM0011469',
    level: 'warning',
    time: '13:15',
    title: 'Panne critique — S1D 05 (Haveuse)',
    location: 'Niveau 2, Galerie Principale',
    person: 'Équipe Maintenance Bêta',
    detail: 'Défaillance hydraulique majeure. Arrêt machine.',
    elapsed: '2h15',
    escalade: 'Niveau 1/3',
    gps: '-13.2501, 28.1289',
    sound: 'Intermittent',
    timeline: [
      { t: '13:15', msg: 'Panne signalée par opérateur' },
      { t: '13:20', msg: 'Notification équipe maintenance' },
    ]
  },
  {
    id: 'ABM0011462',
    level: 'info',
    time: '11:00',
    title: 'Stock critique — Explosifs',
    location: 'Entrepôt Explosifs — Surface',
    person: 'Gestionnaire Stocks',
    detail: 'Seuil minimal de dynamite atteint. Réapprovisionnement requis.',
    elapsed: '4h30',
    escalade: 'Niveau 1/3',
    gps: '-13.2480, 28.1245',
    sound: 'Standard',
    timeline: [
      { t: '11:00', msg: 'Alerte seuil déclenchée automatiquement' },
    ]
  },
];

const alertColors = { critical: 'var(--color-danger)', warning: 'var(--color-warning)', info: 'var(--color-emerald)' };
const alertBg = { critical: 'rgba(239,68,68,0.07)', warning: 'rgba(245,158,11,0.07)', info: 'rgba(16,185,129,0.07)' };
const alertBorder = { critical: 'rgba(239,68,68,0.35)', warning: 'rgba(245,158,11,0.35)', info: 'rgba(16,185,129,0.35)' };
const levelLabel = { critical: '🔴 CRITIQUE', warning: '🟡 SÉRIEUSE', info: '🟢 MINEURE' };
const soundLabel = { critical: '🔊 Son continu', warning: '🔔 Son intermittent', info: '🔔 Son standard' };

export default function SupervisorAlerts() {
  const [alerts, setAlerts] = useState({ incidents: [], pannes: [] });
  const [expanded, setExpanded] = useState(null);
  const [acknowledged, setAcknowledged] = useState({});

  const fetchAlerts = () => {
    supervisorAPI.alerts()
      .then(res => setAlerts(res.data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAck = (id) => {
    setAcknowledged(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.5rem', background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius-md)', color: 'var(--color-danger)' }}>
            <Bell size={24} />
          </div>
          <div>
            <h2 style={{ margin: 0, color: 'var(--color-white)', fontWeight: 800 }}>Gestion des Alertes</h2>
            <p style={{ margin: 0, color: 'var(--color-stone)', fontSize: '0.85rem' }}>En cours — Alertes temps réel</p>
          </div>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-rock-4)', borderRadius: 'var(--radius-md)', color: 'var(--color-chalk)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
          <Filter size={16} />
          Filtrer
        </button>
      </div>

      {/* Alert Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {MOCK_ALERTS.map(a => (
          <div key={a.id} style={{ background: alertBg[a.level], border: `1px solid ${alertBorder[a.level]}`, borderLeft: `4px solid ${alertColors[a.level]}`, borderRadius: 'var(--radius-lg)', overflow: 'hidden', opacity: acknowledged[a.id] ? 0.5 : 1, transition: 'opacity 0.3s ease' }}>
            
            {/* Alert Header */}
            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  <span style={{ background: alertColors[a.level], color: 'white', padding: '0.15rem 0.6rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.05em' }}>{levelLabel[a.level]}</span>
                  <span style={{ fontFamily: 'monospace', color: 'var(--color-stone)', fontSize: '0.8rem' }}>#{a.id}</span>
                  <span style={{ fontFamily: 'monospace', color: alertColors[a.level], fontWeight: 700, fontSize: '0.85rem' }}>⏰ {a.time}</span>
                </div>
                <h3 style={{ margin: '0 0 0.35rem 0', color: 'var(--color-white)', fontWeight: 700, fontSize: '1rem' }}>{a.title}</h3>
                <p style={{ margin: 0, color: 'var(--color-stone)', fontSize: '0.85rem' }}>
                  👤 {a.person} · 📍 {a.location}
                </p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={12} color="var(--color-stone)" />
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-stone)' }}>⏱ {a.elapsed} · {soundLabel[a.level]}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {!acknowledged[a.id] && (
                    <button onClick={() => handleAck(a.id)} style={{ padding: '0.4rem 0.75rem', background: 'var(--color-emerald)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <CheckCircle size={13} /> ACQUITTER
                    </button>
                  )}
                  <button onClick={() => setExpanded(expanded === a.id ? null : a.id)} style={{ padding: '0.4rem 0.75rem', background: 'rgba(255,255,255,0.08)', color: 'var(--color-chalk)', border: `1px solid ${alertColors[a.level]}`, borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                    DÉTAILS
                  </button>
                  {a.level === 'critical' && (
                    <button style={{ padding: '0.4rem 0.75rem', background: 'rgba(59,130,246,0.15)', color: 'var(--color-info)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Phone size={13} /> APPELER
                    </button>
                  )}
                  {a.level === 'warning' && (
                    <button style={{ padding: '0.4rem 0.75rem', background: 'rgba(245,158,11,0.15)', color: 'var(--color-warning)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Wrench size={13} /> MAINTENANCE
                    </button>
                  )}
                  {a.level === 'info' && (
                    <button style={{ padding: '0.4rem 0.75rem', background: 'rgba(16,185,129,0.15)', color: 'var(--color-emerald)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <PackageOpen size={13} /> RÉAPPRO
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Detail */}
            {expanded === a.id && (
              <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ height: '1px', background: alertBorder[a.level] }} />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', color: 'var(--color-stone)', fontWeight: 700, textTransform: 'uppercase' }}>Description</p>
                    <p style={{ margin: 0, color: 'var(--color-chalk)', fontSize: '0.9rem' }}>{a.detail}</p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', color: 'var(--color-stone)', fontWeight: 700, textTransform: 'uppercase' }}>GPS / Position</p>
                    <p style={{ margin: 0, color: 'var(--color-chalk)', fontSize: '0.9rem', fontFamily: 'monospace' }}>{a.gps}</p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-stone)' }}>Escalade : {a.escalade}</p>
                  </div>
                </div>

                <div>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: 'var(--color-stone)', fontWeight: 700, textTransform: 'uppercase' }}>⏱ Chronologie</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {a.timeline.map((t, i) => (
                      <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: alertColors[a.level], fontWeight: 700, minWidth: '40px' }}>{t.t}</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-chalk)' }}>{t.msg}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Stats Panel */}
      <div style={{ background: 'rgba(41,37,36,0.5)', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
        <h4 style={{ margin: '0 0 1.25rem 0', color: 'var(--color-chalk)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingDown size={16} /> Statistiques des Alertes
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', textAlign: 'center' }}>
          {[
            { label: "Aujourd'hui", value: '3', color: 'var(--color-danger)' },
            { label: 'Cette semaine', value: '12', color: 'var(--color-warning)' },
            { label: 'Ce mois', value: '45', color: 'var(--color-info)' },
            { label: 'Temps moy. réponse', value: '8 min', color: 'var(--color-emerald)' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-stone)', marginTop: '0.25rem', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
