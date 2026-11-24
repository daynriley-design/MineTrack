import { useEffect, useState } from 'react';
import {
  Radio, Compass, Plus, Wrench, Droplets, AlertTriangle, Clock, Gauge, Ruler, Headset, ChevronRight,
} from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import AppShell from '../../components/AppShell';
import PageHero from '../../components/PageHero';

const LINKS = [{ to: '/support/dashboard', label: 'Support technique', icon: Headset }];

// Styles propres a la page ; champs, cartes et boutons viennent de index.css (.mt-*).
const CSS = `
.spt__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,1fr));gap:.85rem;margin-bottom:1rem}
.spt__list{display:flex;flex-direction:column;gap:0}
.spt__item{display:flex;align-items:center;gap:.8rem;width:100%;padding:.85rem 0;border:0;border-bottom:1px solid var(--color-rock-3);
background:transparent;color:var(--color-white);font:inherit;font-size:.97rem;cursor:pointer;text-align:left}
.spt__item:last-child{border-bottom:0}
.spt__item .mt-list__icon{color:var(--color-ash)}
.spt__item.is-open .mt-list__icon{background:#FFF1E6;color:var(--color-ore-dark)}
.spt__item.is-open{font-weight:600}
.spt__chev{margin-left:auto;color:var(--color-stone);transition:transform .2s ease}
.spt__item.is-open .spt__chev{transform:rotate(90deg);color:var(--color-ore-dark)}
.spt__card{scroll-margin-top:1rem}
.spt__card h3{margin:0 0 .9rem;font-size:1.05rem;font-weight:500}
`;

const today = () => new Date().toISOString().slice(0, 10);

const DISPATCH_ITEMS = [
  { key: 'pannes', icon: Wrench, label: 'Rapport des pannes' },
  { key: 'water', icon: Droplets, label: "Contrôle entrées/sorties d'eau" },
  { key: 'incident', icon: AlertTriangle, label: "Déclaration d'incident" },
  { key: 'blasting_hours', icon: Clock, label: 'Heure de minage' },
  { key: 'machine_index', icon: Gauge, label: 'Index des machines' },
  { key: 'layouts', icon: Ruler, label: 'Actualiser les layouts' },
];

