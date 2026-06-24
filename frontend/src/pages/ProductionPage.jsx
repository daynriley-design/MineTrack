import { Factory } from 'lucide-react';
import ModulePage from '../components/ModulePage';
import { productionAPI } from '../api';
import { statusBadge, STATUS_COLORS } from '../utils/badges';

const columns = [
  { key: 'peg_id', label: 'Peg' },
  { key: 'date', label: 'Date' },
  { key: 'material_type', label: 'Matériau' },
  { key: 'volume_m3', label: 'Volume (m³)', render: (v) => v ? `${v.toLocaleString('fr-FR')} m³` : '—' },
  { key: 'tonnage', label: 'Tonnage', render: (v) => v ? `${v.toLocaleString('fr-FR')} t` : '—' },
  { key: 'shift', label: 'Poste', render: (v) => statusBadge(v, STATUS_COLORS) },
];

const formFields = [
  { key: 'peg_id', label: 'ID Peg', required: true },
  { key: 'date', label: 'Date', type: 'date', required: true },
  {
    key: 'material_type', label: 'Matériau', type: 'select', required: true,
    options: [
      'Minerai Cuivre', 'Minerai Cobalt', 'Coltan', 'Cassitérite', 'Or (Au)', 'Stérile'
    ]
  },
  { key: 'volume_m3', label: 'Volume (m³)', type: 'number', required: true, step: 0.1, min: 0 },
  { key: 'tonnage', label: 'Tonnage (t)', type: 'number', required: true, step: 0.1, min: 0 },
  { key: 'equipment_id', label: 'ID Équipement' },
  { key: 'shift', label: 'Poste', type: 'select', options: ['day', 'night'] },
  { key: 'notes', label: 'Notes', type: 'textarea' },
];

const defaultForm = { peg_id: '', date: '', material_type: '', volume_m3: 0, tonnage: 0, equipment_id: '', shift: 'day', notes: '' };

export default function ProductionPage() {
  return (
    <ModulePage
      title="Production"
      description="Suivi de la production minière journalière par zone"
      icon={<Factory size={22} />}
      api={productionAPI}
      columns={columns}
      formFields={formFields}
      defaultForm={defaultForm}
      accentColor="var(--color-gold)"
    />
  );
}
