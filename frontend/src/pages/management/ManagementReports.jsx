import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Sun, Moon, Layers, FileText, AlertTriangle, Download, Loader2 } from 'lucide-react';
import PageHero from '../../components/PageHero';
import api from '../../api';

// Rapport de shift d'un site : page de garde + table des matieres + un
// tableau par rapport recu (cf. utils/reportPdf.js).
async function exportReportsPDF({ siteName, day, shift, reports, reportDefs, shiftLabel, notSubmittedLabel }) {
  const { generateReport, payloadRows } = await import('../../utils/reportPdf');
  const dateFr = new Date(`${day}T12:00:00`).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const received = reportDefs.filter((r) => reports.some((x) => x.report_type === r.key));
  const missing = reportDefs.filter((r) => !reports.some((x) => x.report_type === r.key));

  await generateReport({
    fileName: `minetrack_${siteName}_${shift}_${day}.pdf`,
    period: dateFr,
    title: ['Rapport', 'de shift'],
    kind: `Journalier / ${shiftLabel}`,
    preparedFor: ['Reliant Congo — Management', `Site : ${siteName}`, `${shiftLabel} du ${dateFr}`],
    preparedBy: 'MineTrack',
    sections: [
      {
        title: 'Informations générales',
        blocks: [
          { type: 'p', text: `Ce document regroupe les rapports de shift saisis pour le site ${siteName}, ${shiftLabel.toLowerCase()} du ${dateFr}. ${received.length} rapport(s) sur ${reportDefs.length} ont été transmis.` },
          {
            type: 'table', caption: 'Identification du shift', widths: [1, 2],
            head: ['Élément', 'Valeur'],
            rows: [
              ['Site', siteName],
              ['Date', dateFr],
              ['Shift', shiftLabel],
              ['Rapports reçus', `${received.length} / ${reportDefs.length}`],
              ['Édité le', new Date().toLocaleString('fr-FR')],
            ],
          },
        ],
      },
      {
        title: 'Rapports reçus',
        blocks: received.length
          ? received.map((r) => {
            const found = reports.find((x) => x.report_type === r.key);
            return {
              type: 'sub', title: r.label,
              blocks: [{ type: 'table', caption: `${r.label} — ${siteName}, ${shiftLabel.toLowerCase()}`, widths: [1, 2], head: ['Champ', 'Valeur'], rows: payloadRows(found.payload) }],
            };
          })
          : [{ type: 'p', text: 'Aucun rapport n\'a été transmis pour ce shift.' }],
      },
      {
        title: 'Rapports manquants',
        blocks: missing.length
          ? [{ type: 'p', text: `Les rapports suivants n'ont pas été transmis (${notSubmittedLabel.toLowerCase()}) :` }, { type: 'list', items: missing.map((r) => r.label) }]
          : [{ type: 'p', text: 'Tous les rapports attendus ont été transmis.' }],
      },
      {
        title: 'Validation',
        blocks: [
          { type: 'p', text: 'Le présent rapport est validé par les responsables ci-dessous.' },
          { type: 'signatures', roles: ['Shift boss / Superviseur', 'Mine captain'] },
        ],
      },
    ],
  });
}
// Styles propres a la page ; cartes, champs et boutons viennent de index.css (.mt-*).
const CSS = `
.mgt__back{display:inline-flex;align-items:center;gap:.35rem;margin:.25rem .2rem 0;background:none;border:0;
color:var(--color-ash);font:inherit;font-size:.92rem;cursor:pointer;padding:.3rem 0}
.mgt__back:hover{color:var(--color-white)}
.mgt__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));gap:.75rem}
.mgt__btn{display:flex;align-items:center;gap:.8rem;padding:1.05rem 1.1rem;border:0;border-radius:18px;
background:var(--color-rock-2);box-shadow:var(--shadow-sm);color:var(--color-white);font:inherit;font-size:1rem;
cursor:pointer;text-align:left;transition:var(--transition)}
.mgt__btn:hover:enabled{box-shadow:var(--shadow-md);transform:translateY(-1px)}
.mgt__btn:disabled{opacity:.55;cursor:not-allowed}
.mgt__btn .mt-list__icon{background:#FFF1E6;color:var(--color-ore-dark)}
.mgt__btn--all .mt-list__icon{background:var(--color-surface-soft);color:var(--color-ash)}
.mgt__btn--inline{display:inline-flex;width:auto}
.mgt__chev{margin-left:auto;color:var(--color-stone)}
.mgt__date{display:flex;align-items:center;gap:.75rem;font-size:.9rem;color:var(--color-stone)}
.mgt__date input{max-width:12rem}
.mgt__list{display:flex;flex-direction:column}
.mgt__item{display:flex;align-items:center;justify-content:space-between;gap:1rem;width:100%;padding:.85rem 0;border:0;
border-bottom:1px solid var(--color-rock-3);background:transparent;color:var(--color-white);font:inherit;font-size:.97rem;
cursor:pointer;text-align:left}
.mgt__item:last-child{border-bottom:0}
.mgt__item:disabled{cursor:default;color:var(--color-ash)}
.mgt__item.is-open{font-weight:600}
.mgt__panel h2{margin:0 0 .75rem;font-size:1.05rem;font-weight:500}
.mgt__panel pre{margin:0;white-space:pre-wrap;word-break:break-word;font-family:ui-monospace,monospace;
font-size:.82rem;line-height:1.6;color:var(--color-chalk);background:var(--color-surface-soft);border-radius:12px;padding:1rem}
.mgt__empty{display:flex;align-items:center;gap:.5rem;color:var(--color-stone);font-size:.9rem;margin:0}
.mgt__spin{animation:mgt-spin .9s linear infinite}
@keyframes mgt-spin{to{transform:rotate(360deg)}}
`;

