import { useEffect, useMemo, useState } from 'react';
import { ShieldCheck, CheckCircle, XCircle, Wind, Clock } from 'lucide-react';
import api, { hseChecklistsAPI } from '../../api';
import { useToast } from '../../contexts/ToastContext';
import PageHero from '../../components/PageHero';

const asList = (data) => (Array.isArray(data) ? data : data?.items || []);
const fr = (iso) => (iso ? new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '—');
const CHECKS = [
  ['face_safe', 'Front sécurisé'],
  ['ventilation_ok', 'Ventilation active'],
  ['gas_checked', 'Gaz vérifiés'],
  ['water_sprayed', 'Arrosage effectué'],
  ['supports_ok', 'Soutènement vérifié'],
];

/** Declarations « Face Safe » envoyees par les mineurs (API /hse-checklists). */
export default function SupervisorHSEValidation() {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');

  const load = () => hseChecklistsAPI.list()
    .then(({ data }) => setItems(asList(data)))
    .catch(() => toast('Impossible de charger les déclarations', 'error'))
    .finally(() => setLoading(false));

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const shown = useMemo(() => items.filter((d) => (d.status || 'pending') === tab), [items, tab]);
  const pendingCount = items.filter((d) => (d.status || 'pending') === 'pending').length;

  const review = async (d, decision) => {
    const id = d._id || d.id;
    try {
      await api.post(`/hse-checklists/${id}/review`, { decision });
      toast(decision === 'approved' ? 'Déclaration validée' : 'Déclaration rejetée', 'success');
      setItems((prev) => prev.map((x) => ((x._id || x.id) === id ? { ...x, status: decision } : x)));
    } catch (err) {
      toast(err?.response?.data?.detail || 'Action impossible', 'error');
    }
  };

  return (
    <div>
      <PageHero title="Validation HSE" subtitle={pendingCount ? `${pendingCount} déclaration(s) à valider` : 'déclarations Face Safe'}>
        <div className="mt-chips" role="tablist" aria-label="Statut">
          {[['pending', 'En attente'], ['approved', 'Validées'], ['rejected', 'Rejetées']].map(([k, label]) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} className={`mt-chip${tab === k ? ' is-active' : ''}`} onClick={() => setTab(k)}>
              {label}
            </button>
          ))}
        </div>
      </PageHero>

      <div className="mt-body mt-page">
        {loading && <p className="mt-empty">Chargement…</p>}
        {!loading && shown.length === 0 && (
          <section className="mt-card mt-card--row">
            <div className="mt-list__icon" style={{ background: '#E7F7EF', color: '#047857' }}><ShieldCheck size={18} /></div>
            <p className="mt-card__eyebrow" style={{ margin: 0 }}>
              {tab === 'pending' ? 'Aucune déclaration en attente de validation.' : 'Aucune déclaration dans cette liste.'}
            </p>
          </section>
        )}

        {shown.map((d) => (
          <section key={d._id || d.id} className="mt-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>Face Safe — {d.peg_id}</h3>
              <span style={{ color: 'var(--color-stone)', fontSize: '0.85rem' }}>
                {d.date} · {d.shift === 'night' ? 'Nuit' : 'Jour'} · envoyée {fr(d.created_at)}
              </span>
            </div>
            <p style={{ margin: '0.5rem 0 0.75rem', color: 'var(--color-chalk)', fontSize: '0.9rem' }}>
              PIC : <strong>{d.pic || '—'}</strong> · Shift boss : <strong>{d.shift_boss || '—'}</strong> · Déclarant : {d.created_by || '—'}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
              {CHECKS.map(([k, label]) => (
                <span key={k} className={`mt-pill ${Number(d[k]) ? 'mt-pill--soft-green' : 'mt-pill--soft-red'}`}>
                  {Number(d[k]) ? '✓' : '✗'} {label}
                </span>
              ))}
            </div>
            <p style={{ margin: 0, display: 'flex', gap: '1.25rem', flexWrap: 'wrap', color: 'var(--color-ash)', fontSize: '0.88rem' }}>
              <span style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}><Wind size={15} /> CH4 {d.gas_ch4 ?? '—'} % · CO {d.gas_co ?? '—'} ppm · O2 {d.gas_o2 ?? '—'} %</span>
              <span style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}><Clock size={15} /> Ré-entrée : {d.reentry_minutes ?? '—'} min</span>
            </p>
            {d.notes && <p style={{ margin: '0.6rem 0 0', fontSize: '0.88rem', color: 'var(--color-chalk)' }}>{d.notes}</p>}
            {d.status && d.status !== 'pending' && (
              <p style={{ margin: '0.6rem 0 0', fontSize: '0.82rem', color: 'var(--color-stone)' }}>
                {d.status === 'approved' ? 'Validée' : 'Rejetée'} par {d.reviewed_by || '—'} le {fr(d.reviewed_at)}
              </p>
            )}
            {(d.status || 'pending') === 'pending' && (
              <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                <button type="button" className="mt-btn" onClick={() => review(d, 'approved')}><CheckCircle size={17} /> Valider</button>
                <button type="button" className="mt-btn mt-btn--ghost" style={{ color: 'var(--color-ruby)' }} onClick={() => review(d, 'rejected')}><XCircle size={17} /> Rejeter</button>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
