/**
 * Returns CSS class for a badge based on a value mapping
 */
export function statusBadge(value, mapping) {
  const cls = mapping[value] || 'badge-gray';
  return <span className={`badge ${cls}`}>{value || '—'}</span>;
}

export const STATUS_COLORS = {
  // Generic
  active: 'badge-green',
  completed: 'badge-blue',
  pending: 'badge-yellow',
  inactive: 'badge-gray',

  // Work
  in_progress: 'badge-orange',
  planned: 'badge-yellow',
  blocked: 'badge-red',

  // Equipment
  operational: 'badge-green',
  maintenance: 'badge-yellow',
  breakdown: 'badge-red',
  standby: 'badge-gray',

  // HSE
  open: 'badge-red',
  investigating: 'badge-orange',
  closed: 'badge-green',
  resolved: 'badge-green',

  // Severity
  low: 'badge-blue',
  medium: 'badge-yellow',
  high: 'badge-orange',
  critical: 'badge-red',
  urgent: 'badge-red',

  // Other
  day: 'badge-yellow',
  night: 'badge-purple',
};
