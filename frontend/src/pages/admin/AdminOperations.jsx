import { useEffect, useState } from 'react';
import { MapPin, CalendarRange, Ruler, Truck, Users, Plus, Check, AlertTriangle } from 'lucide-react';
import api from '../../api';
import PageHero from '../../components/PageHero';

// Styles propres a la page ; cartes, champs et boutons viennent de index.css (.mt-*).
const CSS = `
.adm__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(11rem,1fr));gap:.85rem}
.adm .mt-btn{margin-top:1.1rem}
.adm__table{margin-top:1.5rem}
.adm__msg{margin-top:1rem;font-size:.88rem;display:flex;align-items:center;gap:.4rem}
.adm__msg.err{color:#DC2626}
.adm__msg.ok{color:#047857}
.adm__bar{height:6px;border-radius:9999px;background:var(--color-rock-3);overflow:hidden;min-width:6rem;margin-bottom:.25rem}
.adm__bar span{display:block;height:100%;border-radius:9999px;background:var(--color-ore)}
`;

const TABS = [
  { key: 'site', icon: MapPin, label: 'Ajouter un site' },
  { key: 'plan', icon: CalendarRange, label: 'Plan mensuel' },
  { key: 'layout', icon: Ruler, label: 'Layout' },
  { key: 'machine', icon: Truck, label: 'Machine' },
  { key: 'agent', icon: Users, label: 'Agents' },
];

const MACHINE_TYPES = ['jumbo', 'loader', 'camion', 'ventilateur', 'face rig', 'support rig', 'longhole rig', 'autre'];
const currentPeriod = () => new Date().toISOString().slice(0, 7);
const today = () => new Date().toISOString().slice(0, 10);

