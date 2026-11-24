import { useState } from 'react';
import { FileText, Download, Loader2 } from 'lucide-react';
import api, { dashboardAPI, supervisorAPI, incidentsAPI, equipmentPannesAPI } from '../../api';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import PageHero from '../../components/PageHero';

const KINDS = {
  daily: { label: 'Journalier', days: 0 },
  weekly: { label: 'Hebdomadaire', days: 6 },
  monthly: { label: 'Mensuel', days: 29 },
};

const CONTENT = [
  { key: 'pegs', labelKey: 'rep.c_pegs' },
  { key: 'production', labelKey: 'rep.c_production' },
  { key: 'hse', labelKey: 'rep.c_hse' },
  { key: 'equipment', labelKey: 'rep.c_equipment' },
  { key: 'teams', labelKey: 'rep.c_teams' },
  { key: 'shift', labelKey: 'rep.c_shift' },
  { key: 'finance', labelKey: 'rep.c_finance' },
];
const KIND_KEYS = { daily: 'rep.daily', weekly: 'rep.weekly', monthly: 'rep.monthly' };

const REPORT_LABELS = {
  safety: 'Sécurité', concerns: 'Préoccupations', blasting: 'Minage', shift_preparation: 'Préparation du shift',
  construction_service: 'Construction & services', tramming_machine_status: 'Tramming & machines',
  drilling_machine_status: 'Machines de forage', longhole_report: 'Long-trou', critical_material: 'Matériel critique',
};

const iso = (d) => d.toISOString().slice(0, 10);
const fr = (s) => (s ? new Date(`${String(s).slice(0, 10)}T12:00:00`).toLocaleDateString('fr-FR') : '—');
const list = (data) => (Array.isArray(data) ? data : data?.items || []);
const num = (v, d = 0) => Number(v || 0).toLocaleString('fr-FR', { maximumFractionDigits: d });

