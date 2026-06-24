import { Users } from 'lucide-react';
import ModulePage from '../components/ModulePage';
import { laborAPI } from '../api';
import { statusBadge, STATUS_COLORS } from '../utils/badges';

const columns = [
  { key: 'employee_id', label: 'ID Employé' },
  { key: 'name', label: 'Nom' },
  { key: 'role', label: 'Fonction' },
  { key: 'team', label: 'Équipe' },
  { key: 'origin_status', label: 'Origine', render: (v) => statusBadge(v, { national: 'var(--color-emerald)', expat: 'var(--color-ruby)' }) },
  { key: 'contract_type', label: 'Contrat', render: (v) => statusBadge(v, { direct: 'var(--color-sapphire)', contractor: 'var(--color-amethyst)' }) },
  { key: 'shift', label: 'Poste', render: (v) => statusBadge(v, STATUS_COLORS) },
  { key: 'hours_worked', label: 'Heures', render: (v) => v != null ? `${v} h` : '—' },
  { key: 'peg_id', label: 'Peg' },
];

const formFields = [
  { key: 'employee_id', label: 'ID Employé', required: true, placeholder: 'EMP-0001' },
  { key: 'name', label: 'Nom complet', required: true },
  {
    key: 'role', label: 'Fonction', type: 'select', required: true,
    options: [
      "Conducteur d'engin", 'Foreur', 'Technicien', 'Ingénieur',
      'Géologue', 'Agent de sécurité', 'Superviseur', 'Mécanicien'
    ]
  },
  { key: 'team', label: 'Équipe', required: true, placeholder: 'Équipe Alpha' },
  {
    key: 'shift', label: 'Poste', type: 'select',
    options: [
      { value: 'day', label: 'Jour' },
      { value: 'night', label: 'Nuit' },
    ]
  },
  {
    key: 'origin_status', label: 'Statut (ARSP)', type: 'select',
    options: [
      { value: 'national', label: 'National (Congolais)' },
      { value: 'expat', label: 'Expatrié' },
    ]
  },
  {
    key: 'contract_type', label: 'Type de contrat', type: 'select',
    options: [
      { value: 'direct', label: 'Employé Direct' },
      { value: 'contractor', label: 'Sous-traitant' },
    ]
  },
  { key: 'hours_worked', label: 'Heures travaillées', type: 'number', step: 0.5, min: 0, max: 24 },
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'peg_id', label: 'Peg assigné' },
  { key: 'notes', label: 'Notes', type: 'textarea' },
];

const defaultForm = {
  employee_id: '', name: '', role: '', team: '', shift: 'day',
  origin_status: 'national', contract_type: 'direct',
  hours_worked: 8, date: '', peg_id: '', notes: ''
};

export default function LaborPage() {
  return (
    <ModulePage
      title="Main-d'œuvre"
      description="Suivi du personnel, des équipes et des heures travaillées par shift"
      icon={<Users size={22} />}
      api={laborAPI}
      columns={columns}
      formFields={formFields}
      defaultForm={defaultForm}
      accentColor="var(--color-amethyst)"
    />
  );
}