export default function SupportDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [fn, setFn] = useState('dispatch');
  const [sites, setSites] = useState([]);
  const [machines, setMachines] = useState([]);
  const [siteId, setSiteId] = useState('');
  const [day, setDay] = useState(today());
  const [shift, setShift] = useState('day');
  const [openItem, setOpenItem] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const [panne, setPanne] = useState({ equipment_id: '', issue_type: 'breakdown', description: '', status: 'open' });
  const [water, setWater] = useState({ water_in: '', water_out: '', notes: '' });
  const [incident, setIncident] = useState({ title: '', description: '', severity: 'low', location: '' });
  const [blastHours, setBlastHours] = useState({ face: '', time: '', notes: '' });
  const [machIndex, setMachIndex] = useState({ machine_id: '', index_value: '', notes: '' });

  const [plans, setPlans] = useState([]);
  const [layout, setLayout] = useState({ plan_id: '', meters: '', azimuth: '', layout_date: today(), note: '' });

  useEffect(() => {
    api.get('/sites').then(({ data }) => setSites(data)).catch(() => setMsg({ type: 'err', text: 'Serveur injoignable.' }));
  }, []);

  useEffect(() => {
    if (!siteId) return; // la liste est videe dans le onChange du site
    api.get('/machines', { params: { site_id: siteId } }).then(({ data }) => setMachines(data)).catch(() => {});
  }, [siteId]);

  useEffect(() => {
    if (!siteId || openItem !== 'layouts') return;
    api.get('/monthly-plans', { params: { site_id: siteId, period: day.slice(0, 7) } })
      .then(({ data }) => setPlans(data)).catch(() => {});
  }, [siteId, openItem, day]);

  const send = async (fn2, okText, after) => {
    if (!siteId) { setMsg({ type: 'err', text: 'Choisis un site.' }); return; }
    setBusy(true);
    setMsg(null);
    try {
      await fn2();
      toast(okText, 'success');
      setOpenItem(null);
      after?.();
    } catch (err) {
      setMsg({ type: 'err', text: err?.response?.data?.detail || "Échec de l'enregistrement." });
    } finally {
      setBusy(false);
    }
  };

  const submitPanne = (e) => {
    e.preventDefault();
    send(() => api.post('/equipment-pannes', { ...panne, reported_date: day, reported_by: user?.name }),
      'Panne signalée', () => setPanne({ equipment_id: '', issue_type: 'breakdown', description: '', status: 'open' }));
  };

  const submitWater = (e) => {
    e.preventDefault();
    send(() => api.post('/shift-reports', {
      site_id: siteId, report_date: day, shift, report_type: 'water_control',
      payload: { water_in: water.water_in, water_out: water.water_out, notes: water.notes },
    }), "Contrôle d'eau enregistré", () => setWater({ water_in: '', water_out: '', notes: '' }));
  };

  const submitIncident = (e) => {
    e.preventDefault();
    send(() => api.post('/incidents', { ...incident, date: day, reported_by: user?.name }),
      'Incident déclaré', () => setIncident({ title: '', description: '', severity: 'low', location: '' }));
  };

  const submitBlastHours = (e) => {
    e.preventDefault();
    send(() => api.post('/shift-reports', {
      site_id: siteId, report_date: day, shift, report_type: 'blasting_hours',
      payload: { face: blastHours.face, time: blastHours.time, notes: blastHours.notes },
    }), 'Heure de minage enregistrée', () => setBlastHours({ face: '', time: '', notes: '' }));
  };

  const submitMachIndex = (e) => {
    e.preventDefault();
    const machine = machines.find((m) => m.id === machIndex.machine_id);
    send(() => api.post('/shift-reports', {
      site_id: siteId, report_date: day, shift, report_type: 'machine_index',
      payload: { machine_id: machIndex.machine_id, machine_number: machine?.machine_number, index_value: machIndex.index_value, notes: machIndex.notes },
    }), 'Index machine enregistré', () => setMachIndex({ machine_id: '', index_value: '', notes: '' }));
  };

  const submitLayout = (e) => {
    e.preventDefault();
    send(() => api.post('/layouts', {
      plan_id: layout.plan_id,
      meters: Number(layout.meters),
      azimuth: layout.azimuth === '' ? null : Number(layout.azimuth),
      layout_date: layout.layout_date,
      note: layout.note || null,
    }), 'Avancement enregistré', () => setLayout({ plan_id: '', meters: '', azimuth: '', layout_date: today(), note: '' }));
  };

  const commonBar = (
    <div className="spt__grid">
      <div>
        <label htmlFor="spt-site">Site</label>
        <select id="spt-site" value={siteId} onChange={(e) => { setOpenItem(null); setMachines([]); setSiteId(e.target.value); }}>
          <option value="">— choisir un site —</option>
          {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="spt-date">Date</label>
        <input id="spt-date" type="date" value={day} max={today()} onChange={(e) => setDay(e.target.value)} />
      </div>
      <div>
        <label htmlFor="spt-shift">Shift</label>
        <select id="spt-shift" value={shift} onChange={(e) => setShift(e.target.value)}>
          <option value="day">Jour</option>
          <option value="night">Nuit</option>
        </select>
      </div>
    </div>
  );

  const openForm = (key) => {
    const next = openItem === key ? null : key;
    setOpenItem(next);
    if (next) setTimeout(() => document.getElementById('spt-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };

  return (
    <AppShell
      brandIcon={Headset}
      roleLabel="Support technique"
      links={LINKS}
      dock={LINKS}
      fab={{ label: "Déclarer un incident", icon: AlertTriangle, onClick: () => { setFn('dispatch'); setOpenItem('incident'); setTimeout(() => document.getElementById('spt-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60); } }}
      flushPaths={['/support/dashboard']}
    >
      <style>{CSS}</style>
      <PageHero title="Support technique" subtitle={`${user?.name || 'Support'},`}>
        <div className="mt-chips" role="tablist" aria-label="Fonction du jour">
          <button type="button" role="tab" aria-selected={fn === 'dispatch'} className={`mt-chip${fn === 'dispatch' ? ' is-active' : ''}`}
            onClick={() => { setFn('dispatch'); setOpenItem(null); }}>
            <Radio size={17} /> Dispatch control
          </button>
          <button type="button" role="tab" aria-selected={fn === 'topographe'} className={`mt-chip${fn === 'topographe' ? ' is-active' : ''}`}
            onClick={() => { setFn('topographe'); setOpenItem(null); }}>
            <Compass size={17} /> Topographe
          </button>
        </div>
      </PageHero>

      <div className="mt-body mt-page mt-form">
        <section className="mt-card">{commonBar}</section>

        {fn === 'dispatch' && (
          <>
            <section className="mt-card" style={{ paddingTop: '0.4rem', paddingBottom: '0.4rem' }}>
              <div className="spt__list">
                {DISPATCH_ITEMS.map(({ key, icon: Icon, label }) => (
                  <button key={key} type="button" aria-expanded={openItem === key} className={`spt__item${openItem === key ? ' is-open' : ''}`}
                    onClick={() => openForm(key)}>
                    <span className="mt-list__icon"><Icon size={18} /></span> {label}
                    <ChevronRight size={18} className="spt__chev" />
                  </button>
                ))}
              </div>
            </section>
            <div id="spt-form" style={{ scrollMarginTop: '1rem' }} />

            {openItem === 'pannes' && (
              <form className="mt-card spt__card" onSubmit={submitPanne}>
                <div className="spt__grid">
                  <div>
                    <label htmlFor="pn-eq">Machine</label>
                    <select id="pn-eq" value={panne.equipment_id} required
                      onChange={(e) => setPanne({ ...panne, equipment_id: e.target.value })}>
                      <option value="">— choisir —</option>
                      {machines.map((m) => <option key={m.id} value={m.machine_number}>{m.machine_number} ({m.machine_type})</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="pn-type">Type</label>
                    <select id="pn-type" value={panne.issue_type}
                      onChange={(e) => setPanne({ ...panne, issue_type: e.target.value })}>
                      <option value="breakdown">Panne totale</option>
                      <option value="hydraulic_failure">Hydraulique</option>
                      <option value="electrical">Électrique</option>
                      <option value="mechanical">Mécanique</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>
                </div>
                <label htmlFor="pn-desc">Description</label>
                <textarea id="pn-desc" required value={panne.description}
                  onChange={(e) => setPanne({ ...panne, description: e.target.value })} />
                <div style={{ marginTop: '.9rem' }}>
                  <button className="mt-btn" disabled={busy}><Plus size={16} /> Signaler la panne</button>
                </div>
              </form>
            )}

            {openItem === 'water' && (
              <form className="mt-card spt__card" onSubmit={submitWater}>
                <div className="spt__grid">
                  <div>
                    <label htmlFor="wt-in">Entrée d'eau (m³)</label>
                    <input id="wt-in" type="number" step="0.1" value={water.water_in}
                      onChange={(e) => setWater({ ...water, water_in: e.target.value })} />
                  </div>
                  <div>
                    <label htmlFor="wt-out">Sortie d'eau (m³)</label>
                    <input id="wt-out" type="number" step="0.1" value={water.water_out}
                      onChange={(e) => setWater({ ...water, water_out: e.target.value })} />
                  </div>
                </div>
                <label htmlFor="wt-notes">Notes</label>
                <textarea id="wt-notes" value={water.notes} onChange={(e) => setWater({ ...water, notes: e.target.value })} />
                <div style={{ marginTop: '.9rem' }}>
                  <button className="mt-btn" disabled={busy}><Plus size={16} /> Enregistrer</button>
                </div>
              </form>
            )}

            {openItem === 'incident' && (
              <form className="mt-card spt__card" onSubmit={submitIncident}>
                <div className="spt__grid">
                  <div>
                    <label htmlFor="inc-title">Titre</label>
                    <input id="inc-title" required value={incident.title}
                      onChange={(e) => setIncident({ ...incident, title: e.target.value })} />
                  </div>
                  <div>
                    <label htmlFor="inc-sev">Gravité</label>
                    <select id="inc-sev" value={incident.severity}
                      onChange={(e) => setIncident({ ...incident, severity: e.target.value })}>
                      <option value="low">Faible</option>
                      <option value="medium">Moyenne</option>
                      <option value="high">Élevée</option>
                      <option value="critical">Critique</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="inc-loc">Localisation</label>
                    <input id="inc-loc" required value={incident.location}
                      onChange={(e) => setIncident({ ...incident, location: e.target.value })} />
                  </div>
                </div>
                <label htmlFor="inc-desc">Description</label>
                <textarea id="inc-desc" required value={incident.description}
                  onChange={(e) => setIncident({ ...incident, description: e.target.value })} />
                <div style={{ marginTop: '.9rem' }}>
                  <button className="mt-btn" disabled={busy}><Plus size={16} /> Déclarer l'incident</button>
                </div>
              </form>
            )}

            {openItem === 'blasting_hours' && (
              <form className="mt-card spt__card" onSubmit={submitBlastHours}>
                <div className="spt__grid">
                  <div>
                    <label htmlFor="bh-face">Front</label>
                    <input id="bh-face" required value={blastHours.face}
                      onChange={(e) => setBlastHours({ ...blastHours, face: e.target.value })} />
                  </div>
                  <div>
                    <label htmlFor="bh-time">Heure</label>
                    <input id="bh-time" type="time" required value={blastHours.time}
                      onChange={(e) => setBlastHours({ ...blastHours, time: e.target.value })} />
                  </div>
                </div>
                <label htmlFor="bh-notes">Notes</label>
                <textarea id="bh-notes" value={blastHours.notes}
                  onChange={(e) => setBlastHours({ ...blastHours, notes: e.target.value })} />
                <div style={{ marginTop: '.9rem' }}>
                  <button className="mt-btn" disabled={busy}><Plus size={16} /> Enregistrer</button>
                </div>
              </form>
            )}

            {openItem === 'machine_index' && (
              <form className="mt-card spt__card" onSubmit={submitMachIndex}>
                <div className="spt__grid">
                  <div>
                    <label htmlFor="mi-mach">Machine</label>
                    <select id="mi-mach" value={machIndex.machine_id} required
                      onChange={(e) => setMachIndex({ ...machIndex, machine_id: e.target.value })}>
                      <option value="">— choisir —</option>
                      {machines.map((m) => <option key={m.id} value={m.id}>{m.machine_number} ({m.machine_type})</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="mi-val">Index (heures)</label>
                    <input id="mi-val" type="number" step="0.1" required value={machIndex.index_value}
                      onChange={(e) => setMachIndex({ ...machIndex, index_value: e.target.value })} />
                  </div>
                </div>
                <label htmlFor="mi-notes">Notes</label>
                <textarea id="mi-notes" value={machIndex.notes}
                  onChange={(e) => setMachIndex({ ...machIndex, notes: e.target.value })} />
                <div style={{ marginTop: '.9rem' }}>
                  <button className="mt-btn" disabled={busy}><Plus size={16} /> Enregistrer</button>
                </div>
              </form>
            )}

            {openItem === 'layouts' && (
              <form className="mt-card spt__card" onSubmit={submitLayout}>
                <div className="spt__grid">
                  <div>
                    <label htmlFor="ly-plan">Front du mois</label>
                    <select id="ly-plan" value={layout.plan_id} required
                      onChange={(e) => setLayout({ ...layout, plan_id: e.target.value })}>
                      <option value="">— choisir un front —</option>
                      {plans.map((p) => (
                        <option key={p.id} value={p.id}>Niv. {p.level} · {p.face} · {p.done_meters}/{p.planned_meters} m</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="ly-m">Mètres</label>
                    <input id="ly-m" type="number" step="0.1" min="0.1" required value={layout.meters}
                      onChange={(e) => setLayout({ ...layout, meters: e.target.value })} />
                  </div>
                  <div>
                    <label htmlFor="ly-az">Azimut (°)</label>
                    <input id="ly-az" type="number" step="0.1" min="0" max="360" value={layout.azimuth}
                      onChange={(e) => setLayout({ ...layout, azimuth: e.target.value })} />
                  </div>
                  <div>
                    <label htmlFor="ly-d">Date</label>
                    <input id="ly-d" type="date" required value={layout.layout_date}
                      onChange={(e) => setLayout({ ...layout, layout_date: e.target.value })} />
                  </div>
                </div>
                <label htmlFor="ly-note">Note</label>
                <input id="ly-note" value={layout.note} onChange={(e) => setLayout({ ...layout, note: e.target.value })} />
                <div style={{ marginTop: '.9rem' }}>
                  <button className="mt-btn" disabled={busy}><Plus size={16} /> Enregistrer l'avancement</button>
                </div>
              </form>
            )}
          </>
        )}

        {fn === 'topographe' && (
          <form className="mt-card spt__card" onSubmit={submitLayout}>
            <p className="mt-card__eyebrow" style={{ marginBottom: '1rem' }}>Actualiser les layouts et enregistrer l'avancement de front.</p>
            <div className="spt__grid">
              <div>
                <label htmlFor="tp-plan">Front du mois</label>
                <select id="tp-plan" value={layout.plan_id} required
                  onChange={(e) => setLayout({ ...layout, plan_id: e.target.value })}
                  onFocus={() => {
                    if (siteId) api.get('/monthly-plans', { params: { site_id: siteId, period: day.slice(0, 7) } }).then(({ data }) => setPlans(data));
                  }}>
                  <option value="">— choisir un front —</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>Niv. {p.level} · {p.face} · {p.done_meters}/{p.planned_meters} m</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="tp-m">Mètres</label>
                <input id="tp-m" type="number" step="0.1" min="0.1" required value={layout.meters}
                  onChange={(e) => setLayout({ ...layout, meters: e.target.value })} />
              </div>
              <div>
                <label htmlFor="tp-az">Azimut (°)</label>
                <input id="tp-az" type="number" step="0.1" min="0" max="360" value={layout.azimuth}
                  onChange={(e) => setLayout({ ...layout, azimuth: e.target.value })} />
              </div>
              <div>
                <label htmlFor="tp-d">Date</label>
                <input id="tp-d" type="date" required value={layout.layout_date}
                  onChange={(e) => setLayout({ ...layout, layout_date: e.target.value })} />
              </div>
            </div>
            <label htmlFor="tp-note">Note</label>
            <input id="tp-note" value={layout.note} onChange={(e) => setLayout({ ...layout, note: e.target.value })} />
            <div style={{ marginTop: '.9rem' }}>
              <button className="mt-btn" disabled={busy}><Plus size={16} /> Enregistrer l'avancement</button>
            </div>
          </form>
        )}

        {msg && <p className={`mt-msg ${msg.type}`} role={msg.type === 'err' ? 'alert' : 'status'}>{msg.text}</p>}
      </div>
    </AppShell>
  );
}
