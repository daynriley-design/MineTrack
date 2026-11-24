import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import api, { dashboardAPI, miniReportsAPI, faceExaminationsAPI, supervisorAPI } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import PageHero from '../../components/PageHero';
import {
  Settings2, Bell, MapPinned, ArrowRight, CalendarDays, Clock3, MapPin, TrendingUp, Truck,
  ShieldAlert, Activity, Map as MapIcon, Wrench, FileText, Eye, ClipboardPlus,
} from 'lucide-react';

// Libelles des rapports de shift : management.report_* (9 rapports) + 2 sous-rapports.
const EXTRA_REPORTS = { re_entry: 'sup.rt_re_entry', vent_service: 'sup.rt_vent_service' };

const SHIFT_HOURS = { day: '06:00 – 18:00', night: '18:00 – 06:00' };

const currentShift = (d) => (d.getHours() >= 6 && d.getHours() < 18 ? 'day' : 'night');
const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const shortDay = (iso, locale = 'fr-FR') => {
  if (!iso) return '—';
  const d = new Date(`${iso}T12:00:00`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString(locale, { day: '2-digit', month: 'short' }).replace('.', '');
};
const asList = (data) => (Array.isArray(data) ? data : data?.items || []);

function MiniBars({ rows, valueKey, unit, color }) {
  const max = Math.max(1, ...rows.map((r) => r[valueKey] || 0));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '64px 1fr 48px', gap: '0.6rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-stone)' }}>{shortDay(r.date)}</span>
          <div className="mt-bar"><i style={{ width: `${((r[valueKey] || 0) / max) * 100}%`, background: typeof color === 'function' ? color(r) : color }} /></div>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-chalk)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{Math.round(r[valueKey] || 0)}{unit}</span>
        </div>
      ))}
    </div>
  );
}

