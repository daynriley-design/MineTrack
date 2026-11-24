import { useState, useEffect } from 'react';
import { dashboardAPI } from '../api';
import { useTranslation } from 'react-i18next';
import {
  Activity, Truck, ShieldAlert,
  TrendingUp, Package, Users
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';

const COLORS = ['#EE9B5F', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--color-rock-2)',
        border: '1px solid var(--color-rock-3)',
        borderRadius: 'var(--radius-md)',
        padding: '0.75rem 1rem',
        fontSize: '0.8rem'
      }}>
        <p style={{ color: 'var(--color-ash)', marginBottom: '0.25rem' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontWeight: 600 }}>
            {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString('fr-FR') : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([dashboardAPI.stats(), dashboardAPI.charts()])
      .then(([s, c]) => {
        setStats(s.data);
        setCharts(c.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="text-muted">Chargement du tableau de bord…</p>
      </div>
    );
  }

  const kpis = [
    {
      key: 'pegs.active', label: t('kpi.pegs_active'), icon: Activity,
      color: 'var(--color-emerald)', bg: 'rgba(16,185,129,0.12)',
      suffix: ` / ${stats?.pegs?.total || 0}`
    },
    {
      key: 'production.today_tonnage', label: t('kpi.tonnage'), icon: Package,
      color: 'var(--color-ore)', bg: 'rgba(238, 155, 95,0.12)',
      format: (v) => v?.toLocaleString('fr-FR')
    },
    {
      key: 'safety.open_incidents', label: t('kpi.hse_incidents'), icon: ShieldAlert,
      color: 'var(--color-ruby)', bg: 'rgba(239,68,68,0.12)'
    },
    {
      key: 'labor.ratio_national', label: t('kpi.arsp_ratio'), icon: Users,
      color: 'var(--color-gold)', bg: 'rgba(245,158,11,0.12)',
      format: (v) => `${v}%`
    }
  ];

  function getNestedValue(obj, path) {
    return path.split('.').reduce((acc, key) => acc?.[key], obj);
  }

  const productionData = (charts?.production_trend || []).slice().reverse().map(p => ({
    date: p.date?.slice(5) || '',
    tonnage: Math.round(p.tonnage || 0)
  }));

  const hseData = Object.entries(charts?.hse_by_type || {}).map(([name, value]) => ({ name, value }));
  const equipData = Object.entries(charts?.equipment_status || {}).map(([name, value]) => ({ name, value }));

  return (
    <div>
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-rock-2) 0%, rgba(238, 155, 95,0.1) 100%)',
        border: '1px solid rgba(238, 155, 95,0.2)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem 2rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-white)', marginBottom: '0.2rem' }}>
            {t('dashboard.welcome', { name: user?.name || 'Administrateur' })}
          </h2>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>
            {t('dashboard.subtitle')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{
            background: 'rgba(16,185,129,0.15)',
            color: 'var(--color-emerald)',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: '2rem',
            padding: '0.3rem 0.9rem',
            fontSize: '0.8rem',
            fontWeight: 600
          }}>● {t('dashboard.system_online')}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid mb-6">
        {kpis.map(kpi => {
          const raw = stats ? getNestedValue(stats, kpi.key) : 0;
          const displayVal = kpi.format ? kpi.format(raw) : raw;
          return (
            <div key={kpi.key} className="kpi-card" style={{ '--kpi-color': kpi.color }}>
              <div className="kpi-icon" style={{ background: kpi.bg }}>
                <kpi.icon size={22} style={{ color: kpi.color }} />
              </div>
              <div className="kpi-value" style={{ color: kpi.color }}>
                {displayVal ?? '—'}{kpi.suffix || ''}
              </div>
              <div className="kpi-label">{kpi.label}</div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="section-grid mb-6">
        {/* Production trend */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <TrendingUp size={18} style={{ color: 'var(--color-gold)' }} />
                {t('dashboard.prod_trend')}
              </h3>
              <p className="card-subtitle">{t('dashboard.prod_trend_sub')}</p>
            </div>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={productionData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-rock-3)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--color-stone)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--color-stone)', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="tonnage"
                  name="Tonnage (t)"
                  stroke="#EE9B5F"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: '#EE9B5F' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* HSE Pie */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <ShieldAlert size={18} style={{ color: 'var(--color-ruby)' }} />
              {t('dashboard.hse_incidents')}
            </h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={hseData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {hseData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  formatter={(v) => <span style={{ color: 'var(--color-ash)', fontSize: '0.75rem' }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Equipment Bar */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Truck size={18} style={{ color: 'var(--color-sapphire)' }} />
              {t('dashboard.equip_status')}
            </h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={equipData} layout="vertical" margin={{ left: 20, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-rock-3)" horizontal={false} />
                <XAxis type="number" tick={{ fill: 'var(--color-stone)', fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: 'var(--color-ash)', fontSize: 11 }} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Nombre" radius={4}>
                  {equipData.map((e, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="section-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{t('dashboard.summary_safety')}</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: t('dashboard.safety_open'), value: stats?.safety?.open_incidents, color: 'var(--color-ruby)' },
                { label: t('dashboard.safety_critical'), value: stats?.safety?.critical, color: 'var(--color-ruby)' },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center">
                  <span className="text-sm text-muted">{row.label}</span>
                  <span style={{ color: row.color, fontWeight: 700, fontSize: '1.1rem' }}>{row.value ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{t('dashboard.summary_pegs')}</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: t('dashboard.pegs_total'), value: stats?.pegs?.total, color: 'var(--color-chalk)' },
                { label: t('dashboard.pegs_active'), value: stats?.pegs?.active, color: 'var(--color-emerald)' },
                { label: t('dashboard.pegs_completed'), value: stats?.pegs?.completed, color: 'var(--color-ore)' },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center">
                  <span className="text-sm text-muted">{row.label}</span>
                  <span style={{ color: row.color, fontWeight: 700, fontSize: '1.1rem' }}>{row.value ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{t('dashboard.summary_arsp')}</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: t('dashboard.labor_total'), value: stats?.labor?.total, color: 'var(--color-chalk)' },
                { label: t('dashboard.labor_national'), value: stats?.labor?.national, color: 'var(--color-emerald)' },
                { label: t('dashboard.labor_expat'), value: stats?.labor?.expat, color: 'var(--color-ruby)' },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center">
                  <span className="text-sm text-muted">{row.label}</span>
                  <span style={{ color: row.color, fontWeight: 700, fontSize: '1.1rem' }}>{row.value ?? 0}</span>
                </div>
              ))}
              <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--color-rock-3)', paddingTop: '0.5rem' }}>
                <span className="text-sm text-muted">{t('kpi.arsp_ratio')}</span>
                <span style={{ color: 'var(--color-gold)', fontWeight: 700, fontSize: '1.1rem' }}>
                  {stats?.labor?.total ? Math.round((stats.labor.national / stats.labor.total) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
