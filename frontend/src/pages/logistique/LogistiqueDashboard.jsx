import { useEffect, useState } from 'react';
import { Package, FlaskConical, Plus, PackagePlus } from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import AppShell from '../../components/AppShell';
import PageHero from '../../components/PageHero';
import { scrollToId } from '../../utils/scroll';

const CATEGORIES = [
  { key: 'magasinier', icon: Package, label: 'Magasinier', materials: ['Ciment', 'Diesel', 'Split set', 'Shank'] },
  { key: 'explosifs', icon: FlaskConical, label: "Responsable magasin d'explosifs", materials: ['Anfo', 'Magnium'] },
];

const LINKS = [{ to: '/logistique/dashboard', label: 'Stocks & consommation', icon: Package }];

const today = () => new Date().toISOString().slice(0, 10);

export default function LogistiqueDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [sites, setSites] = useState([]);
  const [category, setCategory] = useState('magasinier');
  const [siteId, setSiteId] = useState('');
  const [day, setDay] = useState(today());
  const [shift, setShift] = useState('day');
  const [entries, setEntries] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const cat = CATEGORIES.find((c) => c.key === category);
  const [form, setForm] = useState({ material: cat.materials[0], consumption: '', final_stock: '', notes: '' });

  useEffect(() => {
    api.get('/sites').then(({ data }) => setSites(data)).catch(() => setMsg({ type: 'err', text: 'Serveur injoignable.' }));
  }, []);

  // Changer de fonction remet le formulaire sur le premier materiel de la liste.
  const chooseCategory = (key) => {
    const next = CATEGORIES.find((c) => c.key === key);
    setCategory(key);
    setForm({ material: next.materials[0], consumption: '', final_stock: '', notes: '' });
  };

  const fetchEntries = () => {
    if (!siteId) return;
    api.get('/stock-entries', { params: { site_id: siteId, report_date: day, shift, category } })
      .then(({ data }) => setEntries(data))
      .catch(() => setMsg({ type: 'err', text: 'Lecture des stocks impossible.' }));
  };

  useEffect(fetchEntries, [siteId, day, shift, category]);  

  const submit = async (e) => {
    e.preventDefault();
    if (!siteId) { setMsg({ type: 'err', text: 'Choisis un site.' }); return; }
    setBusy(true);
    setMsg(null);
    try {
      await api.post('/stock-entries', {
        site_id: siteId,
        report_date: day,
        shift,
        category,
        material: form.material,
        consumption: form.consumption === '' ? null : Number(form.consumption),
        final_stock: form.final_stock === '' ? null : Number(form.final_stock),
        notes: form.notes || null,
      });
      toast('Entrée enregistrée', 'success');
      setForm({ material: cat.materials[0], consumption: '', final_stock: '', notes: '' });
      fetchEntries();
    } catch (err) {
      setMsg({ type: 'err', text: err?.response?.data?.detail || "Échec de l'enregistrement." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell
      brandIcon={Package}
      roleLabel="Logistique"
      links={LINKS}
      dock={LINKS}
      fab={{ label: 'Nouvelle entrée de stock', icon: PackagePlus, onClick: scrollToId('lgs-entry') }}
      flushPaths={['/logistique/dashboard']}
    >
      <PageHero title="Stocks & consommation" subtitle={`${user?.name || 'Logistique'},`}>
        <div className="mt-chips" role="tablist" aria-label="Fonction">
          {CATEGORIES.map(({ key, icon: Icon, label }) => (
            <button key={key} type="button" role="tab" aria-selected={category === key}
              className={`mt-chip${category === key ? ' is-active' : ''}`} onClick={() => chooseCategory(key)}>
              <Icon size={17} /> {label}
            </button>
          ))}
        </div>
      </PageHero>

      <div className="mt-body mt-page mt-form">
        <p className="mt-card__eyebrow" style={{ margin: '0.25rem 0.2rem 0' }}>Enregistre le stock et la consommation en fin de poste.</p>

        <section className="mt-card">
          <div className="mt-grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))' }}>
            <div>
              <label htmlFor="lgs-site">Site</label>
              <select id="lgs-site" value={siteId} required onChange={(e) => setSiteId(e.target.value)}>
                <option value="">— choisir un site —</option>
                {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="lgs-date">Date</label>
              <input id="lgs-date" type="date" value={day} max={today()} onChange={(e) => setDay(e.target.value)} />
            </div>
            <div>
              <label htmlFor="lgs-shift">Shift</label>
              <select id="lgs-shift" value={shift} onChange={(e) => setShift(e.target.value)}>
                <option value="day">Jour</option>
                <option value="night">Nuit</option>
              </select>
            </div>
          </div>
        </section>

        <form id="lgs-entry" className="mt-card" onSubmit={submit} style={{ scrollMarginTop: '1rem' }}>
          <h3 style={{ margin: '0 0 0.9rem', fontSize: '1.05rem', fontWeight: 500 }}>Nouvelle entrée</h3>
          <div className="mt-grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))', marginBottom: '1rem' }}>
            <div>
              <label htmlFor="lgs-material">Matériel</label>
              <select id="lgs-material" value={form.material}
                onChange={(e) => setForm({ ...form, material: e.target.value })}>
                {cat.materials.map((m) => <option key={m} value={m}>{m}</option>)}
                <option value="autre">Autre…</option>
              </select>
            </div>
            {form.material === 'autre' && (
              <div>
                <label htmlFor="lgs-material-other">Préciser</label>
                <input id="lgs-material-other" placeholder="Nom du matériel"
                  onChange={(e) => setForm({ ...form, material: e.target.value })} />
              </div>
            )}
            <div>
              <label htmlFor="lgs-consumption">Consommation</label>
              <input id="lgs-consumption" type="number" step="0.01" value={form.consumption}
                onChange={(e) => setForm({ ...form, consumption: e.target.value })} />
            </div>
            <div>
              <label htmlFor="lgs-stock">Stock final</label>
              <input id="lgs-stock" type="number" step="0.01" value={form.final_stock}
                onChange={(e) => setForm({ ...form, final_stock: e.target.value })} />
            </div>
            <div>
              <label htmlFor="lgs-notes">Notes</label>
              <input id="lgs-notes" value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <button className="mt-btn" disabled={busy}><Plus size={17} /> Enregistrer l'entrée</button>
          {msg && <p className={`mt-msg ${msg.type}`} role={msg.type === 'err' ? 'alert' : 'status'}>{msg.text}</p>}
        </form>

        <section className="mt-card">
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', fontWeight: 500 }}>Entrées du shift</h3>
          <div className="mt-table-wrap">
            <table className="mt-table">
              <thead><tr><th>Description</th><th>Consommation</th><th>Stock final</th><th>Notes</th></tr></thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id}>
                    <td>{e.material}</td><td>{e.consumption ?? '—'}</td><td>{e.final_stock ?? '—'}</td><td>{e.notes || '—'}</td>
                  </tr>
                ))}
                {!entries.length && (
                  <tr><td colSpan={4} style={{ color: 'var(--color-stone)' }}>Aucune entrée pour ce site, cette date et ce shift.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
