import { useEffect, useState, useCallback } from 'react';
import { supervisorAPI } from '../../api';
import { Bell, CheckCircle, Phone, Wrench, Clock, TrendingDown, Filter } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const alertColors = { critical: '#ef4444', warning: '#f59e0b', info: '#10b981' };
const alertBg    = { critical: 'rgba(239,68,68,0.07)', warning: 'rgba(245,158,11,0.07)', info: 'rgba(16,185,129,0.07)' };
const alertBorder= { critical: 'rgba(239,68,68,0.35)', warning: 'rgba(245,158,11,0.35)', info: 'rgba(16,185,129,0.35)' };
const levelLabel = { critical: '🔴 CRITIQUE', warning: '🟡 SÉRIEUSE', info: '🟢 MINEURE' };

function playSiren(type = 'critical') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const freqs = type === 'critical' ? [880, 660, 880, 660] : [523, 659, 784];
    let t = ctx.currentTime;
    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type === 'critical' ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.start(t);
      osc.stop(t + 0.4);
      t += 0.45;
    });
  } catch { /* browser blocked autoplay */ }
}

const ACK_KEY = 'minetrack_acked_alerts';
function loadAcked() {
  try { return JSON.parse(localStorage.getItem(ACK_KEY) || '{}'); } catch { return {}; }
}
function saveAcked(obj) {
  localStorage.setItem(ACK_KEY, JSON.stringify(obj));
}

// Convert backend incident/panne to display alert
function toAlert(item, type) {
  return {
    id: item.id,
    level: item.severity || (type === 'panne' ? 'warning' : 'info'),
    time: new Date(item.created_at || item.date || Date.now()).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    title: item.title || `Panne — ${item.equipment_id || ''}`,
    location: item.location || item.equipment_id || '—',
    person: item.reported_by || '—',
    detail: item.description || '—',
    type,
  };
}

