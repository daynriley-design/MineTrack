import { ShieldAlert } from 'lucide-react';
import ModulePage from '../components/ModulePage';
import { hseAPI } from '../api';
import { statusBadge, STATUS_COLORS } from '../utils/badges';

const columns = [
  { key: 'incident_id', label: 'ID Incident' },
  {
    key: 'type', label: 'Type',
    render: (v) => {
      const labels = {
        near_miss: 'Presque-accident',
        accident: 'Accident',
        violation: 'Violation',
        observation: 'Observation',
      };
      return labels[v] || v;
    }
  },
  { key: 'severity', label: 'Sévérité', render: (v) => statusBadge(v, STATUS_COLORS) },
  { key: 'location', label: 'Localisation' },
  { key: 'date', label: 'Date' },
  { key: 'reported_by', label: 'Rapporté par' },
  { key: 'status', label: 'Statut', render: (v) => statusBadge(v, STATUS_COLORS) },
];

const formFields = [
  { key: 'incident_id', label: 'ID Incident', required: true, placeholder: 'HSE-0001' },
  {
    key: 'type', label: 'Type d\'incident', type: 'select', required: true,
    options: [
      { value: 'near_miss', label: 'Presque-accident (Near Miss)' },
      { value: 'accident', label: 'Accident' },
      { value: 'violation', label: 'Violation règles sécurité' },
      { value: 'environmental', label: 'Environnement (DPEM)' },
      { value: 'observation', label: 'Observation' },
    ]
  },
  {
    key: 'severity', label: 'Sévérité', type: 'select', required: true,
    options: [
      { value: 'low', label: 'Faible' },
      { value: 'medium', label: 'Moyen' },
      { value: 'high', label: 'Élevé' },
      { value: 'critical', label: 'Critique' },
    ]
  },
  { key: 'description', label: 'Description', type: 'textarea', required: true, placeholder: 'Décrivez l\'incident en détail…' },
  { key: 'location', label: 'Lieu', required: true, placeholder: 'Zone A - Niveau 2' },
  { key: 'date', label: 'Date de l\'incident', type: 'date', required: true },
  { key: 'reported_by', label: 'Rapporté par' },
  {
    key: 'status', label: 'Statut', type: 'select',
    options: [
      { value: 'open', label: 'Ouvert' },
      { value: 'investigating', label: 'En investigation' },
      { value: 'closed', label: 'Clôturé' },
    ]
  },
  { key: 'corrective_action', label: 'Action corrective', type: 'textarea', placeholder: 'Mesures prises…' },
];

const defaultForm = {
  incident_id: '', type: 'near_miss', severity: 'low', description: '',
  location: '', date: '', reported_by: '', status: 'open', corrective_action: ''
};

export default function HSEPage() {
  return (
    <ModulePage
      title="HSE / Sécurité"
      description="Gestion des incidents de sécurité, santé et environnement"
      icon={<ShieldAlert size={22} />}
      api={hseAPI}
      columns={columns}
      formFields={formFields}
      defaultForm={defaultForm}
      accentColor="var(--color-ruby)"
    />
  );
}
