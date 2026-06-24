import { DollarSign } from 'lucide-react';
import ModulePage from '../components/ModulePage';
import { financialAPI } from '../api';

const CATEGORY_COLORS = {
  fuel: 'var(--color-ore)',
  maintenance: 'var(--color-gold)',
  labor: 'var(--color-amethyst)',
  explosives: 'var(--color-ruby)',
  equipment: 'var(--color-sapphire)',
  redevance: 'var(--color-emerald)',
  other: 'var(--color-stone)',
};

const CATEGORY_LABELS = {
  fuel: 'Carburant', maintenance: 'Maintenance', labor: 'Main-d\'œuvre',
  explosives: 'Explosifs', equipment: 'Équipements', redevance: 'Redevance Minière', other: 'Autre'
};

const columns = [
  { key: 'record_id', label: 'ID' },
  { key: 'date', label: 'Date' },
  {
    key: 'category', label: 'Catégorie',
    render: (v) => (
      <span style={{
        color: CATEGORY_COLORS[v] || 'var(--color-ash)',
        fontWeight: 600, fontSize: '0.8rem'
      }}>
        {CATEGORY_LABELS[v] || v}
      </span>
    )
  },
  { key: 'description', label: 'Description' },
  {
    key: 'amount', label: 'Montant Original',
    render: (v, row) => (
      <span style={{ fontWeight: 600 }}>
        {v?.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {row.currency}
      </span>
    )
  },
  {
    key: 'amount_usd', label: 'Montant (USD)',
    render: (v) => (
      <span style={{ color: 'var(--color-emerald)', fontWeight: 700 }}>
        ${v?.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
      </span>
    )
  },
  { key: 'peg_id', label: 'Peg' },
  { key: 'approved_by', label: 'Approuvé par' },
];

const formFields = [
  { key: 'record_id', label: 'ID Enregistrement', required: true, placeholder: 'FIN-0001' },
  { key: 'date', label: 'Date', type: 'date', required: true },
  {
    key: 'category', label: 'Catégorie', type: 'select', required: true,
    options: [
      { value: 'fuel', label: 'Carburant' },
      { value: 'maintenance', label: 'Maintenance' },
      { value: 'labor', label: 'Main-d\'œuvre' },
      { value: 'explosives', label: 'Explosifs' },
      { value: 'equipment', label: 'Équipements' },
      { value: 'redevance', label: 'Redevance Minière' },
      { value: 'other', label: 'Autre' },
    ]
  },
  {
    key: 'currency', label: 'Devise', type: 'select', required: true,
    options: [
      { value: 'USD', label: 'USD ($)' },
      { value: 'CDF', label: 'CDF (Franc Congolais)' },
    ]
  },
  { key: 'description', label: 'Description', required: true, placeholder: 'Description de la dépense…' },
  { key: 'amount', label: 'Montant', type: 'number', required: true, step: 0.01, min: 0 },
  { key: 'amount_usd', label: 'Montant Converti (USD)', type: 'number', step: 0.01, min: 0, placeholder: 'Laissez vide si USD' },
  { key: 'peg_id', label: 'Peg lié' },
  { key: 'approved_by', label: 'Approuvé par' },
  { key: 'notes', label: 'Notes', type: 'textarea' },
];

const defaultForm = {
  record_id: '', date: '', category: 'fuel', currency: 'USD', description: '',
  amount: 0, amount_usd: null, peg_id: '', approved_by: '', notes: ''
};

export default function FinancialPage() {
  return (
    <ModulePage
      title="Suivi Financier"
      description="Enregistrement et analyse des dépenses opérationnelles minières"
      icon={<DollarSign size={22} />}
      api={financialAPI}
      columns={columns}
      formFields={formFields}
      defaultForm={defaultForm}
      accentColor="var(--color-emerald)"
    />
  );
}