export default function SupervisorAlerts() {
  const { toast } = useToast();
  const [allAlerts, setAllAlerts] = useState([]);
  const [filter, setFilter] = useState('all'); // all | critical | warning | info
  const [acknowledged, setAcknowledged] = useState(loadAcked);
  const [expanded, setExpanded] = useState(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [calling, setCalling] = useState(null);

  const fetchAlerts = useCallback(() => {
    supervisorAPI.alerts()
      .then(res => {
        const { incidents = [], pannes = [] } = res.data;
        const mapped = [
          ...incidents.map(i => toAlert(i, 'incident')),
          ...pannes.map(p => toAlert(p, 'panne')),
        ];
        setAllAlerts(mapped);
        // Auto-play siren if critical unacknowledged
        const acked = loadAcked();
        const hasCritical = mapped.some(a => a.level === 'critical' && !acked[a.id]);
        if (hasCritical) playSiren('critical');
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchAlerts();
    const iv = setInterval(fetchAlerts, 15000);
    return () => clearInterval(iv);
  }, [fetchAlerts]);

  const handleAck = (alert) => {
    const newAcked = { ...acknowledged, [alert.id]: true };
    setAcknowledged(newAcked);
    saveAcked(newAcked);
    toast(`Alerte #${alert.id.slice(0, 8)} acquittée`, 'success');
    playSiren('info');
  };

  const handleCall = (alert) => {
    setCalling(alert.id);
    playSiren('critical');
    toast(`📞 Appel d'urgence déclenché pour ${alert.person}`, 'error');
    setTimeout(() => setCalling(null), 4000);
  };

  const visible = allAlerts.filter(a => {
    if (acknowledged[a.id]) return false;
    if (filter !== 'all' && a.level !== filter) return false;
    return true;
  });

  const counts = {
    critical: allAlerts.filter(a => a.level === 'critical' && !acknowledged[a.id]).length,
    warning:  allAlerts.filter(a => a.level === 'warning'  && !acknowledged[a.id]).length,
    info:     allAlerts.filter(a => a.level === 'info'     && !acknowledged[a.id]).length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.5rem', background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius-md)', color: '#ef4444' }}>
            <Bell size={24} />
          </div>
          <div>
            <h2 style={{ margin: 0, color: 'var(--color-white)', fontWeight: 800 }}>Gestion des Alertes</h2>
            <p style={{ margin: 0, color: 'var(--color-stone)', fontSize: '0.85rem' }}>
              {visible.length} alerte(s) active(s) · Actualisation auto toutes les 15s
            </p>
          </div>
        </div>

        {/* Filter button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowFilterMenu(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(17,18,20,0.05)', border: '1px solid var(--color-rock-4)', borderRadius: 'var(--radius-md)', color: 'var(--color-chalk)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
          >
            <Filter size={16} /> Filtrer {filter !== 'all' ? `(${levelLabel[filter]})` : ''}
          </button>
          {showFilterMenu && (
            <div style={{ position: 'absolute', right: 0, top: '110%', background: 'var(--color-rock-2)', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-md)', padding: '0.5rem', zIndex: 20, minWidth: '160px', boxShadow: '0 8px 32px rgba(17,18,20,0.06)' }}>
              {[['all', '🔔 Toutes', 'var(--color-chalk)'], ['critical', '🔴 Critiques', '#ef4444'], ['warning', '🟡 Sérieuses', '#f59e0b'], ['info', '🟢 Mineures', '#10b981']].map(([v, l, c]) => (
                <button key={v} onClick={() => { setFilter(v); setShowFilterMenu(false); }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 0.75rem', background: filter === v ? 'rgba(17,18,20,0.08)' : 'transparent', border: 'none', color: c, cursor: 'pointer', borderRadius: '4px', fontWeight: 600, fontSize: '0.85rem' }}>
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {[{ label: 'Critiques', count: counts.critical, color: '#ef4444' }, { label: 'Sérieuses', count: counts.warning, color: '#f59e0b' }, { label: 'Mineures', count: counts.info, color: '#10b981' }].map(s => (
          <div key={s.label} style={{ flex: 1, minWidth: '100px', background: 'rgba(17,18,20,0.03)', border: `1px solid ${s.color}33`, borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'monospace', color: s.color }}>{s.count}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-stone)', textTransform: 'uppercase' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Alert Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {visible.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-stone)', background: 'rgba(17,18,20,0.02)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-rock-3)' }}>
            <CheckCircle size={40} color="#10b981" style={{ marginBottom: '1rem' }} />
            <p style={{ margin: 0, fontWeight: 600 }}>Aucune alerte active{filter !== 'all' ? ` pour ce filtre` : ''}</p>
          </div>
        )}

        {visible.map(a => (
          <div key={a.id} style={{ background: alertBg[a.level], border: `1px solid ${alertBorder[a.level]}`, borderLeft: `4px solid ${alertColors[a.level]}`, borderRadius: 'var(--radius-lg)', overflow: 'hidden', transition: 'opacity 0.3s ease' }}>
            
            {/* Alert Header */}
            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  <span style={{ background: alertColors[a.level], color: 'white', padding: '0.15rem 0.6rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.05em' }}>{levelLabel[a.level]}</span>
                  <span style={{ fontFamily: 'monospace', color: 'var(--color-stone)', fontSize: '0.8rem' }}>#{a.id.slice(0,8)}</span>
                  <span style={{ fontFamily: 'monospace', color: alertColors[a.level], fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={13} /> {a.time}
                  </span>
                </div>
                <h3 style={{ margin: '0 0 0.35rem 0', color: 'var(--color-white)', fontWeight: 700, fontSize: '1rem' }}>{a.title}</h3>
                <p style={{ margin: 0, color: 'var(--color-stone)', fontSize: '0.85rem' }}>
                  👤 {a.person} · 📍 {a.location}
                </p>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button onClick={() => handleAck(a)}
                  style={{ padding: '0.4rem 0.75rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <CheckCircle size={13} /> ACQUITTER
                </button>
                <button onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                  style={{ padding: '0.4rem 0.75rem', background: 'rgba(17,18,20,0.08)', color: 'var(--color-chalk)', border: `1px solid ${alertColors[a.level]}`, borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                  {expanded === a.id ? 'FERMER' : 'DÉTAILS'}
                </button>
                {(a.level === 'critical' || a.type === 'incident') && (
                  <button onClick={() => handleCall(a)}
                    style={{ padding: '0.4rem 0.75rem', background: calling === a.id ? 'rgba(59,130,246,0.4)' : 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', transition: 'all 0.2s' }}>
                    <Phone size={13} /> {calling === a.id ? 'APPEL EN COURS...' : 'APPELER'}
                  </button>
                )}
                {a.type === 'panne' && (
                  <button style={{ padding: '0.4rem 0.75rem', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Wrench size={13} /> MAINTENANCE
                  </button>
                )}
              </div>
            </div>

            {/* Expanded Detail */}
            {expanded === a.id && (
              <div style={{ padding: '0 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ height: '1px', background: alertBorder[a.level] }} />
                <div style={{ background: 'rgba(17,18,20,0.06)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: 'var(--color-stone)', fontWeight: 700, textTransform: 'uppercase' }}>Description complète</p>
                  <p style={{ margin: 0, color: 'var(--color-chalk)', fontSize: '0.9rem', lineHeight: 1.6 }}>{a.detail}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Stats Panel */}
      <div style={{ background: '#FFFFFF', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
        <h4 style={{ margin: '0 0 1.25rem 0', color: 'var(--color-chalk)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingDown size={16} /> Statistiques
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
          {[
            { label: 'Total actives', value: visible.length, color: '#ef4444' },
            { label: 'Acquittées', value: Object.keys(acknowledged).length, color: '#10b981' },
            { label: 'En cours traitement', value: allAlerts.length, color: '#f59e0b' },
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
