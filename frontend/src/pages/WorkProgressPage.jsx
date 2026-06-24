import { Activity } from 'lucide-react';
import ModulePage from '../components/ModulePage';
import { workProgressAPI } from '../api';
import { statusBadge, STATUS_COLORS } from '../utils/badges';

const columns = [
  { key: 'peg_id', label: 'Peg' },
  { key: 'activity', label: 'Activité' },
  { key: 'team', label: 'Équipe' },
  {
    key: 'progress_percent',
    label: 'Avancement',
    render: (v) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '120px' }}>
        <div className="progress-bar" style={{ flex: 1 }}>
          <div className="progress-fill" style={{ width: `${v || 0}%` }}></div>
        </div>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-ore)' }}>{v || 0}%</span>
      </div>
    ),
  },
  { key: 'status', label: 'Statut', render: (v) => statusBadge(v, STATUS_COLORS) },
  { key: 'start_date', label: 'Début' },
];

const formFields = [
  { key: 'peg_id', label: 'ID Peg', required: true },
  { key: 'activity', label: 'Activité', required: true, placeholder: 'ex: Décapage, Extraction…' },
  { key: 'team', label: 'Équipe', required: true },
  { key: 'progress_percent', label: 'Avancement (%)', type: 'number', min: 0, max: 100, step: 1 },
  {
    key: 'status', label: 'Statut', type: 'select',
    options: ['planned', 'in_progress', 'completed', 'blocked']
  },
  { key: 'start_date', label: 'Date de début', type: 'date' },
  { key: 'notes', label: 'Notes', type: 'textarea' },
];

const defaultForm = { peg_id: '', activity: '', team: '', progress_percent: 0, status: 'in_progress', start_date: '', notes: '' };

export default function WorkProgressPage() {
  return (
    <ModulePage
      title="Avancement des Travaux"
      description="Suivi de l'avancement des activités par zone et équipe"
      icon={<Activity size={22} />}
      api={workProgressAPI}
      columns={columns}
      formFields={formFields}
      defaultForm={defaultForm}
      accentColor="var(--color-emerald)"
    />
  );
}
