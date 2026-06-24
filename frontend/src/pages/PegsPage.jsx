import { MapPin } from 'lucide-react';
import ModulePage from '../components/ModulePage';
import { pegsAPI } from '../api';
import { statusBadge, STATUS_COLORS } from '../utils/badges';

const columns = [
  { key: 'peg_id', label: 'ID Peg' },
  { key: 'zone', label: 'Zone' },
  {
    key: 'status',
    label: 'Statut',
    render: (v) => statusBadge(v, STATUS_COLORS),
  },
  { key: 'date_installed', label: 'Date Installation' },
  {
    key: 'coordinates',
    label: 'Coordonnées',
    render: (v) => v ? `${v.lat?.toFixed(4)}, ${v.lng?.toFixed(4)}` : '—',
  },
  { key: 'notes', label: 'Notes' },
];

const formFields = [
  { key: 'peg_id', label: 'ID du Peg', required: true, placeholder: 'PEG-001' },
  { key: 'zone', label: 'Zone', required: true, placeholder: 'Zone A - Nord' },
  {
    key: 'status', label: 'Statut', type: 'select', required: true,
    options: ['active', 'completed', 'pending']
  },
  { key: 'date_installed', label: 'Date d\'installation', type: 'date' },
  { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Observations…' },
];

const defaultForm = { peg_id: '', zone: '', status: 'active', date_installed: '', notes: '' };

export default function PegsPage() {
  return (
    <ModulePage
      title="Pegs & Zones"
      description="Gestion des pegs d'implantation et des zones minières"
      icon={<MapPin size={22} />}
      api={pegsAPI}
      columns={columns}
      formFields={formFields}
      defaultForm={defaultForm}
      accentColor="var(--color-ore)"
    />
  );
}
