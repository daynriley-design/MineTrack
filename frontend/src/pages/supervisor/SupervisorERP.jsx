import { useEffect, useMemo, useState } from 'react';
import { CircleDollarSign } from 'lucide-react';
import { financialAPI } from '../../api';
import { useToast } from '../../contexts/ToastContext';
import PageHero from '../../components/PageHero';

const asList = (data) => (Array.isArray(data) ? data : data?.items || []);
const usd = (v) => `${Number(v || 0).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} USD`;
const CATEGORIES = {
  fuel: 'Carburant', maintenance: 'Maintenance', labor: "Main-d'œuvre", explosives: 'Explosifs',
  equipment: 'Équipement', redevance: 'Redevances', other: 'Autres',
};
// Montant en USD : amount_usd s'il est renseigne, sinon le montant si la devise est l'USD.
const inUsd = (r) => (r.amount_usd != null ? Number(r.amount_usd) : (r.currency || 'USD') === 'USD' ? Number(r.amount || 0) : 0);

/** Depenses reelles (API /financial), saisies par l'administration. */
export default function SupervisorERP() {
  const { toast } = useToast();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    financialAPI.list()
      .then(({ data }) => setRecords(asList(data)))
      .catch(() => toast('Impossible de charger les dépenses', 'error'))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const inMonth = useMemo(() => records.filter((r) => !month || String(r.date || '').startsWith(month)), [records, month]);
  const total = inMonth.reduce((s, r) => s + inUsd(r), 0);
  const byCat = useMemo(() => {
    const m = {};
    inMonth.forEach((r) => { m[r.category || 'other'] = (m[r.category || 'other'] || 0) + inUsd(r); });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [inMonth]);
  const max = Math.max(1, ...byCat.map(([, v]) => v));
  const unconverted = inMonth.filter((r) => r.amount_usd == null && (r.currency || 'USD') !== 'USD').length;

  return (
    <div>
      <PageHero title="ERP / Finances" subtitle="dépenses enregistrées" />
      <div className="mt-body mt-page mt-form">
        <section className="mt-card mt-card--row" style={{ flexWrap: 'wrap' }}>
          <div className="mt-list__icon" style={{ background: '#FFF1E6', color: 'var(--color-ore-dark)' }}><CircleDollarSign size={18} /></div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <p className="mt-card__eyebrow">Total {month ? 'du mois' : 'global'}</p>
            <p style={{ margin: 0, fontSize: '1.6rem', fontWeight: 500 }}>{usd(total)}</p>
          </div>
          <div style={{ minWidth: 180 }}>
            <label htmlFor="erp-month">Mois</label>
            <input id="erp-month" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          </div>
        </section>
        {unconverted > 0 && (
          <p className="mt-msg" style={{ color: 'var(--color-ore-dark)' }}>
            {unconverted} dépense(s) en CDF sans montant converti en USD ne sont pas comptées dans le total.
          </p>
        )}

        <section className="mt-card">
          <h3 style={{ margin: '0 0 0.9rem', fontSize: '1.05rem', fontWeight: 500 }}>Par catégorie</h3>
          {loading ? <p className="mt-empty">Chargement…</p> : byCat.length === 0 ? (
            <p className="mt-empty">Aucune dépense sur cette période. Elles se saisissent dans l'espace Admin (Financier).</p>
          ) : byCat.map(([cat, v]) => (
            <div key={cat} style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: 4 }}>
                <span>{CATEGORIES[cat] || cat}</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>{usd(v)}</span>
              </div>
              <div className="mt-bar"><i style={{ width: `${(v / max) * 100}%` }} /></div>
            </div>
          ))}
        </section>

        {inMonth.length > 0 && (
          <section className="mt-card">
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', fontWeight: 500 }}>Détail</h3>
            <div className="mt-table-wrap">
              <table className="mt-table">
                <thead><tr><th>Date</th><th>Catégorie</th><th>Description</th><th>Montant</th><th>PEG</th><th>Approuvé par</th></tr></thead>
                <tbody>
                  {inMonth.slice(0, 50).map((r) => (
                    <tr key={r._id || r.id}>
                      <td>{r.date}</td><td>{CATEGORIES[r.category] || r.category}</td><td>{r.description}</td>
                      <td style={{ fontVariantNumeric: 'tabular-nums' }}>{Number(r.amount || 0).toLocaleString('fr-FR')} {r.currency || 'USD'}</td>
                      <td>{r.peg_id || '—'}</td><td>{r.approved_by || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