export default function AdminOperations() {
  const [tab, setTab] = useState('site');
  const [sites, setSites] = useState([]);
  const [plans, setPlans] = useState([]);
  const [machines, setMachines] = useState([]);
  const [agents, setAgents] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const [site, setSite] = useState({ name: '', code: '', location: '' });
  const [plan, setPlan] = useState({ site_id: '', period: currentPeriod(), level: '', face: '', planned_meters: '' });
  const [layout, setLayout] = useState({ site_id: '', plan_id: '', meters: '', azimuth: '', layout_date: today(), note: '' });
  const [machine, setMachine] = useState({ site_id: '', machine_number: '', machine_type: 'jumbo', unit_number: '', brand: '' });
  const [agent, setAgent] = useState({ id_number: '', full_name: '', job_title: '', site_id: '' });

  const fetchSites = () => api.get('/sites').then(({ data }) => setSites(data));
  const fetchMachines = () => api.get('/machines').then(({ data }) => setMachines(data));
  const fetchAgents = () => api.get('/agents').then(({ data }) => setAgents(data));
  const fetchPlans = (siteId, period) =>
    siteId
      ? api.get('/monthly-plans', { params: { site_id: siteId, period } }).then(({ data }) => setPlans(data))
      : Promise.resolve();

  useEffect(() => {
    api.get('/sites')
      .then(({ data }) => setSites(data))
      .catch(() => setMsg({ type: 'err', text: 'Serveur injoignable.' }));
  }, []);

  useEffect(() => {
    if (tab !== 'machine') return;
    api.get('/machines').then(({ data }) => setMachines(data)).catch(() => {});
  }, [tab]);

  useEffect(() => {
    if (tab !== 'agent') return;
    fetchAgents().catch(() => {});
     
  }, [tab]);

  useEffect(() => {
    if (tab !== 'plan' || !plan.site_id) return;
    api.get('/monthly-plans', { params: { site_id: plan.site_id, period: plan.period } })
      .then(({ data }) => setPlans(data))
      .catch(() => {});
  }, [tab, plan.site_id, plan.period]);

  useEffect(() => {
    if (tab !== 'layout' || !layout.site_id) return;
    api.get('/monthly-plans', { params: { site_id: layout.site_id, period: currentPeriod() } })
      .then(({ data }) => setPlans(data))
      .catch(() => {});
  }, [tab, layout.site_id]);

  const send = async (fn, okText) => {
    setBusy(true);
    setMsg(null);
    try {
      await fn();
      setMsg({ type: 'ok', text: okText });
    } catch (err) {
      setMsg({ type: 'err', text: err?.response?.data?.detail || "Échec de l'enregistrement." });
    } finally {
      setBusy(false);
    }
  };

  const submitSite = (e) => {
    e.preventDefault();
    send(async () => {
      await api.post('/sites', site);
      setSite({ name: '', code: '', location: '' });
      await fetchSites();
    }, 'Site enregistré');
  };

  const submitPlan = (e) => {
    e.preventDefault();
    send(async () => {
      await api.post('/monthly-plans', { ...plan, planned_meters: Number(plan.planned_meters) });
      setPlan((p) => ({ ...p, level: '', face: '', planned_meters: '' }));
      await fetchPlans(plan.site_id, plan.period);
    }, 'Plan mensuel enregistré');
  };

  const submitLayout = (e) => {
    e.preventDefault();
    send(async () => {
      const { data } = await api.post('/layouts', {
        plan_id: layout.plan_id,
        meters: Number(layout.meters),
        azimuth: layout.azimuth === '' ? null : Number(layout.azimuth),
        layout_date: layout.layout_date,
        note: layout.note || null,
      });
      setLayout((l) => ({ ...l, meters: '', azimuth: '', note: '' }));
      await fetchPlans(layout.site_id, currentPeriod());
      if (data.over_plan) {
        setMsg({ type: 'err', text: `Cumul ${data.done_meters} m au-dessus du plan (${data.planned_meters} m).` });
      }
    }, 'Layout enregistré');
  };

  const submitMachine = (e) => {
    e.preventDefault();
    send(async () => {
      await api.post('/machines', {
        ...machine,
        site_id: machine.site_id || null,
        unit_number: machine.unit_number === '' ? null : Number(machine.unit_number),
      });
      setMachine({ site_id: '', machine_number: '', machine_type: 'jumbo', unit_number: '', brand: '' });
      await fetchMachines();
    }, 'Machine enregistrée');
  };

  const submitAgent = (e) => {
    e.preventDefault();
    send(async () => {
      await api.post('/agents', { ...agent, site_id: agent.site_id || null, job_title: agent.job_title || null });
      setAgent({ id_number: '', full_name: '', job_title: '', site_id: '' });
      await fetchAgents();
    }, 'Agent enregistré');
  };

  const siteOptions = (
    <>
      <option value="">— choisir un site —</option>
      {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
    </>
  );

  return (
    <div className="adm">
      <style>{CSS}</style>
      <PageHero title="Configuration" subtitle="des opérations">
        <div className="mt-chips" aria-label="Élément à configurer">
          {TABS.map(({ key, icon: Icon, label }) => (
            <button key={key} type="button" aria-pressed={tab === key}
              className={`mt-chip${tab === key ? ' is-active' : ''}`}
              onClick={() => { setTab(key); setMsg(null); }}>
              <Icon size={17} /> {label}
            </button>
          ))}
        </div>
      </PageHero>

      <div className="mt-body mt-page">
      <div className="mt-card mt-form">
        {tab === 'site' && (
          <form onSubmit={submitSite}>
            <div className="adm__grid">
              <div>
                <label htmlFor="s-name">Nom du site</label>
                <input id="s-name" value={site.name} required placeholder="Kadutu"
                  onChange={(e) => setSite({ ...site, name: e.target.value })} />
              </div>
              <div>
                <label htmlFor="s-code">Code</label>
                <input id="s-code" value={site.code}
                  onChange={(e) => setSite({ ...site, code: e.target.value })} />
              </div>
              <div>
                <label htmlFor="s-loc">Localisation</label>
                <input id="s-loc" value={site.location}
                  onChange={(e) => setSite({ ...site, location: e.target.value })} />
              </div>
            </div>
            <button className="mt-btn" disabled={busy}><Plus size={16} /> Enregistrer le site</button>

            <table className="mt-table adm__table">
              <thead><tr><th>Site</th><th>Code</th><th>Localisation</th></tr></thead>
              <tbody>
                {sites.map((s) => (
                  <tr key={s.id}><td>{s.name}</td><td>{s.code || '—'}</td><td>{s.location || '—'}</td></tr>
                ))}
              </tbody>
            </table>
          </form>
        )}

        {tab === 'plan' && (
          <form onSubmit={submitPlan}>
            <div className="adm__grid">
              <div>
                <label htmlFor="p-site">Site</label>
                <select id="p-site" value={plan.site_id} required
                  onChange={(e) => { setPlans([]); setPlan({ ...plan, site_id: e.target.value }); }}>{siteOptions}</select>
              </div>
              <div>
                <label htmlFor="p-period">Mois</label>
                <input id="p-period" type="month" value={plan.period} required
                  onChange={(e) => setPlan({ ...plan, period: e.target.value })} />
              </div>
              <div>
                <label htmlFor="p-level">Niveau</label>
                <input id="p-level" value={plan.level} required placeholder="23"
                  onChange={(e) => setPlan({ ...plan, level: e.target.value })} />
              </div>
              <div>
                <label htmlFor="p-face">Front / chantier</label>
                <input id="p-face" value={plan.face} required placeholder="MXL_XV13"
                  onChange={(e) => setPlan({ ...plan, face: e.target.value })} />
              </div>
              <div>
                <label htmlFor="p-m">Mètres prévus</label>
                <input id="p-m" type="number" step="0.1" min="0.1" required value={plan.planned_meters} placeholder="50"
                  onChange={(e) => setPlan({ ...plan, planned_meters: e.target.value })} />
              </div>
            </div>
            <button className="mt-btn" disabled={busy}><Plus size={16} /> Enregistrer le plan</button>

            <table className="mt-table adm__table">
              <thead><tr><th>Niveau</th><th>Front</th><th>Prévu</th><th>Réalisé</th><th>Avancement</th></tr></thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p.id}>
                    <td>{p.level}</td><td>{p.face}</td><td>{p.planned_meters} m</td><td>{p.done_meters} m</td>
                    <td>
                      <div className="adm__bar"><span style={{ width: `${Math.min(p.progress_pct, 100)}%` }} /></div>
                      {p.progress_pct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </form>
        )}

        {tab === 'layout' && (
          <form onSubmit={submitLayout}>
            <div className="adm__grid">
              <div>
                <label htmlFor="l-site">Site</label>
                <select id="l-site" value={layout.site_id} required
                  onChange={(e) => { setPlans([]); setLayout({ ...layout, site_id: e.target.value, plan_id: '' }); }}>{siteOptions}</select>
              </div>
              <div>
                <label htmlFor="l-plan">Front du mois</label>
                <select id="l-plan" value={layout.plan_id} required
                  onChange={(e) => setLayout({ ...layout, plan_id: e.target.value })}>
                  <option value="">— choisir un front —</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      Niv. {p.level} · {p.face} · {p.done_meters}/{p.planned_meters} m
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="l-m">Mètres du tronçon</label>
                <input id="l-m" type="number" step="0.1" min="0.1" required value={layout.meters} placeholder="10"
                  onChange={(e) => setLayout({ ...layout, meters: e.target.value })} />
              </div>
              <div>
                <label htmlFor="l-az">Azimut (°)</label>
                <input id="l-az" type="number" step="0.1" min="0" max="360" value={layout.azimuth}
                  onChange={(e) => setLayout({ ...layout, azimuth: e.target.value })} />
              </div>
              <div>
                <label htmlFor="l-d">Date</label>
                <input id="l-d" type="date" value={layout.layout_date} required
                  onChange={(e) => setLayout({ ...layout, layout_date: e.target.value })} />
              </div>
              <div>
                <label htmlFor="l-n">Note</label>
                <input id="l-n" value={layout.note}
                  onChange={(e) => setLayout({ ...layout, note: e.target.value })} />
              </div>
            </div>
            <button className="mt-btn" disabled={busy}><Plus size={16} /> Enregistrer le layout</button>
          </form>
        )}

        {tab === 'machine' && (
          <form onSubmit={submitMachine}>
            <div className="adm__grid">
              <div>
                <label htmlFor="m-site">Site</label>
                <select id="m-site" value={machine.site_id}
                  onChange={(e) => setMachine({ ...machine, site_id: e.target.value })}>{siteOptions}</select>
              </div>
              <div>
                <label htmlFor="m-num">Numéro machine</label>
                <input id="m-num" value={machine.machine_number} required placeholder="JMB-014"
                  onChange={(e) => setMachine({ ...machine, machine_number: e.target.value })} />
              </div>
              <div>
                <label htmlFor="m-type">Type</label>
                <select id="m-type" value={machine.machine_type}
                  onChange={(e) => setMachine({ ...machine, machine_type: e.target.value })}>
                  {MACHINE_TYPES.map((tp) => <option key={tp} value={tp}>{tp}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="m-unit">N° d'unité</label>
                <input id="m-unit" type="number" min="1" value={machine.unit_number} placeholder="1"
                  onChange={(e) => setMachine({ ...machine, unit_number: e.target.value })} />
              </div>
              <div>
                <label htmlFor="m-brand">Marque</label>
                <input id="m-brand" value={machine.brand}
                  onChange={(e) => setMachine({ ...machine, brand: e.target.value })} />
              </div>
            </div>
            <button className="mt-btn" disabled={busy}><Plus size={16} /> Enregistrer la machine</button>

            <table className="mt-table adm__table">
              <thead><tr><th>Numéro</th><th>Type</th><th>Unité</th><th>Site</th><th>État</th></tr></thead>
              <tbody>
                {machines.map((m) => (
                  <tr key={m.id}>
                    <td>{m.machine_number}</td><td>{m.machine_type}</td><td>{m.unit_number ?? '—'}</td>
                    <td>{sites.find((s) => s.id === m.site_id)?.name || '—'}</td><td>{m.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </form>
        )}

        {tab === 'agent' && (
          <form onSubmit={submitAgent}>
            <div className="adm__grid">
              <div>
                <label htmlFor="a-idnum">Id number</label>
                <input id="a-idnum" value={agent.id_number} required placeholder="AG-001"
                  onChange={(e) => setAgent({ ...agent, id_number: e.target.value })} />
              </div>
              <div>
                <label htmlFor="a-name">Nom complet</label>
                <input id="a-name" value={agent.full_name} required placeholder="Jean Mukendi"
                  onChange={(e) => setAgent({ ...agent, full_name: e.target.value })} />
              </div>
              <div>
                <label htmlFor="a-job">Job title</label>
                <input id="a-job" value={agent.job_title} placeholder="Mine captain"
                  onChange={(e) => setAgent({ ...agent, job_title: e.target.value })} />
              </div>
              <div>
                <label htmlFor="a-site">Site</label>
                <select id="a-site" value={agent.site_id}
                  onChange={(e) => setAgent({ ...agent, site_id: e.target.value })}>{siteOptions}</select>
              </div>
            </div>
            <button className="mt-btn" disabled={busy}><Plus size={16} /> Enregistrer l'agent</button>

            <table className="mt-table adm__table">
              <thead><tr><th>Id number</th><th>Nom complet</th><th>Job title</th><th>Site</th></tr></thead>
              <tbody>
                {agents.map((a) => (
                  <tr key={a.id}>
                    <td>{a.id_number}</td><td>{a.full_name}</td><td>{a.job_title || '—'}</td>
                    <td>{sites.find((s) => s.id === a.site_id)?.name || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </form>
        )}

        {msg && (
          <p className={`adm__msg ${msg.type}`} role={msg.type === 'err' ? 'alert' : 'status'}>
            {msg.type === 'ok' ? <Check size={16} /> : <AlertTriangle size={16} />}{msg.text}
          </p>
        )}
      </div>
      </div>
    </div>
  );
}
