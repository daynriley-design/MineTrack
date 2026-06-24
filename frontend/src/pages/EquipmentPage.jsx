import { Truck } from 'lucide-react';
import ModulePage from '../components/ModulePage';
import { equipmentAPI } from '../api';
import { statusBadge, STATUS_COLORS } from '../utils/badges';

const columns = [
  { key: 'equipment_id', label: 'ID' },
  { key: 'name', label: 'Nom' },
  { key: 'type', label: 'Type' },
  { key: 'status', label: 'Statut', render: (v) => statusBadge(v, STATUS_COLORS) },
  { key: 'hours_used', label: 'Heures utilisées', render: (v) => v != null ? `${v} h` : '—' },
  { key: 'location', label: 'Zone' },
  { key: 'next_service_date', label: 'Prochain service' },
];

const formFields = [
  { key: 'equipment_id', label: 'ID Équipement', required: true, placeholder: 'EQ-001' },
  { key: 'name', label: 'Nom', required: true, placeholder: 'ex: Pelle CAT 390F' },
  {
    key: 'type', label: 'Type', type: 'select', required: true,
    options: [
      { value: 'excavator', label: 'Pelle / Excavatrice' },
      { value: 'truck', label: 'Camion' },
      { value: 'drill', label: 'Foreuse' },
      { value: 'crusher', label: 'Concasseur' },
      { value: 'loader', label: 'Chargeur' },
    ]
  },
  {
    key: 'status', label: 'Statut', type: 'select',
    options: [
      { value: 'operational', label: 'Opérationnel' },
      { value: 'maintenance', label: 'En maintenance' },
      { value: 'breakdown', label: 'En panne' },
      { value: 'standby', label: 'En attente' },
    ]
  },
  { key: 'hours_used', label: 'Heures utilisées', type: 'number', step: 0.1, min: 0 },
  { key: 'location', label: 'Zone / Emplacement' },
  { key: 'next_service_date', label: 'Prochain service', type: 'date' },
  { key: 'notes', label: 'Notes', type: 'textarea' },
];

const defaultForm = {
  equipment_id: '', name: '', type: 'excavator', status: 'operational',
  hours_used: 0, location: '', next_service_date: '', notes: ''
};

export default function EquipmentPage() {
  return (
    <ModulePage
      title="Gestion des Équipements"
      description="Suivi de la flotte d'engins miniers et leur état de fonctionnement"
      icon={<Truck size={22} />}
      api={equipmentAPI}
      columns={columns}
      formFields={formFields}
      defaultForm={defaultForm}
      accentColor="var(--color-sapphire)"
    />
  );
}
