import { useEffect, useMemo, useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { pegsAPI, dashboardAPI } from '../../api';
import { useToast } from '../../contexts/ToastContext';
import PageHero from '../../components/PageHero';

const asList = (data) => (Array.isArray(data) ? data : data?.items || []);

function tone(pct, status) {
  if (status === 'completed' || pct >= 100) return { label: 'Terminé', cls: 'mt-pill--soft-green', color: '#10B981' };
  if (pct == null) return { label: status === 'pending' ? 'En attente' : 'Sans avancement', cls: 'mt-pill--soft-gray', color: '#8B8E95' };
  if (pct >= 60) return { label: 'En cours', cls: 'mt-pill--soft-gray', color: '#3B82F6' };
  if (pct >= 30) return { label: 'Lent', cls: 'mt-pill--soft-gray', color: '#F59E0B' };
  return { label: 'En retard', cls: 'mt-pill--soft-red', color: '#EF4444' };
}

/**
 * Plan des PEG reels (API /pegs + avancement /dashboard/charts), groupes par zone.
 * Remplace l'ancienne carte qui affichait des positions et des PEG inventes.
 */
export default function SupervisorMap() {
  const { toast } = useToast();
  const [pegs, setPegs] = useState([]);
  const [progress, setProgress] = useState({});
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([pegsAPI.list(), dashboardAPI.charts()])
      .then(([p, c]) => {
        setPegs(asList(p.data));
        setProgress(Object.fromEntries((c.data?.peg_progress || []).map((x) => [x.peg_id, x.progress])));
      })
      .catch(() => toast('Impossible de charger les PEG', 'error'))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const zones = useMemo(() => {
    const term = q.trim().toLowerCase();
    const m = {};
    pegs
      .filter((p) => !term || `${p.peg_id} ${p.zone}`.toLowerCase().includes(term))
      .forEach((p) => { (m[p.zone || 'Sans zone'] ||= []).push(p); });
    return Object.entries(m).sort(([a], [b]) => a.localeCompare(b));
  }, [pegs, q]);

  return (
    <div>
      <PageHero title="Carte des PEG" subtitle="avancement par zone" />
      <div className="mt-body mt-page mt-form">
        <section className="mt-card">
          <div style={{ position: 'relative' }}>
            <Search size={17} color="var(--color-stone)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un PEG ou une zone…" aria-label="Rechercher un PEG" style={{ paddingLeft: '2.4rem' }} />
          </div>
        </section>

        {loading && <p className="mt-empty">Chargement…</p>}
        {!loading && zones.length === 0 && (
          <section className="mt-card"><p className="mt-empty">Aucun PEG enregistré. Ils se créent dans l'espace Admin (Pegs & Zones).</p></section>
        )}

        {zones.map(([zone, list]) => (
          <section key={zone} className="mt-card">
            <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.05rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={17} /> {zone} <span className="mt-pill mt-pill--soft-gray">{list.length} PEG</span>
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(12rem, 1fr))', gap: '0.6rem' }}>
              {list.map((p) => {
                const pct = progress[p.peg_id];
                const tn = tone(pct, p.status);
                return (
                  <div key={p._id || p.id} style={{ padding: '0.75rem 0.85rem', borderRadius: 14, background: 'var(--color-surface-soft)', borderLeft: `4px solid ${tn.color}` }}>
                    <strong style={{ display: 'block', fontWeight: 600 }}>{p.peg_id}</strong>
                    <span className={`mt-pill ${tn.cls}`} style={{ marginTop: 6 }}>{tn.label}</span>
                    {pct != null && (
                      <>
                        <div className="mt-bar" style={{ marginTop: 8 }}><i style={{ width: `${Math.min(100, pct)}%`, background: tn.color }} /></div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-stone)' }}>{pct} %</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
