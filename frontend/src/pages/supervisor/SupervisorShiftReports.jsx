import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Loader2, Plus } from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const CSS = `
.ssr{--ore:#f26a1b;--ore-hot:#ff8a2b;--panel:#FFFFFF;--line:#ECEDF0;--txt:#2A2C31;--muted:#8B8E95;
color:var(--txt);font-family:'Inter',system-ui,sans-serif}
.ssr h1{margin:0 0 .35rem;font-size:1.4rem}
.ssr__sub{margin:0 0 1.5rem;color:var(--muted);font-size:.85rem}
.ssr__tabs{display:grid;grid-template-columns:repeat(auto-fit,minmax(13rem,1fr));gap:.6rem;margin-bottom:1.5rem;max-width:64rem}
.ssr__tab{padding:.75rem .9rem;border:1px solid var(--line);border-radius:9px;background:#F7F8FA;color:var(--txt);
font-size:.85rem;font-weight:600;cursor:pointer;text-align:left}
.ssr__tab.is-active{background:linear-gradient(180deg,var(--ore-hot),var(--ore));color:#FFFFFF;border-color:#ffb37a}
.ssr__bar{display:grid;grid-template-columns:repeat(auto-fit,minmax(11rem,1fr));gap:1rem;max-width:46rem;margin-bottom:1.5rem}
.ssr__bar label{display:block;font-size:.76rem;color:var(--muted);margin-bottom:.3rem}
.ssr__bar input,.ssr__bar select{width:100%;padding:.6rem .7rem;border:1px solid var(--line);border-radius:7px;
background:#F7F8FA;color:var(--txt);font-size:.9rem}
.ssr__list{display:grid;gap:.6rem;max-width:46rem}
.ssr__item{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.9rem 1.1rem;
border:1px solid var(--line);border-radius:9px;background:var(--panel);width:100%;color:var(--txt);
font-size:.95rem;cursor:pointer;text-align:left}
.ssr__item:hover{border-color:var(--ore)}
.ssr__item.is-open{border-color:var(--ore)}
.ssr__tag{font-size:.72rem;padding:.2rem .55rem;border-radius:99px;border:1px solid var(--line);color:var(--muted);white-space:nowrap}
.ssr__tag.ok{color:#8fe388;border-color:#2f5a2c}
.ssr__tag.miss{color:#ffab91;border-color:#5a3a2c}
.ssr__panel{margin-top:.6rem;background:var(--panel);border:1px solid var(--line);border-radius:11px;padding:1.25rem;max-width:46rem}
.ssr__panel h2{margin:0 0 .3rem;font-size:1rem}
.ssr__hint{margin:0 0 1rem;font-size:.8rem;color:var(--muted)}
.ssr__panel pre{margin:0;white-space:pre-wrap;word-break:break-word;font-family:ui-monospace,monospace;
font-size:.82rem;line-height:1.6}
.ssr__field{display:grid;gap:.3rem;margin-bottom:.9rem}
.ssr__field label{font-size:.78rem;color:var(--muted)}
.ssr__field input,.ssr__field select,.ssr__field textarea{padding:.6rem .7rem;border:1px solid var(--line);
border-radius:7px;background:#F7F8FA;color:var(--txt);font-size:.9rem;font-family:inherit}
.ssr__field textarea{min-height:5rem;resize:vertical}
.ssr__submit{margin-top:.5rem;display:inline-flex;align-items:center;gap:.5rem;padding:.65rem 1.2rem;border:0;
border-radius:7px;background:linear-gradient(180deg,var(--ore-hot),var(--ore));color:#FFFFFF;font-weight:700;
font-size:.9rem;cursor:pointer}
.ssr__submit:disabled{opacity:.55;cursor:not-allowed}
.ssr__spin{animation:ssr-spin .9s linear infinite}
@keyframes ssr-spin{to{transform:rotate(360deg)}}
.ssr__empty{display:flex;align-items:center;gap:.5rem;color:var(--muted);font-size:.87rem}
.ssr__recent{margin-top:1rem;font-size:.82rem}
.ssr__recent table{width:100%;border-collapse:collapse}
.ssr__recent th{text-align:left;color:var(--muted);font-weight:500;padding:.4rem .5rem;border-bottom:1px solid var(--line)}
.ssr__recent td{padding:.4rem .5rem;border-bottom:1px solid #F0F1F3}
`;

