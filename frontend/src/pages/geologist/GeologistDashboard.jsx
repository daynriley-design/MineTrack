import { useState, useEffect } from 'react';
import { FlaskConical, Map, AlertTriangle, Activity, Hammer, FileText, ChevronRight, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';

export default function GeologistDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [date, setDate] = useState('');

  useEffect(() => {
    const d = new Date();
    setDate(d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + 
            d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const kpis = [
    { label: 'PEG ACTIFS', value: '8', icon: Activity, color: 'var(--color-info)' },
    { label: 'TENEUR MOYENNE', value: '2.3%', icon: FlaskConical, color: 'var(--color-gold)' },
    { label: 'RMR MOYEN', value: '68', icon: Hammer, color: 'var(--color-emerald)' },
    { label: 'Q-SYSTEM MOYEN', value: '8.5', icon: Hammer, color: 'var(--color-emerald)' },
    { label: 'STABILITÉ', value: 'Bonne', icon: AlertTriangle, color: 'var(--color-emerald)', isText: true }
  ];

  const quickActions = [
    { label: 'Nouvel Échantillon', icon: PlusCircle, path: '/geologist/samples', color: 'var(--color-info)' },
    { label: 'Cartographie 3D', icon: Map, path: '/geologist/map', color: 'var(--color-gold)' },
    { label: 'Géotechnique', icon: Hammer, path: '/geologist/geotech', color: 'var(--color-warning)' },
    { label: 'Mini-rapport', icon: FileText, path: '/geologist/report', color: 'var(--color-chalk)' },
  ];

  const unstableZones = [
    { name: '10L-XC5SS', rmr: 45, issue: 'Zone fragile', color: 'var(--color-warning)' },
    { name: '11L-FWS', rmr: 52, issue: 'Fissuration', color: 'var(--color-warning)' }
  ];

  const recentSamples = [
    { peg: '10L-XC5SS', ref: 'LAB-2026-045', grade: '2.3%', date: '15/06/2026' },
    { peg: '11L-FWS', ref: 'LAB-2026-046', grade: '1.8%', date: '14/06/2026' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-white)', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FlaskConical size={32} color="var(--color-emerald)" />
            MINETRACK - Géologie
          </h1>
          <p style={{ color: 'var(--color-stone)', margin: 0, fontSize: '1rem' }}>Reliant Congo - MPAMA North</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ color: 'var(--color-chalk)', margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{date}</p>
        </div>
      </div>

      {/* Top Banner */}
      <div style={{ 
        display: 'flex', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
        borderRadius: 'var(--radius-lg)', padding: '1rem 2rem', gap: '3rem', alignItems: 'center'
      }}>
        <div style={{ color: 'var(--color-white)', fontWeight: 600 }}>🧪 Échantillons : <span style={{ color: 'var(--color-emerald)' }}>12</span></div>
        <div style={{ color: 'var(--color-white)', fontWeight: 600 }}>📊 PEG actifs : <span style={{ color: 'var(--color-gold)' }}>8</span></div>
        <div style={{ color: 'var(--color-white)', fontWeight: 600 }}>⚠️ Zones instables : <span style={{ color: 'var(--color-warning)' }}>2</span></div>
      </div>

      {/* KPIs */}
      <div>
        <h3 style={{ color: 'var(--color-white)', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={18} color="var(--color-emerald)" />
          KPI GÉOLOGIQUES
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
          {kpis.map((kpi, idx) => (
            <div key={idx} style={{ 
              background: 'var(--color-rock-2)', border: '1px solid var(--color-rock-3)', 
              borderRadius: 'var(--radius-md)', padding: '1.5rem', display: 'flex', flexDirection: 'column',
              position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}>
                <kpi.icon size={60} color={kpi.color} />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-stone)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                {kpi.label}
              </span>
              <span style={{ fontSize: kpi.isText ? '1.5rem' : '2rem', fontWeight: 800, color: 'var(--color-white)' }}>
                {kpi.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* Actions Rapides */}
        <div>
          <h3 style={{ color: 'var(--color-white)', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>🎯 ACTIONS RAPIDES</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {quickActions.map((action, idx) => (
              <button 
                key={idx}
                onClick={() => navigate(action.path)}
                style={{ 
                  background: 'var(--color-rock-2)', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  color: 'var(--color-white)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = action.color; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--color-rock-3)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <action.icon size={20} color={action.color} />
                  {action.label}
                </div>
                <ChevronRight size={18} color="var(--color-stone)" />
              </button>
            ))}
          </div>
        </div>

        {/* Listes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Zones Instables */}
          <div style={{ background: 'var(--color-rock-2)', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
            <h3 style={{ color: 'var(--color-white)', fontSize: '1rem', fontWeight: 700, margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} color="var(--color-warning)" />
              ZONES INSTABLES À SURVEILLER
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {unstableZones.map((zone, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                  padding: '1rem', background: 'var(--color-rock)', borderRadius: 'var(--radius-md)',
                  borderLeft: `4px solid ${zone.color}`
                }}>
                  <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <span style={{ color: 'var(--color-white)', fontWeight: 700, width: '120px' }}>⚠️ {zone.name}</span>
                    <span style={{ color: 'var(--color-stone)', fontSize: '0.9rem' }}>RMR : <strong style={{ color: 'var(--color-chalk)' }}>{zone.rmr}</strong></span>
                    <span style={{ color: 'var(--color-warning)', fontSize: '0.9rem', fontWeight: 600 }}>{zone.issue}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => { toast(`Focus sur la zone instable ${zone.name}`, 'info'); navigate('/geologist/map'); }}
                      style={{ background: 'transparent', border: '1px solid var(--color-rock-3)', color: 'var(--color-info)', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                    >
                      📍 Voir
                    </button>
                    <button 
                      onClick={() => { toast(`Mise à jour des paramètres de ${zone.name}`, 'warning'); navigate('/geologist/geotech'); }}
                      style={{ background: 'transparent', border: '1px solid var(--color-rock-3)', color: 'var(--color-emerald)', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                    >
                      ✏️ MAJ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Echantillons */}
          <div style={{ background: 'var(--color-rock-2)', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
            <h3 style={{ color: 'var(--color-white)', fontSize: '1rem', fontWeight: 700, margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FlaskConical size={18} color="var(--color-info)" />
              DERNIERS ÉCHANTILLONS
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {recentSamples.map((samp, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                  padding: '1rem', background: 'var(--color-rock)', borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flex: 1 }}>
                    <span style={{ color: 'var(--color-white)', fontWeight: 700, width: '120px' }}>{samp.peg}</span>
                    <span style={{ color: 'var(--color-chalk)', fontFamily: 'monospace' }}>{samp.ref}</span>
                    <span style={{ color: 'var(--color-gold)', fontWeight: 800 }}>{samp.grade}</span>
                    <span style={{ color: 'var(--color-stone)', fontSize: '0.9rem' }}>{samp.date}</span>
                  </div>
                  <button 
                    onClick={() => { toast(`Détails de l'échantillon ${samp.ref}`, 'info'); navigate('/geologist/samples'); }}
                    style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--color-info)', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                  >
                    📋 Voir
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
