import { useEffect, useState } from 'react';
import { Package, FlaskConical, Plus, PackagePlus } from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../contexts/ToastContext';
import AppShell from '../../components/AppShell';
import PageHero from '../../components/PageHero';
import { scrollToId } from '../../utils/scroll';

const CATEGORIES = [
  { key: 'magasinier', icon: Package, labelKey: 'lgs.storekeeper', materials: ['Ciment', 'Diesel', 'Split set', 'Shank'] },
  { key: 'explosifs', icon: FlaskConical, labelKey: 'lgs.explosives', materials: ['Anfo', 'Magnium'] },
];


const today = () => new Date().toISOString().slice(0, 10);

export default function LogistiqueDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const LINKS = [{ to: '/logistique/dashboard', label: t('app.stocks_consumption'), icon: Package }];

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
    api.get('/sites').then(({ data }) => setSites(data)).catch(() => setMsg({ type: 'err', text: t('lgs.err_server') }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      .catch(() => setMsg({ type: 'err', text: t('lgs.err_read') }));
  };

  useEffect(fetchEntries, [siteId, day, shift, category]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e) => {
    e.preventDefault();
    if (!siteId) { setMsg({ type: 'err', text: t('lgs.err_site') }); return; }
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
      toast(t('lgs.saved'), 'success');
      setForm({ material: cat.materials[0], consumption: '', final_stock: '', notes: '' });
      fetchEntries();
    } catch (err) {
      setMsg({ type: 'err', text: err?.response?.data?.detail || t('lgs.err_save') });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell
      brandIcon={Package}
      roleLabel={t('app.area_logistique')}
      links={LINKS}
      dock={LINKS}
      fab={{ label: t('app.new_stock_entry'), icon: PackagePlus, onClick: scrollToId('lgs-entry') }}
      flushPaths={['/logistique/dashboard']}
    >
      <PageHero title={t('app.stocks_consumption')} subtitle={`${user?.name || t('app.area_logistique')},`}>
        <div className="mt-chips" role="tablist" aria-label={t('app.function')}>
          {CATEGORIES.map(({ key, icon: Icon, labelKey }) => (
            <button key={key} type="button" role="tab" aria-selected={category === key}
              className={`mt-chip${category === key ? ' is-active' : ''}`} onClick={() => chooseCategory(key)}>
              <Icon size={17} /> {t(labelKey)}
            </button>
          ))}
        </div>
      </PageHero>

      <div className="mt-body mt-page mt-form">
        <p className="mt-card__eyebrow" style={{ margin: '0.25rem 0.2rem 0' }}>{t('lgs.intro')}</p>

        <section className="mt-card">
          <div className="mt-grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))' }}>
            <div>
              <label htmlFor="lgs-site">{t('lgs.site')}</label>
              <select id="lgs-site" value={siteId} required onChange={(e) => setSiteId(e.target.value)}>
                <option value="">{t('lgs.choose_site')}</option>
                {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="lgs-date">{t('lgs.date')}</label>
              <input id="lgs-date" type="date" value={day} max={today()} onChange={(e) => setDay(e.target.value)} />
            </div>
            <div>
              <label htmlFor="lgs-shift">{t('lgs.shift')}</label>
              <select id="lgs-shift" value={shift} onChange={(e) => setShift(e.target.value)}>
                <option value="day">{t('sup.day')}</option>
                <option value="night">{t('sup.night')}</option>
              </select>
            </div>
          </div>
        </section>

        <form id="lgs-entry" className="mt-card" onSubmit={submit} style={{ scrollMarginTop: '1rem' }}>
          <h3 style={{ margin: '0 0 0.9rem', fontSize: '1.05rem', fontWeight: 500 }}>{t('lgs.new_entry')}</h3>
          <div className="mt-grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))', marginBottom: '1rem' }}>
            <div>
              <label htmlFor="lgs-material">{t('lgs.material')}</label>
              <select id="lgs-material" value={form.material}
                onChange={(e) => setForm({ ...form, material: e.target.value })}>
                {cat.materials.map((m) => <option key={m} value={m}>{m}</option>)}
                <option value="autre">{t('lgs.other')}</option>
              </select>
            </div>
            {form.material === 'autre' && (
              <div>
                <label htmlFor="lgs-material-other">{t('lgs.specify')}</label>
                <input id="lgs-material-other" placeholder={t('lgs.material_name')}
                  onChange={(e) => setForm({ ...form, material: e.target.value })} />
              </div>
            )}
            <div>
              <label htmlFor="lgs-consumption">{t('lgs.consumption')}</label>
              <input id="lgs-consumption" type="number" step="0.01" value={form.consumption}
                onChange={(e) => setForm({ ...form, consumption: e.target.value })} />
            </div>
            <div>
              <label htmlFor="lgs-stock">{t('lgs.final_stock')}</label>
              <input id="lgs-stock" type="number" step="0.01" value={form.final_stock}
                onChange={(e) => setForm({ ...form, final_stock: e.target.value })} />
            </div>
            <div>
              <label htmlFor="lgs-notes">{t('lgs.notes')}</label>
              <input id="lgs-notes" value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <button className="mt-btn" disabled={busy}><Plus size={17} /> {t('lgs.save')}</button>
          {msg && <p className={`mt-msg ${msg.type}`} role={msg.type === 'err' ? 'alert' : 'status'}>{msg.text}</p>}
        </form>

        <section className="mt-card">
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', fontWeight: 500 }}>{t('lgs.entries')}</h3>
          <div className="mt-table-wrap">
            <table className="mt-table">
              <thead><tr><th>{t('lgs.description')}</th><th>{t('lgs.consumption')}</th><th>{t('lgs.final_stock')}</th><th>{t('lgs.notes')}</th></tr></thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id}>
                    <td>{e.material}</td><td>{e.consumption ?? '—'}</td><td>{e.final_stock ?? '—'}</td><td>{e.notes || '—'}</td>
                  </tr>
                ))}
                {!entries.length && (
                  <tr><td colSpan={4} style={{ color: 'var(--color-stone)' }}>{t('lgs.no_entries')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
