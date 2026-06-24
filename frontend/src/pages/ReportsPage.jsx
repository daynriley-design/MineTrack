import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileBarChart2, BarChart2, ShieldAlert, DollarSign, Factory, Download, Loader2 } from 'lucide-react';
import { reportsAPI } from '../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const COLORS = ['#F97316', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4'];

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
          <p key={i} style={{ color: p.fill || p.color, fontWeight: 600 }}>
            {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString('fr-FR') : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function getAnalysisText(type, summary, t) {
  if (!summary) return "";
  
  if (type === 'production') {
    const total = summary.production_summary?.total_tonnage || 0;
    const isGood = total > 50000;
    const formattedTotal = total.toLocaleString('fr-FR');
    return isGood 
      ? t('reports.analysis_prod_good', { total: formattedTotal }) 
      : t('reports.analysis_prod_stable', { total: formattedTotal });
  }
  if (type === 'hse') {
    const incidents = summary.safety_summary?.total_incidents || 0;
    const critical = summary.safety_summary?.by_severity?.Critical || 0;
    return critical === 0 
      ? t('reports.analysis_hse_safe', { incidents }) 
      : t('reports.analysis_hse_danger', { incidents });
  }
  if (type === 'finance') {
    const expenses = summary.financial_summary?.total_expenditure || 0;
    return t('reports.analysis_finance', { expenses: expenses.toLocaleString('fr-FR') });
  }
  if (type === 'pegs') {
    const active = summary.pegs_summary?.active || 0;
    const total = summary.pegs_summary?.total || 0;
    const completed = summary.pegs_summary?.completed || 0;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return t('reports.analysis_pegs', { completionRate, active });
  }
}

function AnalysisBlock({ text }) {
  return (
    <div style={{
      marginTop: '1.5rem',
      padding: '1rem',
      background: 'rgba(59, 130, 246, 0.05)',
      borderLeft: '4px solid var(--color-sapphire)',
      borderRadius: '0 var(--radius-md) var(--radius-md) 0',
      color: 'var(--color-chalk)',
      fontSize: '0.9rem',
      lineHeight: '1.6',
      fontStyle: 'italic'
    }}>
      <strong style={{ color: 'var(--color-sapphire)', display: 'block', marginBottom: '0.4rem', fontStyle: 'normal' }}>Interprétation des données :</strong>
      {text}
    </div>
  );
}

function SummarySection({ title, icon: Icon, color, data, analysis }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <Icon size={18} style={{ color }} />
          {title}
        </h3>
      </div>
      <div className="card-body">
        {data.map((row, i) => (
          <div key={i} className="flex justify-between items-center"
            style={{ padding: '0.4rem 0', borderBottom: i < data.length - 1 ? '1px solid var(--color-rock-3)' : 'none' }}>
            <span className="text-sm text-muted">{row.label}</span>
            <span style={{ fontWeight: 700, color: row.color || 'var(--color-white)' }}>{row.value}</span>
          </div>
        ))}
        {analysis && <AnalysisBlock text={analysis} />}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { t } = useTranslation();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    reportsAPI.summary()
      .then(res => setSummary(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const exportPDF = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById('report-content');
      const canvas = await html2canvas(element, { 
        scale: 2,
        useCORS: true,
        backgroundColor: '#0f1115' // match dark background
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Rapport_Minetrack_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Erreur lors de l\'export PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="text-muted">Génération du rapport…</p>
      </div>
    );
  }

  const pegsByStatus = Object.entries(summary?.pegs_summary?.by_status || {}).map(([name, value]) => ({ name, value }));
  const pegsByZone = Object.entries(summary?.pegs_summary?.by_zone || {}).map(([name, value]) => ({ name, value }));
  const finByCategory = Object.entries(summary?.financial_summary?.by_category || {}).map(([name, value]) => ({
    name: {
      fuel: 'Carburant', maintenance: 'Maintenance', labor: 'Main-d\'œuvre',
      explosives: 'Explosifs', equipment: 'Équipements', other: 'Autre'
    }[name] || name,
    value
  }));
  const hseBySeverity = Object.entries(summary?.safety_summary?.by_severity || {}).map(([name, value]) => ({ name, value }));

  return (
    <div id="report-content">
      <div className="page-header" data-html2canvas-ignore="true">
        <div className="page-header-left">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileBarChart2 size={22} style={{ color: 'var(--color-ore)' }} />
            {t('reports.title')}
          </h1>
          <p>{t('reports.subtitle')}</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={exportPDF}
          disabled={isExporting}
        >
          {isExporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
          {isExporting ? t('reports.generating') : t('reports.download_btn')}
        </button>
      </div>

      <div style={{ padding: '1rem', background: 'var(--color-rock)', borderRadius: 'var(--radius-lg)' }}>
        {/* Top Summary KPIs */}
        <div className="kpi-grid mb-6">
          {[
            {
              label: t('reports.total_pegs'), value: summary?.pegs_summary?.total ?? 0,
              color: 'var(--color-ore)', bg: 'rgba(249,115,22,0.12)'
            },
            {
              label: t('reports.total_tonnage'),
              value: `${(summary?.production_summary?.total_tonnage || 0).toLocaleString('fr-FR')} t`,
              color: 'var(--color-gold)', bg: 'rgba(245,158,11,0.12)'
            },
            {
              label: t('reports.total_volume'),
              value: `${(summary?.production_summary?.total_volume_m3 || 0).toLocaleString('fr-FR')} m³`,
              color: 'var(--color-sapphire)', bg: 'rgba(59,130,246,0.12)'
            },
            {
              label: t('kpi.hse_incidents'),
              value: summary?.safety_summary?.total_incidents ?? 0,
              color: 'var(--color-ruby)', bg: 'rgba(239,68,68,0.12)'
            },
            {
              label: t('reports.total_expenses'),
              value: `$${(summary?.financial_summary?.total_expenditure || 0).toLocaleString('fr-FR')}`,
              color: 'var(--color-emerald)', bg: 'rgba(16,185,129,0.12)'
            },
          ].map(kpi => (
            <div key={kpi.label} className="kpi-card" style={{ '--kpi-color': kpi.color }}>
              <div className="kpi-icon" style={{ background: kpi.bg }}>
                <BarChart2 size={22} style={{ color: kpi.color }} />
              </div>
              <div className="kpi-value" style={{ color: kpi.color, fontSize: '1.6rem' }}>{kpi.value}</div>
              <div className="kpi-label">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Charts row 1 */}
        <div className="section-grid mb-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">{t('reports.pegs_by_status')}</h3>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pegsByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {pegsByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
                {pegsByStatus.map((e, i) => (
                  <span key={e.name} style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length], display: 'inline-block' }}></span>
                    {e.name}: <strong style={{ color: 'var(--color-white)' }}>{e.value}</strong>
                  </span>
                ))}
              </div>
              <AnalysisBlock text={getAnalysisText('pegs', summary, t)} />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">{t('reports.pegs_by_zone')}</h3>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={pegsByZone} margin={{ left: 0, right: 5, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-rock-3)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--color-stone)', fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
                  <YAxis tick={{ fill: 'var(--color-stone)', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Pegs" radius={4}>
                    {pegsByZone.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <ShieldAlert size={16} style={{ color: 'var(--color-ruby)' }} />
                {t('reports.hse_by_severity')}
              </h3>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={hseBySeverity} cx="50%" cy="50%" outerRadius={80} paddingAngle={3} dataKey="value">
                    {hseBySeverity.map((_, i) => <Cell key={i} fill={['#3B82F6', '#F59E0B', '#F97316', '#EF4444'][i % 4]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
                {hseBySeverity.map((e, i) => (
                  <span key={e.name} style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: ['#3B82F6', '#F59E0B', '#F97316', '#EF4444'][i % 4], display: 'inline-block' }}></span>
                    {e.name}: <strong style={{ color: 'var(--color-white)' }}>{e.value}</strong>
                  </span>
                ))}
              </div>
              <AnalysisBlock text={getAnalysisText('hse', summary, t)} />
            </div>
          </div>
        </div>

        {/* Financial chart */}
        <div className="card mb-6">
          <div className="card-header">
            <h3 className="card-title">
              <DollarSign size={18} style={{ color: 'var(--color-emerald)' }} />
              {t('reports.fin_by_category')}
            </h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={finByCategory} margin={{ top: 5, right: 10, bottom: 5, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-rock-3)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--color-ash)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--color-stone)', fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Montant ($)" radius={6}>
                  {finByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <AnalysisBlock text={getAnalysisText('finance', summary, t)} />
          </div>
        </div>

        {/* Production summary */}
        <div className="section-grid">
          <SummarySection
            title={t('reports.summary_prod')}
            icon={Factory}
            color="var(--color-gold)"
            analysis={getAnalysisText('production', summary, t)}
            data={Object.entries(summary?.production_summary?.by_material || {}).map(([k, v]) => ({
              label: k, value: `${v.toLocaleString('fr-FR')} t`, color: 'var(--color-gold)'
            }))}
          />
          <SummarySection
            title={t('reports.summary_fin')}
            icon={DollarSign}
            color="var(--color-emerald)"
            data={Object.entries(summary?.financial_summary?.by_category || {}).map(([k, v]) => ({
              label: {
                fuel: 'Carburant', maintenance: 'Maintenance', labor: 'Main-d\'œuvre',
                explosives: 'Explosifs', equipment: 'Équipements', other: 'Autre'
              }[k] || k,
              value: `$${v.toLocaleString('fr-FR')}`,
              color: 'var(--color-emerald)'
            }))}
          />
          <SummarySection
            title={t('reports.summary_hse')}
            icon={ShieldAlert}
            color="var(--color-ruby)"
            data={[
              { label: t('dashboard.pegs_total'), value: summary?.safety_summary?.total_incidents ?? 0 },
              ...Object.entries(summary?.safety_summary?.by_type || {}).map(([k, v]) => ({
                label: k, value: v,
                color: k === 'accident' || k === 'critical' ? 'var(--color-ruby)' : 'var(--color-chalk)'
              }))
            ]}
          />

        </div>
      </div>
    </div>
  );
}