// Catalogue des rapports partagés par plusieurs fonctions (cahier des charges §3).
const SHARED = {
  safety: { key: 'safety', label: 'Safety', kind: 'shift_report', reportType: 'safety',
    hint: 'Alertes : incidents et accidents.', fields: [
      { key: 'incident_occurred', label: 'Incident ou accident survenu', type: 'checkbox' },
      { key: 'severity', label: 'Gravité', type: 'select', options: ['low', 'medium', 'high', 'critical'] },
      { key: 'location', label: 'Localisation', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea', required: true },
    ] },
  pto: { key: 'pto', label: 'PTO (Plan Task Observation)', kind: 'pto' },
  concerns: { key: 'concerns', label: 'Concerns / Observation', kind: 'shift_report', reportType: 'concerns',
    hint: 'Corrections et choses à arranger sur le site.', fields: [
      { key: 'priority', label: 'Priorité', type: 'select', options: ['low', 'medium', 'high'] },
      { key: 'location', label: 'Localisation', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea', required: true },
    ] },
  blasting: { key: 'blasting', label: 'Blasting', kind: 'shift_report', reportType: 'blasting',
    hint: 'Fronts minés.', fields: [
      { key: 'face', label: 'Front (niveau / front)', type: 'text', required: true },
      { key: 'holes_count', label: 'Nombre de trous', type: 'number' },
      { key: 'explosives_kg', label: 'Explosifs utilisés (kg)', type: 'number' },
      { key: 'result', label: 'Résultat', type: 'textarea' },
    ] },
  shift_preparation: { key: 'shift_preparation', label: 'Shift preparation', kind: 'shift_report', reportType: 'shift_preparation',
    hint: 'Fronts à préparer pour le shift suivant.', fields: [
      { key: 'faces_to_prepare', label: 'Fronts à préparer', type: 'textarea', required: true },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ] },
  advance: { key: 'advance', label: 'Advance (meter)', kind: 'layout' },
};

// Une fonction = une checklist de fin de poste (cahier des charges §3).
const FUNCTIONS = {
  mine_captain: {
    label: 'Mine captain',
    items: [
      { key: 're_entry', label: 'Re-entry', kind: 'shift_report', reportType: 're_entry',
        hint: 'Contrôle de sécurité après minage, avant réaccès au chantier.', fields: [
          { key: 'status', label: 'Résultat', type: 'select', options: ['cleared', 'not_cleared'] },
          { key: 'gas_readings', label: 'Relevés gaz', type: 'text' },
          { key: 'ventilation_ok', label: 'Ventilation OK', type: 'checkbox' },
          { key: 'hazards_observed', label: 'Dangers observés', type: 'textarea' },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ] },
    ],
  },
  shift_boss_dev: {
    label: 'Shift boss / Development',
    items: [
      SHARED.safety, SHARED.pto, SHARED.blasting, SHARED.shift_preparation, SHARED.advance, SHARED.concerns,
      { key: 'drilling_machine_status', label: 'Machine status (face rig & support rig)', kind: 'shift_report', reportType: 'drilling_machine_status',
        hint: 'Face rig et support rig.', fields: [
          { key: 'face_rig_status', label: 'État du face rig', type: 'select', options: ['operational', 'breakdown', 'maintenance'] },
          { key: 'support_rig_status', label: 'État du support rig', type: 'select', options: ['operational', 'breakdown', 'maintenance'] },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ] },
    ],
  },
  shift_boss_longhole: {
    label: 'Shift boss / Longhole',
    items: [
      SHARED.safety, SHARED.pto, SHARED.blasting, SHARED.shift_preparation, SHARED.concerns,
      { key: 'longhole_report', label: 'Advance & machine status', kind: 'shift_report', reportType: 'longhole_report',
        hint: 'Chantiers en cours et progression, plus état des machines.', fields: [
          { key: 'sites_in_progress', label: 'Chantiers en cours', type: 'textarea', required: true },
          { key: 'progress_notes', label: 'Progression', type: 'textarea' },
          { key: 'machine_status', label: 'État des machines', type: 'textarea' },
        ] },
    ],
  },
  tramming_supervisor: {
    label: 'Tramming supervisor',
    items: [
      SHARED.safety, SHARED.pto,
      { key: 'tramming_machine_status', label: 'Face lashed, tonnage & grade + machine status', kind: 'shift_report', reportType: 'tramming_machine_status',
        hint: 'Front destocké, tonnage (minerai/stérile), teneur, état des machines.', fields: [
          { key: 'face', label: 'Front', type: 'text', required: true },
          { key: 'tonnage_ore', label: 'Tonnage minerai (t)', type: 'number' },
          { key: 'tonnage_waste', label: 'Tonnage stérile (t)', type: 'number' },
          { key: 'grade', label: 'Teneur', type: 'text' },
          { key: 'machines_ok', label: 'Machines en bon état', type: 'textarea' },
          { key: 'machines_down', label: 'Machines en panne', type: 'textarea' },
        ] },
      SHARED.concerns,
    ],
  },
  pic_dev: {
    label: 'PIC / Development',
    items: [SHARED.pto, { key: 'face_examination', label: 'Face examination', kind: 'face_examination' }],
  },
  pic_longhole: {
    label: 'PIC / Longhole',
    items: [SHARED.pto, { key: 'face_examination', label: 'Face examination', kind: 'face_examination' }],
  },
  construction_tl: {
    label: 'Construction Team Leader',
    items: [
      SHARED.safety, SHARED.pto,
      { key: 'ground_support', label: 'Shotcrete (M³) / Concrete (M³)', kind: 'ground_support' },
      { key: 'construction_service', label: 'Travaux & machine status', kind: 'shift_report', reportType: 'construction_service',
        hint: 'Lieu et type de travail, état des machines.', fields: [
          { key: 'location', label: 'Lieu', type: 'text' },
          { key: 'work_description', label: 'Travaux réalisés', type: 'textarea', required: true },
          { key: 'machine_status', label: 'État des machines', type: 'textarea' },
        ] },
    ],
  },
  service_vent_tl: {
    label: 'Service vent & exhaur Team Leader',
    items: [
      SHARED.safety, SHARED.pto,
      { key: 'vent_service', label: 'Vent tube / pompe / sump', kind: 'shift_report', reportType: 'vent_service',
        hint: 'Installation vent tube (lieu, distance), installation pompe, nettoyage sump.', fields: [
          { key: 'vent_location', label: 'Vent tube — lieu', type: 'text' },
          { key: 'vent_distance_m', label: 'Vent tube — distance installée (m)', type: 'number' },
          { key: 'pump_installation', label: 'Installation pompe', type: 'textarea' },
          { key: 'sump_cleaning', label: 'Nettoyage sump', type: 'textarea' },
        ] },
    ],
  },
};

const today = () => new Date().toISOString().slice(0, 10);

function emptyValues(fields) {
  const out = {};
  for (const f of fields) out[f.key] = f.type === 'checkbox' ? false : '';
  return out;
}

function ReportField({ field, value, onChange }) {
  const common = { id: `f-${field.key}` };
  if (field.type === 'textarea') {
    return <textarea {...common} value={value} required={field.required} onChange={(e) => onChange(e.target.value)} />;
  }
  if (field.type === 'select') {
    return (
      <select {...common} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Sélectionner…</option>
        {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }
  if (field.type === 'checkbox') {
    return <input {...common} type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} style={{ width: 'auto', justifySelf: 'start' }} />;
  }
  return (
    <input {...common} type={field.type} value={value} required={field.required}
      onChange={(e) => onChange(e.target.value)} />
  );
}

function formatPayload(raw) {
  try {
    return JSON.stringify(typeof raw === 'string' ? JSON.parse(raw) : raw, null, 2);
  } catch {
    return String(raw);
  }
}

export default function SupervisorShiftReports() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [fnKey, setFnKey] = useState('mine_captain');
  const [sites, setSites] = useState([]);
  const [agents, setAgents] = useState([]);
  const [siteId, setSiteId] = useState('');
  const [day, setDay] = useState(today());
  const [shift, setShift] = useState('day');
  const [reports, setReports] = useState([]);
  const [plans, setPlans] = useState([]);
  const [open, setOpen] = useState(null);
  const [values, setValues] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Formulaires dédiés (PTO, face examination, ground support, layout) : pas de
  // "soumis une fois par shift", ce sont des journaux répétables.
  const [ptoForm, setPtoForm] = useState({ agent_id: '', leave_type: 'conge', days: 1, status: 'pending', notes: '' });
  const [faceForm, setFaceForm] = useState({ peg_id: '', ground_condition: 'safe', hazards_observed: '', ventilation_ok: true, gas_readings: '', action_required: '', status: 'cleared' });
  const [groundForm, setGroundForm] = useState({ peg_id: '', support_type: 'shotcrete', quantity: '', shotcrete_m3: '', concrete_m3: '', state: 'good', notes: '' });
  const [layoutForm, setLayoutForm] = useState({ plan_id: '', meters: '', azimuth: '', note: '' });
  // Dernieres saisies, rattachees au formulaire qui les a demandees : on
  // n'affiche que celles du formulaire ouvert (rien quand tout est ferme).
  const [recentState, setRecentState] = useState({ key: null, list: [] });
  const recent = open && recentState.key === open ? recentState.list : [];

  const items = FUNCTIONS[fnKey].items;

  useEffect(() => {
    api.get('/sites').then(({ data }) => setSites(data)).catch(() => setError('Serveur injoignable.'));
  }, []);

  useEffect(() => {
    if (!siteId) return; // la liste est videe dans le onChange du site
    api.get('/agents', { params: { site_id: siteId } }).then(({ data }) => setAgents(data)).catch(() => {});
  }, [siteId]);

  const refetchReports = () => {
    if (!siteId) return Promise.resolve();
    return api.get('/shift-reports', { params: { site_id: siteId, report_date: day, shift } })
      .then(({ data }) => setReports(data))
      .catch(() => setError('Lecture des rapports impossible.'));
  };

  useEffect(() => {
    refetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteId, day, shift]);

  const byType = useMemo(() => {
    const m = {};
    reports.forEach((r) => { m[r.report_type] = r; });
    return m;
  }, [reports]);

  const fetchRecent = (endpoint) => {
    const key = open;
    api.get(endpoint).then(({ data }) => {
      const list = Array.isArray(data) ? data : data.items || [];
      setRecentState({ key, list: list.filter((r) => (r.date || r.date_installed || '').startsWith(day)).slice(0, 10) });
    }).catch(() => setRecentState({ key, list: [] }));
  };

  useEffect(() => {
    if (!open) return;
    const item = items.find((i) => i.key === open);
    if (item?.kind === 'pto') fetchRecent('/pto');
    else if (item?.kind === 'face_examination') fetchRecent('/face-examinations');
    else if (item?.kind === 'ground_support') fetchRecent('/ground-support');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, day]);

  useEffect(() => {
    if (!siteId) return;
    const item = items.find((i) => i.key === open);
    if (item?.kind !== 'layout') return;
    api.get('/monthly-plans', { params: { site_id: siteId, period: day.slice(0, 7) } })
      .then(({ data }) => setPlans(data)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteId, open, day]);

  const openItem = (item) => {
    if (item.kind === 'shift_report' && !byType[item.reportType]) {
      setValues((prev) => ({ ...prev, [item.reportType]: emptyValues(item.fields) }));
    }
    setOpen((prevOpen) => (prevOpen === item.key ? null : item.key));
  };

  const requireSite = () => {
    if (!siteId) { toast('Choisis un site.', 'error'); return false; }
    return true;
  };

  const submitShiftReport = async (e, item) => {
    e.preventDefault();
    if (!requireSite()) return;
    setSubmitting(true);
    try {
      await api.post('/shift-reports', {
        site_id: siteId, report_date: day, shift, report_type: item.reportType,
        payload: values[item.reportType] || {},
      });
      toast('Rapport soumis avec succès', 'success');
      setOpen(null);
      await refetchReports();
    } catch (err) {
      toast(err?.response?.data?.detail || 'Erreur lors de la soumission', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const submitPto = async (e) => {
    e.preventDefault();
    if (!requireSite()) return;
    const agent = agents.find((a) => a.id === ptoForm.agent_id);
    setSubmitting(true);
    try {
      await api.post('/pto', {
        employee_id: agent?.id_number || ptoForm.agent_id,
        employee_name: agent?.full_name || '',
        date: day, leave_type: ptoForm.leave_type, days: Number(ptoForm.days) || 1,
        status: ptoForm.status, notes: ptoForm.notes || null,
      });
      toast('PTO enregistré', 'success');
      setPtoForm({ agent_id: '', leave_type: 'conge', days: 1, status: 'pending', notes: '' });
      fetchRecent('/pto');
    } catch (err) {
      toast(err?.response?.data?.detail || 'Erreur lors de la soumission', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const submitFace = async (e) => {
    e.preventDefault();
    if (!requireSite()) return;
    setSubmitting(true);
    try {
      await api.post('/face-examinations', { ...faceForm, date: day, examiner: user?.name });
      toast('Face examination enregistrée', 'success');
      setFaceForm({ peg_id: '', ground_condition: 'safe', hazards_observed: '', ventilation_ok: true, gas_readings: '', action_required: '', status: 'cleared' });
      fetchRecent('/face-examinations');
    } catch (err) {
      toast(err?.response?.data?.detail || 'Erreur lors de la soumission', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const submitGround = async (e) => {
    e.preventDefault();
    if (!requireSite()) return;
    setSubmitting(true);
    try {
      await api.post('/ground-support', {
        ...groundForm,
        quantity: groundForm.quantity === '' ? 0 : Number(groundForm.quantity),
        shotcrete_m3: groundForm.shotcrete_m3 === '' ? null : Number(groundForm.shotcrete_m3),
        concrete_m3: groundForm.concrete_m3 === '' ? null : Number(groundForm.concrete_m3),
        date_installed: day,
      });
      toast('Shotcrete/Concrete enregistré', 'success');
      setGroundForm({ peg_id: '', support_type: 'shotcrete', quantity: '', shotcrete_m3: '', concrete_m3: '', state: 'good', notes: '' });
      fetchRecent('/ground-support');
    } catch (err) {
      toast(err?.response?.data?.detail || 'Erreur lors de la soumission', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const submitLayout = async (e) => {
    e.preventDefault();
    if (!requireSite()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post('/layouts', {
        plan_id: layoutForm.plan_id,
        meters: Number(layoutForm.meters),
        azimuth: layoutForm.azimuth === '' ? null : Number(layoutForm.azimuth),
        layout_date: day,
        note: layoutForm.note || null,
      });
      toast('Avancement enregistré', 'success');
      setLayoutForm({ plan_id: '', meters: '', azimuth: '', note: '' });
      if (data.over_plan) toast(`Cumul ${data.done_meters} m au-dessus du plan (${data.planned_meters} m).`, 'error');
    } catch (err) {
      toast(err?.response?.data?.detail || 'Erreur lors de la soumission', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ssr">
      <style>{CSS}</style>
      <h1>Rapports de shift</h1>
      <p className="ssr__sub">Bonjour {user?.name} — choisis ta fonction du jour, puis le site et le shift.</p>

      {error && <p className="ssr__empty" role="alert"><AlertTriangle size={16} /> {error}</p>}

      <div className="ssr__tabs">
        {Object.entries(FUNCTIONS).map(([key, fn]) => (
          <button key={key} type="button" className={`ssr__tab${fnKey === key ? ' is-active' : ''}`}
            onClick={() => { setFnKey(key); setOpen(null); }}>
            {fn.label}
          </button>
        ))}
      </div>

      <div className="ssr__bar">
        <div>
          <label htmlFor="ssr-site">Site</label>
          <select id="ssr-site" value={siteId} onChange={(e) => { setOpen(null); setAgents([]); setSiteId(e.target.value); }}>
            <option value="">— choisir un site —</option>
            {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="ssr-date">Date</label>
          <input id="ssr-date" type="date" value={day} max={today()} onChange={(e) => setDay(e.target.value)} />
        </div>
        <div>
          <label htmlFor="ssr-shift">Shift</label>
          <select id="ssr-shift" value={shift} onChange={(e) => setShift(e.target.value)}>
            <option value="day">Day</option>
            <option value="night">Night</option>
          </select>
        </div>
      </div>

      <div className="ssr__list">
        {items.map((item) => {
          const repeatable = item.kind !== 'shift_report';
          const found = !repeatable && byType[item.reportType];
          return (
            <button key={item.key} className={`ssr__item${open === item.key ? ' is-open' : ''}`}
              onClick={() => openItem(item)}>
              <span>{item.label}</span>
              {!repeatable && <span className={`ssr__tag ${found ? 'ok' : 'miss'}`}>{found ? 'Soumis' : 'Manquant'}</span>}
            </button>
          );
        })}
      </div>

      {open && items.find((i) => i.key === open)?.kind === 'shift_report' && (() => {
        const item = items.find((i) => i.key === open);
        const submitted = byType[item.reportType];
        if (submitted) {
          return (
            <div className="ssr__panel">
              <h2>{item.label}</h2>
              <p className="ssr__hint">Déjà soumis pour ce shift.</p>
              <pre>{formatPayload(submitted.payload)}</pre>
            </div>
          );
        }
        return (
          <form className="ssr__panel" onSubmit={(e) => submitShiftReport(e, item)}>
            <h2>{item.label}</h2>
            {item.hint && <p className="ssr__hint">{item.hint}</p>}
            {item.fields.map((field) => (
              <div className="ssr__field" key={field.key}
                style={field.type === 'checkbox' ? { gridTemplateColumns: 'auto 1fr', alignItems: 'center', gridAutoFlow: 'column', justifyContent: 'start', gap: '.6rem' } : undefined}>
                <label htmlFor={`f-${field.key}`}>{field.label}{field.required && ' *'}</label>
                <ReportField field={field} value={values[item.reportType]?.[field.key]}
                  onChange={(v) => setValues((prev) => ({ ...prev, [item.reportType]: { ...prev[item.reportType], [field.key]: v } }))} />
              </div>
            ))}
            <button className="ssr__submit" type="submit" disabled={submitting}>
              {submitting && <Loader2 size={16} className="ssr__spin" />} Soumettre le rapport
            </button>
          </form>
        );
      })()}

      {open === 'pto' && (
        <form className="ssr__panel" onSubmit={submitPto}>
          <h2>PTO (Plan Task Observation)</h2>
          <p className="ssr__hint">Journal répétable — une entrée par agent observé.</p>
          <div className="ssr__field">
            <label htmlFor="pto-agent">Agent</label>
            <select id="pto-agent" value={ptoForm.agent_id} required
              onChange={(e) => setPtoForm({ ...ptoForm, agent_id: e.target.value })}>
              <option value="">— choisir un agent —</option>
              {agents.map((a) => <option key={a.id} value={a.id}>{a.full_name} ({a.job_title || '—'})</option>)}
            </select>
          </div>
          <div className="ssr__field">
            <label htmlFor="pto-status">Statut</label>
            <select id="pto-status" value={ptoForm.status} onChange={(e) => setPtoForm({ ...ptoForm, status: e.target.value })}>
              <option value="pending">En attente</option>
              <option value="ok">Conforme</option>
              <option value="action_required">Action requise</option>
            </select>
          </div>
          <div className="ssr__field">
            <label htmlFor="pto-notes">Notes</label>
            <textarea id="pto-notes" value={ptoForm.notes} onChange={(e) => setPtoForm({ ...ptoForm, notes: e.target.value })} />
          </div>
          <button className="ssr__submit" type="submit" disabled={submitting}>
            {submitting && <Loader2 size={16} className="ssr__spin" />} Enregistrer
          </button>
          {!!recent.length && (
            <div className="ssr__recent">
              <table>
                <thead><tr><th>Employé</th><th>Statut</th><th>Notes</th></tr></thead>
                <tbody>{recent.map((r) => <tr key={r.id}><td>{r.employee_name}</td><td>{r.status}</td><td>{r.notes || '—'}</td></tr>)}</tbody>
              </table>
            </div>
          )}
        </form>
      )}

      {open === 'face_examination' && (
        <form className="ssr__panel" onSubmit={submitFace}>
          <h2>Face examination</h2>
          <p className="ssr__hint">Journal répétable — contrôle avant accès au chantier.</p>
          <div className="ssr__field">
            <label htmlFor="fe-peg">Front / repère</label>
            <input id="fe-peg" required value={faceForm.peg_id} onChange={(e) => setFaceForm({ ...faceForm, peg_id: e.target.value })} />
          </div>
          <div className="ssr__field">
            <label htmlFor="fe-ground">État du terrain</label>
            <select id="fe-ground" value={faceForm.ground_condition} onChange={(e) => setFaceForm({ ...faceForm, ground_condition: e.target.value })}>
              <option value="safe">Sûr</option>
              <option value="unstable">Instable</option>
              <option value="hazardous">Dangereux</option>
            </select>
          </div>
          <div className="ssr__field" style={{ gridTemplateColumns: 'auto 1fr', alignItems: 'center', gridAutoFlow: 'column', justifyContent: 'start', gap: '.6rem' }}>
            <label htmlFor="fe-vent">Ventilation OK</label>
            <input id="fe-vent" type="checkbox" checked={faceForm.ventilation_ok}
              onChange={(e) => setFaceForm({ ...faceForm, ventilation_ok: e.target.checked })} style={{ width: 'auto' }} />
          </div>
          <div className="ssr__field">
            <label htmlFor="fe-gas">Relevés gaz</label>
            <input id="fe-gas" value={faceForm.gas_readings} onChange={(e) => setFaceForm({ ...faceForm, gas_readings: e.target.value })} />
          </div>
          <div className="ssr__field">
            <label htmlFor="fe-haz">Dangers observés</label>
            <textarea id="fe-haz" value={faceForm.hazards_observed} onChange={(e) => setFaceForm({ ...faceForm, hazards_observed: e.target.value })} />
          </div>
          <button className="ssr__submit" type="submit" disabled={submitting}>
            {submitting && <Loader2 size={16} className="ssr__spin" />} Enregistrer
          </button>
          {!!recent.length && (
            <div className="ssr__recent">
              <table>
                <thead><tr><th>Front</th><th>État</th><th>Ventilation</th></tr></thead>
                <tbody>{recent.map((r) => <tr key={r.id}><td>{r.peg_id}</td><td>{r.ground_condition}</td><td>{r.ventilation_ok ? 'OK' : '—'}</td></tr>)}</tbody>
              </table>
            </div>
          )}
        </form>
      )}

      {open === 'ground_support' && (
        <form className="ssr__panel" onSubmit={submitGround}>
          <h2>Shotcrete (M³) / Concrete (M³)</h2>
          <p className="ssr__hint">Journal répétable — une entrée par intervention.</p>
          <div className="ssr__field">
            <label htmlFor="gs-peg">Front / repère</label>
            <input id="gs-peg" required value={groundForm.peg_id} onChange={(e) => setGroundForm({ ...groundForm, peg_id: e.target.value })} />
          </div>
          <div className="ssr__field">
            <label htmlFor="gs-shotcrete">Shotcrete (M³)</label>
            <input id="gs-shotcrete" type="number" step="0.1" value={groundForm.shotcrete_m3} onChange={(e) => setGroundForm({ ...groundForm, shotcrete_m3: e.target.value })} />
          </div>
          <div className="ssr__field">
            <label htmlFor="gs-concrete">Concrete (M³)</label>
            <input id="gs-concrete" type="number" step="0.1" value={groundForm.concrete_m3} onChange={(e) => setGroundForm({ ...groundForm, concrete_m3: e.target.value })} />
          </div>
          <div className="ssr__field">
            <label htmlFor="gs-notes">Notes</label>
            <textarea id="gs-notes" value={groundForm.notes} onChange={(e) => setGroundForm({ ...groundForm, notes: e.target.value })} />
          </div>
          <button className="ssr__submit" type="submit" disabled={submitting}>
            {submitting && <Loader2 size={16} className="ssr__spin" />} Enregistrer
          </button>
          {!!recent.length && (
            <div className="ssr__recent">
              <table>
                <thead><tr><th>Front</th><th>Shotcrete</th><th>Concrete</th></tr></thead>
                <tbody>{recent.map((r) => <tr key={r.id}><td>{r.peg_id}</td><td>{r.shotcrete_m3 ?? '—'}</td><td>{r.concrete_m3 ?? '—'}</td></tr>)}</tbody>
              </table>
            </div>
          )}
        </form>
      )}

      {open === 'advance' && (
        <form className="ssr__panel" onSubmit={submitLayout}>
          <h2>Advance (meter)</h2>
          <p className="ssr__hint">Tronçon réalisé sur le front du mois (met à jour l'avancement).</p>
          <div className="ssr__field">
            <label htmlFor="ad-plan">Front du mois</label>
            <select id="ad-plan" value={layoutForm.plan_id} required onChange={(e) => setLayoutForm({ ...layoutForm, plan_id: e.target.value })}>
              <option value="">— choisir un front —</option>
              {plans.map((p) => <option key={p.id} value={p.id}>Niv. {p.level} · {p.face} · {p.done_meters}/{p.planned_meters} m</option>)}
            </select>
          </div>
          <div className="ssr__field">
            <label htmlFor="ad-m">Mètres</label>
            <input id="ad-m" type="number" step="0.1" min="0.1" required value={layoutForm.meters} onChange={(e) => setLayoutForm({ ...layoutForm, meters: e.target.value })} />
          </div>
          <div className="ssr__field">
            <label htmlFor="ad-az">Azimut (°)</label>
            <input id="ad-az" type="number" step="0.1" min="0" max="360" value={layoutForm.azimuth} onChange={(e) => setLayoutForm({ ...layoutForm, azimuth: e.target.value })} />
          </div>
          <div className="ssr__field">
            <label htmlFor="ad-note">Note</label>
            <input id="ad-note" value={layoutForm.note} onChange={(e) => setLayoutForm({ ...layoutForm, note: e.target.value })} />
          </div>
          <button className="ssr__submit" type="submit" disabled={submitting}>
            <Plus size={16} /> Enregistrer l'avancement
          </button>
        </form>
      )}
    </div>
  );
}
