import { FlaskConical } from 'lucide-react';
import ModulePage from '../components/ModulePage';
import { geologyAPI } from '../api';

const columns = [
  { key: 'sample_id', label: 'ID Échantillon' },
  { key: 'peg_id', label: 'Peg' },
  { key: 'depth_from', label: 'De (m)', render: (v) => v != null ? `${v} m` : '—' },
  { key: 'depth_to', label: 'À (m)', render: (v) => v != null ? `${v} m` : '—' },
  { key: 'rock_type', label: 'Type de Roche' },
  {
    key: 'grade_au_gt', label: 'Teneur Au (g/t)',
    render: (v) => {
      if (v == null) return '—';
      const color = v >= 3 ? 'var(--color-gold)' : v >= 1 ? 'var(--color-ore)' : 'var(--color-ash)';
      return <span style={{ color, fontWeight: 700 }}>{v} g/t</span>;
    }
  },
  {
    key: 'grade_cu_pct', label: 'Teneur Cu (%)',
    render: (v) => {
      if (v == null) return '—';
      const color = v >= 2.5 ? 'var(--color-emerald)' : 'var(--color-ash)';
      return <span style={{ color, fontWeight: 700 }}>{v}%</span>;
    }
  },
  {
    key: 'grade_co_pct', label: 'Teneur Co (%)',
    render: (v) => {
      if (v == null) return '—';
      const color = v >= 0.5 ? 'var(--color-sapphire)' : 'var(--color-ash)';
      return <span style={{ color, fontWeight: 700 }}>{v}%</span>;
    }
  },
  {
    key: 'grade_coltan_gt', label: 'Teneur Coltan (g/t)',
    render: (v) => {
      if (v == null) return '—';
      return <span style={{ color: 'var(--color-ore)', fontWeight: 700 }}>{v} g/t</span>;
    }
  },
  { key: 'date', label: 'Date' },
  { key: 'geologist', label: 'Géologue' },
];

const formFields = [
  { key: 'sample_id', label: 'ID Échantillon', required: true, placeholder: 'GEO-0001' },
  { key: 'peg_id', label: 'ID Peg' },
  { key: 'depth_from', label: 'Profondeur de (m)', type: 'number', required: true, step: 0.1, min: 0 },
  { key: 'depth_to', label: 'Profondeur à (m)', type: 'number', required: true, step: 0.1, min: 0 },
  {
    key: 'rock_type', label: 'Type de Roche', required: true,
    placeholder: 'Granodiorite, Schiste, Quartzite…'
  },
  { key: 'grade_au_gt', label: 'Teneur en Or (g/t)', type: 'number', step: 0.01, min: 0, placeholder: '0.00' },
  { key: 'grade_cu_pct', label: 'Teneur en Cuivre (%)', type: 'number', step: 0.01, min: 0, placeholder: '0.00' },
  { key: 'grade_co_pct', label: 'Teneur en Cobalt (%)', type: 'number', step: 0.01, min: 0, placeholder: '0.00' },
  { key: 'grade_coltan_gt', label: 'Teneur en Coltan (g/t)', type: 'number', step: 0.01, min: 0, placeholder: '0.00' },
  { key: 'date', label: 'Date d\'analyse', type: 'date' },
  { key: 'geologist', label: 'Géologue responsable' },
  { key: 'notes', label: 'Notes', type: 'textarea' },
];

const defaultForm = {
  sample_id: '', peg_id: '', depth_from: 0, depth_to: 5,
  rock_type: '', grade_au_gt: null, grade_cu_pct: null,
  grade_co_pct: null, grade_coltan_gt: null,
  date: '', geologist: '', notes: ''
};

export default function GeologyPage() {
  return (
    <ModulePage
      title="Géologie"
      description="Analyses géologiques, carottes de sondage et teneurs en minerais"
      icon={<FlaskConical size={22} />}
      api={geologyAPI}
      columns={columns}
      formFields={formFields}
      defaultForm={defaultForm}
      accentColor="var(--color-emerald)"
    />
  );
}
