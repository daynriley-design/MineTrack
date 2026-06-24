import { Wrench } from 'lucide-react';
import ModulePage from '../components/ModulePage';
import { supportAPI } from '../api';
import { statusBadge, STATUS_COLORS } from '../utils/badges';

const columns = [
  { key: 'ticket_id', label: 'ID Ticket' },
  {
    key: 'category', label: 'Catégorie',
    render: (v) => {
      const labels = {
        mechanical: 'Mécanique', electrical: 'Électrique',
        logistics: 'Logistique', IT: 'Informatique', other: 'Autre'
      };
      return labels[v] || v;
    }
  },
  { key: 'priority', label: 'Priorité', render: (v) => statusBadge(v, STATUS_COLORS) },
  { key: 'description', label: 'Description' },
  { key: 'requested_by', label: 'Demandé par' },
  { key: 'assigned_to', label: 'Assigné à' },
  { key: 'status', label: 'Statut', render: (v) => statusBadge(v, STATUS_COLORS) },
  { key: 'date_created', label: 'Date création' },
];

const formFields = [
  { key: 'ticket_id', label: 'ID Ticket', required: true, placeholder: 'TKT-0001' },
  {
    key: 'category', label: 'Catégorie', type: 'select', required: true,
    options: [
      { value: 'mechanical', label: 'Mécanique' },
      { value: 'electrical', label: 'Électrique' },
      { value: 'logistics', label: 'Logistique' },
      { value: 'IT', label: 'Informatique' },
      { value: 'other', label: 'Autre' },
    ]
  },
  {
    key: 'priority', label: 'Priorité', type: 'select',
    options: [
      { value: 'low', label: 'Faible' },
      { value: 'medium', label: 'Moyen' },
      { value: 'high', label: 'Élevé' },
      { value: 'urgent', label: 'Urgent' },
    ]
  },
  { key: 'description', label: 'Description', type: 'textarea', required: true },
  { key: 'requested_by', label: 'Demandé par', required: true },
  { key: 'assigned_to', label: 'Assigné à' },
  {
    key: 'status', label: 'Statut', type: 'select',
    options: [
      { value: 'open', label: 'Ouvert' },
      { value: 'in_progress', label: 'En cours' },
      { value: 'resolved', label: 'Résolu' },
    ]
  },
  { key: 'date_created', label: 'Date de création', type: 'date' },
];

const defaultForm = {
  ticket_id: '', category: 'mechanical', priority: 'medium',
  description: '', requested_by: '', assigned_to: '', status: 'open', date_created: ''
};

export default function SupportPage() {
  return (
    <ModulePage
      title="Support Technique"
      description="Tickets de support, demandes d'intervention et suivi de résolution"
      icon={<Wrench size={22} />}
      api={supportAPI}
      columns={columns}
      formFields={formFields}
      defaultForm={defaultForm}
      accentColor="var(--color-cyan)"
    />
  );
}