const REPORT_KEYS = [
  'safety', 'concerns', 'blasting', 'shift_preparation', 'construction_service',
  'tramming_machine_status', 'drilling_machine_status', 'longhole_report', 'critical_material',
];

const today = () => new Date().toISOString().slice(0, 10);

export default function ManagementReports() {
  const { t } = useTranslation();
  const [sites, setSites] = useState([]);
  const [view, setView] = useState({ step: 'sites', site: null, shift: null });
  const [day, setDay] = useState(today());
  const [reports, setReports] = useState([]);
  const [coverage, setCoverage] = useState([]);
  const [open, setOpen] = useState(null);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  const REPORTS = useMemo(
    () => REPORT_KEYS.map((key) => ({ key, label: t(`management.report_${key}`) })),
    [t]
  );

  useEffect(() => {
    api.get('/sites')
      .then(({ data }) => setSites(data))
      .catch(() => setError(t('management.err_server')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (view.step !== 'reports' || !view.site) return;
    api.get('/shift-reports', { params: { site_id: view.site.id, report_date: day, shift: view.shift } })
      .then(({ data }) => { setReports(data); setOpen(null); })
      .catch(() => setError(t('management.err_reports')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, day]);

  useEffect(() => {
    if (view.step !== 'all') return;
    api.get('/shift-reports/coverage', { params: { report_date: day } })
      .then(({ data }) => setCoverage(data))
      .catch(() => setError(t('management.err_coverage')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view.step, day]);

  const byType = useMemo(() => {
    const m = {};
    reports.forEach((r) => { m[r.report_type] = r; });
    return m;
  }, [reports]);

  const back = () => {
    setOpen(null);
    setError('');
    if (view.step === 'reports') setView({ step: 'shift', site: view.site, shift: null });
    else setView({ step: 'sites', site: null, shift: null });
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportReportsPDF({
        siteName: view.site.name, day, shift: view.shift, reports, reportDefs: REPORTS,
        shiftLabel: view.shift === 'day' ? t('management.day_shift') : t('management.night_shift'),
        notSubmittedLabel: t('management.missing'),
      });
    } catch {
      setError(t('management.err_pdf'));
    } finally {
      setExporting(false);
    }
  };

  const dateField = (
    <div className="mgt__date mt-form">
      <label htmlFor="mgt-date" style={{ margin: 0 }}>{t('management.date')}</label>
      <input id="mgt-date" type="date" value={day} max={today()} onChange={(e) => { setOpen(null); setDay(e.target.value); }} />
    </div>
  );

  const crumb = view.step === 'sites' ? null : view.site?.name || t('management.all_reports');

  return (
    <div>
      <style>{CSS}</style>
      <PageHero title={t('management.title')} subtitle={crumb ? `${crumb}${view.shift ? ` · ${view.shift === 'day' ? t('management.day_shift') : t('management.night_shift')}` : ''}` : undefined} />

      <div className="mt-body mt-page">
        <p className="mt-card__eyebrow" style={{ margin: '0.25rem 0.2rem 0' }}>{t('management.subtitle')}</p>

        {error && <p className="mgt__empty" role="alert" style={{ color: '#DC2626' }}><AlertTriangle size={16} /> {error}</p>}

        {view.step === 'sites' && (
          <div className="mgt__grid">
            {sites.map((s) => (
              <button key={s.id} className="mgt__btn" onClick={() => setView({ step: 'shift', site: s, shift: null })}>
                <span className="mt-list__icon"><Layers size={18} /></span> {s.name}
                <ChevronRight size={19} className="mgt__chev" />
              </button>
            ))}
            <button className="mgt__btn mgt__btn--all" onClick={() => setView({ step: 'all', site: null, shift: null })}>
              <span className="mt-list__icon"><FileText size={18} /></span> {t('management.all_reports')}
              <ChevronRight size={19} className="mgt__chev" />
            </button>
            {!sites.length && !error && (
              <p className="mgt__empty">{t('management.no_sites')}</p>
            )}
          </div>
        )}

        {view.step === 'shift' && (
          <>
            <button className="mgt__back" onClick={back}><ChevronLeft size={17} /> {t('management.back_sites')}</button>
            <div className="mgt__grid">
              <button className="mgt__btn" onClick={() => { setReports([]); setView({ ...view, step: 'reports', shift: 'day' }); }}>
                <span className="mt-list__icon"><Sun size={18} /></span> {t('management.day_shift')}
                <ChevronRight size={19} className="mgt__chev" />
              </button>
              <button className="mgt__btn" onClick={() => { setReports([]); setView({ ...view, step: 'reports', shift: 'night' }); }}>
                <span className="mt-list__icon"><Moon size={18} /></span> {t('management.night_shift')}
                <ChevronRight size={19} className="mgt__chev" />
              </button>
            </div>
          </>
        )}

        {view.step === 'reports' && (
          <>
            <button className="mgt__back" onClick={back}><ChevronLeft size={17} /> {view.site.name}</button>
            <section className="mt-card" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
              {dateField}
              <button className="mt-btn" onClick={handleExport} disabled={exporting || !reports.length}>
                {exporting ? <Loader2 size={18} className="mgt__spin" /> : <Download size={18} />}
                {exporting ? t('management.generating') : t('management.download_pdf')}
              </button>
            </section>
            <section className="mt-card" style={{ paddingTop: '0.4rem', paddingBottom: '0.4rem' }}>
              <div className="mgt__list">
                {REPORTS.map((r) => {
                  const found = byType[r.key];
                  return (
                    <button key={r.key} className={`mgt__item${open === r.key ? ' is-open' : ''}`} disabled={!found}
                      aria-expanded={open === r.key} onClick={() => setOpen(open === r.key ? null : r.key)}>
                      <span>{r.label}</span>
                      <span className={`mt-pill ${found ? 'mt-pill--soft-green' : 'mt-pill--soft-red'}`}>{found ? t('management.submitted') : t('management.missing')}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {open && byType[open] && (
              <section className="mt-card mgt__panel">
                <h2>{REPORTS.find((r) => r.key === open)?.label}</h2>
                <pre>{formatPayload(byType[open].payload)}</pre>
              </section>
            )}
          </>
        )}

        {view.step === 'all' && (
          <>
            <button className="mgt__back" onClick={back}><ChevronLeft size={17} /> {t('management.back_sites')}</button>
            <section className="mt-card">{dateField}</section>
            <section className="mt-card">
              <div className="mt-table-wrap">
                <table className="mt-table">
                  <thead><tr><th>{t('management.col_site')}</th><th>{t('management.col_shift')}</th><th>{t('management.col_received')}</th><th>{t('management.col_missing')}</th></tr></thead>
                  <tbody>
                    {coverage.flatMap((s) => ['day', 'night'].map((sh) => (
                      <tr key={`${s.site_id}-${sh}`}>
                        <td>{s.site_name}</td>
                        <td>{sh === 'day' ? t('management.day_shift') : t('management.night_shift')}</td>
                        <td><span className={`mt-pill ${s[sh].length >= 9 ? 'mt-pill--soft-green' : 'mt-pill--soft-gray'}`}>{s[sh].length}/9</span></td>
                        <td>{s[`${sh}_missing`].map((k) => REPORTS.find((r) => r.key === k)?.label).join(', ') || '—'}</td>
                      </tr>
                    )))}
                    {!coverage.length && <tr><td colSpan={4} style={{ color: 'var(--color-stone)' }}>{t('management.no_sites')}</td></tr>}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
function formatPayload(raw) {
  try {
    return JSON.stringify(typeof raw === 'string' ? JSON.parse(raw) : raw, null, 2);
  } catch {
    return String(raw);
  }
}
