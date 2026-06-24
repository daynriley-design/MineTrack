import { Zap } from 'lucide-react';
import ModulePage from '../components/ModulePage';
import { blastingAPI } from '../api';
import { statusBadge, STATUS_COLORS } from '../utils/badges';

const columns = [
  { key: 'peg_id', label: 'Peg' },
  { key: 'blast_id', label: 'ID Tir' },
  { key: 'explosives_kg', label: 'Explosifs (kg)', render: (v) => v ? `${v} kg` : '—' },
  { key: 'holes_count', label: 'Nbre Trous' },
  { key: 'date', label: 'Date' },
  { key: 'status', label: 'Statut', render: (v) => statusBadge(v, STATUS_COLORS) },
  { key: 'result', label: 'Résultat' },
];

const formFields = [
  { key: 'peg_id', label: 'ID Peg', required: true },
  { key: 'blast_id', label: 'ID Tir', required: true, placeholder: 'BLAST-001' },
  { key: 'explosives_kg', label: 'Explosifs (kg)', type: 'number', required: true, step: 0.1, min: 0 },
  { key: 'holes_count', label: 'Nombre de Trous', type: 'number', required: true, min: 0 },
  { key: 'date', label: 'Date du Tir', type: 'date' },
  { key: 'status', label: 'Statut', type: 'select', options: ['planned', 'completed'] },
  { key: 'result', label: 'Résultat' },
  { key: 'notes', label: 'Notes', type: 'textarea' },
];

const defaultForm = { peg_id: '', blast_id: '', explosives_kg: 0, holes_count: 0, date: '', status: 'planned', result: '', notes: '' };

export default function BlastingPage() {
  return (
    <ModulePage
      title="Abattage (Tir de Mine)"
      description="Planification et suivi des opérations d'abattage à l'explosif"
      icon={<Zap size={22} />}
      api={blastingAPI}
      columns={columns}
      formFields={formFields}
      defaultForm={defaultForm}
      accentColor="var(--color-ruby)"
    />
  );
}