function Panel({ title, icon, children, span }) {
  return (
    <section className={`mt-card${span ? ' mt-span' : ''}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.9rem', color: 'var(--color-white)' }}>
        {icon}
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 500 }}>{title}</h4>
      </div>
      {children}
    </section>
  );
}

export default function SupervisorDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const outlet = useOutletContext() || {};
  const reportLabel = (type) => (EXTRA_REPORTS[type] ? t(EXTRA_REPORTS[type]) : t(`management.report_${type}`, { defaultValue: type }));
  const [now, setNow] = useState(new Date());
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [reports, setReports] = useState([]);
  const [alerts, setAlerts] = useState({ incidents: [], pannes: [] });
  const [geoReports, setGeoReports] = useState([]);
  const [faceExams, setFaceExams] = useState([]);

  useEffect(() => {
    dashboardAPI.stats().then((res) => setStats(res.data)).catch(() => {});
    dashboardAPI.charts().then((res) => setCharts(res.data)).catch(() => {});
    api.get('/shift-reports').then(({ data }) => {
      const items = asList(data);
      items.sort((a, b) => `${b.report_date}${b.created_at || ''}`.localeCompare(`${a.report_date}${a.created_at || ''}`));
      setReports(items);
    }).catch(() => {});
    supervisorAPI.alerts().then(({ data }) => setAlerts({ incidents: data?.incidents || [], pannes: data?.pannes || [] })).catch(() => {});
    miniReportsAPI.list().then((res) => {
      const items = asList(res.data);
      setGeoReports(items.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')).slice(0, 5));
    }).catch(() => {});
    faceExaminationsAPI.list().then((res) => {
      const items = asList(res.data);
      setFaceExams(items.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')).slice(0, 5));
    }).catch(() => {});
    const tick = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(tick);
  }, []);

  const shift = currentShift(now);
  const today = isoDay(now);
  const todayReports = reports.filter((r) => r.report_date === today);
  const shiftReports = todayReports.filter((r) => r.shift === shift);
  const alertCount = alerts.incidents.length + alerts.pannes.length || outlet.alertCount || 0;
  const recent = reports.slice(0, 8);
  const siteName = recent[0]?.site_name || 'Reliant Congo — MPAMA North';

  const total = stats?.production?.total_tonnage || 0;
  const incidents = stats?.safety?.critical || 0;
  const equipment = stats?.equipment?.breakdown || 0;
  const personnel = stats?.labor?.total || 0;
  const pegActifs = stats?.pegs?.active || 0;
  const avgProgress = stats?.pegs?.avg_progress || 0;
  const teams = stats?.team_performance || [];

  const prodDays = charts?.production_trend || [];
  const incidentDays = charts?.incidents_by_day || [];
  const pegProgress = charts?.peg_progress || [];
  const ptoDays = charts?.pto_by_day || [];


  const alertItems = [
    ...alerts.incidents.map((a) => ({ id: `i-${a.id ?? a._id}`, kind: 'incident', title: a.title || a.type || a.description || 'Incident', meta: [a.peg_id, a.severity].filter(Boolean).join(' · '), at: a.created_at })),
    ...alerts.pannes.map((p) => ({ id: `p-${p.id ?? p._id}`, kind: 'panne', title: p.equipment_name || p.machine || p.equipment_id || 'Panne engin', meta: p.description || p.status, at: p.created_at })),
  ].slice(0, 5);

  return (
    <div>
      {/* En-tete degrade (date et salutation traduites) */}
      <PageHero
        subtitle={`${user?.name || t('user.role_supervisor')},`}
        left={<Link to="/supervisor/profile" className="mt-round" aria-label={t('sup.profile_settings')}><Settings2 size={21} strokeWidth={1.7} /></Link>}
        actions={(
          <>
            <Link to="/supervisor/alerts" className="mt-round" aria-label={t('app.alerts')}>
              <Bell size={20} strokeWidth={1.7} />
              {alertCount > 0 && <span className="mt-round__dot" />}
            </Link>
            <Link to="/supervisor/map" className="mt-round" aria-label={t('app.map_short')}><MapPinned size={20} strokeWidth={1.7} /></Link>
          </>
        )}
      />

      <div className="mt-body mt-body--wide">
        {/* Shift en cours */}
        <Link to="/supervisor/shift-reports" className="mt-card mt-card--row mt-span">
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="mt-card__eyebrow">{t('sup.shift_now')} · {siteName}</p>
            <p className="mt-card__title">{shift === 'day' ? t('sup.day_shift') : t('sup.night_shift')} · {SHIFT_HOURS[shift]}</p>
          </div>
          <span className="mt-pill">{t('sup.in_progress')}</span>
          <ArrowRight size={21} strokeWidth={1.6} className="mt-card__arrow" />
        </Link>

        {/* Deux compteurs */}
        <div className="mt-grid-2 mt-span">
          <Link to="/supervisor/shift-reports" className="mt-card mt-stat">
            <div className="mt-stat__top"><CalendarDays size={21} strokeWidth={1.7} /><ArrowRight size={21} strokeWidth={1.6} className="mt-card__arrow" /></div>
            <span className="mt-stat__value">{todayReports.length}</span>
            <span className="mt-stat__label">{t('sup.reports_today')}</span>
          </Link>
          <Link to="/supervisor/alerts" className="mt-card mt-stat">
            <div className="mt-stat__top"><Clock3 size={21} strokeWidth={1.7} /><ArrowRight size={21} strokeWidth={1.6} className="mt-card__arrow" /></div>
            <span className="mt-stat__value">{alertCount}</span>
            <span className="mt-stat__label">{t('sup.alerts_todo')}</span>
          </Link>
        </div>

        {/* Derniers rapports de shift */}
        <div className="mt-section-head mt-span">
          <h3>{t('sup.recent_reports')}</h3>
          <Link to="/supervisor/shift-reports" aria-label={t('sup.all_reports')}><ArrowRight size={21} strokeWidth={1.6} /></Link>
        </div>
        <div className="mt-span">
          {recent.length === 0 ? (
            <Link to="/supervisor/shift-reports" className="mt-card mt-card--row">
              <div className="mt-list__icon" style={{ background: '#FFF1E6', color: 'var(--color-ore-dark)' }}><ClipboardPlus size={18} /></div>
              <div style={{ flex: 1 }}>
                <p className="mt-card__title" style={{ margin: 0 }}>{t('sup.no_reports')}</p>
                <p className="mt-card__eyebrow" style={{ fontSize: '0.85rem' }}>
                  {t('sup.no_reports_hint', { count: shiftReports.length })}
                </p>
              </div>
              <ArrowRight size={21} strokeWidth={1.6} className="mt-card__arrow" />
            </Link>
          ) : (
            <div className="mt-rail">
              {recent.map((r, i) => {
                const dup = recent.findIndex((o) => o.report_date === r.report_date && o.shift === r.shift && o.report_type === r.report_type && o.site_id === r.site_id) !== i;
                return (
                  <Link key={r.id} to="/supervisor/shift-reports" className="mt-card">
                    <div className="mt-event__head">
                      <span className="mt-event__day">{shortDay(r.report_date)}</span>
                      <span className="mt-event__time">
                        {dup && <span className="mt-pill mt-pill--soft-red">{t('sup.duplicate')}</span>}
                        {r.shift === 'night' ? t('sup.night') : t('sup.day')} · {SHIFT_HOURS[r.shift] || '—'}
                      </span>
                    </div>
                    <div className="mt-event__body">
                      <div style={{ minWidth: 0 }}>
                        <p className="mt-event__title">{reportLabel(r.report_type)}</p>
                        <span className="mt-event__meta"><MapIcon size={15} strokeWidth={1.6} />{r.site_name || t('sup.site')}</span>
                      </div>
                      {r.created_by && (
                        <span title={r.created_by} style={{ width: 30, height: 30, borderRadius: '50%', background: '#FFF1E6', color: 'var(--color-ore-dark)', display: 'grid', placeItems: 'center', fontSize: '0.8rem', fontWeight: 600, flexShrink: 0 }}>
                          {String(r.created_by).slice(0, 1).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Indicateurs */}
        <div className="mt-section-head mt-span"><h3>{t('sup.indicators')}</h3></div>
        <div className="mt-grid-2 mt-span" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
          {[
            { label: t('sup.active_pegs'), value: pegActifs, icon: <MapPin size={20} strokeWidth={1.7} /> },
            { label: t('sup.avg_progress'), value: `${avgProgress}%`, icon: <TrendingUp size={20} strokeWidth={1.7} /> },
            { label: t('sup.tonnage'), value: `${total} t`, icon: <Truck size={20} strokeWidth={1.7} /> },
            { label: t('sup.hse_incidents'), value: incidents, icon: <ShieldAlert size={20} strokeWidth={1.7} />, alert: incidents > 0 },
            { label: t('sup.broken_equipment'), value: equipment, icon: <Wrench size={20} strokeWidth={1.7} />, alert: equipment > 0 },
            { label: t('sup.best_team'), value: teams[0] ? `${teams[0].avg_progress}%` : '—', icon: <Activity size={20} strokeWidth={1.7} /> },
          ].map((k) => (
            <div key={k.label} className="mt-card mt-stat" style={{ minHeight: 112 }}>
              <div className="mt-stat__top" style={{ color: k.alert ? 'var(--color-ruby)' : 'var(--color-white)' }}>{k.icon}</div>
              <span className="mt-stat__value" style={{ color: k.alert ? 'var(--color-ruby)' : undefined }}>{k.value}</span>
              <span className="mt-stat__label">{k.label}</span>
            </div>
          ))}
        </div>

        {/* Activite detaillee */}
        <div className="mt-section-head mt-span"><h3>{t('sup.activity')}</h3></div>

        <Panel title={t('sup.prod_per_day')} icon={<Truck size={18} strokeWidth={1.7} />}>
          {prodDays.length === 0 ? <p className="mt-empty">{t('sup.no_prod')}</p>
            : <MiniBars rows={prodDays} valueKey="tonnage" unit=" t" color="var(--color-ore)" />}
        </Panel>

        <Panel title={t('sup.inc_per_day')} icon={<ShieldAlert size={18} strokeWidth={1.7} />}>
          {incidentDays.length === 0 ? <p className="mt-empty">{t('sup.no_inc')}</p>
            : <MiniBars rows={incidentDays} valueKey="count" unit="" color={(r) => (r.count >= 3 ? 'var(--color-ruby)' : r.count >= 2 ? 'var(--color-gold)' : 'var(--color-emerald)')} />}
        </Panel>

        <Panel title={t('sup.peg_progress')} icon={<MapPin size={18} strokeWidth={1.7} />}>
          {pegProgress.length === 0 ? <p className="mt-empty">{t('sup.no_peg')}</p> : (
            <div className="mt-list">
              {pegProgress.slice(0, 5).map((p) => {
                const tone = p.progress >= 100 ? ['mt-pill--soft-green', t('sup.done')] : p.progress >= 60 ? ['mt-pill--soft-gray', t('sup.ongoing')] : p.progress >= 30 ? ['mt-pill--soft-gray', t('sup.slow')] : ['mt-pill--soft-red', t('sup.late')];
                return (
                  <div key={p.peg_id} className="mt-list__item">
                    <div className="mt-list__main">
                      <strong>{p.peg_id}</strong>
                      <div className="mt-bar" style={{ marginTop: 6 }}><i style={{ width: `${Math.min(100, p.progress)}%` }} /></div>
                    </div>
                    <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--color-chalk)', fontSize: '0.88rem', width: 44, textAlign: 'right' }}>{p.progress}%</span>
                    <span className={`mt-pill ${tone[0]}`}>{tone[1]}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        <Panel title={t('sup.pto_per_day')} icon={<CalendarDays size={18} strokeWidth={1.7} />}>
          {ptoDays.length === 0 ? <p className="mt-empty">{t('sup.no_pto')}</p>
            : <MiniBars rows={ptoDays} valueKey="days" unit=" j" color="var(--color-gold)" />}
        </Panel>

        <Panel title={t('sup.team_perf')} icon={<Activity size={18} strokeWidth={1.7} />}>
          {teams.length === 0 ? <p className="mt-empty">{t('sup.no_team')}</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {teams.map((s) => (
                <div key={s.team}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--color-chalk)' }}>{s.team}</span>
                    <span style={{ color: 'var(--color-ore-dark)', fontVariantNumeric: 'tabular-nums' }}>{s.avg_progress}%</span>
                  </div>
                  <div className="mt-bar"><i style={{ width: `${Math.min(100, s.avg_progress)}%` }} /></div>
                </div>
              ))}
            </div>
          )}
          <p className="mt-empty" style={{ marginTop: '0.9rem', fontSize: '0.85rem' }}>{t('sup.team_footer', { people: personnel, broken: equipment })}</p>
        </Panel>

        <Panel title={t('sup.face_exams')} icon={<Eye size={18} strokeWidth={1.7} />}>
          {faceExams.length === 0 ? <p className="mt-empty">{t('sup.no_face')}</p> : (
            <div className="mt-list">
              {faceExams.map((f) => (
                <div key={f.id ?? f._id} className="mt-list__item">
                  <div className="mt-list__main"><strong>{f.peg_id}</strong><span>{shortDay(f.date)}</span></div>
                  <span className={`mt-pill ${f.ground_condition === 'safe' ? 'mt-pill--soft-green' : 'mt-pill--soft-red'}`}>{f.ground_condition === 'safe' ? t('sup.safe') : t('sup.danger')}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title={t('sup.last_alerts')} icon={<Bell size={18} strokeWidth={1.7} />}>
          {alertItems.length === 0 ? <p className="mt-empty">{t('sup.no_alerts')}</p> : (
            <div className="mt-list">
              {alertItems.map((a) => (
                <Link key={a.id} to="/supervisor/alerts" className="mt-list__item" style={{ textDecoration: 'none' }}>
                  <div className="mt-list__icon" style={{ background: '#FDE8E8', color: 'var(--color-ruby)' }}>
                    {a.kind === 'panne' ? <Wrench size={17} /> : <ShieldAlert size={17} />}
                  </div>
                  <div className="mt-list__main"><strong>{a.title}</strong><span>{a.meta || '—'}</span></div>
                  <ArrowRight size={18} strokeWidth={1.6} className="mt-card__arrow" />
                </Link>
              ))}
            </div>
          )}
        </Panel>

        <Panel title={t('sup.geo_reports')} icon={<FileText size={18} strokeWidth={1.7} />}>
          {geoReports.length === 0 ? <p className="mt-empty">{t('sup.no_geo')}</p> : (
            <div className="mt-list">
              {geoReports.map((r) => (
                <div key={r.id ?? r._id} className="mt-list__item" style={{ alignItems: 'flex-start' }}>
                  <div className="mt-list__main">
                    <strong>PEG {r.peg_id} · Shift {r.shift}</strong>
                    <span>{shortDay(r.date)} — {r.submitted_by || '—'}</span>
                    {r.production_summary && <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem', color: 'var(--color-chalk)' }}>{r.production_summary}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
