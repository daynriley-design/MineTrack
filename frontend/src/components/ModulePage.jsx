import { useState, useEffect } from 'react';
import { Plus, Trash2, RefreshCw, Search, X } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

/**
 * Generic module page for listing, creating, and deleting records.
 *
 * Props:
 *  - title: string
 *  - description: string
 *  - icon: ReactNode
 *  - api: { list, create, delete }
 *  - columns: [{ key, label, render? }]
 *  - formFields: [{ key, label, type, required, options?, placeholder? }]
 *  - defaultForm: object
 *  - accentColor?: string
 */
export default function ModulePage({
  title,
  description,
  icon,
  api,
  columns,
  formFields,
  defaultForm,
  accentColor = 'var(--color-ore)',
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.list();
      setItems(res.data);
    } catch {
      toast('Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // fetchItems();
    api.get(`/${apiPath}`).then(res => setItems(res.data)).catch(console.error);
  }, [api, apiPath]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.create(form);
      toast('Enregistrement créé avec succès', 'success');
      setShowModal(false);
      setForm(defaultForm);
      fetchItems();
    } catch (err) {
      toast(err.response?.data?.detail || 'Erreur lors de la création', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet enregistrement ?')) return;
    try {
      await api.delete(id);
      toast('Enregistrement supprimé', 'success');
      setItems((prev) => prev.filter((i) => i._id !== id));
    } catch {
      toast('Erreur lors de la suppression', 'error');
    }
  };

  const filtered = items.filter((item) => {
    if (!search) return true;
    return JSON.stringify(item).toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ color: accentColor }}>{icon}</span>
            {title}
          </h1>
          <p>{description}</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={fetchItems}>
            <RefreshCw size={15} /> Actualiser
          </button>
          <button className="btn btn-primary" onClick={() => { setForm(defaultForm); setShowModal(true); }}>
            <Plus size={15} /> Ajouter
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '1rem', position: 'relative', maxWidth: '360px' }}>
        <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-stone)' }} />
        <input
          className="form-input"
          style={{ paddingLeft: '2.25rem' }}
          placeholder="Rechercher…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            className="btn btn-ghost btn-icon btn-sm"
            style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', padding: '0.2rem' }}
            onClick={() => setSearch('')}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📂</div>
              <h3>Aucun enregistrement</h3>
              <p>Cliquez sur "Ajouter" pour créer le premier enregistrement.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col.key}>{col.label}</th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item._id}>
                    {columns.map((col) => (
                      <td key={col.key}>
                        {col.render ? col.render(item[col.key], item) : (item[col.key] ?? '—')}
                      </td>
                    ))}
                    <td>
                      <button
                        className="btn btn-danger btn-sm btn-icon"
                        onClick={() => handleDelete(item._id)}
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {!loading && filtered.length > 0 && (
          <div style={{ padding: '0.6rem 1rem', borderTop: '1px solid var(--color-rock-3)', fontSize: '0.75rem', color: 'var(--color-stone)' }}>
            {filtered.length} enregistrement{filtered.length > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>Nouvel enregistrement</h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  {formFields.map((field) => (
                    <div key={field.key} className="form-group">
                      <label className="form-label">
                        {field.label} {field.required && <span style={{ color: 'var(--color-ruby)' }}>*</span>}
                      </label>
                      {field.type === 'select' ? (
                        <select
                          className="form-select"
                          value={form[field.key] ?? ''}
                          onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                          required={field.required}
                        >
                          <option value="">Sélectionner…</option>
                          {field.options?.map((opt) => (
                            <option key={opt.value ?? opt} value={opt.value ?? opt}>
                              {opt.label ?? opt}
                            </option>
                          ))}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          className="form-textarea"
                          placeholder={field.placeholder}
                          value={form[field.key] ?? ''}
                          onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                          required={field.required}
                        />
                      ) : (
                        <input
                          type={field.type || 'text'}
                          className="form-input"
                          placeholder={field.placeholder}
                          value={form[field.key] ?? ''}
                          onChange={(e) => {
                            const val = field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
                            setForm({ ...form, [field.key]: val });
                          }}
                          required={field.required}
                          min={field.min}
                          max={field.max}
                          step={field.step}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <><div className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></div> Enregistrement…</> : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
