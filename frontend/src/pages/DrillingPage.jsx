import { Drill } from 'lucide-react';
import ModulePage from '../components/ModulePage';
import { drillingAPI } from '../api';
import { statusBadge, STATUS_COLORS } from '../utils/badges';

const columns = [
  { key: 'peg_id', label: 'Peg' },
  { key: 'hole_id', label: 'ID Trou' },
  { key: 'depth_m', label: 'Profondeur (m)', render: (v) => v ? `${v} m` : '—' },
  { key: 'diameter_mm', label: 'Diamètre (mm)', render: (v) => v ? `${v} mm` : '—' },
  { key: 'rock_type', label: 'Type de Roche' },
  { key: 'status', label: 'Statut', render: (v) => statusBadge(v, STATUS_COLORS) },
  { key: 'date', label: 'Date' },
  { key: 'operator', label: 'Opérateur' },
];

const formFields = [
  { key: 'peg_id', label: 'ID Peg', required: true },
  { key: 'hole_id', label: 'ID Trou', required: true, placeholder: 'DH-0001' },
  { key: 'depth_m', label: 'Profondeur (m)', type: 'number', required: true, step: 0.1, min: 0 },
  { key: 'diameter_mm', label: 'Diamètre (mm)', type: 'number', required: true, min: 0 },
  { key: 'rock_type', label: 'Type de Roche', placeholder: 'Granite, Basalte…' },
  { key: 'status', label: 'Statut', type: 'select', options: ['planned', 'in_progress', 'completed'] },
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'operator', label: 'Opérateur' },
  { key: 'notes', label: 'Notes', type: 'textarea' },
];

const defaultForm = { peg_id: '', hole_id: '', depth_m: 0, diameter_mm: 89, rock_type: '', status: 'planned', date: '', operator: '', notes: '' };

export default function DrillingPage() {
  return (
    <ModulePage
      title="Forage"
      description="Suivi des opérations de forage et des trous de sondage"
      icon={<Drill size={22} />}
      api={drillingAPI}
      columns={columns}
      formFields={formFields}
      defaultForm={defaultForm}
      accentColor="var(--color-sapphire)"
    />
  );
}