export default function SupervisorReports() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [kind, setKind] = useState('daily');
  const [to, setTo] = useState(iso(new Date()));
  const [from, setFrom] = useState(iso(new Date()));
  const [company, setCompany] = useState('Reliant Congo');
  const [content, setContent] = useState(() => Object.fromEntries(CONTENT.map((c) => [c.key, true])));
  const [busy, setBusy] = useState(false);

  // Changer le type recale la periode sur la date de fin.
  const chooseKind = (k) => {
    setKind(k);
    const end = new Date(`${to}T12:00:00`);
    const start = new Date(end);
    start.setDate(end.getDate() - KINDS[k].days);
    setFrom(iso(start));
  };

  const inRange = (s) => { const d = String(s || '').slice(0, 10); return d >= from && d <= to; };

  const generate = async (e) => {
    e.preventDefault();
    if (from > to) { toast(t('rep.err_dates'), 'error'); return; }
    setBusy(true);
    try {
      const safe = (p) => p.then((r) => r.data).catch(() => null);
      const [stats, charts, shiftReports, alerts, incidents, pannes] = await Promise.all([
        safe(dashboardAPI.stats()), safe(dashboardAPI.charts()), safe(api.get('/shift-reports')),
        safe(supervisorAPI.alerts()), safe(incidentsAPI.list()), safe(equipmentPannesAPI.list()),
      ]);
      const { generateReport } = await import('../../utils/reportPdf');
      const period = from === to ? fr(from) : `${fr(from)} — ${fr(to)}`;
      const sections = [];

      sections.push({
        title: 'Synthèse',
        blocks: [
          { type: 'p', text: `Rapport ${KINDS[kind].label.toLowerCase()} des opérations de ${company}, période du ${fr(from)} au ${fr(to)}. Les indicateurs ci-dessous sont ceux enregistrés dans MineTrack au moment de l'édition.` },
          {
            type: 'table', caption: 'Indicateurs clés', widths: [2, 1],
            head: ['Indicateur', 'Valeur'],
            rows: [
              ['Production totale', `${num(stats?.production?.total_tonnage, 1)} t`],
              ['PEG actifs / total', `${num(stats?.pegs?.active)} / ${num(stats?.pegs?.total)}`],
              ['Avancement moyen des PEG', `${num(stats?.pegs?.avg_progress, 1)} %`],
              ['Incidents ouverts (dont critiques)', `${num(stats?.safety?.open_incidents)} (${num(stats?.safety?.critical)})`],
              ['Engins en panne / en maintenance', `${num(stats?.equipment?.breakdown)} / ${num(stats?.equipment?.maintenance)}`],
              ['Personnel actif', num(stats?.labor?.total)],
              ['Alertes à traiter', num((alerts?.incidents?.length || 0) + (alerts?.pannes?.length || 0))],
            ],
          },
        ],
      });

      if (content.pegs) {
        const pegs = charts?.peg_progress || [];
        sections.push({
          title: 'Avancement des PEG',
          blocks: pegs.length ? [{
            type: 'table', caption: 'Avancement par PEG', widths: [2, 1, 1.4],
            head: ['PEG', 'Avancement', 'Statut'],
            rows: pegs.map((p) => [p.peg_id, `${num(p.progress, 1)} %`, p.progress >= 100 ? 'Terminé' : p.progress >= 60 ? 'En cours' : p.progress >= 30 ? 'Lent' : 'En retard']),
          }] : [{ type: 'p', text: 'Aucun PEG en activité.' }],
        });
      }

      if (content.production) {
        const days = (charts?.production_trend || []).filter((d) => inRange(d.date));
        const total = days.reduce((a, d) => a + (d.tonnage || 0), 0);
        sections.push({
          title: 'Production',
          blocks: days.length ? [
            { type: 'p', text: `Production cumulée sur la période : ${num(total, 1)} t, sur ${days.length} jour(s) renseigné(s).` },
            { type: 'table', caption: 'Production journalière', widths: [1, 1], head: ['Date', 'Tonnage (t)'], rows: days.map((d) => [fr(d.date), num(d.tonnage, 1)]) },
          ] : [{ type: 'p', text: 'Aucune donnée de production sur la période.' }],
        });
      }

      if (content.hse) {
        const rows = list(incidents).filter((i) => inRange(i.date || i.created_at));
        sections.push({
          title: 'Sécurité et incidents (HSE)',
          blocks: rows.length ? [{
            type: 'table', caption: 'Incidents déclarés sur la période', widths: [0.9, 2, 0.8, 1.4],
            head: ['Date', 'Incident', 'Gravité', 'Lieu'],
            rows: rows.map((i) => [fr(i.date || i.created_at), [i.title, i.description].filter(Boolean).join('\n'), i.severity, i.location]),
          }] : [{ type: 'p', text: 'Aucun incident déclaré sur la période.' }],
        });
      }

      if (content.equipment) {
        const rows = list(pannes).filter((p) => inRange(p.reported_date || p.created_at));
        sections.push({
          title: 'Équipement',
          blocks: rows.length ? [{
            type: 'table', caption: 'Pannes signalées sur la période', widths: [0.9, 0.9, 1, 2, 0.8],
            head: ['Date', 'Engin', 'Type', 'Description', 'Statut'],
            rows: rows.map((p) => [fr(p.reported_date || p.created_at), p.equipment_id, p.issue_type, p.description, p.status]),
          }] : [{ type: 'p', text: 'Aucune panne signalée sur la période.' }],
        });
      }

      if (content.teams) {
        const teams = stats?.team_performance || [];
        sections.push({
          title: 'Performance des équipes',
          blocks: teams.length ? [{
            type: 'table', caption: 'Avancement moyen par équipe', widths: [2, 1],
            head: ['Équipe', 'Avancement moyen'], rows: teams.map((t) => [t.team, `${num(t.avg_progress, 1)} %`]),
          }] : [{ type: 'p', text: 'Aucune équipe active.' }],
        });
      }

      if (content.shift) {
        const groups = {};
        list(shiftReports).filter((r) => inRange(r.report_date)).forEach((r) => {
          const k = `${r.report_date}|${r.shift}|${r.site_name || r.site_id}`;
          (groups[k] ||= []).push(REPORT_LABELS[r.report_type] || r.report_type);
        });
        const rows = Object.entries(groups).sort().map(([k, types]) => {
          const [d, sh, site] = k.split('|');
          return [fr(d), sh === 'night' ? 'Nuit' : 'Jour', site, `${types.length} / 9`, types.join(', ')];
        });
        sections.push({
          title: 'Rapports de shift',
          blocks: rows.length ? [{
            type: 'table', caption: 'Rapports de shift reçus', widths: [0.9, 0.6, 1, 0.6, 2.2],
            head: ['Date', 'Shift', 'Site', 'Reçus', 'Rapports'], rows,
          }] : [{ type: 'p', text: 'Aucun rapport de shift saisi sur la période.' }],
        });
      }

      if (content.finance) {
        sections.push({
          title: 'ERP et finances',
          blocks: [{ type: 'p', text: `Coût opérationnel total enregistré : ${num(stats?.financial?.total_cost_usd, 2)} USD.` }],
        });
      }

      sections.push({
        title: 'Validation',
        blocks: [
          { type: 'p', text: 'Le présent rapport est validé par les responsables ci-dessous.' },
          { type: 'signatures', roles: ['Superviseur de shift', 'Chef de mine'] },
        ],
      });

      await generateReport({
        fileName: `rapport_${kind}_minetrack_${from}_${to}.pdf`,
        period,
        title: ["Rapport", "d'opérations"],
        kind: KINDS[kind].label,
        preparedFor: [company, 'Site : MPAMA North, Katanga — RDC', `Période : ${period}`],
        preparedBy: user?.name || 'Supervision',
        sections,
      });
      toast(t('rep.ok'), 'success');
    } catch {
      toast(t('rep.err'), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHero title={t('rep.title')} subtitle={t('rep.subtitle')} />
      <div className="mt-body mt-page mt-form">
        <p className="mt-card__eyebrow" style={{ margin: '0.25rem 0.2rem 0' }}>
          {t('rep.intro')}
        </p>
        <form className="mt-card" onSubmit={generate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label>{t('rep.kind')}</label>
            <div className="mt-chips" style={{ margin: 0, padding: 0 }}>
              {Object.keys(KINDS).map((k) => (
                <button key={k} type="button" aria-pressed={kind === k} className={`mt-chip${kind === k ? ' is-active' : ''}`}
                  style={kind === k ? undefined : { background: 'var(--color-surface-soft)' }} onClick={() => chooseKind(k)}>
                  {t(KIND_KEYS[k])}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))' }}>
            <div>
              <label htmlFor="rp-from">{t('rep.from')}</label>
              <input id="rp-from" type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div>
              <label htmlFor="rp-to">{t('rep.to')}</label>
              <input id="rp-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div>
              <label htmlFor="rp-company">{t('rep.company')}</label>
              <select id="rp-company" value={company} onChange={(e) => setCompany(e.target.value)}>
                <option>Reliant Congo</option>
                <option value="Toutes les entreprises">{t('rep.all_companies')}</option>
              </select>
            </div>
          </div>
          <div>
            <label>{t('rep.chapters')}</label>
            <div className="mt-grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: '0.6rem' }}>
              {CONTENT.map((c) => (
                <label key={c.key} className="form-checkbox-label" style={{ margin: 0, color: 'var(--color-chalk)' }}>
                  <input type="checkbox" className="form-checkbox" checked={content[c.key]}
                    onChange={(e) => setContent({ ...content, [c.key]: e.target.checked })} />
                  {t(c.labelKey)}
                </label>
              ))}
            </div>
          </div>
          <div>
            <button type="submit" className="mt-btn" disabled={busy}>
              {busy ? <Loader2 size={18} className="spin" /> : <Download size={18} />}
              {busy ? t('rep.generating') : t('rep.generate')}
            </button>
          </div>
        </form>
        <section className="mt-card mt-card--row">
          <div className="mt-list__icon" style={{ background: '#FFF1E6', color: 'var(--color-ore-dark)' }}><FileText size={18} /></div>
          <p className="mt-card__eyebrow" style={{ margin: 0, fontSize: '0.88rem' }}>
            {t('rep.note')}
          </p>
        </section>
      </div>
    </div>
  );
}
